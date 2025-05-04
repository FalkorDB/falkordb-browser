import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PlusCircle, Pause, Play, Search, Trash2 } from "lucide-react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { GraphRef, handleZoomToFit, screenSize as screenSizeConstants } from "@/lib/utils"
import { Graph, Link, Node } from "../api/graph/model"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import DeleteElement from "./DeleteElement"

interface Props {
    graph: Graph
    cooldownTicks: number | undefined
    handleCooldown: (ticks?: number) => void
    selectedElement: Node | Link | undefined
    selectedElements: (Node | Link)[]
    setSelectedElement: Dispatch<SetStateAction<Node | Link | undefined>>
    handleDeleteElement: () => Promise<void>
    chartRef: GraphRef
    setIsAddEntity?: Dispatch<SetStateAction<boolean>>
    setIsAddRelation?: Dispatch<SetStateAction<boolean>>
}

export default function Toolbar({
    graph,
    cooldownTicks,
    handleCooldown,
    selectedElement,
    selectedElements,
    setSelectedElement,
    handleDeleteElement,
    chartRef,
    setIsAddEntity,
    setIsAddRelation,
}: Props) {

    const [searchElement, setSearchElement] = useState("")
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [isAddEntityHover, setIsAddEntityHover] = useState(false)
    const [isAddRelationHover, setIsAddRelationHover] = useState(false)
    const [isDeleteHover, setIsDeleteHover] = useState(false)
    const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })
    const isLarge = screenSize.width > screenSizeConstants["2xl"]

    useEffect(() => {
        setScreenSize({ width: window.innerWidth, height: window.innerHeight })

        window.addEventListener("resize", () => {
            setScreenSize({ width: window.innerWidth, height: window.innerHeight })
        })
    }, [])

    const handleSearchElement = () => {
        if (searchElement) {
            const element = graph.Elements.nodes.find(node => node.data.name ? node.data.name.toLowerCase().startsWith(searchElement.toLowerCase()) : node.id.toString().toLowerCase().includes(searchElement.toLowerCase()))

            if (element) {
                handleZoomToFit(chartRef, (node: Node) => node.id === element.id)
                setSelectedElement(element)
            }
        }
    }

    return (
        <div className="z-10 absolute top-12 inset-x-12 pointer-events-none flex justify-between" id="canvasPanel">
            <Tooltip>
                <TooltipTrigger asChild>
                    {
                        graph.getElements().length > 0 &&
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
                    }
                </TooltipTrigger>
                <TooltipContent>
                    <p>Animation Control</p>
                </TooltipContent>
            </Tooltip>
            <div className="relative pointer-events-auto" id="elementCanvasSearch">
                {
                    graph.getElements().length > 0 &&
                    <>
                        <Input
                            className="w-[30dvw] bg-transparent text-white border border-primary"
                            placeholder="Search for element in the graph"
                            value={searchElement}
                            onChange={(e) => setSearchElement(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearchElement()
                                    setSearchElement("")
                                }
                            }}
                        />
                        <Button
                            className="absolute right-2 top-2"
                            onClick={handleSearchElement}
                        >
                            <Search />
                        </Button>
                    </>
                }
            </div>
            <div className="flex gap-2">
                {
                    graph.Id &&
                    <>
                        {
                            setIsAddEntity && setIsAddRelation &&
                            <>
                                <Button
                                    onMouseEnter={() => setIsAddEntityHover(true)}
                                    onMouseLeave={() => setIsAddEntityHover(false)}
                                    className="pointer-events-auto"
                                    variant="Secondary"
                                    label={isLarge || isAddEntityHover ? "Add Node" : undefined}
                                    onClick={() => {
                                        setIsAddEntity(true)
                                        setIsAddRelation(false)
                                        setSelectedElement(undefined)
                                    }}
                                >
                                    <PlusCircle size={20} />
                                </Button>
                                <Button
                                    className="pointer-events-auto"
                                    variant="Secondary"
                                    label={isLarge || isAddRelationHover ? "Add Edge" : undefined}
                                    onMouseEnter={() => setIsAddRelationHover(true)}
                                    onMouseLeave={() => setIsAddRelationHover(false)}
                                    onClick={() => {
                                        setIsAddEntity(false)
                                        setIsAddRelation(true)
                                        setSelectedElement(undefined)
                                    }}
                                >
                                    <PlusCircle size={20} />
                                </Button>
                            </>
                        }
                        <DeleteElement
                            description="Are you sure you want to delete this element(s)?"
                            open={deleteOpen}
                            setOpen={setDeleteOpen}
                            onDeleteElement={handleDeleteElement}
                            trigger={
                                <Button
                                    className="pointer-events-auto"
                                    variant="Secondary"
                                    label={isLarge || isDeleteHover ? "Delete" : undefined}
                                    title="Delete Element(s)"
                                    onMouseEnter={() => setIsDeleteHover(true)}
                                    onMouseLeave={() => setIsDeleteHover(false)}
                                    disabled={selectedElements.length === 0 && !selectedElement}
                                >
                                    <Trash2 size={20} />
                                </Button>
                            }
                        />
                    </>
                }
            </div>
        </div>
    )
}

Toolbar.defaultProps = {
    setIsAddEntity: undefined,
    setIsAddRelation: undefined,
}