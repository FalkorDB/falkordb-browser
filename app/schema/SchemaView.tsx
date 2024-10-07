'use client'

import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import CytoscapeComponent from "react-cytoscapejs"
import { ChevronLeft, Maximize2, Minimize2 } from "lucide-react"
import cytoscape, { EdgeSingular, EventObject, NodeDataDefinition } from "cytoscape"
import { ImperativePanelHandle } from "react-resizable-panels"
import { useEffect, useRef, useState } from "react"
import fcose from "cytoscape-fcose";
import { ElementDataDefinition, Toast, cn, prepareArg, securedFetch } from "@/lib/utils"
import Toolbar from "../graph/toolbar"
import SchemaDataPanel, { Attribute } from "./SchemaDataPanel"
import Labels from "../graph/labels"
import { Category, Graph } from "../api/graph/model"
import Button from "../components/ui/Button"
import CreateElement from "./SchemaCreateElement"

/* eslint-disable react/require-default-props */
interface Props {
    schema: Graph
    fetchCount?: () => void
}

const LAYOUT = {
    name: "fcose",
    fit: true,
    padding: 30,
}

cytoscape.use(fcose);

function getStyle() {

    const style: cytoscape.Stylesheet[] = [
        {
            selector: "core",
            style: {
                'active-bg-size': 0,  // hide gray circle when panning
                // All of the following styles are meaningless and are specified
                // to satisfy the linter...
                'active-bg-color': 'blue',
                'active-bg-opacity': 0.3,
                "selection-box-border-color": 'gray',
                "selection-box-border-width": 3,
                "selection-box-opacity": 0.5,
                "selection-box-color": 'gray',
                "outside-texture-bg-color": 'blue',
                "outside-texture-bg-opacity": 1,
            },
        },
        {
            selector: "node",
            style: {
                label: "data(category)",
                "color": "white",
                "text-valign": "center",
                "text-wrap": "ellipsis",
                "text-max-width": "10rem",
                shape: "ellipse",
                height: "15rem",
                width: "15rem",
                "border-width": 0.3,
                "border-color": "white",
                "border-opacity": 1,
                "background-color": "data(color)",
                "font-size": "3rem",
                "overlay-padding": "1rem",
            },
        },
        {
            selector: "node:active",
            style: {
                "overlay-opacity": 0,  // hide gray box around active node
            },
        },
        {
            selector: "edge",
            style: {
                width: 1,
                "line-color": "data(color)",
                "line-opacity": 0.7,
                "arrow-scale": 0.7,
                "target-arrow-color": "data(color)",
                "target-arrow-shape": "triangle",
                'curve-style': 'straight',
            },
        },
        {
            selector: "edge:active",
            style: {
                "overlay-opacity": 0,
            },
        }
    ]
    return style
}

const getElementId = (element: ElementDataDefinition) => element.source ? { id: element.id?.slice(1), query: "()-[e]-()" } : { id: element.id, query: "(e)" }

const getCreateQuery = (type: boolean, selectedNodes: NodeDataDefinition[], attributes: [string, Attribute][], label?: string) => {
    if (type) {
        return `CREATE (n${label ? `:${label}` : ""}${attributes?.length > 0 ? ` {${attributes.map(([k, [t, d, u, un]]) => `${k}: ["${t}", "${d}", "${u}", "${un}"]`).join(",")}}` : ""}) RETURN n`
    }
    return `MATCH (a), (b) WHERE ID(a) = ${selectedNodes[0].id} AND ID(b) = ${selectedNodes[1].id} CREATE (a)-[e${label ? `:${label}` : ""}${attributes?.length > 0 ? ` {${attributes.map(([k, [t, d, u, un]]) => `${k}: ["${t}", "${d}", "${u}", "${un}"]`).join(",")}}` : ""}]->(b) RETURN e`
}

export default function SchemaView({ schema, fetchCount }: Props) {
    const [selectedElement, setSelectedElement] = useState<ElementDataDefinition>();
    const [selectedElements, setSelectedElements] = useState<ElementDataDefinition[]>([]);
    const [selectedNodes, setSelectedNodes] = useState<NodeDataDefinition[]>([]);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const chartRef = useRef<cytoscape.Core | null>(null);
    const dataPanel = useRef<ImperativePanelHandle>(null);
    const [isAddRelation, setIsAddRelation] = useState(false)
    const [isAddEntity, setIsAddEntity] = useState(false)
    const [maximize, setMaximize] = useState<boolean>(false)

    useEffect(() => {
        const chart = chartRef.current
        if (chart) {
            chart.resize()
            chart.fit()
            chart.center()
        }
    }, [maximize])

    useEffect(() => {
        chartRef?.current?.layout(LAYOUT).run();
    }, [schema.Elements.length]);

    useEffect(() => {
        dataPanel.current?.collapse()
    }, [])

    useEffect(() => {
        setSelectedElement(undefined)
        setSelectedElements([])
    }, [schema.Id])

    useEffect(() => {
        setSelectedNodes([])
    }, [isAddRelation])

    const onCategoryClick = (category: Category) => {
        const chart = chartRef.current
        if (chart) {
            const nodes = chart.elements(`node[category.0 = "${category.name}"]`)

            // eslint-disable-next-line no-param-reassign
            category.show = !category.show

            if (category.show) {
                nodes.style({ display: 'element' })
            } else {
                nodes.style({ display: 'none' })
            }
            chart.elements().layout(LAYOUT).run();
        }
    }

    const onLabelClick = (label: Category) => {
        const chart = chartRef.current
        if (chart) {
            const edges = chart.elements(`edge[label = "${label.name}"]`)

            // eslint-disable-next-line no-param-reassign
            label.show = !label.show

            if (label.show) {
                edges.style({ display: 'element' })
            } else {
                edges.style({ display: 'none' })
            }
            chart.elements().layout(LAYOUT).run();
        }
    }

    const handelSetSelectedElement = (element?: ElementDataDefinition) => {
        setSelectedElement(element)
        if (isAddRelation || isAddEntity) return
        if (element) {
            dataPanel.current?.expand()
        } else dataPanel.current?.collapse()
    }

    const handleSelected = (evt: EventObject) => {
        if (isAddRelation) {
            const { target } = evt;
            (target as EdgeSingular).unselect()
            const obj: ElementDataDefinition = evt.target.json().data;
            setSelectedNodes(prev => prev.length >= 2 ? [prev[prev.length - 1], obj as NodeDataDefinition] : [...prev, obj as NodeDataDefinition])
            return
        }

        const { target } = evt

        if (target.isEdge()) {
            target.style("line-opacity", 0.9);
            target.style("width", 2);
            target.style("arrow-scale", 1);
        } else {
            target.style("border-width", 0.7)
        };

        const obj: ElementDataDefinition = target.json().data

        handelSetSelectedElement(obj);
    }

    const handleBoxSelected = (evt: EventObject) => {
        if (isAddRelation) {
            const { target } = evt;
            (target as EdgeSingular).unselect()
            const obj: ElementDataDefinition = target.json().data;
            setSelectedNodes(prev => prev.length >= 2 ? [prev[prev.length - 1], obj as NodeDataDefinition] : [...prev, obj as NodeDataDefinition])
            return
        }

        const { target } = evt
        const type = target.isEdge() ? "edge" : "node"

        if (type === "edge") {
            target.style("line-opacity", 0.9);
            target.style("width", 2);
            target.style("arrow-scale", 1);
        } else target.style("border-width", 0.7);

        const obj: ElementDataDefinition = target.json().data;

        setSelectedElements(prev => [...prev, obj])
    }

    const handleUnselected = (evt: EventObject) => {
        const { target } = evt

        if (target.isEdge()) {
            target.style("line-opacity", 0.7);
            target.style("width", 1);
            target.style("arrow-scale", 0.7);
        } else target.style("border-width", 0.3);

        handelSetSelectedElement();
        setSelectedElements([]);
    }

    const handleMouseOver = (evt: EventObject) => {
        const { target } = evt;

        if (target.selected()) return
        if (target.isEdge()) {
            target.style("line-opacity", 0.9);
            target.style("width", 2);
            target.style("arrow-scale", 1);
        } else target.style("border-width", 0.7);
    };

    const handleMouseOut = async (evt: EventObject) => {
        const { target } = evt;

        if (target.selected()) return
        if (target.isEdge()) {
            target.style("line-opacity", 0.7);
            target.style("width", 1);
            target.style("arrow-scale", 0.7);
        } else target.style("border-width", 0.3);
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
        const stateSelectedElements = Object.values(selectedElements)

        if (stateSelectedElements.length === 0 && selectedElement) {
            stateSelectedElements.push(selectedElement)
            setSelectedElement(undefined)
        }

        const conditionsNodes: string[] = []
        const conditionsEdges: string[] = []

        stateSelectedElements.forEach((element) => {
            const { id } = getElementId(element)
            if (element.source) {
                conditionsEdges.push(`id(e) = ${id}`)
            } else {
                conditionsNodes.push(`id(n) = ${id}`)
            }
        })

        const q = `${conditionsNodes.length > 0 ? `MATCH (n) WHERE ${conditionsNodes.join(" OR ")} DELETE n` : ""}${conditionsEdges.length > 0 && conditionsNodes.length > 0 ? " WITH * " : ""}${conditionsEdges.length > 0 ? `MATCH ()-[e]-() WHERE ${conditionsEdges.join(" OR ")} DELETE e` : ""}`
        const type = !selectedElement?.source
        const result = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)} `, {
            method: "GET"
        })

        if (!result.ok) return

        stateSelectedElements.forEach((element) => {
            const { id } = getElementId(element)

            schema.Elements.splice(schema.Elements.findIndex(e => e.data.id === element.id), 1)

            if (type) {
                schema.NodesMap.delete(Number(id))
                chartRef.current?.remove(`#${id}`)
            } else {
                schema.EdgesMap.delete(Number(id))
                chartRef.current?.remove(`#_${id}`)
            }

            if (fetchCount) fetchCount()

            schema.updateCategories(type ? element.category : element.label, type)
        })

        setSelectedElement(undefined)
        setSelectedElements([])

        dataPanel.current?.collapse()
    }

    const handelSetAttribute = async (key: string, newVal: Attribute) => {
        if (!selectedElement) return false

        const { id, query } = getElementId(selectedElement)
        const q = `MATCH ${query} WHERE ID(e) = ${id} SET e.${key} = "${newVal}"`
        const { ok } = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (ok) {
            schema.Elements.forEach(e => {
                if (e.data.id !== selectedElement.id) return
                e.data[key] = newVal
            })
        } else {
            Toast("Failed to set property")
        }

        return ok
    }

    const handelSetCategory = async (category: string) => {
        if (!selectedElement) return false

        const { id } = getElementId(selectedElement)
        const q = `MATCH (n) WHERE ID(n) = ${id} REMOVE n:${selectedElement.category} SET n:${category}`
        const success = (await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok

        if (success) {
            schema.Elements.forEach(({ data }) => {
                if (data.id !== id) return

                // eslint-disable-next-line no-param-reassign
                data.category = category

                setSelectedElement({ ...selectedElement, category })

                const prevCategory = schema.CategoriesMap.get(selectedElement.category) as Category

                schema.updateCategories(prevCategory.name, true)

                const [c] = schema.createCategory([category])

                chartRef.current?.elements().forEach(n => {
                    if (n.data().category === category) {
                        // eslint-disable-next-line no-param-reassign
                        n.data().category = category
                        // eslint-disable-next-line no-param-reassign
                        n.data().color = schema.getCategoryColorValue(c.index)
                    }
                });
                chartRef.current?.elements().layout(LAYOUT).run();

            })
        }
        return success
    }

    const handelRemoveProperty = async (key: string) => {
        if (!selectedElement) return false

        const { id, query } = getElementId(selectedElement)
        const q = `MATCH ${query} WHERE ID(e) = ${id} SET e.${key} = null`
        const { ok } = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (!ok) return ok

        const s = schema
        s.Elements = schema.Elements.map(e => {
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
                chartRef?.current?.add({ data: schema.extendNode(json.result.data[0].n) })
                setIsAddEntity(false)
            } else {
                chartRef?.current?.add({ data: schema.extendEdge(json.result.data[0].e, true) })
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
                    <CytoscapeComponent
                        className="Canvas"
                        layout={LAYOUT}
                        stylesheet={getStyle()}
                        elements={schema.Elements}
                        cy={(cy) => {
                            chartRef.current = cy

                            cy.removeAllListeners()

                            cy.on('mouseover', 'edge', handleMouseOver)
                            cy.on('mouseover', 'node', handleMouseOver)
                            cy.on('mouseout', 'edge', handleMouseOut)
                            cy.on('mouseout', 'node', handleMouseOut)
                            cy.on('tapunselect', 'edge', handleUnselected)
                            cy.on('tapunselect', 'node', handleUnselected)
                            cy.on('tapselect', 'edge', handleSelected)
                            cy.on('tapselect', 'node', handleSelected)
                            cy.on('boxselect', 'node', handleBoxSelected)
                            cy.on('boxselect', 'edge', handleBoxSelected)
                        }}
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