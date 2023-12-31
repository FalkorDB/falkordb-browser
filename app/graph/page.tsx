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
        fetch(`/api/graph?graph=${prepareArg(graph)}&query=${prepareArg(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((result) => {
            console.log(result)

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
                .then((elements) => {
                    console.log(elements)
                    setElements(elements)
                })


            //         { data: { id: 'one', label: 'Node 1' }, position: { x: 100, y: 10 } },
            //         { data: { id: 'two', label: 'Node 2' }, position: { x: 300, y: 330 } },
            //         { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
            // ])
        })
    }

    let layout = {
        name: "cose",
        fit: true,
        padding: 30,
        avoidOverlap: true,
    }

    return (
        <div className="flex flex-col h-full">
            <div className="items-center flex flex-row space-x-3 m-2 p-2 rounded-lg border border-gray-300">
                <Label htmlFor="query" className="text">Query</Label>
                <Input id="graph" className="border-gray-500 w-2/12"
                    placeholder="Enter Graph name" type="text" onChange={updateGraph} />
                <Input id="query" className="border-gray-500 w-8/12"
                    placeholder="Enter Cypher query" type="text" onChange={updateQuery} />
                <Button onClick={runQuery}>Run</Button>
            </div>
            {elements.length > 0 &&
                <div className="m-2 p-2 rounded-lg border border-gray-300 h-5/6">
                    <CytoscapeComponent
                        cy={(cy) => {
                            console.log("cy! " + cy) 

                            cy.ready( function () {
                                console.log("Ready!")
                                // this.fit(); // Fits all elements in the viewport
                                // this.center(); // Centers the graph in the viewport
                                // return this
                            });
                        }}
                        elements={elements}
                        layout={layout}
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
    id: string,
    name: string,
    value: string,
    category: number
  }
  
  export interface GraphLink {
    source: string,
    target: string
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
    edges: Set<GraphLink>,
}

function extractData(results: GraphResult | null) : ExtractedData {
    console.log("extractData " + results)
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
    categories.set("default", { name: "default", index: 0})

    let edges = new Set<GraphLink>()

    data.forEach((row: any[]) => {
        Object.values(row).forEach((cell: any) => {
            if (cell instanceof Object) {
                if (cell.relationshipType) {

                    let sourceId = cell.sourceId.toString();
                    let destinationId = cell.destinationId.toString()
                    edges.add({ source: sourceId, target: destinationId })

                    // creates a fakeS node for the source and target
                    let source = nodes.get(cell.sourceId)
                    if(!source) {
                        source = { id: cell.sourceId.toString(), name: cell.sourceId.toString(), value: "", category: 0 }
                        nodes.set(cell.sourceId, source)
                    }

                    let destination = nodes.get(cell.destinationId)
                    if(!destination) {
                        destination = { id: cell.destinationId.toString(), name: cell.destinationId.toString(), value: "", category: 0 }
                        nodes.set(cell.destinationId, destination)
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
                        node = { id: cell.id.toString(), name: cell.id.toString(), value: JSON.stringify(cell), category: category.index }
                        nodes.set(cell.id, node)
                    }
                }
            }
        })
    })

    return { data, columns, categories, nodes, edges}
}
