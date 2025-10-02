'use client'

import { useContext, useState, useRef, useCallback, useEffect, useMemo } from "react";
import { cn, getSSEGraphResult, prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import { ForceGraphMethods } from "react-force-graph-2d";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { Label, Graph, GraphData, Link, Node, Relationship } from "../api/graph/model";
import { IndicatorContext, SchemaContext } from "../components/provider";
import Spinning from "../components/ui/spinning";
import SchemaDataPanel from "./SchemaDataPanel";
import SchemaCreateElement from "./SchemaCreateElement";

const Selector = dynamic(() => import("../graph/Selector"), {
    ssr: false,
    loading: () => <div className="h-[50px] flex flex-row gap-4 items-center justify-between">
        <div className="w-[230px] h-full animate-pulse rounded-md border border-border bg-background" />
        <div className="w-[220px] h-full animate-pulse rounded-md border border-border bg-background" />
    </div>
})
const SchemaView = dynamic(() => import("./SchemaView"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center border border-border rounded-lg">
        <Spinning />
    </div>
})

export default function Page() {

    const { setIndicator } = useContext(IndicatorContext)
    const {
        schema,
        setSchema,
        schemaName,
        setSchemaName,
        schemaNames,
        setSchemaNames
    } = useContext(SchemaContext)

    const { toast } = useToast()

    const panelRef = useRef<ImperativePanelHandle>(null)

    const [selectedNodes, setSelectedNodes] = useState<[Node | undefined, Node | undefined]>([undefined, undefined]);
    const [selectedElement, setSelectedElement] = useState<Node | Link | undefined>()
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([])
    const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0)
    const [labels, setLabels] = useState<Label[]>([])
    const [relationships, setRelationships] = useState<Relationship[]>([])
    const [data, setData] = useState<GraphData>(schema.Elements)
    const [isAddRelation, setIsAddRelation] = useState(false)
    const chartRef = useRef<ForceGraphMethods<Node, Link>>()
    const [edgesCount, setEdgesCount] = useState<number | undefined>()
    const [nodesCount, setNodesCount] = useState<number | undefined>()
    const [isAddEntity, setIsAddEntity] = useState(false)
    const [isCanvasLoading, setIsCanvasLoading] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(true)

    const [panelSize, graphSize] = useMemo(() => {
        if (selectedElement) return [30, 70]
        if (isAddEntity || isAddRelation) return [40, 60]
        return [0, 100]
    }, [selectedElement, isAddEntity, isAddRelation])

    const handleSetSelectedElement = useCallback((el: Node | Link | undefined) => {
        setSelectedElement(el)
        if (el) {
            setIsAddEntity(false)
            setIsAddRelation(false)
        }

        const currentPanel = panelRef.current

        if (!currentPanel) return

        if (el) currentPanel.expand()
        else currentPanel.collapse()
    }, [])

    const handleSetIsAddEntity = useCallback((isAdd: boolean) => {
        const currentPanel = panelRef.current
        setIsAddEntity(isAdd)

        if (isAdd) {
            setIsAddRelation(false)
            setSelectedElement(undefined)
        }

        if (!currentPanel) return

        if (isAdd) currentPanel.expand()
        else currentPanel.collapse()
    }, [])

    const handleSetIsAddRelation = useCallback((isAdd: boolean) => {
        const currentPanel = panelRef.current
        setIsAddRelation(isAdd)

        if (isAdd) {
            setIsAddEntity(false)
            setSelectedElement(undefined)
        }

        if (!currentPanel) return

        if (isAdd) currentPanel.expand()
        else currentPanel.collapse()
    }, [])

    const fetchCount = useCallback(async () => {
        setEdgesCount(undefined)
        setNodesCount(undefined)

        try {
            const result = await getSSEGraphResult(`api/schema/${prepareArg(schemaName)}/count`, toast, setIndicator)

            if (!result) return

            const { edges, nodes } = result

            setEdgesCount(edges)
            setNodesCount(nodes)
        } catch (error) {
            console.debug(error)
        }
    }, [toast, setIndicator, schemaName])

    const handleCooldown = (ticks?: 0, isSetLoading = true) => {
        setCooldownTicks(ticks)

        if (isSetLoading) setIsCanvasLoading(ticks !== 0)
        const canvas = document.querySelector('.force-graph-container canvas')

        if (!canvas) return

        canvas.setAttribute('data-engine-status', ticks === 0 ? 'stop' : 'running')
    }

    const fetchSchema = useCallback(async () => {
        const result = await securedFetch(`/api/schema/${prepareArg(schemaName)}`, {
            method: "GET"
        }, toast, setIndicator)
        if (!result.ok) return
        const json = await result.json()
        const schemaGraph = Graph.create(schemaName, json.result, false, true, 0)
        setSchema(schemaGraph)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.schema = schemaGraph

        fetchCount()

        if (schemaGraph.Elements.nodes.length > 0) {
            handleCooldown()
        }
    }, [fetchCount, setIndicator, setSchema, toast, schemaName])

    useEffect(() => {
        if (!schemaName) return

        fetchSchema()
    }, [schemaName, fetchSchema])

    const handleDeleteElement = async () => {
        const stateSelectedElements = Object.values(selectedElements)

        if (stateSelectedElements.length === 0 && selectedElement) {
            stateSelectedElements.push(selectedElement)
            setSelectedElement(undefined)
        }

        await Promise.all(stateSelectedElements.map(async (element) => {
            const { id } = element
            const type = !element.source
            const result = await securedFetch(`api/schema/${prepareArg(schema.Id)}/${prepareArg(id.toString())}`, {
                method: "DELETE",
                body: JSON.stringify({ type }),
            }, toast, setIndicator)

            if (!result.ok) return

            if (type) {
                schema.Elements.nodes.splice(schema.Elements.nodes.findIndex(node => node.id === element.id), 1)
                schema.NodesMap.delete(id)
            } else {
                schema.Elements.links.splice(schema.Elements.links.findIndex(link => link.id === element.id), 1)
                schema.LinksMap.delete(id)
            }

            if (type) {
                (element as Node).labels.forEach((labelName) => {
                    const label = schema.LabelsMap.get(labelName)

                    if (label) {
                        label.elements = label.elements.filter(n => n.id !== id)

                        if (label.elements.length === 0) {
                            schema.Labels.splice(schema.Labels.findIndex(l => l.name === label.name), 1)
                            schema.LabelsMap.delete(label.name)
                        }
                    }
                })
            } else {
                const relation = schema.RelationshipsMap.get(element.relationship)

                if (relation) {
                    relation.elements = relation.elements.filter(n => n.id !== id)

                    if (relation.elements.length === 0) {
                        schema.Relationships.splice(schema.Relationships.findIndex(r => r.name === relation.name), 1)
                        schema.RelationshipsMap.delete(relation.name)
                    }
                }
            }
        }))

        setRelationships(schema.removeLinks(selectedElements.map((element) => element.id)))
        fetchCount()
        setSelectedElement(undefined)
        setSelectedElements([])
        setData({ ...schema.Elements })
        handleCooldown()
    }

    const onCreateElement = async (attributes: [string, string[]][], elementLabel?: string[]) => {
        const fakeId = "-1"
        const result = await securedFetch(`api/schema/${prepareArg(schema.Id)}/${prepareArg(fakeId)}`, {
            method: "POST",
            body: JSON.stringify({ type: isAddEntity, label: elementLabel, attributes, selectedNodes })
        }, toast, setIndicator)

        if (result.ok) {
            const json = await result.json()

            if (isAddEntity) {
                const { labels: ls } = schema.extendNode(json.result.data[0].n, false, true, true)
                setLabels(prev => [...prev, ...ls.filter(c => !prev.some(p => p.name === c)).map(c => schema.LabelsMap.get(c)!)])
                handleSetIsAddEntity(false)
            } else {
                const { relationship } = schema.extendEdge(json.result.data[0].e, false, true)
                setRelationships(prev => [...prev, schema.RelationshipsMap.get(relationship)!])
                handleSetIsAddRelation(false)
            }

            fetchCount()

            setSelectedElement(undefined)
        }

        setData({ ...schema.Elements })

        handleCooldown()

        return result.ok
    }

    return (
        <div className="Page gap-8 p-8">
            <Selector
                type="Schema"
                graph={schema}
                options={schemaNames}
                setOptions={setSchemaNames}
                graphName={schemaName}
                setGraphName={setSchemaName}
                selectedElement={selectedElement}
                selectedElements={selectedElements}
                setSelectedElement={handleSetSelectedElement}
                handleDeleteElement={handleDeleteElement}
                chartRef={chartRef}
                setIsAddEntity={handleSetIsAddEntity}
                setIsAddRelation={handleSetIsAddRelation}
                setGraph={setSchema}
                isCanvasLoading={isCanvasLoading}
            />
            <ResizablePanelGroup direction="horizontal" className="h-1 grow">
                <ResizablePanel defaultSize={graphSize} minSize={50} maxSize={100}>
                    <SchemaView
                        edgesCount={edgesCount}
                        nodesCount={nodesCount}
                        selectedElement={selectedElement}
                        setSelectedElement={handleSetSelectedElement}
                        selectedElements={selectedElements}
                        setSelectedElements={setSelectedElements}
                        isAddRelation={isAddRelation}
                        chartRef={chartRef}
                        cooldownTicks={cooldownTicks}
                        handleCooldown={handleCooldown}
                        data={data}
                        setData={setData}
                        setLabels={setLabels}
                        setRelationships={setRelationships}
                        setSelectedNodes={setSelectedNodes}
                        labels={labels}
                        relationships={relationships}
                        isLoading={isCanvasLoading}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle onMouseUp={() => isCollapsed && handleSetSelectedElement(undefined)} className={cn("ml-6 w-0", isCollapsed && "hidden")} />
                <ResizablePanel
                    ref={panelRef}
                    collapsible
                    defaultSize={panelSize}
                    minSize={25}
                    maxSize={50}
                    onCollapse={() => {
                        setIsCollapsed(true)
                    }}
                    onExpand={() => {
                        setIsCollapsed(false)
                    }}
                >
                    {
                        selectedElement ?
                            <SchemaDataPanel
                                object={selectedElement}
                                setObject={handleSetSelectedElement}
                                onDeleteElement={handleDeleteElement}
                                schema={schema}
                                setLabels={setLabels}
                            />
                            : (isAddRelation || isAddEntity) &&
                            <SchemaCreateElement
                                onCreate={onCreateElement}
                                setIsAdd={isAddRelation ? handleSetIsAddRelation : handleSetIsAddEntity}
                                selectedNodes={selectedNodes}
                                setSelectedNodes={setSelectedNodes}
                                type={isAddEntity}
                            />
                    }
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}