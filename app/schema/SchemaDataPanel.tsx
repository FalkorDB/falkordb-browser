/* eslint-disable react/no-array-index-key */
import { Check, ChevronRight, MinusCircle, Pencil, PlusCircle, Trash2, X } from "lucide-react";
import { Toast } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import Button from "../components/ui/Button";
import { ATTRIBUTES, getDefaultAttribute, OPTIONS } from "./SchemaCreateElement";
import Input from "../components/ui/Input";
import Combobox from "../components/ui/combobox";
import { Link, Node } from "../api/graph/model";

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

    useEffect(() => {
        setAttributes(Object.entries(obj.data).filter(([key, val]) => !(key === "name" && Number(val) === obj.id)).map(([key, val]) => [key, Array.isArray(val) ? val : (val as string).split(',')]))
        setLabel("source" in obj ? obj.label : obj.category)
    }, [obj])

    const handelSetEditable = ([key, val]: [string, string[]] = getDefaultAttribute()) => {
        if (key !== "") {
            setIsAddValue(false)
        }

        setAttribute([key, val])
        setEditable(key)
    }

    const handelSetAttributes = async () => {
        if (attribute[0] === "" || attribute[1].some(v => v === "")) {
            Toast("Please fill all the fields")
            return
        }

        const ok = await onSetAttributes(attribute)

        if (ok) {
            setAttributes(prev => prev.map((att) => att[0] === attribute[0] ? attribute : att))
            handelSetEditable()
        }
    }

    const handelRemoveAttribute = async (key: string) => {

        const ok = await onRemoveAttribute(key)

        if (ok) {
            setAttributes(prev => prev.filter(([k]) => k !== key))
        }
    }

    const handelAddAttribute = async () => {
        if (attribute[0] === "" || attribute[1].some(v => v === "")) {
            Toast("Please fill all the fields")
            return
        }

        const ok = await onSetAttributes(attribute)

        if (ok) {
            setAttributes(prev => [...prev, attribute])
            setAttribute(getDefaultAttribute())
            setIsAddValue(false)
        }
    }

    const handelKeyDown = (evt: React.KeyboardEvent, func: () => void) => {
        if (evt.code === "Escape") {
            evt.preventDefault()
            handelSetEditable()
        }

        if (evt.code !== "Enter") return

        evt.preventDefault()
        func()
    }

    return (
        <div className="DataPanel">
            <div className="flex justify-between items-center bg-[#7167F6] p-4">
                <div className="flex gap-2">
                    <Button
                        variant="button"
                        onClick={() => onExpand()}
                    >
                        <ChevronRight size={20} />
                    </Button>
                    <p>{label}</p>
                </div>
                <div>
                    <p>Attributes {attributes.length}</p>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow className="border-none">
                        {
                            (attributes.length > 0 || isAddValue) &&
                            <>
                                <TableHead key="buttons" className="p-0" />
                                <TableHead key="Key" className="p-0">Key</TableHead>
                                {ATTRIBUTES.map((att) => (
                                    <TableHead key={att} className="p-0">{att}</TableHead>
                                ))}
                            </>
                        }
                    </TableRow>
                </TableHeader>
                <TableBody className="px-2">
                    {
                        attributes.length > 0 &&
                        attributes.map(([key, val]) => (
                            <TableRow
                                className="cursor-pointer border-none"
                                onClick={() => {
                                    if (editable === key) return
                                    handelSetEditable([key, [...val]])
                                }}
                                // onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && handelSetEditable()}
                                onMouseEnter={() => setHover(key)}
                                onMouseLeave={() => setHover("")}
                                key={key}
                                tabIndex={0} // Added to make the row focusable
                            >
                                <TableCell className="px-1 py-0">
                                    <div className="flex flex-col gap-2 w-5 h-12">
                                        {
                                            editable === key ?
                                                <>
                                                    <Button
                                                        title="Save"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handelSetAttributes()
                                                        }}
                                                    >
                                                        <Check size={20} />
                                                    </Button>
                                                    <Button
                                                        title="Cancel"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handelSetEditable()
                                                        }}
                                                    >
                                                        <X size={20} />
                                                    </Button>
                                                </>
                                                : hover === key &&
                                                <>
                                                    <Button
                                                        title="Remove"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handelRemoveAttribute(key)
                                                        }}
                                                    >
                                                        <Trash2 size={20} />
                                                    </Button>
                                                    <Button
                                                        title="Edit"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handelSetEditable([key, [...val]])
                                                        }}
                                                    >
                                                        <Pencil size={20} />
                                                    </Button>
                                                </>
                                        }
                                    </div>
                                </TableCell>
                                <TableCell className="px-1 py-0">
                                    {key}:
                                </TableCell>
                                {
                                    editable === key ?
                                        <>
                                            <TableCell className="px-1 py-0">
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
                                            <TableCell className="px-1 py-0">
                                                <Input
                                                    className="w-28"
                                                    onKeyDown={(e) => handelKeyDown(e, handelSetAttributes)}
                                                    variant="Small"
                                                    onChange={(e) => setAttribute(prev => {
                                                        const p: [string, string[]] = [...prev]
                                                        p[1][1] = e.target.value
                                                        return p
                                                    })}
                                                    value={attribute[1][1]}
                                                />
                                            </TableCell>
                                            <TableCell className="px-1 py-0">
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
                                            <TableCell className="px-1 py-0">
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
                                            <TableCell className="px-1 py-0" key={i}>{v}</TableCell>
                                        ))
                                }
                            </TableRow>
                        ))
                    }
                    {
                        isAddValue &&
                        <TableRow key="Add Value" className="border-none">
                            <TableCell className="flex flex-col gap-1 px-1 py-0">
                                <Button
                                    title="Save"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handelAddAttribute()
                                    }}
                                >
                                    <Check size={20} />
                                </Button>
                                <Button
                                    title="Cancel"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handelSetEditable()
                                    }}
                                >
                                    <X size={20} />
                                </Button>
                            </TableCell>
                            <TableCell className="px-1 py-0">
                                <Input
                                    className="w-28"
                                    onKeyDown={(e) => handelKeyDown(e, handelAddAttribute)}
                                    variant="Small"
                                    onChange={(e) => setAttribute(prev => {
                                        const p: [string, string[]] = [...prev]
                                        p[0] = e.target.value
                                        return p
                                    })}
                                    value={attribute[0]}
                                />
                            </TableCell>
                            <TableCell className="px-1 py-0">
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
                            <TableCell className="px-1 py-0">
                                <Input
                                    className="w-28"
                                    onKeyDown={(e) => handelKeyDown(e, handelAddAttribute)}
                                    variant="Small"
                                    onChange={(e) => setAttribute(prev => {
                                        const p: [string, string[]] = [...prev]
                                        p[1][1] = e.target.value
                                        return p
                                    })}
                                    value={attribute[1][1]}
                                />
                            </TableCell>
                            <TableCell className="px-1 py-0">
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
                            <TableCell className="px-1 py-0">
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
                        </TableRow>
                    }
                </TableBody>
            </Table>
            <div className="p-4">
                <Button
                    className="border border-[#232341]"
                    variant="Secondary"
                    label="Add Value"
                    onClick={() => setIsAddValue(prev => {
                        if (!prev) {
                            setAttribute(getDefaultAttribute())
                            setEditable("")
                        }
                        return !prev
                    })}
                >
                    {isAddValue ? <MinusCircle size={20} /> : <PlusCircle size={20} />}
                </Button>
            </div>
            <div className="p-4">
                <Button
                    className="border border-[#232341]"
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