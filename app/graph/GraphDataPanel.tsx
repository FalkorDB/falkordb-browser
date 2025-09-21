/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable react/require-default-props */

'use client'

import { prepareArg, securedFetch } from "@/lib/utils";
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Pencil, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import Button from "../components/ui/Button";
import { Label, Link, Node } from "../api/graph/model";
import { IndicatorContext, GraphContext } from "../components/provider";
import GraphDataTable from "./GraphDataTable";
import AddLabel from "./addLabel";
import RemoveLabel from "./RemoveLabel";

interface Props {
    object: Node | Link;
    setObject: (el: Node | Link | undefined) => void;
    onDeleteElement: () => Promise<void>;
    setLabels: Dispatch<SetStateAction<Label[]>>;
}

export default function GraphDataPanel({ object, setObject, onDeleteElement, setLabels }: Props) {
    const { setIndicator } = useContext(IndicatorContext)
    const { graph, setGraphInfo } = useContext(GraphContext)

    const lastObjId = useRef<number | undefined>(undefined)
    const labelsListRef = useRef<HTMLUListElement>(null)

    const { toast } = useToast()
    const { data: session } = useSession()

    const [labelsHover, setLabelsHover] = useState(false)
    const [label, setLabel] = useState<string[]>([]);
    const type = !("source" in object)

    const onClose = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setObject(undefined)
        }
    }, [setObject])

    useEffect(() => {
        window.addEventListener("keydown", onClose)

        return () => {
            window.removeEventListener("keydown", onClose)
        }
    }, [onClose])

    useEffect(() => {
        if (lastObjId.current !== object.id) {
            setLabelsHover(false)
        }
        setLabel(type ? [...object.labels.filter((c) => c !== "")] : [object.relationship]);
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
            return true
        }

        return false

    }

    return (
        <div data-testid="DataPanel" className="DataPanel p-6">
            <div className="relative flex flex-col gap-6 pb-4 border-b border-border">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-col gap-2 font-medium text-xl text-nowrap">
                        <p>ID: <span className="Gradient text-transparent bg-clip-text">{object.id}</span></p>
                        <p data-testid="DataPanelAttributesCount">Attributes: <span className="Gradient text-transparent bg-clip-text">{Object.keys(object.data).length}</span></p>
                    </div>
                    <Button
                        data-testid="DataPanelClose"
                        title="Close"
                        onClick={() => setObject(undefined)}
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
                                type && l && session?.user?.role !== "Read-Only" &&
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
                            type && (labelsHover || label.length === 0) && session?.user?.role !== "Read-Only" &&
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
            <GraphDataTable
                className="h-1 grow w-full"
                lastObjId={lastObjId}
                object={object}
                type={type}
                onDeleteElement={onDeleteElement}
            />
        </div >
    )
}