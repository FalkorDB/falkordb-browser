'use client'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toast, cn } from "@/lib/utils";
import { EdgeDataDefinition, NodeDataDefinition } from "cytoscape";
import { ChevronRight, MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import IconButton from "../components/IconButton";

/* eslint-disable react/require-default-props */
interface Props {
    inSchema?: boolean;
    obj: NodeDataDefinition | EdgeDataDefinition;
    onExpand: () => void;
    setProperty?: (key: string, newVal: string) => Promise<boolean>;
    setPropertySchema?: (key: string, newVal: string[]) => Promise<boolean>;
    removeProperty?: (key: string) => Promise<boolean>;
    setLabel?: (label: string) => Promise<boolean>;
    onDeleteElement?: () => Promise<void>;
}

const excludedProperties = new Set([
    "category",
    "color",
    "_id",
    "id",
    "label",
    "target",
    "source",
]);

export default function DataPanel({ inSchema, obj, onExpand, setProperty, setPropertySchema, removeProperty, onDeleteElement, setLabel }: Props) {

    const [isAddValue, setIsAddValue] = useState<boolean>(false)
    const [hover, setHover] = useState<string>("")
    const [editable, setEditable] = useState<string>("")
    const [labelEditable, setLabelEditable] = useState<boolean>(false)
    const [val, setVal] = useState<string>("")
    const [schemaVal, setSchemaVal] = useState<string[]>([])
    const [newLabel, setNewLabel] = useState<string>("")
    const [key, setKey] = useState<string>("")
    const addValueRef = useRef<HTMLDivElement>(null)
    const type = obj.source ? "edge" : "node"
    const label = (type === "edge" ? obj.label : obj.category) || "label"

    useEffect(() => {
        if (!isAddValue) return
        addValueRef.current?.focus()
    }, [isAddValue])

    const onKeyDownSchema = async (e: KeyboardEvent<HTMLDivElement>) => {

        if (!setPropertySchema) return

        if (e.code === "Escape") {
            e.preventDefault()
            setEditable("")
            setIsAddValue(false)
        }

        if (e.code !== "Enter") return

        e.preventDefault()

        if (schemaVal.length === 4 || !key) {
            Toast("Error", `${!key ? "Key" : "Value"} cannot be empty`)
            return
        }
        const success = await setPropertySchema(key, schemaVal)

        if (success) {
            const ob = obj
            ob[key] = schemaVal
        }

        setSchemaVal([])
        setEditable("")
        setKey("")
        setIsAddValue(false)
    }

    const onKeyDown = async (e: KeyboardEvent<HTMLDivElement>) => {

        if (!setProperty) return

        if (e.code === "Escape") {
            e.preventDefault()
            setEditable("")
            setIsAddValue(false)
        }

        if (e.code !== "Enter") return

        e.preventDefault()

        if (!val || !key) {
            Toast("Error", `${!key ? "Key" : "Value"} cannot be empty`)
            return
        }

        const success = await setProperty(key, val)

        if (success) {
            const ob = obj
            ob[key] = val
        }

        setVal("")
        setKey("")
        setEditable("")
        setIsAddValue(false)
    }

    const onDelete = async (k: string) => {
        if (!removeProperty) return
        const success = await removeProperty(k)
        if (!success) return
        const ob = obj
        delete ob[k]
    }

    const onSetLabel = async (e: KeyboardEvent<HTMLParagraphElement>) => {
        if (!setLabel) return
        if (e.code === "Escape") {
            e.preventDefault()
            setLabelEditable(false)
        }
        if (e.code !== "Enter") return
        e.preventDefault()
        const success = await setLabel(newLabel)
        if (!success) return
        const ob = obj
        if (type === "edge") {
            ob.label = newLabel
            return
        }
        ob.category = newLabel
    }

    return (
        <div className="h-full w-full flex flex-col shadow-lg DataPanel">
            <div className="w-full flex flex-row justify-between items-center bg-[#7167F6] p-4">
                <div className="flex flex-row gap-4 items-center">
                    <IconButton
                        variant="button"
                        icon={<ChevronRight />}
                        onClick={() => onExpand()}
                    />
                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                    <div
                        ref={ref => {
                            if (ref?.contentEditable) {
                                ref.focus()
                            }
                        }}
                        className={cn("text-white py-1 px-2", labelEditable && "bg-white border-gray-200 text-black")}
                        onInput={(e) => setNewLabel(e.currentTarget.textContent || "")}
                        onClick={() => label === "label" && setLabel && setLabelEditable(true)}
                        contentEditable={labelEditable}
                        onBlur={() => setLabelEditable(false)}
                        onKeyDown={onSetLabel}
                    >
                        {label}
                    </div>
                </div>
                <p className="flex flex-row text-white">{Object.keys(obj).filter((v) => !excludedProperties.has(v)).length} Attributes</p>
            </div>
            <div className="w-full h-1 grow flex flex-col justify-between items-start font-medium">
                <Table>
                    {
                        (setProperty || setPropertySchema) &&
                        <TableCaption className="mt-11 py-2.5 px-6 text-start">
                            <Button
                                className="border border-[#232341]"
                                variant="Secondary"
                                label="Add Attribute"
                                icon={isAddValue ? <MinusCircle /> : <PlusCircle />}
                                onClick={() => setIsAddValue(prev => !prev)}
                            />
                        </TableCaption>
                    }
                    {
                        inSchema &&
                        <TableHeader>
                            <TableRow className="border-[#57577B] text-[#ACACC2] text-lg font-black">
                                <TableHead className="p-8">Name</TableHead>
                                <TableHead className="p-8">Type</TableHead>
                                <TableHead className="p-8">Description</TableHead>
                                <TableHead className="p-8">Unique</TableHead>
                                <TableHead className="p-8">aaa</TableHead>
                            </TableRow>
                        </TableHeader>
                    }
                    <TableBody>
                        {
                            Object.entries(obj).filter((row) => !excludedProperties.has(row[0]) && !(row[0] === "name" && row[1] === obj.id)).map((row, index) => {
                                const strKey = JSON.parse(JSON.stringify(row[0]))
                                const strCell = JSON.parse(JSON.stringify(row[1]))
                                const isEditable = !inSchema && editable === `${index}`
                                return (
                                    <TableRow
                                        // eslint-disable-next-line react/no-array-index-key
                                        key={index}
                                        className="border-none"
                                        onMouseEnter={() => {
                                            if (strKey === "id" || !removeProperty) return
                                            setHover(row[0])
                                        }}
                                        onMouseLeave={() => {
                                            setHover("")
                                        }}
                                    >
                                        <TableCell
                                            key={row[0]}
                                            className={cn("p-8", !inSchema && "w-1/2")}
                                        >
                                            <div className="text-[#ACACC2] flex flex-row gap-2 items-center">
                                                {
                                                    hover === strKey &&
                                                    <IconButton
                                                        icon={<Trash2 />}
                                                        onClick={() => onDelete(strKey)}
                                                    />
                                                }
                                                {strKey}:
                                            </div>
                                        </TableCell>
                                        {
                                            inSchema ?
                                                strCell.map((cell: string | boolean, i: number) => {
                                                    const isEdit = editable === `${index}-${i}`
                                                    return (
                                                        <TableCell
                                                            // eslint-disable-next-line react/no-array-index-key
                                                            key={i}
                                                            className="p-4"
                                                            onClick={() => {
                                                                if (!setPropertySchema) return
                                                                setEditable(`${index}-${i}`)
                                                            }}
                                                        >
                                                            {
                                                                isEdit ?
                                                                    <Input
                                                                        ref={ref => {
                                                                            ref?.focus()
                                                                        }}
                                                                        variant="Small"
                                                                        onChange={e => setSchemaVal(prev => {
                                                                            const p = prev
                                                                            p[i] = e.target.value
                                                                            return p
                                                                        })}
                                                                        onKeyDown={(e) => {
                                                                            setKey(strKey)
                                                                            onKeyDownSchema(e)
                                                                        }}
                                                                        onBlur={() => setEditable("")}
                                                                    />
                                                                    :
                                                                    <p>
                                                                        {cell.toString()}
                                                                    </p>}
                                                        </TableCell>
                                                    )
                                                })
                                                : <TableCell
                                                    className="p-4"
                                                    onClick={() => {
                                                        if (!setProperty) return
                                                        setEditable(`${index}`)
                                                    }}
                                                >
                                                    {
                                                        isEditable ?
                                                            <Input
                                                                className="w-40"
                                                                ref={ref => {
                                                                    ref?.focus()
                                                                }}
                                                                variant="Small"
                                                                onKeyDown={(e) => {
                                                                    setKey(strKey)
                                                                    onKeyDown(e)
                                                                }}
                                                                onChange={(e) => setVal(e.target.value)}
                                                                onBlur={() => setEditable("")}
                                                            />
                                                            : <p>
                                                                {strCell.toString()}
                                                            </p>}
                                                </TableCell>
                                        }
                                    </TableRow>
                                )
                            })
                        }
                        {
                            isAddValue && inSchema ?
                                <TableRow className="border-none">
                                    <TableCell className="p-4">
                                        <Input
                                            variant="Small"
                                            onChange={(e) => setKey(e.target.value)}
                                            onKeyDown={onKeyDownSchema}
                                        />
                                    </TableCell>
                                    <TableCell
                                        className="p-4"
                                    >
                                        <Input
                                            variant="Small"
                                            onChange={(e) => setSchemaVal(prev => {
                                                const p = prev
                                                p[0] = e.target.value
                                                return p
                                            })}
                                            onKeyDown={onKeyDownSchema}
                                        />
                                    </TableCell>
                                    <TableCell
                                        className="p-4"
                                    >
                                        <Input
                                            variant="Small"
                                            onChange={(e) => setSchemaVal(prev => {
                                                const p = prev
                                                p[1] = e.target.value
                                                return p
                                            })}
                                            onKeyDown={onKeyDownSchema}
                                        />
                                    </TableCell>
                                    <TableCell
                                        className="p-4"
                                    >
                                        <Input
                                            variant="Small"
                                            onChange={(e) => setSchemaVal(prev => {
                                                const p = prev
                                                p[2] = e.target.value
                                                return p
                                            })}
                                            onKeyDown={onKeyDownSchema}
                                        />
                                    </TableCell>
                                    <TableCell
                                        className="p-4"
                                    >
                                        <Input
                                            variant="Small"
                                            onChange={(e) => setSchemaVal(prev => {
                                                const p = prev
                                                p[3] = e.target.value
                                                return p
                                            })}
                                            onKeyDown={onKeyDownSchema}
                                        />
                                    </TableCell>
                                </TableRow>
                                : isAddValue &&
                                <TableRow>
                                    <TableCell className="p-4">
                                        <Input
                                            className="w-40"
                                            variant="Small"
                                            onChange={(e) => setKey(e.target.value)}
                                            onKeyDown={onKeyDown}
                                        />
                                    </TableCell>
                                    <TableCell
                                        className="p-4"
                                    >
                                        <Input
                                            className="w-40"
                                            variant="Small"
                                            onChange={(e) => setVal(e.target.value)}
                                            onKeyDown={onKeyDown}
                                        />
                                    </TableCell>
                                </TableRow>
                        }
                    </TableBody>
                </Table>
                {
                    onDeleteElement &&
                    <Button
                        className="m-8 border border-[#232341]"
                        variant="Secondary"
                        label="Delete"
                        icon={<Trash2 />}
                        onClick={() => onDeleteElement()}
                    />
                }
            </div>
        </div >
    )
}