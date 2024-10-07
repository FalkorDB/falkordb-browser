'use client'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { cn, ElementDataDefinition, Toast } from "@/lib/utils";
import { ChevronRight, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Session } from "next-auth";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Combobox from "../components/ui/combobox";

export const OPTIONS = ["String", "Integer", "Float", "Geospatial", "Boolean"]

export type Type = "String" | "Integer" | "Float" | "Geospatial" | "Boolean" | undefined
export type Attribute = [Type, string, boolean, boolean]

const excludedProperties = new Set([
    "category",
    "color",
    "_id",
    "id",
    "label",
    "target",
    "source",
]);

interface Props {
    obj: ElementDataDefinition
    onExpand: () => void
    onDelete: () => void
    onSetAttribute: (key: string, val: Attribute) => Promise<boolean>
    onRemoveAttribute: (key: string) => Promise<boolean>
    onSetCategory: (label: string) => Promise<boolean>
    data: Session | null
}

const emptyAttribute = (): Attribute => [undefined, "", false, false]

export default function SchemaCreateElement({ obj, onExpand, onDelete, onSetAttribute, onRemoveAttribute, onSetCategory, data }: Props) {

    const [attribute, setAttribute] = useState<Attribute>(emptyAttribute())
    const [newVal, setVal] = useState<string>("")
    const [newKey, setNewKey] = useState<string>("")
    const [labelEditable, setLabelEditable] = useState<boolean>(false)
    const [editable, setEditable] = useState<string>("")
    const [hover, setHover] = useState<string>("")
    const [isAddValue, setIsAddValue] = useState<boolean>(false)
    const [attributes, setAttributes] = useState<[string, Attribute][]>(Object.entries(obj).filter(([k, v]) => !excludedProperties.has(k) && !(k === "name" && v === obj.id)).map(([k, v]) => [k, Array.isArray(v) ? v : v.split(",")] as [string, Attribute]))
    const [label, setLabel] = useState<string>(obj.source ? obj.label : obj.category)
    const [newLabel, setNewLabel] = useState<string>("")

    useEffect(() => {
        setAttributes(Object.entries(obj).filter(([k, v]) => !excludedProperties.has(k) && !(k === "name" && v === obj.id)).map(([k, v]) => [k, Array.isArray(v) ? v : v.split(",")] as [string, Attribute]))
        setLabel(obj.source ? obj.label : obj.category)
    }, [obj])

    const handelAddAttribute = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.code === "Escape") {
            e.preventDefault()
            setAttribute(emptyAttribute())
            return
        }

        if (e.key !== 'Enter') return

        e.preventDefault()
        if (!newKey || !attribute[0] || !attribute[1]) {
            Toast('Please fill all the fields')
            return
        }

        const success = await onSetAttribute(newKey, attribute)

        if (!success) return

        setAttributes(prev => [...prev, [newKey, attribute]])
        setAttribute(emptyAttribute())
        setNewKey("")
        setIsAddValue(false)
    }

    const handelSetAttribute = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.code === "Escape") {
            e.preventDefault()
            setVal("")
            setEditable("")
            return
        }

        if (e.key !== 'Enter') return

        e.preventDefault()

        const [index, i] = editable.split("-")
        const isKey = i === "key"

        if (isKey ? !newKey : !newVal) {
            Toast("Please fill the field")
            return
        }

        const attr = attributes[Number(index)][1]

        const success = await onSetAttribute(isKey ? newKey as string : attributes[Number(index)][0], [attr[0], isKey ? attr[1] : newVal as string, attr[2], attr[3]])

        if (!success) return

        setAttributes(prev => {
            const p = [...prev]

            if (i === "key") {
                p[Number(index)][0] = newKey as string
            }

            p[Number(index)][1][Number(i)] = newVal

            return p
        })
        setVal("")
        setNewKey("")
        setEditable("")
    }

    const handelLabelCancel = () => {
        setNewLabel("")
        setLabelEditable(false)
    }

    const handelCancel = () => {
        setVal("")
        setEditable("")
    }

    const handelSetLabel = async (e: React.KeyboardEvent<HTMLInputElement>) => {

        if (e.key === "Escape") {
            handelLabelCancel()
        }

        if (e.key !== "Enter") return

        if (!newLabel) {
            Toast("Label can't be empty")
            return
        }

        const success = await onSetCategory(newLabel)

        if (!success) return

        setLabel(newLabel)
        setNewLabel("")
        setLabelEditable(false)
    }

    return (
        <div className="DataPanel">
            <div className="w-full flex justify-between items-center bg-[#7167F6] p-4">
                <div className="flex gap-4 items-center">
                    <Button
                        variant="button"
                        icon={<ChevronRight />}
                        onClick={() => onExpand()}
                    />
                    {
                        labelEditable ?
                            <Input
                                ref={ref => ref?.focus()}
                                className="w-28"
                                variant="Small"
                                onChange={(e) => setNewLabel(e.target.value)}
                                value={newLabel}
                                onBlur={handelLabelCancel}
                                onKeyDown={handelSetLabel}
                            /> : <Button
                                className={cn(!obj.source ? "underline underline-offset-2" : "cursor-default")}
                                label={label || "Edit Label"}
                                onClick={() => !obj.source && setLabelEditable(true)}
                            />
                    }
                </div>
                <p className="flex text-white">{attributes.length} Attributes</p>
            </div>
            <div className="w-full h-1 grow flex flex-col justify-between items-start font-medium">
                <Table>
                    {
                        (attributes.length > 0 || isAddValue) &&
                        <TableHeader>
                            <TableRow className="border-none">
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Unique</TableHead>
                                <TableHead>Unique</TableHead>
                            </TableRow>
                        </TableHeader>
                    }<TableCaption className="p-8">
                        <Button
                            className="border border-[#232341]"
                            label="Add Attribute"
                            variant="Secondary"
                            onClick={() => setIsAddValue(prev => !prev)}
                            disabled={data?.user.role === "Read-Only"}
                        />
                    </TableCaption>
                    <TableBody>
                        {
                            attributes.map(([key, val], index) => (
                                <TableRow
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={index}
                                    className="border-none"
                                    onMouseEnter={() => setHover(`${index}`)}
                                    onMouseLeave={() => setHover("")}
                                >
                                    <TableCell className={cn(hover === `${index}` && "flex gap-2")}>
                                        {
                                            hover === `${index}` &&
                                            <Button
                                                className="text-[#ACACC2]"
                                                icon={<Trash2 />}
                                                onClick={() => {
                                                    onRemoveAttribute(key)
                                                    setAttributes(prev => prev.filter(([k]) => k !== key))
                                                }}
                                            />
                                        }
                                        {
                                            editable === `${index}-key` && data?.user.role !== "Read-Only" ?
                                                <Input
                                                    ref={ref => ref?.focus()}
                                                    className="w-28"
                                                    variant="Small"
                                                    value={newKey}
                                                    onChange={(e) => setNewKey(e.target.value)}
                                                    onKeyDown={handelSetAttribute}
                                                    onBlur={() => handelCancel()}
                                                />
                                                : <Button
                                                    className="text-[#ACACC2]"
                                                    label={`${key}:`}
                                                    onClick={() => {
                                                        setEditable(`${index}-key`)
                                                    }}
                                                />
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {
                                            editable === `${index}-0` && data?.user.role !== "Read-Only" ?
                                                <Combobox
                                                    options={OPTIONS}
                                                    setSelectedValue={async (selectedValue) => {
                                                        const attr = attributes[index][1]
                                                        const success = await onSetAttribute(key, [selectedValue as Type, attr[1], attr[2], attr[3]])

                                                        if (!success) return

                                                        setAttributes(prev => {
                                                            const p = [...prev]
                                                            p[index][1][0] = selectedValue as Type
                                                            return p
                                                        })

                                                        setEditable("")
                                                    }}
                                                    inTable
                                                    type="Type"
                                                    selectedValue={val[0]}
                                                    onOpenChange={(o) => !o && setEditable("")}
                                                    defaultOpen
                                                />
                                                : <Button
                                                    label={val[0]}
                                                    onClick={() => setEditable(`${index}-0`)}
                                                />
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {
                                            editable === `${index}-1` && data?.user.role !== "Read-Only" ?
                                                <Input
                                                    ref={ref => ref?.focus()}
                                                    className="w-28"
                                                    variant="Small"
                                                    value={newVal}
                                                    onChange={(e) => setVal(e.target.value)}
                                                    onKeyDown={handelSetAttribute}
                                                    onBlur={() => setEditable("")}
                                                />
                                                : <Button
                                                    label={val[1]}
                                                    onClick={() => setEditable(`${index}-1`)}
                                                />
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {
                                            editable === `${index}-2` && data?.user.role !== "Read-Only" ?
                                                <Checkbox
                                                    ref={ref => ref?.focus()}
                                                    className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                                                    onCheckedChange={(checked) => {
                                                        setAttributes(prev => {
                                                            const p = [...prev]
                                                            p[index][1][2] = checked as boolean
                                                            return p
                                                        })
                                                        onSetAttribute(key, attributes[index][1])
                                                    }}
                                                    checked={val[2]}
                                                    onBlur={() => setEditable("")}
                                                />
                                                : <Button
                                                    label={val[2].toString()}
                                                    onClick={() => setEditable(`${index}-2`)}
                                                />
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {
                                            editable === `${index}-3` && data?.user.role !== "Read-Only" ?
                                                <Checkbox
                                                    ref={ref => ref?.focus()}
                                                    className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                                                    onCheckedChange={(checked) => {
                                                        setAttributes(prev => {
                                                            const p = [...prev]
                                                            p[index][1][3] = checked as boolean
                                                            return p
                                                        })
                                                        onSetAttribute(key, attributes[index][1])
                                                    }}
                                                    checked={val[3]}
                                                    onBlur={() => setEditable("")}
                                                />
                                                : <Button
                                                    label={val[3].toString()}
                                                    onClick={() => setEditable(`${index}-3`)}
                                                />
                                        }
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                        {
                            isAddValue &&
                            <TableRow className="border-none">
                                <TableCell>
                                    <Input
                                        className="w-28"
                                        onKeyDown={handelAddAttribute}
                                        variant="Small"
                                        onChange={(e) => setNewKey(e.target.value)}
                                        value={newKey}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Combobox
                                        options={OPTIONS}
                                        setSelectedValue={(v) => setAttribute(prev => {
                                            const p = [...prev] as Attribute
                                            p[0] = v as Type
                                            return p
                                        })}
                                        inTable
                                        type="Type"
                                        selectedValue={attribute[0]}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        className="w-28"
                                        onKeyDown={handelAddAttribute}
                                        variant="Small"
                                        onChange={(e) => setAttribute(prev => {
                                            const p = [...prev] as Attribute
                                            p[1] = e.target.value
                                            return p
                                        })}
                                        value={attribute[1]}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Checkbox
                                        className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                                        onCheckedChange={(checked) => setAttribute(prev => {
                                            const p = [...prev] as Attribute
                                            p[2] = checked as boolean
                                            return p
                                        })}
                                        checked={attribute[2]}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Checkbox
                                        className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                                        onCheckedChange={(checked) => setAttribute(prev => {
                                            const p = [...prev] as Attribute
                                            p[3] = checked as boolean
                                            return p
                                        })}
                                        checked={attribute[3]}
                                    />
                                </TableCell>
                            </TableRow>}
                    </TableBody>
                </Table>
                <div className="p-8">
                    <Button
                        className="border border-[#232341]"
                        label="Delete"
                        variant="Secondary"
                        onClick={onDelete}
                        disabled={data?.user.role === "Read-Only"}
                    />
                </div>
            </div>
        </div>
    )
}