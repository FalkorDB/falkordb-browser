/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/no-array-index-key */

"use client";

import { Check, ChevronRight, Pencil, PlusCircle, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import Button from "../components/ui/Button";
import { ATTRIBUTES, getDefaultAttribute, OPTIONS } from "./SchemaCreateElement";
import Combobox from "../components/ui/combobox";
import { Link, Node } from "../api/graph/model";
import Input from "../components/ui/Input";
import ToastButton from "../components/ToastButton";

interface Props {
    obj: Node | Link
    onExpand: () => void;
    onSetAttributes: (attribute: [string, string[]]) => Promise<boolean>;
    onRemoveAttribute: (key: string) => Promise<boolean>;
    onDeleteElement: () => Promise<void>;
}

export default function SchemaDataPanel({ obj, onExpand, onSetAttributes, onRemoveAttribute, onDeleteElement }: Props) {

    const [attribute, setAttribute] = useState<[string, string[]]>(getDefaultAttribute())
    const [attributes, setAttributes] = useState<[string, string[]][]>([])
    const [label, setLabel] = useState<string>("")
    const [editable, setEditable] = useState<string>("")
    const [hover, setHover] = useState<string>("")
    const [isAddValue, setIsAddValue] = useState<boolean>(false)
    const { toast } = useToast()

    useEffect(() => {
        setAttributes(Object.entries(obj.data).filter(([key, val]) => !(key === "name" && Number(val) === obj.id)).map(([key, val]) => [key, Array.isArray(val) ? val : (val as string).split(',')]))
        setLabel("source" in obj ? obj.label : obj.category)
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
    }

    const handleRemoveAttribute = async (key: string) => {

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

        const ok = await onSetAttributes(newAttribute)

        if (ok) {
            setAttributes(prev => [...prev, newAttribute])
            setAttribute(getDefaultAttribute())
            setIsAddValue(false)
        }
    }

    const handleSetKeyDown = (evt: React.KeyboardEvent) => {
        if (evt.code === "Escape") {
            evt.preventDefault()
            handleSetEditable()
        }

        if (evt.code !== "Enter") return

        evt.preventDefault()
        handleSetAttribute(true)
    }

    const handleAddKeyDown = (evt: React.KeyboardEvent) => {
        if (evt.code === "Escape") {
            evt.preventDefault()
            handleSetEditable()
        }

        if (evt.code !== "Enter") return

        evt.preventDefault()
        handleAddAttribute()
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
                    <p>{label}</p>
                </div>
                <p className="font-medium text-xl"><span className="text-primary">{attributes.length}</span> Attributes</p>
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
                                                    type="Type"
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
                                                    >
                                                        <Check size={20} />
                                                    </Button>
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
                                                </>
                                                : hover === key &&
                                                <>
                                                    <Button
                                                        className="p-2 justify-center border border-foreground"
                                                        variant="Secondary"
                                                        label="Remove"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleRemoveAttribute(key)
                                                        }}
                                                    >
                                                        <Trash2 size={20} />
                                                    </Button>
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
                                    type="Type"
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
                                    >
                                        <Check size={20} />
                                    </Button>
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
                                </div>
                            </TableCell>
                        </TableRow>
                    }
                </TableBody>
                <TableCaption>
                    <Button
                        variant="Primary"
                        label="Add Value"
                        onClick={() => setIsAddValue(prev => {
                            if (!prev) {
                                setAttribute(getDefaultAttribute())
                                setEditable("")
                            }
                            return !prev
                        })}
                    >
                        <PlusCircle size={20} />
                    </Button>
                </TableCaption>
            </Table>
            <div className="p-8 flex justify-end">
                <Button
                    label="Delete"
                    variant="Secondary"
                    onClick={() => onDeleteElement()}
                >
                    <Trash2 size={20} />
                </Button>
            </div>
        </div>
    )
}