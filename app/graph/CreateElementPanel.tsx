/* eslint-disable react/destructuring-assignment */

'use client'

import { Fragment, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { ArrowRight, ArrowRightLeft, Check, Info, Pencil, Plus, Trash2, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getNodeDisplayText } from "@falkordb/canvas";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Combobox from "../components/ui/combobox";
import { Node, Value } from "../api/graph/model";
import { BrowserSettingsContext, IndicatorContext } from "../components/provider";
import AddLabel from "./addLabel";
import RemoveLabel from "./RemoveLabel";
import DialogComponent from "../components/DialogComponent";
import CloseDialog from "../components/CloseDialog";

type Props =
    | {
        onCreate: (attributes: [string, Value][], labels: string[]) => Promise<boolean>;
        onClose: () => void;
        type: true;
    }
    | {
        onCreate: (attributes: [string, Value][], labels: string[]) => Promise<boolean>;
        onClose: () => void;
        selectedNodes: [Node, Node];
        setSelectedNodes: (selectedNodes: [Node, Node]) => void;
        type: false;
    };

type ValueType = "string" | "number" | "boolean"

export default function CreateElementPanel(props: Props) {
    const { onCreate, onClose, type } = props;

    const selectedNodes = !type ? props.selectedNodes : undefined;
    const setSelectedNodes = !type ? props.setSelectedNodes : undefined;

    const { indicator } = useContext(IndicatorContext)
    const { settings: { graphInfo: { displayTextPriority } } } = useContext(BrowserSettingsContext)
    const { toast } = useToast()

    const setInputRef = useRef<HTMLInputElement>(null)
    const scrollableContainerRef = useRef<HTMLDivElement>(null)

    const [attributes, setAttributes] = useState<[string, Value][]>([])
    const [newKey, setNewKey] = useState<string>("")
    const [newVal, setNewVal] = useState<Value>("")
    const [newType, setNewType] = useState<ValueType>("string")
    const [editVal, setEditVal] = useState<Value>("")
    const [editType, setEditType] = useState<ValueType>("string")
    const [labels, setLabels] = useState<string[]>([])
    const [labelsHover, setLabelsHover] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [hover, setHover] = useState<string>("")
    const [expandedAttributes, setExpandedAttributes] = useState<Record<string, boolean>>({})
    const [editable, setEditable] = useState<string>("")
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

        attributes.forEach(([key]) => {
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

    const handleClose = useCallback((e?: KeyboardEvent) => {
        if (e && e.key !== "Escape") return
        setAttributes([])
        setLabels([])
        setNewKey("")
        setNewVal("")
        setNewType("string")
        setEditVal("")
        setEditType("string")
        setEditable("")
        setHover("")
        setExpandedAttributes({})
        onClose()
    }, [onClose])

    useEffect(() => {
        window.addEventListener("keydown", handleClose)
        return () => {
            window.removeEventListener("keydown", handleClose)
        }
    }, [handleClose])

    useEffect(() => {
        if (setInputRef.current && editable) {
            setInputRef.current.focus()
        }
    }, [editable])

    const handleGetNodeTextPriority = useCallback((node: Node) => getNodeDisplayText(node, displayTextPriority), [displayTextPriority])

    const getDefaultVal = (t: ValueType): Value => {
        switch (t) {
            case "boolean":
                return false
            case "number":
                return 0
            default:
                return ""
        }
    }

    const getStringValue = (value: Value) => {
        switch (typeof value) {
            case "number":
                return String(value)
            case "boolean":
                return value ? "true" : "false"
            case "object":
                return String(value)
            default:
                return value
        }
    }

    const handleSetEditable = (key: string, value?: Value) => {
        setEditable(key)
        setEditVal(value || "")
        setEditType(typeof value === "undefined" ? "string" : typeof value as ValueType)
    }

    const handleUpdateAttribute = (oldKey: string) => {
        if (editVal === "") {
            toast({
                title: "Error",
                description: "Value cannot be empty",
                variant: "destructive"
            })
            return
        }

        setAttributes(prev => prev.map(([key, val]) =>
            key === oldKey ? [key, editVal] : [key, val]
        ))

        setEditable("")
        setEditVal("")
        setEditType("string")
        setExpandedAttributes(prev => ({
            ...prev,
            [oldKey]: false
        }))
    }

    const handleSetKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, key: string) => {
        if (e.key === "Escape") {
            e.preventDefault()
            setEditable("")
            setEditVal("")
            setEditType("string")
            return
        }

        if (e.key !== 'Enter') return

        e.preventDefault()
        handleUpdateAttribute(key)
    }

    const handleAddAttribute = () => {
        if (!newKey || newVal === "") {
            toast({
                title: "Error",
                description: "Key or value cannot be empty",
                variant: "destructive"
            })

            return
        }

        if (attributes.some(([key]) => key === newKey)) {
            toast({
                title: "Error",
                description: "An attribute with this key already exists",
                variant: "destructive"
            })

            return
        }

        setAttributes(prev => [...prev, [newKey, newVal]])
        setNewKey("")
        setNewVal("")
        setNewType("string")
    }

    const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.code === "Escape") {
            e.preventDefault()
            setNewKey("")
            setNewVal("")
            setNewType("string")
            return
        }

        if (e.key !== 'Enter') return

        e.preventDefault()
        handleAddAttribute()
    }

    const valueNeedsExpansion = (key: string) => Boolean(valueOverflowMap[key])

    const handleToggleValueExpansion = (key: string, event: ReactMouseEvent<HTMLElement> | ReactKeyboardEvent<HTMLElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setExpandedAttributes(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const getCellEditableContent = (actionType: "set" | "add" = "add", key?: string) => {
        const value = actionType === "set" ? editVal : newVal
        const valueType = actionType === "set" ? editType : newType
        const setValue = actionType === "set" ? setEditVal : setNewVal

        switch (valueType) {
            case "boolean":
                return <Switch
                    className="data-[state=unchecked]:bg-border"
                    checked={value as boolean}
                    onCheckedChange={(checked) => setValue(checked)}
                />
            case "number":
                return <Input
                    className="w-full"
                    ref={actionType === "set" ? setInputRef : undefined}
                    value={value as number}
                    onChange={(e) => {
                        const num = Number(e.target.value)
                        if (!Number.isNaN(num)) setValue(num)
                    }}
                    onKeyDown={actionType === "set" ? (e) => handleSetKeyDown(e, key!) : handleAddKeyDown}
                />
            default:
                return <Input
                    className="w-full"
                    ref={actionType === "set" ? setInputRef : undefined}
                    value={value as string}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={actionType === "set" ? (e) => handleSetKeyDown(e, key!) : handleAddKeyDown}
                />
        }
    }

    const getNewTypeInput = (actionType: "set" | "add" = "add") => {
        const valueType = actionType === "set" ? editType : newType
        const setType = actionType === "set" ? setEditType : setNewType
        const value = actionType === "set" ? editVal : newVal
        const setValue = actionType === "set" ? setEditVal : setNewVal

        return (
            <Combobox
                className="w-fit"
                inTable
                options={["string", "number", "boolean"]}
                selectedValue={valueType}
                setSelectedValue={(val) => {
                    const t = val as ValueType
                    setType(t)
                    setValue(typeof value === t ? value : getDefaultVal(t))
                }}
                label="Type"
            />
        )
    }

    const isComplexType = (value: Value) => {
        const valueType = typeof value
        return valueType !== "string" && valueType !== "number" && valueType !== "boolean"
    }

    const handleAddLabel = async (newLabel: string) => {
        if (newLabel === "") {
            toast({
                title: "Error",
                description: "Label cannot be empty",
                variant: "destructive"
            })
            return false
        }

        if (labels.includes(newLabel)) {
            toast({
                title: "Error",
                description: "Label already exists",
                variant: "destructive"
            })
            return false
        }

        // For edges, only allow one label
        if (!type && labels.length > 0) {
            toast({
                title: "Error",
                description: "Edge can only have one label",
                variant: "destructive"
            })
            return false
        }

        setLabels(prev => [...prev, newLabel])

        return true
    }

    const handleRemoveLabel = async (removeLabel: string) => {
        setLabels(prev => prev.filter(l => l !== removeLabel))

        return true
    }

    const handleOnCreate = async () => {
        if (!type) {
            if (labels.length === 0) {
                toast({
                    title: "Error",
                    description: "Edge must have a label (relationship type)",
                    variant: "destructive"
                })
                return
            }
        }

        try {
            setIsLoading(true)
            const ok = await onCreate(attributes, labels)

            if (!ok) return

            setAttributes([])
            setNewKey("")
            setNewVal("")
            setNewType("string")
            setEditVal("")
            setEditType("string")
            setLabels([])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="DataPanel p-4">
            <div className="relative flex flex-col gap-6 pb-4 border-b border-border">
                <div className="flex flex-row justify-between">
                    <div className="flex flex-col gap-2 font-medium text-xl text-nowrap">
                        <p>Attributes: <span className="Gradient text-transparent bg-clip-text">{attributes.length}</span></p>
                    </div>
                    <Button
                        className="h-fit"
                        title="Close"
                        onClick={onClose}
                    >
                        <X />
                    </Button>
                </div>
                <ul
                    className="flex flex-wrap gap-4"
                    onMouseEnter={() => setLabelsHover(true)}
                    onMouseLeave={() => setLabelsHover(false)}
                >
                    {labels.map((l) => (
                        <li
                            key={l}
                            className="flex gap-2 px-2 py-1 bg-secondary rounded-full items-center"
                        >
                            <p>{l}</p>
                            <RemoveLabel
                                onRemoveLabel={handleRemoveLabel}
                                selectedLabel={l}
                                trigger={
                                    <Button
                                        title="Remove Label"
                                    >
                                        <X size={15} />
                                    </Button>
                                }
                            />
                        </li>
                    ))}
                    <li className="h-8 w-[106px] flex justify-center items-center">
                        {
                            (type ? (labelsHover || labels.length === 0) : labels.length === 0) &&
                            <AddLabel
                                type={type ? "Label" : "Type"}
                                onAddLabel={handleAddLabel}
                                trigger={
                                    <Button
                                        className="p-2 text-nowrap text-xs justify-center border border-border rounded-full"
                                        label={`Add ${type ? "Label" : "Type"}`}
                                        title={type ? "Add a new label" : "Define the relationship type"}
                                    >
                                        <Pencil size={15} />
                                    </Button>
                                }
                            />
                        }
                    </li>
                </ul>
            </div>
            <div className="w-full h-1 grow flex flex-col justify-between items-start font-medium">
                <div ref={scrollableContainerRef} className="h-1 grow overflow-y-auto overflow-x-hidden w-full">
                    <div className="grid grid-cols-[minmax(0,max-content)_minmax(0,max-content)_minmax(0,max-content)_minmax(60px,1fr)]">
                        <div className="flex items-center font-medium text-muted-foreground px-2 border-b border-border h-10">Key</div>
                        <div className="flex items-center font-medium text-muted-foreground px-2 border-b border-border h-10">Value</div>
                        <div className="flex items-center font-medium text-muted-foreground px-2 border-b border-border h-10">Type</div>
                        <div className="flex items-center px-2 border-b border-border h-10"><div className="w-6" /></div>
                        {attributes.map(([key, value]) => {
                            const isComplex = isComplexType(value)
                            const stringValue = getStringValue(value)
                            const isExpanded = expandedAttributes[key]
                            const shouldShowToggle = valueNeedsExpansion(key)
                            const rowHeightClass = editable === key ? "py-2 min-h-14" : "py-2 min-h-10"

                            return (
                                <Fragment key={key}>
                                    <div
                                        className={cn("flex items-center px-2 border-b border-border", rowHeightClass)}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                    >
                                        <p className="w-full truncate">{key}:</p>
                                    </div>
                                    <div
                                        className={cn("flex w-full px-2 border-b border-border", rowHeightClass)}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                    >
                                        {
                                            editable === key ?
                                                getCellEditableContent("set", key)
                                                : (
                                                    <div className="flex w-full flex-col gap-1 justify-center">
                                                        <Button
                                                            className="disabled:opacity-100 disabled:cursor-default w-full justify-start"
                                                            title={isComplex ? "Complex values cannot be edited" : "Click to edit the attribute value"}
                                                            variant="button"
                                                            onClick={() => !isComplex && handleSetEditable(key, value)}
                                                            disabled={isComplex}
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
                                        className={cn("flex items-center px-2 border-b border-border", rowHeightClass)}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                    >
                                        {editable === key ? getNewTypeInput("set") : <p className="w-full truncate">{typeof value}</p>}
                                    </div>
                                    <div
                                        className={cn("flex items-center gap-1 justify-start px-2 border-b border-border", rowHeightClass)}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                    >
                                        {
                                            editable === key ?
                                                <>
                                                    <Button
                                                        variant="button"
                                                        title="Save"
                                                        onClick={() => handleUpdateAttribute(key)}
                                                    >
                                                        <Check size={20} />
                                                    </Button>
                                                    <Button
                                                        variant="button"
                                                        title="Cancel"
                                                        onClick={() => {
                                                            setEditable("")
                                                            setEditVal("")
                                                            setEditType("string")
                                                        }}
                                                    >
                                                        <X size={20} />
                                                    </Button>
                                                </>
                                                : hover === key &&
                                                <>
                                                    {isComplex ? (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info size={20} />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Complex values (arrays, objects) can only be added from Cypher queries</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    ) : (
                                                        <Button
                                                            variant="button"
                                                            title="Edit"
                                                            onClick={() => handleSetEditable(key, value)}
                                                        >
                                                            <Pencil size={20} />
                                                        </Button>
                                                    )}
                                                    <DialogComponent
                                                        trigger={
                                                            <Button
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
                                                                variant="Delete"
                                                                label="Delete"
                                                                onClick={() => setAttributes(prev => prev.filter(([k]) => k !== key))}
                                                            />
                                                            <CloseDialog
                                                                label="Cancel"
                                                                variant="Cancel"
                                                            />
                                                        </div>
                                                    </DialogComponent>
                                                </>
                                        }
                                    </div>
                                </Fragment>
                            )
                        })}
                        <div className="flex items-center px-2 border-b border-border h-14">
                            <Input
                                className="w-full"
                                placeholder="Key"
                                onKeyDown={handleAddKeyDown}
                                onChange={(e) => setNewKey(e.target.value)}
                                value={newKey}
                            />
                        </div>
                        <div className="flex items-center px-2 border-b border-border h-14">
                            {getCellEditableContent()}
                        </div>
                        <div className="flex items-center px-2 border-b border-border h-14">
                            {getNewTypeInput()}
                        </div>
                        <div className="flex items-center gap-1 justify-start px-2 border-b border-border h-14">
                            <Button
                                variant="button"
                                title="Add"
                                onClick={handleAddAttribute}
                            >
                                <Plus size={20} />
                            </Button>
                            <Button
                                variant="button"
                                title="Cancel"
                                onClick={() => {
                                    setNewKey("")
                                    setNewVal("")
                                    setNewType("string")
                                }}
                            >
                                <X size={20} />
                            </Button>
                        </div>
                        <div className="flex items-center px-2 border-b border-border h-14 opacity-50">
                            <Input
                                className="w-full"
                                placeholder="Key"
                                disabled
                            />
                        </div>
                        <div className="flex items-center px-2 border-b border-border h-14 opacity-50">
                            <Input
                                className="w-full"
                                placeholder="Value"
                                disabled
                            />
                        </div>
                        <div className="flex items-center px-2 border-b border-border h-14 opacity-50">
                            <Combobox
                                className="w-fit"
                                inTable
                                disabled
                                options={["string", "number", "boolean"]}
                                selectedValue=""
                                setSelectedValue={() => { }}
                                label="Type"
                            />
                        </div>
                        <div className="flex items-center gap-1 justify-start px-2 border-b border-border h-14 opacity-50">
                            <Button
                                variant="button"
                                title="Add"
                                disabled
                            >
                                <Plus size={20} />
                            </Button>
                            <Button
                                variant="button"
                                title="Cancel"
                                disabled
                            >
                                <X size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
                {
                    !type && selectedNodes && setSelectedNodes &&
                    <div className="w-full flex flex-col gap-2">
                        <div className="w-full flex justify-between p-4 items-center">
                            <div style={{ backgroundColor: selectedNodes[0].color }} className="flex h-16 w-16 rounded-full border-2 border-border justify-center items-center overflow-hidden">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p className="truncate">{handleGetNodeTextPriority(selectedNodes[0])}</p>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{handleGetNodeTextPriority(selectedNodes[0])}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <ArrowRight strokeWidth={1} size={30} />
                            <div style={{ backgroundColor: selectedNodes[1].color }} className="flex h-16 w-16 rounded-full border-2 border-border justify-center items-center overflow-hidden">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p className="truncate">{handleGetNodeTextPriority(selectedNodes[1])}</p>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{handleGetNodeTextPriority(selectedNodes[1])}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                        <Button
                            className="flex-col-reverse"
                            label="Swap"
                            title="Swap the order of selected nodes"
                            onClick={() => setSelectedNodes([selectedNodes[1], selectedNodes[0]])}
                        >
                            <ArrowRightLeft size={20} />
                        </Button>
                    </div>
                }
                <div className="p-4">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleOnCreate();
                    }}>
                        <Button
                            indicator={indicator}
                            label={`Create new ${type ? "node" : "edge"}`}
                            title={`Add a new ${type ? "node" : "edge"} to the graph`}
                            variant="Primary"
                            onClick={(e) => {
                                e.preventDefault();
                                handleOnCreate();
                            }}
                            isLoading={isLoading}
                        />
                    </form>
                </div>
            </div>
        </div>
    )
}