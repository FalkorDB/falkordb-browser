/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/exhaustive-deps */

'use client'

import { useRef, useState, useEffect, Dispatch, SetStateAction } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { ChevronLeft, GitGraph, Maximize2, Minimize2, Table } from "lucide-react"
import { cn, prepareArg, securedFetch } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Session } from "next-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Category, Graph, GraphData, Link, Node } from "../api/graph/model";
import DataPanel from "./GraphDataPanel";
import Labels from "./labels";
import Toolbar from "./toolbar";
import Button from "../components/ui/Button";
import TableView from "./TableView";

const ForceGraph = dynamic(() => import("../components/ForceGraph"), { ssr: false });

const EditorComponent = dynamic(() => import("../components/EditorComponent"), {
    ssr: false
})

function GraphView({ graph, selectedElement, setSelectedElement, runQuery, historyQuery, historyQueries, fetchCount, session }: {
    graph: Graph
    selectedElement: Node | Link | undefined
    setSelectedElement: Dispatch<SetStateAction<Node | Link | undefined>>
    runQuery: (query: string) => Promise<void>
    historyQuery: string
    historyQueries: string[]
    fetchCount: () => void
    session: Session | null
}) {

    const [data, setData] = useState<GraphData>(graph.Elements)
    const [query, setQuery] = useState<string>("")
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([]);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chartRef = useRef<any>(null)
    const dataPanel = useRef<ImperativePanelHandle>(null)
    const [maximize, setMaximize] = useState<boolean>(false)
    const [tabsValue, setTabsValue] = useState<string>("")
    const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0)
    const [cooldownTime, setCooldownTime] = useState<number | undefined>(2000)

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

    const handelCooldown = () => {
        setCooldownTicks(1000)
    }

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

    const handelDeleteElement = async () => {
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
        })

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

        setSelectedElements([])
        setSelectedElement(undefined)

        graph.removeLinks(selectedElements.map((element) => element.id))

        setData({ ...graph.Elements })
        handelCooldown()
    }

    const handelRunQuery = async (q: string) => {
        await runQuery(q)
        chartRef.current?.zoomToFit(1000, 40)
        handelCooldown()
    }

    return (
        <ResizablePanelGroup direction="horizontal" className={cn(maximize && "h-full p-10 bg-background fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%]")}>
            <ResizablePanel
                className={cn("flex flex-col gap-4", !isCollapsed && "mr-8")}
                defaultSize={selectedElement ? 75 : 100}
            >
                <EditorComponent
                    graph={graph}
                    isCollapsed={isCollapsed}
                    maximize={maximize}
                    currentQuery={query}
                    historyQueries={historyQueries}
                    runQuery={handelRunQuery}
                    setCurrentQuery={setQuery}
                    data={session}
                />
                <Tabs value={tabsValue} className="h-1 grow flex gap-2">
                    <TabsList className="h-full bg-background flex flex-col justify-center gap-2">
                        <TabsTrigger
                            disabled={graph.getElements().length === 0}
                            className="tabs-trigger"
                            value="Graph"
                            onClick={() => setTabsValue("Graph")}
                            title="Graph">
                            <GitGraph />
                        </TabsTrigger>
                        <TabsTrigger
                            disabled={graph.Data.length === 0}
                            className="tabs-trigger"
                            value="Table"
                            onClick={() => setTabsValue("Table")}
                            title="Table"
                        >
                            <Table />
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="Graph" className="w-1 grow h-full mt-0">
                        <div className="h-full flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <Toolbar
                                    disabled={!graph.Id}
                                    deleteDisabled={(Object.values(selectedElements).length === 0 && !selectedElement) || session?.user.role === "Read-Only"}
                                    onDeleteElement={handelDeleteElement}
                                    chartRef={chartRef}
                                    cooldownTime={cooldownTime}
                                    setCooldownTime={setCooldownTime}
                                    handelCooldown={handelCooldown}
                                    addDisabled
                                />
                                {
                                    isCollapsed && graph.Id &&
                                    <Button
                                        className="p-3 bg-[#7167F6] rounded-lg"
                                        icon={<ChevronLeft />}
                                        onClick={() => onExpand()}
                                        disabled={!selectedElement}
                                    />
                                }
                            </div>
                            <div className="relative h-1 grow rounded-lg overflow-hidden">
                                {
                                    !maximize ?
                                        <Button
                                            className="z-10 absolute top-4 right-4"
                                            icon={<Maximize2 />}
                                            title="Maximize"
                                            onClick={() => setMaximize(true)}

                                        /> : <Button
                                            className="z-10 absolute top-4 right-4"
                                            icon={<Minimize2 />}
                                            title="Minimize"
                                            onClick={() => setMaximize(false)}
                                            onKeyDown={(e) => e.code === "Escape" && setMaximize(false)}
                                        />
                                }
                                <ForceGraph
                                    graph={graph}
                                    chartRef={chartRef}
                                    data={data}
                                    selectedElement={selectedElement}
                                    setSelectedElement={setSelectedElement}
                                    selectedElements={selectedElements}
                                    setSelectedElements={setSelectedElements}
                                    cooldownTicks={cooldownTicks}
                                    setCooldownTicks={setCooldownTicks}
                                    cooldownTime={cooldownTime}
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
            <ResizableHandle className={!isCollapsed ? "w-3" : "w-0"} />
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
                        onDeleteElement={handelDeleteElement}
                        data={session}
                    />
                }
            </ResizablePanel>
        </ResizablePanelGroup >
    )
}

GraphView.displayName = "GraphView";

export default GraphView;