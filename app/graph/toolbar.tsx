'use client'

/* eslint-disable react/require-default-props */
/* eslint-disable react-hooks/exhaustive-deps */

import { DialogClose, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import { Link, PlusCircle, Shrink, Trash2, X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Graph } from "./model";
import Combobox from "../components/combobox";
import Button from "../components/Button";
import Input from "../components/Input";

const excludedProperties = new Set([
    "id",
    "_id",
    "color",
    "category",
    "label",
])

export default function Toolbar({ schema, chartRef, onDeleteElementGraph, onDeleteElementSchema, onAddEntityGraph, onAddRelationGraph, onAddEntitySchema, onAddRelationSchema, deleteDisable }: {
    chartRef: React.RefObject<cytoscape.Core>,
    schema?: Graph,
    onDeleteElementGraph?: () => Promise<void>,
    onAddEntityGraph?: (entityName: string[][]) => Promise<void>,
    onAddRelationGraph?: (relationName: string[][]) => Promise<void>,
    onAddEntitySchema?: () => void,
    onAddRelationSchema?: () => void,
    onDeleteElementSchema?: () => void,
    deleteDisable?: boolean,
}) {

    const [entityAttributes, setEntityAttributes] = useState<string[][]>([])
    const [relationAttributes, setRelationAttributes] = useState<string[][]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [relations, setRelations] = useState<string[]>([])
    const [category, setCategory] = useState<string>("")
    const [relation, setRelation] = useState<string>("")

    useEffect(() => {
        if (!schema) return
        setCategories(schema?.Elements.filter(element => element.data.category).map(element => element.data.category))
        setRelations(schema?.Elements.filter(element => element.data.label).map(element => element.data.label))
        setCategory(categories[0])
        setRelation(relations[0])
    }, [schema])

    useEffect(() => {
        if (!schema) return
        setEntityAttributes(Object.keys(schema.Elements.
            find(element => element.data?.category === category)?.data || {}).
            filter((key) => !excludedProperties.has(key)).map(k => [k, ""]))
    }, [category])

    useEffect(() => {
        if (!schema) return 
        setRelationAttributes(Object.keys(schema.Elements.
            find(element => element.data?.label === relation)?.data || {}).
            filter((key) => !excludedProperties.has(key)).map(k => [k, ""]))
    }, [relation])

    const handleZoomClick = (changeFactor: number) => {
        const chart = chartRef.current
        if (chart) {
            chart.zoom(chart.zoom() * changeFactor)
        }
    }

    const handleCenterClick = () => {
        const chart = chartRef.current
        if (chart) {
            chart.fit()
            chart.center()
        }
    }

    const handelCloseDialog = () => {
        setEntityAttributes([])
        setRelationAttributes([])
        setCategory("")
        setRelation("")
    }

    return (
        <div className="flex flex-row items-center gap-6">
            <div className="flex flex-row gap-8 items-center">
                {
                    onAddEntityGraph && onAddRelationGraph && onDeleteElementGraph ?
                        <div className="flex flex-row gap-4">
                            <Dialog onOpenChange={(open) => !open && handelCloseDialog()}>
                                <DialogTrigger disabled={!schema?.Id} asChild>
                                    <Button
                                        variant="Secondary"
                                        label="Add Entity"
                                        className="flex flex-row items-center gap-2"
                                        icon={<PlusCircle />}
                                    />
                                </DialogTrigger>
                                <DialogContent className="w-[25%] min-h-[40%] flex flex-col gap-4 p-0" disableClose>
                                    <DialogHeader className="h-[10%] flex flex-row justify-between items-center bg-[#272746] text-white p-8 border-b-2">
                                        <DialogTitle>Add Entity</DialogTitle>
                                        <DialogClose asChild>
                                            <button
                                                title="Close"
                                                type="button"
                                                aria-label="Close"
                                            >
                                                <X size={25} color="white" />
                                            </button>
                                        </DialogClose>
                                    </DialogHeader>
                                    <form
                                        className="grow flex flex-col gap-8 p-12"
                                        onSubmit={(e) => {
                                            e.preventDefault()
                                            onAddEntityGraph(entityAttributes)
                                        }}
                                    >
                                        <ul className="grow flex flex-col gap-6">
                                            <div className="w-fit">
                                                <Combobox
                                                    type="Category"
                                                    options={categories}
                                                    selectedValue={category}
                                                    setSelectedValue={setCategory}
                                                />
                                            </div>
                                            {
                                                entityAttributes.map((([key]) => (
                                                    <li key={key} className="flex flex-col gap-2">
                                                        <p>{key}</p>
                                                        <Input
                                                            variant="Small"
                                                            placeholder={key}
                                                            onChange={(e) => {
                                                                setEntityAttributes(prev => prev.map(row => {
                                                                    if (row[0] !== key) return row
                                                                    const r = row
                                                                    r[1] = e.target.value
                                                                    return r
                                                                }))
                                                            }}
                                                            type="text"
                                                            required
                                                        />
                                                    </li>
                                                )))
                                            }
                                        </ul>
                                        <DialogClose asChild>
                                            <Button
                                                variant="Large"
                                                label="Submit"
                                                type="submit"
                                            />
                                        </DialogClose>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            <Dialog onOpenChange={(open) => !open && handelCloseDialog()}>
                                <DialogTrigger disabled={!schema?.Id} asChild>
                                    <Button
                                        variant="Secondary"
                                        className="flex flex-row items-center gap-2"
                                        label="Add Relation"
                                        type="button"
                                        // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                        icon={<Link />}
                                    />
                                </DialogTrigger>
                                <DialogContent className="w-[25%] min-h-[40%] flex flex-col p-0" disableClose>
                                    <DialogHeader className="h-[10%] flex flex-row justify-between items-center border-b-2 bg-[#272746] text-white p-8">
                                        <DialogTitle>Add Relation</DialogTitle>
                                        <DialogClose asChild>
                                            <button
                                                title="Close"
                                                type="button"
                                                aria-label="Close"
                                            >
                                                <X size={25} color="white" />
                                            </button>
                                        </DialogClose>
                                    </DialogHeader>
                                    <form
                                        className="grow flex flex-col gap-8 p-12"
                                        onSubmit={(e) => {
                                            e.preventDefault()
                                            onAddRelationGraph(relationAttributes)
                                        }}
                                    >
                                        <ul className="grow flex flex-col gap-6">
                                            <div className="w-fit">
                                                <Combobox
                                                    type="RelationshipType"
                                                    options={relations}
                                                    selectedValue={relation}
                                                    setSelectedValue={setRelation}
                                                />
                                            </div>
                                            {
                                                relationAttributes.map((([key]) => (
                                                    <li key={key} className="flex flex-col gap-2">
                                                        <p>{key}</p>
                                                        <Input
                                                            variant="Small"
                                                            placeholder={key}
                                                            onChange={(e) => {
                                                                setEntityAttributes(prev => prev.map(row => {
                                                                    if (row[0] !== key) return row
                                                                    const r = row
                                                                    r[1] = e.target.value
                                                                    return r
                                                                }))
                                                            }}
                                                            type="text"
                                                            required
                                                        />
                                                    </li>
                                                )))
                                            }
                                        </ul>
                                        <DialogClose asChild>
                                            <Button
                                                variant="Large"
                                                label="Submit"
                                                type="submit"
                                            />
                                        </DialogClose>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            <Button
                                className="flex flex-row items-center gap-2"
                                variant="Secondary"
                                label="Delete"
                                icon={<Trash2 />}
                                onClick={onDeleteElementGraph}
                                disabled={deleteDisable}
                            />
                        </div>
                        : onAddEntitySchema && onAddRelationSchema && onDeleteElementSchema &&
                        <div className="flex flex-row gap-4">
                            <Button
                                disabled={!chartRef}
                                variant="Secondary"
                                label="Add Entity"
                                icon={<PlusCircle />}
                                onClick={onAddEntitySchema}
                            />
                            <Button
                                disabled={!chartRef}
                                variant="Secondary"
                                label="Add Relation"
                                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                icon={<Link />}
                                onClick={onAddRelationSchema}
                            />
                            <Button
                                disabled={!deleteDisable}
                                variant="Secondary"
                                label="Delete"
                                icon={<Trash2 />}
                                onClick={onDeleteElementSchema}
                            />
                        </div>
                }
                {
                    ((onAddEntitySchema && onAddRelationSchema && onDeleteElementSchema) || (onAddEntityGraph && onAddRelationGraph && onDeleteElementGraph)) &&
                    <p className="text-slate-600">|</p>
                }
                <div className="flex flex-row items-center gap-4">
                    <Button
                        disabled={!chartRef}
                        variant="Secondary"
                        label="Zoom In"
                        icon={<ZoomIn />}
                        onClick={() => handleZoomClick(1.1)}
                    />
                    <Button
                        disabled={!chartRef}
                        variant="Secondary"
                        label="Zoom Out"
                        icon={<ZoomOut />}
                        onClick={() => handleZoomClick(0.9)}
                    />
                    <Button
                        disabled={!chartRef}
                        variant="Secondary"
                        label="Fit To Size"
                        icon={<Shrink />}
                        onClick={() => handleCenterClick()}
                    />
                </div>
            </div>
        </div>
    )
}