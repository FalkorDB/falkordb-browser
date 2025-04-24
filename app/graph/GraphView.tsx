/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/exhaustive-deps */

'use client'

import { useRef, useState, useEffect, Dispatch, SetStateAction, useContext } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { GitGraph, Info, Pause, Play, Search, Table } from "lucide-react"
import { handleZoomToFit, Query, prepareArg, securedFetch } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ForceGraphMethods } from "react-force-graph-2d";
import { GraphContext, IndicatorContext } from "@/app/components/provider";
import { toast } from "@/components/ui/use-toast";
import { Category, GraphData, Link, Node } from "../api/graph/model";
import Labels from "./labels";
import Button from "../components/ui/Button";
import TableView from "./TableView";
import MetadataView from "./MetadataView";
import Input from "../components/ui/Input";
import Toolbar from "./toolbar";
import GraphDataPanel from "./GraphDataPanel";

const ForceGraph = dynamic(() => import("../components/ForceGraph"), { ssr: false });

function GraphView({ selectedElement, setSelectedElement, currentQuery, nodesCount, edgesCount, fetchCount }: {
    selectedElement: Node | Link | undefined
    setSelectedElement: Dispatch<SetStateAction<Node | Link | undefined>>
    currentQuery: Query | undefined
    nodesCount: number
    edgesCount: number
    fetchCount: () => void
}) {
    const { graph } = useContext(GraphContext)
    const [data, setData] = useState<GraphData>({ ...graph.Elements })
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([]);
    const chartRef = useRef<ForceGraphMethods<Node, Link>>()
    const dataPanel = useRef<ImperativePanelHandle>(null)
    const [tabsValue, setTabsValue] = useState<string>("")
    const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0)
    const [searchElement, setSearchElement] = useState<string>("")
    const { setIndicator } = useContext(IndicatorContext)

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

        const canvas = document.querySelector('.force-graph-container canvas');
        if (!canvas) return
        if (ticks === 0) {
            canvas.setAttribute('data-engine-status', 'stop')
        } else {
            canvas.setAttribute('data-engine-status', 'running')

        }
    }

    useEffect(() => {
        setSelectedElement(undefined)
        setSelectedElements([])
    }, [graph.Id])

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

    const handleSearchElement = () => {
        if (searchElement) {
            const element = graph.Elements.nodes.find(node => node.data.name ? node.data.name.toLowerCase().startsWith(searchElement.toLowerCase()) : node.id.toString().toLowerCase().includes(searchElement.toLowerCase()))
            if (element) {
                handleZoomToFit(chartRef, (node: Node) => node.id === element.id)
                setSelectedElement(element)
            }
        }
    }

    const handleDeleteElement = async () => {
        if (selectedElements.length === 0 && selectedElement) {
            selectedElements.push(selectedElement)
            setSelectedElement(undefined)
        }

        await Promise.all(selectedElements.map(async (element) => {
            const type = !element.source
            const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${prepareArg(element.id.toString())}`, {
                method: "DELETE",
                body: JSON.stringify({ type })
            }, toast, setIndicator)

            if (!result.ok) return

            if (type) {
                (element as Node).category.forEach((category) => {
                    const cat = graph.CategoriesMap.get(category)
                    if (cat) {
                        cat.elements = cat.elements.filter((e) => e.id !== element.id)
                        if (cat.elements.length === 0) {
                            const index = graph.Categories.findIndex(c => c.name === cat.name)
                            if (index !== -1) {
                                graph.Categories.splice(index, 1)
                                graph.CategoriesMap.delete(cat.name)
                            }
                        }
                    }
                })
            } else {
                const category = graph.LabelsMap.get((element as Link).label)
                if (category) {
                    category.elements = category.elements.filter((e) => e.id !== element.id)
                    if (category.elements.length === 0) {
                        const index = graph.Labels.findIndex(l => l.name === category.name)
                        if (index !== -1) {
                            graph.Labels.splice(index, 1)
                            graph.LabelsMap.delete(category.name)
                        }
                    }
                }
            }
        }))

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
        setSelectedElement(undefined)
        setSelectedElements([])
    }

    return (
        <Tabs value={tabsValue} className="h-full w-full relative border rounded-lg overflow-hidden">
            <div className="w-full pointer-events-none z-10 absolute bottom-0 right-0 p-4 flex justify-between items-center">
                <div className="w-1 grow flex gap-2">
                    {
                        graph.Id &&
                        <>
                            <p className="Gradient bg-clip-text text-transparent">Nodes: {nodesCount}</p>
                            <p className="Gradient bg-clip-text text-transparent">Edges: {edgesCount}</p>
                        </>
                    }
                </div>
                <div className="w-1 grow flex justify-center">
                    <TabsList className="bg-transparent flex gap-2 pointer-events-auto">
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
                </div>
                <div className="w-1 grow flex justify-end">
                    {
                        graph.getElements().length > 0 &&
                        <Toolbar
                            chartRef={chartRef}
                            disabled={graph.getElements().length === 0}
                        />
                    }
                </div>
            </div>
            <TabsContent value="Graph" className="h-full w-full mt-0">
                {
                    graph.getElements().length > 0 &&
                    <div className="z-10 absolute top-12 left-4 pointer-events-none flex gap-4" id="canvasPanel">
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
                                className="w-[30dvw]"
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
                        <Labels categories={graph.Categories} onClick={onCategoryClick} label="Labels" />
                        <Labels categories={graph.Labels} onClick={onLabelClick} label="RelationshipTypes" />
                    </>
                }
                {
                    selectedElement &&
                    <GraphDataPanel
                        obj={selectedElement}
                        setObj={setSelectedElement}
                        onDeleteElement={handleDeleteElement}
                    />
                }
            </TabsContent>
            <TabsContent value="Table" className="h-full w-full mt-0">
                <TableView />
            </TabsContent>
            <TabsContent value="Metadata" className="h-full w-full mt-0">
                <MetadataView
                    query={currentQuery!}
                />
            </TabsContent>
        </Tabs>
    )
}

GraphView.displayName = "GraphView";

export default GraphView;