'use client'

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { getSSEGraphResult, prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import { ForceGraphMethods } from "react-force-graph-2d";
import { Label, Graph, GraphData, Link, Node, Relationship } from "../api/graph/model";
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
        setGraphNames,
        nodesCount,
        setNodesCount,
        edgesCount,
        setEdgesCount,
        runQuery
    } = useContext(GraphContext)

    const {
        settings: {
            runDefaultQuerySettings: { runDefaultQuery },
            defaultQuerySettings: { defaultQuery },
            contentPersistenceSettings: { contentPersistence },
        }
    } = useContext(QuerySettingsContext)
    const { toast } = useToast()

    const chartRef = useRef<ForceGraphMethods<Node, Link>>()

    const [selectedElement, setSelectedElement] = useState<Node | Link | undefined>()
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([])
    const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0)
    const [labels, setLabels] = useState<Label[]>([])
    const [data, setData] = useState<GraphData>({ ...graph.Elements })
    const [relationships, setRelationships] = useState<Relationship[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        setRelationships([...graph.Relationships])
        setLabels([...graph.Labels])
    }, [graph, graph.Labels.length, graph.Relationships.length, graph.Labels, graph.Relationships])

    const fetchCount = useCallback(async () => {
        if (!graphName) return

        const result = await getSSEGraphResult(`api/graph/${prepareArg(graphName)}/count`, toast, setIndicator);

        const { nodes, edges } = result.data[0]

        setEdgesCount(edges || 0)
        setNodesCount(nodes || 0)
    }, [graphName, toast, setIndicator, setEdgesCount, setNodesCount])

    const handleCooldown = useCallback((ticks?: number) => {
        setCooldownTicks(ticks)

        const canvas = document.querySelector('.force-graph-container canvas');

        if (!canvas) return

        if (ticks === 0) {
            canvas.setAttribute('data-engine-status', 'stop')
            setIsLoading(false)
        } else {
            canvas.setAttribute('data-engine-status', 'running')
            setIsLoading(true)
        }
    }, [setCooldownTicks, setIsLoading])

    useEffect(() => {
        const content = localStorage.getItem("savedContent")

        if (content) {
            const { graphName: name, query } = JSON.parse(content)

            if (!graph.Id && !graphName && graphNames.includes(name) && contentPersistence) {
                setGraphName(name)
                runQuery(query, name)
                return
            }
        }


        if (!graphName) return

        if (graphName !== graph.Id) {
            if (runDefaultQuery) {
                runQuery(defaultQuery)
                return
            }

            const colorsArr = JSON.parse(localStorage.getItem(graphName) || "[]")
            setGraph(Graph.empty(graphName, colorsArr))
        }

        fetchCount()
    }, [fetchCount, graph.Id, graphName, setGraph, runDefaultQuery, defaultQuery, contentPersistence, setGraphName, graphNames])

    const handleDeleteElement = async () => {
        if (selectedElements.length === 0 && selectedElement) {
            selectedElements.push(selectedElement)
            setSelectedElement(undefined)
        }

        await Promise.all(selectedElements.map(async (element) => {
            const type = !("source" in element)
            const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${prepareArg(element.id.toString())}`, {
                method: "DELETE",
                body: JSON.stringify({ type })
            }, toast, setIndicator)

            if (!result.ok) return

            if (type) {
                (element as Node).labels.forEach((label) => {
                    const l = graph.LabelsMap.get(label)
                    if (l) {
                        l.elements = l.elements.filter((e) => e.id !== element.id)
                        if (l.elements.length === 0) {
                            const index = graph.Labels.findIndex(c => c.name === l.name)
                            if (index !== -1) {
                                graph.Labels.splice(index, 1)
                                graph.LabelsMap.delete(l.name)
                            }
                        }
                    }
                })
            } else {
                const relation = graph.RelationshipsMap.get((element as Link).relationship)
                if (relation) {
                    relation.elements = relation.elements.filter((e) => e.id !== element.id)
                    if (relation.elements.length === 0) {
                        const index = graph.Relationships.findIndex(l => l.name === relation.name)
                        if (index !== -1) {
                            graph.Relationships.splice(index, 1)
                            graph.RelationshipsMap.delete(relation.name)
                        }
                    }
                }
            }
        }))

        graph.removeElements(selectedElements)

        fetchCount()
        setSelectedElements([])
        setSelectedElement(undefined)

        setRelationships(graph.removeLinks(selectedElements.map((element) => element.id)))

        setData({ ...graph.Elements })
        toast({
            title: "Success",
            description: `${selectedElements.length > 1 ? "Elements" : "Element"} deleted`,
        })
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
                    setRelationships={setRelationships}
                    labels={labels}
                    relationships={relationships}
                    isLoading={isLoading}
                />
            </div>
            <Tutorial />
            <div className="h-4 w-full Gradient" />
        </div >
    )
}