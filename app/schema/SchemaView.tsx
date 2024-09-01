'use client'

import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import { ChevronLeft, Maximize2, Minimize2 } from "lucide-react"
import { ImperativePanelHandle } from "react-resizable-panels"
import { useEffect, useRef, useState } from "react"
import { Toast, cn, prepareArg, securedFetch } from "@/lib/utils"
import Toolbar from "../graph/toolbar"
import SchemaDataPanel, { Attribute } from "./SchemaDataPanel"
import Labels from "../graph/labels"
import { Category, Graph } from "../api/graph/model"
import Button from "../components/ui/Button"
import CreateElement from "./SchemaCreateElement"
import { darkTheme, GraphCanvas, GraphCanvasRef, GraphEdge, GraphNode, InternalGraphEdge, InternalGraphNode } from "reagraph"
import { Switch } from "@/components/ui/switch"

/* eslint-disable react/require-default-props */
interface Props {
    schema: Graph
    fetchCount?: () => void
}

const getCreateQuery = (type: boolean, selectedNodes: GraphNode[], attributes: [string, Attribute][], label?: string) => {
    if (type) {
        return `CREATE (n${label ? `:${label}` : ""}${attributes?.length > 0 ? ` {${attributes.map(([k, [t, d, u, un]]) => `${k}: ["${t}", "${d}", "${u}", "${un}"]`).join(",")}}` : ""}) RETURN n`
    }
    return `MATCH (a), (b) WHERE ID(a) = ${selectedNodes[0].id} AND ID(b) = ${selectedNodes[1].id} CREATE (a)-[e${label ? `:${label}` : ""}${attributes?.length > 0 ? ` {${attributes.map(([k, [t, d, u, un]]) => `${k}: ["${t}", "${d}", "${u}", "${un}"]`).join(",")}}` : ""}]->(b) RETURN e`
}

function SchemaView({ schema, fetchCount }: Props) {
    const [selectedElement, setSelectedElement] = useState<GraphNode | GraphEdge>();
    const [selectedNodes, setSelectedNodes] = useState<GraphNode[]>([]);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const dataPanel = useRef<ImperativePanelHandle>(null);
    const [isAddRelation, setIsAddRelation] = useState(false)
    const [isAddEntity, setIsAddEntity] = useState(false)
    const [maximize, setMaximize] = useState<boolean>(false)
    const [isThreeD, setIsThreeD] = useState<boolean>(false)
    const schemaRef = useRef<GraphCanvasRef>(null)

    useEffect(() => {
        setSelectedElement(undefined)
    }, [schema.Id])

    useEffect(() => {
        setSelectedNodes([])
    }, [isAddRelation])

    const onCategoryClick = (category: Category) => {
        category.show = !category.show
    }

    const onLabelClick = (label: Category) => {
        label.show = !label.show
    }

    const handelSetSelectedElement = (element?: (GraphNode | GraphEdge)) => {
        setSelectedElement(element)
        if (isAddRelation || isAddEntity) return
        if (element) {
            dataPanel.current?.expand()
        } else dataPanel.current?.collapse()
    }

    const handleSelectedNode = (node: InternalGraphNode) => {
        if (isAddRelation) {
            setSelectedNodes(prev => prev.length >= 2 ? [prev[prev.length - 1], node] : [...prev, node])
            return
        }
        node.size = 15
        handelSetSelectedElement(node);
    }

    const handleSelectedEdge = (edge: InternalGraphEdge) => {
        edge.size = 5
        handelSetSelectedElement(edge);
    }

    const handleUnselected = () => {
        handelSetSelectedElement();
    }

    const handleMouseOverNode = (node: InternalGraphNode) => {
        node.size = 15
    };

    const handleMouseOverEdge = (edge: InternalGraphEdge) => {
        edge.size = 15
    };

    const handleMouseOutNode = async (node: InternalGraphNode) => {
        node.size = 10
    };

    const handleMouseOutEdge = async (node: InternalGraphEdge) => {
        node.size = 10
    };

    const onExpand = () => {
        if (!dataPanel.current) return

        const panel = dataPanel.current

        if (panel.isExpanded()) {
            panel.collapse()
            setIsAddEntity(false)
            setIsAddRelation(false)
        } else {
            panel.expand()
        }
    }

    const handelDeleteElement = async () => {
        const type = selectedElement ? !("source" in selectedElement) : false
        const id = selectedElement?.id
        const q = `MATCH ${type ? "(e)" : "()-[e]-()"} WHERE ID(e) = ${id} DELETE e`
        const result = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)} `, {
            method: "GET"
        })

        if (!result.ok) return

        schema.updateCategories(type ? selectedElement?.data.category : selectedElement?.data.label, type)

        setSelectedElement(undefined)

        dataPanel.current?.collapse()
    }

    const handelSetAttribute = async (key: string, newVal: Attribute) => {
        if (!selectedElement) return false
        const type = selectedElement ? !("source" in selectedElement) : false
        const id = selectedElement?.id
        const q = `MATCH ${type ? "(e)" : "()-[e]-()"} WHERE ID(e) = ${id} SET e.${key} = "${newVal}"`
        const { ok } = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (ok) {
            if (type) {
                schema.Nodes.forEach(node => {
                    if (node.data.id !== selectedElement.id) return
                    node.data[key] = newVal
                })
            } else {
                schema.Edges.forEach(edge => {
                    if (edge.data.id !== selectedElement.id) return
                    edge.data[key] = newVal
                })
            }
        } else {
            Toast("Failed to set property")
        }

        return ok
    }

    const handelSetCategory = async (category: string) => {
        if (!selectedElement) return false
        const id = selectedElement?.id
        const q = `MATCH (n) WHERE ID(n) = ${id} REMOVE n:${selectedElement?.data.category} SET n:${category}`
        const success = (await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok

        if (success) {
            schema.Nodes.forEach(({ data }) => {
                if (data.id !== id) return

                // eslint-disable-next-line no-param-reassign
                data.category = category

                setSelectedElement({ ...selectedElement, data: { ...selectedElement.data, category } })

                schema.updateCategories(selectedElement?.data.category, true)
            })
        }
        return success
    }

    const handelRemoveProperty = async (key: string) => {
        if (!selectedElement) return false

        const type = selectedElement ? !("source" in selectedElement) : false
        const id = selectedElement?.id
        const q = `MATCH ${type ? "(e)" : "()-[e]-()"} WHERE ID(e) = ${id} SET e.${key} = null`
        const { ok } = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (!ok) return ok

        const s = schema
        s.Nodes.forEach(e => {
            if (e.data.id === id) {
                delete e.data[key]
            }

            return e
        })

        return ok
    }

    const onCreateElement = async (attributes: [string, Attribute][], label?: string) => {
        if (!isAddEntity && selectedNodes.length === 0) {
            Toast("Select nodes to create a relation")
            return false
        }

        const result = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${getCreateQuery(isAddEntity, selectedNodes, attributes, label)}`, {
            method: "GET"
        })

        if (result.ok) {
            const json = await result.json()

            if (isAddEntity) {
                setIsAddEntity(false)
            } else {
                setIsAddRelation(false)
            }

            if (fetchCount) fetchCount()

            onExpand()

        }

        return result.ok
    }


    return (
        <ResizablePanelGroup direction="horizontal" className={cn(maximize && "h-full p-10 bg-background fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%]")}>
            <ResizablePanel
                defaultSize={selectedElement ? 75 : 100}
                className={cn("flex flex-col gap-10", !isCollapsed && "mr-8")}
            >
                <div className="flex items-center justify-between">
                    <Toolbar
                        disabled={!schema.Id}
                        deleteDisabled={!selectedElement}
                        onAddEntity={() => {
                            setIsAddEntity(true)
                            setIsAddRelation(false)
                            setSelectedElement(undefined)
                            if (dataPanel.current?.isExpanded()) return
                            onExpand()
                        }}
                        onAddRelation={() => {
                            setIsAddRelation(true)
                            setIsAddEntity(false)
                            setSelectedElement(undefined)
                            if (dataPanel.current?.isExpanded()) return
                            onExpand()
                        }}
                        onDeleteElement={handelDeleteElement}
                        chartRef={schemaRef}
                        isThreeD={isThreeD}
                    />
                    {
                        isCollapsed &&
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
                            />
                    }
                    <div
                        className="z-10 absolute top-4 left-4 flex gap-3 items-center"
                    >
                        <div className="flex flex-col gap-2 items-center">
                            <p>Graph 3D</p>
                            <Switch
                                checked={isThreeD}
                                onCheckedChange={(checked) => setIsThreeD(checked)}
                            />
                        </div>
                    </div>
                    <GraphCanvas
                        ref={schemaRef}
                        nodes={schema.Nodes}
                        edges={schema.Edges}
                        theme={{
                            ...darkTheme,
                            canvas: {
                                background: "#434366"
                            }
                        }}
                        onNodeClick={handleSelectedNode}
                        onEdgeClick={handleSelectedEdge}
                        onCanvasClick={handleUnselected}
                        onNodePointerOver={handleMouseOverNode}
                        onNodePointerOut={handleMouseOutNode}
                        onEdgePointerOver={handleMouseOverEdge}
                        onEdgePointerOut={handleMouseOutEdge}
                        layoutType={isThreeD ? "forceDirected3d" : "forceDirected2d"}
                        cameraMode={isThreeD ? "rotate" : "pan"}
                        draggable
                    />
                    {
                        (schema.Categories.length > 0 || schema.Labels.length > 0) &&
                        <>
                            <Labels className="left-2" label="Categories" categories={schema.Categories} onClick={onCategoryClick} />
                            <Labels className="right-2 text-end" label="RelationshipTypes" categories={schema.Labels} onClick={onLabelClick} />
                        </>
                    }
                </div>
            </ResizablePanel>
            {
                !isCollapsed &&
                <ResizableHandle className="w-3" />
            }
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
                    selectedElement ?
                        <SchemaDataPanel
                            obj={selectedElement}
                            onExpand={onExpand}
                            onRemoveAttribute={handelRemoveProperty}
                            onSetAttribute={handelSetAttribute}
                            onDelete={handelDeleteElement}
                            onSetCategory={handelSetCategory}
                        />
                        : (isAddEntity || isAddRelation) &&
                        <CreateElement
                            onCreate={onCreateElement}
                            onExpand={onExpand}
                            selectedNodes={selectedNodes}
                            setSelectedNodes={setSelectedNodes}
                            type={isAddEntity}
                        />
                }
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}

SchemaView.displayName = "SchemaView"

export default SchemaView