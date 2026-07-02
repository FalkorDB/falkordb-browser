'use client';

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn, convertToCanvasData, getMemoryUsage, getMetaStats, isTwoNodes, Link, MemoryValue, Node, prepareArg, securedFetch, Value } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamicImport from "next/dynamic";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { PanelImperativeHandle, PanelSize } from "react-resizable-panels";
import { Graph, GraphInfo } from "../api/graph/model";
import { BrowserSettingsContext, GraphContext, HistoryQueryContext, IndicatorContext, PanelContext, QueryLoadingContext, ForceGraphContext, ConnectionContext } from "../components/provider";
import Spinning from "../components/ui/spinning";
import Chat from "./Chat";
import ResizableBox from "@/components/ui/ResizableBox";
import { useResizableSize } from "@/lib/useResizableSize";

const DataPanel = dynamicImport(() => import("./DataPanel"), {
    ssr: false,
});

const CreateElementPanel = dynamicImport(() => import("./CreateElementPanel"), {
    ssr: false,
});

const Selector = dynamicImport(() => import("./Selector"), {
    ssr: false,
    loading: () => <div className="h-[50px] flex flex-row gap-3 items-center">
        <div className="w-[44px] h-full animate-pulse rounded-lg border border-border bg-background" />
        <div className="w-1 grow h-full animate-pulse rounded-md border border-border bg-background" />
        <div className="w-[120px] h-full animate-pulse rounded-md border border-border bg-background" />
    </div>
});
const GraphView = dynamicImport(() => import("./GraphView"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-background flex justify-center items-center border border-border rounded-lg">
        <Spinning />
    </div>
});

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
    const { panel, setPanel } = useContext(PanelContext);
    const { tutorialOpen } = useContext(BrowserSettingsContext);
    const { isQueryLoading, setIsQueryLoading } = useContext(QueryLoadingContext);
    const { canvasRef, graphData, setViewport } = useContext(ForceGraphContext);
    const { isReadOnly, activeConnectionId } = useContext(ConnectionContext);
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
        initialQuery,
        currentTab,
    } = useContext(GraphContext);
    const {
        settings: {
            runDefaultQuerySettings: { runDefaultQuery },
            defaultQuerySettings: { defaultQuery },
            graphInfo: { showMemoryUsage, refreshInterval }
        }
    } = useContext(BrowserSettingsContext);
    const { toast } = useToast();

    const panelRef = useRef<PanelImperativeHandle>(null);
    const pendingZoomRef = useRef<((node: any) => boolean) | null>(null);
    // Track the previous graphName to distinguish "graph just changed" re-fires
    // (where runQuery handles the initial fetch) from other dep changes like
    // showMemoryUsage becoming true (where we must fetch immediately).
    const prevGraphNameRef = useRef<string | undefined>(undefined);

    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([]);
    const [chatOpen, setChatOpen] = useState(false);
    const { size: chatSize, onResize: onChatResize } = useResizableSize("chat-size", 400, 500, 300, 300);
    const [queriesOpen, setQueriesOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isAddNode, setIsAddNode] = useState(false);
    const [isAddEdge, setIsAddEdge] = useState(false);
    const initialUrlQueryRef = useRef(initialQuery);
    // Tracks whether a URL query has been dispatched but hasn't completed yet.
    // Prevents the default query from firing when `runDefaultQuery` state
    // changes (loaded from localStorage) before the async URL query finishes.
    const urlQueryFiredRef = useRef<string | null>(null);

    const onPanelResize = useCallback((size: PanelSize) => {
        setIsCollapsed(size.asPercentage === 0);
        if (size.asPercentage > 0 && panel) {
            localStorage.setItem(`panel-size-${panel}`, JSON.stringify(size.asPercentage));
        }
    }, [panel]);

    const panelSizes: Record<string, { size: string; min: string }> = useMemo(() => ({
        data: { size: "200px", min: "200px" },
        add: { size: "30%", min: "25%" },
    }), []);

    const getPanelSize = useCallback(() => {
        if (!panel) return "0%";
        const stored = localStorage.getItem(`panel-size-${panel}`);
        if (stored) {
            return `${JSON.parse(stored)}%`;
        }
        return panelSizes[panel]?.size ?? "0%";
    }, [panel, panelSizes]);

    const panelMinSize = useMemo(() => {
        if (!panel) return "0%";
        return panelSizes[panel]?.min ?? "0%";
    }, [panel, panelSizes]);

    useEffect(() => {
        const currentPanel = panelRef.current;

        if (!currentPanel) return;

        if (panel) {
            currentPanel.expand();
            // Defer resize to next frame so the panel processes the updated minSize prop first
            const frameId = requestAnimationFrame(() => {
                currentPanel.resize(getPanelSize());
            });

            return () => cancelAnimationFrame(frameId);
        }
        currentPanel.collapse();

    }, [getPanelSize, panel]);

    useEffect(() => {
        const currentPanel = panelRef.current;

        if (!currentPanel) return;

        if (currentTab === "Graph") {
            if (selectedElements.length !== 0) {
                currentPanel.expand();
                if (panel === undefined) setPanel("data");
            }
        } else if (panel === "data") {
            currentPanel.collapse();
        }
    }, [currentTab, panel, selectedElements.length, setPanel]);

    const fetchInfo = useCallback(async (type: string) => {
        if (!graphName) return [];

        const readOnlyParam = isReadOnlyRef.current ? '&readOnly=true' : '';
        const result = await securedFetch(`/api/graph/${graphName}/info?type=${type}${readOnlyParam}`, {
            method: "GET",
        }, toast, setIndicator);

        if (!result.ok) return [];

        const json = await result.json();

        return json.result.data.map(({ info }: { info: string }) => info);
    }, [graphName, setIndicator, toast]);

    const fetchMetaStats = useCallback((name: string) => getMetaStats(name, toast, setIndicator, isReadOnlyRef.current), [setIndicator, toast]);

    useEffect(() => {
        if (!graphName) {
            prevGraphNameRef.current = graphName;
            return undefined;
        }

        const graphNameJustChanged = prevGraphNameRef.current !== graphName;
        prevGraphNameRef.current = graphName;

        const handleSetInfo = () => Promise.all([
            fetchMetaStats(graphName),
            fetchInfo("(property key)"),
        ]).then(async ([newDataStats, newPropertyKeys]) => {
            const memoryUsage = showMemoryUsage ? await getMemoryUsage(graphName, toast, setIndicator, activeConnectionId) : new Map<string, MemoryValue>();
            const newLabels = newDataStats?.[0] || [];
            const newRelationships = newDataStats?.[1] || [];

            const gi = await GraphInfo.create(newPropertyKeys, newLabels, newRelationships, memoryUsage, toast, setIndicator);
            setGraphInfo(gi);
            fetchCount(graphName);
        }).catch((error) => {
            toast({
                title: "Error",
                description: (error as Error).message || "Failed to fetch graph info",
                variant: "destructive",
            });
        });

        // When runDefaultQuery is enabled and the graph name just changed, the
        // graph-setup effect below will call runQuery which already fetches
        // info/stats (including memory) internally — skip here to avoid
        // duplicating that initial fetch.
        // For any other dep change (e.g. showMemoryUsage becoming true after a
        // connection switch to admin, or refreshInterval changing), always call
        // immediately so memory appears without waiting for the next interval.
        if (!runDefaultQuery || !graphNameJustChanged) {
            handleSetInfo();
        }

        const interval = setInterval(handleSetInfo, refreshInterval * 1000);

        return () => {
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchCount, fetchInfo, fetchMetaStats, graphName, refreshInterval, runDefaultQuery, setGraphInfo, setIndicator, showMemoryUsage, toast]);

    useEffect(() => {
        if (graphName) return;

        panelRef.current?.collapse();
    }, [graphName]);

    useEffect(() => {
        // Priority 1: URL params (graph + query)
        const pendingUrlQuery = initialUrlQueryRef.current;
        if (pendingUrlQuery && graphName) {
            if (graphName !== graph.Id) {
                initialUrlQueryRef.current = "";
                urlQueryFiredRef.current = graphName;
                runQuery(pendingUrlQuery, graphName);
            } else {
                // Data is already loaded for this graph (e.g. navigating back from
                // another route while providers stay mounted). Clear the pending ref
                // so it doesn't re-fire on later dep changes.
                initialUrlQueryRef.current = "";
            }
            return;
        }

        // If the URL query was dispatched but hasn't completed yet (graph.Id
        // not yet updated by the async runQuery), skip the default-query path
        // so it doesn't overwrite the in-flight URL query result.
        if (urlQueryFiredRef.current) {
            if (graphName === graph.Id) {
                urlQueryFiredRef.current = null;
            } else if (graphName !== urlQueryFiredRef.current) {
                // Different graph selected — clear the stale latch
                urlQueryFiredRef.current = null;
            } else {
                return;
            }
        }

        // Priority 2: Default query / empty graph
        if (graphName && graphName !== graph.Id) {
            if (runDefaultQuery && !tutorialOpen) {
                runQuery(defaultQuery, graphName);
                return;
            }

            setGraph(Graph.empty(graphName));
            fetchCount(graphName);
        }

        setIsQueryLoading(false);
    }, [fetchCount, graph.Id, graphName, setGraph, runDefaultQuery, defaultQuery, setIsQueryLoading, tutorialOpen]);

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

        setPanel(el.length !== 0 ? "data" : undefined);

        if (el.length !== 0) {
            setChatOpen(false);
            setIsAddEdge(false);
            setIsAddNode(false);
        }
    }, [setPanel, setChatOpen, setSelectedParam]);

    // Restore selected element from context when graph data loads, otherwise clear selection
    useEffect(() => {
        if (!graph.Id) return;
        if (graph.NodesMap.size === 0 && graph.LinksMap.size === 0) return;

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
                    setPanel("data");
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
        }, toast, setIndicator);

        if (result.ok) {
            const json = await result.json();

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

        const deletedElements = (await Promise.all(selectedElements.map(async (element) => {
            const type = !('source' in element);
            const readOnlyParam = isReadOnlyRef.current ? '?readOnly=true' : '';
            const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${prepareArg(element.id.toString())}${readOnlyParam}`, {
                method: "DELETE",
                body: JSON.stringify({ type })
            }, toast, setIndicator);

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
    }, [selectedElements, graph, setRelationships, canvasRef, fetchCount, panel, handleSetSelectedElements, toast, setIndicator]);

    const getCurrentPanel = useCallback(() => {
        if (!graphName) return undefined;

        switch (panel) {
            case "data":

                if (selectedElements.length === 0) return undefined;

                return <DataPanel
                    object={selectedElements[selectedElements.length - 1]}
                    onClose={() => handleSetSelectedElements()}
                    setLabels={setLabels}
                    canvasRef={canvasRef}
                />;

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

    }, [graphName, panel, handleSetSelectedElements, setPanel, isAddNode, selectedElements, handleCreateElement, setLabels, canvasRef]);

    return (
        <div className="Page p-3 gap-3">
            <Selector
                graph={graph}
                options={graphNames}
                setOptions={setGraphNames}
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
            <ResizablePanelGroup orientation="horizontal" className="h-1 grow relative">
                <ResizablePanel
                    defaultSize="100%"
                    collapsible
                    minSize="30%"
                >
                    <GraphView
                        selectedElements={selectedElements}
                        setSelectedElements={handleSetSelectedElements}
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
                    <div className="absolute bottom-3 right-3 z-30">
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
    );
}