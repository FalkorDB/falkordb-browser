/* eslint-disable no-param-reassign */

'use client'

import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import { ChevronLeft, Maximize2, Minimize2 } from "lucide-react"
import { ImperativePanelHandle } from "react-resizable-panels"
import { useEffect, useRef, useState } from "react"
import { Toast, cn, prepareArg, securedFetch } from "@/lib/utils"
import { Session } from "next-auth"
import dynamic from "next/dynamic"
import Toolbar from "../graph/toolbar"
import SchemaDataPanel from "./SchemaDataPanel"
import Labels from "../graph/labels"
import { Category, Graph, Link, Node, GraphData } from "../api/graph/model"
import Button from "../components/ui/Button"
import CreateElement from "./SchemaCreateElement"

const ForceGraph = dynamic(() => import("../components/ForceGraph"), { ssr: false })

/* eslint-disable react/require-default-props */
interface Props {
    schema: Graph
    fetchCount?: () => void
    session: Session | null
}

const getCreateQuery = (type: boolean, selectedNodes: [Node, Node], attributes: [string, string[]][], label?: string) => {
    if (type) {
        return `CREATE (n${label ? `:${label}` : ""}${attributes?.length > 0 ? ` {${attributes.map(([k, [t, d, u, r]]) => `${k}: ["${t}", "${d}", "${u}", "${r}"]`).join(",")}}` : ""}) RETURN n`
    }
    return `MATCH (a), (b) WHERE ID(a) = ${selectedNodes[0].id} AND ID(b) = ${selectedNodes[1].id} CREATE (a)-[e${label ? `:${label}` : ""}${attributes?.length > 0 ? ` {${attributes.map(([k, [t, d, u, un]]) => `${k}: ["${t}", "${d}", "${u}", "${un}"]`).join(",")}}` : ""}]->(b) RETURN e`
}

export default function SchemaView({ schema, fetchCount, session }: Props) {
    const [selectedElement, setSelectedElement] = useState<Node | Link | undefined>();
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([]);
    const [selectedNodes, setSelectedNodes] = useState<[Node | undefined, Node | undefined]>([undefined, undefined]);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const chartRef = useRef<cytoscape.Core | null>(null);
    const dataPanel = useRef<ImperativePanelHandle>(null);
    const [isAddRelation, setIsAddRelation] = useState(false)
    const [isAddEntity, setIsAddEntity] = useState(false)
    const [maximize, setMaximize] = useState<boolean>(false)
    const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0)
    const [cooldownTime, setCooldownTime] = useState<number | undefined>(2000)
    const [data, setData] = useState<GraphData>(schema.Elements)

    useEffect(() => {
        setData({ ...schema.Elements })
    }, [schema.Id])

    useEffect(() => {
        dataPanel.current?.collapse()
    }, [])

    useEffect(() => {
        setSelectedElement(undefined)
        setSelectedElements([])
    }, [schema.Id])

    useEffect(() => {
        setSelectedNodes([undefined, undefined])
    }, [isAddRelation])

    const handelCooldown = () => {
        setCooldownTicks(1000)
    }

    const onCategoryClick = (category: Category) => {
        category.show = !category.show
        schema.Elements.nodes.forEach((node) => {
            if (node.category[0] !== category.name) return
            node.visible = category.show
        })

        schema.visibleLinks(category.show)

        setData({ ...schema.Elements })
    }

    const onLabelClick = (label: Category) => {
        label.show = !label.show
        schema.Elements.links.forEach((link) => {
            if (link.label !== label.name) return
            link.visible = label.show
        })

        setData({ ...schema.Elements })
    }

    const handelSetSelectedElement = (element?: Node | Link | undefined) => {
        setSelectedElement(element)
        if (isAddRelation || isAddEntity) return
        if (element) {
            dataPanel.current?.expand()
        } else dataPanel.current?.collapse()
    }

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
        const stateSelectedElements = Object.values(selectedElements)

        if (stateSelectedElements.length === 0 && selectedElement) {
            stateSelectedElements.push(selectedElement)
            setSelectedElement(undefined)
        }

        const conditionsNodes: string[] = []
        const conditionsEdges: string[] = []

        stateSelectedElements.forEach((element) => {
            const { id } = element
            if (element.source) {
                conditionsEdges.push(`id(e) = ${id}`)
            } else {
                conditionsNodes.push(`id(n) = ${id}`)
            }
        })

        const q = `${conditionsNodes.length > 0 ? `MATCH (n) WHERE ${conditionsNodes.join(" OR ")} DELETE n` : ""}${conditionsEdges.length > 0 && conditionsNodes.length > 0 ? " WITH * " : ""}${conditionsEdges.length > 0 ? `MATCH ()-[e]-() WHERE ${conditionsEdges.join(" OR ")} DELETE e` : ""}`
        const result = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)} `, {
            method: "GET"
        })

        if (!result.ok) return

        stateSelectedElements.forEach((element) => {
            const { id } = element
            const type = !("source" in element)
            if (type) {
                schema.Elements.nodes.splice(schema.Elements.nodes.findIndex(node => node.id === element.id), 1)
                schema.NodesMap.delete(id)
            } else {
                schema.Elements.links.splice(schema.Elements.links.findIndex(link => link.id === element.id), 1)
                schema.EdgesMap.delete(id)
            }
            if (fetchCount) fetchCount()

            schema.updateCategories(type ? element.category : element.label, type)
        })

        schema.removeLinks()

        setSelectedElement(undefined)
        setSelectedElements([])
        setData({ ...schema.Elements })

        dataPanel.current?.collapse()
    }

    const handelSetAttributes = async (attribute: [string, string[]]) => {
        const [key, value] = attribute;
        if (!selectedElement) return false

        const type = !("source" in selectedElement)
        const { id } = selectedElement
        const q = `MATCH ${type ? "(e)" : "()-[e]-()"} WHERE ID(e) = ${id} SET e.${key} = "${value.join(",")}"`
        const { ok } = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (ok) {
            if (type) {
                schema.Elements.nodes.forEach((node) => {
                    if (node.id !== selectedElement.id) return
                    node.data[key] = value;
                })
            } else {
                schema.Elements.links.forEach((link) => {
                    if (link.id !== selectedElement.id) return
                    link.data[key] = value;
                })
            }
        } else {
            Toast("Failed to set property")
        }

        setData({ ...schema.Elements })

        return ok
    }

    // const handelSetCategory = async (category: string) => {
    //     if (!selectedElement) return false

    //     const { id } = getElementId(selectedElement)
    //     const q = `MATCH (n) WHERE ID(n) = ${id} REMOVE n:${selectedElement.category} SET n:${category}`
    //     const success = (await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)}`, {
    //         method: "GET"
    //     })).ok

    //     if (success) {
    //         schema.Elements.forEach(({ data: d }) => {
    //             if (d.id !== id) return

    //             // eslint-disable-next-line no-param-reassign
    //             d.category = category

    //             setSelectedElement({ ...selectedElement, category })

    //             const prevCategory = schema.CategoriesMap.get(selectedElement.category) as Category

    //             schema.updateCategories(prevCategory.name, true)

    //             const [c] = schema.createCategory([category])

    //             chartRef.current?.elements().forEach(n => {
    //                 if (n.data().category === category) {
    //                     // eslint-disable-next-line no-param-reassign
    //                     n.data().category = category
    //                     // eslint-disable-next-line no-param-reassign
    //                     n.data().color = schema.getCategoryColorValue(c.index)
    //                 }
    //             });
    //             chartRef.current?.elements().layout(LAYOUT).run();

    //         })
    //     }
    //     return success
    // }

    const handelRemoveProperty = async (key: string) => {
        if (!selectedElement) return false

        const type = !("source" in selectedElement)
        const { id } = selectedElement
        const q = `MATCH ${type ? "(e)" : "()-[e]-()"} WHERE ID(e) = ${id} SET e.${key} = NULL`
        const { ok } = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (ok) {
            if (type) {
                schema.Elements.nodes.forEach((node) => {
                    if (node.id === id) {
                        delete node.data[key]
                    }

                    return node
                })
            } else {
                schema.Elements.links.forEach((link) => {
                    if (link.id === id) {
                        delete link.data[key]
                    }

                    return link
                })
            }
        }

        setData({ ...schema.Elements })

        return ok
    }

    const onCreateElement = async (attributes: [string, string[]][], label?: string) => {
        if (!isAddEntity && selectedNodes[0] === undefined && selectedNodes[1] === undefined) {
            Toast("Select nodes to create a relation")
            return false
        }

        const result = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${getCreateQuery(isAddEntity, selectedNodes as [Node, Node], attributes, label)}`, {
            method: "GET"
        })

        if (result.ok) {
            const json = await result.json()

            if (isAddEntity) {
                schema.extendNode(json.result.data[0].n)
                setIsAddEntity(false)
            } else {
                schema.extendEdge(json.result.data[0].e, true)
                setIsAddRelation(false)
            }

            if (fetchCount) fetchCount()

            onExpand()

        }

        setData({ ...schema.Elements })

        return result.ok
    }

    return (
        <ResizablePanelGroup direction="horizontal" className={cn(maximize && "h-full p-10 bg-background fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%]")}>
            <ResizablePanel
                defaultSize={50}
                className={cn("flex flex-col gap-10", !isCollapsed && "mr-8")}
            >
                <div className="flex items-center justify-between">
                    <Toolbar
                        disabled={!schema.Id}
                        deleteDisabled={Object.values(selectedElements).length === 0 && !selectedElement}
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
                        chartRef={chartRef}
                        addDisabled={session?.user.role === "Read-Only"}
                        setCooldownTime={setCooldownTime}
                        cooldownTime={cooldownTime}
                        handelCooldown={handelCooldown}
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
                    <ForceGraph
                        chartRef={chartRef}
                        data={data}
                        graph={schema}
                        selectedElement={selectedElement}
                        setSelectedElement={handelSetSelectedElement}
                        selectedElements={selectedElements}
                        setSelectedElements={setSelectedElements}
                        cooldownTicks={cooldownTicks}
                        setCooldownTicks={setCooldownTicks}
                        cooldownTime={cooldownTime}
                        type="schema"
                        isAddElement={isAddEntity || isAddRelation}
                        setSelectedNodes={setSelectedNodes}
                    />
                    {
                        (schema.Categories.length > 0 || schema.Labels.length > 0) &&
                        <>
                            <Labels className="left-2" label="Categories" categories={schema.Categories} onClick={onCategoryClick} graph={schema} />
                            <Labels className="right-2 text-end" label="RelationshipTypes" categories={schema.Labels} onClick={onLabelClick} graph={schema} />
                        </>
                    }
                </div>
            </ResizablePanel>
            <ResizableHandle disabled={isCollapsed} className={cn(isCollapsed ? "w-0 !cursor-default" : "w-3")} />
            <ResizablePanel
                className="rounded-lg"
                collapsible
                ref={dataPanel}
                defaultSize={50}
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
                            onSetAttributes={handelSetAttributes}
                            onRemoveAttribute={handelRemoveProperty}
                            onDeleteElement={handelDeleteElement}
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