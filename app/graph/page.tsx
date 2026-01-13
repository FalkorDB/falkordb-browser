'use client';

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn, getMemoryUsage, isTwoNodes, prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamicImport from "next/dynamic";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { Label, Graph, Link, Node, Relationship, GraphInfo, Value, MemoryValue } from "../api/graph/model";
import { BrowserSettingsContext, GraphContext, HistoryQueryContext, IndicatorContext, PanelContext, QueryLoadingContext, ForceGraphContext } from "../components/provider";
import Spinning from "../components/ui/spinning";
import Chat from "./Chat";

const DataPanel = dynamicImport(() => import("./DataPanel"), {
    ssr: false,
});

const CreateElementPanel = dynamicImport(() => import("./CreateElementPanel"), {
    ssr: false,
});

const Selector = dynamicImport(() => import("./Selector"), {
    ssr: false,
    loading: () => <div className="h-[50px] flex flex-row gap-4 items-center">
        <div className="w-[230px] h-full animate-pulse rounded-md border border-border bg-background" />
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
    const { isQueryLoading, setIsQueryLoading } = useContext(QueryLoadingContext);
    const { setData, canvasRef } = useContext(ForceGraphContext);
    const {
        graph,
        setGraph,
        graphInfo,
        setGraphInfo,
        graphName,
        setGraphName,
        graphNames,
        setGraphNames,
        runQuery,
        fetchCount,
        handleCooldown,
        cooldownTicks,
    } = useContext(GraphContext);
    const {
        settings: {
            runDefaultQuerySettings: { runDefaultQuery },
            defaultQuerySettings: { defaultQuery },
            contentPersistenceSettings: { contentPersistence },
            graphInfo: { showMemoryUsage, refreshInterval }
        }
    } = useContext(BrowserSettingsContext);
    const { toast } = useToast();

    const panelRef = useRef<ImperativePanelHandle>(null);

    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([]);
    const [labels, setLabels] = useState<Label[]>([]);
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isAddNode, setIsAddNode] = useState(false);
    const [isAddEdge, setIsAddEdge] = useState(false);

    const panelSize = useMemo(() => {
        switch (panel) {
            case "data":
            case "add":
                return 30;
            case "chat":
                return 40;
            default:
                return 0;
        }
    }, [panel]);

    useEffect(() => {
        const currentPanel = panelRef.current;

        if (!currentPanel) return;

        if (panel) currentPanel.expand();
        else currentPanel.collapse();

        if (panel !== "chat") return;

        setSelectedElements([]);
        setIsAddNode(false);
        setIsAddEdge(false);
    }, [panel]);

    const fetchInfo = useCallback(async (type: string) => {
        if (!graphName) return [];

        const result = await securedFetch(`/api/graph/${graphName}/info?type=${type}`, {
            method: "GET",
        }, toast, setIndicator);

        if (!result.ok) return [];

        const json = await result.json();

        return json.result.data.map(({ info }: { info: string }) => info);
    }, [graphName, setIndicator, toast]);

    useEffect(() => {
        if (!graphName) return undefined;

        const handleSetInfo = () => Promise.all([
            fetchInfo("(label)"),
            fetchInfo("(relationship type)"),
            fetchInfo("(property key)"),
        ]).then(async ([newLabels, newRelationships, newPropertyKeys]) => {
            const memoryUsage = showMemoryUsage ? await getMemoryUsage(graphName, toast, setIndicator) : new Map<string, MemoryValue>();
            const gi = GraphInfo.create(newPropertyKeys, newLabels, newRelationships, memoryUsage);
            setGraphInfo(gi);
            fetchCount();
        }).catch((error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to fetch graph info",
                variant: "destructive",
            });
        });

        handleSetInfo();

        const interval = setInterval(handleSetInfo, refreshInterval * 1000);

        return () => {
            clearInterval(interval);
        };
    }, [fetchCount, fetchInfo, graphName, refreshInterval, setGraphInfo, setIndicator, showMemoryUsage, toast]);

    useEffect(() => {
        setRelationships([...graph.Relationships]);
        setLabels([...graph.Labels]);
    }, [graph, graph.Labels.length, graph.Relationships.length, graph.Labels, graph.Relationships]);

    useEffect(() => {
        if (!graphInfo) return;

        if (contentPersistence) {
            const content = localStorage.getItem("savedContent");

            if (content) {
                const { graphName: name, query } = JSON.parse(content);

                if (!graph.Id && !graphName && graphNames.includes(name) && contentPersistence) {
                    setGraphName(name);
                    runQuery(query, name);
                    return;
                }
            }
        }

        if (graphName && graphName !== graph.Id) {
            if (runDefaultQuery) {
                runQuery(defaultQuery);
                return;
            }

            setGraph(Graph.empty(graphName));
            fetchCount();
        }

        setIsQueryLoading(false);
    }, [fetchCount, graph.Id, graphName, setGraph, runDefaultQuery, defaultQuery, contentPersistence, setGraphName, graphNames, setIsQueryLoading, graphInfo, runQuery]);

    const handleSetSelectedElements = useCallback((el: (Node | Link)[] = []) => {
        setSelectedElements(el);

        if (el.length !== 0) {
            setPanel("data");
            setIsAddEdge(false);
            setIsAddNode(false);
        } else {
            setPanel(undefined);
        }
    }, [setPanel]);

    useEffect(() => {
        handleSetSelectedElements();
    }, [graph, handleSetSelectedElements]);

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
        const fakeId = "-1";
        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/${fakeId}`, {
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
                const { labels: ls } = graph.extendNode(json.result.data[0].n, false, false, true);
                setLabels(prev => [...prev, ...ls.filter(c => !prev.some(p => p.name === c)).map(c => graph.LabelsMap.get(c)!)]);
                handleSetIsAdd(setIsAddNode, setIsAddEdge)(false);
            } else {
                const link = graph.extendEdge(json.result.data[0].e, false, false, true);
                setRelationships(prev => [...prev.filter(p => p.name !== link.relationship), graph.RelationshipsMap.get(link.relationship)!]);
                handleSetIsAdd(setIsAddEdge, setIsAddNode)(false);
            }

            fetchCount();

            setSelectedElements([]);
        }

        setData({ ...graph.Elements });

        return result.ok;
    }, [fetchCount, graph, graphName, handleSetIsAdd, isAddNode, selectedElements, setData, setIndicator, toast]);

    const handleDeleteElement = useCallback(async () => {
        await Promise.all(selectedElements.map(async (element) => {
            const type = !("source" in element);
            const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${prepareArg(element.id.toString())}`, {
                method: "DELETE",
                body: JSON.stringify({ type })
            }, toast, setIndicator);

            if (!result.ok) return;

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
        }));

        graph.removeElements(selectedElements);

        setRelationships(graph.removeLinks(selectedElements.map((element) => element.id)));
        setData({ ...graph.Elements });
        fetchCount();
        setSelectedElements([]);

        if (panel === "data") handleSetSelectedElements();
        else setSelectedElements([]);

        toast({
            title: "Success",
            description: `${selectedElements.length > 1 ? "Elements" : "Element"} deleted`,
        });
    }, [selectedElements, graph, setData, fetchCount, panel, handleSetSelectedElements, toast, setIndicator]);

    const getCurrentPanel = useCallback(() => {
        if (!graphName) return undefined;

        switch (panel) {
            case "chat":
                return (
                    <Chat
                        onClose={() => setPanel(undefined)}
                    />
                );

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
    }, [graphName, panel, handleSetSelectedElements, setPanel, isAddNode, selectedElements, handleCreateElement]);

    return (
        <div className="Page p-2 gap-2">
            <Selector
                type="Graph"
                graph={graph}
                options={graphNames}
                setOptions={setGraphNames}
                graphName={graphName}
                setGraphName={setGraphName}
                setGraph={setGraph}
                runQuery={runQuery}
                historyQuery={historyQuery}
                setHistoryQuery={setHistoryQuery}
                fetchCount={fetchCount}
                isQueryLoading={isQueryLoading}
            />
            <ResizablePanelGroup direction="horizontal" className="h-1 grow">
                <ResizablePanel
                    defaultSize={100 - panelSize}
                    collapsible
                    minSize={30}
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
                        handleCooldown={handleCooldown}
                        cooldownTicks={cooldownTicks}
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
                    className={cn("ml-6 w-0", isCollapsed && "hidden")}
                />
                <ResizablePanel
                    ref={panelRef}
                    collapsible
                    defaultSize={panelSize}
                    minSize={30}
                    onCollapse={() => {
                        setIsCollapsed(true);
                    }}
                    onExpand={() => {
                        setIsCollapsed(false);
                    }}
                >
                    {getCurrentPanel()}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div >
    );
}