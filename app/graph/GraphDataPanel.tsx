'use client'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ElementDataDefinition, Toast, cn } from "@/lib/utils";
import { ChevronRight, MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

/* eslint-disable react/require-default-props */
interface Props {
    inSchema?: boolean;
    obj: ElementDataDefinition;
    onExpand: () => void;
    setProperty?: (key: string, newVal: string) => Promise<boolean>;
    setPropertySchema?: (key: string, newVal: string[]) => Promise<boolean>;
    removeProperty?: (key: string) => Promise<boolean>;
    onDeleteElement?: () => Promise<void>;
}

const excludedProperties = new Set(["category"]);

export default function GraphDataPanel({ inSchema, obj, onExpand, setProperty, setPropertySchema, removeProperty, onDeleteElement }: Props) {

    const [isAddValue, setIsAddValue] = useState<boolean>(false)
    const [hover, setHover] = useState<string>("")
    const [editable, setEditable] = useState<string>("")
    const [val, setVal] = useState<string>("")
    const [schemaVal, setSchemaVal] = useState<string[]>([])
    const [key, setKey] = useState<string>("")
    const addValueRef = useRef<HTMLDivElement>(null)
    const type = obj.source ? "edge" : "node"
    const [attributes, setAttributes] = useState<[string, unknown][]>(Object.entries(obj.data).filter((row) => !excludedProperties.has(row[0]) && !(row[0] === "name" && row[1] === obj.id))) 
    const [label, setLabel] = useState((type === "edge" ? obj.data.label : obj.data.category) || "label")

    useEffect(() => {
        setAttributes(Object.entries(obj.data).filter((row) => !excludedProperties.has(row[0]) && !(row[0] === "name" && row[1] === obj.id)))
        setLabel((type === "edge" ? obj.data.label : obj.data.category) || "label")
    }, [obj, type])

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

    // const onSetLabel = async (e: KeyboardEvent<HTMLParagraphElement>) => {
    //     if (!setLabel) return
    //     if (e.code === "Escape") {
    //         e.preventDefault()
    //         setLabelEditable(false)
    //     }
    //     if (e.code !== "Enter") return
    //     e.preventDefault()
    //     const success = await setLabel(newLabel)
    //     if (!success) return
    //     const ob = obj
    //     if (type === "edge") {
    //         ob.label = newLabel
    //         return
    //     }
    //     ob.category = newLabel
    // }

    return (
        <div className="DataPanel">
            <div className="w-full flex justify-between items-center bg-[#7167F6] p-4">
                <div className="flex gap-4 items-center">
                    <Button
                        variant="button"
                        icon={<ChevronRight />}
                        onClick={() => onExpand()}
                    />
                    {label}
                </div>
                <p className="flex text-white">{attributes.length} Attributes</p>
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
                            attributes.map((row, index) => {
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
                                            <div className="text-[#ACACC2] flex gap-2 items-center">
                                                {
                                                    hover === strKey &&
                                                    <Button
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