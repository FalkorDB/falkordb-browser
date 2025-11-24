/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */

import { Check, CirclePlus, Pencil, Trash2, X } from "lucide-react"
import { cn, prepareArg, securedFetch } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Fragment, MutableRefObject, useContext, useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Switch } from "@/components/ui/switch"
import Input from "../components/ui/Input"
import DialogComponent from "../components/DialogComponent"
import CloseDialog from "../components/CloseDialog"
import { Link, Node, Value } from "../api/graph/model"
import { GraphContext, IndicatorContext, BrowserSettingsContext } from "../components/provider"
import ToastButton from "../components/ToastButton"
import Button from "../components/ui/Button"
import Combobox from "../components/ui/combobox"

type ValueType = "string" | "number" | "boolean" | "object"

interface Props {
    object: Node | Link
    type: boolean
    lastObjId: MutableRefObject<number | undefined>
    className?: string
}

export default function GraphDataTable({ object, type, lastObjId, className }: Props) {

    const { graph, graphInfo, setGraphInfo } = useContext(GraphContext)
    const { settings: { graphInfo: graphInfoSettings } } = useContext(BrowserSettingsContext)
    const { displayTextPriority } = graphInfoSettings

    const setInputRef = useRef<HTMLInputElement>(null)
    const addInputRef = useRef<HTMLInputElement>(null)
    const scrollableContainerRef = useRef<HTMLDivElement>(null)

    const [hover, setHover] = useState<string>("")
    const [editable, setEditable] = useState<string>("")
    const [isAddValue, setIsAddValue] = useState<boolean>(false)
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

    const getNodeDisplayKey = (node: Node) => {
        const { data: nodeData } = node;

        const displayText = displayTextPriority.find(({ name, ignore }) => {
            const key = ignore
                ? Object.keys(nodeData).find(
                    (k) => k.toLowerCase() === name.toLowerCase()
                )
                : name;

            return (
                key &&
                nodeData[key] &&
                typeof nodeData[key] === "string" &&
                nodeData[key].trim().length > 0
            );
        });

        if (displayText) {
            const key = displayText.ignore
                ? Object.keys(nodeData).find(
                    (k) => k.toLowerCase() === displayText.name.toLowerCase()
                )
                : displayText.name;

            if (key) {
                return key;
            }
        }

        return "id";
    }

    const getDefaultVal = (t: ValueType) => {
        switch (t) {
            case "boolean":
                return false
            case "number":
                return 0
            case "object":
                return [] as Value[]
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

                if (object.labels && getNodeDisplayKey(object as Node) === key) {
                    object.displayName = ['', '']
                }

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

                if (object.labels && getNodeDisplayKey(object as Node) === key) {
                    object.displayName = ['', ''];
                }

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

    const getCellEditableContent = (t: ValueType, actionType: "set" | "add" = "set") => {
        const dataTestId = `DataPanel${actionType === "set" ? "Set" : "Add"}AttributeValue`

        switch (t) {
            case "boolean":
                return <Switch
                    className="data-[state=unchecked]:bg-border w-full"
                    checked={newVal as boolean}
                    data-testid={dataTestId}
                    onCheckedChange={(checked) => setNewVal(checked)}
                />
            case "number":
                return <Input
                    className="w-full"
                    ref={setInputRef}
                    data-testid={dataTestId}
                    value={newVal as number}
                    onChange={(e) => Number(e.target.value) && setNewVal(Number(e.target.value))}
                    onKeyDown={actionType === "set" ? handleSetKeyDown : handleAddKeyDown}
                />
            case "object":
                return <Input
                    className="w-full"
                    ref={setInputRef}
                    data-testid={dataTestId}
                    value={String(newVal)}
                    onChange={(e) => setNewVal(e.target.value)}
                    onKeyDown={actionType === "set" ? handleSetKeyDown : handleAddKeyDown}
                />
            default:
                return <Input
                    className="w-full"
                    ref={setInputRef}
                    data-testid={dataTestId}
                    value={newVal as string}
                    onChange={(e) => setNewVal(e.target.value)}
                    onKeyDown={actionType === "set" ? handleSetKeyDown : handleAddKeyDown}
                />
        }
    }

    const getArrayType = (t: any) => t === "object" ? "array" : t
    const getObjectType = (t: any) => t === "array" ? "object" : t

    const getNewTypeInput = () => (
        <Combobox
            className="w-full"
            options={["string", "number", "boolean", "array"]}
            selectedValue={getArrayType(newType)}
            setSelectedValue={(value) => {
                const t = getObjectType(value)
                setNewType(t)

                setNewVal(typeof newVal === t ? newVal : getDefaultVal(t))
            }}
            label="Type"
        />
    )

    const getStringValue = (value: ValueType) => {
        switch (typeof value) {
            case "object":
            case "number":
                return String(value)
            case "boolean":
                return value ? "true" : "false"
            default:
                return value
        }
    }

    return (
        <div className={cn("flex flex-col gap-4 bg-background rounded-lg overflow-hidden", className)}>
            <div ref={scrollableContainerRef} className="h-1 grow overflow-y-auto overflow-x-hidden">
                <div className="grid grid-cols-[minmax(0,max-content)_minmax(0,max-content)_minmax(0,max-content)_1fr]">
                    <div className="flex items-center font-medium text-muted-foreground px-2 border-b border-border h-10">Key</div>
                    <div className="flex items-center font-medium text-muted-foreground px-2 border-b border-border h-10">Value</div>
                    <div className="flex items-center font-medium text-muted-foreground px-2 border-b border-border h-10">Type</div>
                    <div className="flex items-center px-2 border-b border-border h-10"><div className="w-6" /></div>
                    {
                        attributes.map((key) => {
                            const value = object.data[key]

                            return (
                                <Fragment key={key}>
                                    <div
                                        className={cn("flex items-center px-2 border-b border-border h-10", editable === key ? "h-14" : "h-10")}
                                        data-testid={`DataPanelAttribute${key}`}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                        key={`${key}-key`}
                                    >
                                        <p className="w-full truncate">{key}:</p>
                                    </div>
                                    <div
                                        className={cn("flex items-center px-2 border-b border-border h-10", editable === key ? "h-14" : "h-10")}
                                        data-testid={`DataPanelAttribute${value}`}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                        key={`${key}-value`}
                                    >
                                        {
                                            editable === key ?
                                                getCellEditableContent(typeof newVal as ValueType)
                                                : <Button
                                                    className="disabled:opacity-100 disabled:cursor-default w-full"
                                                    data-testid="DataPanelValueSetAttribute"
                                                    label={getStringValue(value)}
                                                    title={session?.user.role === "Read-Only" ? undefined : "Click to edit the attribute value"}
                                                    variant="button"
                                                    onClick={() => handleSetEditable(key, value)}
                                                    disabled={isAddValue || session?.user.role === "Read-Only"}
                                                />
                                        }
                                    </div>
                                    <div
                                        className={cn("flex items-center px-2 border-b border-border", editable === key ? "h-14" : "h-10")}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                        key={`${key}-type`}
                                    >
                                        {editable === key ? getNewTypeInput() : <p className="w-full truncate">{getArrayType(typeof value)}</p>}
                                    </div>
                                    <div
                                        className={cn("flex items-center gap-1 justify-start px-2 border-b border-border", editable === key ? "h-14" : "h-10")}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                        key={`${key}-actions`}
                                    >
                                        {
                                            session?.user.role !== "Read-Only" && (
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
                                </Fragment>
                            )
                        }
                        )
                    }
                    {
                        isAddValue && (
                            <>
                                <div className="flex items-center px-2 border-b border-border h-14">
                                    <Input
                                        className="w-full"
                                        data-testid="DataPanelAddAttributeKey"
                                        ref={addInputRef}
                                        value={newKey}
                                        onChange={(e) => setNewKey(e.target.value)}
                                        onKeyDown={handleAddKeyDown}
                                    />
                                </div>
                                <div className="flex items-center px-2 border-b border-border h-14">
                                    {getCellEditableContent(newType, "add")}
                                </div>
                                <div className="flex items-center px-2 border-b border-border h-14">
                                    {getNewTypeInput()}
                                </div>
                                <div className="flex items-center gap-1 justify-start px-2 border-b border-border h-14">
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
                                </div>
                            </>
                        )
                    }
                </div>
                {
                    session?.user.role !== "Read-Only" &&
                    <Button
                        className="mt-4"
                        disabled={attributes.some((key) => key === editable)}
                        variant="Primary"
                        data-testid="DataPanelAddAttribute"
                        title="Add a new attribute"
                        onClick={() => setIsAddValue(true)}
                    >
                        <CirclePlus size={20} />
                    </Button>
                }
            </div>
        </div>
    )
}

GraphDataTable.defaultProps = {
    className: undefined
}