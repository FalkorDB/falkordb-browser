/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/exhaustive-deps */

'use client'

import { useState, useEffect, Dispatch, SetStateAction, useContext } from "react";
import { GitGraph, Info, Table } from "lucide-react"
import { GraphRef, Query } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraphContext } from "@/app/components/provider";
import { Category, GraphData, Link, Node } from "../api/graph/model";
import Labels from "./labels";
import Button from "../components/ui/Button";
import TableView from "./TableView";
import MetadataView from "./MetadataView";
import Toolbar from "./toolbar";
import Controls from "./controls";
import GraphDataPanel from "./GraphDataPanel";
import GraphDetails from "./GraphDetails";

const ForceGraph = dynamic(() => import("../components/ForceGraph"), { ssr: false });

interface Props {
    data: GraphData
    setData: Dispatch<SetStateAction<GraphData>>
    selectedElement: Node | Link | undefined
    setSelectedElement: Dispatch<SetStateAction<Node | Link | undefined>>
    selectedElements: (Node | Link)[]
    setSelectedElements: Dispatch<SetStateAction<(Node | Link)[]>>
    currentQuery: Query | undefined
    nodesCount: number
    edgesCount: number
    fetchCount: () => void
    handleCooldown: (ticks?: number) => void
    cooldownTicks: number | undefined
    chartRef: GraphRef
    handleDeleteElement: () => Promise<void>
    setLabels: Dispatch<SetStateAction<Category[]>>
    setCategories: Dispatch<SetStateAction<Category[]>>
    labels: Category[]
    categories: Category[]
}

function GraphView({
    data,
    setData,
    selectedElement,
    setSelectedElement,
    selectedElements,
    setSelectedElements,
    currentQuery,
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

    const [tabsValue, setTabsValue] = useState<string>("")
    const { graph } = useContext(GraphContext)

    useEffect(() => {
        setCategories([...graph.Categories])
        setLabels([...graph.Labels])
    }, [graph, graph.Categories, graph.Labels])

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

    useEffect(() => {
        if (tabsValue === "Graph") {
            handleCooldown()
        }
    }, [tabsValue])

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

    return (
        <Tabs value={tabsValue} className="h-full w-full relative border rounded-lg overflow-hidden">
            <div className="absolute bottom-4 inset-x-12 pointer-events-none z-10 flex gap-4 justify-between items-center">
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
                            onClick={() => setTabsValue("Graph")}
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
                            onClick={() => setTabsValue("Table")}
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
                            disabled={!currentQuery || currentQuery.metadata.length === 0 || currentQuery.explain.length === 0 || graph.Metadata.length === 0}
                            className="tabs-trigger"
                            onClick={() => setTabsValue("Metadata")}
                            title="Metadata"
                        >
                            <Info />
                        </Button>
                    </TabsTrigger>
                </TabsList>
                <Controls
                    tabsValue={tabsValue}
                    chartRef={chartRef}
                    disabled={graph.getElements().length === 0}
                    handleCooldown={handleCooldown}
                    cooldownTicks={cooldownTicks}
                />
            </div>
            <TabsContent value="Graph" className="h-full w-full mt-0 overflow-hidden">
                <ForceGraph
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
                />
                <div className="h-full z-10 absolute top-12 inset-x-12 pointer-events-none flex gap-8">
                    {
                        (labels.length > 0 || categories.length > 0) &&
                        <Labels categories={categories} onClick={onCategoryClick} label="Labels" type="Graph" />
                    }
                    <div className="w-1 grow h-fit">
                        <Toolbar
                            label="Graph"
                            setSelectedElement={setSelectedElement}
                            selectedElements={selectedElements}
                            handleDeleteElement={handleDeleteElement}
                            chartRef={chartRef}
                            backgroundColor="bg-transparent"
                        />
                    </div>
                    {
                        (labels.length > 0 || categories.length > 0) &&
                        <Labels categories={labels} onClick={onLabelClick} label="RelationshipTypes" type="Graph" />
                    }
                </div>
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
            <TabsContent value="Table" className="h-full w-full mt-0 overflow-hidden">
                <TableView />
            </TabsContent>
            <TabsContent value="Metadata" className="h-full w-full mt-0 overflow-hidden">
                <MetadataView
                    query={currentQuery!}
                    fetchCount={fetchCount}
                />
            </TabsContent>
        </Tabs>
    )
}

GraphView.displayName = "GraphView";

export default GraphView;