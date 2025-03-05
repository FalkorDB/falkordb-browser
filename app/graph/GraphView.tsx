/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/exhaustive-deps */

'use client'

import { useRef, useState, useEffect, Dispatch, SetStateAction } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { ChevronLeft, GitGraph, Maximize2, Minimize2, Pause, Play, Table } from "lucide-react"
import { cn, handleZoomToFit, prepareArg, securedFetch } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Session } from "next-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ForceGraphMethods } from "react-force-graph-2d";
import { Category, Graph, GraphData, Link, Node } from "../api/graph/model";
import DataPanel from "./GraphDataPanel";
import Labels from "./labels";
import Toolbar from "./toolbar";
import Button from "../components/ui/Button";
import TableView from "./TableView";

const ForceGraph = dynamic(() => import("../components/ForceGraph"), { ssr: false });
const EditorComponent = dynamic(() => import("../components/EditorComponent"), { ssr: false })

function GraphView({ graph, selectedElement, setSelectedElement, runQuery, historyQuery, historyQueries, setHistoryQueries, fetchCount, session }: {
    graph: Graph
    selectedElement: Node | Link | undefined
    setSelectedElement: Dispatch<SetStateAction<Node | Link | undefined>>
    runQuery: (query: string) => Promise<void>
    historyQuery: string
    historyQueries: string[]
    setHistoryQueries: (queries: string[]) => void
    fetchCount: () => void
    session: Session | null
}) {

    const [data, setData] = useState<GraphData>(graph.Elements)
    const [query, setQuery] = useState<string>("")
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([]);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
    const chartRef = useRef<ForceGraphMethods<Node, Link>>()
    const dataPanel = useRef<ImperativePanelHandle>(null)
    const [maximize, setMaximize] = useState<boolean>(false)
    const [tabsValue, setTabsValue] = useState<string>("")
    const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0)
    const { toast } = useToast()

    useEffect(() => {
        let timeout: NodeJS.Timeout
        if (tabsValue === "Graph" && selectedElement) {
            timeout = setTimeout(() => {
                dataPanel.current?.expand()
            }, 0)
        }
        dataPanel.current?.collapse()

        return () => {
            clearInterval(timeout)
        }
    }, [tabsValue])

    useEffect(() => {
        setData({ ...graph.Elements })
    }, [graph.getElements().length, graph.Elements])

    useEffect(() => {
        const defaultChecked = graph.Data.length !== 0 ? "Table" : "Graph"
        setTabsValue(graph.getElements().length !== 0 ? "Graph" : defaultChecked)
    }, [graph.getElements().length, graph.Data.length])


    const handleCooldown = (ticks?: number) => {
        setCooldownTicks(ticks)
    }

    useEffect(() => {
        setSelectedElement(undefined)
        setSelectedElements([])
    }, [graph.Id])

    useEffect(() => {
        setQuery(historyQuery)
    }, [historyQuery])

    const onExpand = (expand?: boolean) => {
        if (!dataPanel.current) return
        const panel = dataPanel.current
        if (expand !== undefined) {
            if (expand && panel?.isCollapsed()) {
                panel?.expand()
            } else if (!expand && panel?.isExpanded()) {
                panel?.collapse()
            }
            return
        }
        if (panel.isCollapsed()) {
            panel.expand()
        } else {
            panel.collapse()
        }
    }

    useEffect(() => {
        dataPanel.current?.collapse()
    }, [])

    useEffect(() => {
        onExpand(!!selectedElement)
    }, [selectedElement])

    const onCategoryClick = (category: Category) => {
        category.show = !category.show
        graph.Elements.nodes.forEach((node) => {
            if (node.category[0] !== category.name) return
            if (category.show) {
                node.visible = true
            } else {
                node.visible = false
            }
        })

        graph.visibleLinks(category.show)

        setData({ ...graph.Elements })
    }

    const onLabelClick = (label: Category) => {
        label.show = !label.show
        graph.Elements.links.forEach((link) => {
            if (link.label !== label.name) return
            if (label.show) {
                link.visible = true
            } else {
                link.visible = false
            }
        })

        setData({ ...graph.Elements })
    }
    const handleDeleteElement = async () => {
        if (selectedElements.length === 0 && selectedElement) {
            selectedElements.push(selectedElement)
            setSelectedElement(undefined)
        }

        const conditionsNodes: string[] = []
        const conditionsEdges: string[] = []

        selectedElements.forEach((element) => {
            const { id } = element
            if ("source" in element) {
                conditionsEdges.push(`id(e) = ${id}`)
            } else {
                conditionsNodes.push(`id(n) = ${id}`)
            }
        })

        const q = `${conditionsNodes.length !== 0 ? `MATCH (n) WHERE ${conditionsNodes.join(" OR ")} DELETE n` : ""}${conditionsEdges.length > 0 && conditionsNodes.length > 0 ? " WITH * " : ""}${conditionsEdges.length !== 0 ? `MATCH ()-[e]-() WHERE ${conditionsEdges.join(" OR ")} DELETE e` : ""}`

        const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)} `, {
            method: "GET"
        }, session?.user?.role, toast)

        if (!result.ok) return

        selectedElements.forEach((element) => {
            const { id } = element
            const type = !("source" in element)

            if (type) {
                graph.Elements.nodes.splice(graph.Elements.nodes.findIndex(n => n.id === id), 1)
            } else {
                graph.Elements.links.splice(graph.Elements.links.findIndex(l => l.id === id), 1)
            }

            graph.updateCategories(type ? element.category[0] : element.label, type)
            fetchCount()
        })


        graph.Data = graph.Data.map(row => {
            const newRow = Object.entries(row).map(([key, cell]) => {
                if (typeof cell === "object" && cell && selectedElements.some(element => element.id === cell.id)) {
                    return [key, undefined]
                }
                return [key, cell]
            })
            if (newRow.every(([, cell]) => cell === undefined)) {
                return undefined
            }
            return Object.fromEntries(newRow)
        })

        setSelectedElements([])
        setSelectedElement(undefined)

        graph.removeLinks(selectedElements.map((element) => element.id))

        setData({ ...graph.Elements })
        toast({
            title: "Success",
            description: `${selectedElements.length > 1 ? "Elements" : "Element"} deleted`,
        })
        handleCooldown()
    }

    const handleRunQuery = async (q: string) => {
        await runQuery(q)
        handleZoomToFit(chartRef)
        handleCooldown()
    }

    return (
        <ResizablePanelGroup direction="horizontal" className={cn(maximize && "h-full p-10 bg-background fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%]")}>
            <ResizablePanel
                className={cn("flex flex-col gap-4", !isCollapsed && "mr-8")}
                defaultSize={selectedElement ? 75 : 100}
            >
                <EditorComponent
                    graph={graph}
                    maximize={maximize}
                    currentQuery={query}
                    historyQueries={historyQueries}
                    setHistoryQueries={setHistoryQueries}
                    runQuery={handleRunQuery}
                    setCurrentQuery={setQuery}
                />
                <Tabs value={tabsValue} className="h-1 grow flex gap-2 items-center">
                    <TabsList className="h-fit bg-foreground p-2 flex flex-col gap-2">
                        <TabsTrigger
                            asChild
                            value="Graph"
                        >
                            <Button
                                disabled={graph.getElements().length === 0}
                                className="tabs-trigger"
                                onClick={() => setTabsValue("Graph")}
                                title="Graph"
                            >
                                <GitGraph />
                            </Button>
                        </TabsTrigger>
                        <TabsTrigger
                            asChild
                            value="Table"
                        >
                            <Button
                                disabled={graph.Data.length === 0}
                                className="tabs-trigger"
                                onClick={() => setTabsValue("Table")}
                                title="Table"
                            >
                                <Table />
                            </Button>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="Graph" className="w-1 grow h-full mt-0">
                        <div className="h-full flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <Toolbar
                                    selectedElementsLength={selectedElements.length + (selectedElement ? 1 : 0)}
                                    disabled={!graph.Id}
                                    deleteDisabled={(Object.values(selectedElements).length === 0 && !selectedElement) || session?.user.role === "Read-Only"}
                                    onDeleteElement={handleDeleteElement}
                                    chartRef={chartRef}
                                    displayAdd={false}
                                />
                                {
                                    isCollapsed && graph.Id &&
                                    <Button
                                        className="p-3 bg-[#7167F6] rounded-lg"
                                        onClick={() => onExpand()}
                                        disabled={!selectedElement}
                                    >
                                        <ChevronLeft />
                                    </Button>
                                }
                            </div>
                            <div className="relative h-1 grow rounded-lg overflow-hidden">
                                <Button
                                    className="z-10 absolute top-4 right-4"
                                    title={!maximize ? "Maximize" : "Minimize"}
                                    onClick={() => setMaximize(prev => !prev)}
                                >
                                    {!maximize ? <Maximize2 /> : <Minimize2 />}
                                </Button>
                                {
                                    graph.getElements().length > 0 &&
                                    <div className="z-10 absolute top-4 left-4 pointer-events-none">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center gap-2">
                                                    {cooldownTicks === undefined ? <Play size={20} /> : <Pause size={20} />}
                                                    <Switch
                                                        className="pointer-events-auto"
                                                        checked={cooldownTicks === undefined}
                                                        onCheckedChange={() => {
                                                            handleCooldown(cooldownTicks === undefined ? 0 : undefined)
                                                        }}
                                                    />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Animation Control</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                }
                                <ForceGraph
                                    graph={graph}
                                    chartRef={chartRef}
                                    data={data}
                                    setData={setData}
                                    selectedElement={selectedElement}
                                    setSelectedElement={setSelectedElement}
                                    selectedElements={selectedElements}
                                    setSelectedElements={setSelectedElements}
                                    cooldownTicks={cooldownTicks}
                                    handleCooldown={handleCooldown}
                                />
                                {
                                    (graph.Categories.length > 0 || graph.Labels.length > 0) &&
                                    <>
                                        <Labels categories={graph.Categories} onClick={onCategoryClick} label="Labels" graph={graph} />
                                        <Labels categories={graph.Labels} onClick={onLabelClick} label="RelationshipTypes" graph={graph} />
                                    </>
                                }
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="Table" className="mt-0 w-1 grow h-full">
                        <TableView
                            data={graph.Data}
                        />
                    </TabsContent>
                </Tabs>
            </ResizablePanel>
            <ResizableHandle disabled={isCollapsed} className={cn(isCollapsed ? "w-0 !cursor-default" : "w-3")} />
            <ResizablePanel
                className="rounded-lg"
                collapsible
                ref={dataPanel}
                defaultSize={selectedElement ? 25 : 0}
                minSize={25}
                maxSize={50}
                onCollapse={() => setIsCollapsed(true)}
                onExpand={() => setIsCollapsed(false)}
            >
                {
                    selectedElement &&
                    <DataPanel
                        obj={selectedElement}
                        setObj={setSelectedElement}
                        onExpand={onExpand}
                        graph={graph}
                        onDeleteElement={handleDeleteElement}
                    />
                }
            </ResizablePanel>
        </ResizablePanelGroup >
    )
}

GraphView.displayName = "GraphView";

export default GraphView;