/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable react/require-default-props */

'use client'

import { prepareArg, securedFetch } from "@/lib/utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Check, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
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
    onAddLabel: (label: string) => Promise<boolean>;
    onRemoveLabel: (label: string) => Promise<boolean>;
}

export default function GraphDataPanel({ obj, setObj, onExpand, onDeleteElement, graph, onAddLabel, onRemoveLabel }: Props) {

    const [attributes, setAttributes] = useState<string[]>([]);
    const [editable, setEditable] = useState<string>("");
    const [hover, setHover] = useState<string>("");
    const [isAddValue, setIsAddValue] = useState<boolean>(false);
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [newKey, setNewKey] = useState<string>("");
    const [newVal, setNewVal] = useState<string>("");
    const [label, setLabel] = useState<string[]>([]);
    const [labelsHover, setLabelsHover] = useState(false)
    const [labelsEditable, setLabelsEditable] = useState(false)
    const [newLabel, setNewLabel] = useState("")
    const type = !("source" in obj)
    const { toast } = useToast()
    const { data: session } = useSession()

    useEffect(() => {
        if (!obj) {
            setLabelsEditable(false)
            setLabelsHover(false)
        }
    }, [obj])

    const handleSetEditable = (key: string, val: string) => {
        if (key !== "") {
            setIsAddValue(false)
        }

        setEditable(key)
        setNewVal(val)
    }

    useEffect(() => {
        setAttributes(Object.keys(obj.data).filter((key) => (key !== "name" || obj.data.name !== obj.id)));
        setLabel(type ? [...obj.category] : [obj.label]);
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
        }, session?.user?.role, toast)).ok

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

            graph.Data = graph.Data.map(row => {
                const newRow = Object.entries(row).map(([k, cell]) => {
                    if (cell && typeof cell === "object" && cell.id === id) {
                        return [k, { ...cell, properties: { ...cell.properties, [key]: val } }]
                    }
                    return [k, cell]
                })
                return Object.fromEntries(newRow)
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
        }, session?.user?.role, toast)).ok

        if (success) {
            const value = obj.data[key]

            graph.getElements().forEach((e) => {
                if (e.id !== id) return
                delete e.data[key]
            })

            const newObj = { ...obj }

            delete newObj.data[key]
            setObj(newObj)

            graph.Data = graph.Data.map(row => {
                const newRow = Object.entries(row).map(([k, cell]) => {
                    if (cell && typeof cell === "object" && cell.id === id) {
                        delete cell.properties[key]
                        return [k, cell]
                    }
                    return [k, cell]
                })
                return Object.fromEntries(newRow)
            })

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

    const handleAddLabel = async () => {
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
        const ok = await onAddLabel(newLabel)
        if (ok) {
            setLabel(prev => [...prev, newLabel])
            setNewLabel("")
            setLabelsEditable(false)
        }
    }

    const handleRemoveLabel = async (removeLabel: string) => {
        const ok = await onRemoveLabel(removeLabel)
        if (ok) {
            setLabel(prev => prev.filter(l => l !== removeLabel))
        }
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
                    {
                        type ?
                            <ul className="flex flex-wrap gap-4 min-w-[10dvw]" onMouseEnter={() => setLabelsHover(true)} onMouseLeave={() => setLabelsHover(false)}>
                                {label.map((l) => (
                                    <li key={l} className="flex gap-2 px-2 py-1 bg-foreground rounded-full items-center">
                                        <p>{l}</p>
                                        <Button
                                            title="Remove"
                                            onClick={() => handleRemoveLabel(l)}
                                        >
                                            <X size={15} />
                                        </Button>
                                    </li>
                                ))}
                                <li className="h-8 flex flex-wrap gap-2">
                                    {
                                        labelsHover && !labelsEditable &&
                                        <Button
                                            className="p-2 text-xs justify-center border border-foreground"
                                            variant="Secondary"
                                            label="Edit"
                                            onClick={() => setLabelsEditable(true)}
                                        >
                                            <Pencil size={15} />
                                        </Button>
                                    }
                                    {
                                        labelsEditable &&
                                        <>
                                            <Input
                                                ref={ref => ref?.focus()}
                                                className="max-w-[50%] h-full bg-foreground border-none text-white"
                                                value={newLabel}
                                                onChange={(e) => setNewLabel(e.target.value)}
                                                onKeyDown={(e) => {

                                                    if (e.key === "Escape") {
                                                        e.preventDefault()
                                                        setLabelsEditable(false)
                                                        setNewLabel("")
                                                    }

                                                    if (e.key !== "Enter") return

                                                    e.preventDefault()
                                                    handleAddLabel()
                                                }}
                                            />
                                            <Button
                                                className="p-2 text-xs justify-center border border-foreground"
                                                variant="Secondary"
                                                label="Save"
                                                onClick={() => handleAddLabel()}
                                            >
                                                <Check size={15} />
                                            </Button>
                                            <Button
                                                className="p-2 text-xs justify-center border border-foreground"
                                                variant="Secondary"
                                                label="Cancel"
                                                onClick={() => {
                                                    setLabelsEditable(false)
                                                    setNewLabel("")
                                                }}
                                            >
                                                <Check size={15} />
                                            </Button>
                                        </>
                                    }
                                </li>
                            </ul>
                            :
                            <p className="bg-foreground rounded-full px-2 py-1">{label[0]}</p>
                    }
                </div>
                <p className="font-medium text-xl text-nowrap">{attributes.length}&ensp;Attributes</p>
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
                    <TableRow>
                        <TableCell />
                        <TableCell>id:</TableCell>
                        <TableCell>{obj.id}</TableCell>
                    </TableRow>
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
                                            editable === key && session?.user?.role !== "Read-Only" ?
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
                                                                title="Delete Attribute"
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
                                        editable === key && session?.user?.role !== "Read-Only" ?
                                            <Input
                                                className="w-full"
                                                value={newVal}
                                                onChange={(e) => setNewVal(e.target.value)}
                                                onKeyDown={handleSetKeyDown}
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
                        isAddValue && session?.user?.role !== "Read-Only" &&
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
                                    ref={ref => !newKey ? ref?.focus() : undefined}
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
                            disabled={session?.user?.role === "Read-Only"}
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