'use client'

import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import CytoscapeComponent from "react-cytoscapejs"
import { ChevronLeft } from "lucide-react"
import cytoscape, { EdgeDataDefinition, EdgeSingular, EventObject, NodeDataDefinition } from "cytoscape"
import { ImperativePanelHandle } from "react-resizable-panels"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import fcose from "cytoscape-fcose";
import { cn, prepareArg, securedFetch } from "@/lib/utils"
import Toolbar from "../graph/toolbar"
import DataPanel from "../graph/DataPanel"
import Labels from "../graph/labels"
import { Category, Graph } from "../api/graph/model"
import Button from "../components/ui/Button"

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
                "color": "black",
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

export default function SchemaView({ schema, setSchema }: Props) {

    const [selectedElements, setSelectedElements] = useState<{ [key: string]: NodeDataDefinition | EdgeDataDefinition }>({});
    const [selectedElement, setSelectedElement] = useState<NodeDataDefinition | EdgeDataDefinition>();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const chartRef = useRef<cytoscape.Core | null>(null);
    const dataPanel = useRef<ImperativePanelHandle>(null);

    useEffect(() => {
        dataPanel.current?.collapse()
    }, [])

    useEffect(() => {
        if (chartRef.current) {
            const layout = chartRef.current.layout(LAYOUT);
            layout.run();
        }
    }, [schema.Elements]);

    const onCategoryClick = (category: Category) => {
        const chart = chartRef.current
        if (chart) {
            const elements = chart.elements(`node[category = "${category.name}"]`)

            // eslint-disable-next-line no-param-reassign
            category.show = !category.show

            if (category.show) {
                elements.style({ display: 'element' })
            } else {
                elements.style({ display: 'none' })
            }
            chart.elements().layout(LAYOUT).run();
        }
    }

    const onLabelClick = (label: Category) => {
        const chart = chartRef.current
        if (chart) {
            const elements = chart.elements(`edge[label = "${label.name}"]`)

            // eslint-disable-next-line no-param-reassign
            label.show = !label.show

            if (label.show) {
                elements.style({ display: 'element' })
            } else {
                elements.style({ display: 'none' })
            }
            chart.elements().layout(LAYOUT).run();
        }
    }

    const onExpand = () => {
        if (!dataPanel.current) return
        const panel = dataPanel.current
        if (panel.isExpanded()) {
            panel.collapse()
        } else {
            panel.expand()
        }
    }

    const handelSetSelectedElement = (element?: NodeDataDefinition | EdgeDataDefinition) => {
        setSelectedElement(element)
        if (element) {
            dataPanel.current?.expand()
        } else dataPanel.current?.collapse()
    }

    const handleSelected = (evt: EventObject) => {
        const { target } = evt

        if (target.isEdge()) {
            const { color } = target.data()
            target.style("line-color", color);
            target.style("target-arrow-color", color);
            target.style("line-opacity", 0.5);
            target.style("width", 2);
            target.style("arrow-scale", 1);
        } else target.style("border-width", 0.7);

        const obj: NodeDataDefinition | EdgeDataDefinition = target.json().data;
        handelSetSelectedElement(obj);
    }

    const handleBoxSelected = (evt: EventObject) => {
        const { target } = evt
        const type = target.isEdge() ? "edge" : "node"

        if (type === "edge") {
            const { color } = target.data()
            target.style("line-color", color);
            target.style("target-arrow-color", color);
            target.style("line-opacity", 0.5);
            target.style("width", 2);
            target.style("arrow-scale", 1);
        } else target.style("border-width", 0.7);

        const obj: NodeDataDefinition | EdgeDataDefinition = target.json().data;

        setSelectedElements(prev => ({
            ...prev,
            // eslint-disable-next-line no-underscore-dangle
            [obj.id || ""]: obj
        }));
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
        setSelectedElements({});
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

    const onDeleteElement = async () => {
        const stateSelectedElements = Object.values(selectedElements)

        if (stateSelectedElements.length === 0 && selectedElement) {
            stateSelectedElements.push(selectedElement)
        }

        const conditionsNodes: string[] = []
        const conditionsEdges: string[] = []

        stateSelectedElements.forEach(({ _id, id, source }) => {
            if (source) {
                conditionsEdges.push(`id(e) = ${_id}`)
            } else {
                conditionsNodes.push(`id(n) = ${id}`)
            }
        })

        const q = `MATCH (n) WHERE ${conditionsNodes.join(" OR ")} DELETE n WITH * MATCH ()-[e]-() WHERE ${conditionsEdges.join(" OR ")} DELETE e`

        const success = (await securedFetch(`api/graph/${prepareArg(schema.Id)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok;

        if (!success) return;

        setSchema(prev => {
            const p = prev;
            if (stateSelectedElements.length > 0) {
                p.Elements = p.Elements.filter(({ data }) => {
                    if (!selectedElements[data.id || ""]) return true
                    chartRef.current?.remove(`#${data.id}`)
                    return false
                })
                return p
            }
            p.Elements = p.Elements.filter(({ data }) => selectedElement?.id !== data.id);
            chartRef.current?.remove(`#${selectedElement?.id}`);
            return p;
        });
        setSelectedElement(undefined)
        setSelectedElements({})
        dataPanel.current?.collapse()
    }


    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
                defaultSize={100}
                className={cn("flex flex-col gap-10", !isCollapsed && "mr-8")}
            >
                <div className="flex items-center justify-between">
                    <Toolbar disabled={!schema.Id} deleteDisabled={!selectedElement} onDeleteElement={onDeleteElement} chartRef={chartRef} />
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
                        elements={schema.Elements}
                        cy={(cy) => {
                            chartRef.current = cy

                            cy.removeAllListeners()

                            cy.on('mouseover', 'edge', handleMouseOver)
                            cy.on('mouseout', 'edge', handleMouseOut)
                            cy.on('tapunselect', 'edge', handleUnselected)
                            cy.on('tapunselect', 'node', handleUnselected)
                            cy.on('tapselect', 'edge', handleSelected)
                            cy.on('tapselect', 'node', handleSelected)
                            cy.on('tapselect', 'node', handleSelected)
                            cy.on('boxselect', 'node', handleBoxSelected)
                            cy.on('boxselect', 'edge', handleBoxSelected)
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
                defaultSize={25}
                minSize={25}
                maxSize={50}
                onCollapse={() => setIsCollapsed(true)}
                onExpand={() => setIsCollapsed(false)}
            >
                {
                    selectedElement &&
                    <DataPanel
                        obj={selectedElement}
                        onExpand={onExpand}
                    />
                }
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}