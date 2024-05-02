'use client'

import { toast } from "@/components/ui/use-toast";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Maximize2, X } from "lucide-react";
import { securedFetch } from "@/lib/utils";
// eslint-disable-next-line import/no-extraneous-dependencies
import { GraphEdge, GraphNode } from "reagraph";
import MainQuery from "./mainQuery";
// eslint-disable-next-line import/no-named-as-default
import GraphSection, { GraphState } from "./graphSection";

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

// const getNodeColor = (): string => {

// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createElement = (element: any): GraphNode | GraphEdge => {
    if (element.relationshipType) {
        return {
            id: element.id,
            source: element.sucreId,
            target: element.destinationId,
            data: element.properties,
            label: element.properties.label || element.relationshipType,
            subLabel: element.properties.subLabel,
            labelVisible: true,
            size: 10,
        } as GraphEdge
    }
    return {
        id: element.id,
        data: element.properties,
        label: element.labels[0],
        subLabel: element.properties.subLabel,
        labelVisible: true,
        size: 10,
        fill: "red"
    } as GraphNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createGraph = (result: any, query: string, graphName: string): GraphState => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const graph: any[] = result.data.map((elements: any) => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.values(elements).map((element: any) => createElement(element))
    ))
    const nodes = graph.filter((element) => !!element.labels)
    const edges = graph.filter((element) => !!element.relationshipType)
    return {
        edges,
        nodes,
        query,
        graphName
    } as GraphState
}

export default function Page() {

    const [graphStates, setGraphStates] = useState<GraphState[]>([])
    const iconSize = 15

    function prepareArg(arg: string): string {
        return encodeURIComponent(arg.trim())
    }

    const defaultQuery = (q: string) =>
        q.trim() || "MATCH (n) OPTIONAL MATCH (n)-[e]-(m) RETURN n,e,m limit 100";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runQuery = async (event: React.FormEvent<HTMLElement>, graphName: string, query: string): Promise<any | null> => {
        event.preventDefault()
        // Proposed abstraction for improved modularity
        if (!validateGraphSelection(graphName)) return null

        const q = defaultQuery(query)

        const result = await securedFetch(`/api/graph?graph=${prepareArg(graphName)}&query=${prepareArg(q)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (result.ok) {
            const json = await result.json()
            return json.result
        }
        return null
    }

    const runMainQuery = async (event: React.FormEvent<HTMLElement>, graphName: string, query: string) => {
        event.preventDefault()
        const data = await runQuery(event, graphName, query)
        if (!data) return
        const q = defaultQuery(query)
        setGraphStates(prev => [createGraph(data, q, graphName), ...prev])
    }

    const onDelete = (graphName: string) => {
        setGraphStates((prev: GraphState[]) => prev.filter(state => state.graphName !== graphName))
    }

    const closeState = (id: number) => {
        setGraphStates((prev: GraphState[]) => prev.filter(state => state.id !== id))
    }
    return (
        <div className="h-full flex flex-col p-2 gap-y-2">
            <MainQuery
                onSubmit={runMainQuery}
                onDelete={onDelete}
                className="border rounded-lg border-gray-300 p-2"
            />
            <ul className="grow space-y-4 overflow-auto">
                {
                    graphStates.length > 0 &&
                    graphStates.map((state, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <li key={index} className="h-full flex flex-col border rounded-lg border-gray-300 p-2">
                            <div className="p-2 pt-0 flex flex-row justify-between">
                                <div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button title="Fullscreen" type="button">
                                                {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                                                <Maximize2 size={iconSize} />
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-full h-full p-3 pt-10">
                                            <GraphSection
                                                onSubmit={runQuery}
                                                graphState={state}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <button title="close" type="button" onClick={() => closeState(state.id)}>
                                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                                    <X size={iconSize} />
                                </button>
                            </div>
                            <div className="grow">
                                <GraphSection
                                    onSubmit={runQuery}
                                    graphState={state}
                                />
                            </div>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}
