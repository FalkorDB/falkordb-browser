'use client'

import { Table, TableBody, TableCaption, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EdgeDataDefinition, NodeDataDefinition } from "cytoscape";
import { ChevronRight, PlusCircle, Trash2 } from "lucide-react";
import { KeyboardEvent, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Button from "../components/Button";

/* eslint-disable react/require-default-props */
interface Props {
    obj: NodeDataDefinition | EdgeDataDefinition;
    onExpand: () => void;
    setProperty?: (key: string, newVal: string) => Promise<boolean>;
    removeProperty?: (key: string) => Promise<boolean>;
    setLabel?: (label: string) => Promise<boolean>;
    onDeleteElement?: () => Promise<void>;
}

const excludedProperties = new Set([
    "category",
    "color",
    "_id",
    "label",
    "target",
    "source"
]);

export default function DataPanel({ obj, onExpand, setProperty, removeProperty, onDeleteElement, setLabel }: Props) {

    const [isAddValue, setIsAddValue] = useState<boolean>(false)
    const [hover, setHover] = useState<string>("")
    const [editable, setEditable] = useState<string>("")
    const [labelEditable, setLabelEditable] = useState<boolean>(false)
    const [val, setVal] = useState<string>("")
    const [newLabel, setNewLabel] = useState<string>("")
    const [key, setKey] = useState<string>("")
    const type = obj.source ? "edge" : "node"
    const label = (type === "edge" ? obj.label : obj.category) || "label"
    const { toast } = useToast()


    const onKeyDown = async (e: KeyboardEvent<HTMLTableCellElement>) => {
        if (!setProperty) return
        if (e.code === "Escape") {
            e.preventDefault()
            setEditable("")
            setIsAddValue(false)
        }
        if (e.code !== "Enter") return
        e.preventDefault()
        if (!val || !key) {
            if (e.currentTarget.textContent) {
                setVal(e.currentTarget.textContent)
            } else {
                setEditable("")
                setIsAddValue(false)
                toast({
                    title: "Error",
                    description:  `${!key ? "Key" : "Value"} cannot be empty`
                })
                return
            }
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
                    <button
                        title="Close"
                        type="button"
                        onClick={() => onExpand()}
                        aria-label="Close"
                    >
                        <ChevronRight />
                    </button>
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
            <div className="grow flex flex-col justify-between items-start">
                <Table>
                    {
                        setProperty &&
                        <TableCaption className="mt-11 py-2.5 px-6 text-start">
                            <Button
                                className="border border-[#232341]"
                                variant="Secondary"
                                label="Add Attribute"
                                icon={<PlusCircle />}
                                type="button"
                                onClick={() => setIsAddValue(prev => !prev)}
                            />
                        </TableCaption>
                    }
                    <TableBody>
                        {
                            Object.entries(obj).filter((row) => !excludedProperties.has(row[0])).map((row, index) => {
                                const strKey = JSON.parse(JSON.stringify(row[0]))
                                const strCell = JSON.parse(JSON.stringify(row[1]))
                                const isEditable = editable === strCell && strKey !== "id"
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
                                            className="w-1/2 p-8"
                                        >
                                            <div className="text-gray-200 opacity-75 flex flex-row gap-2 items-center">
                                                {
                                                    hover === strKey &&
                                                    <button
                                                        title="Delete"
                                                        type="button"
                                                        aria-label="delete"
                                                        onClick={() => onDelete(strKey)}
                                                    >
                                                        <Trash2 />
                                                    </button>
                                                }
                                                {strKey}:
                                            </div>
                                        </TableCell>
                                        <TableCell
                                            key={row[1]}
                                            className="w-1/2 p-4"
                                        >
                                            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                                            <div
                                                className={cn("p-4", isEditable && "bg-slate-800 rounded-lg border border-indigo-500")}
                                                ref={ref => {
                                                    if (ref?.isContentEditable) {
                                                        ref.focus()
                                                    }
                                                }}
                                                onKeyDown={onKeyDown}
                                                onInput={(e) => {
                                                    setKey(strKey)
                                                    setVal(e.currentTarget.textContent || "")
                                                }}
                                                onClick={() => {
                                                    if (!setProperty) return
                                                    setEditable(strCell)
                                                }}
                                                onBlur={() => setEditable("")}
                                                contentEditable={isEditable}
                                            >
                                                {strCell}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        }
                        {
                            isAddValue &&
                            <TableRow>
                                <TableCell className="w-1/2 p-4">
                                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                                    <div
                                        className="p-4 rounded-lg bg-slate-800 focus:border focus:border-indigo-500"
                                        contentEditable
                                        onInput={(e) => setKey(e.currentTarget.textContent || "")}
                                        onKeyDown={onKeyDown}
                                    />
                                </TableCell>
                                <TableCell
                                    className="w-1/2 p-4"
                                >
                                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                                    <div
                                        className="p-4 rounded-lg bg-slate-800 focus:border focus:border-indigo-500"
                                        contentEditable
                                        onInput={(e) => setVal(e.currentTarget.textContent || "")}
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
                        type="button"
                        onClick={() => onDeleteElement()}
                    />
                }
            </div>
        </div >
    )
}