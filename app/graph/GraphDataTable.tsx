/* eslint-disable no-param-reassign */
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, Pencil, Plus, Trash2, X } from "lucide-react"
import { prepareArg, securedFetch } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { MutableRefObject, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import DeleteElement from "./DeleteElement"
import Input from "../components/ui/Input"
import DialogComponent from "../components/DialogComponent"
import CloseDialog from "../components/CloseDialog"
import { Graph, Link, Node } from "../api/graph/model"
import { IndicatorContext } from "../components/provider"
import ToastButton from "../components/ToastButton"
import Button from "../components/ui/Button"

interface Props {
    graph: Graph
    object: Node | Link
    type: boolean
    onDeleteElement: () => Promise<void>
    lastObjId: MutableRefObject<number | undefined>
}

export default function GraphDataTable({ graph, object, type, onDeleteElement, lastObjId }: Props) {
    const [hover, setHover] = useState<string>("")
    const [editable, setEditable] = useState<string>("")
    const [isAddValue, setIsAddValue] = useState<boolean>(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [newKey, setNewKey] = useState<string>("")
    const [newVal, setNewVal] = useState<string>("")
    const [isSetLoading, setIsSetLoading] = useState(false)
    const [isAddLoading, setIsAddLoading] = useState(false)
    const [isRemoveLoading, setIsRemoveLoading] = useState(false)
    const { indicator, setIndicator } = useContext(IndicatorContext)
    const { data: session } = useSession()
    const [attributes, setAttributes] = useState<string[]>(Object.keys(object.data))

    useEffect(() => {
        if (lastObjId.current !== object.id) {
            setEditable("")
            setNewVal("")
            setNewKey("")
            setIsAddValue(false)
        }
        setAttributes(Object.keys(object.data))
    }, [lastObjId, object, setAttributes, type])

    const handleSetEditable = (key: string, val: string) => {
        if (key !== "") {
            setIsAddValue(false)
        }

        setEditable(key)
        setNewVal(val)
    }

    const setProperty = async (key: string, val: string, isUndo: boolean, actionType: ("added" | "set") = "set") => {
        const { id } = object
        if (!val || val === "") {
            toast({
                title: "Error",
                description: "Please fill in the value field",
                variant: "destructive"
            })
            return false
        }
        try {
            if (actionType === "set") setIsSetLoading(true)
            const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${id}/${key}`, {
                method: "POST",
                body: JSON.stringify({
                    value: val,
                    type
                })
            }, toast, setIndicator)

            if (result.ok) {
                const value = object.data[key]

                graph.setProperty(key, val, id, type)
                object.data[key] = val
                setAttributes(Object.keys(object.data))

                handleSetEditable("", "")
                toast({
                    title: "Success",
                    description: `Attribute ${actionType}`,
                    variant: "default",
                    action: isUndo ? <ToastButton onClick={() => setProperty(key, value, false)} /> : undefined
                })
            }

            return result.ok
        } finally {
            if (actionType === "set") setIsSetLoading(false)
        }
    }

    const handleAddValue = async (key: string, value: string) => {
        if (!key || key === "" || !value || value === "") {
            toast({
                title: "Error",
                description: "Please fill in both fields",
                variant: "destructive"
            })
            return
        }
        try {
            setIsAddLoading(true)
            const success = await setProperty(key, value, false, "added")
            if (!success) return
            setIsAddValue(false)
            setNewKey("")
            setNewVal("")
        } finally {
            setIsAddLoading(false)
        }
    }

    const removeProperty = async (key: string) => {
        try {
            setIsRemoveLoading(true)
            const { id } = object
            const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/${id}/${key}`, {
                method: "DELETE",
                body: JSON.stringify({ type }),
            }, toast, setIndicator)).ok

            if (success) {
                const value = object.data[key]

                graph.removeProperty(key, id, type)
                delete object.data[key]
                setAttributes(Object.keys(object.data))

                toast({
                    title: "Success",
                    description: "Attribute removed",
                    action: <ToastButton onClick={() => handleAddValue(key, value)} />,
                    variant: "default"
                })
            }

            return success
        } finally {
            setIsRemoveLoading(false)
        }
    }

    const handleAddKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setIsAddValue(false)
            setNewKey("")
            setNewVal("")
            return
        }

        if (e.key !== "Enter" || isAddLoading || indicator === "offline") return

        handleAddValue(newKey, newVal)
    }

    const handleSetKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            handleSetEditable("", "")
            setNewKey("")
        }

        if (e.key !== "Enter" || isSetLoading || indicator === "offline") return

        setProperty(editable, newVal, true)
    }

    const handleDeleteElement = async () => {
        await onDeleteElement()
        setDeleteOpen(false)
    }

    return (
        <>
            <Table parentClassName="grow">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-6"><div className="h-12 w-6" /></TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        attributes.map((key) => (
                            <TableRow
                                data-testid={`DataPanelAttribute${key}`}
                                onMouseEnter={() => setHover(key)}
                                onMouseLeave={() => setHover("")}
                                key={key}
                            >
                                <TableCell>
                                    <div className="h-12 w-6 flex flex-col items-center gap-2 justify-center">
                                        {
                                            session?.user?.role !== "Read-Only" && (
                                                editable === key ?
                                                    <>
                                                        <Button
                                                            data-testid="DataPanelSetAttributeConfirm"
                                                            indicator={indicator}
                                                            variant="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setProperty(key, newVal, true)
                                                            }}
                                                            isLoading={isSetLoading}
                                                        >
                                                            <Check size={20} />
                                                        </Button>
                                                        {
                                                            !isSetLoading &&
                                                            <Button
                                                                data-testid="DataPanelSetAttributeCancel"
                                                                variant="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleSetEditable("", "")
                                                                }}
                                                            >
                                                                <X size={20} />
                                                            </Button>
                                                        }
                                                    </>
                                                    : hover === key &&
                                                    <>
                                                        <Button
                                                            data-testid="DataPanelSetAttribute"
                                                            variant="button"
                                                            onClick={() => handleSetEditable(key, object.data[key])}
                                                            disabled={isAddValue}
                                                        >
                                                            <Pencil size={20} />
                                                        </Button>
                                                        <DialogComponent
                                                            trigger={
                                                                <Button
                                                                    data-testid="DataPanelDeleteAttribute"
                                                                    variant="button"
                                                                    title="Delete Attribute"
                                                                >
                                                                    <Trash2 size={20} />
                                                                </Button>
                                                            }
                                                            title="Delete Attribute"
                                                            description="Are you sure you want to delete this attribute?"
                                                        >
                                                            <div className="flex justify-end gap-4">
                                                                <Button
                                                                    data-testid="DataPanelDeleteAttributeConfirm"
                                                                    variant="Delete"
                                                                    label="Delete"
                                                                    onClick={() => removeProperty(key)}
                                                                    isLoading={isRemoveLoading}
                                                                />
                                                                <CloseDialog
                                                                    data-testid="DataPanelDeleteAttributeCancel"
                                                                    label="Cancel"
                                                                    variant="Cancel"
                                                                />
                                                            </div>
                                                        </DialogComponent>
                                                    </>
                                            )
                                        }
                                    </div>
                                </TableCell>
                                <TableCell>{key}:</TableCell>
                                <TableCell>
                                    {
                                        editable === key ?
                                            <Input
                                                data-testid="DataPanelSetAttributeInput"
                                                className="w-full"
                                                value={newVal}
                                                onChange={(e) => setNewVal(e.target.value)}
                                                onKeyDown={handleSetKeyDown}
                                            />
                                            : <Button
                                                data-testid="DataPanelValueSetAttribute"
                                                label={object.data[key]}
                                                title="Click to edit the attribute value"
                                                variant="button"
                                                onClick={() => handleSetEditable(key, object.data[key])}
                                            />
                                    }
                                </TableCell>
                            </TableRow>
                        ))
                    }
                    {
                        isAddValue &&
                        <TableRow>
                            <TableCell className="flex flex-col items-center gap-2">
                                <Button
                                    data-testid="DataPanelAddAttributeConfirm"
                                    variant="button"
                                    title="Save"
                                    onClick={() => handleAddValue(newKey, newVal)}
                                    isLoading={isAddLoading}
                                    indicator={indicator}
                                >
                                    <Check size={20} />
                                </Button>
                                {
                                    !isAddLoading &&
                                    <Button
                                        data-testid="DataPanelAddAttributeCancel"
                                        variant="button"
                                        onClick={() => setIsAddValue(false)}
                                        title="Cancel"
                                    >
                                        <X size={20} />
                                    </Button>
                                }
                            </TableCell >
                            <TableCell>
                                <Input
                                    data-testid="DataPanelAddAttributeKey"
                                    ref={ref => !newKey ? ref?.focus() : undefined}
                                    className="w-full"
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                    onKeyDown={handleAddKeyDown}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    data-testid="DataPanelAddAttributeValue"
                                    className="w-full"
                                    value={newVal}
                                    onChange={(e) => setNewVal(e.target.value)}
                                    onKeyDown={handleAddKeyDown}
                                />
                            </TableCell>
                        </TableRow >
                    }
                </TableBody >
            </Table >
            <div className="flex justify-between p-4">
                {
                    session?.user?.role !== "Read-Only" &&
                    <Button
                        disabled={attributes.some((key) => key === editable)}
                        variant="Primary"
                        data-testid="DataPanelAddAttribute"
                        label="Add Attribute"
                        title="Add a new attribute"
                        onClick={() => setIsAddValue(true)}
                    >
                        <Plus size={20} />
                    </Button>
                }
                {
                    session?.user?.role !== "Read-Only" &&
                    <DeleteElement
                        description={`Are you sure you want to delete this ${type ? "Node" : "Relation"}?`}
                        open={deleteOpen}
                        setOpen={setDeleteOpen}
                        onDeleteElement={handleDeleteElement}
                        trigger={<Button
                            data-testid={`delete${type ? "Node" : "Relation"}`}
                            variant="Delete"
                            title="Delete Element"
                        >
                            <Trash2 size={20} />
                        </Button>}
                    />
                }
            </div>
        </>
    )
}