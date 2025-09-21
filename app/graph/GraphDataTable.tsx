/* eslint-disable no-param-reassign */
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, Pencil, Plus, Trash2, X } from "lucide-react"
import { cn, prepareArg, securedFetch } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { MutableRefObject, useContext, useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Switch } from "@/components/ui/switch"
import DeleteElement from "./DeleteElement"
import Input from "../components/ui/Input"
import DialogComponent from "../components/DialogComponent"
import CloseDialog from "../components/CloseDialog"
import { Link, Node, Value } from "../api/graph/model"
import { GraphContext, IndicatorContext } from "../components/provider"
import ToastButton from "../components/ToastButton"
import Button from "../components/ui/Button"
import Combobox from "../components/ui/combobox"

type ValueType = "string" | "number" | "boolean"

interface Props {
    object: Node | Link
    type: boolean
    onDeleteElement: () => Promise<void>
    lastObjId: MutableRefObject<number | undefined>
    className?: string
}

export default function GraphDataTable({ object, type, onDeleteElement, lastObjId, className }: Props) {

    const { graph, graphInfo, setGraphInfo } = useContext(GraphContext)

    const setInputRef = useRef<HTMLInputElement>(null)
    const addInputRef = useRef<HTMLInputElement>(null)
    const scrollableContainerRef = useRef<HTMLDivElement>(null)

    const [hover, setHover] = useState<string>("")
    const [editable, setEditable] = useState<string>("")
    const [isAddValue, setIsAddValue] = useState<boolean>(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [newKey, setNewKey] = useState<string>("")
    const [newVal, setNewVal] = useState<Value>("")
    const [newType, setNewType] = useState<ValueType>("string")
    const [isSetLoading, setIsSetLoading] = useState(false)
    const [isAddLoading, setIsAddLoading] = useState(false)
    const [isRemoveLoading, setIsRemoveLoading] = useState(false)
    const { indicator, setIndicator } = useContext(IndicatorContext)
    const { data: session } = useSession()
    const [attributes, setAttributes] = useState<string[]>([])

    useEffect(() => {
        if (setInputRef.current && editable) {
            setInputRef.current.focus()
        }
    }, [editable])

    useEffect(() => {
        if (isAddValue) {
            if (scrollableContainerRef.current) {
                setTimeout(() => {
                    scrollableContainerRef.current?.scrollTo({
                        top: scrollableContainerRef.current.scrollHeight,
                        behavior: "smooth"
                    })
                }, 0)
            }

            if (addInputRef.current) {
                addInputRef.current.focus()
            }
        }
    }, [isAddValue])

    useEffect(() => {
        if (lastObjId.current !== object.id) {
            setEditable("")
            setNewVal("")
            setNewKey("")
            setIsAddValue(false)
        }
        setAttributes(Object.keys(object.data))
    }, [lastObjId, object, setAttributes, type])

    const getDefaultVal = (t: ValueType) => {
        switch (t) {
            case "boolean":
                return false
            case "number":
                return 0
            default:
                return ""
        }
    }

    const handleSetEditable = (key: string, value?: Value) => {
        if (key !== "") {
            setIsAddValue(false)
        }

        setEditable(key)
        setNewVal(value || "")
        setNewType(typeof value === "undefined" ? "string" : typeof value as ValueType)
    }

    const setProperty = async (key: string, val: Value, isUndo: boolean, actionType: ("added" | "set") = "set") => {
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

                graphInfo.PropertyKeys = [...(graphInfo.PropertyKeys || []).filter((k) => k !== key), key];
                const graphI = graphInfo.clone();
                graph.GraphInfo = graphI
                setGraphInfo(graphI)

                object.data[key] = val
                setAttributes(Object.keys(object.data))

                handleSetEditable("")
                toast({
                    title: "Success",
                    description: `Attribute ${actionType}`,
                    variant: "default",
                    action: isUndo ?
                        <ToastButton
                            showUndo
                            onClick={() => setProperty(key, value, false)}
                        />
                        : undefined
                })
            }

            return result.ok
        } finally {
            if (actionType === "set") setIsSetLoading(false)
        }
    }

    const handleAddValue = async (key: string, value: Value) => {
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
                    action:
                        <ToastButton
                            showUndo
                            onClick={() => setProperty(key, value, false)}
                        />,
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
            e.stopPropagation()
        }

        if (e.key !== "Enter" || isAddLoading || indicator === "offline") return

        handleAddValue(newKey, newVal)
    }

    const handleSetKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            handleSetEditable("", "")
            setNewKey("")
            e.stopPropagation()
        }

        if (e.key !== "Enter" || isSetLoading || indicator === "offline") return

        setProperty(editable, newVal, true)
    }

    const handleDeleteElement = async () => {
        await onDeleteElement()
        setDeleteOpen(false)
    }

    const getCellEditableContent = (t: ValueType, actionType: "set" | "add" = "set") => {
        const dataTestId = `DataPanel${actionType === "set" ? "Set" : "Add"}AttributeValue`

        switch (t) {
            case "boolean":
                return <Switch
                    className="data-[state=unchecked]:bg-border"
                    checked={newVal as boolean}
                    data-testid={dataTestId}
                    onCheckedChange={(checked) => setNewVal(checked)}
                />
            case "number":
                return <Input
                    ref={setInputRef}
                    data-testid={dataTestId}
                    className="w-full SofiaSans"
                    value={newVal as number}
                    onChange={(e) => Number(e.target.value) && setNewVal(Number(e.target.value))}
                    onKeyDown={actionType === "set" ? handleSetKeyDown : handleAddKeyDown}
                />
            default:
                return <Input
                    ref={setInputRef}
                    data-testid={dataTestId}
                    className="w-full SofiaSans"
                    value={newVal as string}
                    onChange={(e) => setNewVal(e.target.value)}
                    onKeyDown={actionType === "set" ? handleSetKeyDown : handleAddKeyDown}
                />
        }
    }

    const getNewTypeInput = () => (
        <Combobox
            options={["string", "number", "boolean"]}
            selectedValue={newType}
            setSelectedValue={(value) => {
                setNewType(value)

                setNewVal(typeof newVal === value ? newVal : getDefaultVal(value))
            }}
            label="Type"
        />
    )

    return (
        <div className={cn("flex flex-col bg-background rounded-lg overflow-hidden", className)}>
            <Table parentRef={scrollableContainerRef} parentClassName="grow">
                <TableHeader>
                    <TableRow className="border-border">
                        <TableHead className="w-6"><div className="h-12 w-6" /></TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Type</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        attributes.map((key) => {
                            const value = object.data[key]

                            return (
                                <TableRow
                                    className="border-border"
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
                                                                onClick={() => handleSetEditable(key, value)}
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
                                                getCellEditableContent(typeof newVal as ValueType)
                                                : <Button
                                                    className="disabled:opacity-100 disabled:cursor-default SofiaSans"
                                                    data-testid="DataPanelValueSetAttribute"
                                                    label={value.toString()}
                                                    title="Click to edit the attribute value"
                                                    variant="button"
                                                    onClick={() => handleSetEditable(key, value)}
                                                    disabled={isAddValue}
                                                />
                                        }
                                    </TableCell>
                                    <TableCell>{editable === key ? getNewTypeInput() : typeof value}</TableCell>
                                </TableRow>
                            )
                        }
                        )
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
                                    ref={addInputRef}
                                    className="w-full"
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                    onKeyDown={handleAddKeyDown}
                                />
                            </TableCell>
                            <TableCell>
                                {getCellEditableContent(newType, "add")}
                            </TableCell>
                            <TableCell>
                                {getNewTypeInput()}
                            </TableCell>
                        </TableRow >
                    }
                </TableBody >
            </Table >
            <div className="flex flex-wrap justify-between gap-4 p-4">
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
                            label={`Delete ${type ? "Node" : "Relation"}`}
                        >
                            <Trash2 size={20} />
                        </Button>}
                    />
                }
            </div>
        </div>
    )
}

GraphDataTable.defaultProps = {
    className: undefined
}