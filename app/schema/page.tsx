'use client'

import { useCallback, useEffect, useContext, useState, useRef } from "react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import { ForceGraphMethods } from "react-force-graph-2d";
import SchemaView from "./SchemaView";
import { Category, Graph, GraphData, Link, Node } from "../api/graph/model";
import { GraphContext, GraphNameContext, IndicatorContext } from "../components/provider";

const Selector = dynamic(() => import("../graph/Selector"), { ssr: false })

export default function Page() {

    const [selectedElement, setSelectedElement] = useState<Node | Link | undefined>()
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([])
    const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0)
    const [isAddRelation, setIsAddRelation] = useState(false)
    const chartRef = useRef<ForceGraphMethods<Node, Link>>()
    const [isAddEntity, setIsAddEntity] = useState(false)
    const [edgesCount, setEdgesCount] = useState<number>(0)
    const [nodesCount, setNodesCount] = useState<number>(0)
    const [labels, setLabels] = useState<Category[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    const { graph: schema, setGraph: setSchema } = useContext(GraphContext)
    const { indicator, setIndicator } = useContext(IndicatorContext)
    const { graphName: schemaName } = useContext(GraphNameContext)
    const [data, setData] = useState<GraphData>(schema.Elements)
    const { toast } = useToast()
    
    const fetchCount = useCallback(async () => {
        const result = await securedFetch(`api/schema/${prepareArg(schemaName)}/count`, {
            method: "GET"
        }, toast, setIndicator)

        if (!result) return

        const json = await result.json()

        setEdgesCount(json.result.edges)
        setNodesCount(json.result.nodes)
    }, [schemaName, toast, setIndicator])

    useEffect(() => {
        if (!schemaName || indicator === "offline") return
        const run = async () => {
            const result = await securedFetch(`/api/schema/${prepareArg(schemaName)}`, {
                method: "GET"
            }, toast, setIndicator)
            if (!result.ok) return
            const json = await result.json()
            const colors = localStorage.getItem(schemaName)?.split(/[[\]",]/).filter(c => c)
            const schemaGraph = Graph.create(schemaName, json.result, false, true, colors)
            setSchema(schemaGraph)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.schema = schemaGraph

            fetchCount()

        }
        run()
    }, [fetchCount, schemaName, toast, setIndicator, indicator])


    const handleDeleteElement = async () => {
        const stateSelectedElements = Object.values(selectedElements)

        if (stateSelectedElements.length === 0 && selectedElement) {
            stateSelectedElements.push(selectedElement)
            setSelectedElement(undefined)
        }

        await Promise.all(stateSelectedElements.map(async (element) => {
            const { id } = element
            const type = !("source" in element)
            const result = await securedFetch(`api/schema/${prepareArg(schema.Id)}/${prepareArg(id.toString())}`, {
                method: "DELETE",
                body: JSON.stringify({ type }),
            }, toast, setIndicator)

            if (!result.ok) return

            if (type) {
                schema.Elements.nodes.splice(schema.Elements.nodes.findIndex(node => node.id === element.id), 1)
                schema.NodesMap.delete(id)
            } else {
                schema.Elements.links.splice(schema.Elements.links.findIndex(link => link.id === element.id), 1)
                schema.EdgesMap.delete(id)
            }

            if (type) {
                element.category.forEach((category) => {
                    const cat = schema.CategoriesMap.get(category)

                    if (cat) {
                        cat.elements = cat.elements.filter(n => n.id !== id)

                        if (cat.elements.length === 0) {
                            schema.Categories.splice(schema.Categories.findIndex(c => c.name === cat.name), 1)
                            schema.CategoriesMap.delete(cat.name)
                        }
                    }
                })
            } else {
                const cat = schema.LabelsMap.get(element.label)

                if (cat) {
                    cat.elements = cat.elements.filter(n => n.id !== id)

                    if (cat.elements.length === 0) {
                        schema.Labels.splice(schema.Labels.findIndex(c => c.name === cat.name), 1)
                        schema.LabelsMap.delete(cat.name)
                    }
                }
            }
        }))

        schema.removeLinks(setLabels, selectedElements.map((element) => element.id))

        if (fetchCount) fetchCount()

        setSelectedElement(undefined)
        setSelectedElements([])
        setData({ ...schema.Elements })
    }

    return (
        <div className="Page">
            <Selector
                fetchCount={fetchCount}
                selectedElements={selectedElements}
                setSelectedElement={setSelectedElement}
                handleDeleteElement={handleDeleteElement}
                chartRef={chartRef}
                setIsAddEntity={setIsAddEntity}
                setIsAddRelation={setIsAddRelation}
            />
            <div className="h-1 grow p-12">
                <SchemaView
                    fetchCount={fetchCount}
                    edgesCount={edgesCount}
                    nodesCount={nodesCount}
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                    selectedElements={selectedElements}
                    setSelectedElements={setSelectedElements}
                    isAddRelation={isAddRelation}
                    setIsAddRelation={setIsAddRelation}
                    isAddEntity={isAddEntity}
                    setIsAddEntity={setIsAddEntity}
                    chartRef={chartRef}
                    cooldownTicks={cooldownTicks}
                    setCooldownTicks={setCooldownTicks}
                    data={data}
                    setData={setData}
                    handleDeleteElement={handleDeleteElement}
                    setLabels={setLabels}
                    setCategories={setCategories}
                    labels={labels}
                    categories={categories}
                />
            </div>
            <div className="h-4 w-full Gradient" />
        </div>
    )
}