/* eslint-disable react/no-array-index-key */
import { Check, ChevronRight, MinusCircle, Pencil, PlusCircle, Trash2, X } from "lucide-react";
import { ElementDataDefinition, Toast } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import Button from "../components/ui/Button";
import { ATTRIBUTES, getDefaultAttribute, OPTIONS } from "./SchemaCreateElement";
import Input from "../components/ui/Input";
import Combobox from "../components/ui/combobox";

interface Props {
    obj: ElementDataDefinition
    onExpand: () => void;
    onSetAttributes: (attribute: [string, string[]]) => Promise<boolean>;
    onRemoveAttribute: (key: string) => Promise<boolean>;
}

export default function SchemaDataPanel({ obj, onExpand, onSetAttributes, onRemoveAttribute }: Props) {

    const [attribute, setAttribute] = useState<[string, string[]]>(getDefaultAttribute())
    const [attributes, setAttributes] = useState<[string, string[]][]>([])
    const [label, setLabel] = useState<string>("")
    const [editable, setEditable] = useState<string>("")
    const [hover, setHover] = useState<string>("")
    const [isAddValue, setIsAddValue] = useState<boolean>(false)

    useEffect(() => {
        setAttributes(Object.entries(obj.data).filter(([key, val]) => !(key === "name" && val === obj.id)).map(([key, val]) => [key, Array.isArray(val) ? val : (val as string).split(',')]))
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
                        icon={<ChevronRight />}
                        onClick={() => onExpand()}
                    />
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
                                <TableHead key="Key" className="flex-1">Key</TableHead>
                                {ATTRIBUTES.map((att) => (
                                    <TableHead key={att} className="flex-1">{att}</TableHead>
                                ))}
                            </>
                        }
                    </TableRow>
                </TableHeader>
                <TableBody>
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
                                <TableCell className="flex items-center gap-2">
                                    <div className="w-6 h-12">
                                        {
                                            editable === key ?
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        variant="button"
                                                        icon={<Check size={20} />}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handelSetAttributes()
                                                        }}
                                                    />
                                                    <Button
                                                        variant="button"
                                                        icon={<X size={20} />}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handelSetEditable()
                                                        }}
                                                    />
                                                </div>
                                                : hover === key &&
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        icon={<Trash2 size={20} />}
                                                        variant="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handelRemoveAttribute(key)
                                                        }}
                                                    />
                                                    <Button
                                                        variant="button"
                                                        icon={<Pencil size={20} />}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handelSetEditable([key, [...val]])
                                                        }}
                                                    />
                                                </div>
                                        }
                                    </div>
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
                            </TableRow>
                        ))
                    }
                    {
                        isAddValue &&
                        <TableRow key="Add Value" className="border-none">
                            <TableCell className="flex items-center gap-2">
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="button"
                                        icon={<Check size={20} />}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handelAddAttribute()
                                        }}
                                    />
                                    <Button
                                        variant="button"
                                        icon={<X size={20} />}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handelSetEditable()
                                        }}
                                    />
                                </div>
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
                        </TableRow>
                    }
                </TableBody>
                <TableCaption>
                    <Button
                        variant="Secondary"
                        label="Add Value"
                        icon={isAddValue ? <MinusCircle /> : <PlusCircle />}
                        onClick={() => setIsAddValue(prev => {
                            if (!prev) {
                                setAttribute(getDefaultAttribute())
                                setEditable("")
                            }
                            return !prev
                        })}
                    />
                </TableCaption>
            </Table>
        </div>
    )
}