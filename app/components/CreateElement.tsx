'use client'

/* eslint-disable jsx-a11y/no-static-element-interactions */

import { useEffect, useState, KeyboardEvent } from "react";
import { ChevronRight, PlusCircle, Trash2 } from "lucide-react";
import { Toast, getGraph } from "@/lib/utils";
import { EdgeDataDefinition, NodeDataDefinition } from "cytoscape";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import Button from "./Button";
import Combobox from "./combobox";
import { Graph } from "../graph/model";
import Input from "./Input";

/* eslint-disable react/require-default-props */
interface Props {
    schema?: Graph;
    graphName?: string;
    type: "node" | "edge";
    onExpand: () => void;
    onCreateElement: (obj: NodeDataDefinition | EdgeDataDefinition) => void;
}

const edgeDefaultProperties = new Set([
    "source",
    "target"
]);

const excludedProperties = new Set([
    "category",
    "color",
    "id",
    "_id",
    "label",
]);

export default function CreateElement({ schema, graphName, type, onExpand, onCreateElement }: Props) {

    const [obj, setObj] = useState<NodeDataDefinition | EdgeDataDefinition>({})
    const [createObj, setCreateObj] = useState<NodeDataDefinition | EdgeDataDefinition>({})
    const [selectedCategory, setSelectedCategory] = useState<string>("")
    const [hover, setHover] = useState<number | null>(null)
    const [categories, setCategories] = useState<string[]>([])
    const [currentSchema, setCurrentSchema] = useState<Graph>(schema || Graph.empty())
    const [editable, setEditable] = useState<string>("")
    const [val, setVal] = useState<[string, string, boolean, boolean]>(["", "", false, false])

    useEffect(() => {
        const run = async () => {
            if (schema) {
                if (type === "node") {
                    setCategories(schema.Categories.map((c) => c.name))
                } else {
                    setCategories(schema.Labels.map((l) => l.name))
                }
            } else if (graphName) {
                const s = await getGraph(`${graphName}_schema`)
                setCurrentSchema(s)
                if (type === "node") {
                    setCategories(s.Categories.map((c) => c.name))
                } else {
                    setCategories(s.Labels.map((l) => l.name))
                }
            }
        }
        run();
        setObj({})
        setCreateObj({})
        setCategories([])
        setSelectedCategory("")
    }, [graphName, schema, type])

    const formatObj = (o: NodeDataDefinition | EdgeDataDefinition) =>
        Object.entries(o).filter(([key]) => !excludedProperties.has(key))

    const handelSetSelectedValue = (value: string) => {
        setSelectedCategory(value)
        if (schema) return
        if (type === "node") {
            setObj(currentSchema.Elements.find((e) => e.data.category === value)?.data || {})
        } else {
            const newObj = currentSchema.Elements.find((e) => e.data.label === value)?.data
            if (newObj) {
                newObj.source = "int"
                newObj.target = "int"
            }
            setObj(newObj || {})
        }
    }

    const onKeyDownSchema = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.code !== "Enter") return
        if (val[0] === "" || val[1] === "") {
            Toast("Fill all fields first")
            return
        }
        setCreateObj((prev) => {
            const newObj = { ...prev }
            newObj[val[0]] = [val[1], val[2], val[3]]
            return newObj
        })
    }

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>, rowIndex: number, columnIndex: number) => {
        if (e.code === "Escape") {
            setEditable("")
            return
        }
        if (e.code !== "Enter") return
        setCreateObj((prev) => {
            const newObj = { ...prev }
            newObj[Object.keys(prev)[rowIndex]][columnIndex] = e.currentTarget.textContent || ""
            return newObj
        })
        setEditable("")
    }

    const handelCreateElement = () => {
        if (schema) {
            if (Object.keys(createObj).length === 0) {
                Toast(`${type} must have at least one attributes`)
                return
            }
        } else if (Object.keys(createObj).length !== formatObj(obj).length) {
            Toast("Fill all fields first")
            return
        }
        if (!selectedCategory) {
            Toast("Select a category first")
        }
        const updateObj = { ...createObj, category: selectedCategory }
        onCreateElement(updateObj)
    }

    return (
        <div className="Panel">
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
                    {
                        schema ?
                            <Input
                                variant="Small"
                                placeholder={type === "node" ? "Node Category" : "Relationship Type"}
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            />
                            : <Combobox
                                Small
                                options={categories}
                                setSelectedValue={handelSetSelectedValue}
                                selectedValue={selectedCategory}
                            />
                    }
                </div>
                <p className="flex flex-row text-white">{Object.keys(obj).filter((v) => !excludedProperties.has(v)).length} Attributes</p>
            </div>
            <div className="h-1 grow flex flex-col justify-between items-start">
                <Table>
                    {
                        schema &&
                        <TableHeader>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Unique</TableHead>
                            <TableHead>aaa</TableHead>
                        </TableHeader>
                    }
                    <TableBody>
                        {
                            schema &&
                            Object.entries(createObj).map(([key, value], index) => (
                                <TableRow onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)} key={key}>
                                    <TableCell>
                                        {
                                            hover === index &&
                                            <button
                                                title="Delete"
                                                type="button"
                                                onClick={() => {
                                                    setObj(prev => {
                                                        const newObj = { ...prev }
                                                        delete newObj[key]
                                                        return newObj
                                                    })
                                                }}
                                                aria-label="Delete"
                                            >
                                                <Trash2 />
                                            </button>
                                        }
                                        {key}
                                    </TableCell>
                                    <TableCell>
                                        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
                                        <div
                                            contentEditable={editable === `${index}-0`}
                                            onClick={() => setEditable(`${index}-0`)}
                                            onKeyDown={(e) => onKeyDown(e, index, 0)}
                                            onBlur={() => setEditable("")}
                                        >
                                            {value[0]}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
                                        <div
                                            contentEditable={editable === `${index}-1`}
                                            onClick={() => setEditable(`${index}-1`)}
                                            onKeyDown={(e) => onKeyDown(e, index, 1)}
                                            onBlur={() => setEditable("")}
                                        >
                                            {value[1]}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Checkbox
                                            defaultChecked={value[2]}
                                            onCheckedChange={() => setCreateObj((prev) => {
                                                const newObj = { ...prev }
                                                newObj[key][2] = !newObj[key][2]
                                                return newObj
                                            })}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Checkbox
                                            defaultChecked={value[3]}
                                            onCheckedChange={() => setCreateObj((prev) => {
                                                const newObj = { ...prev }
                                                newObj[key][2] = !newObj[key][2]
                                                return newObj
                                            })}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                        {
                            schema &&
                            <TableRow>
                                <TableCell>
                                    <Input
                                        value={val[0]}
                                        variant="Small"
                                        placeholder="Name"
                                        onChange={(e) => setVal(prev => [e.target.value, prev[1], prev[2], prev[3]])}
                                        onKeyDown={(e) => onKeyDownSchema(e)}
                                        required
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={val[1]}
                                        variant="Small"
                                        placeholder="Description"
                                        onChange={(e) => setVal(prev => [prev[0], e.target.value, prev[2], prev[3]])}
                                        required
                                    />
                                </TableCell>
                                <TableCell>
                                    <Checkbox
                                        checked={val[2]}
                                        onCheckedChange={() => setVal(prev => [prev[0], prev[1], !prev[2], prev[3]])}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Checkbox
                                        checked={val[3]}
                                        onCheckedChange={() => setVal(prev => [prev[0], prev[1], prev[2], !prev[3]])}
                                    />
                                </TableCell>
                            </TableRow>
                        }
                        {
                            graphName &&
                            formatObj(obj).map(([key, value], index) => (
                                <TableRow className="border-none" key={key}>
                                    <TableCell className="p-8">{key}:</TableCell>
                                    <TableCell className="p-6">
                                        <Input
                                            value={Object.keys(createObj).length >= index + 1 ? Object.entries(createObj).filter((row) => !excludedProperties.has(row[0]))[index][1] : undefined}
                                            variant="Small"
                                            placeholder={type === "edge" && edgeDefaultProperties.has(key) ? value : value[0]}
                                            onKeyDown={(e) => e.code === "Enter" && handelCreateElement()}
                                            onChange={(e) => setCreateObj((prev) => {
                                                const newObj = { ...prev }
                                                newObj[key] = e.target.value
                                                return newObj
                                            })}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
                <Button
                    className="m-8"
                    label={`Create ${type}`}
                    variant="Primary"
                    icon={<PlusCircle />}
                    onClick={() => handelCreateElement()}
                />
            </div>
        </div>
    )
} 