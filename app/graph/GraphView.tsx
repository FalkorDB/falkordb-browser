/* eslint-disable no-param-reassign */

'use client'

import { useState, useEffect, Dispatch, SetStateAction, useContext, useCallback } from "react";
import { GitGraph, Info, Table } from "lucide-react"
import { cn, GraphRef } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraphContext } from "@/app/components/provider";
import { Category, GraphData, Link, Node } from "../api/graph/model";
import Button from "../components/ui/Button";
import TableView from "./TableView";
import Toolbar from "./toolbar";
import Controls from "./controls";
import GraphDataPanel from "./GraphDataPanel";
import GraphDetails from "./GraphDetails";
import Labels from "./labels";
import MetadataView from "./MetadataView";
import ForceGraph from "../components/ForceGraph";


type Tab = "Graph" | "Table" | "Metadata"

interface Props {
    data: GraphData
    setData: Dispatch<SetStateAction<GraphData>>
    selectedElement: Node | Link | undefined
    setSelectedElement: Dispatch<SetStateAction<Node | Link | undefined>>
    selectedElements: (Node | Link)[]
    setSelectedElements: Dispatch<SetStateAction<(Node | Link)[]>>
    nodesCount: number
    edgesCount: number
    fetchCount: () => Promise<void>
    handleCooldown: (ticks?: number) => void
    cooldownTicks: number | undefined
    chartRef: GraphRef
    handleDeleteElement: () => Promise<void>
    setLabels: Dispatch<SetStateAction<Category<Link>[]>>
    setCategories: Dispatch<SetStateAction<Category<Node>[]>>
    labels: Category<Link>[]
    categories: Category<Node>[]
}

function GraphView({
    data,
    setData,
    selectedElement,
    setSelectedElement,
    selectedElements,
    setSelectedElements,
    nodesCount,
    edgesCount,
    fetchCount,
    handleCooldown,
    cooldownTicks,
    chartRef,
    handleDeleteElement,
    setLabels,
    setCategories,
    labels,
    categories
}: Props) {

    const { graph } = useContext(GraphContext)

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [parentHeight, setParentHeight] = useState<number>(0)
    const [parentWidth, setParentWidth] = useState<number>(0)
    const [tabsValue, setTabsValue] = useState<Tab>("Graph")
    const elementsLength = graph.getElements().length

    useEffect(() => {
        setCategories([...graph.Categories])
        setLabels([...graph.Labels])
    }, [graph, graph.Categories, graph.Labels, setCategories, setLabels])

    const isTabEnabled = useCallback((tab: Tab) => {
        if (tab === "Graph") return graph.getElements().length !== 0
        if (tab === "Table") return graph.Data.length !== 0
        return graph.CurrentQuery && graph.CurrentQuery.metadata.length > 0 && graph.Metadata.length > 0 && graph.CurrentQuery.explain.length > 0
    }, [graph])

    useEffect(() => {
        if (!elementsLength) return;

        setIsLoading(true)
        setData({ ...graph.Elements })
    }, [graph, elementsLength, setData])

    useEffect(() => {
        if (isTabEnabled(tabsValue)) return

        let defaultChecked: Tab = "Graph"
        if (graph.Data.length !== 0) defaultChecked = "Table"
        if (graph.CurrentQuery && graph.CurrentQuery.metadata.length > 0 && graph.Metadata.length > 0 && graph.CurrentQuery.explain.length > 0) defaultChecked = "Metadata"

        setTabsValue(defaultChecked);
    }, [graph, graph.Id, elementsLength, graph.Data.length, isTabEnabled, tabsValue])

    useEffect(() => {
        if (tabsValue === "Graph" && graph.Elements.nodes.length > 0) {
            handleCooldown()
        }
    }, [tabsValue])

    useEffect(() => {
        setSelectedElement(undefined)
        setSelectedElements([])
    }, [graph.Id, setSelectedElement, setSelectedElements])

    const onCategoryClick = (category: Category<Node>) => {
        category.show = !category.show

        category.elements.forEach((node) => {
            if (node.category[0] !== category.name) return
            if (category.show) {
                node.visible = true
            } else {
                node.visible = false
            }
        })

        graph.visibleLinks(category.show)

        graph.CategoriesMap.set(category.name, category)
        setData({ ...graph.Elements })
    }

    const onLabelClick = (label: Category<Link>) => {
        label.show = !label.show

        label.elements.filter((link) => link.source.visible && link.target.visible).forEach((link) => {
            if (label.show) {
                link.visible = true
            } else {
                link.visible = false
            }
        })

        graph.LabelsMap.set(label.name, label)
        setData({ ...graph.Elements })
    }

    return (
        <Tabs value={tabsValue} onValueChange={(value) => setTabsValue(value as Tab)} className={cn("h-full w-full relative border rounded-lg overflow-hidden", tabsValue === "Table" && "flex flex-col-reverse")}>
            <div className={cn("flex gap-4 justify-between items-end", tabsValue === "Table" ? "py-4 px-12" : "absolute bottom-4 inset-x-12 pointer-events-none z-20")}>
                <GraphDetails
                    graph={graph}
                    tabsValue={tabsValue}
                    nodesCount={nodesCount}
                    edgesCount={edgesCount}
                />
                <TabsList className="bg-transparent flex gap-2 pointer-events-auto">
                    <TabsTrigger
                        data-testid="graphTab"
                        asChild
                        value="Graph"
                    >
                        <Button
                            disabled={graph.getElements().length === 0}
                            className="tabs-trigger"
                            title="Graph"
                        >
                            <GitGraph />
                        </Button>
                    </TabsTrigger>
                    <TabsTrigger
                        data-testid="tableTab"
                        asChild
                        value="Table"
                    >
                        <Button
                            disabled={graph.Data.length === 0}
                            className="tabs-trigger"
                            title="Table"
                        >
                            <Table />
                        </Button>
                    </TabsTrigger>
                    <TabsTrigger
                        data-testid="metadataTab"
                        asChild
                        value="Metadata"
                    >
                        <Button
                            disabled={!graph.CurrentQuery || graph.CurrentQuery.metadata.length === 0 || graph.CurrentQuery.explain.length === 0 || graph.Metadata.length === 0}
                            className="tabs-trigger"
                            title="Metadata"
                        >
                            <Info />
                        </Button>
                    </TabsTrigger>
                </TabsList>
                <Controls
                    graph={graph}
                    tabsValue={tabsValue}
                    chartRef={chartRef}
                    disabled={graph.getElements().length === 0}
                    handleCooldown={handleCooldown}
                    cooldownTicks={cooldownTicks}
                    isLoading={isLoading}
                />
            </div>
            <TabsContent value="Graph" className="h-full w-full mt-0 overflow-hidden">
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
                    setLabels={setLabels}
                    parentHeight={parentHeight}
                    parentWidth={parentWidth}
                    setParentHeight={setParentHeight}
                    setParentWidth={setParentWidth}
                    loading={isLoading}
                    setLoading={setIsLoading}
                />
                {
                    !isLoading &&
                    <div className="h-full z-10 absolute top-12 inset-x-12 pointer-events-none flex gap-8">
                        {
                            (labels.length > 0 || categories.length > 0) &&
                            <Labels graph={graph} categories={categories} onClick={onCategoryClick} label="Labels" type="Graph" />
                        }
                        <div className="w-1 grow h-fit">
                            <Toolbar
                                graph={graph}
                                label="Graph"
                                setSelectedElement={setSelectedElement}
                                selectedElements={selectedElements}
                                handleDeleteElement={handleDeleteElement}
                                chartRef={chartRef}
                                isLoading={isLoading}
                                backgroundColor="bg-transparent"
                            />
                        </div>
                        {
                            (labels.length > 0 || categories.length > 0) &&
                            <Labels graph={graph} categories={labels} onClick={onLabelClick} label="Relationships" type="Graph" />
                        }
                    </div>
                }
                {
                    selectedElement &&
                    <GraphDataPanel
                        object={selectedElement}
                        setObject={setSelectedElement}
                        onDeleteElement={handleDeleteElement}
                        setCategories={setCategories}
                    />
                }
            </TabsContent>
            <TabsContent value="Table" className="h-1 grow w-full mt-0 overflow-hidden">
                <TableView />
            </TabsContent>
            <TabsContent value="Metadata" className="h-full w-full mt-0 overflow-hidden">
                <MetadataView
                    setQuery={({ profile }) => {
                        graph.CurrentQuery = {
                            ...graph.CurrentQuery,
                            profile: profile || []
                        }
                    }}
                    graphName={graph.Id}
                    query={graph.CurrentQuery}
                    fetchCount={fetchCount}
                />
            </TabsContent>
        </Tabs>
    )
}

GraphView.displayName = "GraphView";

export default GraphView;