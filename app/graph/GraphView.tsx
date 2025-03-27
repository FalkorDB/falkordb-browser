/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/exhaustive-deps */

'use client'

import { useRef, useState, useEffect, Dispatch, SetStateAction, useContext } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { ChevronLeft, GitGraph, Info, Maximize2, Minimize2, Pause, Play, Search, Table } from "lucide-react"
import { cn, handleZoomToFit, HistoryQuery, prepareArg, Query, securedFetch } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ForceGraphMethods } from "react-force-graph-2d";
import { IndicatorContext } from "@/app/components/provider";
import { Category, Graph, GraphData, Link, Node } from "../api/graph/model";
import DataPanel from "./GraphDataPanel";
import Labels from "./labels";
import Toolbar from "./toolbar";
import Button from "../components/ui/Button";
import TableView from "./TableView";
import MetadataView from "./MetadataView";
import Input from "../components/ui/Input";

const ForceGraph = dynamic(() => import("../components/ForceGraph"), { ssr: false });
const EditorComponent = dynamic(() => import("../components/EditorComponent"), { ssr: false })

function GraphView({ graph, selectedElement, setSelectedElement, runQuery, historyQuery, fetchCount, setHistoryQuery }: {
    graph: Graph
    selectedElement: Node | Link | undefined
    setSelectedElement: Dispatch<SetStateAction<Node | Link | undefined>>
    runQuery: (query: string) => Promise<Query | undefined>
    historyQuery: HistoryQuery
    setHistoryQuery: Dispatch<SetStateAction<HistoryQuery>>
    fetchCount: () => void
}) {

    const [data, setData] = useState<GraphData>(graph.Elements)
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([]);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
    const chartRef = useRef<ForceGraphMethods<Node, Link>>()
    const dataPanel = useRef<ImperativePanelHandle>(null)
    const [maximize, setMaximize] = useState<boolean>(false)
    const [tabsValue, setTabsValue] = useState<string>("")
    const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0)
    const [currentQuery, setCurrentQuery] = useState<Query>()
    const [searchElement, setSearchElement] = useState<string>("")
    const { toast } = useToast()
    const { setIndicator } = useContext(IndicatorContext);

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
        let defaultChecked = "Graph"
        if (graph.getElements().length !== 0) {
            defaultChecked = "Graph"
        } else if (graph.Data.length !== 0) {
            defaultChecked = "Table";
        } else if (currentQuery && currentQuery.metadata.length > 0 && graph.Metadata.length > 0 && currentQuery.explain.length > 0) {
            defaultChecked = "Metadata";
        }

        setTabsValue(defaultChecked);
        setData({ ...graph.Elements })
    }, [graph, graph.Id, graph.getElements().length, graph.Data.length])

    const handleCooldown = (ticks?: number) => {
        setCooldownTicks(ticks)
    }

    useEffect(() => {
        setSelectedElement(undefined)
        setSelectedElements([])
    }, [graph.Id])

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

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMaximize(false)
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [])

    const onCategoryClick = (category: Category) => {
        category.show = !category.show

        category.elements.forEach((element) => {
            if (element.category[0] !== category.name) return
            if (category.show) {
                element.visible = true
            } else {
                element.visible = false
            }
        })

        graph.visibleLinks(category.show)

        setData({ ...graph.Elements })
    }

    const onLabelClick = (label: Category) => {
        label.show = !label.show
        label.elements.forEach((element) => {
            if (label.show) {
                element.visible = true
            } else {
                element.visible = false
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
        }, toast, setIndicator)

        if (!result.ok) return

        selectedElements.forEach((element) => {
            if ("source" in element) {
                const category = graph.LabelsMap.get(element.label)
                if (category) {
                    category.elements = category.elements.filter((e) => e.id !== element.id)
                    if (category.elements.length === 0) {
                        graph.Labels.splice(graph.Labels.findIndex(l => l.name === category.name), 1)
                        graph.LabelsMap.delete(category.name)
                    }
                }
            } else {
                element.category.forEach((category) => {
                    const cat = graph.CategoriesMap.get(category)
                    if (cat) {
                        cat.elements = cat.elements.filter((e) => e.id !== element.id)
                        if (cat.elements.length === 0) {
                            graph.Categories.splice(graph.Categories.findIndex(c => c.name === cat.name), 1)
                            graph.CategoriesMap.delete(cat.name)
                        }
                    }
                })
            }
        })

        graph.removeElements(selectedElements)

        fetchCount()
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
        const newQuery = await runQuery(q)
        if (newQuery) {
            setCurrentQuery(newQuery)
            handleZoomToFit(chartRef)
            handleCooldown()
        }
        return !!newQuery
    }


    const handleAddLabel = async (label: string) => {
        const q = `MATCH (n) WHERE ID(n) = ${selectedElement?.id} SET n:${label}`
        const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)}`, {
            method: "GET"
        }, toast, setIndicator)

        if (result.ok) {

            graph.createCategory([label], selectedElement as Node)
            graph.addLabel(label, selectedElement as Node)
            setData({ ...graph.Elements })
        }

        return result.ok
    }

    const handleRemoveLabel = async (label: string) => {
        const q = `MATCH (n) WHERE ID(n) = ${selectedElement?.id} REMOVE n:${label}`
        const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)}`, {
            method: "GET"
        }, toast, setIndicator)

        if (result.ok) {
            const category = graph.CategoriesMap.get(label)

            if (category) {
                category.elements = category.elements.filter((element) => element.id !== selectedElement?.id)
                if (category.elements.length === 0) {
                    graph.Categories.splice(graph.Categories.findIndex(c => c.name === category.name), 1)
                    graph.CategoriesMap.delete(category.name)
                }
            }

            graph.removeLabel(label, selectedElement as Node)
            setData({ ...graph.Elements })
        }

        return result.ok
    }

    const handleSearchElement = () => {
        if (searchElement) {
            const element = graph.Elements.nodes.find(node => node.data.name ? node.data.name.toLowerCase().startsWith(searchElement.toLowerCase()) : node.id.toString().toLowerCase().includes(searchElement.toLowerCase()))
            if (element) {
                handleZoomToFit(chartRef, (node: Node) => node.id === element.id)
                setSelectedElement(element)
            }
        }
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
                    runQuery={handleRunQuery}
                    historyQuery={historyQuery}
                    setHistoryQuery={setHistoryQuery}
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
                        <TabsTrigger
                            asChild
                            value="Metadata"
                        >
                            <Button
                                disabled={!currentQuery || currentQuery.metadata.length === 0 || currentQuery.explain.length === 0 || graph.Metadata.length === 0}
                                className="tabs-trigger"
                                onClick={() => setTabsValue("Metadata")}
                                title="Metadata"
                            >
                                <Info />
                            </Button>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="Graph" className="w-1 grow h-full mt-0">
                        <div className="h-full flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <Toolbar
                                    disabled={!graph.Id}
                                    deleteDisabled={selectedElements.length === 0 || !selectedElement}
                                    onDeleteElement={handleDeleteElement}
                                    chartRef={chartRef}
                                    displayAdd={false}
                                    type="Graph"
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
                                    <div className="z-10 absolute top-4 left-4 pointer-events-none flex gap-4">
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
                                        <div className="relative pointer-events-auto" id="elementCanvasSearch">
                                            <Input
                                                className="w-[20dvw]"
                                                placeholder="Search for element in the graph"
                                                value={searchElement}
                                                onChange={(e) => setSearchElement(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSearchElement()
                                                        setSearchElement("")
                                                    }
                                                }}
                                            />
                                            <Button
                                                className="absolute right-2 top-2"
                                                onClick={handleSearchElement}
                                            >
                                                <Search color="black" />
                                            </Button>
                                        </div>
                                    </div>
                                }
                                <ForceGraph
                                    graph={graph}
                                    chartRef={chartRef}
                                    data={data}
                                    onExpand={onExpand}
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
                    <TabsContent value="Metadata" className="mt-0 w-1 grow h-full">
                        <MetadataView
                            query={currentQuery!}
                            graphName={graph.Id}
                        />
                    </TabsContent>
                </Tabs>
            </ResizablePanel>
            <ResizableHandle disabled={!selectedElement} className={cn(!selectedElement ? "!cursor-default" : "w-3")} />
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
                        onAddLabel={handleAddLabel}
                        onRemoveLabel={handleRemoveLabel}
                    />
                }
            </ResizablePanel>
        </ResizablePanelGroup >
    )
}

GraphView.displayName = "GraphView";

export default GraphView;