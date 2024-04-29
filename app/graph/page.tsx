'use client'

import { toast } from "@/components/ui/use-toast";
import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Maximize2, X } from "lucide-react";
import MainQuery from "./mainQuery";
import GraphSection from "./graphSection";
import { GraphState } from "./sectionQuery";

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

    const [queryStates, setQueryStates] = useState<GraphState[]>([])
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

        const result = await fetch(`/api/graph?graph=${prepareArg(graphName)}&query=${prepareArg(q)}`, {
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
            if (result.status === 401 || result.status >= 500) {
                signOut({ callbackUrl: '/login' })
            }
            return null
        }

        const json = await result.json()
        return json.result
    }
    
    const runMainQuery = async (event: React.FormEvent<HTMLElement>, graphName: string, query: string) => {
        event.preventDefault()
        const data = await runQuery(event, graphName, query)
        if (!data) return
        const q = defaultQuery(query)
        setQueryStates(prev => [new GraphState(graphName, q, data), ...prev])
    }

    const onDelete = (graphName: string) => {
        setQueryStates((prev: GraphState[]) => prev.filter(state => state.graphName !== graphName))
    }

    const closeState = (id: number) => {
        setQueryStates((prev: GraphState[]) => prev.filter(state => state.id !== id))
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
                    queryStates.length > 0 &&
                    queryStates.map((state) => (
                        <li key={state.id} className="h-full flex flex-col border rounded-lg border-gray-300 p-2">
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
                                                queryState={state}
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
                                    queryState={state}
                                />
                            </div>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}
