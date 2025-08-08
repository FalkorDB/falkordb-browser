/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/no-array-index-key */

"use client";

import { Check, Pencil, PlusCircle, Trash2, X } from "lucide-react";
import { SetStateAction, Dispatch, useContext, useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { prepareArg, securedFetch } from "@/lib/utils";
import Button from "../components/ui/Button";
import { ATTRIBUTES, getDefaultAttribute, OPTIONS } from "./SchemaCreateElement";
import Combobox from "../components/ui/combobox";
import { Label, Graph, Link, Node } from "../api/graph/model";
import Input from "../components/ui/Input";
import ToastButton from "../components/ToastButton";
import DeleteElement from "../graph/DeleteElement";
import DialogComponent from "../components/DialogComponent";
import CloseDialog from "../components/CloseDialog";
import { IndicatorContext } from "../components/provider";

interface Props {
    object: Node | Link
    setObject: Dispatch<SetStateAction<Node | Link | undefined>>
    onDeleteElement: () => Promise<void>;
    schema: Graph
    setLabels: (labels: Label[]) => void
}

export default function SchemaDataPanel({ object, setObject, onDeleteElement, schema, setLabels }: Props) {

    const { indicator } = useContext(IndicatorContext)

    const { data: session } = useSession()
    const { toast } = useToast()

    const [attribute, setAttribute] = useState<[string, string[]]>(getDefaultAttribute())
    const [isRemoveLabelLoading, setIsRemoveLabelLoading] = useState<boolean>(false)
    const [attributes, setAttributes] = useState<[string, string[]][]>([])
    const [isRemoveLoading, setIsRemoveLoading] = useState<boolean>(false)
    const [labelsEditable, setLabelsEditable] = useState<boolean>(false)
    const [isLabelLoading, setIsLabelLoading] = useState<boolean>(false)
    const [isAddLoading, setIsAddLoading] = useState<boolean>(false)
    const [isSetLoading, setIsSetLoading] = useState<boolean>(false)
    const [labelsHover, setLabelsHover] = useState<boolean>(false)
    const [isAddValue, setIsAddValue] = useState<boolean>(false)
    const [deleteOpen, setDeleteOpen] = useState<boolean>(false)
    const [editable, setEditable] = useState<string>("")
    const [newLabel, setNewLabel] = useState<string>("")
    const [label, setLabel] = useState<string[]>([])
    const [hover, setHover] = useState<string>("")
    const type = !("source" in object)

    const handleClose = useCallback((e: KeyboardEvent) => {
        if (e.defaultPrevented) return

        if (e.key === "Escape") {
            setObject(undefined)
        }
    }, [setObject])

    useEffect(() => {
        window.addEventListener("keydown", handleClose)

        return () => {
            window.removeEventListener("keydown", handleClose)
        }
    }, [handleClose])

    useEffect(() => {
        setAttributes(Object.entries(object.data).filter(([key, val]) => !(key === "name" && Number(val) === object.id)).map(([key, val]) => [key, Array.isArray(val) ? val : (val as string).split(',')]))
        setLabel("source" in object ? [object.relationship] : [...object.labels])
    }, [object])

    const handleSetEditable = ([key, val]: [string, string[]] = getDefaultAttribute()) => {
        if (key !== "") {
            setIsAddValue(false)
        }

        setAttribute([key, val])
        setEditable(key)
    }

    const onSetAttribute = async (att: [string, string[]]) => {
        const { ok } = await securedFetch(`api/schema/${prepareArg(schema.Id)}/${prepareArg(object.id.toString())}/${prepareArg(att[0])}`, {
            method: "PATCH",
            body: JSON.stringify({ type, attribute: att[1] })
        }, toast)

        return ok
    }

    const handleSetAttribute = async (isUndo: boolean, att?: [string, string[]]) => {
        const newAttribute = att || attribute

        if (newAttribute[0] === "" || newAttribute[1].some(v => v === "")) {
            toast({
                title: "Error",
                description: "Please fill all the fields",
            })
            return
        }

        try {
            setIsSetLoading(true)
            const ok = await onSetAttribute(attribute)
            const oldAttribute = attributes.find(([key]) => key === newAttribute[0])

            if (ok) {
                if (type) {
                    // eslint-disable-next-line no-param-reassign
                    schema.Elements = {
                        ...schema.Elements,
                        nodes: schema.Elements.nodes.map(element =>
                            element.id === object.id ? { ...element, data: { ...element.data, [newAttribute[0]]: newAttribute[1] } } : element
                        )
                    }
                } else {
                    // eslint-disable-next-line no-param-reassign
                    schema.Elements = {
                        ...schema.Elements,
                        links: schema.Elements.links.map(element =>
                            element.id === object.id ? { ...element, data: { ...element.data, [newAttribute[0]]: newAttribute[1] } } : element
                        )
                    }
                }
                setAttributes(prev => prev.map((attr) => attr[0] === newAttribute[0] ? newAttribute : attr))
                handleSetEditable()
                toast({
                    title: "Success",
                    description: `Property set`,
                    action: isUndo && oldAttribute ?
                        <ToastButton
                            showUndo
                            onClick={() => handleSetAttribute(false, oldAttribute)}
                        />
                        : undefined,
                })
            }

        } finally {
            setIsSetLoading(false)
        }
    }

    const handleRemoveAttribute = async (key: string) => {
        try {
            setIsRemoveLoading(true)

            const { ok } = await securedFetch(`api/schema/${prepareArg(schema.Id)}/${prepareArg(object.id.toString())}/${prepareArg(key)}`, {
                method: "DELETE",
                body: JSON.stringify({ type })
            }, toast)

            if (ok) {
                const att = attributes.find(([k]) => k === key)
                if (type) {
                    // eslint-disable-next-line no-param-reassign
                    schema.Elements = {
                        ...schema.Elements,
                        nodes: schema.Elements.nodes.map(element =>
                            element.id === object.id ? { ...element, data: { ...Object.fromEntries(Object.entries(element.data).filter(([k]) => k !== key)), [key]: [] } } : element
                        )
                    }
                } else {
                    // eslint-disable-next-line no-param-reassign
                    schema.Elements = {
                        ...schema.Elements,
                        links: schema.Elements.links.map(element =>
                            element.id === object.id ? { ...element, data: { ...Object.fromEntries(Object.entries(element.data).filter(([k]) => k !== key)), [key]: [] } } : element
                        )
                    }
                }
                setAttributes(prev => prev.filter(([k]) => k !== key))
                toast({
                    title: "Success",
                    description: "Attribute removed",
                    action: att &&
                        <ToastButton
                            showUndo
                            onClick={() => handleAddAttribute(att)}
                        />,
                })
                setAttribute(getDefaultAttribute())
            }

            return ok
        } finally {
            setIsRemoveLoading(false)
        }

    }

    const handleAddAttribute = async (att?: [string, string[]]) => {
        const newAttribute = att || attribute
        if (newAttribute[0] === "" || newAttribute[1].some(v => v === "")) {
            toast({
                title: "Error",
                description: "Please fill all the fields",
                variant: "destructive"
            })
            return
        }
        try {
            setIsAddLoading(true)
            const ok = await onSetAttribute(newAttribute)
            if (ok) {
                if (type) {
                    // eslint-disable-next-line no-param-reassign
                    schema.Elements = {
                        ...schema.Elements,
                        nodes: [...schema.Elements.nodes, { ...object as Node, data: { ...object.data, [newAttribute[0]]: newAttribute[1] } }]
                    }
                } else {
                    // eslint-disable-next-line no-param-reassign
                    schema.Elements = {
                        ...schema.Elements,
                        links: [...schema.Elements.links, { ...object as Link, data: { ...object.data, [newAttribute[0]]: newAttribute[1] } }]
                    }
                }
                setAttributes(prev => [...prev, newAttribute])
                setAttribute(getDefaultAttribute())
                setIsAddValue(false)
            }
        } finally {
            setIsAddLoading(false)
        }
    }

    const handleSetKeyDown = (evt: React.KeyboardEvent) => {
        if (evt.code === "Escape") {
            evt.preventDefault()
            handleSetEditable()
        }

        if (evt.code !== "Enter" || isSetLoading || indicator === "offline") return

        evt.preventDefault()
        handleSetAttribute(true)
    }

    const handleAddKeyDown = (evt: React.KeyboardEvent) => {
        if (evt.code === "Escape") {
            evt.preventDefault()
            handleSetEditable()
        }

        if (evt.code !== "Enter" || isAddLoading || indicator === "offline") return

        evt.preventDefault()
        handleAddAttribute()
    }

    const handleAddLabel = async () => {
        const node = object as Node

        if (newLabel === "") {
            toast({
                title: "Error",
                description: "Please fill the label",
                variant: "destructive"
            })
            return
        }

        if (label.includes(newLabel)) {
            toast({
                title: "Error",
                description: "Label already exists",
                variant: "destructive"
            })
            return
        }
        try {
            setIsLabelLoading(true)

            const result = await securedFetch(`api/schema/${prepareArg(schema.Id)}/${prepareArg(object.id.toString())}/label`, {
                method: "POST",
                body: JSON.stringify({ label: newLabel })
            }, toast)

            if (result.ok) {
                setLabels([...schema.addLabel(newLabel, node, false)])
                setLabel([...node.labels])
                setNewLabel("")
                setLabelsEditable(false)
            }
        } finally {
            setIsLabelLoading(false)
        }
    }

    const handleRemoveLabel = async (removeLabel: string) => {
        const node = object as Node

        if (removeLabel === "") {
            toast({
                title: "Error",
                description: "You cannot remove the default label",
                variant: "destructive"
            })
            return
        }

        try {
            setIsRemoveLabelLoading(true)
            const result = await securedFetch(`api/schema/${prepareArg(schema.Id)}/${prepareArg(object.id.toString())}/label`, {
                method: "DELETE",
                body: JSON.stringify({ label: removeLabel })
            }, toast)

            if (result.ok) {
                schema.removeLabel(removeLabel, node, false)
                setLabels([...schema.Labels])
                setLabel([...node.labels])
            }
        } finally {
            setIsRemoveLabelLoading(false)
        }
    }

    return (
        <div className="DataPanel">
            <div className="relative w-full flex justify-between items-center p-6" id="headerDataPanel">
                <Button
                    className="absolute top-2 right-2"
                    title="Close"
                    onClick={() => setObject(undefined)}
                    data-testid="closeDataPanelButton"
                >
                    <X size={15} />
                </Button>
                <ul className="flex flex-wrap gap-4 min-w-[10%]" onMouseEnter={() => setLabelsHover(true)} onMouseLeave={() => setLabelsHover(false)}>
                    {label.map((l) => (
                        <li key={l} className="flex gap-2 px-2 py-1 bg-background rounded-full items-center">
                            <p>{l}</p>
                            {
                                type && session?.user?.role !== "Read-Only" &&
                                <Button
                                    indicator={indicator}
                                    title="Remove"
                                    onClick={() => handleRemoveLabel(l)}
                                    data-testid={`removeLabelButton${l}`}
                                    isLoading={isRemoveLabelLoading}

                                >
                                    <X size={15} />
                                </Button>
                            }
                        </li>
                    ))}
                    <li className="h-8 flex flex-wrap gap-2">
                        {
                            type && labelsHover && !labelsEditable && session?.user?.role !== "Read-Only" &&
                            <Button
                                className="p-2 text-xs justify-center border border-background"
                                variant="Secondary"
                                label="Add"
                                title="Add a new label"
                                data-testid="addLabelButton"
                                onClick={() => setLabelsEditable(true)}
                            >
                                <Pencil size={15} />
                            </Button>
                        }
                        {
                            labelsEditable &&
                            <>
                                <Input
                                    ref={ref => ref?.focus()}
                                    className="max-w-[20dvw] h-full bg-background border-none text-white"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    data-testid="newLabelInput"
                                    onKeyDown={(e) => {

                                        if (e.key === "Escape") {
                                            e.preventDefault()
                                            setLabelsEditable(false)
                                            setNewLabel("")
                                        }

                                        if (e.key !== "Enter" || isLabelLoading || indicator === "offline") return

                                        e.preventDefault()
                                        handleAddLabel()
                                    }}
                                />
                                <Button
                                    indicator={indicator}
                                    className="p-2 text-xs justify-center border border-background"
                                    variant="Secondary"
                                    label="Save"
                                    title="Save the new label"
                                    data-testid="saveLabelButton"
                                    onClick={() => handleAddLabel()}
                                    isLoading={isLabelLoading}
                                >
                                    <Check size={15} />
                                </Button>
                                {
                                    !isLabelLoading &&
                                    <Button
                                        className="p-2 text-xs justify-center border border-background"
                                        variant="Secondary"
                                        label="Cancel"
                                        title="Discard the new label"
                                        data-testid="cancelLabelButton"
                                        onClick={() => {
                                            setLabelsEditable(false)
                                            setNewLabel("")
                                        }}
                                    >
                                        <X size={15} />
                                    </Button>
                                }
                            </>
                        }
                    </li>
                </ul>
                <p className="font-medium text-xl" data-testid="DataPanelAttributesCount">{attributes.length}&ensp;Attributes</p>
            </div>
            <Table parentClassName="grow">
                <TableHeader>
                    <TableRow>
                        {
                            (attributes.length > 0 || isAddValue) &&
                            <>
                                <TableHead key="Key">Key</TableHead>
                                {
                                    ATTRIBUTES.map((att) => (
                                        <TableHead key={att}>{att}</TableHead>
                                    ))
                                }
                                <TableHead key="buttons" />
                            </>
                        }
                    </TableRow>
                </TableHeader>
                <TableBody data-testid="attributesTableBody">
                    {
                        attributes.length > 0 &&
                        attributes.map(([key, val]) => (
                            <TableRow
                                className="cursor-pointer p-2 h-20"
                                onClick={() => {
                                    if (editable === key) return
                                    handleSetEditable([key, [...val]])
                                }}
                                // onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && handleSetEditable()}
                                onMouseEnter={() => setHover(key)}
                                onMouseLeave={() => setHover("")}
                                key={key}
                                tabIndex={0} // Added to make the row focusable
                            >
                                <TableCell>
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
                                                    label="Type"
                                                    selectedValue={attribute[1][0]}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    className="w-full"
                                                    onKeyDown={handleSetKeyDown}
                                                    onChange={(e) => setAttribute(prev => {
                                                        const p: [string, string[]] = [...prev]
                                                        p[1][1] = e.target.value
                                                        return p
                                                    })}
                                                    value={attribute[1][1]}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    className="border-[#57577B]"
                                                    onCheckedChange={(checked) => setAttribute(prev => {
                                                        const p: [string, string[]] = [...prev]
                                                        p[1][2] = checked ? "true" : "false"
                                                        return p
                                                    })}
                                                    checked={attribute[1][2] === "true"}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    className="border-[#57577B]"
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
                                <TableCell>
                                    <div className="flex gap-2 w-44">
                                        {
                                            session?.user?.role !== "Read-Only" && (
                                                editable === key ?
                                                    <>
                                                        <Button
                                                            className="p-2 justify-center border border-foreground"
                                                            variant="Secondary"
                                                            label="Save"
                                                            title="Save the attribute changes"
                                                            data-testid="saveEditAttributeButton"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleSetAttribute(true)
                                                            }}
                                                            isLoading={isSetLoading}
                                                        >
                                                            <Check size={20} />
                                                        </Button>
                                                        {
                                                            !isSetLoading &&
                                                            <Button
                                                                className="p-2 justify-center border border-foreground"
                                                                variant="Secondary"
                                                                label="Cancel"
                                                                title="Discard the attribute changes"
                                                                data-testid="cancelEditAttributeButton"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleSetEditable()

                                                                }}
                                                            >
                                                                <X size={20} />
                                                            </Button>
                                                        }
                                                    </>
                                                    : hover === key &&
                                                    <>
                                                        <DialogComponent
                                                            trigger={
                                                                <Button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                    }}
                                                                    variant="button"
                                                                    title="Delete Attribute"
                                                                    label="Delete"
                                                                    data-testid="removeAttributeButton"
                                                                >
                                                                    <Trash2 size={20} />
                                                                </Button>
                                                            }
                                                            title="Delete Attribute"
                                                            description="Are you sure you want to delete this attribute?"
                                                        >
                                                            <div className="flex justify-end gap-4">
                                                                <Button
                                                                    variant="Primary"
                                                                    label="Delete"
                                                                    title="Confirm the deletion of the attribute"
                                                                    data-testid="confirmRemoveAttributeButton"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleRemoveAttribute(key)
                                                                    }}
                                                                    isLoading={isRemoveLoading}
                                                                />
                                                                {
                                                                    !isRemoveLoading &&
                                                                    <CloseDialog
                                                                        label="Cancel"
                                                                        variant="Cancel"
                                                                    />
                                                                }
                                                            </div>
                                                        </DialogComponent>
                                                        <Button
                                                            disabled={isAddValue}
                                                            className="p-2 justify-center border border-foreground"
                                                            variant="Secondary"
                                                            label="Edit"
                                                            title="Modify this attribute"
                                                            data-testid="editAttributeButton"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleSetEditable([key, [...val]])
                                                            }}
                                                        >
                                                            <Pencil size={20} />
                                                        </Button>
                                                    </>
                                            )
                                        }
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                    {
                        isAddValue &&
                        <TableRow key="Add Value">
                            <TableCell>
                                <Input
                                    className="w-full"
                                    onKeyDown={handleAddKeyDown}
                                    data-testid="addAttributeKeyInput"
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
                                    label="Type"
                                    selectedValue={attribute[1][0]}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    className="w-full"
                                    onKeyDown={handleAddKeyDown}
                                    data-testid="addAttributeValueInput"
                                    onChange={(e) => setAttribute(prev => {
                                        const p: [string, string[]] = [...prev]
                                        p[1][1] = e.target.value
                                        return p
                                    })}
                                    value={attribute[1][1]}
                                />
                            </TableCell>
                            <TableCell>
                                <Switch
                                    className="border-[#57577B]"
                                    onCheckedChange={(checked) => setAttribute(prev => {
                                        const p: [string, string[]] = [...prev]
                                        p[1][2] = checked ? "true" : "false"
                                        return p
                                    })}
                                    checked={attribute[1][2] === "true"}
                                />
                            </TableCell>
                            <TableCell>
                                <Switch
                                    className="border-[#57577B]"
                                    onCheckedChange={(checked) => setAttribute(prev => {
                                        const p: [string, string[]] = [...prev]
                                        p[1][3] = checked ? "true" : "false"
                                        return p
                                    })}
                                    checked={attribute[1][3] === "true"}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2 w-44">
                                    <Button
                                        indicator={indicator}
                                        className="p-2 justify-center border border-foreground"
                                        variant="Secondary"
                                        label="Save"
                                        title="Save the new attribute"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleAddAttribute()
                                        }}
                                        isLoading={isAddLoading}
                                        data-testid="saveAddValueButton"
                                    >
                                        <Check size={20} />
                                    </Button>
                                    <Button
                                        className="p-2 justify-center border border-foreground"
                                        variant="Secondary"
                                        label="Cancel"
                                        title="Discard the new attribute"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleSetEditable()
                                            setIsAddValue(false)
                                        }}
                                        data-testid="cancelAddValueButton"
                                    >
                                        <X size={20} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    }
                </TableBody>
                <TableCaption>
                    {
                        session?.user?.role !== "Read-Only" &&
                        <Button
                            disabled={attributes.some(att => att[0] === editable)}
                            variant="Primary"
                            label="Add Value"
                            title="Add a new attribute"
                            data-testid="addValueButton"
                            onClick={() => setIsAddValue(true)}
                        >
                            <PlusCircle size={20} />
                        </Button>
                    }
                </TableCaption>
            </Table>
            <div className="p-8 flex justify-end">
                {
                    session?.user.role !== "Read-Only" &&
                    <DeleteElement
                        label="Schema"
                        description={`Are you sure you want to delete this ${type ? "Node" : "Relation"}?`}
                        open={deleteOpen}
                        setOpen={setDeleteOpen}
                        onDeleteElement={onDeleteElement}
                    />
                }
            </div>
        </div>
    )
}