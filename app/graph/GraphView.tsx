/* eslint-disable no-param-reassign */

'use client';

import { useEffect, Dispatch, SetStateAction, useContext, useCallback } from "react";
import { GitGraph, ScrollText, Table } from "lucide-react";
import { cn, GraphRef, Tab } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraphContext, ForceGraphContext } from "@/app/components/provider";
import ForceGraph from "@/app/components/ForceGraph";
import { Label, Link, Node, Relationship, HistoryQuery } from "../api/graph/model";
import Button from "../components/ui/Button";
import TableView from "./TableView";
import Toolbar from "./toolbar";
import Controls from "./controls";
import GraphDetails from "./GraphDetails";
import Labels from "./labels";
import MetadataView from "./MetadataView";

interface Props {
    selectedElements: (Node | Link)[]
    setSelectedElements: (elements?: (Node | Link)[]) => void
    canvasRef: GraphRef
    handleDeleteElement: () => Promise<void>
    setLabels: Dispatch<SetStateAction<Label[]>>
    setRelationships: Dispatch<SetStateAction<Relationship[]>>
    labels: Label[]
    relationships: Relationship[]
    handleCooldown: (ticks?: 0) => void
    cooldownTicks: number | undefined
    fetchCount: () => Promise<void>
    historyQuery: HistoryQuery
    setHistoryQuery: Dispatch<SetStateAction<HistoryQuery>>
    setIsAddNode: (isAddNode: boolean) => void
    setIsAddEdge: (isAddEdge: boolean) => void
    isAddNode: boolean
    isAddEdge: boolean
}

function GraphView({
    selectedElements,
    setSelectedElements,
    canvasRef,
    handleDeleteElement,
    setLabels,
    setRelationships,
    labels,
    relationships,
    handleCooldown,
    cooldownTicks,
    fetchCount,
    historyQuery,
    setHistoryQuery,
    setIsAddEdge,
    setIsAddNode,
    isAddEdge,
    isAddNode
}: Props) {

    const { graph, graphName, currentTab, setCurrentTab, isLoading, setIsLoading } = useContext(GraphContext);
    const { setData, data, graphData, setGraphData, setViewport, viewport } = useContext(ForceGraphContext);

    const elementsLength = graph.getElements().length;

    useEffect(() => {
        setRelationships([...graph.Relationships]);
        setLabels([...graph.Labels]);
    }, [graph, graph.Relationships, graph.Labels, setRelationships, setLabels]);

    const isTabEnabled = useCallback((tab: Tab) => {
        if (tab === "Table") return graph.Data.length !== 0;
        if (tab === "Metadata") return historyQuery.currentQuery && historyQuery.currentQuery.metadata.length > 0 && graph.Metadata.length > 0 && historyQuery.currentQuery.explain.length > 0;
        return true;
    }, [graph, historyQuery.currentQuery]);

    useEffect(() => {
        if (currentTab !== "Metadata" && isTabEnabled(currentTab)) return;

        let defaultChecked: Tab = "Graph";
        if (elementsLength === 0 && graph.Data.length !== 0) defaultChecked = "Table";

        setCurrentTab(defaultChecked);
    }, [graph, graph.Id, elementsLength, graph.Data.length, currentTab, setCurrentTab, isTabEnabled]);

    useEffect(() => {
        setSelectedElements([]);
    }, [graph.Id, setSelectedElements]);

    const onLabelClick = (label: Label) => {
        label.show = !label.show;

        label.elements.forEach((node) => {
            if (!label.show && node.labels.some(c => graph.LabelsMap.get(c)?.show !== label.show)) return;
            node.visible = label.show;
        });

        graph.visibleLinks(label.show);

        graph.LabelsMap.set(label.name, label);

        const canvas = canvasRef.current;

        if (canvas) {
            const currentData = canvas.getGraphData();
            currentData.nodes.forEach(canvasNode => {
                const appNode = graph.NodesMap.get(canvasNode.id);

                if (appNode) {
                    canvasNode.visible = appNode.visible;
                }
            });
            currentData.links.forEach(canvasLink => {
                const appLink = graph.LinksMap.get(canvasLink.id);

                if (appLink) {
                    canvasLink.visible = appLink.visible;
                }
            });
            canvas.setGraphData({ ...currentData });
        }
        
        setLabels([...graph.Labels]);
    };

    const onRelationshipClick = (relationship: Relationship) => {
        relationship.show = !relationship.show;

        relationship.elements.filter((link) => graph.NodesMap.get(link.source)?.visible && graph.NodesMap.get(link.target)?.visible).forEach((link) => {
            link.visible = relationship.show;
        });

        graph.RelationshipsMap.set(relationship.name, relationship);

        const canvas = canvasRef.current;

        if (canvas) {
            const currentData = canvas.getGraphData();
            currentData.nodes.forEach(canvasNode => {
                const appNode = graph.NodesMap.get(canvasNode.id);
                if (appNode) {
                    canvasNode.visible = appNode.visible;
                }
            });
            currentData.links.forEach(canvasLink => {
                const appLink = graph.LinksMap.get(canvasLink.id);
                if (appLink) {
                    canvasLink.visible = appLink.visible;
                }
            });
            canvas.setGraphData({ ...currentData });
        }

        setRelationships([...graph.Relationships]);
    };

    return (
        <Tabs data-testid="graphView" value={currentTab} onValueChange={(value) => setCurrentTab(value as Tab)} className={cn("h-full w-full relative border border-border rounded-lg overflow-hidden", currentTab === "Table" && "flex flex-col-reverse")}>
            <div className="h-full w-full flex flex-col gap-4 absolute p-2 pointer-events-none z-10 justify-between">
                <div className="grow basis-0 flex flex-col gap-2 overflow-hidden">
                    {
                        !isLoading && currentTab === "Graph" &&
                        <>
                            <Toolbar
                                graph={graph}
                                graphName={graphName}
                                label="Graph"
                                selectedElements={selectedElements}
                                setSelectedElements={setSelectedElements}
                                handleDeleteElement={handleDeleteElement}
                                canvasRef={canvasRef}
                                setIsAddEdge={selectedElements.length === 2 && selectedElements.every(e => "labels" in e) ? setIsAddEdge : undefined}
                                setIsAddNode={setIsAddNode}
                                isAddEdge={isAddEdge}
                                isAddNode={isAddNode}
                            />
                            {
                                (labels.length !== 0 || relationships.length !== 0) &&
                                <div className={cn("w-fit h-1 grow grid gap-2", labels.length !== 0 && relationships.length !== 0 ? "grid-rows-[minmax(0,max-content)_max-content_minmax(0,max-content)]" : "grid-rows-[minmax(0,max-content)]")}>
                                    {labels.length !== 0 && <Labels labels={labels} onClick={onLabelClick} label="Labels" type="Graph" />}
                                    {labels.length !== 0 && relationships.length > 0 && <div className="h-px bg-border rounded-full" />}
                                    {relationships.length !== 0 && <Labels labels={relationships} onClick={onRelationshipClick} label="Relationships" type="Graph" />}
                                </div>
                            }
                        </>
                    }
                </div>
                <div className="flex flex-col gap-4">
                    <GraphDetails
                        graph={graph}
                        tabsValue={currentTab}
                    />
                    <div className="flex gap-2 items-center">
                        <TabsList className="bg-transparent flex gap-2 pointer-events-auto p-0">
                            <TabsTrigger
                                data-testid="graphTab"
                                asChild
                                value="Graph"
                            >
                                <Button
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
                                    disabled={!isTabEnabled("Table")}
                                    className="tabs-trigger"
                                    title={!isTabEnabled("Table") ? "No Data" : "Table"}
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
                                    disabled={!isTabEnabled("Metadata")}
                                    className="tabs-trigger"
                                    title={!isTabEnabled("Metadata") ? "No Metadata" : "Metadata"}
                                >
                                    <ScrollText />
                                </Button>
                            </TabsTrigger>
                        </TabsList>
                        {
                            graph.getElements().length > 0 && currentTab === "Graph" && !isLoading &&
                            <>
                                <div className="h-full w-px bg-border rounded-full" />
                                <Controls
                                    graph={graph}
                                    canvasRef={canvasRef}
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
                    graphData={graphData}
                    setGraphData={setGraphData}
                    canvasRef={canvasRef}
                    selectedElements={selectedElements}
                    setSelectedElements={setSelectedElements}
                    setRelationships={setRelationships}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    cooldownTicks={cooldownTicks}
                    handleCooldown={handleCooldown}
                    viewport={viewport}
                    setViewport={setViewport}
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
                            };

                            const newQueries = prev.queries.map(q => q.text === newQuery.text ? newQuery : q);

                            localStorage.setItem("query history", JSON.stringify(newQueries));

                            return {
                                ...prev,
                                currentQuery: newQuery,
                                queries: newQueries
                            };
                        });
                    }}
                    graphName={graph.Id}
                    query={historyQuery.currentQuery}
                    fetchCount={fetchCount}
                />
            </TabsContent>
        </Tabs>
    );
}

GraphView.displayName = "GraphView";

export default GraphView;