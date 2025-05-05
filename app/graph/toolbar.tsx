import { PlusCircle, Search } from "lucide-react"
import { Dispatch, SetStateAction, useContext, useState } from "react"
import { cn, GraphRef, handleZoomToFit } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Link, Node } from "../api/graph/model"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import DeleteElement from "./DeleteElement"
import { GraphContext } from "../components/provider"

interface Props {
    selectedElements: (Node | Link)[]
    setSelectedElement: Dispatch<SetStateAction<Node | Link | undefined>>
    handleDeleteElement: () => Promise<void>
    chartRef: GraphRef
    setIsAddEntity?: Dispatch<SetStateAction<boolean>>
    setIsAddRelation?: Dispatch<SetStateAction<boolean>>
    backgroundColor?: string
}

export default function Toolbar({
    selectedElements,
    setSelectedElement,
    handleDeleteElement,
    chartRef,
    setIsAddEntity,
    setIsAddRelation,
    backgroundColor
}: Props) {

    const [searchElement, setSearchElement] = useState("")
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [addOpen, setAddOpen] = useState(false)
    const { graph } = useContext(GraphContext)

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
        <div className="w-full h-full flex justify-between items-center" id="canvasPanel">
            <div
                className="relative pointer-events-auto"
                id="elementCanvasSearch"
            >
                {
                    graph.getElements().length > 0 &&
                    <>
                        <Input
                            className={cn("w-[30dvw] text-white border border-primary", backgroundColor)}
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
                            <DropdownMenu open={addOpen} onOpenChange={setAddOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className={cn("pointer-events-auto", backgroundColor)}
                                        variant="Secondary"
                                        label="Add Element"
                                    >
                                        <PlusCircle size={20} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <Button
                                        className={cn("pointer-events-auto", backgroundColor)}
                                        variant="Secondary"
                                        label="Add Node"
                                        onClick={() => {
                                            setIsAddEntity(true)
                                            setIsAddRelation(false)
                                            setSelectedElement(undefined)
                                            setAddOpen(false)
                                        }}
                                    >
                                        <PlusCircle size={20} />
                                    </Button>
                                    <Button
                                        className={cn("pointer-events-auto", backgroundColor)}
                                        variant="Secondary"
                                        label="Add Edge"
                                        onClick={() => {
                                            setIsAddEntity(false)
                                            setIsAddRelation(true)
                                            setSelectedElement(undefined)
                                            setAddOpen(false)
                                        }}
                                    >
                                        <PlusCircle size={20} />
                                    </Button>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        }
                        {
                            selectedElements.length > 1 &&
                            <DeleteElement
                                description="Are you sure you want to delete this element(s)?"
                                open={deleteOpen}
                                setOpen={setDeleteOpen}
                                onDeleteElement={handleDeleteElement}
                                backgroundColor={backgroundColor}
                            />
                        }
                    </>
                }
            </div>
        </div>
    )
}

Toolbar.defaultProps = {
    setIsAddEntity: undefined,
    setIsAddRelation: undefined,
    backgroundColor: undefined
}