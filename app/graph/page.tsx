'use client'

import { useCallback, useContext, useEffect, useState } from "react";
import { HistoryQuery, prepareArg, securedFetch } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import Header from "../components/Header";
import { Graph, Link, Node } from "../api/graph/model";
import GraphView from "./GraphView";
import Tutorial from "./Tutorial";
import { IndicatorContext } from "../components/provider";

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
    const { data: session } = useSession()
    const { toast } = useToast()
    const { setIndicator } = useContext(IndicatorContext);

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

        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/count`, {
            method: "GET"
        }, toast, setIndicator)

        const json = await result.json()

        setEdgesCount(json.result.edges)
        setNodesCount(json.result.nodes)
    }, [graphName, toast, setIndicator])

    useEffect(() => {
        if (graphName !== graph.Id) {
            const colors = JSON.parse(localStorage.getItem(graphName) || "[]")
            setGraph(Graph.empty(graphName, colors))
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
        }, toast, setIndicator)

        if (!result.ok) return null

        let json = await result.json()

        while (typeof json.result === "number") {
            // eslint-disable-next-line no-await-in-loop
            const res = await securedFetch(`api/graph/${prepareArg(graphName)}/query/?id=${prepareArg(json.result.toString())}`, {
                method: "GET"
            }, toast, setIndicator)

            if (!res.ok) return null

            // eslint-disable-next-line no-await-in-loop
            json = await res.json()
        }

        fetchCount()
        setSelectedElement(undefined)

        return json.result
    }

    const runQuery = async (q: string) => {
        const result = await run(q)
        if (!result) return undefined
        const explain = await securedFetch(`api/graph/${prepareArg(graphName)}/explain/?query=${prepareArg(q)}`, {
            method: "GET"
        }, toast, setIndicator)
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