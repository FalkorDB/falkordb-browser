'use client'

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import { ForceGraphMethods } from "react-force-graph-2d";
import { Label, Graph, GraphData, Link, Node, Relationship, GraphInfo } from "../api/graph/model";
import Tutorial from "./Tutorial";
import { GraphContext, HistoryQueryContext, IndicatorContext, QuerySettingsContext } from "../components/provider";
import Spinning from "../components/ui/spinning";

const Selector = dynamic(() => import("./Selector"), {
    ssr: false,
    loading: () => <div className="z-20 absolute top-5 inset-x-24 h-[50px] flex flex-row gap-4 items-center">
        <div className="w-[230px] h-full animate-pulse rounded-md border border-gray-300 bg-background" />
        <div className="w-1 grow h-full animate-pulse rounded-md border border-gray-300 bg-background" />
        <div className="w-[120px] h-full animate-pulse rounded-md border border-gray-300 bg-background" />
    </div>
})
const GraphView = dynamic(() => import("./GraphView"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex justify-center items-center">
        <Spinning />
    </div>
})

export default function Page() {
    const { historyQuery, setHistoryQuery } = useContext(HistoryQueryContext)
    const { setIndicator } = useContext(IndicatorContext);
    const {
        graph,
        setGraph,
        graphInfo,
        setGraphInfo,
        graphName,
        setGraphName,
        graphNames,
        setGraphNames,
        runQuery,
        fetchCount,
        isLoading,
        handleCooldown,
        cooldownTicks,
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

    const [isQueryLoading, setIsQueryLoading] = useState(true)
    const [selectedElement, setSelectedElement] = useState<Node | Link | undefined>()
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([])
    const [labels, setLabels] = useState<Label[]>([])
    const [data, setData] = useState<GraphData>({ ...graph.Elements })
    const [relationships, setRelationships] = useState<Relationship[]>([])

    const fetchInfo = useCallback(async (type: string) => {
        if (!graphName) return []

        const result = await securedFetch(`/api/graph/${graphName}/info?type=${type}`, {
            method: "GET",
        }, toast, setIndicator);

        if (!result.ok) return []

        const json = await result.json();

        return json.result.data.map(({ info }: { info: string }) => info);
    }, [graphName, setIndicator, toast]);

    useEffect(() => {
        if (!graphName) return

        Promise.all([
            fetchInfo("(label)"),
            fetchInfo("(relationship type)"),
            fetchInfo("(property key)"),
        ]).then(async ([newLabels, newRelationships, newPropertyKeys]) => {
            const colorsArr = JSON.parse(localStorage.getItem(graphName) || "[]")
            const gi = GraphInfo.create(newPropertyKeys, newLabels, newRelationships, colorsArr)
            setGraphInfo(gi)
        }).catch((error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to fetch graph info",
                variant: "destructive",
            })
        });
    }, [fetchInfo, setGraphInfo, toast, setIndicator, graphName])

    useEffect(() => {
        setRelationships([...graph.Relationships])
        setLabels([...graph.Labels])
    }, [graph, graph.Labels.length, graph.Relationships.length, graph.Labels, graph.Relationships])

    useEffect(() => {
        if (!graphInfo) return

        if (contentPersistence) {
            const content = localStorage.getItem("savedContent")

            if (content) {
                const { graphName: name, query } = JSON.parse(content)

                if (!graph.Id && !graphName && graphNames.includes(name) && contentPersistence) {
                    setGraphName(name)
                    runQuery(query, name)
                    return
                }
            }
        }

        if (graphName && graphName !== graph.Id) {
            if (runDefaultQuery) {
                runQuery(defaultQuery)
                return
            }

            setGraph(Graph.empty(graphName))
        }

        setIsQueryLoading(false)
    }, [fetchCount, graph.Id, graphName, setGraph, runDefaultQuery, defaultQuery, contentPersistence, setGraphName, graphNames, graphInfo])

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
                selectedElements={selectedElements}
                setSelectedElement={setSelectedElement}
                handleDeleteElement={handleDeleteElement}
                chartRef={chartRef}
                setGraph={setGraph}
                fetchCount={fetchCount}
                isQueryLoading={isQueryLoading}
            />
            <div className="h-1 grow p-12">
                <GraphView
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                    selectedElements={selectedElements}
                    setSelectedElements={setSelectedElements}
                    chartRef={chartRef}
                    data={data}
                    setData={setData}
                    handleDeleteElement={handleDeleteElement}
                    setLabels={setLabels}
                    setRelationships={setRelationships}
                    labels={labels}
                    relationships={relationships}
                    isLoading={isLoading}
                    handleCooldown={handleCooldown}
                    cooldownTicks={cooldownTicks}
                    fetchCount={fetchCount}
                    historyQuery={historyQuery}
                    setHistoryQuery={setHistoryQuery}
                />
            </div>
            <Tutorial />
            <div className="h-4 w-full Gradient" />
        </div >
    )
}