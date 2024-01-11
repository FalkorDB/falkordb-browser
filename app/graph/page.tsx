'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast";
import CytoscapeComponent from 'react-cytoscapejs'
import { useState } from "react";

export default function Page() {
    const [query, setQuery] = useState('');
    const [graph, setGraph] = useState('');
    const [elements, setElements] = useState([] as any);

    function updateQuery(event: React.ChangeEvent<HTMLInputElement>) {
        setQuery(event.target.value)
    }

    function updateGraph(event: React.ChangeEvent<HTMLInputElement>) {
        setGraph(event.target.value)
    }

    function prepareArg(arg: string): string {
        return encodeURIComponent(arg.trim())
    }

    function runQuery() {

        let q = query.trim() || "MATCH (n)-[e]-() RETURN n,e limit 100";

        fetch(`/api/graph?graph=${prepareArg(graph)}&query=${prepareArg(q)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((result) => {
            if (result.status >= 300) {
                toast({
                    title: "Error",
                    description: result.text(),
                })
            }
            result.json()
                .then((json) => {
                    return extractData(json.result)
                })
                .then((data) => {
                    let elements: any[] = []

                    data.nodes.forEach((node: GraphData) => {
                        elements.push({ data: node })
                    })
                    data.edges.forEach((node: GraphLink) => {
                        elements.push({ data: node })
                    })

                    setElements(elements)
                })
        })
    }

    return (
        <div className="flex flex-col h-full">
            <div className="items-center flex flex-row space-x-3 m-2 p-2 rounded-lg border border-gray-300">
                <Label htmlFor="query" className="text">Query</Label>
                <Input id="graph" className="border-gray-500 w-2/12"
                    placeholder="Enter Graph name" type="text" onChange={updateGraph} />
                <Input id="query" className="border-gray-500 w-8/12"
                    placeholder="MATCH (n)-[e]-() RETURN n,e limit 100" type="text" onChange={updateQuery} />
                <Button onClick={runQuery}>Run</Button>
            </div>
            {elements.length > 0 &&
                <div className="m-2 p-2 rounded-lg border border-gray-300 h-5/6">
                    <CytoscapeComponent
                        stylesheet={[
                            {
                                selector: 'node',
                                style: {
                                    label: "data(label)",
                                    "text-valign": "center",
                                    "text-halign": "center",
                                    shape: "ellipse",
                                    height: 10,
                                    width: 10,
                                    "font-size": "5",
                                },
                            },
                            {
                                selector: "edge",
                                style: {
                                    width: 1,
                                    'line-color': '#ccc',
                                    "arrow-scale": 0.5,
                                    "target-arrow-shape": "triangle",
                                    label: "data(label)",
                                    'curve-style': 'straight',
                                    "text-background-color": "#ffffff",
                                    "text-background-opacity": 1,
                                    "font-size": "5",
                                },
                            },
                        ]}
                        elements={elements}
                        layout={{
                            name: "cose",
                            fit: true,
                            padding: 30,
                            avoidOverlap: true,
                        }}
                        className="w-full h-full"
                    />
                </div>
            }
        </div>
    )
}

export interface Category {
    name: string,
    index: number
}

export interface GraphData {
    id: number,
    name: string,
    value: string,
    label: string
}

export interface GraphLink {
    id: number,
    source: string,
    target: string,
    label: string
}

interface GraphResult {
    data: any[],
    metadata: any
}

interface ExtractedData {
    data: any[][],
    columns: string[],
    categories: Map<String, Category>,
    nodes: Map<number, GraphData>,
    edges: Map<number,GraphLink>,
}

function extractData(results: GraphResult | null): ExtractedData {
    let columns: string[] = []
    let data: any[][] = []
    if (results?.data?.length) {
        if (results.data[0] instanceof Object) {
            columns = Object.keys(results.data[0])
        }
        data = results.data
    }

    let nodes = new Map<number, GraphData>()
    let categories = new Map<String, Category>()
    categories.set("default", { name: "default", index: 0 })

    let edges = new Map<number, GraphLink>()

    data.forEach((row: any[]) => {
        Object.values(row).forEach((cell: any) => {
            if (cell instanceof Object) {
                if (cell.relationshipType) {

                    let edge = edges.get(cell.id)
                    if(!edge) {
                        let sourceId = cell.sourceId.toString();
                        let destinationId = cell.destinationId.toString()
                        edges.set(cell.id, { id: cell.id, source: sourceId, target: destinationId, label: cell.relationshipType })
                    
                        // creates a fakeS node for the source and target
                        let source = nodes.get(cell.sourceId)
                        if (!source) {
                            source = { id: cell.sourceId.toString(), name: cell.sourceId.toString(), value: "", label: "" }
                            nodes.set(cell.sourceId, source)
                        }

                        let destination = nodes.get(cell.destinationId)
                        if (!destination) {
                            destination = { id: cell.destinationId.toString(), name: cell.destinationId.toString(), value: "", label: "" }
                            nodes.set(cell.destinationId, destination)
                        }
                    }
                } else if (cell.labels) {

                    // check if category already exists in categories
                    let category = categories.get(cell.labels[0])
                    if (!category) {
                        category = { name: cell.labels[0], index: categories.size }
                        categories.set(category.name, category)
                    }

                    // check if node already exists in nodes or fake node was created
                    let node = nodes.get(cell.id)
                    if (!node || node.value === "") {
                        node = { id: cell.id.toString(), name: cell.id.toString(), value: JSON.stringify(cell), label: category.name }
                        nodes.set(cell.id, node)
                    }
                }
            }
        })
    })

    return { data, columns, categories, nodes, edges }
}
