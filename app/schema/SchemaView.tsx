/* eslint-disable no-param-reassign */

'use client'

import { useEffect, useState, useContext, Dispatch, SetStateAction } from "react"
import { GraphRef, prepareArg, securedFetch } from "@/lib/utils"
import dynamic from "next/dynamic"
import { useToast } from "@/components/ui/use-toast"
import SchemaDataPanel from "./SchemaDataPanel"
import Labels from "../graph/labels"
import { Category, Link, Node, GraphData } from "../api/graph/model"
import CreateElement from "./SchemaCreateElement"
import { IndicatorContext, SchemaContext } from "../components/provider"
import Controls from "../graph/controls"

const ForceGraph = dynamic(() => import("../components/ForceGraph"), { ssr: false })

/* eslint-disable react/require-default-props */
interface Props {
    fetchCount?: () => void
    edgesCount: number
    nodesCount: number
    selectedElement: Node | Link | undefined
    setSelectedElement: Dispatch<SetStateAction<Node | Link | undefined>>
    selectedElements: (Node | Link)[]
    setSelectedElements: Dispatch<SetStateAction<(Node | Link)[]>>
    isAddRelation: boolean
    setIsAddRelation: Dispatch<SetStateAction<boolean>>
    isAddEntity: boolean
    setIsAddEntity: Dispatch<SetStateAction<boolean>>
    chartRef: GraphRef
    cooldownTicks: number | undefined
    handleCooldown: () => void
    data: GraphData
    setData: Dispatch<SetStateAction<GraphData>>
    handleDeleteElement: () => Promise<void>
    setLabels: Dispatch<SetStateAction<Category[]>>
    setCategories: Dispatch<SetStateAction<Category[]>>
    labels: Category[]
    categories: Category[]
}

export default function SchemaView({
    fetchCount,
    edgesCount,
    nodesCount,
    selectedElement,
    setSelectedElement,
    selectedElements,
    setSelectedElements,
    isAddRelation,
    setIsAddRelation,
    isAddEntity,
    setIsAddEntity,
    chartRef,
    cooldownTicks,
    handleCooldown,
    data,
    setData,
    handleDeleteElement,
    setLabels,
    setCategories,
    labels,
    categories
}: Props) {
    const { setIndicator } = useContext(IndicatorContext)
    const { schema } = useContext(SchemaContext)
    
    const { toast } = useToast()
    
    const [selectedNodes, setSelectedNodes] = useState<[Node | undefined, Node | undefined]>([undefined, undefined]);

    useEffect(() => {
        setData({ ...schema.Elements })
    }, [schema.Elements, schema.Id])

    useEffect(() => {
        setCategories([...schema.Categories])
        setLabels([...schema.Labels])
    }, [schema.Id, schema.Categories.length, schema.Labels.length])

    useEffect(() => {
        setSelectedElement(undefined)
        setSelectedElements([])
    }, [schema.Id])

    useEffect(() => {
        setSelectedNodes([undefined, undefined])
    }, [isAddRelation])

    const onCategoryClick = (category: Category) => {
        category.show = !category.show
        schema.Elements.nodes.forEach((node) => {
            if (node.category[0] !== category.name) return
            node.visible = category.show
        })

        schema.visibleLinks(category.show)

        setData({ ...schema.Elements })
        setCategories([...schema.Categories])
    }

    const onLabelClick = (label: Category) => {
        label.show = !label.show
        schema.Elements.links.forEach((link) => {
            if (link.label !== label.name) return
            link.visible = label.show
        })

        setData({ ...schema.Elements })
        setLabels([...schema.Labels])
    }

    const onCreateElement = async (attributes: [string, string[]][], elementLabel?: string[]) => {
        const fakeId = "-1"
        const result = await securedFetch(`api/schema/${prepareArg(schema.Id)}/${prepareArg(fakeId)}`, {
            method: "POST",
            body: JSON.stringify({ type: isAddEntity, label: elementLabel, attributes, selectedNodes })
        }, toast, setIndicator)

        if (result.ok) {
            const json = await result.json()

            if (isAddEntity) {
                const { category } = schema.extendNode(json.result.data[0].n, false, true)!
                setCategories(prev => [...prev, ...category.map(c => schema.CategoriesMap.get(c)!)])
                setIsAddEntity(false)
            } else {
                const { label } = schema.extendEdge(json.result.data[0].e, false, true)!
                setLabels(prev => [...prev, schema.LabelsMap.get(label)!])
                setIsAddRelation(false)
            }

            if (fetchCount) fetchCount()

            setSelectedElement(undefined)
        }

        setData({ ...schema.Elements })

        return result.ok
    }

    return (
        <div className="relative w-full h-full border rounded-lg overflow-hidden">
            <div className="pointer-events-none absolute bottom-4 inset-x-12 z-10 flex items-center justify-between">
                <div className="flex gap-2">
                    {
                        schema.Id &&
                        <>
                            <p className="Gradient bg-clip-text text-transparent">Nodes: {nodesCount}</p>
                            <p className="Gradient bg-clip-text text-transparent">Edges: {edgesCount}</p>
                        </>
                    }
                </div>
                {
                    schema.getElements().length > 0 &&
                    <Controls
                        graph={schema}
                        disabled={!schema.Id}
                        chartRef={chartRef}
                        handleCooldown={handleCooldown}
                        cooldownTicks={cooldownTicks}
                    />
                }
            </div>
            <div className="relative h-full w-full rounded-lg overflow-hidden">
                <ForceGraph
                    graph={schema}
                    chartRef={chartRef}
                    data={data}
                    setData={setData}
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                    selectedElements={selectedElements}
                    setSelectedElements={setSelectedElements}
                    type="schema"
                    isAddElement={isAddRelation}
                    setSelectedNodes={setSelectedNodes}
                    cooldownTicks={cooldownTicks}
                    handleCooldown={handleCooldown}
                    setLabels={setLabels}
                />
                {
                    (categories.length > 0 || labels.length > 0) &&
                    <>
                        <Labels graph={schema} type="Schema" className="left-2" label="Labels" categories={categories} onClick={onCategoryClick} />
                        <Labels graph={schema} type="Schema" className="right-2 text-end" label="RelationshipTypes" categories={labels} onClick={onLabelClick} />
                    </>
                }
                {
                    selectedElement ?
                        <SchemaDataPanel
                            object={selectedElement}
                            setObject={setSelectedElement}
                            onDeleteElement={handleDeleteElement}
                            schema={schema}
                            setCategories={setCategories}
                        />
                        : (isAddRelation || isAddEntity) &&
                        <CreateElement
                            onCreate={onCreateElement}
                            setIsAdd={isAddRelation ? setIsAddRelation : setIsAddEntity}
                            selectedNodes={selectedNodes}
                            setSelectedNodes={setSelectedNodes}
                            type={isAddEntity}
                        />
                }
            </div>
        </div>
    )
}