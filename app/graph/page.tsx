'use client'

import { useCallback, useEffect, useState } from "react";
import { Toast, defaultQuery, prepareArg, securedFetch } from "@/lib/utils";
import { ElementDataDefinition } from "cytoscape";
import GraphView from "./GraphView";
import Selector from "./Selector";
import Header from "../components/Header";
import { Graph, Query } from "../api/graph/model";

export default function Page() {

    const [edgesCount, setEdgesCount] = useState<number>(0)
    const [nodesCount, setNodesCount] = useState<number>(0)
    const [graphName, setGraphName] = useState<string>("")
    const [graph, setGraph] = useState<Graph>(Graph.empty())
    const [queries, setQueries] = useState<Query[]>([])
    const [historyQuery, setHistoryQuery] = useState<string>("")
    const [selectedElement, setSelectedElement] = useState<ElementDataDefinition>();


    const fetchCount = useCallback(async () => {
        if (!graphName) return
        const q1 = "MATCH (n) RETURN COUNT(n) as nodes"
        const q2 = "MATCH ()-[e]->() RETURN COUNT(e) as edges"

        const nodes = await (await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${q1}`, {
            method: "GET"
        })).json()

        const edges = await (await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${q2}`, {
            method: "GET"
        })).json()

        if (!edges || !nodes) return

        setEdgesCount(edges.result?.data[0].edges)
        setNodesCount(nodes.result?.data[0].nodes)
    }, [graphName])

    useEffect(() => {
        if (graphName !== graph.Id) {
            const colors = localStorage.getItem(graphName)?.split(/[[\]",]/).filter(c => c)
            setGraph(Graph.empty(graphName, colors))
        }
        fetchCount()
    }, [fetchCount, graph.Id, graphName])

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
        setSelectedElement(undefined)
        return json.result
    }

    const runQuery = async (query: string) => {
        const result = await run(query)
        if (!result) return
        setQueries(prev => [...prev, { text: defaultQuery(query), metadata: result.metadata }])
        setGraph(Graph.create(graphName, result, graph.Colors))
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
                    setGraph={setGraph}
                    graph={graph}

                />
                <GraphView
                    graph={graph}
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                    runQuery={runQuery}
                    historyQuery={historyQuery}
                    fetchCount={fetchCount}
                />
            </div>
        </div>
    )
}
