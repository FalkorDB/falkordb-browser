/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/no-array-index-key */

"use client";

import { Check, ChevronRight, Pencil, PlusCircle, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import Button from "../components/ui/Button";
import { ATTRIBUTES, getDefaultAttribute, OPTIONS } from "./SchemaCreateElement";
import Combobox from "../components/ui/combobox";
import { Link, Node } from "../api/graph/model";
import Input from "../components/ui/Input";
import ToastButton from "../components/ToastButton";
import DeleteElement from "../graph/DeleteElement";
import DialogComponent from "../components/DialogComponent";
import CloseDialog from "../components/CloseDialog";

interface Props {
    obj: Node | Link
    onExpand: () => void;
    onSetAttributes: (attribute: [string, string[]]) => Promise<boolean>;
    onRemoveAttribute: (key: string) => Promise<boolean>;
    onDeleteElement: () => Promise<void>;
    onAddLabel: (label: string) => Promise<boolean>;
    onRemoveLabel: (label: string) => Promise<boolean>;
}

export default function SchemaDataPanel({ obj, onExpand, onSetAttributes, onRemoveAttribute, onDeleteElement, onAddLabel, onRemoveLabel }: Props) {

    const [attribute, setAttribute] = useState<[string, string[]]>(getDefaultAttribute())
    const [attributes, setAttributes] = useState<[string, string[]][]>([])
    const [label, setLabel] = useState<string[]>([])
    const [editable, setEditable] = useState<string>("")
    const [hover, setHover] = useState<string>("")
    const [labelsHover, setLabelsHover] = useState<boolean>(false)
    const [labelsEditable, setLabelsEditable] = useState<boolean>(false)
    const [newLabel, setNewLabel] = useState<string>("")
    const [isAddValue, setIsAddValue] = useState<boolean>(false)
    const [isAddLoading, setIsAddLoading] = useState<boolean>(false)
    const [isRemoveLoading, setIsRemoveLoading] = useState<boolean>(false)
    const [isSetLoading, setIsSetLoading] = useState<boolean>(false)
    const [isLabelLoading, setIsLabelLoading] = useState<boolean>(false)
    const [isRemoveLabelLoading, setIsRemoveLabelLoading] = useState<boolean>(false)
    const [deleteOpen, setDeleteOpen] = useState<boolean>(false)
    const type = !!obj.category
    const { toast } = useToast()
    const { data: session } = useSession()

    useEffect(() => {
        setAttributes(Object.entries(obj.data).filter(([key, val]) => !(key === "name" && Number(val) === obj.id)).map(([key, val]) => [key, Array.isArray(val) ? val : (val as string).split(',')]))
        setLabel("source" in obj ? [obj.label] : [...obj.category])
    }, [obj])

    const handleSetEditable = ([key, val]: [string, string[]] = getDefaultAttribute()) => {
        if (key !== "") {
            setIsAddValue(false)
        }

        setAttribute([key, val])
        setEditable(key)
    }

    const handleSetAttribute = async (isUndo: boolean, att?: [string, string[]]) => {
        const newAttribute = att || attribute

        if (newAttribute[0] === "" || newAttribute[1].some(v => v === "")) {
            toast({
                title: "Error",
                description: "Please fill all the fields",
            })
            return
        }
        try {
            setIsSetLoading(true)
            const ok = await onSetAttributes(newAttribute)
            const oldAttribute = attributes.find(([key]) => key === newAttribute[0])

            if (ok) {
                setAttributes(prev => prev.map((attr) => attr[0] === newAttribute[0] ? newAttribute : attr))
                handleSetEditable()
                toast({
                    title: "Success",
                    description: `Property set`,
                    action: isUndo && oldAttribute ? <ToastButton onClick={() => handleSetAttribute(false, oldAttribute)} /> : undefined,
                })
            }
        } finally {
            setIsSetLoading(false)
        }
    }

    const handleRemoveAttribute = async (key: string) => {
        try {
            setIsRemoveLoading(true)
            const ok = await onRemoveAttribute(key)

            if (ok) {
                const att = attributes.find(([k]) => k === key)
                setAttributes(prev => prev.filter(([k]) => k !== key))
                toast({
                    title: "Success",
                    description: "Attribute removed",
                    action: att && <ToastButton onClick={() => handleAddAttribute(att)} />,
                })
                setAttribute(getDefaultAttribute())
            }
        } finally {
            setIsRemoveLoading(false)
        }
    }

    const handleAddAttribute = async (att?: [string, string[]]) => {
        const newAttribute = att || attribute
        if (newAttribute[0] === "" || newAttribute[1].some(v => v === "")) {
            toast({
                title: "Error",
                description: "Please fill all the fields",
                variant: "destructive"
            })
            return
        }
        try {
            setIsAddLoading(true)
            const ok = await onSetAttributes(newAttribute)

            if (ok) {
                setAttributes(prev => [...prev, newAttribute])
                setAttribute(getDefaultAttribute())
                setIsAddValue(false)
            }
        } finally {
            setIsAddLoading(false)
        }
    }

    const handleSetKeyDown = (evt: React.KeyboardEvent) => {
        if (evt.code === "Escape") {
            evt.preventDefault()
            handleSetEditable()
        }

        if (evt.code !== "Enter" || isSetLoading) return

        evt.preventDefault()
        handleSetAttribute(true)
    }

    const handleAddKeyDown = (evt: React.KeyboardEvent) => {
        if (evt.code === "Escape") {
            evt.preventDefault()
            handleSetEditable()
        }

        if (evt.code !== "Enter" || isAddLoading) return

        evt.preventDefault()
        handleAddAttribute()
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
        try {
            setIsLabelLoading(true)
            const ok = await onAddLabel(newLabel)
            if (ok) {
                setLabel([...label, newLabel])
                setNewLabel("")
                setLabelsEditable(false)
            }
        } finally {
            setIsLabelLoading(false)
        }
    }

    const handleRemoveLabel = async (removeLabel: string) => {
        try {
            setIsRemoveLabelLoading(true)
            const ok = await onRemoveLabel(removeLabel)
            if (ok) {
                setLabel(prev => prev.filter(l => l !== removeLabel))
            }
        } finally {
            setIsRemoveLabelLoading(false)
        }
    }

    return (
        <div className="DataPanel">
            <div className="w-full flex justify-between items-center p-4">
                <div className="flex gap-4 items-center">
                    <Button
                        onClick={() => onExpand()}
                    >
                        <ChevronRight size={20} />
                    </Button>
                    {
                        "source" in obj ?
                            <p className="px-2 py-1 bg-foreground rounded-full">{label[0]}</p>
                            :
                            <ul className="flex flex-wrap gap-4 min-w-[10%]" onMouseEnter={() => setLabelsHover(true)} onMouseLeave={() => setLabelsHover(false)}>
                                {label.map((l) => (
                                    <li key={l} className="flex gap-2 px-2 py-1 bg-foreground rounded-full items-center">
                                        <p>{l}</p>
                                        {
                                            session?.user?.role !== "Read-Only" &&
                                            <Button
                                                title="Remove"
                                                onClick={() => handleRemoveLabel(l)}
                                                isLoading={isRemoveLabelLoading}
                                            >
                                                <X size={15} />
                                            </Button>
                                        }
                                    </li>
                                ))}
                                <li className="h-8 flex flex-wrap gap-2">
                                    {
                                        labelsHover && !labelsEditable && session?.user?.role !== "Read-Only" &&
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
                                                className="max-w-[20dvw] h-full bg-foreground border-none text-white"
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
                                                className="p-2 text-xs justify-center border border-foreground"
                                                variant="Secondary"
                                                label="Save"
                                                onClick={() => handleAddLabel()}
                                                isLoading={isLabelLoading}
                                            >
                                                <Check size={15} />
                                            </Button>
                                            {
                                                !isLabelLoading &&
                                                <Button
                                                    className="p-2 text-xs justify-center border border-foreground"
                                                    variant="Secondary"
                                                    label="Cancel"
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
                    }
                </div>
                <p className="font-medium text-xl">{attributes.length}&ensp;Attributes</p>
            </div>
            <Table parentClassName="grow">
                <TableHeader>
                    <TableRow>
                        {
                            (attributes.length > 0 || isAddValue) &&
                            <>
                                <TableHead key="Key">Key</TableHead>
                                {
                                    ATTRIBUTES.map((att) => (
                                        <TableHead key={att}>{att}</TableHead>
                                    ))
                                }
                                <TableHead key="buttons" />
                            </>
                        }
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        attributes.length > 0 &&
                        attributes.map(([key, val]) => (
                            <TableRow
                                className="cursor-pointer p-2 h-20"
                                onClick={() => {
                                    if (editable === key) return
                                    handleSetEditable([key, [...val]])
                                }}
                                // onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && handleSetEditable()}
                                onMouseEnter={() => setHover(key)}
                                onMouseLeave={() => setHover("")}
                                key={key}
                                tabIndex={0} // Added to make the row focusable
                            >
                                <TableCell>
                                    {key}:
                                </TableCell>
                                {
                                    editable === key ?
                                        <>
                                            <TableCell>
                                                <Combobox
                                                    options={OPTIONS}
                                                    setSelectedValue={(v) => setAttribute(prev => {
                                                        const p: [string, string[]] = [...prev]
                                                        p[1][0] = v
                                                        return p
                                                    })}
                                                    inTable
                                                    label="Type"
                                                    selectedValue={attribute[1][0]}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    className="w-full"
                                                    onKeyDown={handleSetKeyDown}
                                                    onChange={(e) => setAttribute(prev => {
                                                        const p: [string, string[]] = [...prev]
                                                        p[1][1] = e.target.value
                                                        return p
                                                    })}
                                                    value={attribute[1][1]}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                                                    onCheckedChange={(checked) => setAttribute(prev => {
                                                        const p: [string, string[]] = [...prev]
                                                        p[1][2] = checked ? "true" : "false"
                                                        return p
                                                    })}
                                                    checked={attribute[1][2] === "true"}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                                                    onCheckedChange={(checked) => setAttribute(prev => {
                                                        const p: [string, string[]] = [...prev]
                                                        p[1][3] = checked ? "true" : "false"
                                                        return p
                                                    })}
                                                    checked={attribute[1][3] === "true"}
                                                />
                                            </TableCell>
                                        </>
                                        : val.map((v, i) => (
                                            <TableCell key={i}>{v}</TableCell>
                                        ))
                                }
                                <TableCell>
                                    <div className="flex gap-2 w-44">
                                        {
                                            session?.user?.role !== "Read-Only" && (
                                                editable === key ?
                                                    <>
                                                        <Button
                                                            className="p-2 justify-center border border-foreground"
                                                            variant="Secondary"
                                                            label="Save"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleSetAttribute(true)
                                                            }}
                                                            isLoading={isSetLoading}
                                                        >
                                                            <Check size={20} />
                                                        </Button>
                                                        {
                                                            !isSetLoading &&
                                                            <Button
                                                                className="p-2 justify-center border border-foreground"
                                                                variant="Secondary"
                                                                label="Cancel"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleSetEditable()

                                                                }}
                                                            >
                                                                <X size={20} />
                                                            </Button>
                                                        }
                                                    </>
                                                    : hover === key &&
                                                    <>
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
                                                                    onClick={() => handleRemoveAttribute(key)}
                                                                    isLoading={isRemoveLoading}
                                                                />
                                                                {
                                                                    !isRemoveLoading &&
                                                                    <CloseDialog
                                                                        label="Cancel"
                                                                        variant="Cancel"
                                                                    />
                                                                }
                                                            </div>
                                                        </DialogComponent>
                                                        <Button
                                                            className="p-2 justify-center border border-foreground"
                                                            variant="Secondary"
                                                            label="Edit"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleSetEditable([key, [...val]])
                                                            }}
                                                        >
                                                            <Pencil size={20} />
                                                        </Button>
                                                    </>
                                            )
                                        }
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                    {
                        isAddValue &&
                        <TableRow key="Add Value">
                            <TableCell>
                                <Input
                                    className="w-full"
                                    onKeyDown={handleAddKeyDown}
                                    onChange={(e) => setAttribute(prev => {
                                        const p: [string, string[]] = [...prev]
                                        p[0] = e.target.value
                                        return p
                                    })}
                                    value={attribute[0]}
                                />
                            </TableCell>
                            <TableCell>
                                <Combobox
                                    options={OPTIONS}
                                    setSelectedValue={(v) => setAttribute(prev => {
                                        const p: [string, string[]] = [...prev]
                                        p[1][0] = v
                                        return p
                                    })}
                                    inTable
                                    label="Type"
                                    selectedValue={attribute[1][0]}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    className="w-full"
                                    onKeyDown={handleAddKeyDown}
                                    onChange={(e) => setAttribute(prev => {
                                        const p: [string, string[]] = [...prev]
                                        p[1][1] = e.target.value
                                        return p
                                    })}
                                    value={attribute[1][1]}
                                />
                            </TableCell>
                            <TableCell>
                                <Checkbox
                                    className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                                    onCheckedChange={(checked) => setAttribute(prev => {
                                        const p: [string, string[]] = [...prev]
                                        p[1][2] = checked ? "true" : "false"
                                        return p
                                    })}
                                    checked={attribute[1][2] === "true"}
                                />
                            </TableCell>
                            <TableCell>
                                <Checkbox
                                    className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                                    onCheckedChange={(checked) => setAttribute(prev => {
                                        const p: [string, string[]] = [...prev]
                                        p[1][3] = checked ? "true" : "false"
                                        return p
                                    })}
                                    checked={attribute[1][3] === "true"}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2 w-44">
                                    <Button
                                        className="p-2 justify-center border border-foreground"
                                        variant="Secondary"
                                        label="Save"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleAddAttribute()
                                        }}
                                        isLoading={isAddLoading}
                                    >
                                        <Check size={20} />
                                    </Button>
                                    {
                                        !isAddLoading &&
                                        <Button
                                            className="p-2 justify-center border border-foreground"
                                            variant="Secondary"
                                            label="Cancel"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleSetEditable()
                                                setIsAddValue(false)
                                            }}
                                        >
                                            <X size={20} />
                                        </Button>
                                    }
                                </div>
                            </TableCell>
                        </TableRow>
                    }
                </TableBody>
                <TableCaption>
                    {
                        session?.user?.role !== "Read-Only" &&
                        <Button
                            variant="Primary"
                            label="Add Value"
                            onClick={() => setIsAddValue(true)}
                        >
                            <PlusCircle size={20} />
                        </Button>
                    }
                </TableCaption>
            </Table>
            <div className="p-8 flex justify-end">
                {
                    session?.user.role &&
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
                }
            </div>
        </div>
    )
}