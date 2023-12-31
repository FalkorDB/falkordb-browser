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
        console.log("Query running!")
        fetch(`/api/graph?graph=${prepareArg(graph)}&query=${prepareArg(query)}`, {
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
                    return json.result.data.map((row: Map<any, any>) => {
                        console.log(row)
                        // row.values.ma
                        return { data: { id: row.n.id, label: row.n.labels[0] } }
                    })
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