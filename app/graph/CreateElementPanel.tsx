/* eslint-disable react/destructuring-assignment */

'use client'

import { useCallback, useContext, useEffect, useState } from "react";
import { ArrowRight, ArrowRightLeft, Check, Pencil, Plus, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Combobox from "../components/ui/combobox";
import { Node, Value } from "../api/graph/model";
import { IndicatorContext } from "../components/provider";

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

type ValueType = "string" | "number" | "boolean" | "object"

export default function CreateElementPanel(props: Props) {
    const { onCreate, onClose, type } = props;

    const selectedNodes = !type ? props.selectedNodes : undefined;
    const setSelectedNodes = !type ? props.setSelectedNodes : undefined;

    const { indicator } = useContext(IndicatorContext)
    const { toast } = useToast()

    const [attributes, setAttributes] = useState<[string, Value][]>([])
    const [newKey, setNewKey] = useState<string>("")
    const [newVal, setNewVal] = useState<Value>("")
    const [newType, setNewType] = useState<ValueType>("string")
    const [labels, setLabels] = useState<string[]>([])
    const [labelsHover, setLabelsHover] = useState<boolean>(false)
    const [isAddLabel, setIsAddLabel] = useState<boolean>(false)
    const [newLabel, setNewLabel] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleClose = useCallback((e?: KeyboardEvent) => {
        if (e && e.key !== "Escape") return
        setAttributes([])
        setLabels([])
        setNewLabel("")
        setNewKey("")
        setNewVal("")
        setNewType("string")
        setIsAddLabel(false)
        onClose()
    }, [onClose])

    useEffect(() => {
        window.addEventListener("keydown", handleClose)
        return () => {
            window.removeEventListener("keydown", handleClose)
        }
    }, [handleClose])

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

    const getArrayType = (t: string) => t === "object" ? "array" : t
    const getObjectType = (t: string) => t === "array" ? "object" : t

    const getStringValue = (value: Value) => {
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

    const handleAddAttribute = () => {
        if (!newKey || newKey === "" || !newVal || newVal === "") {
            return
        }
        if (attributes.some(([key]) => key === newKey)) {
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

    const getCellEditableContent = () => {
        switch (newType) {
            case "boolean":
                return <Switch
                    className="data-[state=unchecked]:bg-border w-full"
                    checked={newVal as boolean}
                    onCheckedChange={(checked) => setNewVal(checked)}
                />
            case "number":
                return <Input
                    className="w-full"
                    value={newVal as number}
                    onChange={(e) => {
                        const num = Number(e.target.value)
                        if (!Number.isNaN(num)) setNewVal(num)
                    }}
                    onKeyDown={handleAddKeyDown}
                />
            case "object":
                return <Input
                    className="w-full"
                    value={String(newVal)}
                    onChange={(e) => setNewVal(e.target.value)}
                    onKeyDown={handleAddKeyDown}
                />
            default:
                return <Input
                    className="w-full"
                    value={newVal as string}
                    onChange={(e) => setNewVal(e.target.value)}
                    onKeyDown={handleAddKeyDown}
                />
        }
    }

    const handleAddLabel = () => {
        if (newLabel === "") {
            toast({
                title: "Error",
                description: "Label cannot be empty",
                variant: "destructive"
            })
            return
        }

        if (labels.includes(newLabel)) {
            toast({
                title: "Error",
                description: "Label already exists",
                variant: "destructive"
            })
            return
        }

        // For edges, only allow one label
        if (!type && labels.length > 0) {
            toast({
                title: "Error",
                description: "Edge can only have one label",
                variant: "destructive"
            })
            return
        }

        setLabels(prev => [...prev, newLabel])
        setNewLabel("")
        setIsAddLabel(false)
    }

    const handleRemoveLabel = (removeLabel: string) => {
        setLabels(prev => prev.filter(l => l !== removeLabel))
    }

    const handleOnCreate = async () => {
        // Validation for edges
        if (!type) {
            if (labels.length === 0) {
                toast({
                    title: "Error",
                    description: "Edge must have a label (relationship type)",
                    variant: "destructive"
                })
                return
            }

            if (!selectedNodes || !selectedNodes[0] || !selectedNodes[1]) {
                toast({
                    title: "Error",
                    description: "You must select two nodes to create an edge",
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
            setLabels([])
            setIsAddLabel(false)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="DataPanel p-4">
            <div className="relative flex flex-col gap-6 pb-4 border-b border-border">
                <Button
                    className="absolute top-0 right-0"
                    onClick={onClose}
                >
                    <X size={15} />
                </Button>
                <ul className="flex flex-wrap gap-4 min-w-[10%]" onMouseEnter={() => setLabelsHover(true)} onMouseLeave={() => setLabelsHover(false)}>
                    {labels.map((l) => (
                        <li key={l} className="flex gap-2 px-2 py-1 bg-secondary rounded-full items-center">
                            <p>{l}</p>
                            <Button
                                title="Remove"
                                onClick={() => handleRemoveLabel(l)}
                            >
                                <X size={15} />
                            </Button>
                        </li>
                    ))}
                    <li className="h-8 flex flex-wrap gap-2">
                        {
                            (type ? (labelsHover || labels.length === 0) : labels.length === 0) && !isAddLabel &&
                            <Button
                                className="p-2 text-xs justify-center border border-border"
                                variant="Secondary"
                                label="Add"
                                title={type ? "Add a new label" : "Add label for relationship"}
                                onClick={() => setIsAddLabel(true)}
                            >
                                <Pencil size={15} />
                            </Button>
                        }
                        {
                            isAddLabel &&
                            <>
                                <Input
                                    ref={ref => ref?.focus()}
                                    className="max-w-[20dvw]"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") {
                                            e.preventDefault()
                                            setIsAddLabel(false)
                                            setNewLabel("")
                                        }

                                        if (e.key !== "Enter") return

                                        e.preventDefault()
                                        handleAddLabel()
                                    }}
                                />
                                <Button
                                    className="p-2 text-xs justify-center border border-border"
                                    variant="Secondary"
                                    label="Save"
                                    title="Save the new label"
                                    onClick={() => handleAddLabel()}
                                >
                                    <Check size={15} />
                                </Button>
                                <Button
                                    className="p-2 text-xs justify-center border border-border"
                                    variant="Secondary"
                                    label="Cancel"
                                    title="Discard new label"
                                    onClick={() => {
                                        setIsAddLabel(false)
                                        setNewLabel("")
                                    }}
                                >
                                    <X size={15} />
                                </Button>
                            </>
                        }
                    </li>
                </ul>
                <p className="font-medium text-xl">{attributes.length}&ensp;Attributes</p>
            </div>
            <div className="w-full h-1 grow flex flex-col justify-between items-start font-medium">
                <div className="h-1 grow overflow-y-auto overflow-x-hidden w-full">
                    <div className="grid grid-cols-[minmax(0,max-content)_minmax(0,max-content)_minmax(0,max-content)_1fr]">
                        <div className="flex items-center font-medium text-muted-foreground px-2 border-b border-border h-10">Key</div>
                        <div className="flex items-center font-medium text-muted-foreground px-2 border-b border-border h-10">Value</div>
                        <div className="flex items-center font-medium text-muted-foreground px-2 border-b border-border h-10">Type</div>
                        <div className="flex items-center px-2 border-b border-border h-10"><div className="w-6" /></div>
                        {attributes.map(([key, value]) => (
                            <>
                                <div key={`${key}-key`} className="flex items-center px-2 border-b border-border h-10">
                                    <p className="w-full truncate">{key}:</p>
                                </div>
                                <div key={`${key}-value`} className="flex items-center px-2 border-b border-border h-10">
                                    <p className="w-full truncate">{getStringValue(value)}</p>
                                </div>
                                <div key={`${key}-type`} className="flex items-center px-2 border-b border-border h-10">
                                    <p className="w-full truncate">{getArrayType(typeof value)}</p>
                                </div>
                                <div key={`${key}-actions`} className="flex items-center gap-1 justify-start px-2 border-b border-border h-10">
                                    <Button
                                        variant="button"
                                        title="Remove"
                                        onClick={() => setAttributes(prev => prev.filter(([k]) => k !== key))}
                                    >
                                        <X size={20} />
                                    </Button>
                                </div>
                            </>
                        ))}
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
                            <Combobox
                                className="w-full"
                                options={["string", "number", "boolean", "array"]}
                                selectedValue={getArrayType(newType)}
                                setSelectedValue={(value) => {
                                    const t = getObjectType(value) as ValueType
                                    setNewType(t)
                                    setNewVal(typeof newVal === t ? newVal : getDefaultVal(t))
                                }}
                                label="Type"
                            />
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
                                disabled
                                options={["string", "number", "boolean", "array"]}
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
                                        <p className="truncate">{selectedNodes[0].labels[0] || "Node 1"}</p>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{selectedNodes[0].labels[0] || "No node selected"}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <ArrowRight strokeWidth={1} size={30} />
                            <div style={{ backgroundColor: selectedNodes[1].color }} className="flex h-16 w-16 rounded-full border-2 border-border justify-center items-center overflow-hidden">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p className="truncate">{selectedNodes[1].labels[0] || "Node 2"}</p>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{selectedNodes[1].labels[0] || "No node selected"}</p>
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