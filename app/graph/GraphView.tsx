'use client'

import CytoscapeComponent from "react-cytoscapejs";
import cytoscape, { ElementDefinition, EventObject, NodeDataDefinition } from "cytoscape";
import { useRef, useState, useImperativeHandle, forwardRef, useEffect, Dispatch, SetStateAction } from "react";
import fcose from 'cytoscape-fcose';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { ChevronLeft, GitGraph, Maximize2, Minimize2, Table } from "lucide-react"
import { cn, ElementDataDefinition, prepareArg, securedFetch } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Session } from "next-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Category, Graph } from "../api/graph/model";
import DataPanel from "./GraphDataPanel";
import Labels from "./labels";
import Toolbar from "./toolbar";
import Button from "../components/ui/Button";
import TableView from "./TableView";

const EditorComponent = dynamic(() => import("../components/EditorComponent"), {
    ssr: false
})

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
                label: "data(data.name)",
                "color": "black",
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
        },
    ]
    return style
}

const getElementId = (element: ElementDataDefinition) => element.source ? { id: element.id?.slice(1), query: "()-[e]-()" } : { id: element.id, query: "(e)" }

const GraphView = forwardRef(({ graph, selectedElement, setSelectedElement, runQuery, historyQuery, historyQueries, fetchCount, data }: {
    graph: Graph
    selectedElement: ElementDataDefinition | undefined
    setSelectedElement: Dispatch<SetStateAction<ElementDataDefinition | undefined>>
    runQuery: (query: string) => Promise<void>
    historyQuery: string
    historyQueries: string[]
    fetchCount: () => void
    data: Session | null
}, ref) => {

    const [query, setQuery] = useState<string>("")
    const [selectedElements, setSelectedElements] = useState<(ElementDataDefinition)[]>([]);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
    const chartRef = useRef<cytoscape.Core | null>(null)
    const dataPanel = useRef<ImperativePanelHandle>(null)
    const [maximize, setMaximize] = useState<boolean>(false)
    const [tabsValue, setTabsValue] = useState<string>("")

    useEffect(() => {
        const defaultChecked = graph.Data.length !== 0 ? "Table" : "Graph"
        setTabsValue(graph.Elements.length !== 0 ? "Graph" : defaultChecked)
    }, [graph.Elements.length, graph.Data.length])
    
    useImperativeHandle(ref, () => ({
        expand: (elements: ElementDefinition[]) => {
            const chart = chartRef.current
            if (chart) {
                chart.elements().remove()
                chart.add(elements)
                chart.elements().layout(LAYOUT).run();
            }
        }
    }))

    useEffect(() => {
        setSelectedElement(undefined)
        setSelectedElements([])
    }, [graph.Id, setSelectedElement])

    useEffect(() => {
        setQuery(historyQuery)
    }, [historyQuery])

    useEffect(() => {
        const chart = chartRef.current
        if (chart) {
            chart.resize()
            chart.fit()
            chart.center()
        }
    }, [maximize])

    useEffect(() => {
        const chart = chartRef.current
        if (!chart || tabsValue !== "Graph") return
        chart.layout(LAYOUT).run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [graph.Elements.length, graph.Elements]);

    const onExpand = (expand?: boolean) => {
        if (!dataPanel.current) return
        const panel = dataPanel.current
        if (expand !== undefined) {
            if (expand && panel?.isCollapsed()) {
                panel?.expand()
            } else if (!expand && panel?.isExpanded()) {
                panel?.collapse()
            }
            return
        }
        if (panel.isCollapsed()) {
            panel.expand()
        } else {
            panel.collapse()
        }
    }

    useEffect(() => {
        dataPanel.current?.collapse()
    }, [])

    useEffect(() => {
        onExpand(!!selectedElement)
    }, [selectedElement])

    // Send the user query to the server to expand a node
    const onFetchNode = async (node: NodeDataDefinition) => {
        const result = await securedFetch(`/api/graph/${graph.Id}/${node.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (result.ok) {
            const json = await result.json()
            return graph.extend(json.result, true)
        }

        return []
    }

    const onCategoryClick = (category: Category) => {
        const chart = chartRef.current
        if (chart) {
            const elements = chart.nodes(`[category.0 = "${category.name}"]`)

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
        if (!chart) return
        const elements = chart.edges(`[label = "${label.name}"]`)

        // eslint-disable-next-line no-param-reassign
        label.show = !label.show

        if (label.show) {
            elements.style({ display: 'element' })
        } else {
            elements.style({ display: 'none' })
        }
        chart.elements().layout(LAYOUT).run();
    }

    const handleDoubleTap = async (evt: EventObject) => {
        const chart = chartRef.current

        if (!chart) return

        const node = evt.target.json().data;
        const graphNode = graph.Elements.find(e => e.data.id === node.id);

        if (!graphNode) return

        if (!graphNode.data.expand) {
            chart.add(await onFetchNode(node));
        } else {
            const neighbors = chart.elements(`#${node.id}`).neighborhood()
            neighbors.forEach((n) => {
                const id = n.id()
                const index = graph.Elements.findIndex(e => e.data.id === id)
                chart.remove(`#${id}`)

                if (index === -1) return

                graph.Elements.splice(index, 1)
            })
        }

        graphNode.data.expand = !graphNode.data.expand;

        chart.elements().layout(LAYOUT).run();
    }


    const handleSelected = (evt: EventObject) => {
        const { target } = evt

        if (target.isEdge()) {
            target.style("line-opacity", 0.9);
            target.style("width", 2);
            target.style("arrow-scale", 1);
        } else target.style("border-width", 0.7);

        const obj: ElementDataDefinition = target.json().data;
        setSelectedElement(obj);
    }

    const handleBoxSelected = (evt: EventObject) => {
        const { target } = evt
        const type = target.isEdge() ? "edge" : "node"

        if (type === "edge") {
            target.style("line-opacity", 0.9);
            target.style("width", 2);
            target.style("arrow-scale", 1);
        } else target.style("border-width", 0.7);

        const obj: ElementDataDefinition = target.json().data;

        setSelectedElements(prev => [...prev, obj]);
    }

    const handleUnselected = (evt: EventObject) => {
        const { target } = evt

        if (target.isEdge()) {
            target.style("line-opacity", 0.7);
            target.style("width", 1);
            target.style("arrow-scale", 0.7);
        } else target.style("border-width", 0.3);

        setSelectedElement(undefined);
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

    const handelDeleteElement = async () => {
        if (selectedElements.length === 0 && selectedElement) {
            selectedElements.push(selectedElement)
            setSelectedElement(undefined)
        }

        const conditionsNodes: string[] = []
        const conditionsEdges: string[] = []

        selectedElements.forEach((element) => {
            const { id } = getElementId(element)
            if (element.source) {
                conditionsEdges.push(`id(e) = ${id}`)
            } else {
                conditionsNodes.push(`id(n) = ${id}`)
            }
        })

        const q = `${conditionsNodes.length !== 0 ? `MATCH (n) WHERE ${conditionsNodes.join(" OR ")} DELETE n` : ""}${conditionsEdges.length > 0 && conditionsNodes.length > 0 ? " WITH * " : ""}${conditionsEdges.length !== 0 ? `MATCH ()-[e]-() WHERE ${conditionsEdges.join(" OR ")} DELETE e` : ""}`

        const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)} `, {
            method: "GET"
        })

        if (!result.ok) return

        selectedElements.forEach((element) => {
            const type = !element.source
            const { id } = getElementId(element)
            graph.Elements.splice(graph.Elements.findIndex(e => e.data.id === id), 1)
            chartRef.current?.remove(`#${id} `)

            fetchCount()

            graph.updateCategories(type ? element.category : element.label, type)
        })

        setSelectedElements([])
        setSelectedElement(undefined)
    }

    return (
        <ResizablePanelGroup direction="horizontal" className={cn(maximize && "h-full p-10 bg-background fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%]")}>
            <ResizablePanel
                className={cn("flex flex-col gap-4", !isCollapsed && "mr-8")}
                defaultSize={selectedElement ? 75 : 100}
            >
                <EditorComponent
                    graph={graph}
                    isCollapsed={isCollapsed}
                    maximize={maximize}
                    currentQuery={query}
                    historyQueries={historyQueries}
                    runQuery={runQuery}
                    setCurrentQuery={setQuery}
                    data={data}
                />
                <Tabs value={tabsValue} className="h-1 grow flex gap-2">
                    <TabsList className="h-full bg-background flex flex-col justify-center gap-2">
                        <TabsTrigger
                            disabled={graph.Data.length === 0}
                            className="tabs-trigger"
                            value="Graph"
                            onClick={() => setTabsValue("Graph")}
                            title="Graph">
                            <GitGraph />
                        </TabsTrigger>
                        <TabsTrigger
                            disabled={graph.Data.length === 0}
                            className="tabs-trigger"
                            value="Table"
                            onClick={() => setTabsValue("Table")}
                            title="Table"
                        >
                            <Table />
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="Graph" className="grow h-full mt-0">
                        <div className="h-full flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <Toolbar
                                    disabled={!graph.Id}
                                    deleteDisabled={(Object.values(selectedElements).length === 0 && !selectedElement) || data?.user.role === "Read-Only"}
                                    onDeleteElement={handelDeleteElement}
                                    chartRef={chartRef}
                                    addDisabled
                                />
                                {
                                    isCollapsed && graph.Id &&
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
                                            onKeyDown={(e) => e.code === "Escape" && setMaximize(false)}
                                        />
                                }
                                <CytoscapeComponent
                                    className="Canvas"
                                    cy={(cy) => {

                                        chartRef.current = cy

                                        cy.removeAllListeners()

                                        cy.on('dbltap', 'node', handleDoubleTap)
                                        cy.on('mouseover', 'node', handleMouseOver)
                                        cy.on('mouseover', 'edge', handleMouseOver)
                                        cy.on('mouseout', 'node', handleMouseOut)
                                        cy.on('mouseout', 'edge', handleMouseOut)
                                        cy.on('tapunselect', 'node', handleUnselected)
                                        cy.on('tapunselect', 'edge', handleUnselected)
                                        cy.on('tapselect', 'node', handleSelected)
                                        cy.on('tapselect', 'edge', handleSelected)
                                        cy.on('boxselect', 'node', handleBoxSelected)
                                        cy.on('boxselect', 'edge', handleBoxSelected)
                                    }}
                                    elements={graph.Elements}
                                    layout={LAYOUT}
                                    stylesheet={getStyle()}
                                />
                                {
                                    (graph.Categories.length > 0 || graph.Labels.length > 0) &&
                                    <>
                                        <Labels categories={graph.Categories} onClick={onCategoryClick} label="Labels" graph={graph} />
                                        <Labels categories={graph.Labels} onClick={onLabelClick} label="RelationshipTypes" graph={graph} />
                                    </>
                                }
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="Table" className="mt-0 grow h-full">
                        <TableView
                            data={graph.Data}
                        />
                    </TabsContent>
                </Tabs>
            </ResizablePanel>
            <ResizableHandle className={!isCollapsed ? "w-3" : "w-0"} />
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
                    selectedElement &&
                    <DataPanel
                        obj={selectedElement}
                        setObj={setSelectedElement}
                        onExpand={onExpand}
                        graph={graph}
                        onDeleteElement={handelDeleteElement}
                        data={data}
                    />
                }
            </ResizablePanel>
        </ResizablePanelGroup >
    )
});

GraphView.displayName = "GraphView";

export default GraphView;