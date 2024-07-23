'use client'

import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import CytoscapeComponent from "react-cytoscapejs"
import { ChevronLeft } from "lucide-react"
import cytoscape, { EdgeSingular, ElementDefinition, EventObject, NodeDataDefinition } from "cytoscape"
import { ImperativePanelHandle } from "react-resizable-panels"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import fcose from "cytoscape-fcose";
import { ElementDataDefinition, Toast, cn, prepareArg, securedFetch } from "@/lib/utils"
import Toolbar from "../graph/toolbar"
import DataPanel from "../graph/DataPanel"
import Labels from "../graph/labels"
import { Category, Graph } from "../api/graph/model"
import Button from "../components/ui/Button"
import CreateElement, { Attribute } from "../components/graph/CreateElement"

/* eslint-disable react/require-default-props */
interface Props {
    schema: Graph
    setSchema: Dispatch<SetStateAction<Graph>>
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
                "selection-box-border-color": 'blue',
                "selection-box-border-width": 0,
                "selection-box-opacity": 1,
                "selection-box-color": 'blue',
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
                "text-halign": "center",
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
            selector: "node:selected",
            style: {
                "border-width": 0.7,
            }
        },
        {
            selector: "edge",
            style: {
                width: 1,
                "line-color": "black",
                "line-opacity": 0.7,
                "arrow-scale": 0.7,
                "target-arrow-color": "black",
                "target-arrow-shape": "triangle",
                'curve-style': 'straight',
            },
        },
        {
            selector: "edge:active",
            style: {
                "overlay-opacity": 0,
            },
        },
        {
            selector: "edge:selected",
            style: {
                width: 2,
                "line-opacity": 1,
                "arrow-scale": 1,
            }
        },
    ]
    return style
}

const getCreateQuery = (type: string, selectedNodes: NodeDataDefinition[], label?: string, attributes: Attribute[] = []) => {
    if (type === "node") {
        return `CREATE (n${label ? `:${label}` : ""}${attributes?.length > 0 ? ` {${attributes.map(([k, t, d, u, un]) => `${k}: ["${t}", "${d}", "${u}", "${un}"]`).join(",")}}` : ""}) RETURN n`
    }
    return `MATCH (a), (b) WHERE ID(a) = ${selectedNodes[0].id} AND ID(b) = ${selectedNodes[1].id} CREATE (a)-[e${label ? `:${label}` : ""}${attributes?.length > 0 ? ` {${attributes.map(([k, t, d, u, un]) => `${k}: ["${t}", "${d}", "${u}", "${un}"]`).join(",")}}` : ""}]->(b) RETURN e`
}

export default function SchemaView({ schema, setSchema }: Props) {
    const [elements, setElements] = useState<ElementDefinition[]>([]);
    const [selectedElement, setSelectedElement] = useState<ElementDataDefinition>();
    const [selectedNodes, setSelectedNodes] = useState<NodeDataDefinition[]>([]);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const chartRef = useRef<cytoscape.Core | null>(null);
    const dataPanel = useRef<ImperativePanelHandle>(null);
    const [isAddRelation, setIsAddRelation] = useState(false)
    const [isAddEntity, setIsAddEntity] = useState(false)

    useEffect(() => {
        dataPanel.current?.collapse()
    }, [])

    useEffect(() => {
        setSelectedNodes([])
    }, [isAddRelation])

    useEffect(() => {
        setElements(schema.Elements)
    }, [schema.Elements])

    useEffect(() => {
            chartRef?.current?.elements().layout(LAYOUT).run();
    }, [elements]);

    const onCategoryClick = (category: Category) => {
        const chart = chartRef.current
        if (chart) {
            const nodes = chart.elements(`node[category = "${category.name}"]`)

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

    const handleTap = (evt: EventObject) => {
        const obj: ElementDataDefinition = evt.target.json().data;
        setSelectedNodes(prev => prev.length >= 2 ? [prev[prev.length - 1], obj as NodeDataDefinition] : [...prev, obj as NodeDataDefinition])
    }

    const handleSelected = (evt: EventObject) => {
        if (isAddRelation) return
        const { target } = evt
        const obj: ElementDataDefinition = target.json().data;

        if (target.isEdge()) {
            const { color } = target.data()
            target.style("line-color", color);
            target.style("target-arrow-color", color);
            target.style("line-opacity", 0.5);
            target.style("width", 2);
            target.style("arrow-scale", 1);
        } else {
            target.style("border-width", 0.7)
        };

        handelSetSelectedElement(obj);
    }

    const handleUnselected = (evt: EventObject) => {
        const { target } = evt

        if (target.isEdge()) {
            target.style("line-color", "white");
            target.style("target-arrow-color", "white");
            target.style("line-opacity", 1);
            target.style("width", 1);
            target.style("arrow-scale", 0.7);
        } else target.style("border-width", 0.3);

        handelSetSelectedElement();
    }

    const handleMouseOver = (evt: EventObject) => {
        const edge: EdgeSingular = evt.target;
        const { color } = edge.data();

        edge.style("line-color", color);
        edge.style("target-arrow-color", color);
        edge.style("line-opacity", 0.5);
    };

    const handleMouseOut = async (evt: EventObject) => {
        const edge: EdgeSingular = evt.target;

        if (edge.selected()) return

        edge.style("line-color", "white");
        edge.style("target-arrow-color", "white");
        edge.style("line-opacity", 1);
    };

    const onExpand = () => {
        if (!dataPanel.current) return
        const panel = dataPanel.current
        if (panel.isExpanded()) {
            panel.collapse()
        } else {
            panel.expand()
        }
    }

    const onDelete = async (selectedValue: ElementDataDefinition) => {
        const { id } = selectedValue
        const q = `MATCH (n) WHERE ID(n) = ${id} delete n`
        const result = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (!result.ok) {
            Toast("Failed to delete")
            return
        }
        setSchema(prev => {
            const p = prev
            p.Elements = schema.Elements.filter(e => e.data.id !== id)
            return p
        })
    }

    const setProperty = async (key: string, newVal: string[]) => {
        if (!selectedElement) return false
        const { id } = selectedElement
        const q = `MATCH (n) WHERE ID(n) = ${id} SET n.${key} = "${newVal}"`
        const { ok } = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (ok) {
            setSchema(prev => {
                const p = prev
                p.Elements = schema.Elements.map(e => {
                    if (e.data.id === id) {
                        const updatedElement = e
                        updatedElement.data[key] = newVal
                        return updatedElement
                    }
                    return e
                })
                return p
            })
        } else {
            Toast("Failed to set property")
        }

        return ok
    }

    const removeProperty = async (key: string) => {
        if (!selectedElement) return false

        const { id } = selectedElement
        const q = `MATCH (n) WHERE ID(n) = ${id} SET n.${key} = null`
        const { ok } = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (!ok) return ok

        setSchema(prev => {
            const p = prev
            p.Elements = schema.Elements.map(e => {
                if (e.data.id === id) {
                    const updatedElement = e
                    delete updatedElement.data[key]
                    return updatedElement
                }
                return e
            })
            return p
        })

        return ok
    }

    const onCreateElement = async (attributes: Attribute[], label?: string) => {
        const type = isAddEntity ? "node" : ""

        const result = await securedFetch(`api/graph/${prepareArg(schema.Id)}_schema/?query=${getCreateQuery(type, selectedNodes, label, attributes)}`, {
            method: "GET"
        })

        if (result.ok) {
            const json = await result.json()

            if (type === "node") {
                setElements(schema.extendNode(json.result.data[0].n, [...schema.Elements]))
                setIsAddEntity(false)
            } else {
                setElements(schema.extendEdge(json.result.data[0].e, [...schema.Elements]))
                setIsAddRelation(false)
            }
            onExpand()
        } else Toast("Failed to create element")

        return result.ok
    }


    return (
        <ResizablePanelGroup direction="horizontal">
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
                        onDeleteElement={async () => onDelete && selectedElement && await onDelete(selectedElement)}
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
                <div className="relative grow">
                    <CytoscapeComponent
                        className="Canvas"
                        layout={LAYOUT}
                        stylesheet={getStyle()}
                        elements={elements}
                        cy={(cy) => {
                            chartRef.current = cy

                            cy.removeAllListeners()

                            cy.on('mouseover', 'edge', handleMouseOver)
                            cy.on('mouseout', 'edge', handleMouseOut)
                            cy.on('tapunselect', 'edge', handleUnselected)
                            cy.on('tapunselect', 'node', handleUnselected)
                            cy.on('tapselect', 'edge', handleSelected)
                            cy.on('tapselect', 'node', handleSelected)
                            cy.on('tap', 'node', handleTap)
                        }}
                    />
                    {
                        (schema.Categories.length > 0 || schema.Labels.length > 0) &&
                        <>
                            <Labels className="left-2" label="Categories" categories={schema.Categories} onClick={onCategoryClick} />
                            <Labels className="right-2 text-end" label="Labels" categories={schema.Labels} onClick={onLabelClick} />
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
                        <DataPanel
                            obj={selectedElement}
                            onExpand={onExpand}
                            onDeleteElement={onDelete ? () => onDelete(selectedElement) : undefined}
                            removeProperty={removeProperty}
                            setPropertySchema={setProperty}
                        />
                        : (isAddEntity || isAddRelation) &&
                        <CreateElement
                            onCreate={onCreateElement}
                            onExpand={onExpand}
                            selectedNodes={selectedNodes}
                            setSelectedNodes={setSelectedNodes}
                            type={isAddEntity ? "node" : "edge"}
                        />
                }
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}