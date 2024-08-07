'use client'

import { useState } from "react";
import { Toast, defaultQuery, prepareArg, securedFetch } from "@/lib/utils";
import GraphView from "./GraphView";
import Selector from "./Selector";
import Header from "../components/Header";
import { Graph, Query } from "../api/graph/model";

export default function Page() {

    const [graphName, setGraphName] = useState<string>("")
    const [graph, setGraph] = useState<Graph>(Graph.empty())
    const [queries, setQueries] = useState<Query[]>([])
    const [historyQuery, setHistoryQuery] = useState<string>("")
    
    const handleGraphChange = (selectedGraphName: string) => {
        
        setGraphName(selectedGraphName)
    }

    const run = async (query: string) => {
        if (!graphName) {
            Toast("Select a graph first")
            return null
        }

        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(defaultQuery(query))}`, {
            method: "GET"
        })
        
        if (!result.ok) return null

        const json = await result.json()

        return json.result   
    }
    
    const runQuery = async (query: string) => {
        const result = await run(query)
        if (!result) return
        setQueries(prev => [...prev, { text: defaultQuery(query), metadata: result.metadata }])
        setGraph(Graph.create(graphName, result))
    }
    
    const runHistoryQuery = async (query: string, setQueriesOpen: (open: boolean) => void) => {
        const result = await run(query)
        if (!result) return
        setQueries(prev => prev.filter(q => q.text === query).length > 0 ? prev : [...prev, { text: query, metadata: result.metadata }])
        setGraph(Graph.create(graphName, result))
        setHistoryQuery(query)
        setQueriesOpen(false)
    }

    return (
        <div className="h-full w-full flex flex-col">
            <Header onSetGraphName={setGraphName}/>            
            <div className="h-1 grow p-8 px-10 flex flex-col gap-8">
                <Selector queries={queries} onChange={handleGraphChange} graphName={graphName} runQuery={runHistoryQuery}/>
                <GraphView graph={graph} setGraph={setGraph} runQuery={runQuery} historyQuery={historyQuery}/>
            </div>
        </div>
    )
}
