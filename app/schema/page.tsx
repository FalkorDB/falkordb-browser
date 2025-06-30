'use client'

import { useContext, useState, useRef, useCallback, useEffect } from "react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import { ForceGraphMethods } from "react-force-graph-2d";
import SchemaView from "./SchemaView";
import { Category, Graph, GraphData, Link, Node } from "../api/graph/model";
import { IndicatorContext, SchemaContext, SchemaNameContext, SchemaNamesContext } from "../components/provider";

const Selector = dynamic(() => import("../graph/Selector"), { ssr: false })

export default function Page() {

    const { schemaNames, setSchemaNames } = useContext(SchemaNamesContext)
    const { schemaName, setSchemaName } = useContext(SchemaNameContext)
    const { setIndicator } = useContext(IndicatorContext)
    const { schema, setSchema } = useContext(SchemaContext)

    const { toast } = useToast()

    const [selectedElement, setSelectedElement] = useState<Node | Link | undefined>()
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([])
    const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0)
    const [categories, setCategories] = useState<Category<Node>[]>([])
    const [data, setData] = useState<GraphData>(schema.Elements)
    const [labels, setLabels] = useState<Category<Link>[]>([])
    const [isAddRelation, setIsAddRelation] = useState(false)
    const chartRef = useRef<ForceGraphMethods<Node, Link>>()
    const [edgesCount, setEdgesCount] = useState<number>(0)
    const [nodesCount, setNodesCount] = useState<number>(0)
    const [isAddEntity, setIsAddEntity] = useState(false)

    const fetchCount = useCallback(async () => {
        const result = await securedFetch(`api/schema/${prepareArg(schemaName)}/count`, {
            method: "GET"
        }, toast, setIndicator)

        if (!result.ok) return

        let json = await result.json()

        while (typeof json.result === "number") {
            // eslint-disable-next-line no-await-in-loop
            const res = await securedFetch(`api/graph/${prepareArg(schemaName)}/query/?id=${prepareArg(json.result.toString())}`, {
                method: "GET"
            }, toast, setIndicator)

            if (!res.ok) return

            // eslint-disable-next-line no-await-in-loop
            json = await res.json()
        }

        [json] = json.result.data

        setEdgesCount(json.edges)
        setNodesCount(json.nodes)
    }, [toast, setIndicator, schemaName])

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

    const fetchSchema = useCallback(async () => {
        const result = await securedFetch(`/api/schema/${prepareArg(schemaName)}`, {
            method: "GET"
        }, toast, setIndicator)
        if (!result.ok) return
        const json = await result.json()
        const colors = localStorage.getItem(schemaName)?.split(/[[\]",]/).filter(c => c)
        const schemaGraph = Graph.create(schemaName, json.result, false, true, 0, colors)
        setSchema(schemaGraph)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.schema = schemaGraph

        fetchCount()

        handleCooldown()
    }, [fetchCount, setIndicator, setSchema, toast, schemaName])

    useEffect(() => {
        if (!schemaName) return
        if (schema.Id === schemaName) {
            fetchCount()
        } else {
            fetchSchema()
        }
    }, [schemaName, fetchSchema, schema.Id, fetchCount])

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

        setLabels(schema.removeLinks(selectedElements.map((element) => element.id)))

        if (fetchCount) fetchCount()

        handleCooldown()
        setSelectedElement(undefined)
        setSelectedElements([])
        setData({ ...schema.Elements })
    }

    return (
        <div className="Page">
            <Selector
                graph={schema}
                options={schemaNames}
                setOptions={setSchemaNames}
                graphName={schemaName}
                setGraphName={setSchemaName}
                fetchCount={fetchCount}
                selectedElements={selectedElements}
                setSelectedElement={setSelectedElement}
                handleDeleteElement={handleDeleteElement}
                chartRef={chartRef}
                setIsAddEntity={setIsAddEntity}
                setIsAddRelation={setIsAddRelation}
                setGraph={setSchema}
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
                    handleCooldown={handleCooldown}
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