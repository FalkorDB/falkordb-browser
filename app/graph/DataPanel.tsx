/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable react/require-default-props */

'use client'

import { prepareArg, securedFetch, GraphRef } from "@/lib/utils";
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Pencil, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import Button from "../components/ui/Button";
import { Label, Link, Node } from "../api/graph/model";
import { IndicatorContext, GraphContext } from "../components/provider";
import DataTable from "./DataTable";
import AddLabel from "./addLabel";
import RemoveLabel from "./RemoveLabel";

interface Props {
    object: Node | Link;
    onClose: () => void;
    setLabels: Dispatch<SetStateAction<Label[]>>;
    canvasRef: GraphRef;
}

export default function DataPanel({ object, onClose, setLabels, canvasRef }: Props) {
    const { setIndicator } = useContext(IndicatorContext)
    const { graph, setGraphInfo } = useContext(GraphContext)

    const lastObjId = useRef<number | undefined>(undefined)
    const labelsListRef = useRef<HTMLUListElement>(null)

    const { toast } = useToast()
    const { data: session } = useSession()

    const [labelsHover, setLabelsHover] = useState(false)
    const [label, setLabel] = useState<string[]>([]);
    const type = !("source" in object)

    const handleClose = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose()
        }
    }, [onClose])

    useEffect(() => {
        window.addEventListener("keydown", handleClose)

        return () => {
            window.removeEventListener("keydown", handleClose)
        }
    }, [handleClose])

    useEffect(() => {
        if (lastObjId.current !== object.id) {
            setLabelsHover(false)
        }
        setLabel(type ? [...(object as Node).labels.filter((c) => c !== "")] : [object.relationship]);
        lastObjId.current = object.id
    }, [object, type]);

    const handleAddLabel = async (newLabel: string) => {
        const node = object as Node
        if (newLabel === "") {
            toast({
                title: "Error",
                description: "Please fill the label",
                variant: "destructive"
            })
            return false
        }
        if (label.includes(newLabel)) {
            toast({
                title: "Error",
                description: "Label already exists",
                variant: "destructive"
            })
            return false
        }
        const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${node.id}/label`, {
            method: "POST",
            body: JSON.stringify({
                label: newLabel
            })
        }, toast, setIndicator)

        if (result.ok) {
            setLabels([...graph.addLabel(newLabel, node)])
            setLabel([...node.labels])
            const newGraphInfo = graph.GraphInfo.clone()
            setGraphInfo(newGraphInfo)
            graph.GraphInfo = newGraphInfo

            const canvas = canvasRef.current
            if (canvas) {
                const currentData = canvas.getGraphData()
                currentData.nodes.forEach(canvasNode => {
                    const appNode = graph.NodesMap.get(canvasNode.id)
                    if (appNode) {
                        canvasNode.labels.push(newLabel)
                    }
                })
                canvas.setGraphData({ ...currentData })
            }

            return true
        }

        return false
    }

    const handleRemoveLabel = async (removeLabel: string) => {
        const node = object as Node

        if (removeLabel === "") {
            toast({
                title: "Error",
                description: "You cannot remove the default label",
                variant: "destructive"
            })
            return false
        }

        const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${node.id}/label`, {
            method: "DELETE",
            body: JSON.stringify({
                label: removeLabel
            })
        }, toast, setIndicator)

        if (result.ok) {
            graph.removeLabel(removeLabel, node)
            setLabels([...graph.Labels])
            setLabel([...node.labels])
            const newGraphInfo = graph.GraphInfo.clone()
            setGraphInfo(newGraphInfo)
            graph.GraphInfo = newGraphInfo

            const canvas = canvasRef.current
            if (canvas) {
                const currentData = canvas.getGraphData()
                currentData.nodes.forEach(canvasNode => {
                    const appNode = graph.NodesMap.get(canvasNode.id)
                    if (appNode) {
                        canvasNode.labels.splice(
                            canvasNode.labels.findIndex((l) => l === removeLabel),
                            1
                        );
                    }
                })
                canvas.setGraphData({ ...currentData })
            }

            return true
        }

        return false
    }

    return (
        <div data-testid="DataPanel" className="DataPanel p-4">
            <div className="relative flex flex-col gap-6 pb-4 border-b border-border">
                <div className="flex flex-row justify-between">
                    <div className="flex flex-col gap-2 font-medium text-xl text-nowrap">
                        <p>ID: <span className="Gradient text-transparent bg-clip-text">{object.id}</span></p>
                        <p data-testid="DataPanelAttributesCount">Attributes: <span className="Gradient text-transparent bg-clip-text">{Object.keys(object.data).length}</span></p>
                    </div>
                    <Button
                        className="h-fit"
                        data-testid="DataPanelClose"
                        title="Close"
                        onClick={() => onClose()}
                    >
                        <X />
                    </Button>
                </div>
                <ul
                    ref={labelsListRef}
                    data-testid="DataPanelLabel"
                    className="flex flex-wrap gap-4"
                    onMouseEnter={() => setLabelsHover(true)}
                    onMouseLeave={() => setLabelsHover(false)}
                >
                    {label.map((l) => (
                        <li
                            data-testid={`DataPanelLabel${l}`}
                            key={l}
                            className="flex gap-2 px-2 py-1 bg-secondary rounded-full items-center"
                        >
                            <p>{l || "No Label"}</p>
                            {
                                type && l && session?.user.role !== "Read-Only" &&
                                <RemoveLabel
                                    onRemoveLabel={handleRemoveLabel}
                                    selectedLabel={l}
                                    trigger={
                                        <Button
                                            data-testid={`DataPanelRemoveLabel${l}`}
                                            title="Remove Label"
                                            tooltipVariant="Delete"
                                        >
                                            <X size={15} />
                                        </Button>
                                    }
                                />
                            }
                        </li>
                    ))}
                    <li className="h-8 w-[106px] flex justify-center items-center" key="addLabel">
                        {
                            type && (labelsHover || label.length === 0) && session?.user.role !== "Read-Only" &&
                            <AddLabel
                                onAddLabel={handleAddLabel}
                                trigger={
                                    <Button
                                        data-testid="DataPanelAddLabel"
                                        className="p-2 text-nowrap text-xs justify-center border border-border rounded-full"
                                        label="Add Label"
                                        title=""
                                    >
                                        <Pencil size={15} />
                                    </Button>
                                }
                            />
                        }
                    </li>
                </ul>
            </div>
            <DataTable
                className="h-1 grow w-full"
                lastObjId={lastObjId}
                object={object}
                type={type}
                canvasRef={canvasRef}
            />
        </div >
    )
}