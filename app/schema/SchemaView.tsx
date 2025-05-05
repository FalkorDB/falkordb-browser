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
import { IndicatorContext, GraphContext } from "../components/provider"
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
    setCooldownTicks: Dispatch<SetStateAction<number | undefined>>
    data: GraphData
    setData: Dispatch<SetStateAction<GraphData>>
    handleDeleteElement: () => Promise<void>
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
    setCooldownTicks,
    data,
    setData,
    handleDeleteElement
}: Props) {
    const [selectedNodes, setSelectedNodes] = useState<[Node | undefined, Node | undefined]>([undefined, undefined]);

    const { toast } = useToast()
    const { setIndicator } = useContext(IndicatorContext)
    const { graph: schema } = useContext(GraphContext)

    useEffect(() => {
        setData({ ...schema.Elements })
    }, [schema.Elements, schema.Id])

    useEffect(() => {
        setSelectedElement(undefined)
        setSelectedElements([])
    }, [schema.Id])

    useEffect(() => {
        setSelectedNodes([undefined, undefined])
    }, [isAddRelation])

    const handleCooldown = (ticks?: number) => {
        setCooldownTicks(ticks)
    }

    const onCategoryClick = (category: Category) => {
        category.show = !category.show
        schema.Elements.nodes.forEach((node) => {
            if (node.category[0] !== category.name) return
            node.visible = category.show
        })

        schema.visibleLinks(category.show)

        setData({ ...schema.Elements })
    }

    const onLabelClick = (label: Category) => {
        label.show = !label.show
        schema.Elements.links.forEach((link) => {
            if (link.label !== label.name) return
            link.visible = label.show
        })

        setData({ ...schema.Elements })
    }

    const onCreateElement = async (attributes: [string, string[]][], label?: string[]) => {
        const fakeId = "-1"
        const result = await securedFetch(`api/schema/${prepareArg(schema.Id)}/${prepareArg(fakeId)}`, {
            method: "POST",
            body: JSON.stringify({ type: isAddEntity, label, attributes, selectedNodes })
        }, toast, setIndicator)

        if (result.ok) {
            const json = await result.json()

            if (isAddEntity) {
                schema.extendNode(json.result.data[0].n, false, true)
                setIsAddEntity(false)
            } else {
                schema.extendEdge(json.result.data[0].e, false, true)
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
                        disabled={!schema.Id}
                        chartRef={chartRef}
                        handleCooldown={handleCooldown}
                        cooldownTicks={cooldownTicks}
                    />
                }
            </div>
            <div className="relative h-full w-full rounded-lg overflow-hidden">
                <ForceGraph
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
                />
                {
                    (schema.Categories.length > 0 || schema.Labels.length > 0) &&
                    <>
                        <Labels className="left-2" label="Categories" categories={schema.Categories} onClick={onCategoryClick} />
                        <Labels className="right-2 text-end" label="RelationshipTypes" categories={schema.Labels} onClick={onLabelClick} />
                    </>
                }
                {
                    selectedElement ?
                        <SchemaDataPanel
                            obj={selectedElement}
                            setObj={setSelectedElement}
                            onDeleteElement={handleDeleteElement}
                            schema={schema}
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