'use client'

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { getQueryWithLimit, getSSEGraphResult, prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import { ForceGraphMethods } from "react-force-graph-2d";
import { Category, Graph, GraphData, Link, Node } from "../api/graph/model";
import Tutorial from "./Tutorial";
import { GraphContext, IndicatorContext, HistoryQueryContext, QuerySettingsContext } from "../components/provider";

const Selector = dynamic(() => import("./Selector"), { ssr: false })
const GraphView = dynamic(() => import("./GraphView"), { ssr: false })

export default function Page() {
    const { historyQuery, setHistoryQuery } = useContext(HistoryQueryContext)
    const { setIndicator } = useContext(IndicatorContext);
    const {
        graph,
        setGraph,
        graphName,
        setGraphName,
        graphNames,
        setGraphNames
    } = useContext(GraphContext)

    const {
        settings: {
            limitSettings: { limit },
            timeoutSettings: { timeout },
            runDefaultQuerySettings: { runDefaultQuery },
            defaultQuerySettings: { defaultQuery },
            contentPersistenceSettings: { contentPersistence },
        }
    } = useContext(QuerySettingsContext)
    const { toast } = useToast()

    const chartRef = useRef<ForceGraphMethods<Node, Link>>()

    const [isQueryLoading, setIsQueryLoading] = useState(true)
    const [selectedElement, setSelectedElement] = useState<Node | Link | undefined>()
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([])
    const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0)
    const [categories, setCategories] = useState<Category<Node>[]>([])
    const [data, setData] = useState<GraphData>({ ...graph.Elements })
    const [labels, setLabels] = useState<Category<Link>[]>([])
    const [nodesCount, setNodesCount] = useState(0)
    const [edgesCount, setEdgesCount] = useState(0)

    useEffect(() => {
        setLabels([...graph.Labels])
        setCategories([...graph.Categories])
    }, [graph, graph.Labels.length, graph.Categories.length, graph.Labels, graph.Categories])

    const fetchCount = useCallback(async () => {
        if (!graphName) return

        const result = await getSSEGraphResult(`api/graph/${prepareArg(graphName)}/count`, toast, setIndicator);

        const { nodes, edges } = result.data[0]

        setEdgesCount(edges || 0)
        setNodesCount(nodes || 0)
    }, [graphName, toast, setIndicator])

    const run = useCallback(async (q: string, name: string) => {
        if (!name) {
            toast({
                title: "Error",
                description: "Select a graph first",
                variant: "destructive"
            })
            return null
        }

        try {
            const url = `api/graph/${prepareArg(name)}?query=${prepareArg(getQueryWithLimit(q, limit))}&timeout=${timeout}`;
            const result = await getSSEGraphResult(url, toast, setIndicator);

            setSelectedElement(undefined);

            return result;
        } catch (error) {
            return null;
        }
    }, [limit, timeout, toast, setIndicator])

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

    const runQuery = useCallback(async (q: string, name?: string) => {
        const n = name || graphName
        const result = await run(q, n)

        if (!result) return

        setIsQueryLoading(true)

        try {
            const explain = await securedFetch(`api/graph/${prepareArg(n)}/explain?query=${prepareArg(q)}`, {
                method: "GET"
            }, toast, setIndicator)

            if (!explain.ok) return

            const explainJson = await explain.json()
            const newQuery = { text: q, metadata: result.metadata, explain: explainJson.result, profile: [] }
            const queryArr = historyQuery.queries.some(qu => qu.text === q) ? historyQuery.queries : [...historyQuery.queries, newQuery]

            setHistoryQuery(prev => historyQuery.counter === 0 ? {
                queries: queryArr,
                query: q,
                currentQuery: q,
                counter: 0
            } : {
                ...prev,
                queries: queryArr,
                currentQuery: q,
                counter: 0
            })

            const g = Graph.create(n, result, false, false, limit, graph.Colors, newQuery)

            setGraph(g)
            fetchCount()
            localStorage.setItem("query history", JSON.stringify(queryArr))
            localStorage.setItem("savedContent", JSON.stringify({ graphName: n, query: q }))
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.graph = g

            if (g.Elements.nodes.length > 0) {
                handleCooldown()
            }
        } finally {
            setIsQueryLoading(false)
        }
    }, [graphName, run, toast, setIndicator, historyQuery.queries, historyQuery.counter, setHistoryQuery, limit, graph.Colors, setGraph, fetchCount])

    useEffect(() => {
        if (contentPersistence) {
            const content = localStorage.getItem("savedContent")

            if (content) {
                const { graphName: name, query } = JSON.parse(content)

                if (!graph.Id && graphNames.includes(name)) {
                    setGraphName(name)
                    runQuery(query, name)
                    return
                }
            }
        }

        if (graphName) {
            if (graphName !== graph.Id) {
                if (runDefaultQuery) {
                    runQuery(defaultQuery)
                    return
                }
                
                const colorsArr = JSON.parse(localStorage.getItem(graphName) || "[]")
                setGraph(Graph.empty(graphName, colorsArr))
            }

            fetchCount()
        }
        
        setIsQueryLoading(false)
    }, [fetchCount, graph.Id, graphName, setGraph, runDefaultQuery, defaultQuery, contentPersistence, setGraphName, graphNames])

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
                isQueryLoading={isQueryLoading}
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