/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable react/require-default-props */

'use client'

import { prepareArg, securedFetch } from "@/lib/utils";
import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import Button from "../components/ui/Button";
import { Link, Node } from "../api/graph/model";
import Input from "../components/ui/Input";
import DialogComponent from "../components/DialogComponent";
import CloseDialog from "../components/CloseDialog";
import DeleteElement from "./DeleteElement";
import ToastButton from "../components/ToastButton";
import { IndicatorContext, GraphContext } from "../components/provider";

interface Props {
    obj: Node | Link;
    setObj: Dispatch<SetStateAction<Node | Link | undefined>>;
    onDeleteElement: () => Promise<void>;
}

export default function GraphDataPanel({ obj, setObj, onDeleteElement }: Props) {

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
    const [isLabelLoading, setIsLabelLoading] = useState(false)
    const [isAddLoading, setIsAddLoading] = useState(false)
    const [isSetLoading, setIsSetLoading] = useState(false)
    const [isRemoveLoading, setIsRemoveLoading] = useState(false)
    const { toast } = useToast()
    const { data: session } = useSession()
    const { indicator, setIndicator } = useContext(IndicatorContext)
    const { graph } = useContext(GraphContext)
    const lastObjId = useRef<number | undefined>(undefined)

    const handleSetEditable = (key: string, val: string) => {
        if (key !== "") {
            setIsAddValue(false)
        }

        setEditable(key)
        setNewVal(val)
    }

    useEffect(() => {
        if (lastObjId.current !== obj.id) {
            setEditable("")
            setNewVal("")
            setNewKey("")
            setLabelsEditable(false)
            setLabelsHover(false)
            setIsAddValue(false)
        }
        setAttributes(Object.keys(obj.data).filter((key) => (key !== "name" || obj.data.name !== obj.id)));
        setLabel(type ? [...obj.category.filter((c) => c !== "")] : [obj.label]);
        lastObjId.current = obj.id
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
        try {
            if (actionType === "set") setIsSetLoading(true)
            const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${id}/${key}`, {
                method: "POST",
                body: JSON.stringify({
                    value: val,
                    type
                })
            }, toast, setIndicator)

            if (result.ok) {

                graph.setProperty(key, val, id)

                const value = obj.data[key]
                setObj({ ...obj, data: { ...obj.data, [key]: val } })

                handleSetEditable("", "")
                toast({
                    title: "Success",
                    description: `Attribute ${actionType}`,
                    variant: "default",
                    action: isUndo ? <ToastButton onClick={() => setProperty(key, value, false)} /> : undefined
                })
            }

            return result.ok
        } finally {
            if (actionType === "set") setIsSetLoading(false)
        }
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
        try {
            setIsAddLoading(true)
            const success = await setProperty(key, value, false, "added")
            if (!success) return
            setIsAddValue(false)
            setNewKey("")
            setNewVal("")
        } finally {
            setIsAddLoading(false)
        }
    }

    const removeProperty = async (key: string) => {
        try {
            setIsRemoveLoading(true)
            const { id } = obj
            const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/${id}/${key}`, {
                method: "DELETE",
                body: JSON.stringify({ type }),
            }, toast, setIndicator)).ok

            if (success) {
                const value = obj.data[key]

                graph.removeProperty(key, id)
                delete obj.data[key]
                setObj({ ...obj })

                toast({
                    title: "Success",
                    description: "Attribute removed",
                    action: <ToastButton onClick={() => handleAddValue(key, value)} />,
                    variant: "default"
                })
            }

            return success
        } finally {
            setIsRemoveLoading(false)
        }
    }

    const handleAddKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setIsAddValue(false)
            setNewKey("")
            setNewVal("")
            return
        }

        if (e.key !== "Enter" || isAddLoading || indicator === "offline") return

        handleAddValue(newKey, newVal)
    }

    const handleSetKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            handleSetEditable("", "")
            setNewKey("")
        }

        if (e.key !== "Enter" || isSetLoading || indicator === "offline") return

        setProperty(editable, newVal, true)
    }

    const handleAddLabel = async () => {
        const node = obj as Node
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
                graph.createCategory([newLabel], node)
                graph.addLabel(newLabel, node)
                setObj({ ...node, category: [...node.category, newLabel] })
                setNewLabel("")
                setLabelsEditable(false)
            }
        } finally {
            setIsLabelLoading(false)
        }
    }

    const handleRemoveLabel = async (removeLabel: string) => {
        const node = obj as Node
        const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${node.id}/label`, {
            method: "DELETE",
            body: JSON.stringify({
                label: removeLabel
            })
        }, toast, setIndicator)

        if (result.ok) {
            const category = graph.CategoriesMap.get(removeLabel)

            if (category) {
                category.elements = category.elements.filter((element) => element.id !== node.id)
                if (category.elements.length === 0) {
                    graph.Categories.splice(graph.Categories.findIndex(c => c.name === category.name), 1)
                    graph.CategoriesMap.delete(category.name)
                }
            }

            graph.removeLabel(removeLabel, node)
            setObj({ ...node, category: node.category.filter((c) => c !== removeLabel) })
        }
    }

    const handleDeleteElement = async () => {
        await onDeleteElement()
        setDeleteOpen(false)
    }

    return (
        <div className="DataPanel" id="graphDataPanel">
            <div className="relative flex justify-between items-center p-6" id="dataPanelHeader">
                <Button
                    className="absolute top-2 right-2"
                    title="Close"
                    onClick={() => setObj(undefined)}
                >
                    <X size={15} />
                </Button>
                <div className="flex gap-4 items-center">
                    <ul className="flex flex-wrap gap-4 min-w-[10%]" onMouseEnter={() => setLabelsHover(true)} onMouseLeave={() => setLabelsHover(false)}>
                        {label.map((l) => (
                            <li key={l} className="flex gap-2 px-2 py-1 bg-background rounded-full items-center">
                                <p>{l}</p>
                                {
                                    session?.user?.role !== "Read-Only" &&
                                    <Button
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
                                type && labelsHover && !labelsEditable && session?.user?.role !== "Read-Only" &&
                                    <Button
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
                                            session?.user?.role !== "Read-Only" && (
                                                editable === key ?
                                                    <>
                                                        <Button
                                                            indicator={indicator}
                                                            variant="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setProperty(key, newVal, true)
                                                            }}
                                                            isLoading={isSetLoading}
                                                        >
                                                            <Check size={20} />
                                                        </Button>
                                                        {
                                                            !isSetLoading &&
                                                            <Button variant="button" onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleSetEditable("", "")
                                                            }}>
                                                                <X size={20} />
                                                            </Button>
                                                        }
                                                    </>
                                                    : hover === key &&
                                                    <>
                                                        <Button
                                                            variant="button"
                                                            onClick={() => handleSetEditable(key, obj.data[key])}
                                                            disabled={isAddValue}
                                                        >
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
                                                                    isLoading={isRemoveLoading}
                                                                />
                                                                <CloseDialog
                                                                    label="Cancel"
                                                                    variant="Cancel"
                                                                />
                                                            </div>
                                                        </DialogComponent>
                                                    </>
                                            )
                                        }
                                    </div>
                                </TableCell>
                                <TableCell>{key}:</TableCell>
                                <TableCell>
                                    {
                                        editable === key ?
                                            <Input
                                                className="w-full"
                                                value={newVal}
                                                onChange={(e) => setNewVal(e.target.value)}
                                                onKeyDown={handleSetKeyDown}
                                            />
                                            : <Button
                                                label={obj.data[key]}
                                                title="Click to edit the attribute value"
                                                variant="button"
                                                onClick={() => handleSetEditable(key, obj.data[key])}
                                            />
                                    }
                                </TableCell>
                            </TableRow>
                        ))
                    }
                    {
                        isAddValue &&
                        <TableRow>
                            <TableCell className="flex flex-col items-center gap-2">
                                <Button
                                    variant="button"
                                    title="Save"
                                    onClick={() => handleAddValue(newKey, newVal)}
                                    isLoading={isAddLoading}
                                    indicator={indicator}
                                >
                                    <Check size={20} />
                                </Button>
                                {
                                    !isAddLoading &&
                                    <Button
                                        variant="button"
                                        onClick={() => setIsAddValue(false)}
                                        title="Cancel"
                                    >
                                        <X size={20} />
                                    </Button>
                                }
                            </TableCell >
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
                        </TableRow >
                    }
                </TableBody >
                <TableCaption>
                    {
                        session?.user?.role !== "Read-Only" &&
                        <Button
                            disabled={attributes.some((key) => key === editable)}
                            variant="Primary"
                            label="Add Attribute"
                            title="Add a new attribute"
                            onClick={() => setIsAddValue(true)}
                        >
                            <Plus size={20} />
                        </Button>
                    }
                </TableCaption>
            </Table >
            <div className="flex justify-end p-4">
                {
                    session?.user?.role !== "Read-Only" &&
                    <DeleteElement
                        description={`Are you sure you want to delete this ${type ? "Node" : "Relation"}?`}
                        open={deleteOpen}
                        setOpen={setDeleteOpen}
                        onDeleteElement={handleDeleteElement}
                        trigger={
                            <Button
                                variant="Primary"
                                label={`Delete ${type ? "Node" : "Relation"}`}
                                title={`Delete the selected ${type ? "Node" : "Relation"}`}
                            >
                                <Trash2 size={20} />
                            </Button>
                        }
                    />
                }
            </div>
        </div >
    )
}