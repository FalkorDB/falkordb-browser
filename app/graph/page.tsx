'use client'

import { toast } from "@/components/ui/use-toast";
import CytoscapeComponent from 'react-cytoscapejs'
import cytoscape, { ElementDefinition, NodeDataDefinition } from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Toolbar from "./toolbar";
import { Query, QueryState } from "./query";
import Labels from "./labels";
import { TableView } from "./tableview";
import { Graph, Category } from "./model";

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
                "text-background-color": darkmode? "#020817": "white",
                "color": darkmode? "white" : "black",
                "text-background-opacity": 1,
                "font-size": "3rem",
                "overlay-padding": "2rem",

            },
        },
    ]
    return style
}

const LAYOUT = {
    name: "fcose",
    fit: true,
    padding: 30,
}


// Validate the graph selection is not empty and show an error message if it is
function validateGraphSelection(graphName: string): boolean {
    if (!graphName) {
        toast({
            title: "Error",
            description: "Please select a graph from the list",
        });
        return false;
    }
    return true;
}

export default function Page() {
    const [graph, setGraph] = useState(Graph.empty());

    // A reference to the chart container to allowing zooming and editing
    const chartRef = useRef<cytoscape.Core | null>(null)

    // A reference to the query state to allow running the user query
    const queryState = useRef<QueryState | null>(null)

    const { theme, systemTheme } = useTheme()
    const darkmode = theme === "dark" || (theme === "system" && systemTheme === "dark")

    function prepareArg(arg: string): string {
        return encodeURIComponent(arg.trim())
    }

    const runQuery = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const state = queryState.current;
        if (!state) {
            return
        }

        // Proposed abstraction for improved modularity
        if (!validateGraphSelection(state.graphName)) return;

        const q = state.query.trim() || "MATCH (n)-[e]-() RETURN n,e limit 100";

        const result = await fetch(`/api/graph?graph=${prepareArg(state.graphName)}&query=${prepareArg(q)}`, {
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
            return
        }

        const json = await result.json()
        const newGraph = Graph.create(state.graphName, json.result)
        setGraph(newGraph)

        const chart = chartRef.current
        if (chart) {
            chart.elements().remove()
            chart.add(newGraph.Elements)
            chart.elements().layout(LAYOUT).run();
        }
    }

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

    return (
        <div className="h-full flex flex-col p-2 gap-y-2">
            <Query className="border rounded-lg border-gray-300 p-2" onSubmit={runQuery} onQueryUpdate={(state) => { queryState.current = state }} />
            <div className="flex flex-col grow border border-gray-300 rounded-lg p-2 overflow-auto">
                {
                    graph.Id &&
                    <Tabs defaultValue="graph" className="grow flex flex-col justify-center items-center">
                        <TabsList className="border w-fit">
                            <TabsTrigger value="data">Data</TabsTrigger>
                            <TabsTrigger value="graph">Graph</TabsTrigger>
                        </TabsList>
                        <TabsContent value="data" className="grow w-full">
                            <TableView graph={graph} />
                        </TabsContent>
                        <TabsContent value="graph" className="grow w-full">
                            <div className="h-full flex flex-col">
                                <div className="grid grid-cols-6">
                                    <Toolbar className="col-start-1 justify-start" chartRef={chartRef} />
                                    <Labels className="col-end-7 justify-end" categories={graph.Categories} onClick={onCategoryClick} />
                                </div>
                                <CytoscapeComponent
                                    cy={(cy) => {
                                        chartRef.current = cy

                                        // Make sure no previous listeners are attached
                                        cy.removeAllListeners();

                                        // Listen to the click event on nodes for expanding the node
                                        cy.on('dbltap', 'node', async (evt) => {
                                            const node: Node = evt.target.json().data;
                                            const elements = await onFetchNode(node);

                                            // adjust entire graph.
                                            if (elements.length > 0) {
                                                cy.add(elements);
                                                cy.elements().layout(LAYOUT).run();
                                            }
                                        });
                                    }}
                                    stylesheet={getStyle(darkmode)}
                                    elements={graph.Elements}
                                    layout={LAYOUT}
                                    className="w-full grow"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                }
            </div>
        </div>
    )
}
