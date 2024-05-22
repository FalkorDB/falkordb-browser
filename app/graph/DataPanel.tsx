import { Table, TableBody, TableCaption, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EdgeDataDefinition, NodeDataDefinition } from "cytoscape";
import { ChevronRight, Plus, X } from "lucide-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

interface Props {
    obj: NodeDataDefinition | EdgeDataDefinition;
    onExpand: () => void;
    setProperty: (key: string, newVal: string) => Promise<boolean>;
    removeProperty: (key: string) => Promise<boolean>;
    onDeleteElement: () => Promise<void>;
}

const excludedProperties = new Set([
    "category",
    "color",
    "_id",
    "label",
    "target",
    "source"
]);

export default function DataPanel({ obj, onExpand, setProperty, removeProperty, onDeleteElement }: Props) {

    const [isAddValue, setIsAddValue] = useState<boolean>(false)
    const [hover, setHover] = useState<string>("")
    const [editable, setEditable] = useState<string>("")
    const [labelEditable, setLabelEditable] = useState<boolean>(false)
    const [val, setVal] = useState<string>("")
    const [key, setKey] = useState<string>("")
    const cellRef = useRef<HTMLDivElement>(null)
    const labelRef = useRef<HTMLDivElement>(null)
    const label = obj?.category ? obj.category : obj?.label || "label"


    const onKeyDown = async (e: KeyboardEvent<HTMLTableCellElement>) => {
        if (e.code === "Escape") {
            e.preventDefault()
            setEditable("")
            setIsAddValue(false)
        }
        if (e.code !== "Enter") return
        e.preventDefault()
        if (!val) return
        const success = await setProperty(key, val)
        if (!success) return
        const ob = obj
        ob[key] = val
        setVal("")
        setKey("")
    }

    const onDelete = async (k: string) => {
        const success = await removeProperty(k)
        if (!success) return
        const ob = obj
        delete ob[k]
    }

    const onSetLabel = (e: KeyboardEvent<HTMLParagraphElement>) => {
        if (e.code === "Escape") {
            e.preventDefault()
            setLabelEditable(false)
        }
        // if (e.code !== "Enter") return
    }

    useEffect(() => {
        if (!labelEditable || !labelRef.current) return
        labelRef.current.focus()
    }, [labelEditable])

    return (
        <div className="h-full w-full flex flex-col shadow-lg">
            <div className="w-full flex flex-row justify-between items-center bg-indigo-600 p-4">
                <div className="flex flex-row gap-4 items-center">
                    <button
                        title="Close"
                        type="button"
                        onClick={() => onExpand()}
                        aria-label="Close"
                    >
                        <ChevronRight color="white" className="border border-white rounded-md" />
                    </button>
                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                    <div
                        ref={labelRef}
                        className={cn("text-white py-1 px-2", labelEditable && "bg-white border-gray-200 text-black")}
                        onClick={() => label === "label" && setLabelEditable(true)}
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
                <Table parentClassName="w-full">
                    <TableCaption className="mt-8">
                        <button
                            className="flex flex-row gap-2 text-indigo-600"
                            title="Add Attribute"
                            type="button"
                            onClick={() => setIsAddValue(prev => !prev)}
                        >
                            <Plus size={20} />
                            <p>Add Attribute</p>
                        </button>
                    </TableCaption>
                    <TableBody>
                        {
                            Object.entries(obj).filter((row) => !excludedProperties.has(row[0])).map((row, index) => (
                                <TableRow
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={index}
                                    className="border-none"
                                    onMouseEnter={() => {
                                        setHover(row[0])
                                    }}
                                    onMouseLeave={() => {
                                        setHover("")
                                    }}
                                >
                                    {
                                        Object.values(row).map((cell, cellIndex) => {
                                            const strCell = JSON.parse(JSON.stringify(cell))
                                            const strKey = JSON.parse(JSON.stringify(row[0]))
                                            const isEditable = editable === strCell && !!setProperty && cellIndex === 1 && strKey !== "id"
                                            const text: string = cellIndex === 0 ?
                                                `${strCell}:`
                                                : strCell
                                            if (isEditable) {
                                                cellRef.current?.focus()
                                            }
                                            return (
                                                <TableCell
                                                    ref={cellRef}
                                                    onKeyDown={onKeyDown}
                                                    // eslint-disable-next-line react/no-array-index-key
                                                    key={cellIndex}
                                                    onInput={(e) => {
                                                        setKey(strKey)
                                                        setVal(e.currentTarget.textContent || "")
                                                    }}
                                                    onClick={() => cellIndex === 1 && setEditable(strCell)}
                                                    onBlur={() => cellIndex === 1 && setVal("")}
                                                    contentEditable={isEditable}
                                                    className={cn(
                                                        " w-1/2",
                                                        cellIndex === 0 && "text-gray-800 opacity-75 flex flex-row gap-2 items-center",
                                                        isEditable && "border border-gray-200"
                                                    )}
                                                >
                                                    {
                                                        strCell !== "id" && hover === strCell && cellIndex === 0 &&
                                                        <button
                                                            title="Delete"
                                                            type="button"
                                                            aria-label="delete"
                                                            onClick={() => onDelete(strCell)}
                                                        >
                                                            <X size={15} color="black" />
                                                        </button>
                                                    }
                                                    {text}
                                                </TableCell>
                                            )
                                        })
                                    }
                                </TableRow>
                            ))
                        }
                        {
                            isAddValue &&
                            <TableRow>
                                <TableCell
                                    className="w-1/2 text-gray-800 opacity-75 border border-gray-200"
                                    contentEditable
                                    onInput={(e) => setKey(e.currentTarget.textContent || "")}
                                    onKeyDown={onKeyDown}
                                />
                                <TableCell
                                    className="w-1/2 border border-gray-200"
                                    contentEditable
                                    onInput={(e) => setVal(e.currentTarget.textContent || "")}
                                    onKeyDown={onKeyDown}
                                />
                            </TableRow>
                        }
                    </TableBody>
                </Table>
                <button
                    className="p-8"
                    title=""
                    type="button"
                    onClick={() => onDeleteElement()}
                >
                    <p>Delete</p>
                </button>
            </div>
        </div >
    )
}