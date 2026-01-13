'use client';

import { useContext, useState, useRef, useCallback, useEffect, useMemo } from "react";
import { cn, getSSEGraphResult, GraphRef, isTwoNodes, prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import type { GraphData as CanvasData } from "@falkordb/canvas";
import { Label, Graph, GraphData, Link, Node, Relationship } from "../api/graph/model";
import { IndicatorContext, SchemaContext } from "../components/provider";
import Spinning from "../components/ui/spinning";
import DataPanel from "./DataPanel";
import SchemaCreateElement from "./CreateElementPanel";

const Selector = dynamic(() => import("../graph/Selector"), {
    ssr: false,
    loading: () => <div className="h-[50px] flex flex-row gap-4 items-center justify-between">
        <div className="w-[230px] h-full animate-pulse rounded-md border border-border bg-background" />
        <div className="w-[220px] h-full animate-pulse rounded-md border border-border bg-background" />
    </div>
});
const SchemaView = dynamic(() => import("./SchemaView"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center border border-border rounded-lg">
        <Spinning />
    </div>
});

export default function Page() {

    const { setIndicator } = useContext(IndicatorContext);
    const {
        schema,
        setSchema,
        schemaName,
        setSchemaName,
        schemaNames,
        setSchemaNames
    } = useContext(SchemaContext);

    const { toast } = useToast();

    const panelRef = useRef<ImperativePanelHandle>(null);
    const canvasRef = useRef<GraphRef["current"]>(null);

    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([]);
    const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0);
    const [labels, setLabels] = useState<Label[]>([]);
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [data, setData] = useState<GraphData>(schema.Elements);
    const [graphData, setGraphData] = useState<CanvasData>();
    const [isAddEdge, setIsAddEdge] = useState(false);
    const [edgesCount, setEdgesCount] = useState<number | undefined>();
    const [nodesCount, setNodesCount] = useState<number | undefined>();
    const [isAddNode, setIsAddNode] = useState(false);
    const [isCanvasLoading, setIsCanvasLoading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const panelSize = useMemo(() => {
        if (selectedElements.length !== 0) return 30;
        if (isAddNode || isAddEdge) return 40;
        return 0;
    }, [selectedElements, isAddNode, isAddEdge]);

    const handleSetSelectedElements = useCallback((el: (Node | Link)[] = []) => {
        setSelectedElements(el);
        
        if (el.length !== 0) {
            setIsAddNode(false);
            setIsAddEdge(false);
        }

        const currentPanel = panelRef.current;

        if (!currentPanel) return;

        if (el) currentPanel.expand();
        else currentPanel.collapse();
    }, []);

    const handleSetIsAddNode = useCallback((isAdd: boolean) => {
        const currentPanel = panelRef.current;
        setIsAddNode(isAdd);

        if (isAdd) {
            setIsAddEdge(false);
            setSelectedElements([]);
        }

        if (!currentPanel) return;

        if (isAdd) currentPanel.expand();
        else currentPanel.collapse();
    }, []);

    const handleSetIsAddEdge = useCallback((isAdd: boolean) => {
        const currentPanel = panelRef.current;
        setIsAddEdge(isAdd);

        if (isAdd) {
            setIsAddNode(false);
            setSelectedElements([]);
        }

        if (!currentPanel) return;

        if (isAdd) currentPanel.expand();
        else currentPanel.collapse();
    }, []);

    const fetchCount = useCallback(async () => {
        setEdgesCount(undefined);
        setNodesCount(undefined);

        try {
            const result = await getSSEGraphResult(`api/schema/${prepareArg(schemaName)}/count`, toast, setIndicator) as { nodes?: number; edges?: number };

            if (!result) return;

            const { edges, nodes } = result;

            setEdgesCount(edges);
            setNodesCount(nodes);
        } catch (error) {
            console.error(error);
        }
    }, [toast, setIndicator, schemaName]);

    const handleCooldown = (ticks?: 0) => {
        setCooldownTicks(ticks);
    };

    const fetchSchema = useCallback(async () => {
        const result = await securedFetch(`/api/schema/${prepareArg(schemaName)}`, {
            method: "GET"
        }, toast, setIndicator);
        if (!result.ok) return;
        const json = await result.json();
        const schemaGraph = Graph.create(schemaName, json.result, false, true, 0);
        setSchema(schemaGraph);
        fetchCount();
    }, [fetchCount, setIndicator, setSchema, toast, schemaName]);

    useEffect(() => {
        if (!schemaName) return;

        fetchSchema();
    }, [schemaName, fetchSchema]);

    const handleDeleteElement = async () => {
        const stateSelectedElements = Object.values(selectedElements);

        await Promise.all(stateSelectedElements.map(async (element) => {
            const { id } = element;
            const type = !("source" in element);
            const result = await securedFetch(`api/schema/${prepareArg(schema.Id)}/${prepareArg(id.toString())}`, {
                method: "DELETE",
                body: JSON.stringify({ type }),
            }, toast, setIndicator);

            if (!result.ok) return;

            if (type) {
                schema.Elements.nodes.splice(schema.Elements.nodes.findIndex(node => node.id === element.id), 1);
                schema.NodesMap.delete(id);
            } else {
                schema.Elements.links.splice(schema.Elements.links.findIndex(link => link.id === element.id), 1);
                schema.LinksMap.delete(id);
            }

            if (type) {
                (element as Node).labels.forEach((labelName) => {
                    const label = schema.LabelsMap.get(labelName);

                    if (label) {
                        label.elements = label.elements.filter(n => n.id !== id);

                        if (label.elements.length === 0) {
                            schema.Labels.splice(schema.Labels.findIndex(l => l.name === label.name), 1);
                            schema.LabelsMap.delete(label.name);
                        }
                    }
                });
            } else {
                const relation = schema.RelationshipsMap.get(element.relationship);

                if (relation) {
                    relation.elements = relation.elements.filter(n => n.id !== id);

                    if (relation.elements.length === 0) {
                        schema.Relationships.splice(schema.Relationships.findIndex(r => r.name === relation.name), 1);
                        schema.RelationshipsMap.delete(relation.name);
                    }
                }
            }
        }));

        setRelationships(schema.removeLinks(selectedElements.map((element) => element.id)));
        fetchCount();
        setSelectedElements([]);
        setData({ ...schema.Elements });
    };

    const handleCreateElement = async (attributes: [string, string[]][], elementLabel: string[]) => {
        const fakeId = "-1";
        const result = await securedFetch(`api/schema/${prepareArg(schemaName)}/${prepareArg(fakeId)}`, {
            method: "POST",
            body: JSON.stringify({ type: isAddNode, label: elementLabel, attributes, selectedNodes: isAddNode ? undefined : selectedElements })
        }, toast, setIndicator);

        if (result.ok) {
            const json = await result.json();

            if (isAddNode) {
                const { labels: ls } = schema.extendNode(json.result.data[0].n, false, true, true);
                setLabels(prev => [...prev, ...ls.filter(c => !prev.some(p => p.name === c)).map(c => schema.LabelsMap.get(c)!)]);
                handleSetIsAddNode(false);
            } else {
                const link = schema.extendEdge(json.result.data[0].e, false, true);
                setRelationships(prev => [...prev.filter(p => p.name !== link.relationship), schema.RelationshipsMap.get(link.relationship)!]);
                handleSetIsAddEdge(false);
            }

            fetchCount();

            setSelectedElements([]);
        }

        setData({ ...schema.Elements });

        return result.ok;
    };

    const getCurrentPanel = () => {
        if (selectedElements.length !== 0) {
            return (
                <DataPanel
                    object={selectedElements[selectedElements.length - 1]}
                    setObject={handleSetSelectedElements}
                    schema={schema}
                    setLabels={setLabels}
                    setData={setData}
                />
            );
        }

        if (isAddNode) {
            return (
                <SchemaCreateElement
                    onCreate={handleCreateElement}
                    setIsAdd={handleSetIsAddNode}
                    type
                />
            );
        }

        if (isTwoNodes(selectedElements)) {
            return (
                <SchemaCreateElement
                    onCreate={handleCreateElement}
                    setIsAdd={handleSetIsAddEdge}
                    selectedNodes={selectedElements}
                    setSelectedNodes={setSelectedElements}
                    type={false}
                />
            );
        }

        return null;
    };

    return (
        <div className="Page gap-8 p-8">
            <Selector
                type="Schema"
                graph={schema}
                options={schemaNames}
                setOptions={setSchemaNames}
                graphName={schemaName}
                setGraphName={setSchemaName}
                selectedElements={selectedElements}
                setSelectedElements={setSelectedElements}
                handleDeleteElement={handleDeleteElement}
                canvasRef={canvasRef}
                setIsAddNode={handleSetIsAddNode}
                setIsAddEdge={handleSetIsAddEdge}
                setGraph={setSchema}
                isCanvasLoading={isCanvasLoading}
                isAddEdge={isAddEdge}
                isAddNode={isAddNode}
            />
            <ResizablePanelGroup direction="horizontal" className="h-1 grow">
                <ResizablePanel
                    defaultSize={100 - panelSize}
                    collapsible
                    minSize={30}
                >
                    <SchemaView
                        edgesCount={edgesCount}
                        nodesCount={nodesCount}
                        selectedElements={selectedElements}
                        setSelectedElements={handleSetSelectedElements}
                        canvasRef={canvasRef}
                        cooldownTicks={cooldownTicks}
                        handleCooldown={handleCooldown}
                        data={data}
                        setData={setData}
                        graphData={graphData}
                        setGraphData={setGraphData}
                        setLabels={setLabels}
                        setRelationships={setRelationships}
                        labels={labels}
                        relationships={relationships}
                        isLoading={isCanvasLoading}
                        setIsLoading={setIsCanvasLoading}
                    />
                </ResizablePanel>
                <ResizableHandle
                    withHandle
                    onMouseUp={() => isCollapsed && handleSetSelectedElements()}
                    className={cn("ml-6 w-0", isCollapsed && "hidden")}
                />
                <ResizablePanel
                    ref={panelRef}
                    collapsible
                    defaultSize={panelSize}
                    minSize={30}
                    onCollapse={() => {
                        setIsCollapsed(true);
                    }}
                    onExpand={() => {
                        setIsCollapsed(false);
                    }}
                >
                    {getCurrentPanel()}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}