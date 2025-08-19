/* eslint-disable no-param-reassign */

'use client'

import { useState, useEffect, Dispatch, SetStateAction, useContext, useCallback } from "react";
import { GitGraph, Info, Table } from "lucide-react"
import { cn, GraphRef } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraphContext } from "@/app/components/provider";
import { Label, GraphData, Link, Node, Relationship, HistoryQuery } from "../api/graph/model";
import Button from "../components/ui/Button";
import TableView from "./TableView";
import Toolbar from "./toolbar";
import Controls from "./controls";
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
    chartRef: GraphRef
    handleDeleteElement: () => Promise<void>
    setLabels: Dispatch<SetStateAction<Label[]>>
    setRelationships: Dispatch<SetStateAction<Relationship[]>>
    labels: Label[]
    relationships: Relationship[]
    isLoading: boolean
    handleCooldown: (ticks?: 0, isSetLoading?: boolean) => void
    cooldownTicks: number | undefined
    fetchCount: () => Promise<void>
    historyQuery: HistoryQuery
    setHistoryQuery: Dispatch<SetStateAction<HistoryQuery>>
}

function GraphView({
    data,
    setData,
    selectedElement,
    setSelectedElement,
    selectedElements,
    setSelectedElements,
    chartRef,
    handleDeleteElement,
    setLabels,
    setRelationships,
    labels,
    relationships,
    isLoading,
    handleCooldown,
    cooldownTicks,
    fetchCount,
    historyQuery,
    setHistoryQuery,
}: Props) {

    const { graph } = useContext(GraphContext)

    const [parentHeight, setParentHeight] = useState<number>(0)
    const [parentWidth, setParentWidth] = useState<number>(0)
    const [tabsValue, setTabsValue] = useState<Tab>("Graph")
    const elementsLength = graph.getElements().length

    useEffect(() => {
        setRelationships([...graph.Relationships])
        setLabels([...graph.Labels])
    }, [graph, graph.Relationships, graph.Labels, setRelationships, setLabels])

    const isTabEnabled = useCallback((tab: Tab) => {
        if (tab === "Graph") return graph.getElements().length !== 0
        if (tab === "Table") return graph.Data.length !== 0
        return historyQuery.currentQuery && historyQuery.currentQuery.metadata.length > 0 && graph.Metadata.length > 0 && historyQuery.currentQuery.explain.length > 0
    }, [graph])

    useEffect(() => {
        setData({ ...graph.Elements })

        if (!elementsLength) return;
        setData({ ...graph.Elements })
    }, [graph, elementsLength, setData])

    useEffect(() => {
        if (tabsValue !== "Metadata" && isTabEnabled(tabsValue)) return

        let defaultChecked: Tab = "Graph"
        if (graph.getElements().length !== 0) defaultChecked = "Graph"
        else if (graph.Data.length !== 0) defaultChecked = "Table"
        else if (historyQuery.currentQuery && historyQuery.currentQuery.metadata.length > 0 && graph.Metadata.length > 0 && historyQuery.currentQuery.explain.length > 0) defaultChecked = "Metadata"

        setTabsValue(defaultChecked);
    }, [graph, graph.Id, elementsLength, graph.Data.length, isTabEnabled])

    useEffect(() => {
        if (tabsValue === "Graph" && graph.Elements.nodes.length > 0) {
            handleCooldown()
        }
    }, [tabsValue])

    useEffect(() => {
        setSelectedElement(undefined)
        setSelectedElements([])
    }, [graph.Id, setSelectedElement, setSelectedElements])

    const onLabelClick = (label: Label) => {
        label.show = !label.show

        label.elements.forEach((node) => {
            if (!label.show && node.labels.some(c => graph.LabelsMap.get(c)?.show !== label.show)) return
            node.visible = label.show
        })

        graph.visibleLinks(label.show)

        graph.LabelsMap.set(label.name, label)
        setData({ ...graph.Elements })
    }

    const onRelationshipClick = (relationship: Relationship) => {
        relationship.show = !relationship.show

        relationship.elements.filter((link) => link.source.visible && link.target.visible).forEach((link) => {
            link.visible = relationship.show
        })

        graph.RelationshipsMap.set(relationship.name, relationship)
        setData({ ...graph.Elements })
    }

    return (
        <Tabs value={tabsValue} onValueChange={(value) => setTabsValue(value as Tab)} className={cn("h-full w-full relative border rounded-lg overflow-hidden", tabsValue === "Table" && "flex flex-col-reverse")}>
            <div className={cn("h-full w-full flex flex-col gap-4 absolute py-4 px-6 pointer-events-none z-20 justify-between")}>
                <div className="h-1 grow flex flex-col gap-6">
                    {
                        !isLoading && tabsValue === "Graph" &&
                        <>
                            <Toolbar
                                graph={graph}
                                label="Graph"
                                setSelectedElement={setSelectedElement}
                                selectedElements={selectedElements}
                                handleDeleteElement={handleDeleteElement}
                                chartRef={chartRef}
                                backgroundColor="bg-transparent"
                            />
                            {
                                (labels.length > 0 || relationships.length > 0) &&
                                <div className="w-fit flex flex-col h-full gap-4">
                                    <Labels labels={labels} onClick={onLabelClick} label="Labels" type="Graph" />
                                    <div className="h-1 bg-border rounded-full" />
                                    <Labels labels={relationships} onClick={onRelationshipClick} label="Relationships" type="Graph" />
                                </div>
                            }
                        </>
                    }
                </div>
                <div className="flex flex-col gap-6">
                    <GraphDetails
                        graph={graph}
                        tabsValue={tabsValue}
                    />
                    <div className="flex gap-2 items-center">
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
                                    disabled={!historyQuery.currentQuery || historyQuery.currentQuery.metadata.length === 0 || historyQuery.currentQuery.explain.length === 0 || graph.Metadata.length === 0}
                                    className="tabs-trigger"
                                    title="Metadata"
                                >
                                    <Info />
                                </Button>
                            </TabsTrigger>
                        </TabsList>
                        {
                            graph.getElements().length > 0 && tabsValue === "Graph" && !isLoading &&
                            <>
                                <div className="h-full w-1 bg-border rounded-full" />
                                <Controls
                                    graph={graph}
                                    chartRef={chartRef}
                                    disabled={graph.getElements().length === 0}
                                    handleCooldown={handleCooldown}
                                    cooldownTicks={cooldownTicks}
                                />
                            </>
                        }
                    </div>
                </div>
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
                    setRelationships={setRelationships}
                    parentHeight={parentHeight}
                    parentWidth={parentWidth}
                    setParentHeight={setParentHeight}
                    setParentWidth={setParentWidth}
                    isLoading={isLoading}
                    handleCooldown={handleCooldown}
                    cooldownTicks={cooldownTicks}
                />
            </TabsContent>
            <TabsContent value="Table" className="h-1 grow w-full mt-0 overflow-hidden">
                <TableView />
            </TabsContent>
            <TabsContent value="Metadata" className="h-full w-full mt-0 overflow-hidden">
                <MetadataView
                    setQuery={({ profile }) => {
                        setHistoryQuery(prev => {
                            const newQuery = {
                                ...prev.currentQuery,
                                profile: profile || []
                            }

                            const newQueries = prev.queries.map(q => q.text === newQuery.text ? newQuery : q)

                            localStorage.setItem("query history", JSON.stringify(newQueries))

                            return {
                                ...prev,
                                currentQuery: newQuery,
                                queries: newQueries
                            }
                        })
                    }}
                    graphName={graph.Id}
                    query={historyQuery.currentQuery}
                    fetchCount={fetchCount}
                />
            </TabsContent>
        </Tabs>
    )
}

GraphView.displayName = "GraphView";

export default GraphView;