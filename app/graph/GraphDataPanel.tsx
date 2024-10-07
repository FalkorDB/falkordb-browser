'use client'

/* eslint-disable no-param-reassign */

import { ElementDataDefinition, prepareArg, securedFetch, Toast } from "@/lib/utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ChevronRight, PlusCircle, Trash2 } from "lucide-react";
import { Session } from "next-auth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Graph } from "../api/graph/model";

/* eslint-disable react/require-default-props */
interface Props {
    obj: ElementDataDefinition;
    setObj: Dispatch<SetStateAction<ElementDataDefinition>>;
    onExpand: () => void;
    graph: Graph;
    onDeleteElement?: () => Promise<void>;
    data: Session | null;
}

const excludedProperties = new Set([
    "category",
    "color",
    "_id",
    "id",
    "label",
    "target",
    "source",
    "name",
]);

export default function GraphDataPanel({ obj, setObj, onExpand, onDeleteElement, graph, data }: Props) {

    const [attributes, setAttributes] = useState<string[]>([]);
    const [editable, setEditable] = useState<string>("");
    const [mouseEnter, setMouseEnter] = useState<string>("");
    const [isAddValue, setIsAddValue] = useState<boolean>(false);
    const [newKey, setNewKey] = useState<string>("");
    const [newVal, setNewVal] = useState<string>("");
    const [label, setLabel] = useState("");
    const type = !("source" in obj)

    useEffect(() => {
        setAttributes(Object.keys(obj).filter((key) => !excludedProperties.has(key) || (key === "name" && obj.name !== obj.id)));
        setLabel(type ? obj.category : obj.label);
    }, [obj, type]);

    const setProperty = async (key: string, val: string) => {
        const { id } = obj
        const q = `MATCH ${type ? "(e)" : "()-[e]-()"} WHERE id(e) = ${id} SET e.${key} = '${val}'`
        const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok

        if (success) {
            graph.Elements.forEach(({ data: d }) => {
                if (d.id !== id) return
                d[key] = val
            })
            setObj((prev) => ({ ...prev, [key]: val }))
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
            graph.Elements.forEach(element => {
                if (element.data.id !== id) return
                const e = element
                delete e.data[key]
            })

            const newObj = { ...obj }
            delete newObj[key]
            setObj(newObj)
        }

        return success
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
                                onMouseEnter={() => setMouseEnter(key)}
                                onMouseLeave={() => setMouseEnter("")}
                            >
                                <div>
                                    <p>{key}:</p>
                                </div>
                                <div className="w-1 grow flex gap-2">
                                    {
                                        editable === key ?
                                            <Input
                                                ref={(ref) => ref?.focus()}
                                                variant="Small"
                                                value={newVal}
                                                onChange={(e) => setNewVal(e.target.value)}
                                                onBlur={() => setEditable("")}
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
                                                label={obj[key]}
                                                onClick={() => setEditable(key)}
                                            />
                                    }
                                    {
                                        mouseEnter === key &&
                                        <Button
                                            icon={<Trash2 />}
                                            onClick={() => removeProperty(key)}
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
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                        setIsAddValue(false)
                                    }

                                    if (e.key !== "Enter") return

                                    if (!newKey || !newVal) {
                                        Toast("Please fill in both fields")
                                    }

                                    setProperty(newKey, newVal)
                                    setIsAddValue(false)
                                }}
                            />
                            <Input
                                className="w-1/2"
                                variant="Small"
                                value={newVal}
                                onChange={(e) => setNewVal(e.target.value)}
                                onBlur={() => setIsAddValue(false)}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                        setIsAddValue(false)
                                    }

                                    if (e.key !== "Enter") return

                                    if (!newKey || !newVal) {
                                        Toast("Please fill in both fields")
                                    }

                                    setProperty(newKey, newVal)
                                    setIsAddValue(false)
                                }}
                            />
                        </div>
                    )}
                    <div key="Is Add" className="p-3">
                        <Button
                            variant="Secondary"
                            label="Add Value"
                            icon={<PlusCircle />}
                            onClick={() => setIsAddValue(true)}
                            disabled={data!.user.role === "Read-Only"}
                        />
                    </div>
                </ul>
                <div>
                    <Button
                        variant="Secondary"
                        icon={<Trash2 />}
                        label="Delete"
                        onClick={onDeleteElement}
                        disabled={data!.user.role === "Read-Only"}
                    />
                </div>
            </div>
        </div>
    )
}