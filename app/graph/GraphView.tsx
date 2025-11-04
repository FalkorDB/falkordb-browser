/* eslint-disable no-param-reassign */

'use client'

import { useState, useEffect, Dispatch, SetStateAction, useContext, useCallback } from "react";
import { GitGraph, Info, Table } from "lucide-react"
import { cn, GraphRef, Tab } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraphContext, ViewportContext } from "@/app/components/provider";
import { Label, Link, Node, Relationship, HistoryQuery } from "../api/graph/model";
import Button from "../components/ui/Button";
import TableView from "./TableView";
import Toolbar from "./toolbar";
import Controls from "./controls";
import GraphDetails from "./GraphDetails";
import Labels from "./labels";
import MetadataView from "./MetadataView";
import ForceGraph from "../components/ForceGraph";

interface Props {
    selectedElement: Node | Link | undefined
    setSelectedElement: (el: Node | Link | undefined) => void
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

    const { graph, currentTab, setCurrentTab } = useContext(GraphContext)
    const { setData, data, isSaved, setViewport, viewport } = useContext(ViewportContext)

    const [parentHeight, setParentHeight] = useState<number>(0)
    const [parentWidth, setParentWidth] = useState<number>(0)
    const elementsLength = graph.getElements().length

    useEffect(() => {
        setRelationships([...graph.Relationships])
        setLabels([...graph.Labels])
    }, [graph, graph.Relationships, graph.Labels, setRelationships, setLabels])

    const isTabEnabled = useCallback((tab: Tab) => {
        if (tab === "Graph") return elementsLength !== 0
        if (tab === "Table") return graph.Data.length !== 0
        return historyQuery.currentQuery && historyQuery.currentQuery.metadata.length > 0 && graph.Metadata.length > 0 && historyQuery.currentQuery.explain.length > 0
    }, [graph, elementsLength, historyQuery.currentQuery])

    useEffect(() => {
        if (currentTab !== "Metadata" && isTabEnabled(currentTab)) return

        let defaultChecked: Tab = "Graph"
        if (elementsLength !== 0) defaultChecked = "Graph"
        else if (graph.Data.length !== 0) defaultChecked = "Table"
        else if (historyQuery.currentQuery && historyQuery.currentQuery.metadata.length > 0 && graph.Metadata.length > 0 && historyQuery.currentQuery.explain.length > 0) defaultChecked = "Metadata"

        setCurrentTab(defaultChecked);
    }, [graph, graph.Id, elementsLength, graph.Data.length])

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
        <Tabs data-testid="graphView" value={currentTab} onValueChange={(value) => setCurrentTab(value as Tab)} className={cn("h-full w-full relative border border-border rounded-lg overflow-hidden", currentTab === "Table" && "flex flex-col-reverse")}>
            <div className="h-full w-full flex flex-col gap-4 absolute py-4 px-6 pointer-events-none z-10 justify-between">
                <div className="grow basis-0 flex flex-col gap-6 overflow-hidden">
                    {
                        !isLoading && currentTab === "Graph" &&
                        <>
                            <Toolbar
                                graph={graph}
                                label="Graph"
                                selectedElement={selectedElement}
                                setSelectedElement={setSelectedElement}
                                selectedElements={selectedElements}
                                handleDeleteElement={handleDeleteElement}
                                chartRef={chartRef}
                            />
                            {
                                (labels.length !== 0 || relationships.length !== 0) &&
                                <div className={cn("w-fit h-1 grow grid gap-4", labels.length !== 0 && relationships.length !== 0 ? "grid-rows-[minmax(0,max-content)_max-content_minmax(0,max-content)]" : "grid-rows-[minmax(0,max-content)]")}>
                                    {labels.length !== 0 && <Labels labels={labels} onClick={onLabelClick} label="Labels" type="Graph" />}
                                    {labels.length !== 0 && relationships.length > 0 && <div className="h-px bg-border rounded-full" />}
                                    {relationships.length !== 0 && <Labels labels={relationships} onClick={onRelationshipClick} label="Relationships" type="Graph" />}
                                </div>
                            }
                        </>
                    }
                </div>
                <div className="flex flex-col gap-6">
                    <GraphDetails
                        graph={graph}
                        tabsValue={currentTab}
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
                                    title={graph.getElements().length === 0 ? "No Elements" : "Graph"}
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
                                    title={graph.Data.length === 0 ? "No Data" : "Table"}
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
                                    title={!historyQuery.currentQuery || historyQuery.currentQuery.metadata.length === 0 || historyQuery.currentQuery.explain.length === 0 || graph.Metadata.length === 0 ? "No Metadata" : "Metadata"}
                                >
                                    <Info />
                                </Button>
                            </TabsTrigger>
                        </TabsList>
                        {
                            graph.getElements().length > 0 && currentTab === "Graph" && !isLoading &&
                            <>
                                <div className="h-full w-px bg-border rounded-full" />
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
                    data={data}
                    setData={setData}
                    chartRef={chartRef}
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
                    currentTab={currentTab}
                    viewport={viewport}
                    setViewport={setViewport}
                    isSaved={isSaved}
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