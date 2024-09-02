'use client'

import { useCallback, useEffect, useState } from "react";
import { Toast, defaultQuery, prepareArg, securedFetch } from "@/lib/utils";
import dynamic from "next/dynamic";
import Selector from "./Selector";
import Header from "../components/Header";
import { Graph, Query } from "../api/graph/model";

const GraphView = dynamic(() => import("./GraphView"), {
    ssr: false
})

export default function Page() {

    const [edgesCount, setEdgesCount] = useState<number>(0)
    const [nodesCount, setNodesCount] = useState<number>(0)
    const [graphName, setGraphName] = useState<string>("")
    const [graph, setGraph] = useState<Graph>(Graph.empty())
    const [queries, setQueries] = useState<Query[]>([])
    const [historyQuery, setHistoryQuery] = useState<string>("")

    const fetchCount = useCallback(async () => {
        if (!graphName) return
        const q = [
            "MATCH (n) RETURN COUNT(n) as nodes",
            "MATCH ()-[e]->() RETURN COUNT(e) as edges"
        ]

        const nodes = await (await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${q[0]}`, {
            method: "GET"
        })).json()

        const edges = await (await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${q[1]}`, {
            method: "GET"
        })).json()

        if (!edges || !nodes) return

        setEdgesCount(edges.result?.data[0].edges)
        setNodesCount(nodes.result?.data[0].nodes)
    }, [graphName])

    useEffect(() => {
        if (graphName !== graph.Id) {
            setGraph(Graph.empty())
        }
    }, [graph.Id, graphName])

    useEffect(() => {
        fetchCount()
    }, [fetchCount, graphName])

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
        fetchCount()
        return json.result
    }

    const runQuery = async (query: string) => {
        const result = await run(query)
        if (!result) return
        setQueries(prev => [...prev, { text: defaultQuery(query), metadata: result.metadata }])
        const newGraph = Graph.create(graphName, result)
        setGraph(newGraph)
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
        <div className="Page">
            <Header onSetGraphName={setGraphName} />
            <div className="h-1 grow p-8 px-10 flex flex-col gap-8">
                <Selector
                    queries={queries}
                    onChange={setGraphName}
                    graphName={graphName}
                    runQuery={runHistoryQuery}
                    edgesCount={edgesCount}
                    nodesCount={nodesCount}
                />
                <GraphView
                    graph={graph}
                    runQuery={runQuery}
                    historyQuery={historyQuery}
                    fetchCount={fetchCount}
                />
            </div>
        </div>
    )
}
