/* eslint-disable no-param-reassign */

import { ChevronDown, ChevronUp, FileCheck2, PlusCircle, RotateCcw, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { DEFAULT_COLORS, Graph } from "../api/graph/model"
import Button from "../components/ui/Button"
import DialogComponent from "../components/DialogComponent"
import Input from "../components/ui/Input"

export default function View({ graph, setGraph, selectedValue }: {
    graph: Graph,
    setGraph: (graph: Graph) => void,
    selectedValue: string
}) {
    const [colorsArr, setColorsArr] = useState<string[]>(graph.Colors)
    const [newColor, setNewColor] = useState<string>("")
    const [hover, setHover] = useState<string>("")
    const [editable, setEditable] = useState<string>("")

    const handlePreferencesChange = (colors?: string[]) => {
        setGraph(Graph.create(graph.Id, { data: graph.Data, metadata: graph.Metadata }, colors || colorsArr))
        if (colors) return
        localStorage.setItem(graph.Id, JSON.stringify(colorsArr));
    }

    useEffect(() => {
        setColorsArr(graph.Colors)
    }, [graph.Colors])

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
            title="Preferences"
        >
            <div className="h-full flex flex-col gap-8">
                <p className="text-xl">Legends</p>
                <ul className="flex flex-col gap-4 overflow-auto">
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
                                    c === newColor || c === editable ?
                                        <>
                                            <div style={{ backgroundColor: c }} className="h-6 w-6 rounded-full" />
                                            <Input
                                                ref={ref => ref?.focus()}
                                                className="w-24"
                                                value={editable === c ? editable : newColor}
                                                onChange={(e) => {
                                                    setColorsArr(prev => {
                                                        const newArr = [...prev];
                                                        newArr[i] = e.target.value;
                                                        return newArr;
                                                    });
                                                    if (editable === c) {
                                                        setEditable(e.target.value)
                                                    } else setNewColor(e.target.value);
                                                }}
                                                onBlur={() => {
                                                    setNewColor("");
                                                    colorsArr.splice(i, 1);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key !== "Enter") return
                                                    setNewColor("");
                                                    setEditable("");
                                                }}
                                            />
                                        </>
                                        : <>
                                            <div style={{ backgroundColor: c }} className="h-6 w-6 rounded-full" />
                                            <Button
                                                label={c}
                                                onClick={() => setEditable(c)}
                                            />
                                        </>
                                }
                                {
                                    hover === c && !(c === newColor || c === editable) &&
                                    <Button
                                        onClick={() => {
                                            setColorsArr(prev => [...prev.filter(color => color !== c)]);
                                        }}
                                        title="Delete"
                                    >
                                        <Trash2 />
                                    </Button>
                                }
                            </li>
                        ))
                    }
                </ul>
                <div className="flex justify-around">
                    <Button
                        disabled={colorsArr.length > graph.Colors.length}
                        label="Add Color"
                        onClick={() => {
                            setColorsArr(prev => [...prev, ""])
                        }}
                    >
                        <PlusCircle />
                    </Button>
                    <Button
                        disabled={DEFAULT_COLORS.every((c, i) => c === graph.Colors[i]) && DEFAULT_COLORS.length === graph.Colors.length}
                        variant="Secondary"
                        label="Reset"
                        onClick={() => {
                            localStorage.removeItem(graph.Id)
                            handlePreferencesChange(DEFAULT_COLORS)
                        }}
                    >
                        <RotateCcw />
                    </Button>
                    <Button
                        disabled={graph.Colors.filter((c, i) => c === colorsArr[i]).length === colorsArr.length && DEFAULT_COLORS.length === colorsArr.length}
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