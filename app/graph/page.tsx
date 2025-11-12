'use client'

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn, prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import { ForceGraphMethods } from "react-force-graph-2d";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { Label, Graph, Link, Node, Relationship, GraphInfo } from "../api/graph/model";
import { BrowserSettingsContext, GraphContext, HistoryQueryContext, IndicatorContext, PanelContext, QueryLoadingContext, ViewportContext } from "../components/provider";
import Spinning from "../components/ui/spinning";
import Chat from "./Chat";
import GraphDataPanel from "./GraphDataPanel";

const Selector = dynamic(() => import("./Selector"), {
    ssr: false,
    loading: () => <div className="h-[50px] flex flex-row gap-4 items-center">
        <div className="w-[230px] h-full animate-pulse rounded-md border border-border bg-background" />
        <div className="w-1 grow h-full animate-pulse rounded-md border border-border bg-background" />
        <div className="w-[120px] h-full animate-pulse rounded-md border border-border bg-background" />
    </div>
})
const GraphView = dynamic(() => import("./GraphView"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-background flex justify-center items-center border border-border rounded-lg">
        <Spinning />
    </div>
})

export default function Page() {
    const { historyQuery, setHistoryQuery } = useContext(HistoryQueryContext)
    const { setIndicator } = useContext(IndicatorContext);
    const { panel, setPanel } = useContext(PanelContext)
    const { isQueryLoading, setIsQueryLoading } = useContext(QueryLoadingContext)
    const { setData } = useContext(ViewportContext)
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
            graphInfo: { refreshInterval }
        }
    } = useContext(BrowserSettingsContext)
    const { toast } = useToast()

    const chartRef = useRef<ForceGraphMethods<Node, Link>>()
    const panelRef = useRef<ImperativePanelHandle>(null)

    const [selectedElement, setSelectedElement] = useState<Node | Link | undefined>()
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([])
    const [labels, setLabels] = useState<Label[]>([])
    const [relationships, setRelationships] = useState<Relationship[]>([])
    const [isCollapsed, setIsCollapsed] = useState(true)
    const [isAddNode, setIsAddNode] = useState(true)
    const [isAddEdge, setIsAddEdge] = useState(true)

    const panelSize = useMemo(() => {
        switch (panel) {
            case "data":
                return 30
            case "chat":
                return 40
            default:
                return 0
        }
    }, [panel])

    useEffect(() => {
        if (panel !== "data") {
            setSelectedElement(undefined)
        }

        const currentPanel = panelRef.current

        if (!currentPanel) return

        if (panel) currentPanel.expand()
        else currentPanel.collapse()
    }, [panel])

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
        if (!graphName) return undefined

        const handleSetInfo = () => Promise.all([
            fetchInfo("(label)"),
            fetchInfo("(relationship type)"),
            fetchInfo("(property key)"),
        ]).then(async ([newLabels, newRelationships, newPropertyKeys]) => {
            const colorsArr = localStorage.getItem(graphName)
            const gi = GraphInfo.create(newPropertyKeys, newLabels, newRelationships, colorsArr ? JSON.parse(colorsArr) : undefined)
            setGraphInfo(gi)
            fetchCount()
        }).catch((error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to fetch graph info",
                variant: "destructive",
            })
        });

        handleSetInfo()

        const interval = setInterval(handleSetInfo, refreshInterval * 1000)

        return () => {
            clearInterval(interval)
        }
    }, [fetchInfo, graphName, refreshInterval, setGraphInfo, toast])

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
    }, [fetchCount, graph.Id, graphName, setGraph, runDefaultQuery, defaultQuery, contentPersistence, setGraphName, graphNames, setIsQueryLoading])

    const handleSetIsAddNode = useCallback((isAdd: boolean) => {
        const currentPanel = panelRef.current
        setIsAddNode(isAdd)

        if (isAdd) {
            setIsAddEdge(false)
            setSelectedElement(undefined)
        }

        if (!currentPanel) return

        if (isAdd) currentPanel.expand()
        else currentPanel.collapse()
    }, [])

    const handleSetIsAddEdge = useCallback((isAdd: boolean) => {
        const currentPanel = panelRef.current
        setIsAddEdge(isAdd)

        if (isAdd) {
            setIsAddNode(false)
            setSelectedElement(undefined)
        }

        if (!currentPanel) return

        if (isAdd) currentPanel.expand()
        else currentPanel.collapse()
    }, [])

    const handleCreateElement = (attributes: [string, string][], label: string[], type: boolean) => {
        const result = fetch(`api/graph/${prepareArg(graphName)}/element`)
    }

    const handleSetSelectedElement = useCallback((el: Node | Link | undefined) => {
        setSelectedElement(el)
        setPanel(el ? "data" : undefined)

        const currentPanel = panelRef.current

        if (!currentPanel) return

        if (el) currentPanel.expand()
        else currentPanel.collapse()
    }, [setPanel])

    const handleDeleteElement = useCallback(async () => {
        if (selectedElements.length === 0 && selectedElement) {
            selectedElements.push(selectedElement)
        }

        await Promise.all(selectedElements.map(async (element) => {
            const type = !element.source
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

        setRelationships(graph.removeLinks(selectedElements.map((element) => element.id)))
        setData({ ...graph.Elements })
        fetchCount()
        setSelectedElements([])
        handleSetSelectedElement(undefined)

        toast({
            title: "Success",
            description: `${selectedElements.length > 1 ? "Elements" : "Element"} deleted`,
        })
    }, [selectedElements, selectedElement, graph, setData, fetchCount, handleSetSelectedElement, toast, setIndicator])

    const getCurrentPanel = useCallback(() => {
        if (!graphName) return undefined

        switch (panel) {
            case "chat":
                return (
                    <Chat
                        onClose={() => setPanel(undefined)}
                    />
                )

            case "data":
                if (!selectedElement) return undefined

                return <GraphDataPanel
                    object={selectedElement}
                    setObject={handleSetSelectedElement}
                    setLabels={setLabels}
                />
            case "add":
                return <GraphCreatePanel
                    type={isAddNode}
                    onCreate={handleCreateElement}
                    onClose={() => setPanel(undefined)}
                />

            default:
                return undefined
        }
    }, [graphName, panel, selectedElement, handleSetSelectedElement, setPanel])

    return (
        <div className="Page p-8 gap-8">
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
                        selectedElement={selectedElement}
                        setSelectedElement={handleSetSelectedElement}
                        selectedElements={selectedElements}
                        setSelectedElements={setSelectedElements}
                        chartRef={chartRef}
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
                <ResizableHandle withHandle onMouseUp={() => isCollapsed && handleSetSelectedElement(undefined)} className={cn("ml-6 w-0", isCollapsed && "hidden")} />
                <ResizablePanel
                    ref={panelRef}
                    collapsible
                    defaultSize={panelSize}
                    minSize={30}
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
        </div >
    )
}