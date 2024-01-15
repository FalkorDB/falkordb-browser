'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast";
import CytoscapeComponent from 'react-cytoscapejs'
import { useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { XCircle, ZoomIn, ZoomOut } from "lucide-react";
import { Edge, Node, Graph } from "./model";

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
    const [query, setQuery] = useState('');
    const [graphName, setGraphName] = useState('');
    const [graph, setGraph] = useState(Graph.empty());

    // A reference to the chart container to allowing zooming and editing
    const chartRef = useRef<cytoscape.Core | null>(null)

    function updateQuery(event: React.ChangeEvent<HTMLInputElement>) {
        setQuery(event.target.value)
    }

    function updateGraph(event: React.ChangeEvent<HTMLInputElement>) {
        setGraphName(event.target.value)
    }

    function prepareArg(arg: string): string {
        return encodeURIComponent(arg.trim())
    }

    async function runQuery(event: any) {
        event.preventDefault();

        let q = query.trim() || "MATCH (n)-[e]-() RETURN n,e limit 100";

        let result = await fetch(`/api/graph?graph=${prepareArg(graphName)}&query=${prepareArg(q)}`, {
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
            return
        }

        let json = await result.json()
        let elements = graph.extend(json.result)

        let chart = chartRef.current
        if(chart){
            chart.add(elements)
            chart.elements().layout(LAYOUT).run();
        }
    }

    function handleZoomClick(changefactor: number) {
        let chart = chartRef.current
        if (chart) {
            chart.zoom(chart.zoom() * changefactor)
        }
    }

    function handleCenterClick() {
        let chart = chartRef.current
        if (chart) {
            chart.fit()
            chart.center()
        }
    }

    return (
        <div className="flex flex-col h-full">
            <form onSubmit={runQuery} className="items-center flex flex-row space-x-3 m-2 p-2 rounded-lg border border-gray-300">
                <Label htmlFor="query" className="text">Query</Label>
                <Input id="graph" className="border-gray-500 w-2/12"
                    placeholder="Enter Graph name" type="text" onChange={updateGraph} />
                <Input id="query" className="border-gray-500 w-8/12"
                    placeholder="MATCH (n)-[e]-() RETURN n,e limit 100" type="text" onChange={updateQuery} />
                <Button type="submit">Run</Button>
            </form>
            <main className="h-full w-full">
                <div className="flex flex-row" >
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={() => handleZoomClick(1.1)}><ZoomIn /></TooltipTrigger>
                            <TooltipContent>
                                <p>Zoom In</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={() => handleZoomClick(0.9)}><ZoomOut /></TooltipTrigger>
                            <TooltipContent>
                                <p>Zoom Out</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={handleCenterClick}><XCircle /></TooltipTrigger>
                            <TooltipContent>
                                <p>Center</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
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
