/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable react/require-default-props */

'use client'

import { prepareArg, securedFetch } from "@/lib/utils";
import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { Pencil, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Button from "../components/ui/Button";
import { Category, Link, Node } from "../api/graph/model";
import { IndicatorContext, GraphContext } from "../components/provider";
import GraphDataTable from "./GraphDataTable";
import PaginationList from "../components/PaginationList";
import AddLabel from "./addLabel";
import RemoveLabel from "./RemoveLabel";

interface Props {
    object: Node | Link;
    setObject: Dispatch<SetStateAction<Node | Link | undefined>>;
    onDeleteElement: () => Promise<void>;
    setCategories: Dispatch<SetStateAction<Category<Node>[]>>;
}

export default function GraphDataPanel({ object, setObject, onDeleteElement, setCategories }: Props) {
    const { setIndicator } = useContext(IndicatorContext)
    const { graph } = useContext(GraphContext)

    const lastObjId = useRef<number | undefined>(undefined)
    const labelsListRef = useRef<HTMLUListElement>(null)

    const { toast } = useToast()
    const { data: session } = useSession()

    const [selectedLabel, setSelectedLabel] = useState<string>("")
    const [showAsDialog, setShowAsDialog] = useState(false)
    const [labelsHover, setLabelsHover] = useState(false)
    const [label, setLabel] = useState<string[]>([]);
    const type = !("source" in object)

    useEffect(() => {
        if (labelsListRef.current) {
            setShowAsDialog(labelsListRef.current.clientHeight > 80)
        }
    }, [labelsListRef.current?.clientHeight])

    useEffect(() => {
        if (lastObjId.current !== object.id) {
            setLabelsHover(false)
        }
        setLabel(type ? [...object.category.filter((c) => c !== "")] : [object.label]);
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
            setCategories([...graph.addCategory(newLabel, node)])
            setLabel([...node.category])
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
            graph.removeCategory(removeLabel, node)
            setCategories([...graph.Categories])
            setLabel([...node.category])
            setShowAsDialog(false)
            return true
        }

        return false

    }

    return showAsDialog ? (
        <Dialog open>
            <DialogContent className="flex flex-col bg-foreground w-[90%] h-[90%] rounded-lg border-none gap-8 p-8" disableClose>
                <DialogHeader className="flex-row justify-between items-center border-b pb-4">
                    <div className="flex flex-col gap-2 font-medium text-xl text-nowrap">
                        <DialogTitle>ID: <span className="Gradient text-transparent bg-clip-text">{object.id}</span></DialogTitle>
                        <p data-testid="DataPanelAttributesCount">Attributes: <span className="Gradient text-transparent bg-clip-text">{Object.keys(object.data).length}</span></p>
                    </div>
                    <Button
                        onClick={() => setObject(undefined)}
                    >
                        <X />
                    </Button>
                </DialogHeader>
                <div className="h-1 grow flex gap-8">
                    <div className="w-[40%] bg-background rounded-lg flex flex-col">
                        <PaginationList
                            className="h-1 grow"
                            label="Label"
                            list={label}
                            step={12}
                            dataTestId="attributes"
                            onClick={(l) => selectedLabel === l ? setSelectedLabel("") : setSelectedLabel(l)}
                            isSelected={(item) => item === selectedLabel}
                            afterSearchCallback={(filteredList) => {
                                if (!filteredList.includes(selectedLabel)) {
                                    setSelectedLabel("")
                                }
                            }}
                        />
                        <div className="flex gap-4 p-4 justify-between">
                            <AddLabel onAddLabel={handleAddLabel} />
                            <RemoveLabel onRemoveLabel={handleRemoveLabel} selectedLabel={selectedLabel} />
                        </div>
                    </div>
                    <GraphDataTable
                        className="h-full w-[60%]"
                        graph={graph}
                        object={object}
                        type={type}
                        onDeleteElement={onDeleteElement}
                        lastObjId={lastObjId}
                    />
                </div>
            </DialogContent>
        </Dialog>
    ) : (
        <div data-testid="DataPanel" className="DataPanel p-6">
            <div className="relative flex flex-col gap-6 pb-4 border-b">
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
                            className="flex gap-2 px-2 py-1 bg-background rounded-full items-center"
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
                                        className="p-2 text-nowrap text-xs justify-center border border-background rounded-full"
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
                graph={graph}
                object={object}
                type={type}
                onDeleteElement={onDeleteElement}
            />
        </div >
    )
}