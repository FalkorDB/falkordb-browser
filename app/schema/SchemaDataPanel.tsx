/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/no-array-index-key */

"use client";

import { Check, Pencil, PlusCircle, Trash2, X } from "lucide-react";
import { SetStateAction, Dispatch, useContext, useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { prepareArg, securedFetch } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Button from "../components/ui/Button";
import { ATTRIBUTES, getDefaultAttribute, OPTIONS } from "./SchemaCreateElement";
import Combobox from "../components/ui/combobox";
import { Category, Graph, Link, Node } from "../api/graph/model";
import Input from "../components/ui/Input";
import ToastButton from "../components/ToastButton";
import DeleteElement from "../graph/DeleteElement";
import DialogComponent from "../components/DialogComponent";
import CloseDialog from "../components/CloseDialog";
import { IndicatorContext } from "../components/provider";
import PaginationList from "../components/PaginationList";
import AddLabel from "../graph/addLabel";
import RemoveLabel from "../graph/RemoveLabel";

interface Props {
    object: Node | Link
    setObject: Dispatch<SetStateAction<Node | Link | undefined>>
    onDeleteElement: () => Promise<void>;
    schema: Graph
    setCategories: (categories: Category<Node>[]) => void
}

export default function SchemaDataPanel({ object, setObject, onDeleteElement, schema, setCategories }: Props) {

    const { indicator } = useContext(IndicatorContext)

    const { data: session } = useSession()
    const { toast } = useToast()

    const [attribute, setAttribute] = useState<[string, string[]]>(getDefaultAttribute())
    const [attributes, setAttributes] = useState<[string, string[]][]>([])
    const [isRemoveLoading, setIsRemoveLoading] = useState<boolean>(false)
    const [isAddLoading, setIsAddLoading] = useState<boolean>(false)
    const [isSetLoading, setIsSetLoading] = useState<boolean>(false)
    const [isAddValue, setIsAddValue] = useState<boolean>(false)
    const [deleteOpen, setDeleteOpen] = useState<boolean>(false)
    const [editable, setEditable] = useState<string>("")
    const [selectedLabel, setSelectedLabel] = useState<string>("")
    const [label, setLabel] = useState<string[]>([])
    const [hover, setHover] = useState<string>("")
    const type = !!object.category

    const handleClose = useCallback((e?: KeyboardEvent) => {
        if (!e || e.key === "Escape") {
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
        setLabel("source" in object ? [object.label] : [...object.category])
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
                    action: isUndo && oldAttribute ? <ToastButton onClick={() => handleSetAttribute(false, oldAttribute)} /> : undefined,
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
                    action: att && <ToastButton onClick={() => handleAddAttribute(att)} />,
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

    const handleAddLabel = async (newLabel: string) => {
        const node = object as Node

        if (newLabel === "") {
            toast({
                title: "Error",
                description: "Please fill the label",
                variant: "destructive"
            })
            return false
        }

        if (label.includes(newLabel)) {
            toast({
                title: "Error",
                description: "Label already exists",
                variant: "destructive"
            })
            return false
        }

        const result = await securedFetch(`api/schema/${prepareArg(schema.Id)}/${prepareArg(object.id.toString())}/label`, {
            method: "POST",
            body: JSON.stringify({ label: newLabel })
        }, toast)

        if (result.ok) {
            setCategories([...schema.addCategory(newLabel, node, false)])
            setLabel([...node.category])
        }

        return true
    }

    const handleRemoveLabel = async (removeLabel: string) => {
        const node = object as Node

        if (removeLabel === "") {
            toast({
                title: "Error",
                description: "You cannot remove the default label",
                variant: "destructive"
            })
            return false
        }

        const result = await securedFetch(`api/schema/${prepareArg(schema.Id)}/${prepareArg(object.id.toString())}/label`, {
            method: "DELETE",
            body: JSON.stringify({ label: removeLabel })
        }, toast)

        if (result.ok) {
            schema.removeCategory(removeLabel, node, false)
            setCategories([...schema.Categories])
            setLabel([...node.category])
        }

        return true
    }

    return (
        <Dialog open>
            <DialogContent className="flex flex-col bg-foreground w-[90%] h-[90%] rounded-lg border-none gap-8 p-8" disableClose>
                <DialogHeader className="flex-row justify-between items-center border-b pb-4">
                    <div className="flex flex-col gap-2 font-medium text-xl text-nowrap">
                        <DialogTitle>ID: <span className="Gradient text-transparent bg-clip-text">{object.id}</span></DialogTitle>
                        <p data-testid="DataPanelAttributesCount">Attributes: <span className="Gradient text-transparent bg-clip-text">{Object.keys(object.data).length}</span></p>
                    </div>
                    <Button
                        onClick={() => handleClose()}
                    >
                        <X />
                    </Button>
                </DialogHeader>
                <div className="h-1 grow flex gap-8">
                    <div className="w-[40%] bg-background rounded-lg flex flex-col">
                        <PaginationList
                            className="h-1 grow"
                            label="Label"
                            list={label}
                            step={12}
                            dataTestId="attributes"
                            onClick={(l) => selectedLabel === l ? setSelectedLabel("") : setSelectedLabel(l)}
                            isSelected={(item) => item === selectedLabel}
                            afterSearchCallback={(filteredList) => {
                                if (!filteredList.includes(selectedLabel)) {
                                    setSelectedLabel("")
                                }
                            }}
                        />
                        <div className="flex gap-4 p-4 justify-between">
                            <AddLabel onAddLabel={handleAddLabel} />
                            <RemoveLabel onRemoveLabel={handleRemoveLabel} selectedLabel={selectedLabel} />
                        </div>
                    </div>
                    <div className="h-full w-[60%] flex flex-col gap-4 bg-background rounded-lg overflow-hidden">
                        <Table parentClassName="grow">
                            <TableHeader>
                                <TableRow>
                                    {
                                        (attributes.length > 0 || isAddValue) &&
                                        <>
                                            <TableHead key="buttons" />
                                            <TableHead key="Key">Key</TableHead>
                                            {
                                                ATTRIBUTES.map((att) => (
                                                    <TableHead key={att}>{att}</TableHead>
                                                ))
                                            }
                                        </>
                                    }
                                </TableRow>
                            </TableHeader>
                            <TableBody data-testid="attributesTableBody">
                                {
                                    attributes.length > 0 &&
                                    attributes.map(([key, val]) => (
                                        <TableRow
                                            className="cursor-pointer p-2"
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
                                                <div className="flex flex-col gap-2 h-[48px] w-5">
                                                    {
                                                        session?.user?.role !== "Read-Only" && (
                                                            editable === key ?
                                                                <>
                                                                    <Button
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
                                                                                title="Delete Attribute"
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
                                        </TableRow>
                                    ))
                                }
                                {
                                    isAddValue &&
                                    <TableRow key="Add Value">
                                        <TableCell>
                                            <div className="flex flex-col gap-2 h-[48px] w-5 justify-center">
                                                <Button
                                                    indicator={indicator}
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
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                        {
                            session?.user?.role !== "Read-Only" &&
                            <div className="p-4 flex justify-between gap-4">
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
                                <DeleteElement
                                    label="Schema"
                                    description={`Are you sure you want to delete this ${type ? "Node" : "Relation"}?`}
                                    open={deleteOpen}
                                    setOpen={setDeleteOpen}
                                    onDeleteElement={onDeleteElement}
                                />
                            </div>
                        }
                    </div>
                </div>
                <VisuallyHidden>
                    <DialogDescription />
                </VisuallyHidden>
            </DialogContent>
        </Dialog>
    )
}