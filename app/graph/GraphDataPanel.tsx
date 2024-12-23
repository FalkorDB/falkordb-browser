'use client'

/* eslint-disable no-param-reassign */

import { prepareArg, securedFetch, Toast } from "@/lib/utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Check, ChevronRight, MinusCircle, Pencil, PlusCircle, Trash2, X } from "lucide-react";
import { Session } from "next-auth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Graph, Link, Node } from "../api/graph/model";

/* eslint-disable react/require-default-props */
interface Props {
    obj: Node | Link;
    setObj: Dispatch<SetStateAction<Node | Link | undefined>>;
    onExpand: () => void;
    graph: Graph;
    onDeleteElement?: () => Promise<void>;
    data: Session | null;
}

export default function GraphDataPanel({ obj, setObj, onExpand, onDeleteElement, graph, data }: Props) {

    const [attributes, setAttributes] = useState<string[]>([]);
    const [editable, setEditable] = useState<string>("");
    const [hover, setHover] = useState<string>("");
    const [isAddValue, setIsAddValue] = useState<boolean>(false);
    const [newKey, setNewKey] = useState<string>("");
    const [newVal, setNewVal] = useState<string>("");
    const [label, setLabel] = useState([""]);
    const type = !("source" in obj)

    useEffect(() => {
        setAttributes(Object.keys(obj.data).filter((key) => (key !== "name" || obj.data.name !== obj.id)));
        setLabel(type ? obj.category : [obj.label]);
    }, [obj, type]);

    const setProperty = async (key: string, val: string) => {
        const { id } = obj
        const q = `MATCH ${type ? "(e)" : "()-[e]-()"} WHERE id(e) = ${id} SET e.${key} = '${val}'`
        const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok

        if (success) {
            graph.getElements().forEach(e => {
                if (e.id !== id) return
                e.data[key] = val
            })
            setObj((prev) => {
                if (!prev) return prev
                if ("source" in prev) {
                    return {
                        ...prev,
                        data: {
                            ...prev.data,
                            [key]: val
                        }
                    } as Link
                }
                return {
                    ...prev,
                    data: {
                        ...prev.data,
                        [key]: val
                    }
                } as Node
            })
            setNewVal("")
        }

        return success
    }

    const removeProperty = async (key: string) => {
        const { id } = obj
        const q = `MATCH ${type ? "(e)" : "()-[e]-()"} WHERE id(e) = ${id} SET e.${key} = NULL`
        const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok

        if (success) {
            graph.getElements().forEach((e) => {
                if (e.id !== id) return
                delete e.data[key]
            })

            const newObj = { ...obj }
            delete newObj.data[key]
            setObj(newObj)
        }

        return success
    }

    const handelAddValue = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setIsAddValue(false)
            setNewKey("")
            setNewVal("")
        }

        if (e.key !== "Enter") return

        if (!newKey || !newVal) {
            Toast("Please fill in both fields")
        }

        const success = await setProperty(newKey, newVal)
        if (!success) return
        setIsAddValue(false)
        setNewKey("")
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
                    <p>{Array.isArray(label) ? label.join(", ") : label}</p>
                </div>
                <div>
                    <p>Attributes {attributes.length}</p>
                </div>
            </div>
            <div className="grow flex flex-col justify-between p-8">
                <ul className="flex flex-col">
                    {
                        attributes.map((key) => (
                            <div
                                key={key}
                                className="flex gap-2 items-center p-4"
                                onMouseEnter={() => setHover(key)}
                                onMouseLeave={() => setHover("")}
                            >
                                <div className="w-6 h-12">
                                    {
                                        editable === key ?
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    variant="button"
                                                    icon={<Check size={20} />}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setProperty(key, newVal)
                                                        setEditable("")
                                                    }}
                                                />
                                                <Button
                                                    variant="button"
                                                    icon={<X size={20} />}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setEditable("")
                                                    }}
                                                />
                                            </div>
                                            : hover === key &&
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    icon={<Trash2 size={20} />}
                                                    variant="button"
                                                    onClick={() => {
                                                        removeProperty(key)
                                                    }}
                                                />
                                                <Button
                                                    variant="button"
                                                    icon={<Pencil size={20} />}
                                                    onClick={() => {
                                                        setEditable(key)
                                                        setNewVal(obj.data[key])
                                                    }}
                                                />
                                            </div>
                                    }
                                </div>
                                <div>
                                    <p>{key}:</p>
                                </div>
                                <div className="w-1 grow flex gap-2">
                                    {
                                        editable === key && data?.user.role !== "Read-Only" ?
                                            <Input
                                                ref={(ref) => ref?.focus()}
                                                variant="Small"
                                                value={newVal}
                                                onChange={(e) => setNewVal(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Escape") {
                                                        setEditable("")
                                                    }

                                                    if (e.key !== "Enter") return

                                                    setProperty(key, newVal)
                                                    setEditable("")
                                                }}
                                            />
                                            : <Button
                                                className="max-w-full"
                                                label={obj.data[key]?.toString()}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditable(key)
                                                    setNewVal(obj.data[key])
                                                }}
                                            />
                                    }
                                </div>
                            </div>
                        ))
                    }
                    {isAddValue && (
                        <div key="Add Value" className="w-full flex gap-2 p-4">
                            <Input
                                className="w-1/2"
                                variant="Small"
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                onKeyDown={handelAddValue}
                            />
                            <Input
                                className="w-1/2"
                                variant="Small"
                                value={newVal}
                                onChange={(e) => setNewVal(e.target.value)}
                                onBlur={() => setIsAddValue(false)}
                                onKeyDown={handelAddValue}
                            />
                        </div>
                    )}
                    <div key="Add Value Toggle" className="p-3">
                        <Button
                            variant="Secondary"
                            label="Add Value"
                            icon={isAddValue ? <MinusCircle /> : <PlusCircle />}
                            onClick={() => setIsAddValue(prev => !prev)}
                            disabled={data?.user.role === "Read-Only"}
                        />
                    </div>
                </ul>
                <div>
                    <Button
                        variant="Secondary"
                        icon={<Trash2 />}
                        label="Delete"
                        onClick={onDeleteElement}
                        disabled={data?.user.role === "Read-Only"}
                    />
                </div>
            </div>
        </div>
    )
}