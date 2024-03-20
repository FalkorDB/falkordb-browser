import CytoscapeComponent from "react-cytoscapejs";
import { toast } from "@/components/ui/use-toast";
import cytoscape, { ElementDefinition, EventObject, NodeDataDefinition } from "cytoscape";
import { useRef, useState, useImperativeHandle, Ref } from "react";
import { signOut } from "next-auth/react";
import fcose from 'cytoscape-fcose';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import Labels from "./labels";
import Toolbar from "./toolbar";
import { Category, Graph } from "./model";
import DataPanel from "./DataPanel";

const LAYOUT = {
    name: "fcose",
    fit: true,
    padding: 30,
}

cytoscape.use(fcose);

// The stylesheet for the graph
function getStyle(darkmode: boolean) {

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
                label: "data(name)",
                "text-valign": "center",
                "text-halign": "center",
                "text-wrap": "ellipsis",
                "text-max-width": "10rem",
                shape: "ellipse",
                height: "10rem",
                width: "10rem",
                "border-width": 0.15,
                "border-opacity": 0.5,
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
                width: 0.5,
                "line-color": "#ccc",
                "arrow-scale": 0.3,
                "target-arrow-shape": "triangle",
                label: "data(label)",
                'curve-style': 'straight',
                "text-background-color": darkmode ? "#020817" : "white",
                "color": darkmode ? "white" : "black",
                "text-background-opacity": 1,
                "font-size": "3rem",
                "overlay-padding": "2rem",

            },
        },
    ]
    return style
}

export interface GraphViewRef {
    expand: (elements: ElementDefinition[]) => void
}

interface GraphViewProps {
    ref: Ref<GraphViewRef>,
    graph: Graph,
    darkmode: boolean
}

export function GraphView({ graph, darkmode, ref }: GraphViewProps) {

    const [selectedNode, setSelectedNode] = useState<[string, any][] | null>(null);

    // A reference to the chart container to allowing zooming and editing
    const chartRef = useRef<cytoscape.Core | null>(null)
    const dataPanel = useRef<ImperativePanelHandle>(null)

    useImperativeHandle(ref, () => ({
        expand: (elements) => {
            const chart = chartRef.current
            if (chart) {
                chart.elements().remove()
                chart.add(elements)
                chart.elements().layout(LAYOUT).run();
            }
        }
    }))

    // Send the user query to the server to expand a node
    async function onFetchNode(node: NodeDataDefinition) {
        const result = await fetch(`/api/graph/${graph.Id}/${node.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (result.status >= 300) {
            toast({
                title: "Error",
                description: result.text(),
            })
            if (result.status >= 400 && result.status < 500) {
                signOut({ callbackUrl: '/login' })
            }
            return [] as ElementDefinition[]
        }

        const json = await result.json()
        const elements = graph.extend(json.result)
        return elements
    }

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

    const handleDoubleClick = async (evt: EventObject) => {
        const node: Node = evt.target.json().data;
        const elements = await onFetchNode(node);

        // adjust entire graph.
        if (chartRef.current && elements.length > 0) {
            chartRef.current.add(elements);
            chartRef.current.elements().layout(LAYOUT).run();
        }
    }

    const handleTap = (evt: EventObject) => {
        const node: Node = evt.target.json().data;
        const filterNode = Object.entries(node).filter(node => node[0] != "category" && node[0] != "color")
        setSelectedNode(filterNode);
        dataPanel.current?.expand();
    }

    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel className="h-full flex flex-col">
                <div className="grid grid-cols-6">
                    <Toolbar className="col-start-1 justify-start" chartRef={chartRef} />
                    <Labels className="col-end-7 justify-end" categories={graph.Categories} onClick={onCategoryClick} />
                </div>
                <CytoscapeComponent
                    cy={(cy) => {
                        chartRef.current = cy

                        // Make sure no previous listeners are attached
                        cy.removeAllListeners();

                        // Listen to the double click event on nodes for expanding the node
                        cy.on('dbltap', 'node', handleDoubleClick);

                        // Listen to the click event on nodes for showing node properties
                        cy.on('tap', 'node', handleTap);
                    }}
                    stylesheet={getStyle(darkmode)}
                    elements={graph.Elements}
                    layout={LAYOUT}
                    className="w-full grow"
                />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel ref={dataPanel} maxSize={50} minSize={10} collapsible defaultSize={selectedNode ? 20 : 0} className="bg-gray-100 dark:bg-gray-800">
                {selectedNode && <DataPanel node={selectedNode} />}
            </ResizablePanel>
        </ResizablePanelGroup>


    )
}