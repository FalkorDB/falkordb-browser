/* eslint-disable no-param-reassign */

'use client'

import { useEffect, useState, useContext, Dispatch, SetStateAction } from "react"
import { GraphRef, prepareArg, securedFetch } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import SchemaDataPanel from "./SchemaDataPanel"
import Labels from "../graph/labels"
import { Label, Link, Node, GraphData, Relationship } from "../api/graph/model"
import CreateElement from "./SchemaCreateElement"
import { IndicatorContext, SchemaContext } from "../components/provider"
import Controls from "../graph/controls"
import GraphDetails from "../graph/GraphDetails"
import ForceGraph from "../components/ForceGraph"

interface Props {
    fetchCount?: (graphName: string) => Promise<void>
    edgesCount?: number | null
    nodesCount?: number | null
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
    handleCooldown: (ticks?: 0, isSetLoading?: boolean) => void
    data: GraphData
    setData: Dispatch<SetStateAction<GraphData>>
    handleDeleteElement: () => Promise<void>
    setLabels: Dispatch<SetStateAction<Label[]>>
    setRelationships: Dispatch<SetStateAction<Relationship[]>>
    labels: Label[]
    relationships: Relationship[]
    isLoading: boolean
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
    setRelationships,
    labels,
    relationships,
    isLoading
}: Props) {
    const { setIndicator } = useContext(IndicatorContext)
    const { schema, schemaName } = useContext(SchemaContext)

    const { toast } = useToast()

    const [selectedNodes, setSelectedNodes] = useState<[Node | undefined, Node | undefined]>([undefined, undefined]);
    const [parentWidth, setParentWidth] = useState(0)
    const [parentHeight, setParentHeight] = useState(0)
    const elementsLength = schema.getElements().length

    useEffect(() => {
        if (!elementsLength) return;

        setData({ ...schema.Elements })
    }, [schema, elementsLength, setData])

    useEffect(() => {
        setRelationships([...schema.Relationships])
        setLabels([...schema.Labels])
    }, [schema.Id, schema.Relationships.length, schema.Labels.length, setRelationships, schema.Relationships, schema.Labels, setLabels])

    useEffect(() => {
        setSelectedElement(undefined)
        setSelectedElements([])
    }, [schema.Id])

    useEffect(() => {
        setSelectedNodes([undefined, undefined])
    }, [isAddRelation])

    const onLabelClick = (label: Label) => {
        label.show = !label.show

        schema.Elements.nodes.forEach((node) => {
            if (node.labels[0] !== label.name) return
            node.visible = label.show
        })

        schema.visibleLinks(label.show)
        schema.LabelsMap.set(label.name, label)
        setData({ ...schema.Elements })
    }

    const onRelationshipClick = (label: Relationship) => {
        label.show = !label.show

        schema.Elements.links.forEach((link) => {
            if (link.relationship !== label.name) return
            link.visible = label.show
        })

        schema.RelationshipsMap.set(label.name, label)
        setData({ ...schema.Elements })
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
                const { labels: ls } = schema.extendNode(json.result.data[0].n, false, true)!
                setLabels(prev => [...prev, ...ls.filter(c => !prev.some(p => p.name === c)).map(c => schema.LabelsMap.get(c)!)])
                setIsAddEntity(false)
            } else {
                const { relationship } = schema.extendEdge(json.result.data[0].e, false, true)!
                setRelationships(prev => [...prev, schema.RelationshipsMap.get(relationship)!])
                setIsAddRelation(false)
            }

            if (fetchCount) fetchCount(schema.Id)

            setSelectedElement(undefined)
        }

        setData({ ...schema.Elements })

        handleCooldown()

        return result.ok
    }

    return (
        <div className="relative w-full h-full border rounded-lg overflow-hidden">
            <div className="pointer-events-none absolute bottom-4 inset-x-12 z-20 flex items-center justify-between">
                <GraphDetails
                    graph={schema}
                    graphName={schemaName}
                    nodesCount={nodesCount}
                    edgesCount={edgesCount}
                />
                {
                    schema.getElements().length > 0 && !isLoading &&
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
                    isLoading={isLoading}
                    handleCooldown={handleCooldown}
                    cooldownTicks={cooldownTicks}
                    setRelationships={setRelationships}
                    parentHeight={parentHeight}
                    parentWidth={parentWidth}
                    setParentHeight={setParentHeight}
                    setParentWidth={setParentWidth}
                />
                {
                    !isLoading &&
                    <div className="h-full z-10 absolute top-12 inset-x-12 pointer-events-none flex gap-8 justify-between">
                        {
                            (labels.length > 0) &&
                            <Labels type="Schema" className="left-2" label="Labels" labels={labels} onClick={onLabelClick} />
                        }
                        {
                            (relationships.length > 0) &&
                            <Labels type="Schema" className="right-2 text-end" label="Relationships" labels={relationships} onClick={onRelationshipClick} />
                        }
                    </div>
                }
                {
                    selectedElement ?
                        <SchemaDataPanel
                            object={selectedElement}
                            setObject={setSelectedElement}
                            onDeleteElement={handleDeleteElement}
                            schema={schema}
                            setLabels={setLabels}
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

SchemaView.defaultProps = {
    fetchCount: undefined,
    edgesCount: undefined,
    nodesCount: undefined
}