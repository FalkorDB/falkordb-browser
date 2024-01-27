'use client'

import { toast } from "@/components/ui/use-toast";
import CytoscapeComponent from 'react-cytoscapejs'
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { useEffect, useRef, useState } from "react";
import { Node, Graph, Category, getCategoryColorName } from "./model";
import { signOut } from "next-auth/react";
import { Toolbar } from "./toolbar";
import { Query, QueryState } from "./query";
import { Labels } from "./labels";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableView } from "./tableview";

cytoscape.use(fcose);

// The stylesheet for the graph
const STYLESHEET: cytoscape.Stylesheet[] = [
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
            shape: "ellipse",
            height: 10,
            width: 10,
            "border-width": 0.15,
            "border-opacity": 0.5,
            "background-color": "data(color)",
            "font-size": "3",
            "overlay-padding": "1px",
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
            "text-background-color": "#ffffff",
            "text-background-opacity": 1,
            "font-size": "3",
            "overlay-padding": "2px",

        },
    },
]

const LAYOUT = {
    name: "fcose",
    fit: true,
    padding: 30,
}

export default function Page() {
    useEffect(() => {
        fetch('/api/graph', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((result) => {
                if (result.status < 300) {
                    return result.json()
                }
                toast({
                    title: "Error",
                    description: result.text(),
                })
                return { result: [] }
            }).then((result:any) => {
                console.log("Folker Result", result)
                // setGraphs(result.result.graphs ?? [])
            })
    }, [toast])
    const [graph, setGraph] = useState(Graph.empty());

    // A reference to the chart container to allowing zooming and editing
    const chartRef = useRef<cytoscape.Core | null>(null)

    // A reference to the query state to allow running the user query
    const queryState = useRef<QueryState | null>(null)

    function prepareArg(arg: string): string {
        return encodeURIComponent(arg.trim())
    }

    async function runQuery(event: any) {
        event.preventDefault();
        let state = queryState.current;
        if (!state) {
            return
        }

        let q = state.query.trim() || "MATCH (n)-[e]-() RETURN n,e limit 100";

        let result = await fetch(`/api/graph?graph=${prepareArg(state.graphName)}&query=${prepareArg(q)}`, {
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
                signOut({ callbackUrl: '/' })
            }
            return
        }
        let json = await result.json()
        let newGraph = Graph.create(state.graphName, json.result)
        console.log("result is " ,  newGraph)

        setGraph(newGraph)

        let chart = chartRef.current
        if (chart) {
            chart.elements().remove()
            chart.add(newGraph.Elements)
            chart.elements().layout(LAYOUT).run();
        }
    }

    // Send the user query to the server to expand a node
    async function onFetchNode(node: Node) {
        let result = await fetch(`/api/graph/${graph.Id}/${node.id}`, {
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
                signOut({ callbackUrl: '/' })
            }
            return [] as any[]
        }

        let json = await result.json()
        let elements = graph.extend(json.result)
        return elements
    }

    function onCategoryClick(category: Category) {
        let chart = chartRef.current
        if (chart) {
            let elements = chart.elements(`node[category = "${category.name}"]`)

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
            {/* <button onClick={e=>{
                console.log("length : ",  Graph.length )
                console.log( "graph : ", graph)
                console.log("Graph:", Graph)
            }} >Click to log</button> */}
            <Query className="border rounded-lg border-gray-300 p-2" onSubmit={runQuery} query={(state) => queryState.current = state} />
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
                                        cy.on('dbltap', 'node', async function (evt) {
                                            var node: Node = evt.target.json().data;
                                            let elements = await onFetchNode(node);

                                            // adjust entire graph.
                                            if (elements.length > 0) {
                                                cy.add(elements);
                                                cy.elements().layout(LAYOUT).run();
                                            }
                                        });
                                    }}
                                    stylesheet={STYLESHEET}
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
