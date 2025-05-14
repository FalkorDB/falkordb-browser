/* eslint-disable no-param-reassign */

import { Check, ChevronDown, ChevronUp, FileCheck2, Pencil, PlusCircle, RotateCcw, Trash2, X } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { cn, rgbToHSL } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { DEFAULT_COLORS, Graph } from "../api/graph/model"
import Button from "../components/ui/Button"
import DialogComponent from "../components/DialogComponent"
import { GraphContext } from "../components/provider"


function hslToHex(hsl: string): string {
    const hslValues = hsl.match(/\d+/g);

    if (!hslValues || hslValues.length < 3) {
        throw new Error("Invalid HSL string");
    }

    const [h, s, l] = hslValues.map(Number);

    const sDecimal = s / 100;
    const lDecimal = l / 100;

    const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = lDecimal - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
        r = c; g = 0; b = x;
    }

    const toHex = (value: number) => {
        const hex = Math.round((value + m) * 255).toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default function View({ selectedValue }: {
    selectedValue: string
}) {
    
    const { graph, setGraph } = useContext(GraphContext)
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

    const getNewColor = () => {
        const newHslColor = `hsl(${(colorsArr.length - Math.min(DEFAULT_COLORS.length, colorsArr.length)) * 20}, 100%, 70%)`
        setNewColor(newHslColor)
    }

    return (
        <DialogComponent
            onOpenChange={(o) => !o && setColorsArr(graph.Colors)}
            trigger={
                <Button
                    label="Preferences"
                    title="Open application preferences"
                    disabled={!selectedValue}
                />
            }
            className="w-[30%] h-[50%]"
            title="Labels Legend"
            description="Pick a color for each label"
        >
            <div className="h-full flex flex-col gap-8">
                <ul className="h-1 grow flex flex-col gap-4 p-2 overflow-auto">
                    {
                        colorsArr.map((c, i) => (
                            <li onMouseEnter={() => setHover(c)} onMouseLeave={(() => setHover(""))} key={c} className={cn(`flex gap-8 items-center`)}>
                                <div className="flex flex-col justify-center h-12 w-6">
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
                                            <input
                                                className="h-6 w-6 rounded-full"
                                                ref={ref => ref?.focus()}
                                                value={hslToHex(newColor)}
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
                                            <p>{newColor}</p>
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
                                                onClick={() => {
                                                    setEditable(c)
                                                    getNewColor()
                                                }}
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
                            <div className="h-12 w-6" />
                            <input
                                className="h-6 w-6 rounded-full"
                                ref={ref => ref?.focus()}
                                value={hslToHex(newColor)}
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
                            <p>{newColor}</p>
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
                        title="Add a new color option"
                        onClick={() => {
                            setIsAddColor(true)
                            getNewColor()
                        }}
                    >
                        <PlusCircle />
                    </Button>
                    <Button
                        disabled={DEFAULT_COLORS.every((c, i) => c === graph.Colors[i]) && DEFAULT_COLORS.length === graph.Colors.length}
                        variant="Secondary"
                        label="Reset"
                        title="Restore default colors settings"
                        onClick={() => {
                            handlePreferencesChange(DEFAULT_COLORS)
                        }}
                    >
                        <RotateCcw />
                    </Button>
                    <Button
                        disabled={JSON.stringify(graph.Colors) === JSON.stringify(colorsArr) && graph.Colors.length === colorsArr.length}
                        variant="Primary"
                        label="Apply"
                        title="Save and apply changes"
                        onClick={() => handlePreferencesChange()}
                    >
                        <FileCheck2 />
                    </Button>
                </div>
            </div>
        </DialogComponent>
    )
}