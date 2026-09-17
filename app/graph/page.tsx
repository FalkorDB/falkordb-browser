'use client';

import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn, convertToCanvasData, getActiveConnectionIdGlobal, getConnectionEpoch, getMemoryUsage, getMetaStats, getSSEGraphResult, isAbortError, isTwoNodes, Link, MemoryValue, Node, parsePanelSizePercent, prepareArg, securedFetch, Value } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamicImport from "next/dynamic";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { PanelImperativeHandle, PanelSize } from "react-resizable-panels";
import { Graph, GraphInfo } from "../api/graph/model";
import { BrowserSettingsContext, GraphContext, GraphTabsContext, HistoryQueryContext, IndicatorContext, PanelContext, QueryLoadingContext, ForceGraphContext, ConnectionContext, SHEET_KEYS, SheetKey } from "../components/provider";
import Spinning from "../components/ui/spinning";
import Chat from "./Chat";
import ResizableBox from "@/components/ui/ResizableBox";
import BottomSheet from "@/components/ui/BottomSheet";
import useIsMobile from "@/lib/useIsMobile";
import { useResizableSize } from "@/lib/useResizableSize";
import { tabScopedKey } from "@/lib/useGraphTabs";
import { getConnectionItem, setConnectionItem } from "@/lib/connection-storage";
import GraphSubHeader from "./GraphSubHeader";

const GraphInfoPanel = dynamicImport(() => import("./graphInfo"), {
    ssr: false,
});

const DataPanel = dynamicImport(() => import("./DataPanel"), {
    ssr: false,
});

const CreateElementPanel = dynamicImport(() => import("./CreateElementPanel"), {
    ssr: false,
});

/** Mirrors the real Selector rows so the swap on mount does not shift anything. */
const SelectorSkeleton = () => {
    const isMobile = useIsMobile();
    const block = "animate-pulse rounded-lg border border-border bg-background";

    return isMobile ? (
        <div className="z-20 w-full flex flex-col gap-2">
            <div className={cn(block, "w-full h-[44px]")} />
        </div>
    ) : (
        <div className="z-20 w-full h-[44px] flex flex-row gap-3 items-center">
            <div className={cn(block, "w-[42px] h-full")} />
            <div className={cn(block, "w-[38px] h-full")} />
            <div className={cn(block, "w-1 grow h-full")} />
            <div className={cn(block, "w-[92px] h-full")} />
            <div className={cn(block, "w-[42px] h-full")} />
        </div>
    );
};

const Selector = dynamicImport(() => import("./Selector"), {
    ssr: false,
    loading: () => <SelectorSkeleton />
});
const GraphView = dynamicImport(() => import("./GraphView"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex justify-center items-center overflow-hidden">
        <Spinning />
    </div>
});

/** Shared so a tab with no schema selection keeps a stable identity. */
const EMPTY_SELECTION: (Node | Link)[] = [];

const SHEET_BASE_Z = 40;

/**
 * Render the main Graph page UI that orchestrates the selector, graph view, and right-hand panels.
 *
 * The component coordinates context state, data fetching, periodic graph info refresh, element selection
 * and deletion, and layout of resizable panels (graph canvas and optional data/chat panel).
 *
 * @returns The React element for the graph page UI.
 */
export default function Page() {
    const { historyQuery, setHistoryQuery } = useContext(HistoryQueryContext);
    const { setIndicator } = useContext(IndicatorContext);
    const { panel, setPanel, panelOpen, onTogglePanel, infoPanelRef, onInfoPanelResize, customizingLabel, setCustomizingLabel, sheetStack, setSheetStack } = useContext(PanelContext);
    const { tutorialOpen } = useContext(BrowserSettingsContext);
    const { isQueryLoading, setIsQueryLoading } = useContext(QueryLoadingContext);
    const { canvasRef, graphData, setViewport } = useContext(ForceGraphContext);
    const { isReadOnly, activeConnectionId } = useContext(ConnectionContext);
    const { tabs, activeTabId } = useContext(GraphTabsContext);
    const isReadOnlyRef = useRef(isReadOnly);
    isReadOnlyRef.current = isReadOnly;
    const {
        graph,
        setGraph,
        graphName,
        handleSetGraphName,
        setGraphInfo,
        graphNames,
        setGraphNames,
        labels,
        setLabels,
        relationships,
        setRelationships,
        runQuery,
        fetchCount,
        selectedParam,
        setSelectedParam,
        isLoading,
        pendingAutoLoadRef,
        currentTab,
        chatOpen,
        setChatOpen,
    } = useContext(GraphContext);
    const {
        settings: {
            querySettings: { runDefaultQuery, defaultQuery },
            graphInfo: { showMemoryUsage, refreshInterval }
        }
    } = useContext(BrowserSettingsContext);
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const panelRef = useRef<PanelImperativeHandle>(null);
    const pendingZoomRef = useRef<((node: any) => boolean) | null>(null);
    // Track the previous graphName to distinguish "graph just changed" re-fires
    // (where runQuery handles the initial fetch) from other dep changes like
    // showMemoryUsage becoming true (where we must fetch immediately).
    const prevGraphNameRef = useRef<string | undefined>(undefined);

    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([]);
    // Stands in for Ctrl-click, which a touch device has no way to produce. Only
    // offered on mobile, so widening past the breakpoint has to drop it or clicks
    // would stay additive with no toggle left on screen to turn off.
    const [multiSelect, setMultiSelectState] = useState(false);
    // The long press turns the mode on and selects its first element in one go, so
    // the selection handler cannot wait for the re-render to learn the mode is on.
    const multiSelectRef = useRef(false);
    const setMultiSelect = useCallback((value: boolean) => {
        multiSelectRef.current = value;
        setMultiSelectState(value);
    }, []);
    useEffect(() => {
        if (!isMobile) setMultiSelect(false);
    }, [isMobile, setMultiSelect]);
    // The Schema tab has a selection of its own — of labels and relationship
    // types, not elements — and it shares the panel with the graph's. It is kept
    // per graph tab, like everything else a tab remembers.
    const [schemaSelections, setSchemaSelections] = useState<Record<string, { graphName: string, elements: (Node | Link)[] }>>({});
    // A schema element belongs to the graph it was derived from, so an entry left
    // over from a graph the tab no longer shows simply does not count.
    const schemaSelection = schemaSelections[activeTabId];
    const selectedSchemaElements = schemaSelection?.graphName === graphName ? schemaSelection.elements : EMPTY_SELECTION;

    const setSelectedSchemaElements = useCallback<Dispatch<SetStateAction<(Node | Link)[]>>>((next) => {
        setSchemaSelections((prev) => {
            const entry = prev[activeTabId];
            const current = entry?.graphName === graphName ? entry.elements : EMPTY_SELECTION;
            const resolved = typeof next === "function" ? next(current) : next;

            return resolved === current ? prev : { ...prev, [activeTabId]: { graphName, elements: resolved } };
        });
    }, [activeTabId, graphName]);

    // Tab ids are never reused, so a closed tab's selection would just leak.
    useEffect(() => {
        setSchemaSelections((prev) => {
            const live = new Set(tabs.map(({ id }) => id));
            const kept = Object.keys(prev).filter((id) => live.has(id));

            return kept.length === Object.keys(prev).length
                ? prev
                : Object.fromEntries(kept.map((id) => [id, prev[id]]));
        });
    }, [tabs]);
    // Ref that mirrors selectedElements tagged with the graph it belongs to, so the
    // graph-change restore effect can read the current full selection without adding
    // it as a dependency — and skip restoring a selection made in a different graph.
    const selectedElementsRef = useRef<{ graphId: string; elements: (Node | Link)[] }>({ graphId: "", elements: [] });
    // Mirror the current graph id at render time so the sync effect can tag the
    // selection with the graph it was made in.
    const currentGraphIdRef = useRef(graph.Id);
    currentGraphIdRef.current = graph.Id;
    const { size: chatSize, onResize: onChatResize } = useResizableSize("chat-size", 400, 500, 300, 300);
    const [queriesOpen, setQueriesOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isAddNode, setIsAddNode] = useState(false);
    const [isAddEdge, setIsAddEdge] = useState(false);

    // Graph and Schema each have a selection of their own; the other tabs have
    // none. `panel` is shared by all of them, so it stays "data" across a tab
    // switch — only the selection tells whether there is anything to show.
    const activeSelection = useMemo(() => {
        if (currentTab === "Graph") return selectedElements;
        if (currentTab === "Schema") return selectedSchemaElements;
        return EMPTY_SELECTION;
    }, [currentTab, selectedElements, selectedSchemaElements]);

    const hasPanelContent = panel !== undefined && (panel !== "data" || activeSelection.length > 0);
    const chatSheetOpen = chatOpen && !!graphName;

    // The sheets stack rather than replacing one another, so the stack holds
    // exactly the open ones in the order they were opened — a closed sheet has
    // to leave it, or its trigger would read as already on top.
    useEffect(() => {
        if (!isMobile) return;

        const open: Record<SheetKey, boolean> = { info: panelOpen, data: hasPanelContent, chat: chatSheetOpen };
        setSheetStack(prev => {
            const next = [
                ...prev.filter(key => open[key]),
                ...SHEET_KEYS.filter(key => open[key] && !prev.includes(key)),
            ];
            return next.length === prev.length && next.every((key, i) => key === prev[i]) ? prev : next;
        });
    }, [isMobile, panelOpen, hasPanelContent, chatSheetOpen, setSheetStack]);

    // Two levels each: the sheet sits one above its own overlay.
    const sheetZ = (key: SheetKey) => SHEET_BASE_Z + sheetStack.indexOf(key) * 2;

    // The side panel is shared by the Graph and the Schema tab, and each graph
    // tab sizes it for itself — so the width is remembered per tab AND per view.
    const panelSizeKey = useCallback(
        (name: string) => tabScopedKey(activeTabId, `panel-size-${name}-${currentTab === "Schema" ? "schema" : "graph"}`),
        [activeTabId, currentTab]
    );

    const onPanelResize = useCallback((size: PanelSize) => {
        setIsCollapsed(size.asPercentage === 0);
        if (size.asPercentage > 0 && panel) {
            setConnectionItem(panelSizeKey(panel), JSON.stringify(size.asPercentage));
        }
    }, [panel, panelSizeKey]);

    const panelSizes: Record<string, { size: string; min: string }> = useMemo(() => ({
        data: { size: "200px", min: "200px" },
        add: { size: "30%", min: "25%" },
    }), []);

    const getPanelSize = useCallback(() => {
        if (!panel) return "0%";

        const stored = parsePanelSizePercent(getConnectionItem(panelSizeKey(panel)));

        if (stored !== undefined) return `${stored}%`;

        return panelSizes[panel]?.size ?? "0%";
    }, [panel, panelSizeKey, panelSizes]);

    const panelMinSize = useMemo(() => {
        if (!panel) return "0%";
        return panelSizes[panel]?.min ?? "0%";
    }, [panel, panelSizes]);

    useEffect(() => {
        const currentPanel = panelRef.current;

        if (!currentPanel) return;

        if (hasPanelContent) {
            currentPanel.expand();
            // Defer resize to next frame so the panel processes the updated minSize prop first
            const frameId = requestAnimationFrame(() => {
                currentPanel.resize(getPanelSize());
            });

            return () => cancelAnimationFrame(frameId);
        }
        currentPanel.collapse();

    }, [getPanelSize, hasPanelContent]);

    // Keeps the element panel in step with the selection. This re-asserts
    // `expand()` on every selection change — not just when the count changes —
    // because switching tabs can swap one selected element for another while
    // `panel` stays "data", which on its own would leave the panel collapsed.
    useEffect(() => {
        const currentPanel = panelRef.current;

        if (!currentPanel) return;

        if (activeSelection.length !== 0) {
            currentPanel.expand();
            if (panel === undefined) setPanel("data");
        } else if (panel === "data") {
            currentPanel.collapse();
        }
    }, [activeSelection, panel, setPanel]);

    const fetchInfo = useCallback(async (type: string, options?: { signal?: AbortSignal; connectionId?: string | null }) => {
        if (!graphName) return [];

        if (type === "(property key)") {
            const readOnlyParam = isReadOnlyRef.current ? '&readOnly=true' : '';
            const query = "CALL db.propertyKeys() YIELD propertyKey as info";
            const sse = await getSSEGraphResult(
                `/api/graph/${prepareArg(graphName)}?query=${prepareArg(query)}${readOnlyParam}`,
                toast,
                setIndicator,
                { signal: options?.signal, connectionId: options?.connectionId },
            ) as { data?: Array<{ info?: unknown }> };

            if (!sse || !Array.isArray(sse.data)) return [];

            return sse.data
                .map((entry) => (typeof entry?.info === "string" ? entry.info : undefined))
                .filter((value): value is string => typeof value === "string");
        }

        const readOnlyParam = isReadOnlyRef.current ? '&readOnly=true' : '';
        const result = await securedFetch(`/api/graph/${prepareArg(graphName)}/info?type=${prepareArg(type)}${readOnlyParam}`, {
            method: "GET",
            signal: options?.signal,
        }, toast, setIndicator, options?.connectionId);

        if (!result.ok) return [];

        const bodyText = await result.text();
        let json: unknown;

        try {
            json = JSON.parse(bodyText);
        } catch (error) {
            console.error("Failed to parse graph info response", {
                error,
                responseUrl: result.url,
                contentType: result.headers.get("content-type"),
                preview: bodyText.slice(0, 200),
            });
            return [];
        }

        const data = (json as { result?: { data?: Array<{ info?: unknown }> } })?.result?.data;
        if (!Array.isArray(data)) return [];

        return data
            .map((entry) => (typeof entry?.info === "string" ? entry.info : undefined))
            .filter((value): value is string => typeof value === "string");
    }, [graphName, setIndicator, toast]);

    const fetchMetaStats = useCallback((name: string, options?: { signal?: AbortSignal; connectionId?: string | null }) => getMetaStats(name, toast, setIndicator, isReadOnlyRef.current, options), [setIndicator, toast]);

    useEffect(() => {
        if (!graphName) {
            prevGraphNameRef.current = graphName;
            return undefined;
        }

        const graphNameJustChanged = prevGraphNameRef.current !== graphName;
        prevGraphNameRef.current = graphName;

        // Neutralizes in-flight polls when the effect re-runs (graph/connection
        // change) or unmounts, so a late poll can't write stale metadata onto the
        // graph that is now active (setGraphInfo mutates the current graph).
        let cancelled = false;
        // AbortController closes in-flight EventSource/fetch requests on cleanup so
        // a superseded poll can't surface a stale error toast or flip the
        // indicator offline for the connection that is now active.
        const controller = new AbortController();
        const { signal } = controller;
        // Pin every request in this run to the connection active at start, so the
        // whole poll targets one connection even if the global changes mid-flight.
        // activeConnectionId is intentionally NOT an effect dependency: a
        // connection switch always resets graphName (providers.tsx), which re-runs
        // this effect and aborts the old poll. Re-running on activeConnectionId
        // directly would fire a query for the *previous* graph against the *new*
        // connection (auto-creating it) before graphName is cleared.
        const pollConnectionId = activeConnectionId;
        const pollEpoch = getConnectionEpoch();
        const requestOptions = { signal, connectionId: pollConnectionId, epoch: pollEpoch };

        const handleSetInfo = () => Promise.all([
            fetchMetaStats(graphName, requestOptions),
            fetchInfo("(property key)", requestOptions),
        ]).then(async ([newDataStats, newPropertyKeys]) => {
            if (cancelled || getConnectionEpoch() !== pollEpoch) return;

            const memoryUsage = showMemoryUsage ? await getMemoryUsage(graphName, toast, setIndicator, pollConnectionId, signal) : new Map<string, MemoryValue>();
            if (cancelled || getConnectionEpoch() !== pollEpoch) return;
            const newLabels = newDataStats?.[0] || [];
            const newRelationships = newDataStats?.[1] || [];

            const gi = await GraphInfo.create(newPropertyKeys, newLabels, newRelationships, memoryUsage, toast, setIndicator, pollConnectionId);
            if (cancelled || getConnectionEpoch() !== pollEpoch) return;

            setGraphInfo(gi);
            fetchCount(graphName, requestOptions);
        }).catch((error) => {
            if (cancelled || isAbortError(error)) return;
            toast({
                title: "Error",
                description: (error as Error).message || "Failed to fetch graph info",
                variant: "destructive",
            });
        });

        // The auto-load effect below runs the query for a freshly selected
        // graph, and that query fetches info/stats (including memory) itself —
        // skip here so the initial fetch isn't duplicated. Every other reason
        // this effect re-runs (a restored tab, showMemoryUsage flipping on,
        // refreshInterval changing) needs the fetch right away rather than at
        // the next tick of the interval.
        const willAutoLoadQuery = runDefaultQuery && pendingAutoLoadRef.current === graphName;
        if (!graphNameJustChanged || !willAutoLoadQuery) {
            handleSetInfo();
        }

        const interval = setInterval(handleSetInfo, refreshInterval * 1000);

        return () => {
            cancelled = true;
            controller.abort();
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchCount, fetchInfo, fetchMetaStats, graphName, refreshInterval, runDefaultQuery, setGraphInfo, setIndicator, showMemoryUsage, toast]);

    useEffect(() => {
        if (graphName) return;

        panelRef.current?.collapse();
    }, [graphName]);

    // Loads a graph automatically, at most once per selection. This is a
    // one-shot on purpose: nothing here may re-fire when this page remounts on
    // a route change, when a tab is restored, or when a query fails.
    useEffect(() => {
        // The graph the user just picked. `pendingAutoLoad` is armed by
        // handleSetGraphName on a real selection change and disarmed by whoever
        // loads the graph — including an explicit runQuery, so a user hitting RUN
        // first is never followed by the default query.
        if (graphName && pendingAutoLoadRef.current === graphName) {
            pendingAutoLoadRef.current = null;

            if (runDefaultQuery && !tutorialOpen) {
                runQuery(defaultQuery, graphName);
                return;
            }

            setGraph(Graph.empty(graphName));
            fetchCount(graphName);
        }

        setIsQueryLoading(false);
    }, [fetchCount, graph.Id, graphName, setGraph, runQuery, runDefaultQuery, defaultQuery, setIsQueryLoading, tutorialOpen, pendingAutoLoadRef]);

    // Every route into the data panel goes through here. On mobile the panel
    // covers the canvas, so while multi select is on it has to stay shut — the
    // user is still picking the elements it would hide. Multi select is only
    // offered on mobile, so on desktop this is always a plain open.
    const openDataPanel = useCallback(() => {
        setPanel(multiSelectRef.current ? undefined : "data");
    }, [setPanel]);

    const handleSetSelectedElements = useCallback((el: (Node | Link)[] = [], fromSearch?: boolean) => {
        setSelectedElements(el);

        // Sync selected element to context state
        if (el.length > 0) {
            const last = el[el.length - 1];
            const type = "labels" in last ? "n" : "e";
            const value = `${type}:${last.id}${fromSearch ? ":s" : ""}`;
            setSelectedParam(value);
        } else {
            setSelectedParam("");
        }

        if (el.length === 0) {
            setPanel(undefined);
            return;
        }

        openDataPanel();
        setIsAddEdge(false);
        setIsAddNode(false);
    }, [openDataPanel, setPanel, setSelectedParam]);

    // Keep selectedElementsRef in sync so the restore effect below can read the
    // full multi-selection without adding selectedElements as a dependency.
    useEffect(() => {
        selectedElementsRef.current = { graphId: currentGraphIdRef.current, elements: selectedElements };
    }, [selectedElements]);

    // Restore selected element from context when graph data loads, otherwise clear selection
    useEffect(() => {
        if (!graph.Id) return;

        const { graphId: selectionGraphId, elements: prev } = selectedElementsRef.current;
        const last = prev[prev.length - 1];
        // `selectedParam` names the last element of the current selection, so a
        // mismatch means something else set it — a tab activation asking for its
        // own pick — and that wins over the selection carried over from before.
        const paramMatchesSelection = last !== undefined
            && selectedParam.split(":").slice(0, 2).join(":") === `${"labels" in last ? "n" : "e"}:${last.id}`;
        const canRestore = selectionGraphId === graph.Id && paramMatchesSelection;

        if (graph.NodesMap.size === 0 && graph.LinksMap.size === 0) {
            // Empty graph (e.g. a query returned no rows). Drop a selection carried
            // over from a *different* graph so a stale element panel doesn't linger;
            // keep a same-graph selection untouched (the graph may be mid-reload).
            // `selectedParam` is left alone on purpose — on a tab switch it already
            // names the incoming tab's pick, which its results will resolve.
            if (!canRestore && selectedElements.length > 0) {
                setSelectedElements([]);
                setPanel(undefined);
            }
            return;
        }

        // When new query results load a fresh Graph object (setGraphInfo mutates
        // GraphInfo in-place and does NOT trigger this effect), preserve the full
        // multi-selection by re-resolving every previously selected element from
        // the new graph's NodesMap/LinksMap. Only restore a selection made in THIS
        // graph — FalkorDB node/edge ids are per-graph, so restoring across a graph
        // switch could resolve unrelated same-id elements.
        if (canRestore) {
            const restored = prev.flatMap(el => {
                const found = 'source' in el
                    ? graph.LinksMap.get(el.id)
                    : graph.NodesMap.get(el.id);
                return found ? [found] : [];
            });
            if (restored.length > 0) {
                setSelectedElements(restored);
                openDataPanel();
                return;
            }
        }

        if (selectedParam) {
            const parts = selectedParam.split(":");
            const type = parts[0];
            const id = Number(parts[1]);
            const isFromSearch = parts[2] === "s";

            if (!Number.isNaN(id)) {
                let element: Node | Link | undefined;
                if (type === "n") {
                    element = graph.NodesMap.get(id);
                } else if (type === "e") {
                    element = graph.LinksMap.get(id);
                }

                if (element) {
                    setSelectedElements([element]);
                    openDataPanel();
                    if (isFromSearch && !pendingZoomRef.current) {
                        const zoomFilter = (node: any) => "labels" in element! ? element!.id === node.id : node.id === (element as Link).source || node.id === (element as Link).target;
                        if (graphData) {
                            // Reroute: canvas restores cached positions, no animation.
                            // Skip viewport and apply search zoom directly.
                            setViewport(undefined);
                            setTimeout(() => canvasRef.current?.zoomToFit(4, zoomFilter), 100);
                        } else {
                            // Reload: canvas will run force simulation.
                            // Defer zoom until animation finishes.
                            pendingZoomRef.current = zoomFilter;
                        }
                    }
                    return;
                }
            }
        }

        handleSetSelectedElements();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [graph]);

    // Apply pending zoom once canvas animation finishes (isLoading goes false)
    useEffect(() => {
        if (isLoading || !pendingZoomRef.current) return;
        const filter = pendingZoomRef.current;
        pendingZoomRef.current = null;
        canvasRef.current?.zoomToFit(4, filter);
    }, [isLoading, canvasRef]);

    const handleSetIsAdd = useCallback((mainSetter: (isAdd: boolean) => void, setter: (isAdd: boolean) => void) => (isAdd: boolean) => {
        mainSetter(isAdd);

        if (isAdd) {
            setter(false);
            setPanel("add");
        } else {
            setPanel(undefined);
        }
    }, [setPanel]);

    const handleCreateElement = useCallback(async (attributes: [string, Value][], label: string[]) => {
        if (!canvasRef.current) return false;
        const startEpoch = getConnectionEpoch();
        const cid = getActiveConnectionIdGlobal();

        const fakeId = "-1";
        const readOnlyParam = isReadOnlyRef.current ? '?readOnly=true' : '';
        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/${fakeId}${readOnlyParam}`, {
            method: "POST",
            body: JSON.stringify({
                attributes,
                label,
                type: isAddNode,
                selectedNodes: isAddNode ? undefined : selectedElements
            })
        }, toast, setIndicator, cid);

        if (getConnectionEpoch() !== startEpoch) return false;
        if (result.ok) {
            const json = await result.json();
            if (getConnectionEpoch() !== startEpoch) return false;

            if (isAddNode) {
                const node = await graph.extendNode(json.result.data[0].n, false, true);

                if (node) {
                    setLabels(prev => [...prev, ...node.labels.filter(c => !prev.some(p => p.name === c)).map(c => graph.LabelsMap.get(c)!)]);
                    handleSetIsAdd(setIsAddNode, setIsAddEdge)(false);
                }
            } else {
                const link = await graph.extendEdge(json.result.data[0].e, false, true);

                if (link) {
                    setRelationships(prev => [...prev.filter(p => p.name !== link.relationship), graph.RelationshipsMap.get(link.relationship)!]);
                    handleSetIsAdd(setIsAddEdge, setIsAddNode)(false);
                }
            }

            fetchCount(graphName);

            setSelectedElements([]);
        }

        canvasRef.current?.setGraphData(convertToCanvasData(graph.Elements));

        return result.ok;
    }, [fetchCount, graph, graphName, handleSetIsAdd, isAddNode, selectedElements, canvasRef, setIndicator, setLabels, setRelationships, toast]);

    const handleDeleteElement = useCallback(async () => {
        if (!canvasRef.current) return;
        const startEpoch = getConnectionEpoch();
        const cid = getActiveConnectionIdGlobal();

        const deletedElements = (await Promise.all(selectedElements.map(async (element) => {
            const type = !('source' in element);
            const readOnlyParam = isReadOnlyRef.current ? '?readOnly=true' : '';
            const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${prepareArg(element.id.toString())}${readOnlyParam}`, {
                method: "DELETE",
                body: JSON.stringify({ type })
            }, toast, setIndicator, cid);

            if (!result.ok) return undefined;

            if (type) {
                (element as Node).labels.forEach((label) => {
                    const l = graph.LabelsMap.get(label);
                    if (l) {
                        l.elements = l.elements.filter((e) => e.id !== element.id);
                        if (l.elements.length === 0) {
                            const index = graph.Labels.findIndex(c => c.name === l.name);
                            if (index !== -1) {
                                graph.Labels.splice(index, 1);
                                graph.LabelsMap.delete(l.name);
                            }
                        }
                    }
                });
            } else {
                const relation = graph.RelationshipsMap.get((element as Link).relationship);
                if (relation) {
                    relation.elements = relation.elements.filter((e) => e.id !== element.id);
                    if (relation.elements.length === 0) {
                        const index = graph.Relationships.findIndex(l => l.name === relation.name);
                        if (index !== -1) {
                            graph.Relationships.splice(index, 1);
                            graph.RelationshipsMap.delete(relation.name);
                        }
                    }
                }
            }

            return element;
        }))).filter(e => !!e);

        if (getConnectionEpoch() !== startEpoch) return;

        graph.removeElements(deletedElements);

        setRelationships(graph.removeLinks(deletedElements.map((element) => element.id)));
        canvasRef.current.setGraphData(convertToCanvasData(graph.Elements));
        fetchCount(graphName);
        setSelectedElements([]);

        if (panel === "data") handleSetSelectedElements();
        else setSelectedElements([]);

        toast({
            title: "Success",
            description: `${deletedElements.length > 1 ? "Elements" : "Element"} deleted
            ${selectedElements.length > deletedElements.length ? `, ${selectedElements.length - deletedElements.length} failed` : ""}.`,
        });
    }, [selectedElements, graph, graphName, setRelationships, canvasRef, fetchCount, panel, handleSetSelectedElements, toast, setIndicator]);

    const getCurrentPanel = useCallback(() => {
        if (!graphName) return undefined;

        switch (panel) {
            case "data": {
                const selection = currentTab === "Schema" ? selectedSchemaElements : selectedElements;

                if (selection.length === 0) return undefined;

                return <DataPanel
                    object={selection[selection.length - 1]}
                    onClose={() => (currentTab === "Schema" ? setSelectedSchemaElements([]) : handleSetSelectedElements())}
                    setLabels={setLabels}
                    canvasRef={canvasRef}
                    schema={currentTab === "Schema"}
                    onDeleteElement={currentTab === "Schema" ? undefined : handleDeleteElement}
                />;
            }

            case "add": {
                const onCloseHandler = () => {
                    setPanel(undefined);
                    setIsAddEdge(false);
                    setIsAddNode(false);
                };

                if (isAddNode) {
                    return <CreateElementPanel
                        type
                        onCreate={handleCreateElement}
                        onClose={onCloseHandler}
                    />;
                }

                if (!isTwoNodes(selectedElements)) return undefined;

                return <CreateElementPanel
                    type={false}
                    onCreate={handleCreateElement}
                    onClose={onCloseHandler}
                    selectedNodes={selectedElements}
                    setSelectedNodes={setSelectedElements}
                />;
            }

            default:
                return undefined;
        }

    }, [graphName, panel, handleSetSelectedElements, setPanel, isAddNode, selectedElements, handleCreateElement, handleDeleteElement, setLabels, canvasRef, currentTab, selectedSchemaElements, setSelectedSchemaElements]);

    // Closing the mobile sheet has to do what the panel's own close button does,
    // since the sheet header owns the only visible close affordance there.
    const closeCurrentPanel = useCallback(() => {
        if (panel === "add") {
            setPanel(undefined);
            setIsAddEdge(false);
            setIsAddNode(false);
            return;
        }

        if (currentTab === "Schema") {
            setSelectedSchemaElements([]);
        } else {
            handleSetSelectedElements();
        }
    }, [panel, setPanel, currentTab, setSelectedSchemaElements, handleSetSelectedElements]);

    const selectorNode = (
        <Selector
            graph={graph}
            options={graphNames ?? []}
            setOptions={next => setGraphNames(prev => (
                typeof next === "function"
                    ? next(prev ?? [])
                    : next
            ))}
            graphName={graphName}
            setGraphName={handleSetGraphName}
            setGraph={setGraph}
            runQuery={runQuery}
            historyQuery={historyQuery}
            setHistoryQuery={setHistoryQuery}
            isQueryLoading={isQueryLoading}
            chatOpen={chatOpen}
            setChatOpen={setChatOpen}
            queriesOpen={queriesOpen}
            setQueriesOpen={setQueriesOpen}
        />
    );

    const graphViewNode = (
        <GraphView
            selectedElements={selectedElements}
            setSelectedElements={handleSetSelectedElements}
            multiSelect={multiSelect}
            setMultiSelect={setMultiSelect}
            selectedSchemaElements={selectedSchemaElements}
            setSelectedSchemaElements={setSelectedSchemaElements}
            canvasRef={canvasRef}
            handleDeleteElement={handleDeleteElement}
            setLabels={setLabels}
            setRelationships={setRelationships}
            labels={labels}
            relationships={relationships}
            fetchCount={fetchCount}
            historyQuery={historyQuery}
            setHistoryQuery={setHistoryQuery}
            setIsAddNode={handleSetIsAdd(setIsAddNode, setIsAddEdge)}
            setIsAddEdge={handleSetIsAdd(setIsAddEdge, setIsAddNode)}
            isAddEdge={isAddEdge}
            isAddNode={isAddNode}
        />
    );

    const graphInfoNode = (
        <GraphInfoPanel
            onClose={onTogglePanel}
            customizingLabel={customizingLabel}
            setCustomizingLabel={setCustomizingLabel}
        />
    );

    if (isMobile) {
        return (
            <div className="h-full w-full flex flex-col min-h-0">
                <GraphSubHeader />
                <div className="h-1 grow min-h-0 flex flex-col gap-1 p-1">
                    {selectorNode}
                    {/* The sheets are absolute inside this box, so they cover only the
                        graph — the header and navigation above stay visible, which is
                        what makes the data read as nested inside the graph context.
                        They stack rather than replace one another, newest on top. */}
                    <div className="h-1 grow min-h-0 relative overflow-hidden">
                        {graphViewNode}
                        {/* No sheet title: the info panel renders its own header and
                            close button, and it needs the height for its grid rows. */}
                        <BottomSheet
                            open={panelOpen}
                            onClose={onTogglePanel}
                            height="full"
                            zIndex={sheetZ("info")}
                            data-testid="mobileGraphInfoSheet"
                        >
                            {graphInfoNode}
                        </BottomSheet>
                        {/* No sheet title: DataPanel and CreateElementPanel both render
                            their own header and close button. */}
                        <BottomSheet
                            open={hasPanelContent}
                            onClose={closeCurrentPanel}
                            height="full"
                            zIndex={sheetZ("data")}
                            data-testid="mobileDataSheet"
                        >
                            {getCurrentPanel()}
                        </BottomSheet>
                        {/* No sheet title: Chat renders its own header and close button. */}
                        <BottomSheet
                            open={chatSheetOpen}
                            onClose={() => setChatOpen(false)}
                            height="full"
                            zIndex={sheetZ("chat")}
                            data-testid="mobileChatSheet"
                        >
                            {graphName ? <Chat onClose={() => setChatOpen(false)} /> : null}
                        </BottomSheet>
                    </div>
                </div>
                <div className="h-4 w-full Gradient" />
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col min-h-0">
            <GraphSubHeader />
            <ResizablePanelGroup orientation="horizontal" className="h-1 grow">
                <ResizablePanel
                    panelRef={infoPanelRef}
                    defaultSize="0%"
                    collapsible
                    minSize="15%"
                    maxSize="30%"
                    onResize={onInfoPanelResize}
                >
                    {graphInfoNode}
                </ResizablePanel>
                <ResizableHandle
                    withHandle
                    onMouseUp={() => !panelOpen && onTogglePanel()}
                    className={cn("bg-border", !panelOpen && "hidden")}
                    disabled={!panelOpen}
                />
                <ResizablePanel
                    defaultSize="100%"
                    minSize="70%"
                    maxSize="100%"
                >
                    <div className="h-full w-full flex flex-col">
                        <div className="Page p-3 gap-3">
                            {selectorNode}
                            <ResizablePanelGroup orientation="horizontal" className="h-1 grow relative">
                                <ResizablePanel
                                    defaultSize="100%"
                                    collapsible
                                    minSize="30%"
                                >
                                    {graphViewNode}
                                </ResizablePanel>
                                <ResizableHandle
                                    withHandle
                                    onMouseUp={() => isCollapsed && handleSetSelectedElements()}
                                    className={cn("bg-transparent", isCollapsed && "hidden")}
                                    disabled={isCollapsed}
                                />
                                <ResizablePanel
                                    panelRef={panelRef}
                                    collapsible
                                    defaultSize="0%"
                                    minSize={panelMinSize}
                                    onResize={onPanelResize}
                                >
                                    {getCurrentPanel()}
                                </ResizablePanel>
                                {
                                    chatOpen && graphName &&
                                    <div className="absolute bottom-2 right-3 z-30">
                                        <ResizableBox
                                            width={chatSize.width}
                                            height={chatSize.height}
                                            minWidth={300}
                                            minHeight={300}
                                            onResizeEnd={(w, h) => onChatResize(w, h)}
                                            direction="top-left"
                                        >
                                            <Chat onClose={() => setChatOpen(false)} />
                                        </ResizableBox>
                                    </div>
                                }
                            </ResizablePanelGroup>
                        </div>
                        <div className="h-4 w-full Gradient" />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}