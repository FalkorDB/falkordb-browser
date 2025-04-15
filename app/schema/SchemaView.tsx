/* eslint-disable no-param-reassign */

'use client'

import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import { ChevronLeft, Maximize2, Minimize2, Pause, Play } from "lucide-react"
import { ImperativePanelHandle } from "react-resizable-panels"
import { useEffect, useRef, useState, useContext } from "react"
import { cn, prepareArg, securedFetch } from "@/lib/utils"
import dynamic from "next/dynamic"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ForceGraphMethods } from "react-force-graph-2d"
import Toolbar from "../graph/toolbar"
import SchemaDataPanel from "./SchemaDataPanel"
import Labels from "../graph/labels"
import { Category, Graph, Link, Node, GraphData } from "../api/graph/model"
import Button from "../components/ui/Button"
import CreateElement from "./SchemaCreateElement"
import { IndicatorContext } from "../components/provider"

const ForceGraph = dynamic(() => import("../components/ForceGraph"), { ssr: false })

/* eslint-disable react/require-default-props */
interface Props {
    schema: Graph
    fetchCount?: () => void
}

export default function SchemaView({ schema, fetchCount }: Props) {
    const [selectedElement, setSelectedElement] = useState<Node | Link | undefined>();
    const [selectedElements, setSelectedElements] = useState<(Node | Link)[]>([]);
    const [selectedNodes, setSelectedNodes] = useState<[Node | undefined, Node | undefined]>([undefined, undefined]);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const chartRef = useRef<ForceGraphMethods<Node, Link>>();
    const dataPanel = useRef<ImperativePanelHandle>(null);
    const [isAddRelation, setIsAddRelation] = useState(false)
    const [isAddEntity, setIsAddEntity] = useState(false)
    const [maximize, setMaximize] = useState<boolean>(false)
    const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0)
    const [data, setData] = useState<GraphData>(schema.Elements)
    const { toast } = useToast()
    const { setIndicator } = useContext(IndicatorContext)

    useEffect(() => {
        setData({ ...schema.Elements })
    }, [schema.Elements, schema.Id])

    useEffect(() => {
        dataPanel.current?.collapse()
    }, [])

    useEffect(() => {
        setSelectedElement(undefined)
        setSelectedElements([])
    }, [schema.Id])

    useEffect(() => {
        setSelectedNodes([undefined, undefined])
    }, [isAddRelation])

    const handleCooldown = (ticks?: number) => {
        setCooldownTicks(ticks)
    }

    const onCategoryClick = (category: Category) => {
        category.show = !category.show
        schema.Elements.nodes.forEach((node) => {
            if (node.category[0] !== category.name) return
            node.visible = category.show
        })

        schema.visibleLinks(category.show)

        setData({ ...schema.Elements })
    }

    const onLabelClick = (label: Category) => {
        label.show = !label.show
        schema.Elements.links.forEach((link) => {
            if (link.label !== label.name) return
            link.visible = label.show
        })

        setData({ ...schema.Elements })
    }

    const handleSetSelectedElement = (element?: Node | Link | undefined) => {
        setSelectedElement(element)
        if (isAddRelation || isAddEntity) return
        if (element) {
            dataPanel.current?.expand()
        } else dataPanel.current?.collapse()
    }

    const onExpand = (expand?: boolean) => {
        if (!dataPanel.current) return
        const panel = dataPanel.current
        if (expand !== undefined) {
            if (expand && panel?.isCollapsed()) {
                panel?.expand()
            } else if (!expand && panel?.isExpanded()) {
                panel?.collapse()
            }
            return
        }
        if (panel.isCollapsed()) {
            panel.expand()
        } else {
            panel.collapse()
        }
    }

    const handleDeleteElement = async () => {
        const stateSelectedElements = Object.values(selectedElements)

        if (stateSelectedElements.length === 0 && selectedElement) {
            stateSelectedElements.push(selectedElement)
            setSelectedElement(undefined)
        }

        await Promise.all(stateSelectedElements.map(async (element) => {
            const { id } = element
            const type = !("source" in element)
            const result = await securedFetch(`api/schema/${prepareArg(schema.Id)}/${prepareArg(id.toString())}`, {
                method: "DELETE",
                body: JSON.stringify({ type }),
            }, toast, setIndicator)

            if (!result.ok) return

            if (type) {
                schema.Elements.nodes.splice(schema.Elements.nodes.findIndex(node => node.id === element.id), 1)
                schema.NodesMap.delete(id)
            } else {
                schema.Elements.links.splice(schema.Elements.links.findIndex(link => link.id === element.id), 1)
                schema.EdgesMap.delete(id)
            }

            if (type) {
                element.category.forEach((category) => {
                    const cat = schema.CategoriesMap.get(category)

                    if (cat) {
                        cat.elements = cat.elements.filter(n => n.id !== id)

                        if (cat.elements.length === 0) {
                            schema.Categories.splice(schema.Categories.findIndex(c => c.name === cat.name), 1)
                            schema.CategoriesMap.delete(cat.name)
                        }
                    }
                })
            } else {
                const cat = schema.LabelsMap.get(element.label)

                if (cat) {
                    cat.elements = cat.elements.filter(n => n.id !== id)

                    if (cat.elements.length === 0) {
                        schema.Labels.splice(schema.Labels.findIndex(c => c.name === cat.name), 1)
                        schema.LabelsMap.delete(cat.name)
                    }
                }
            }
        }))

        schema.removeLinks()

        if (fetchCount) fetchCount()

        setSelectedElement(undefined)
        setSelectedElements([])
        setData({ ...schema.Elements })
        onExpand(false)
    }

    const onCreateElement = async (attributes: [string, string[]][], label?: string[]) => {
        const fakeId = "-1"
        const result = await securedFetch(`api/schema/${prepareArg(schema.Id)}/${prepareArg(fakeId)}`, {
            method: "POST",
            body: JSON.stringify({ type: isAddEntity, label, attributes, selectedNodes })
        }, toast, setIndicator)

        if (result.ok) {
            const json = await result.json()

            if (isAddEntity) {
                schema.extendNode(json.result.data[0].n, false, true)
                setIsAddEntity(false)
            } else {
                schema.extendEdge(json.result.data[0].e, false, true)
                setIsAddRelation(false)
            }

            if (fetchCount) fetchCount()

            onExpand()

        }

        setData({ ...schema.Elements })

        return result.ok
    }

    return (
        <ResizablePanelGroup direction="horizontal" className={cn(maximize && "h-full p-10 bg-background fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%]")}>
            <ResizablePanel
                defaultSize={50}
                className={cn("flex flex-col gap-10", !isCollapsed && "mr-8")}
            >
                <div className="flex items-center justify-between">
                    <Toolbar
                        disabled={!schema.Id}
                        deleteDisabled={Object.values(selectedElements).length === 0 && !selectedElement}
                        onAddEntity={() => {
                            setIsAddEntity(true)
                            setIsAddRelation(false)
                            setSelectedElement(undefined)
                            if (dataPanel.current?.isExpanded()) return
                            onExpand()
                        }}
                        onAddRelation={() => {
                            setIsAddRelation(true)
                            setIsAddEntity(false)
                            setSelectedElement(undefined)
                            if (dataPanel.current?.isExpanded()) return
                            onExpand()
                        }}
                        onDeleteElement={handleDeleteElement}
                        chartRef={chartRef}
                        displayAdd
                        type="Schema"
                    />
                    {
                        isCollapsed &&
                        <Button
                            className="p-3 bg-[#7167F6] rounded-lg"
                            onClick={() => onExpand()}
                            disabled={!selectedElement}
                        >
                            <ChevronLeft size={20} />
                        </Button>
                    }
                </div>
                <div className="relative h-1 grow rounded-lg overflow-hidden">
                    <Button
                        className="z-10 absolute top-4 right-4"
                        title={maximize ? "Minimize" : "Maximize"}
                        onClick={() => setMaximize(prev => !prev)}
                    >
                        {
                            maximize ?
                                <Minimize2 size={20} />
                                : <Maximize2 size={20} />
                        }
                    </Button>
                    <div className="z-10 absolute top-4 left-4 pointer-events-none">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    {cooldownTicks === undefined ? <Play size={20} /> : <Pause size={20} />}
                                    <Switch
                                        className="pointer-events-auto"
                                        checked={cooldownTicks === undefined}
                                        onCheckedChange={() => {
                                            handleCooldown(cooldownTicks === undefined ? 0 : undefined)
                                        }}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Animation Control</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <ForceGraph
                        chartRef={chartRef}
                        data={data}
                        setData={setData}
                        graph={schema}
                        onExpand={onExpand}
                        selectedElement={selectedElement}
                        setSelectedElement={handleSetSelectedElement}
                        selectedElements={selectedElements}
                        setSelectedElements={setSelectedElements}
                        type="schema"
                        isAddElement={isAddRelation}
                        setSelectedNodes={setSelectedNodes}
                        cooldownTicks={cooldownTicks}
                        handleCooldown={handleCooldown}
                    />
                    {
                        (schema.Categories.length > 0 || schema.Labels.length > 0) &&
                        <>
                            <Labels className="left-2" label="Categories" categories={schema.Categories} onClick={onCategoryClick} graph={schema} />
                            <Labels className="right-2 text-end" label="RelationshipTypes" categories={schema.Labels} onClick={onLabelClick} graph={schema} />
                        </>
                    }
                </div>
            </ResizablePanel>
            <ResizableHandle disabled={!selectedElement} className={cn(!selectedElement && "!cursor-default")} />
            <ResizablePanel
                className={cn("rounded-lg", !isCollapsed && "border-[3px] border-foreground")}
                collapsible
                ref={dataPanel}
                defaultSize={50}
                minSize={25}
                maxSize={50}
                onCollapse={() => setIsCollapsed(true)}
                onExpand={() => setIsCollapsed(false)}
            >
                {
                    selectedElement ?
                        <SchemaDataPanel
                            obj={selectedElement}
                            onExpand={onExpand}
                            onDeleteElement={handleDeleteElement}
                            schema={schema}
                        />
                        : (isAddEntity || isAddRelation) &&
                        <CreateElement
                            onCreate={onCreateElement}
                            onExpand={onExpand}
                            selectedNodes={selectedNodes}
                            setSelectedNodes={setSelectedNodes}
                            type={isAddEntity}
                        />
                }
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}