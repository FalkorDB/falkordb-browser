"use client";

import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import type { FalkorDBCanvas, LayoutMode, ViewportState, NodeShape } from "@falkordb/canvas";
import { NODE_SIZE } from "@falkordb/canvas";
import { useToast } from "@/components/ui/use-toast";
import ForceGraph from "@/app/components/ForceGraph";
import {
    CANVAS_AUTO_ZOOM_DELAY,
    CanvasLayout,
    GraphData,
    Label,
    Link,
    Node,
    Relationship,
    SCHEMA_CAPTION_KEY,
    SchemaSnapshot,
    captureCanvasLayout,
    cn,
    convertToCanvasData,
    getActiveConnectionIdGlobal,
    getSchema,
    isAbortError,
} from "@/lib/utils";
import { normalizeDirection, normalizeLayout, type SchemaViewMeta } from "@/lib/useGraphTabs";
import {
    BrowserSettingsContext,
    ConnectionContext,
    ForceGraphContext,
    GraphContext,
    GraphInfoContext,
    GraphTabsContext,
    IndicatorContext,
} from "../components/provider";
import { Graph } from "../api/graph/model";
import Controls from "./controls";
import Labels from "./labels";
import Toolbar from "./toolbar";

/** Shown in place of the synthetic "" label FalkorDB reports for unlabeled nodes. */
const EMPTY_LABEL_DISPLAY_NAME = "Empty";

/** Fallback color for a label or type the graph info panel has not colored yet. */
const UNKNOWN_COLOR = "#A3A3A3";

/** A schema node stands for a label, so that is what captions it. */
const SCHEMA_CAPTIONS: [string, boolean][] = [[SCHEMA_CAPTION_KEY, true]];

/** Squares set the schema's label nodes apart from the graph's element nodes. */
const SCHEMA_NODE_SHAPE: NodeShape = "square";

/** A schema node carries a whole label name, so it gets twice the usual room. */
const SCHEMA_NODE_SIZE = NODE_SIZE * 2;

const EMPTY_SCHEMA: SchemaSnapshot = { edges: [], labelKeys: {}, relationshipKeys: {} };

/** A tab that has never shown its schema has nothing stored for it. */
const EMPTY_META: SchemaViewMeta = {};

/**
 * Identifies a schema element by what it stands for rather than by its id: ids
 * are handed out by this view and start over on a reload, but a label name and
 * a (source, type, target) triple mean the same thing in every session.
 */
const schemaElementKey = (graph: Graph, element: Node | Link) => {
    if (!("source" in element)) return `l:${element.labels[0] ?? ""}`;

    const source = graph.NodesMap.get(element.source)?.labels[0] ?? "";
    const target = graph.NodesMap.get(element.target)?.labels[0] ?? "";

    return `r:${source}|${element.relationship}|${target}`;
};

/** The element a stored key stands for, or nothing when the schema no longer has it. */
const findSchemaElement = (graph: Graph, key: string | undefined) => {
    if (!key) return undefined;

    return graph.getElements().find((element) => schemaElementKey(graph, element) === key);
};

/**
 * Everything needed to put the view back exactly as the user left it. Kept
 * outside React because switching tabs unmounts the whole view.
 */
type SchemaCache = {
    /** Connection + graph tab + graph the cache belongs to. */
    key: string;
    schema: SchemaSnapshot;
    /** Label ids have to survive a remount, see `labelIdsRef` below. */
    labelIds: [string, number][];
    nextLabelId: number;
    hiddenLabels: string[];
    hiddenRelationships: string[];
    graphData: CanvasLayout | undefined;
    /** Undefined until the canvas has been framed once; a zeroed one would blank the view. */
    viewport: ViewportState | undefined;
    layout: LayoutMode;
    direction: string;
    animation: boolean;
    pinned: boolean;
    dimmed: boolean;
    expand: boolean;
};

/**
 * One entry per graph tab, so each tab remembers its own schema. Bounded and
 * least-recently-used, since tab ids are never reused and a closed tab would
 * otherwise leave its entry behind forever.
 */
const cache = new Map<string, SchemaCache>();

const CACHE_LIMIT = 12;

const readCache = (key: string) => cache.get(key);

const writeCache = (key: string, entry: SchemaCache) => {
    // Re-inserting moves the entry to the end, making the first one the oldest.
    cache.delete(key);
    cache.set(key, entry);

    if (cache.size > CACHE_LIMIT) {
        const oldest = cache.keys().next();

        if (!oldest.done) cache.delete(oldest.value);
    }
};

/**
 * State that has to survive a tab switch. The cache is written as the value is
 * produced rather than on unmount, because React drops a state update from an
 * unmounting component.
 */
function usePersisted<K extends keyof SchemaCache>(
    field: K,
    initial: SchemaCache[K],
    persist: (patch: Partial<SchemaCache>) => void,
): [SchemaCache[K], Dispatch<SetStateAction<SchemaCache[K]>>] {
    type T = SchemaCache[K];

    const [value, setValue] = useState<T>(initial);
    const valueRef = useRef(value);
    valueRef.current = value;

    const set = useCallback<Dispatch<SetStateAction<T>>>((next) => {
        const resolved = typeof next === "function" ? (next as (prev: T) => T)(valueRef.current) : next;

        valueRef.current = resolved;
        persist({ [field]: resolved } as Partial<SchemaCache>);
        setValue(resolved);
    }, [field, persist]);

    return [value, set];
}

/** True when two discovery results describe the same schema. */
const isSameSchema = (a: SchemaSnapshot, b: SchemaSnapshot) => JSON.stringify(a) === JSON.stringify(b);

/**
 * A structural overview of the graph: one node per label, and one edge per
 * (source label, relationship type, target label) triple that actually occurs.
 *
 * It behaves like the graph view — same canvas, controls, search, legend and
 * details panel — except its elements stand for label and relationship *types*
 * rather than real elements. So the details panel lists the property keys of a
 * type and the value type they hold instead of values, and nothing is editable.
 */
type SchemaViewProps = {
    /** Where GraphView wants the controls rendered: in the tab bar, next to its own. */
    controlsSlot: HTMLElement | null;
    selectedElements: (Node | Link)[];
    setSelectedElements: Dispatch<SetStateAction<(Node | Link)[]>>;
};

export default function SchemaView({ controlsSlot, selectedElements, setSelectedElements }: SchemaViewProps) {
    const { graphName } = useContext(GraphContext);
    const { activeConnectionId } = useContext(ConnectionContext);
    const { activeTabId, tabs } = useContext(GraphTabsContext);

    // A different graph tab is a different schema view, and a different graph is
    // a different schema. Remounting is the simplest way to reset every piece of
    // view state at once, and it lets all of it be initialised straight from the
    // cache.
    const key = `${activeConnectionId ?? ""}:${activeTabId}:${graphName}`;

    // The cache only lives as long as the page does. What the tab wrote to
    // storage is the fallback for a reload, where there is no cache to restore
    // from — it holds the view state, not the schema itself.
    const storedMeta = tabs.find(({ id }) => id === activeTabId)?.schema ?? EMPTY_META;

    return (
        <SchemaGraph
            key={key}
            cacheKey={key}
            storedMeta={storedMeta}
            controlsSlot={controlsSlot}
            selectedElements={selectedElements}
            setSelectedElements={setSelectedElements}
        />
    );
}

function SchemaGraph({ cacheKey, storedMeta, controlsSlot, selectedElements, setSelectedElements }: SchemaViewProps & { cacheKey: string, storedMeta: SchemaViewMeta }) {
    const { graph, graphName, isLoading: isGraphLoading } = useContext(GraphContext);
    const { graphInfoVersion } = useContext(GraphInfoContext);
    const { setIndicator } = useContext(IndicatorContext);
    const { setSchemaMeta } = useContext(GraphTabsContext);
    const connection = useContext(ConnectionContext);
    const browserSettings = useContext(BrowserSettingsContext);

    const { toast } = useToast();

    const restored = readCache(cacheKey);
    // Only the reload path reads the tab: with a cache entry in hand, that entry
    // is both newer and more complete.
    const stored = restored ? EMPTY_META : storedMeta;
    const storedLayout = normalizeLayout(stored.layout);

    const canvasRef = useRef<FalkorDBCanvas | null>(null);

    const persist = useCallback((patch: Partial<SchemaCache>) => {
        const base: SchemaCache = readCache(cacheKey) ?? {
            key: cacheKey,
            schema: EMPTY_SCHEMA,
            labelIds: [],
            nextLabelId: 0,
            hiddenLabels: [],
            hiddenRelationships: [],
            graphData: undefined,
            viewport: undefined,
            layout: "force",
            direction: "",
            animation: false,
            pinned: false,
            dimmed: true,
            expand: true,
        };

        writeCache(cacheKey, { ...base, ...patch, key: cacheKey });
    }, [cacheKey]);
    const [schema, setSchema] = usePersisted("schema", restored?.schema ?? EMPTY_SCHEMA, persist);
    const [hiddenLabels, setHiddenLabels] = usePersisted("hiddenLabels", restored?.hiddenLabels ?? [], persist);
    const [hiddenRelationships, setHiddenRelationships] = usePersisted("hiddenRelationships", restored?.hiddenRelationships ?? [], persist);
    const [graphData, setGraphData] = usePersisted("graphData", restored?.graphData, persist);
    const [viewport, setViewport] = usePersisted("viewport", restored?.viewport ?? stored.viewport, persist);
    const [layout, setLayout] = usePersisted("layout", restored?.layout ?? storedLayout, persist);
    const [direction, setDirection] = usePersisted("direction", restored?.direction ?? normalizeDirection(storedLayout, stored.direction), persist);
    const [animation, setAnimation] = usePersisted("animation", restored?.animation ?? stored.animation ?? false, persist);
    const [pinned, setPinned] = usePersisted("pinned", restored?.pinned ?? stored.pinned ?? false, persist);
    const [dimmed, setDimmed] = usePersisted("dimmed", restored?.dimmed ?? stored.dimmed ?? true, persist);
    const [expand, setExpand] = usePersisted("expand", restored?.expand ?? stored.expand ?? true, persist);

    const [isLoading, setIsLoading] = useState(false);
    const [labels, setLabels] = useState<Label[]>([]);
    const [relationships, setRelationships] = useState<Relationship[]>([]);

    // Node ids have to stay stable across refreshes and remounts: both the
    // canvas and the saved layout are keyed by id, so an id handed to another
    // label would give that label the wrong position.
    const labelIdsRef = useRef({
        ids: new Map(restored?.labelIds ?? []),
        next: restored?.nextLabelId ?? 0,
    });

    // The stored selection is only ever put back once, when the schema first
    // arrives: after that the page's selection is the live one, and re-applying
    // a stored key would fight the user clearing it.
    const storedSelectedRef = useRef(stored.selected);
    const selectionRestoredRef = useRef(false);

    // Discover the schema. Re-runs when the graph changes; a superseded request
    // is dropped silently.
    useEffect(() => {
        if (!graphName) return undefined;

        const controller = new AbortController();
        const connectionId = getActiveConnectionIdGlobal();

        setIsLoading(true);

        getSchema(graphName, toast, setIndicator, { signal: controller.signal, connectionId })
            .then((result) => {
                if (controller.signal.aborted) return;
                // Keeping the previous object when nothing changed is what makes
                // a refresh non-destructive: the graph below is rebuilt from
                // this, and a rebuild re-runs the layout.
                setSchema((prev) => (result && !isSameSchema(prev, result) ? result : prev));
            })
            .catch((error) => {
                if (isAbortError(error) || controller.signal.aborted) return;
                console.error("Failed to fetch graph schema:", error);
            })
            .finally(() => {
                if (controller.signal.aborted) return;
                setIsLoading(false);
            });

        return () => controller.abort();
    }, [graphName, toast, setIndicator, setSchema]);

    // Only the set of labels decides when the graph is rebuilt from the graph
    // info side. Colors are applied in place further down, so a poll never
    // restarts the simulation.
    const labelNamesKey = useMemo(() => {
        const names: string[] = [];

        graph.GraphInfo.Labels.forEach((_, name) => names.push(name));

        return names.sort().join("\u0000");
        // graphInfoVersion is the signal that the label map was refreshed; the
        // map itself is mutated in place.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [graph, graphInfoVersion]);

    const schemaGraph = useMemo(() => {
        const g = Graph.empty(graphName);
        const registry = labelIdsRef.current;
        const added = new Set<string>();

        const addLabel = (name: string) => {
            let id = registry.ids.get(name);

            if (id === undefined) {
                id = registry.next;
                registry.next += 1;
                registry.ids.set(name, id);
            }

            if (added.has(name)) return id;

            added.add(name);

            const node: Node = {
                id,
                labels: [name],
                color: UNKNOWN_COLOR,
                visible: true,
                expand: false,
                collapsed: false,
                size: SCHEMA_NODE_SIZE,
                data: { ...schema.labelKeys[name], [SCHEMA_CAPTION_KEY]: name === "" ? EMPTY_LABEL_DISPLAY_NAME : name },
            };
            const label: Label = { name, show: true, style: { color: UNKNOWN_COLOR }, elements: [node] };

            g.Elements.nodes.push(node);
            g.NodesMap.set(id, node);
            g.Labels.push(label);
            g.LabelsMap.set(name, label);

            return id;
        };

        graph.GraphInfo.Labels.forEach((_, name) => addLabel(name));

        schema.edges.forEach(({ source, relationship, target }, index) => {
            const link: Link = {
                id: index,
                relationship,
                color: UNKNOWN_COLOR,
                // Called before the link is pushed so both endpoints exist.
                source: addLabel(source),
                target: addLabel(target),
                visible: true,
                expand: false,
                collapsed: false,
                data: { ...schema.relationshipKeys[relationship] },
            };

            g.Elements.links.push(link);
            g.LinksMap.set(index, link);

            const existing = g.RelationshipsMap.get(relationship);

            if (existing) {
                existing.elements.push(link);
            } else {
                const rel: Relationship = { name: relationship, show: true, style: { color: UNKNOWN_COLOR }, elements: [link] };

                g.Relationships.push(rel);
                g.RelationshipsMap.set(relationship, rel);
            }
        });

        return g;
        // `graph` is only read for its label names, which labelNamesKey covers.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [graphName, labelNamesKey, schema]);

    // Written after commit rather than from the memo above: React may run a
    // memo callback more than once (StrictMode, an interrupted render), and a
    // discarded render must not leave its ids behind in the cache.
    useEffect(() => {
        const registry = labelIdsRef.current;

        persist({ labelIds: [...registry.ids], nextLabelId: registry.next });
    }, [schemaGraph, persist]);

    // A rebuild hands the canvas a brand new structure, which it lays out from
    // scratch — so a schema that grew by one placement would throw the whole
    // drawing away. Snapshot what is on screen and hand it over together with
    // the new structure, leaving only the genuinely new nodes to be placed.
    //
    // Done while rendering rather than in an effect: child effects run first, so
    // an effect here would only get to act after the canvas had already re-laid
    // the graph out.
    const renderedGraphRef = useRef(schemaGraph);
    // A restored viewport only reaches the canvas for good once the zoomToFit
    // that `setData` schedules has been overridden. Until then the canvas still
    // reports the fit, so reading the camera back would save the very frame the
    // restore is undoing.
    const restorePendingUntilRef = useRef(graphData ? Date.now() + CANVAS_AUTO_ZOOM_DELAY : 0);

    if (renderedGraphRef.current !== schemaGraph) {
        renderedGraphRef.current = schemaGraph;

        const canvas = canvasRef.current;
        // Still showing the previous schema at this point.
        const positions = canvas ? captureCanvasLayout(canvas)?.positions : undefined;

        if (canvas && positions?.length) {
            if (Date.now() >= restorePendingUntilRef.current) setViewport(canvas.getViewport());

            restorePendingUntilRef.current = Date.now() + CANVAS_AUTO_ZOOM_DELAY;
            setGraphData({ data: convertToCanvasData(schemaGraph.Elements, SCHEMA_NODE_SHAPE), positions });
        }
    }

    // A rebuild replaces every element object, so anything holding the old ones
    // has to be re-derived. The selection outlives this view (the panel it feeds
    // is the page's), so it is re-resolved by id instead of being dropped.
    useEffect(() => {
        // After a reload the page has no selection to re-resolve, so the tab's
        // own — stored by name, since the ids above are handed out afresh — is
        // put back instead. Once, and only once the schema has actually arrived.
        const built = schemaGraph.getElements().length !== 0;
        const restoredSelection = !selectionRestoredRef.current && built
            ? findSchemaElement(schemaGraph, storedSelectedRef.current)
            : undefined;

        if (built) selectionRestoredRef.current = true;

        setSelectedElements((prev) => {
            const resolved = prev
                .map((element) => ("source" in element
                    ? schemaGraph.LinksMap.get(element.id)
                    : schemaGraph.NodesMap.get(element.id)))
                .filter((element): element is Node | Link => !!element);

            if (resolved.length === 0 && restoredSelection) return [restoredSelection];

            return resolved.length === prev.length && resolved.every((e, i) => e === prev[i])
                ? prev
                : resolved;
        });
        setLabels([...schemaGraph.Labels]);
        setRelationships([...schemaGraph.Relationships]);
    }, [schemaGraph, setSelectedElements]);

    // The tab is what remembers this view across a reload, and this view is
    // unmounted whenever it is not the one on screen — so it hands its state
    // over as it changes rather than being asked for it when the tab is saved.
    useEffect(() => {
        setSchemaMeta({
            viewport,
            selected: selectedElements.length === 1
                ? schemaElementKey(schemaGraph, selectedElements[0])
                : undefined,
            layout,
            direction,
            animation,
            pinned,
            dimmed,
            expand,
        });
    }, [setSchemaMeta, schemaGraph, selectedElements, viewport, layout, direction, animation, pinned, dimmed, expand]);

    // Colors and visibility never change the graph's shape, so they are applied
    // in place instead of costing a re-layout.
    useEffect(() => {
        const { Labels: infoLabels, Relationships: infoRelationships } = graph.GraphInfo;

        schemaGraph.Labels.forEach((label) => {
            const color = infoLabels.get(label.name)?.style.color ?? UNKNOWN_COLOR;
            const show = !hiddenLabels.includes(label.name);

            label.style.color = color;
            label.show = show;
            label.elements.forEach((node) => {
                node.color = color;
                node.visible = show;
            });
        });

        schemaGraph.Relationships.forEach((relationship) => {
            const color = infoRelationships.get(relationship.name)?.style.color ?? UNKNOWN_COLOR;
            const show = !hiddenRelationships.includes(relationship.name);

            relationship.style.color = color;
            relationship.show = show;
            relationship.elements.forEach((link) => {
                link.color = color;
                // Both ends have to be on screen too — a link to a hidden label
                // would otherwise dangle. Derived rather than toggled, because
                // this effect applies the whole state at once.
                link.visible = show
                    && !!schemaGraph.NodesMap.get(link.source)?.visible
                    && !!schemaGraph.NodesMap.get(link.target)?.visible;
            });
        });

        setLabels([...schemaGraph.Labels]);
        setRelationships([...schemaGraph.Relationships]);

        const canvas = canvasRef.current;

        if (!canvas) return;

        const canvasData = canvas.getGraphData();

        canvasData.nodes.forEach((canvasNode) => {
            const node = schemaGraph.NodesMap.get(canvasNode.id);

            if (!node) return;

            canvasNode.color = node.color;
            canvasNode.visible = node.visible;
        });
        canvasData.links.forEach((canvasLink) => {
            const link = schemaGraph.LinksMap.get(canvasLink.id);

            if (!link) return;

            canvasLink.color = link.color;
            canvasLink.visible = link.visible;
        });

        canvas.refresh();
        // The graph info maps are mutated in place; graphInfoVersion is the signal.
    }, [schemaGraph, graphInfoVersion, graph, hiddenLabels, hiddenRelationships]);

    const onLabelClick = useCallback((label: Label) => {
        setHiddenLabels((prev) => (prev.includes(label.name)
            ? prev.filter((name) => name !== label.name)
            : [...prev, label.name]));
    }, [setHiddenLabels]);

    const onRelationshipClick = useCallback((relationship: Relationship) => {
        setHiddenRelationships((prev) => (prev.includes(relationship.name)
            ? prev.filter((name) => name !== relationship.name)
            : [...prev, relationship.name]));
    }, [setHiddenRelationships]);

    const handleSelect = useCallback((elements?: (Node | Link)[]) => {
        setSelectedElements(elements ?? []);
    }, [setSelectedElements]);

    // Showing everything again is the same thing the legend does, which is also
    // what keeps it across a tab switch.
    const showAllElements = useCallback(() => {
        setHiddenLabels([]);
        setHiddenRelationships([]);
    }, [setHiddenLabels, setHiddenRelationships]);

    // The schema is derived, not edited: there is nothing to add or delete.
    const handleDeleteElement = useCallback(async () => { }, []);
    const noop = useCallback(() => { }, []);
    const setData = noop as Dispatch<SetStateAction<GraphData>>;

    const forceGraphValue = useMemo(() => ({
        canvasRef,
        viewport,
        setViewport,
        data: schemaGraph.Elements,
        setData,
        graphData,
        setGraphData,
        layout,
        setLayout,
        direction,
        setDirection,
        animation,
        setAnimation,
        pinned,
        setPinned,
        dimmed,
        setDimmed,
    }), [
        viewport, setViewport, schemaGraph, setData, graphData, setGraphData, layout, setLayout,
        direction, setDirection, animation, setAnimation, pinned, setPinned, dimmed, setDimmed,
    ]);

    // Read-only by nature: the schema is a view of the data, not the data.
    const connectionValue = useMemo(() => ({ ...connection, isReadOnly: true }), [connection]);

    // Schema nodes carry a single caption key the user's settings know nothing about.
    const settingsValue = useMemo(() => ({
        ...browserSettings,
        settings: {
            ...browserSettings.settings,
            userExperienceSettings: {
                ...browserSettings.settings.userExperienceSettings,
                captionKeysSettings: {
                    ...browserSettings.settings.userExperienceSettings.captionKeysSettings,
                    captionsKeys: SCHEMA_CAPTIONS,
                    showPropertyKeyPrefix: false,
                },
            },
        },
    }), [browserSettings]);

    const isEmpty = schemaGraph.getElements().length === 0;
    const hasLegend = labels.length !== 0 || relationships.length !== 0;

    return (
        <ConnectionContext.Provider value={connectionValue}>
            <BrowserSettingsContext.Provider value={settingsValue}>
                <ForceGraphContext.Provider value={forceGraphValue}>
                    <div data-testid="schemaView" className="relative h-full w-full">
                        {
                            // The controls belong next to the tab list, which is
                            // rendered by GraphView. A portal keeps them there
                            // while they stay inside this view's providers.
                            controlsSlot && createPortal(
                                <div data-testid="schemaControls" className="flex gap-2 items-center">
                                    {isLoading && <Loader2 data-testid="schemaLoading" role="status" aria-label="Discovering schema" className="animate-spin" size={16} />}
                                    <Controls
                                        graph={schemaGraph}
                                        canvasRef={canvasRef}
                                        disabled={isEmpty}
                                        dimmed={dimmed}
                                        setDimmed={setDimmed}
                                        selectedElements={selectedElements}
                                    />
                                    <div className="h-4 w-px bg-border rounded-full" />
                                    {
                                        // The schema is derived, not queried, so it
                                        // counts labels and placements and has no
                                        // run time to report. A placement is one
                                        // (source, type, target) triple, so the
                                        // count is of drawn edges, not of distinct
                                        // relationship types — hence "Connections".
                                        !isEmpty &&
                                        <>
                                            <p data-testid="schemaLabelsCount">Labels: {schemaGraph.NodesMap.size}</p>
                                            <div className="h-4 w-px bg-border rounded-full" />
                                            <p data-testid="schemaConnectionsCount">Connections: {schemaGraph.LinksMap.size}</p>
                                        </>
                                    }
                                </div>,
                                controlsSlot
                            )
                        }
                        <div className="absolute inset-0 z-10 flex flex-col gap-2 p-2 pointer-events-none">
                            {
                                !isGraphLoading &&
                                <Toolbar
                                    graph={schemaGraph}
                                    graphName={graphName}
                                    selectedElements={selectedElements}
                                    setSelectedElements={handleSelect}
                                    handleDeleteElement={handleDeleteElement}
                                    showAllElements={showAllElements}
                                    canvasRef={canvasRef}
                                    setIsAddNode={noop}
                                    setExpand={setExpand}
                                    expand={expand}
                                    isAddEdge={false}
                                    isAddNode={false}
                                />
                            }
                            {
                                !isGraphLoading && expand && hasLegend &&
                                <div className={cn("w-fit max-w-[180px] h-1 grow grid gap-1.5", labels.length !== 0 && relationships.length !== 0 ? "grid-rows-[minmax(0,max-content)_max-content_minmax(0,max-content)]" : "grid-rows-[minmax(0,max-content)]")}>
                                    {labels.length !== 0 && <Labels labels={labels} onClick={onLabelClick} label="Labels" />}
                                    {labels.length !== 0 && relationships.length !== 0 && <div className="h-px bg-border/40 rounded-full" />}
                                    {relationships.length !== 0 && <Labels labels={relationships} onClick={onRelationshipClick} label="Relationships" />}
                                </div>
                            }
                        </div>
                        {
                            isEmpty && !isLoading &&
                            <p data-testid="schemaEmptyState" className="absolute inset-0 flex items-center justify-center text-foreground/50 pointer-events-none">
                                {graphName ? "This graph has no labels yet" : "Select a graph to see its schema"}
                            </p>
                        }
                        <ForceGraph
                            graph={schemaGraph}
                            data={schemaGraph.Elements}
                            setData={setData}
                            graphData={graphData}
                            setGraphData={setGraphData}
                            canvasRef={canvasRef}
                            selectedElements={selectedElements}
                            setSelectedElements={handleSelect}
                            setRelationships={setRelationships}
                            viewport={viewport}
                            setViewport={setViewport}
                            dimmed={dimmed}
                            disableExpand
                            nodeShape={SCHEMA_NODE_SHAPE}
                            testHookName="schema"
                            testId="schemaCanvasWrapper"
                        />
                    </div>
                </ForceGraphContext.Provider>
            </BrowserSettingsContext.Provider>
        </ConnectionContext.Provider>
    );
}
