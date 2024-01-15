'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast";
import CytoscapeComponent from 'react-cytoscapejs'
import { useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { XCircle, ZoomIn, ZoomOut } from "lucide-react";
import { Node, Graph } from "./model";
import { signOut } from "next-auth/react";
import { Toolbar } from "./toolbar";
import { Query, QueryState } from "./query";

// The stylesheet for the graph
const STYLESHEET: cytoscape.Stylesheet[] = [
    {
        selector: "node",
        style: {
            label: "data(name)",
            "text-valign": "center",
            "text-halign": "center",
            shape: "ellipse",
            height: 10,
            width: 10,
            "background-color": "data(color)",
            "font-size": "3",
            "overlay-padding": "2px",
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
    name: "cose",
    fit: true,
    padding: 30,
    avoidOverlap: true,
}

export default function Page() {

    const [graph, setGraph] = useState(Graph.empty());

    // A reference to the chart container to allowing zooming and editing
    const chartRef = useRef<cytoscape.Core | null>(null)

    // A reference to the query state to allow running the user query
    const queryState = useRef<QueryState| null>(null)

    function prepareArg(arg: string): string {
        return encodeURIComponent(arg.trim())
    }

    async function runQuery(event: any) {
        event.preventDefault();
        let state = queryState.current;
        if(!state){
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
        let newGraph = Graph.create(json.result)
        setGraph(newGraph)

        let chart = chartRef.current
        if(chart){
            chart.elements().remove()
            chart.add(newGraph.Elements)
            chart.elements().layout(LAYOUT).run();
        }
    }

    return (
        <div className="flex flex-col h-full">
            <Query onSubmit={runQuery} query={(state) => queryState.current = state} />
            <main className="h-full w-full">
                <Toolbar chartRef={chartRef} />
                <CytoscapeComponent
                    cy={(cy) => {
                        chartRef.current = cy

                        // Make sure no previous listeners are attached
                        cy.removeAllListeners();

                        // Listen to the click event on nodes for expanding the node
                        cy.on('dbltap', 'node', function (evt) {
                            var node: Node = evt.target.json().data;
                            // TODO:
                            // parmas.onFetchNode(node);
                        });
                    }}
                    stylesheet={STYLESHEET}
                    elements={graph.Elements}
                    layout={LAYOUT}
                    className="w-full h-full"
                />
            </main>
        </div>
    )
}
