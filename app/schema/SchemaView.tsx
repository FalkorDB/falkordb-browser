/* eslint-disable no-param-reassign */

'use client'

import { useEffect, useContext, Dispatch, SetStateAction } from "react"
import { GraphRef } from "@/lib/utils"
import type { GraphData as CanvasData } from "@falkordb/canvas"
import dynamic from "next/dynamic"
import Labels from "../graph/labels"
import { Label, Link, Node, GraphData, Relationship } from "../api/graph/model"
import { SchemaContext } from "../components/provider"
import Controls from "../graph/controls"
import GraphDetails from "../graph/GraphDetails"
import Spinning from "../components/ui/spinning"

const ForceGraph = dynamic(() => import("../components/ForceGraph"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex justify-center items-center"><Spinning /></div>
});

interface Props {
    edgesCount: number | undefined
    nodesCount: number | undefined
    selectedElements: (Node | Link)[]
    setSelectedElements: (elements?: (Node | Link)[]) => void
    canvasRef: GraphRef
    cooldownTicks: number | undefined
    handleCooldown: (ticks?: 0, isSetLoading?: boolean) => void
    data: GraphData
    setData: Dispatch<SetStateAction<GraphData>>
    graphData: CanvasData | undefined
    setGraphData: Dispatch<SetStateAction<CanvasData | undefined>>
    setLabels: Dispatch<SetStateAction<Label[]>>
    setRelationships: Dispatch<SetStateAction<Relationship[]>>
    labels: Label[]
    relationships: Relationship[]
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
}

export default function SchemaView({
    edgesCount,
    nodesCount,
    selectedElements,
    setSelectedElements,
    canvasRef,
    cooldownTicks,
    handleCooldown,
    data,
    setData,
    graphData,
    setGraphData,
    setLabels,
    setRelationships,
    labels,
    relationships,
    isLoading,
    setIsLoading
}: Props) {
    const { schema, schemaName } = useContext(SchemaContext)

    useEffect(() => {
        setRelationships([...schema.Relationships])
        setLabels([...schema.Labels])
    }, [schema.Id, schema.Relationships.length, schema.Labels.length, setRelationships, schema.Relationships, schema.Labels, setLabels])

    useEffect(() => {
        setSelectedElements([])
    }, [schema.Id, setSelectedElements])

    const onLabelClick = (label: Label) => {
        label.show = !label.show

        schema.Elements.nodes.forEach((node) => {
            if (!label.show && node.labels.some(c => schema.LabelsMap.get(c)?.show !== label.show)) return
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

    return (
        <div className="relative w-full h-full border border-border rounded-lg overflow-hidden">
            <div className="h-full w-full flex flex-col gap-4 absolute py-4 px-6 pointer-events-none z-10 justify-between">
                <div className="h-1 grow flex flex-col gap-6">
                    {
                        !isLoading && (labels.length > 0 || relationships.length > 0) &&
                        <div className="w-fit flex flex-col h-full gap-4">
                            {labels.length > 0 && <Labels labels={labels} onClick={onLabelClick} label="Labels" type="Schema" />}
                            {relationships.length > 0 && labels.length > 0 && <div className="h-px bg-border rounded-full" />}
                            {relationships.length > 0 && <Labels labels={relationships} onClick={onRelationshipClick} label="Relationships" type="Schema" />}
                        </div>
                    }
                </div>
                <div className="flex gap-6">
                    <GraphDetails
                        graph={schema}
                        graphName={schemaName}
                        edgesCount={edgesCount}
                        nodesCount={nodesCount}
                    />
                    {
                        schema.getElements().length > 0 && !isLoading &&
                        <>
                            <div className="h-full w-px bg-border rounded-full" />
                            <Controls
                                graph={schema}
                                canvasRef={canvasRef}
                                disabled={schema.getElements().length === 0}
                                handleCooldown={handleCooldown}
                                cooldownTicks={cooldownTicks}
                            />
                        </>
                    }
                </div>
            </div>
            <div className="relative h-full w-full rounded-lg overflow-hidden">
                <ForceGraph
                    graph={schema}
                    canvasRef={canvasRef}
                    data={data}
                    setData={setData}
                    graphData={graphData}
                    setGraphData={setGraphData}
                    selectedElements={selectedElements}
                    setSelectedElements={setSelectedElements}
                    type="schema"
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    handleCooldown={handleCooldown}
                    cooldownTicks={cooldownTicks}
                    setRelationships={setRelationships}
                />
            </div>
        </div>
    )
}