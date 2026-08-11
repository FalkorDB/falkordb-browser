"use client";

import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, RefreshCcw } from "lucide-react";
import type { FalkorDBCanvas, LayoutMode, ViewportState } from "@falkordb/canvas";
import { useToast } from "@/components/ui/use-toast";
import ForceGraph from "@/app/components/ForceGraph";
import {
    CanvasLayout,
    GraphData,
    Label,
    Link,
    Node,
    Relationship,
    SchemaSnapshot,
    captureCanvasLayout,
    cn,
    convertToCanvasData,
    getActiveConnectionIdGlobal,
    getSchema,
    isAbortError,
} from "@/lib/utils";
import {
    BrowserSettingsContext,
    ConnectionContext,
    ForceGraphContext,
    GraphContext,
    GraphInfoContext,
    IndicatorContext,
} from "../components/provider";
import { Graph } from "../api/graph/model";
import Button from "../components/ui/Button";
import Controls from "./controls";
import Labels from "./labels";
import Toolbar from "./toolbar";
import SchemaDataPanel from "./SchemaDataPanel";

/** Shown in place of the synthetic "" label FalkorDB reports for unlabeled nodes. */
const EMPTY_LABEL_DISPLAY_NAME = "Empty";

/** Fallback color for a label or type the graph info panel has not colored yet. */
const UNKNOWN_COLOR = "#A3A3A3";

/** A schema node stands for a label, so that is what captions it. */
const SCHEMA_CAPTIONS: [string, boolean][] = [["label", true]];

const EMPTY_SCHEMA: SchemaSnapshot = { edges: [], labelKeys: {}, relationshipKeys: {} };

/**
 * Everything needed to put the view back exactly as the user left it. Kept
 * outside React because switching tabs unmounts the whole view. One slot is
 * enough: only one schema is on screen at a time.
 */
type SchemaCache = {
    /** Connection + graph the cache belongs to. */
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

let cache: SchemaCache | undefined;

const readCache = (key: string) => (cache?.key === key ? cache : undefined);

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
export default function SchemaView({ controlsSlot }: { controlsSlot: HTMLElement | null }) {
    const { graphName } = useContext(GraphContext);
    const { activeConnectionId } = useContext(ConnectionContext);

    // A different graph is a different schema. Remounting is the simplest way to
    // reset every piece of view state at once, and it lets all of it be
    // initialised straight from the cache.
    const key = `${activeConnectionId ?? ""}:${graphName}`;

    return <SchemaGraph key={key} cacheKey={key} controlsSlot={controlsSlot} />;
}

function SchemaGraph({ cacheKey, controlsSlot }: { cacheKey: string, controlsSlot: HTMLElement | null }) {
    const { graph, graphName, isLoading: isGraphLoading } = useContext(GraphContext);
    const { graphInfoVersion } = useContext(GraphInfoContext);
    const { setIndicator } = useContext(IndicatorContext);
    const connection = useContext(ConnectionContext);
    const browserSettings = useContext(BrowserSettingsContext);

    const { toast } = useToast();

    const restored = readCache(cacheKey);

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

        cache = { ...base, ...patch, key: cacheKey };
    }, [cacheKey]);

    const [schema, setSchema] = usePersisted("schema", restored?.schema ?? EMPTY_SCHEMA, persist);
    const [hiddenLabels, setHiddenLabels] = usePersisted("hiddenLabels", restored?.hiddenLabels ?? [], persist);
    const [hiddenRelationships, setHiddenRelationships] = usePersisted("hiddenRelationships", restored?.hiddenRelationships ?? [], persist);
    const [graphData, setGraphData] = usePersisted("graphData", restored?.graphData, persist);
    const [viewport, setViewport] = usePersisted("viewport", restored?.viewport, persist);
    const [layout, setLayout] = usePersisted("layout", restored?.layout ?? "force", persist);
    const [direction, setDirection] = usePersisted("direction", restored?.direction ?? "", persist);
    const [animation, setAnimation] = usePersisted("animation", restored?.animation ?? false, persist);
    const [pinned, setPinned] = usePersisted("pinned", restored?.pinned ?? false, persist);
    const [dimmed, setDimmed] = usePersisted("dimmed", restored?.dimmed ?? true, persist);
    const [expand, setExpand] = usePersisted("expand", restored?.expand ?? true, persist);

    const [isLoading, setIsLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([]);
    const [labels, setLabels] = useState<Label[]>([]);
    const [relationships, setRelationships] = useState<Relationship[]>([]);

    // Node ids have to stay stable across refreshes and remounts: both the
    // canvas and the saved layout are keyed by id, so an id handed to another
    // label would give that label the wrong position.
    const labelIdsRef = useRef({
        ids: new Map(restored?.labelIds ?? []),
        next: restored?.nextLabelId ?? 0,
    });

    // Discover the schema. Re-runs when the graph changes or the user asks for a
    // refresh; a superseded request is dropped silently.
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
    }, [graphName, refreshKey, toast, setIndicator, setSchema]);

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
                // The caption key is written last so a property that happens to
                // be called "label" cannot take the caption over.
                data: { ...schema.labelKeys[name], label: name === "" ? EMPTY_LABEL_DISPLAY_NAME : name },
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

        persist({ labelIds: [...registry.ids], nextLabelId: registry.next });

        return g;
        // `graph` is only read for its label names, which labelNamesKey covers.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [graphName, labelNamesKey, schema, persist]);

    // A rebuild hands the canvas a brand new structure, which it lays out from
    // scratch — so a schema that grew by one placement would throw the whole
    // drawing away. Snapshot what is on screen and hand it over together with
    // the new structure, leaving only the genuinely new nodes to be placed.
    //
    // Done while rendering rather than in an effect: child effects run first, so
    // an effect here would only get to act after the canvas had already re-laid
    // the graph out.
    const renderedGraphRef = useRef(schemaGraph);

    if (renderedGraphRef.current !== schemaGraph) {
        renderedGraphRef.current = schemaGraph;

        const canvas = canvasRef.current;
        // Still showing the previous schema at this point.
        const positions = canvas ? captureCanvasLayout(canvas)?.positions : undefined;

        if (canvas && positions?.length) {
            setViewport(canvas.getViewport());
            setGraphData({ data: convertToCanvasData(schemaGraph.Elements), positions });
        }
    }

    // A rebuild replaces every element object, so anything holding the old ones
    // has to be re-derived.
    useEffect(() => {
        setSelectedElements([]);
        setLabels([...schemaGraph.Labels]);
        setRelationships([...schemaGraph.Relationships]);
    }, [schemaGraph]);

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

            relationship.style.color = color;
            relationship.show = !hiddenRelationships.includes(relationship.name);
            relationship.elements.forEach((link) => {
                link.color = color;
            });
        });

        schemaGraph.visibleLinks(true);

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
    }, []);

    const handleRefresh = useCallback(() => setRefreshKey((prev) => prev + 1), []);

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

    const selected = selectedElements[selectedElements.length - 1];
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
                                    {isLoading && <Loader2 data-testid="schemaLoading" className="animate-spin" size={16} />}
                                    <Controls
                                        graph={schemaGraph}
                                        canvasRef={canvasRef}
                                        disabled={isEmpty}
                                        dimmed={dimmed}
                                        setDimmed={setDimmed}
                                        selectedElements={selectedElements}
                                    />
                                    <div className="h-4 w-px bg-border rounded-full" />
                                    <Button
                                        data-testid="schemaRefresh"
                                        className="p-1 rounded-md hover:bg-secondary"
                                        title="Refresh schema"
                                        disabled={!graphName || isLoading}
                                        onClick={handleRefresh}
                                    >
                                        <RefreshCcw size={16} />
                                    </Button>
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
                        {
                            selected &&
                            <div className="absolute top-14 right-2 bottom-12 w-[320px] z-20 pointer-events-auto">
                                <SchemaDataPanel
                                    object={selected}
                                    keys={
                                        "source" in selected
                                            ? schema.relationshipKeys[selected.relationship] ?? {}
                                            : schema.labelKeys[selected.labels[0]] ?? {}
                                    }
                                    onClose={() => setSelectedElements([])}
                                />
                            </div>
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
                            testHookName="schema"
                            testId="schemaCanvasWrapper"
                        />
                    </div>
                </ForceGraphContext.Provider>
            </BrowserSettingsContext.Provider>
        </ConnectionContext.Provider>
    );
}
