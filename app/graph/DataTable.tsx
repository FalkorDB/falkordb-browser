/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */

'use client'

import { Check, CirclePlus, Info, Pencil, Trash2, X } from "lucide-react"
import { cn, prepareArg, securedFetch, GraphRef } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Fragment, MutableRefObject, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getNodeDisplayKey } from "@falkordb/canvas"
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
    lastObjId: MutableRefObject<number | undefined>
    canvasRef: GraphRef
    className?: string
}

export default function DataTable({ object, type, lastObjId, canvasRef, className }: Props) {

    const { graph, graphInfo, setGraphInfo } = useContext(GraphContext)
    const { toast } = useToast()

    const setInputRef = useRef<HTMLInputElement>(null)
    const setTextareaRef = useRef<HTMLTextAreaElement>(null)
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
    const [expandedAttributes, setExpandedAttributes] = useState<Record<string, boolean>>({})
    const valueParagraphRefs = useRef<Record<string, HTMLParagraphElement | null>>({})
    const [valueOverflowMap, setValueOverflowMap] = useState<Record<string, boolean>>({})

    const setValueParagraphRef = useCallback((key: string) => (el: HTMLParagraphElement | null) => {
        if (!el) {
            delete valueParagraphRefs.current[key]
            return
        }
        valueParagraphRefs.current[key] = el
    }, [])

    const measureValueOverflow = useCallback(() => {
        if (typeof window === "undefined") return

        const nextMap: Record<string, boolean> = {}

        attributes.forEach((key) => {
            const element = valueParagraphRefs.current[key]
            if (!element) return

            const computedStyle = window.getComputedStyle(element)
            let lineHeight = parseFloat(computedStyle.lineHeight)

            if (Number.isNaN(lineHeight)) {
                const fontSize = parseFloat(computedStyle.fontSize)
                lineHeight = Number.isNaN(fontSize) ? 16 : fontSize * 1.2
            }

            const collapsedHeight = lineHeight * 3
            nextMap[key] = element.scrollHeight - collapsedHeight > 1
        })

        setValueOverflowMap((prev) => {
            const prevKeys = Object.keys(prev)
            const nextKeys = Object.keys(nextMap)

            if (prevKeys.length === nextKeys.length && prevKeys.every((key) => prev[key] === nextMap[key])) {
                return prev
            }

            return nextMap
        })
    }, [attributes])

    useLayoutEffect(() => {
        measureValueOverflow()
        if (typeof window === "undefined") return undefined

        window.addEventListener("resize", measureValueOverflow)
        return () => {
            window.removeEventListener("resize", measureValueOverflow)
        }
    }, [measureValueOverflow])

    useLayoutEffect(() => {
        if (typeof ResizeObserver === "undefined") return undefined
        if (!scrollableContainerRef.current) return undefined

        const observer = new ResizeObserver(() => measureValueOverflow())
        observer.observe(scrollableContainerRef.current)

        return () => {
            observer.disconnect()
        }
    }, [measureValueOverflow])

    useEffect(() => {
        if (editable) {
            if (setInputRef.current) {
                setInputRef.current.focus()
            } else if (setTextareaRef.current) {
                setTextareaRef.current.focus()
            }
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
        setExpandedAttributes({})
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

    const isComplexType = (value: Value) => {
        const valueType = typeof value
        return valueType !== "string" && valueType !== "number" && valueType !== "boolean"
    }

    const handleSetEditable = (key: string, value?: Value) => {
        if (key !== "") {
            setIsAddValue(false)
        }

        // Don't allow editing complex types
        if (value !== undefined && isComplexType(value)) {
            return
        }

        setEditable(key)
        setNewVal(value ?? "")
        setNewType(typeof value === "undefined" ? "string" : typeof value as ValueType)

        if (typeof value !== "undefined" && typeof value !== "string") return

        setTimeout(() => {
            if (setTextareaRef.current) {
                setTextareaRef.current.style.height = 'auto'
                setTextareaRef.current.style.height = `${setTextareaRef.current.scrollHeight}px`
            }
        }, 0)
    }

    const setProperty = async (key: string, val: Value, isUndo: boolean, actionType: ("added" | "set") = "set") => {
        const { id } = object
        if (val === "") {
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

                const canvas = canvasRef.current

                if (canvas) {
                    const currentData = canvas.getGraphData()

                    if (type) {
                        const canvasNode = currentData.nodes.find(n => n.id === object.id)

                        if (canvasNode) {
                            canvasNode.data[key] = val

                            if (getNodeDisplayKey(object as Node) === key) {
                                canvasNode.displayName = ["", ""]
                            }
                        }
                    } else {
                        const canvasLink = currentData.links.find(l => l.id === object.id)

                        if (canvasLink) {
                            canvasLink.data[key] = val
                        }
                    }

                    canvas.setGraphData({ ...currentData })
                }

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
        if (!key || key === "" || value === "") {
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

                const canvas = canvasRef.current

                if (canvas) {
                    const currentData = canvas.getGraphData()

                    if (type) {
                        const canvasNode = currentData.nodes.find(n => n.id === object.id)

                        if (canvasNode) {
                            delete canvasNode.data[key]

                            if (getNodeDisplayKey(object as Node) === key) {
                                canvasNode.displayName = ["", ""]
                            }
                        }
                    } else {
                        const canvasLink = currentData.links.find(l => l.id === object.id)

                        if (canvasLink) {
                            delete canvasLink.data[key]
                        }
                    }

                    canvas.setGraphData({ ...currentData })
                }

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

    const handleAddKeyDown = async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === "Escape") {
            setIsAddValue(false)
            setNewKey("")
            setNewVal("")
            e.stopPropagation()
        }

        if (e.key === "Enter" && !e.shiftKey) {
            if (isAddLoading || indicator === "offline") return
            e.preventDefault()
            handleAddValue(newKey, newVal)
        }
    }

    const handleSetKeyDown = async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === "Escape") {
            handleSetEditable("", "")
            setNewKey("")
            e.stopPropagation()
        }

        if (e.key === "Enter" && !e.shiftKey) {
            if (isSetLoading || indicator === "offline") return
            e.preventDefault()
            setProperty(editable, newVal, true)
        }
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
                    className="w-full"
                    ref={setInputRef}
                    data-testid={dataTestId}
                    value={newVal as number}
                    onChange={(e) => {
                        const num = Number(e.target.value)
                        if (!Number.isNaN(num)) setNewVal(num)
                    }}
                    onKeyDown={actionType === "set" ? handleSetKeyDown : handleAddKeyDown}
                />
            default:
                return <textarea
                    className="w-full border border-border p-1 rounded-lg disabled:cursor-not-allowed disabled:opacity-50 bg-input text-foreground resize-none overflow-hidden"
                    ref={setTextareaRef}
                    data-testid={dataTestId}
                    value={newVal as string}
                    onChange={(e) => setNewVal(e.target.value)}
                    onKeyDown={actionType === "set" ? handleSetKeyDown : handleAddKeyDown}
                    rows={1}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = 'auto'
                        target.style.height = `${target.scrollHeight}px`
                    }}
                />
        }
    }

    const getNewTypeInput = () => (
        <Combobox
            options={["string", "number", "boolean"]}
            selectedValue={newType}
            setSelectedValue={(t) => {
                setNewType(t)
                setNewVal(typeof newVal === t ? newVal : getDefaultVal(t))
            }}
            label="Type"
        />
    )

    const valueNeedsExpansion = (key: string) => Boolean(valueOverflowMap[key])

    const handleToggleValueExpansion = (key: string, event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setExpandedAttributes(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const getStringValue = (value: Value) => {
        switch (typeof value) {
            case "object":
            case "number":
                return String(value)
            case "boolean":
                return value ? "true" : "false"
            default:
                return typeof value === "undefined" ? "" : value as string
        }
    }

    return (
        <div className={cn("flex flex-col gap-4 bg-background rounded-lg overflow-hidden", className)}>
            <div ref={scrollableContainerRef} className="h-1 grow overflow-y-auto overflow-x-hidden">
                <div className="w-full grid grid-cols-[minmax(0,max-content)_minmax(0,max-content)_minmax(0,max-content)_minmax(60px,1fr)]">
                    <div className="flex items-center font-medium text-muted-foreground px-1 border-b border-border h-10">Key</div>
                    <div className="flex items-center font-medium text-muted-foreground px-1 border-b border-border h-10">Value</div>
                    <div className="flex items-center font-medium text-muted-foreground px-1 border-b border-border h-10">Type</div>
                    <div className="flex items-center px-1 border-b border-border h-10"><div className="w-6" /></div>
                    {
                        attributes.map((key) => {
                            const value = object.data[key]
                            const isComplex = isComplexType(value)
                            const stringValue = getStringValue(value)
                            const isExpanded = expandedAttributes[key]
                            const shouldShowToggle = valueNeedsExpansion(key)
                            const rowClass = cn("flex items-center px-1 py-1 border-b border-border", editable === key ? "min-h-14" : "min-h-10")
                            const buttonTitle = session?.user.role === "Read-Only" ? undefined : (isComplex && "Complex values cannot be edited") || "Click to edit the attribute value"

                            return (
                                <Fragment key={key}>
                                    <div
                                        className={rowClass}
                                        data-testid={`DataPanelAttribute${key}`}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                        key={`${key}-key`}
                                    >
                                        <p className="w-full truncate">{key}:</p>
                                    </div>
                                    <div
                                        className={rowClass}
                                        data-testid={`DataPanelAttribute${value}`}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                        key={`${key}-value`}
                                    >
                                        {
                                            editable === key ?
                                                getCellEditableContent(typeof newVal as ValueType)
                                                : (
                                                    <div className="flex w-full flex-col gap-1">
                                                        <Button
                                                            className="disabled:opacity-100 disabled:cursor-default w-full justify-start"
                                                            data-testid="DataPanelValueSetAttribute"
                                                            title={buttonTitle}
                                                            variant="button"
                                                            onClick={() => handleSetEditable(key, value)}
                                                            disabled={isAddValue || isComplex || session?.user.role === "Read-Only"}
                                                        >
                                                            <p
                                                                ref={setValueParagraphRef(key)}
                                                                className={cn(
                                                                    "w-full text-left text-sm whitespace-pre-wrap break-words",
                                                                    shouldShowToggle && !isExpanded && "line-clamp-3"
                                                                )}
                                                            >
                                                                {stringValue}
                                                            </p>
                                                        </Button>
                                                        {
                                                            shouldShowToggle && (
                                                                <span
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    className="text-xs text-primary underline cursor-pointer self-start"
                                                                    onClick={(event) => handleToggleValueExpansion(key, event)}
                                                                    onKeyDown={(event) => {
                                                                        if (event.key === "Enter" || event.key === " ") {
                                                                            handleToggleValueExpansion(key, event)
                                                                        }
                                                                    }}
                                                                >
                                                                    {isExpanded ? "Show less" : "Show more"}
                                                                </span>
                                                            )
                                                        }
                                                    </div>
                                                )
                                        }
                                    </div>
                                    <div
                                        className={rowClass}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                        key={`${key}-type`}
                                    >
                                        {editable === key ? getNewTypeInput() : <p className="w-full truncate">{typeof value}</p>}
                                    </div>
                                    <div
                                        className={rowClass}
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
                                                        {isComplex ? (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="button"
                                                                        title="Complex values can only be added from Cypher"
                                                                    >
                                                                        <Info size={20} />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Complex values (arrays, objects) can only be added from Cypher queries</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : (
                                                            <Button
                                                                data-testid="DataPanelSetAttribute"
                                                                variant="button"
                                                                title="Edit"
                                                                onClick={() => handleSetEditable(key, value)}
                                                                disabled={isAddValue}
                                                            >
                                                                <Pencil size={20} />
                                                            </Button>
                                                        )}
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
                                <div className="flex items-center px-2 border-b border-border min-h-14">
                                    <Input
                                        className="w-full"
                                        data-testid="DataPanelAddAttributeKey"
                                        ref={addInputRef}
                                        value={newKey}
                                        onChange={(e) => setNewKey(e.target.value)}
                                        onKeyDown={handleAddKeyDown}
                                    />
                                </div>
                                <div className="flex items-center px-2 border-b border-border min-h-14">
                                    {getCellEditableContent(newType, "add")}
                                </div>
                                <div className="flex items-center px-2 border-b border-border min-h-14">
                                    {getNewTypeInput()}
                                </div>
                                <div className="flex items-center gap-1 justify-start px-2 border-b border-border min-h-14">
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

DataTable.defaultProps = {
    className: undefined
}