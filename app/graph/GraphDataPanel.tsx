/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable react/require-default-props */

'use client'

import { prepareArg, securedFetch } from "@/lib/utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Check, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { Session } from "next-auth";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import Button from "../components/ui/Button";
import { Graph, Link, Node } from "../api/graph/model";
import Input from "../components/ui/Input";
import DialogComponent from "../components/DialogComponent";
import CloseDialog from "../components/CloseDialog";
import DeleteElement from "./DeleteElement";
import ToastButton from "../components/ToastButton";

interface Props {
    obj: Node | Link;
    setObj: Dispatch<SetStateAction<Node | Link | undefined>>;
    onExpand: () => void;
    graph: Graph;
    onDeleteElement: () => Promise<void>;
    data: Session | null;
}

export default function GraphDataPanel({ obj, setObj, onExpand, onDeleteElement, graph, data }: Props) {

    const [attributes, setAttributes] = useState<string[]>([]);
    const [editable, setEditable] = useState<string>("");
    const [hover, setHover] = useState<string>("");
    const [isAddValue, setIsAddValue] = useState<boolean>(false);
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [newKey, setNewKey] = useState<string>("");
    const [newVal, setNewVal] = useState<string>("");
    const [label, setLabel] = useState([""]);
    const type = !("source" in obj)
    const { toast } = useToast()

    const handleSetEditable = (key: string, val: string) => {
        if (key !== "") {
            setIsAddValue(false)
        }

        setEditable(key)
        setNewVal(val)
    }

    useEffect(() => {
        setAttributes(Object.keys(obj.data).filter((key) => (key !== "name" || obj.data.name !== obj.id)));
        setLabel(type ? obj.category : [obj.label]);
    }, [obj, type]);

    const setProperty = async (key: string, val: string, isUndo: boolean, actionType: ("added" | "set") = "set") => {
        const { id } = obj
        if (!val || val === "") {
            toast({
                title: "Error",
                description: "Please fill in the value field",
                variant: "destructive"
            })
            return false
        }
        const q = `MATCH ${type ? "(e)" : "()-[e]-()"} WHERE id(e) = ${id} SET e.${key} = '${val}'`
        const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)}`, {
            method: "GET"
        }, toast)).ok

        if (success) {
            graph.getElements().forEach(e => {
                if (e.id !== id) return
                e.data[key] = val
            })
            const value = obj.data[key]
            setObj((prev) => {
                if (!prev) return prev
                if ("source" in prev) {
                    return {
                        ...prev,
                        data: {
                            ...prev.data,
                            [key]: val
                        }
                    } as Link
                }
                return {
                    ...prev,
                    data: {
                        ...prev.data,
                        [key]: val
                    }
                } as Node
            })
            handleSetEditable("", "")
            toast({
                title: "Success",
                description: `Attribute ${actionType}`,
                variant: "default",
                action: isUndo ? <ToastButton onClick={() => setProperty(key, value, false)} /> : undefined
            })
        }

        return success
    }

    const handleAddValue = async (key: string, value: string) => {
        if (!key || key === "" || !value || value === "") {
            toast({
                title: "Error",
                description: "Please fill in both fields",
                variant: "destructive"
            })
            return
        }

        const success = await setProperty(key, value, false, "added")
        if (!success) return
        setIsAddValue(false)
        setNewKey("")
        setNewVal("")
    }

    const removeProperty = async (key: string) => {
        const { id } = obj
        const q = `MATCH ${type ? "(e)" : "()-[e]-()"} WHERE id(e) = ${id} SET e.${key} = NULL`
        const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)}`, {
            method: "GET"
        }, toast)).ok

        if (success) {
            graph.getElements().forEach((e) => {
                if (e.id !== id) return
                delete e.data[key]
            })

            const value = obj.data[key]
            const newObj = { ...obj }
            delete newObj.data[key]
            setObj(newObj)

            toast({
                title: "Success",
                description: "Attribute removed",
                action: <ToastButton onClick={() => handleAddValue(key, value)} />,
                variant: "default"
            })
        }

        return success
    }

    const handleAddKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setIsAddValue(false)
            setNewKey("")
            setNewVal("")
            return
        }

        if (e.key !== "Enter") return

        handleAddValue(newKey, newVal)
    }

    const handleSetKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            handleSetEditable("", "")
            setNewKey("")
        }

        if (e.key !== "Enter") return

        setProperty(editable, newVal, true)
    }

    return (
        <div className="h-full flex flex-col gap-4 border-foreground border-[3px] rounded-lg">
            <div className="flex justify-between items-center p-4">
                <div className="flex gap-4 items-center">
                    <Button
                        variant="button"
                        title="Close"
                        onClick={() => onExpand()}
                    >
                        <ChevronRight size={25} />
                    </Button>
                    <p className="font-medium text-xl">{label}</p>
                </div>
                <p className="font-medium text-xl"><span className="text-primary">{attributes.length}</span> Attributes</p>
            </div>
            <Table parentClassName="grow">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-1" />
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        attributes.map((key) => (
                            <TableRow
                                onMouseEnter={() => setHover(key)}
                                onMouseLeave={() => setHover("")}
                                key={key}
                            >
                                <TableCell>
                                    <div className="h-10 w-6 flex flex-col items-center gap-2 justify-center">
                                        {
                                            editable === key && data?.user.role !== "Read-Only" ?
                                                <>
                                                    <Button variant="button" onClick={(e) => {
                                                        e.stopPropagation()
                                                        setProperty(key, newVal, true)
                                                    }}>
                                                        <Check size={20} />
                                                    </Button>
                                                    <Button variant="button" onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleSetEditable("", "")
                                                    }}>
                                                        <X size={20} />
                                                    </Button>
                                                </>
                                                : hover === key &&
                                                <>
                                                    <Button variant="button" onClick={() => handleSetEditable(key, obj.data[key])}>
                                                        <Pencil size={20} />
                                                    </Button>
                                                    <DialogComponent
                                                        trigger={
                                                            <Button
                                                                variant="button"
                                                            >
                                                                <Trash2 size={20} />
                                                            </Button>
                                                        }
                                                        title="Delete Attribute"
                                                        description="Are you sure you want to delete this attribute?"
                                                    >
                                                        <div className="flex justify-end gap-4">
                                                            <Button
                                                                variant="Primary"
                                                                label="Delete"
                                                                onClick={() => removeProperty(key)}
                                                            />
                                                            <CloseDialog
                                                                label="Cancel"
                                                                variant="Cancel"
                                                            />
                                                        </div>
                                                    </DialogComponent>
                                                </>
                                        }
                                    </div>
                                </TableCell>
                                <TableCell>{key}:</TableCell>
                                <TableCell>
                                    {
                                        editable === key && data?.user.role !== "Read-Only" ?
                                            <Input
                                                className="w-full"
                                                value={newVal}
                                                onChange={(e) => setNewVal(e.target.value)}
                                                onKeyDown={handleSetKeyDown}
                                                onBlur={() => handleSetEditable("", "")}
                                            />
                                            : <Button
                                                label={obj.data[key]}
                                                variant="button"
                                                onClick={() => handleSetEditable(key, obj.data[key])}
                                            />
                                    }
                                </TableCell>
                            </TableRow>
                        ))
                    }
                    {
                        isAddValue && data?.user.role !== "Read-Only" &&
                        <TableRow>
                            <TableCell className="flex flex-col items-center gap-2">
                                <Button
                                    variant="button"
                                    onClick={() => handleAddValue(newKey, newVal)}
                                >
                                    <Check size={20} />
                                </Button>
                                <Button variant="button" onClick={() => setIsAddValue(false)}>
                                    <X size={20} />
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Input
                                    className="w-full"
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                    onKeyDown={handleAddKeyDown}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    className="w-full"
                                    value={newVal}
                                    onChange={(e) => setNewVal(e.target.value)}
                                    onKeyDown={handleAddKeyDown}
                                />
                            </TableCell>
                        </TableRow>
                    }
                </TableBody>
                <TableCaption>
                    <Button
                        variant="Primary"
                        label="Add Attribute"
                        onClick={() => setIsAddValue(true)}
                    >
                        <Plus size={20} />
                    </Button>
                </TableCaption>
            </Table>
            <div className="flex justify-end p-4">
                <DeleteElement
                    description={`Are you sure you want to delete this ${type ? "Node" : "Relation"}?`}
                    open={deleteOpen}
                    setOpen={setDeleteOpen}
                    onDeleteElement={onDeleteElement}
                    trigger={
                        <Button
                            disabled={data?.user.role === "Read-Only"}
                            variant="Primary"
                            label={`Delete ${type ? "Node" : "Relation"}`}
                        >
                            <Trash2 size={20} />
                        </Button>
                    }
                />
            </div>
        </div>
    )
}