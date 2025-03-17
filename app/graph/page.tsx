'use client'

import { useCallback, useEffect, useState } from "react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import Selector from "./Selector";
import Header from "../components/Header";
import { Graph, Link, Node, Query } from "../api/graph/model";
import GraphView from "./GraphView";
import Tutorial from "./Tutorial";

export default function Page() {

    const [edgesCount, setEdgesCount] = useState<number>(0)
    const [nodesCount, setNodesCount] = useState<number>(0)
    const [graphName, setGraphName] = useState<string>("")
    const [graph, setGraph] = useState<Graph>(Graph.empty())
    const [queries, setQueries] = useState<Query[]>([])
    const [historyQuery, setHistoryQuery] = useState<string>("")
    const [selectedElement, setSelectedElement] = useState<Node | Link>();
    const [graphNames, setGraphNames] = useState<string[]>([])
    const { data: session } = useSession()
    const { toast } = useToast()

    useEffect(() => {
        setQueries(JSON.parse(localStorage.getItem(`query history`) || "[]"))
    }, [])

    const fetchCount = useCallback(async () => {
        if (!graphName) return
        const q1 = "MATCH (n) RETURN COUNT(n) as nodes"
        const q2 = "MATCH ()-[e]->() RETURN COUNT(e) as edges"

        const nodes = await (await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${q1}`, {
            method: "GET"
        }, toast)).json()

        const edges = await (await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${q2}`, {
            method: "GET"
        }, toast)).json()

        if (!edges || !nodes) return

        setEdgesCount(edges.result?.data[0].edges)
        setNodesCount(nodes.result?.data[0].nodes)
    }, [graphName, toast])

    useEffect(() => {
        if (graphName !== graph.Id) {
            const colors = JSON.parse(localStorage.getItem(graphName) || "[]")
            setGraph(Graph.empty(graphName, colors))
        }
        fetchCount()
    }, [fetchCount, graph.Id, graphName])

    const run = async (query: string) => {
        if (!graphName) {
            toast({
                title: "Error",
                description: "Select a graph first",
                variant: "destructive"
            })
            return null
        }

        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(query)}`, {
            method: "GET"
        }, toast)

        if (!result.ok) return null

        const json = await result.json()
        fetchCount()
        setSelectedElement(undefined)

        return json.result
    }

    const runQuery = async (query: string) => {
        if (!query) return
        const result = await run(query)
        if (!result) return
        const queryArr = queries.some(q => q.text === query) ? queries : [...queries, { text: query, metadata: result.metadata }]
        setQueries(queryArr)
        localStorage.setItem("query history", JSON.stringify(queryArr))
        const g = Graph.create(graphName, result, false, false, graph.Colors)
        setGraph(g)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.graph = g
    }

    const runHistoryQuery = async (query: string) => {
        const result = await run(query)
        if (!result) return
        const queryArr = queries.some(q => q.text === query) ? queries : [...queries, { text: query, metadata: result.metadata }]
        setQueries(queryArr)
        localStorage.setItem("query history", JSON.stringify(queryArr))
        setGraph(Graph.create(graphName, result, false, false, graph.Colors))
        setHistoryQuery(query)
    }

    return (
        <div className="Page">
            <Header onSetGraphName={setGraphName} graphNames={graphNames} />
            <div className="h-1 grow p-8 px-10 flex flex-col gap-4">
                <Selector
                    queries={queries}
                    setGraphName={setGraphName}
                    graphName={graphName}
                    options={graphNames}
                    setOptions={setGraphNames}
                    runQuery={runHistoryQuery}
                    edgesCount={edgesCount}
                    nodesCount={nodesCount}
                    setGraph={setGraph}
                    graph={graph}
                    data={session}

                />
                <GraphView
                    graph={graph}
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                    runQuery={runQuery}
                    historyQuery={historyQuery}
                    historyQueries={queries.map(({ text }) => text)}
                    setHistoryQueries={(queriesArr) => setQueries(queries.map((query, i) => ({ text: queriesArr[i], metadata: query.metadata } as Query)))}
                    fetchCount={fetchCount}
                />
                <Tutorial onSetGraphName={setGraphName} graphNames={graphNames} />
            </div>
        </div >
    )
}