'use client'

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { getQueryWithLimit, prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import { ForceGraphMethods } from "react-force-graph-2d";
import { Category, Graph, GraphData, Link, Node } from "../api/graph/model";
import Tutorial from "./Tutorial";
import { GraphNameContext, GraphContext, IndicatorContext, LimitContext, TimeoutContext, GraphNamesContext, HistoryQueryContext, RunDefaultQueryContext, DefaultQueryContext } from "../components/provider";

const Selector = dynamic(() => import("./Selector"), { ssr: false })
const GraphView = dynamic(() => import("./GraphView"), { ssr: false })

export default function Page() {
    const { graphNames, setGraphNames } = useContext(GraphNamesContext)
    const { historyQuery, setHistoryQuery } = useContext(HistoryQueryContext)
    const { setIndicator } = useContext(IndicatorContext);
    const { graph, setGraph } = useContext(GraphContext)
    const { graphName, setGraphName } = useContext(GraphNameContext)
    const { timeout } = useContext(TimeoutContext);
    const { limit } = useContext(LimitContext);
    const { runDefaultQuery } = useContext(RunDefaultQueryContext)
    const { defaultQuery } = useContext(DefaultQueryContext)

    const { toast } = useToast()

    const chartRef = useRef<ForceGraphMethods<Node, Link>>()

    const [selectedElement, setSelectedElement] = useState<Node | Link | undefined>()
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([])
    const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0)
    const [categories, setCategories] = useState<Category<Node>[]>([])
    const [data, setData] = useState<GraphData>({ ...graph.Elements })
    const [labels, setLabels] = useState<Category<Link>[]>([])
    const [nodesCount, setNodesCount] = useState(0)
    const [edgesCount, setEdgesCount] = useState(0)
    const [colors, setColors] = useState<string[]>([])

    useEffect(() => {
        if (JSON.stringify(graph.Colors) !== JSON.stringify(colors)) {
            setColors(graph.Colors)
        }
    }, [colors, graph.Colors])

    useEffect(() => {
        setLabels([...graph.Labels])
        setCategories([...graph.Categories])
    }, [graph, graph.Labels.length, graph.Categories.length, graph.Labels, graph.Categories])

    const fetchCount = useCallback(async () => {
        if (!graphName) return

        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/count`, {
            method: "GET"
        }, toast, setIndicator)

        if (!result.ok) return

        let json = await result.json()

        while (typeof json.result === "number") {
            // eslint-disable-next-line no-await-in-loop
            const res = await securedFetch(`api/graph/${prepareArg(graphName)}/query/?id=${prepareArg(json.result.toString())}`, {
                method: "GET"
            }, toast, setIndicator)

            if (!res.ok) return

            // eslint-disable-next-line no-await-in-loop
            json = await res.json()
        }

        [json] = json.result.data

        setEdgesCount(json.edges)
        setNodesCount(json.nodes)
    }, [graphName, toast, setIndicator])

    const run = useCallback(async (q: string) => {
        if (!graphName) {
            toast({
                title: "Error",
                description: "Select a graph first",
                variant: "destructive"
            })
            return null
        }

        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(getQueryWithLimit(q, limit))}&timeout=${timeout}`, {
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

        setSelectedElement(undefined)

        return json.result
    }, [graphName, limit, timeout, toast, setIndicator])

    const handleCooldown = (ticks?: number) => {
        setCooldownTicks(ticks)

        const canvas = document.querySelector('.force-graph-container canvas');
        if (!canvas) return
        if (ticks === 0) {
            canvas.setAttribute('data-engine-status', 'stop')
        } else {
            canvas.setAttribute('data-engine-status', 'running')

        }
    }

    const runQuery = useCallback(async (q: string) => {
        const result = await run(q)
        if (!result) return
        const explain = await securedFetch(`api/graph/${prepareArg(graphName)}/explain/?query=${prepareArg(q)}`, {
            method: "GET"
        }, toast, setIndicator)
        if (!explain.ok) return
        const explainJson = await explain.json()
        const newQuery = { text: q, metadata: result.metadata, explain: explainJson.result, profile: [] }
        const queryArr = historyQuery.queries.some(qu => qu.text === q) ? historyQuery.queries : [...historyQuery.queries, newQuery]
        setHistoryQuery(prev => ({
            ...prev,
            queries: queryArr,
            currentQuery: q,
            counter: 0
        }))
        localStorage.setItem("query history", JSON.stringify(queryArr))
        const g = Graph.create(graphName, result, false, false, limit, colors, newQuery)
        setGraph(g)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.graph = g
        fetchCount()
        handleCooldown()
    }, [run, graphName, toast, setIndicator, historyQuery.queries, setHistoryQuery, limit, colors, setGraph, fetchCount])

    useEffect(() => {
        if (graphName !== graph.Id) {
            const colorsArr = JSON.parse(localStorage.getItem(graphName) || "[]")
            setGraph(Graph.empty(graphName, colorsArr))
        }
        fetchCount()
        if (runDefaultQuery && graphName) {
            runQuery(defaultQuery)
        }
    }, [fetchCount, graph.Id, graphName, setGraph, runDefaultQuery, runQuery, defaultQuery])

    const handleDeleteElement = async () => {
        if (selectedElements.length === 0 && selectedElement) {
            selectedElements.push(selectedElement)
            setSelectedElement(undefined)
        }

        await Promise.all(selectedElements.map(async (element) => {
            const type = !element.source
            const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${prepareArg(element.id.toString())}`, {
                method: "DELETE",
                body: JSON.stringify({ type })
            }, toast, setIndicator)

            if (!result.ok) return

            if (type) {
                (element as Node).category.forEach((category) => {
                    const cat = graph.CategoriesMap.get(category)
                    if (cat) {
                        cat.elements = cat.elements.filter((e) => e.id !== element.id)
                        if (cat.elements.length === 0) {
                            const index = graph.Categories.findIndex(c => c.name === cat.name)
                            if (index !== -1) {
                                graph.Categories.splice(index, 1)
                                graph.CategoriesMap.delete(cat.name)
                            }
                        }
                    }
                })
            } else {
                const category = graph.LabelsMap.get((element as Link).label)
                if (category) {
                    category.elements = category.elements.filter((e) => e.id !== element.id)
                    if (category.elements.length === 0) {
                        const index = graph.Labels.findIndex(l => l.name === category.name)
                        if (index !== -1) {
                            graph.Labels.splice(index, 1)
                            graph.LabelsMap.delete(category.name)
                        }
                    }
                }
            }
        }))

        graph.removeElements(selectedElements)

        fetchCount()
        setSelectedElements([])
        setSelectedElement(undefined)

        setLabels(graph.removeLinks(selectedElements.map((element) => element.id)))

        setData({ ...graph.Elements })
        toast({
            title: "Success",
            description: `${selectedElements.length > 1 ? "Elements" : "Element"} deleted`,
        })
        handleCooldown()
        setSelectedElement(undefined)
        setSelectedElements([])
    }

    return (
        <div className="Page">
            <Selector
                graph={graph}
                options={graphNames}
                setOptions={setGraphNames}
                graphName={graphName}
                setGraphName={setGraphName}
                runQuery={runQuery}
                historyQuery={historyQuery}
                setHistoryQuery={setHistoryQuery}
                fetchCount={fetchCount}
                selectedElements={selectedElements}
                setSelectedElement={setSelectedElement}
                handleDeleteElement={handleDeleteElement}
                chartRef={chartRef}
                setGraph={setGraph}
            />
            <div className="h-1 grow p-12">
                <GraphView
                    fetchCount={fetchCount}
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                    selectedElements={selectedElements}
                    setSelectedElements={setSelectedElements}
                    nodesCount={nodesCount}
                    edgesCount={edgesCount}
                    handleCooldown={handleCooldown}
                    cooldownTicks={cooldownTicks}
                    chartRef={chartRef}
                    data={data}
                    setData={setData}
                    handleDeleteElement={handleDeleteElement}
                    setLabels={setLabels}
                    setCategories={setCategories}
                    labels={labels}
                    categories={categories}
                />
            </div>
            <Tutorial />
            <div className="h-4 w-full Gradient" />
        </div >
    )
}