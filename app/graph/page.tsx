'use client'

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn, prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import { ForceGraphMethods } from "react-force-graph-2d";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { Label, Graph, GraphData, Link, Node, Relationship, GraphInfo } from "../api/graph/model";
import Tutorial from "./Tutorial";
import { GraphContext, HistoryQueryContext, IndicatorContext, PanelContext, QuerySettingsContext } from "../components/provider";
import Spinning from "../components/ui/spinning";
import GraphInfoPanel from "./graphInfo";
import Chat from "./Chat";
import GraphDataPanel from "./GraphDataPanel";

const Selector = dynamic(() => import("./Selector"), {
    ssr: false,
    loading: () => <div className="h-[50px] flex flex-row gap-4 items-center">
        <div className="w-[230px] h-full animate-pulse rounded-md border border-gray-300 bg-background" />
        <div className="w-1 grow h-full animate-pulse rounded-md border border-gray-300 bg-background" />
        <div className="w-[120px] h-full animate-pulse rounded-md border border-gray-300 bg-background" />
    </div>
})
const GraphView = dynamic(() => import("./GraphView"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-background flex justify-center items-center border rounded-lg">
        <Spinning />
    </div>
})

export default function Page() {
    const { historyQuery, setHistoryQuery } = useContext(HistoryQueryContext)
    const { setIndicator } = useContext(IndicatorContext);
    const { panel, setPanel } = useContext(PanelContext)
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
        isLoading,
        handleCooldown,
        cooldownTicks,
    } = useContext(GraphContext)

    const {
        settings: {
            runDefaultQuerySettings: { runDefaultQuery },
            defaultQuerySettings: { defaultQuery },
            contentPersistenceSettings: { contentPersistence },
        }
    } = useContext(QuerySettingsContext)
    const { toast } = useToast()

    const chartRef = useRef<ForceGraphMethods<Node, Link>>()
    const panelRef = useRef<ImperativePanelHandle>(null)

    const [isQueryLoading, setIsQueryLoading] = useState(true)
    const [selectedElement, setSelectedElement] = useState<Node | Link | undefined>()
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([])
    const [labels, setLabels] = useState<Label[]>([])
    const [data, setData] = useState<GraphData>({ ...graph.Elements })
    const [relationships, setRelationships] = useState<Relationship[]>([])
    const [isCollapsed, setIsCollapsed] = useState(false)

    const [panelSize, graphSize] = useMemo(() => {
        switch (panel) {
            case "data":
            case "graphInfo":
                return [30, 70]
            case "chat":
                return [40, 60]
            default:
                return [0, 100]
        }
    }, [panel])

    useEffect(() => {
        const currentPanel = panelRef.current
        if (!currentPanel) return
        if (panel) currentPanel.expand()
        else currentPanel.collapse()
    }, [panel])

    useEffect(() => {
        if ((!graphName && panel === "graphInfo") || (!selectedElement && panel === "data")) setPanel(undefined)
    }, [selectedElement, setPanel, graphName, panel])

    useEffect(() => {
        if (graphName) setPanel("graphInfo")
    }, [graphName, setPanel])

    useEffect(() => {
        if (selectedElement) setPanel("data")
    }, [selectedElement, setPanel])

    const fetchInfo = useCallback(async (type: string) => {
        if (!graphName) return []

        const result = await securedFetch(`/api/graph/${graphName}/info?type=${type}`, {
            method: "GET",
        }, toast, setIndicator);

        if (!result.ok) return []

        const json = await result.json();

        return json.result.data.map(({ info }: { info: string }) => info);
    }, [graphName, setIndicator, toast]);

    useEffect(() => {
        if (!graphName) return

        Promise.all([
            fetchInfo("(label)"),
            fetchInfo("(relationship type)"),
            fetchInfo("(property key)"),
        ]).then(async ([newLabels, newRelationships, newPropertyKeys]) => {
            const colorsArr = localStorage.getItem(graphName)
            const gi = GraphInfo.create(newPropertyKeys, newLabels, newRelationships, colorsArr ? JSON.parse(colorsArr) : undefined)
            setGraphInfo(gi)
        }).catch((error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to fetch graph info",
                variant: "destructive",
            })
        });
    }, [fetchInfo, setGraphInfo, toast, setIndicator, graphName])

    useEffect(() => {
        setRelationships([...graph.Relationships])
        setLabels([...graph.Labels])
    }, [graph, graph.Labels.length, graph.Relationships.length, graph.Labels, graph.Relationships])

    useEffect(() => {
        if (!graphInfo) return

        if (contentPersistence) {
            const content = localStorage.getItem("savedContent")

            if (content) {
                const { graphName: name, query } = JSON.parse(content)

                if (!graph.Id && !graphName && graphNames.includes(name) && contentPersistence) {
                    setGraphName(name)
                    runQuery(query, name)
                    return
                }
            }
        }

        if (graphName && graphName !== graph.Id) {
            if (runDefaultQuery) {
                runQuery(defaultQuery)
                return
            }

            setGraph(Graph.empty(graphName))
            fetchCount()
        }

        setIsQueryLoading(false)
    }, [fetchCount, graph.Id, graphName, setGraph, runDefaultQuery, defaultQuery, contentPersistence, setGraphName, graphNames, graphInfo])

    const handleDeleteElement = useCallback(async () => {
        if (selectedElements.length === 0 && selectedElement) {
            selectedElements.push(selectedElement)
            setSelectedElement(undefined)
        }

        await Promise.all(selectedElements.map(async (element) => {
            const type = !("source" in element)
            const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${prepareArg(element.id.toString())}`, {
                method: "DELETE",
                body: JSON.stringify({ type })
            }, toast, setIndicator)

            if (!result.ok) return

            if (type) {
                (element as Node).labels.forEach((label) => {
                    const l = graph.LabelsMap.get(label)
                    if (l) {
                        l.elements = l.elements.filter((e) => e.id !== element.id)
                        if (l.elements.length === 0) {
                            const index = graph.Labels.findIndex(c => c.name === l.name)
                            if (index !== -1) {
                                graph.Labels.splice(index, 1)
                                graph.LabelsMap.delete(l.name)
                            }
                        }
                    }
                })
            } else {
                const relation = graph.RelationshipsMap.get((element as Link).relationship)
                if (relation) {
                    relation.elements = relation.elements.filter((e) => e.id !== element.id)
                    if (relation.elements.length === 0) {
                        const index = graph.Relationships.findIndex(l => l.name === relation.name)
                        if (index !== -1) {
                            graph.Relationships.splice(index, 1)
                            graph.RelationshipsMap.delete(relation.name)
                        }
                    }
                }
            }
        }))

        graph.removeElements(selectedElements)

        fetchCount()
        setSelectedElements([])
        setSelectedElement(undefined)

        setRelationships(graph.removeLinks(selectedElements.map((element) => element.id)))

        setData({ ...graph.Elements })
        toast({
            title: "Success",
            description: `${selectedElements.length > 1 ? "Elements" : "Element"} deleted`,
        })
        setSelectedElement(undefined)
        setSelectedElements([])
    }, [selectedElements, selectedElement, graph, fetchCount, toast, setIndicator])

    const handleClosePanel = useCallback(() => {
        setPanel(undefined)
    }, [setPanel])

    const getCurrentPanel = useCallback(() => {
        if (!graphName) return undefined

        switch (panel) {
            case "graphInfo":
                return (
                    <GraphInfoPanel
                        onClose={handleClosePanel}
                    />
                )
            case "chat":
                return (
                    <Chat
                        onClose={handleClosePanel}
                    />
                )
            case "data":
                return selectedElement && <GraphDataPanel
                    object={selectedElement}
                    setObject={setSelectedElement}
                    onDeleteElement={handleDeleteElement}
                    setLabels={setLabels}
                />
            default:
                return undefined
        }
    }, [graphName, selectedElement, handleDeleteElement, panel, handleClosePanel])

    return (
        <div className="Page p-8 gap-8">
            <Selector
                graph={graph}
                options={graphNames}
                setOptions={setGraphNames}
                graphName={graphName}
                setGraphName={setGraphName}
                runQuery={runQuery}
                historyQuery={historyQuery}
                setHistoryQuery={setHistoryQuery}
                selectedElements={selectedElements}
                setSelectedElement={setSelectedElement}
                handleDeleteElement={handleDeleteElement}
                chartRef={chartRef}
                setGraph={setGraph}
                fetchCount={fetchCount}
                isQueryLoading={isQueryLoading}
            />
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={graphSize} minSize={50} maxSize={100}>
                    <GraphView
                        selectedElement={selectedElement}
                        setSelectedElement={setSelectedElement}
                        selectedElements={selectedElements}
                        setSelectedElements={setSelectedElements}
                        chartRef={chartRef}
                        data={data}
                        setData={setData}
                        handleDeleteElement={handleDeleteElement}
                        setLabels={setLabels}
                        setRelationships={setRelationships}
                        labels={labels}
                        relationships={relationships}
                        isLoading={isLoading}
                        handleCooldown={handleCooldown}
                        cooldownTicks={cooldownTicks}
                        fetchCount={fetchCount}
                        historyQuery={historyQuery}
                        setHistoryQuery={setHistoryQuery}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle onMouseUp={() => isCollapsed && handleClosePanel()} className={cn("ml-6 w-2", isCollapsed && "hidden")} />
                <ResizablePanel
                    ref={panelRef}
                    collapsible
                    defaultSize={panelSize}
                    minSize={25}
                    maxSize={50}
                    onCollapse={() => {
                        setIsCollapsed(true)
                    }}
                    onExpand={() => {
                        setIsCollapsed(false)
                    }}
                >
                    {getCurrentPanel()}
                </ResizablePanel>
            </ResizablePanelGroup>
            <Tutorial />
        </div >
    )
}