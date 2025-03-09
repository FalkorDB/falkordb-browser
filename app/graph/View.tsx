/* eslint-disable no-param-reassign */

import { Check, ChevronDown, ChevronUp, FileCheck2, Pencil, PlusCircle, RotateCcw, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { cn, rgbToHSL } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { DEFAULT_COLORS, Graph } from "../api/graph/model"
import Button from "../components/ui/Button"
import DialogComponent from "../components/DialogComponent"

export default function View({ graph, setGraph, selectedValue }: {
    graph: Graph,
    setGraph: (graph: Graph) => void,
    selectedValue: string
}) {
    const [colorsArr, setColorsArr] = useState<string[]>(graph.Colors)
    const [newColor, setNewColor] = useState<string>("")
    const [hover, setHover] = useState<string>("")
    const [editable, setEditable] = useState<string>("")
    const [isAddColor, setIsAddColor] = useState<boolean>(false)
    const { toast } = useToast()

    const handlePreferencesChange = (colors?: string[]) => {
        setGraph(Graph.create(graph.Id, { data: graph.Data, metadata: graph.Metadata }, false, true, colors || colorsArr))
        if (colors) {
            localStorage.removeItem(graph.Id)
        } else {
            localStorage.setItem(graph.Id, JSON.stringify(colorsArr));
        }
    }

    useEffect(() => {
        setColorsArr(graph.Colors)
    }, [graph.Colors])

    const handleAddColor = () => {
        setColorsArr(prev => [...prev, newColor])
        setNewColor("");
        setIsAddColor(false)
        toast({
            title: "Color added",
            description: "The color has been added to the list",
        })
    }

    const handleEditColor = () => {
        setColorsArr(prev => [...prev.map(color => color === editable ? newColor : color)])
        setNewColor("");
        setEditable("");
        toast({
            title: "Color set",
            description: "The color has been set",
        })
    }

    const handleCancelEditColor = () => {
        setNewColor("");
        setEditable("");
    }

    const handleCancelAddColor = () => {
        setNewColor("");
        setIsAddColor(false)
    }

    return (
        <DialogComponent
            onOpenChange={(o) => !o && setColorsArr(graph.Colors)}
            trigger={
                <Button
                    label="Preferences"
                    disabled={!selectedValue}
                />
            }
            className="w-[30%] h-[50%]"
            title="Labels Legend"
            description="Pick a color for each label"
        >
            <div className="h-full flex flex-col gap-8 overflow-hidden">
                <ul className="flex flex-col gap-4 p-2 overflow-auto">
                    {
                        colorsArr.map((c, i) => (
                            <li onMouseEnter={() => setHover(c)} onMouseLeave={(() => setHover(""))} key={c} className={cn(`flex gap-8 items-center`)}>
                                <div className="flex flex-col">
                                    {
                                        i !== 0 &&
                                        <Button
                                            onClick={() => {
                                                if (i === 0) return
                                                setColorsArr(prev => {
                                                    const newArr = [...prev];
                                                    [newArr[i], newArr[i - 1]] = [newArr[i - 1], newArr[i]];
                                                    return newArr;
                                                });
                                            }}
                                            title="Up"
                                        >
                                            <ChevronUp />
                                        </Button>
                                    }
                                    {
                                        i !== colorsArr.length - 1 &&
                                        <Button
                                            onClick={() => {
                                                if (i === colorsArr.length - 1) return
                                                setColorsArr(prev => {
                                                    const newArr = [...prev];
                                                    [newArr[i], newArr[i + 1]] = [newArr[i + 1], newArr[i]];
                                                    return newArr;
                                                });
                                            }}
                                            title="Down"
                                        >
                                            <ChevronDown />
                                        </Button>
                                    }
                                </div>
                                {
                                    c === editable ?
                                        <>
                                            <div style={{ backgroundColor: newColor }} className="h-6 w-6 rounded-full" />
                                            <input
                                                className="p-0 bg-transparent"
                                                ref={ref => ref?.focus()}
                                                value={newColor}
                                                onChange={(e) => {
                                                    const newHslColor = rgbToHSL(e.target.value);
                                                    setNewColor(newHslColor);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Escape") handleCancelEditColor()
                                                    if (e.key === "Enter") handleEditColor()
                                                }}
                                                type="color"
                                            />
                                        </>
                                        : <>
                                            <div style={{ backgroundColor: c }} className="h-6 w-6 rounded-full" />
                                            <p>{c}</p>
                                        </>
                                }
                                {
                                    c === editable ?
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleEditColor}
                                                title="Save"
                                            >
                                                <Check />
                                            </Button>
                                            <Button
                                                onClick={handleCancelEditColor}
                                                title="Cancel"
                                            >
                                                <X />
                                            </Button>
                                        </div>
                                        : c === hover &&
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => {
                                                    setColorsArr(prev => [...prev.filter(color => color !== c)]);
                                                }}
                                                title="Delete"
                                            >
                                                <Trash2 />
                                            </Button>
                                            <Button
                                                onClick={() => setEditable(c)}
                                                title={isAddColor ? "You can't edit color when adding a new one" : "Edit"}
                                                disabled={isAddColor}
                                            >
                                                <Pencil />
                                            </Button>
                                        </div>
                                }
                            </li>
                        ))
                    }
                    {
                        isAddColor &&
                        <li className="flex gap-8 items-center">
                            <div className="h-6 w-6" />
                            <div style={{ backgroundColor: newColor }} className="h-6 w-6 rounded-full" />
                            <input
                                className="p-0 bg-transparent"
                                ref={ref => ref?.focus()}
                                value={newColor}
                                onChange={(e) => {
                                    const newHslColor = rgbToHSL(e.target.value);
                                    setNewColor(newHslColor);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") handleCancelAddColor()
                                    if (e.key === "Enter") handleAddColor()
                                }}
                                type="color"
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleAddColor}
                                    title="Save"
                                >
                                    <Check />
                                </Button>
                                <Button
                                    onClick={handleCancelAddColor}
                                    title="Cancel"
                                >
                                    <X />
                                </Button>
                            </div>
                        </li>
                    }
                </ul>
                <div className="flex justify-around">
                    <Button
                        disabled={colorsArr.some(color => color === editable)}
                        variant="Primary"
                        label="Add Color"
                        onClick={() => {
                            setIsAddColor(true)
                        }}
                    >
                        <PlusCircle />
                    </Button>
                    <Button
                        disabled={DEFAULT_COLORS.every((c, i) => c === graph.Colors[i]) && DEFAULT_COLORS.length === graph.Colors.length}
                        variant="Secondary"
                        label="Reset"
                        onClick={() => {
                            handlePreferencesChange(DEFAULT_COLORS)
                        }}
                    >
                        <RotateCcw />
                    </Button>
                    <Button
                        disabled={graph.Colors.every((c, i) => colorsArr[i] === c) && graph.Colors.length === colorsArr.length}
                        variant="Primary"
                        label="Apply"
                        onClick={() => handlePreferencesChange()}
                    >
                        <FileCheck2 />
                    </Button>
                </div>
            </div>
        </DialogComponent>
    )
}