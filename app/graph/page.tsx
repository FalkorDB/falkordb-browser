'use client'

import { useCallback, useEffect, useState } from "react";
import { HistoryQuery, prepareArg, Query, securedFetch } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import Header from "../components/Header";
import { Graph, Link, Node } from "../api/graph/model";
import GraphView from "./GraphView";
import Tutorial from "./Tutorial";

const Selector = dynamic(() => import("./Selector"), { ssr: false })

export default function Page() {

    const [edgesCount, setEdgesCount] = useState<number>(0)
    const [nodesCount, setNodesCount] = useState<number>(0)
    const [graphName, setGraphName] = useState<string>("")
    const [graph, setGraph] = useState<Graph>(Graph.empty())
    const [selectedElement, setSelectedElement] = useState<Node | Link>();
    const [graphNames, setGraphNames] = useState<string[]>([])
    const [historyQuery, setHistoryQuery] = useState<HistoryQuery>({
        queries: [],
        query: "",
        currentQuery: "",
        counter: 0
    })
    const [currentQuery, setCurrentQuery] = useState<Query | undefined>(undefined)
    const { data: session } = useSession()
    const { toast } = useToast()

    useEffect(() => {
        setHistoryQuery({
            queries: JSON.parse(localStorage.getItem(`query history`) || "[]"),
            query: "",
            currentQuery: "",
            counter: 0
        })
    }, [])

    const fetchCount = useCallback(async () => {
        if (!graphName) return
        const q1 = "MATCH (n) RETURN COUNT(n) as nodes"
        const q2 = "MATCH ()-[e]->() RETURN COUNT(e) as edges"

        const nodes = await (await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q1)}`, {
            method: "GET"
        }, toast)).json()

        const edges = await (await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q2)}`, {
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
            setCurrentQuery(undefined)
        }
        fetchCount()
    }, [fetchCount, graph.Id, graphName])

    const run = async (q: string) => {
        if (!graphName) {
            toast({
                title: "Error",
                description: "Select a graph first",
                variant: "destructive"
            })
            return null
        }

        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q)}`, {
            method: "GET"
        }, toast)

        if (!result.ok) return null

        const json = await result.json()
        fetchCount()
        setSelectedElement(undefined)

        return json.result
    }

    const runQuery = async (q: string) => {
        const result = await run(q)
        if (!result) return undefined
        const explain = await securedFetch(`api/graph/${prepareArg(graphName)}/explain/?query=${prepareArg(q)}`, {
            method: "GET"
        }, toast)
        if (!explain.ok) return undefined
        const explainJson = await explain.json()
        const newQuery = { text: q, metadata: result.metadata, explain: explainJson.result }
        const queryArr = historyQuery.queries.some(qu => qu.text === q) ? historyQuery.queries : [...historyQuery.queries, newQuery]
        setHistoryQuery(prev => ({
            ...prev,
            queries: queryArr,
            currentQuery: q,
            counter: 0
        }))
        localStorage.setItem("query history", JSON.stringify(queryArr))
        const g = Graph.create(graphName, result, false, false, graph.Colors)
        setGraph(g)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.graph = g
        return newQuery
    }

    return (
        <div className="Page">
            <Header onSetGraphName={setGraphName} graphNames={graphNames} />
            <div className="h-1 grow p-8 px-10 flex flex-col gap-4">
                <Selector
                    setGraphName={setGraphName}
                    graphName={graphName}
                    options={graphNames}
                    setOptions={setGraphNames}
                    runQuery={runQuery}
                    edgesCount={edgesCount}
                    nodesCount={nodesCount}
                    setGraph={setGraph}
                    graph={graph}
                    data={session}
                    historyQuery={historyQuery}
                    setHistoryQuery={setHistoryQuery}
                />
                <GraphView
                    graph={graph}
                    currentQuery={currentQuery}
                    setCurrentQuery={setCurrentQuery}
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                    runQuery={runQuery}
                    fetchCount={fetchCount}
                    historyQuery={historyQuery}
                    setHistoryQuery={setHistoryQuery}
                />
                <Tutorial onSetGraphName={setGraphName} graphNames={graphNames} />
            </div>
        </div >
    )
}