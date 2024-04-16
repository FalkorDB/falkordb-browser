'use client'

import { toast } from "@/components/ui/use-toast";
import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { Query } from "./query";
import { QuerySection } from "./QuerySection";
import { Maximize2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export class QueryState {

    public static count: number = 0;

    public id: number;

    constructor(
        public graphName: string,
        public query: string | undefined,
        public data?: any,
    ) {
        this.id = QueryState.count++;
    }
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

    const [queryStates, setQueryStates] = useState<QueryState[]>([])
    const [mainQueryState, setMainQueryState] = useState<QueryState | null>(null);
    const iconSize = 15

    function prepareArg(arg: string): string {
        return encodeURIComponent(arg.trim())
    }

    const runMainQuery = async (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault()
        if (!mainQueryState) return
        const data = await runQuery(event, mainQueryState)
        if (!data) return
        const q = mainQueryState.query?.trim() || "MATCH (n) OPTIONAL MATCH (n)-[e]-(m) RETURN n,e,m limit 100";
        setQueryStates(prev => [new QueryState(mainQueryState.graphName, q, data), ...prev])
    }

    const runQuery = async (event: React.FormEvent<HTMLElement>, queryState: QueryState) => {
        event.preventDefault()
        // Proposed abstraction for improved modularity
        if (!validateGraphSelection(queryState.graphName)) return

        const q = queryState.query?.trim() || "MATCH (n) OPTIONAL MATCH (n)-[e]-(m) RETURN n,e,m limit 100";

        const result = await fetch(`/api/graph?graph=${prepareArg(queryState.graphName)}&query=${prepareArg(q)}`, {
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
        return json.result
    }

    const onDelete = (graphName: string) => {
        setQueryStates((prev: QueryState[]) => prev.filter(state => state.graphName !== graphName))
    }

    const closeState = (id: number) => {
        setQueryStates((prev: QueryState[]) => prev.filter(state => state.id !== id))
    }
    return (
        <div className="h-full flex flex-col p-2 gap-y-2">
            <Query
                onMainSubmit={runMainQuery}
                setMainQueryState={setMainQueryState}
                onDelete={onDelete}
                className="border rounded-lg border-gray-300 p-2"
            />
            <ul className="grow space-y-4 overflow-auto">
                {
                    queryStates.length > 0 &&
                    queryStates.map((state) => {
                        return (
                            <li key={state.id} className="h-full flex flex-col border rounded-lg border-gray-300 p-2">
                                <div className="p-2 pt-0 flex flex-row justify-between">
                                    <div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button title="Fullscreen" type="button">
                                                    <Maximize2 size={iconSize} />
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-full h-full p-3 pt-10">
                                                <QuerySection
                                                    onSubmit={runQuery}
                                                    onDelete={onDelete}
                                                    queryState={state}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <button title="close" type="button" onClick={() => closeState(state.id)}>
                                        <X size={iconSize} />
                                    </button>
                                </div>
                                <div className="grow">
                                    <QuerySection
                                        onSubmit={runQuery}
                                        onDelete={onDelete}
                                        queryState={state}
                                    />
                                </div>
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    )
}
