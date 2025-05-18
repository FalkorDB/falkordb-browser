/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable react/require-default-props */

'use client'

import { prepareArg, securedFetch } from "@/lib/utils";
import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Button from "../components/ui/Button";
import { Category, Link, Node } from "../api/graph/model";
import Input from "../components/ui/Input";
import { IndicatorContext, GraphContext } from "../components/provider";
import GraphDataTable from "./GraphDataTable";
import PaginationList from "../components/PaginationList";

interface Props {
    object: Node | Link;
    setObject: Dispatch<SetStateAction<Node | Link | undefined>>;
    onDeleteElement: () => Promise<void>;
    setCategories: Dispatch<SetStateAction<Category<Node>[]>>;
}

export default function GraphDataPanel({ object, setObject, onDeleteElement, setCategories }: Props) {

    const [selectedLabel, setSelectedLabel] = useState<string>("")
    const [label, setLabel] = useState<string[]>([]);
    const [labelsHover, setLabelsHover] = useState(false)
    const [labelsEditable, setLabelsEditable] = useState(false)
    const [newLabel, setNewLabel] = useState("")
    const type = !("source" in object)
    const [isLabelLoading, setIsLabelLoading] = useState(false)
    const { toast } = useToast()
    const { data: session } = useSession()
    const { indicator, setIndicator } = useContext(IndicatorContext)
    const { graph } = useContext(GraphContext)
    const lastObjId = useRef<number | undefined>(undefined)
    const labelsListRef = useRef<HTMLUListElement>(null)

    useEffect(() => {
        if (lastObjId.current !== object.id) {
            setLabelsEditable(false)
            setLabelsHover(false)
        }
        setLabel(type ? [...object.category.filter((c) => c !== "")] : [object.label]);
        lastObjId.current = object.id
    }, [object, type]);

    const handleAddLabel = async () => {
        const node = object as Node
        if (newLabel === "") {
            toast({
                title: "Error",
                description: "Please fill the label",
                variant: "destructive"
            })
            return
        }
        if (label.includes(newLabel)) {
            toast({
                title: "Error",
                description: "Label already exists",
                variant: "destructive"
            })
            return
        }
        try {
            setIsLabelLoading(true)
            const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${node.id}/label`, {
                method: "POST",
                body: JSON.stringify({
                    label: newLabel
                })
            }, toast, setIndicator)

            if (result.ok) {
                graph.addCategory(newLabel, node)
                setCategories([...graph.Categories])
                setLabel([...node.category])
                setNewLabel("")
                setLabelsEditable(false)
            }
        } finally {
            setIsLabelLoading(false)
        }
    }

    const handleRemoveLabel = async (removeLabel: string) => {
        const node = object as Node

        const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${node.id}/label`, {
            method: "DELETE",
            body: JSON.stringify({
                label: removeLabel
            })
        }, toast, setIndicator)

        if (result.ok) {
            graph.removeCategory(removeLabel, node)
            setCategories([...graph.Categories])
            setLabel([...node.category])
        }
    }

    return false ? (
        <div data-testid="DataPanel" className="DataPanel">
            <div className="relative flex justify-between items-center p-6">
                <Button
                    data-testid="DataPanelClose"
                    className="absolute top-2 right-2"
                    title="Close"
                    onClick={() => setObject(undefined)}
                >
                    <X size={15} />
                </Button>
                <ul
                    ref={labelsListRef}
                    data-testid="DataPanelLabel"
                    className="flex flex-wrap gap-4 min-w-[10%]"
                    onMouseEnter={() => setLabelsHover(true)}
                    onMouseLeave={() => setLabelsHover(false)}
                >
                    {label.map((l) => (
                        <li
                            data-testid={`DataPanelLabel${l}`}
                            key={l}
                            className="flex gap-2 px-2 py-1 bg-background rounded-full items-center"
                        >
                            <p>{l}</p>
                            {
                                session?.user?.role !== "Read-Only" &&
                                <Button
                                    data-testid={`DataPanelRemoveLabel${l}`}
                                    title="Remove"
                                    onClick={() => handleRemoveLabel(l)}
                                    indicator={indicator}
                                >
                                    <X size={15} />
                                </Button>
                            }
                        </li>
                    ))}
                    <li className="h-8 flex flex-wrap gap-2">
                        {
                            type && (labelsHover || label.length === 0) && !labelsEditable && session?.user?.role !== "Read-Only" &&
                            <Button
                                data-testid="DataPanelAddLabel"
                                className="p-2 text-xs justify-center border border-background"
                                variant="Secondary"
                                label="Add"
                                title="Add a new label"
                                onClick={() => setLabelsEditable(true)}
                            >
                                <Pencil size={15} />
                            </Button>
                        }
                        {
                            labelsEditable &&
                            <>
                                <Input
                                    data-testid="DataPanelAddLabelInput"
                                    ref={ref => ref?.focus()}
                                    className="max-w-[50%] h-full bg-background border-none text-white"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    onKeyDown={(e) => {

                                        if (e.key === "Escape") {
                                            e.preventDefault()
                                            setLabelsEditable(false)
                                            setNewLabel("")
                                        }

                                        if (e.key !== "Enter" || isLabelLoading) return

                                        e.preventDefault()
                                        handleAddLabel()
                                    }}
                                />
                                <Button
                                    data-testid="DataPanelAddLabelConfirm"
                                    className="p-2 text-xs justify-center border border-background"
                                    variant="Secondary"
                                    label="Save"
                                    title="Save the new label"
                                    onClick={() => handleAddLabel()}
                                    isLoading={isLabelLoading}
                                    indicator={indicator}
                                >
                                    <Check size={15} />
                                </Button>
                                {
                                    !isLabelLoading &&
                                    <Button
                                        data-testid="DataPanelAddLabelCancel"
                                        className="p-2 text-xs justify-center border border-background"
                                        variant="Secondary"
                                        label="Cancel"
                                        title="Discard new label"
                                        onClick={() => {
                                            setLabelsEditable(false)
                                            setNewLabel("")
                                        }}
                                    >
                                        <X size={15} />
                                    </Button>
                                }
                            </>
                        }
                    </li>
                </ul>
                <p data-testid="DataPanelAttributesCount" className="font-medium text-xl text-nowrap">{Object.keys(object.data).length}&ensp;Attributes</p>
            </div>
            <GraphDataTable
                lastObjId={lastObjId}
                graph={graph}
                object={object}
                type={type}
                onDeleteElement={onDeleteElement}
            />
        </div >
    ) : (
        <Dialog open>
            <DialogContent className="flex flex-col bg-foreground w-[80%] h-[90%] rounded-lg border-none gap-8 p-8" disableClose>
                <Button
                    className="absolute top-2 right-2"

                    onClick={() => setObject(undefined)}
                >
                    <X size={15} />
                </Button>
                <DialogHeader className="flex-row justify-between items-center border-b pb-4">
                    <DialogTitle>Graph ID: {object.id}</DialogTitle>
                    <p data-testid="DataPanelAttributesCount" className="font-medium text-xl text-nowrap">{Object.keys(object.data).length}&ensp;Attributes</p>
                </DialogHeader>
                <div className="h-1 grow flex gap-8">
                    <PaginationList
                        className="w-[40%] bg-background rounded-lg"
                        list={label}
                        step={12}
                        dataTestId="attributes"
                        onClick={(l) => setSelectedLabel(l)}
                        isSelected={(item) => item === selectedLabel}
                        afterSearchCallback={() => { }}
                    />
                    <div className="w-[60%] bg-background rounded-lg flex flex-col gap-4">
                        <GraphDataTable
                            graph={graph}
                            object={object}
                            type={type}
                            onDeleteElement={onDeleteElement}
                            lastObjId={lastObjId}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}