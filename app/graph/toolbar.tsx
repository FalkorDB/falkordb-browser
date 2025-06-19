import { PlusCircle } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { cn, GraphRef } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Graph, Link, Node } from "../api/graph/model"
import Button from "../components/ui/Button"
import DeleteElement from "./DeleteElement"
import SearchElement from "./SearchElement"

interface Props {
    graph: Graph
    selectedElements: (Node | Link)[]
    setSelectedElement: Dispatch<SetStateAction<Node | Link | undefined>>
    handleDeleteElement: () => Promise<void>
    chartRef: GraphRef
    setIsAddEntity?: Dispatch<SetStateAction<boolean>>
    setIsAddRelation?: Dispatch<SetStateAction<boolean>>
    backgroundColor?: string
    label: "Graph" | "Schema"
}

export default function Toolbar({
    graph,
    selectedElements,
    setSelectedElement,
    handleDeleteElement,
    chartRef,
    setIsAddEntity = undefined,
    setIsAddRelation = undefined,
    backgroundColor = undefined,
    label
}: Props) {

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [addOpen, setAddOpen] = useState(false)

    return (
        <div className="w-full h-full flex justify-between items-center">
            <div className="w-[30dvw] h-full">
                <SearchElement
                    graph={graph}
                    chartRef={chartRef}
                    onSearchElement={setSelectedElement}
                    label={label}
                    backgroundColor={backgroundColor}
                />
            </div>
            <div className={cn("flex gap-2", label === "Schema" && "h-full")}>
                {
                    graph.Id &&
                    <>
                        {
                            selectedElements.length > 1 &&
                            <DeleteElement
                                label={label}
                                description="Are you sure you want to delete this element(s)?"
                                open={deleteOpen}
                                setOpen={setDeleteOpen}
                                onDeleteElement={handleDeleteElement}
                                backgroundColor={backgroundColor}
                            />
                        }
                        {
                            setIsAddEntity && setIsAddRelation &&
                            <DropdownMenu open={addOpen} onOpenChange={setAddOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        data-testid={`elementCanvasAdd${label}`}
                                        className={cn("pointer-events-auto", backgroundColor)}
                                        variant="Secondary"
                                        label="Add Element"
                                    >
                                        <PlusCircle size={20} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <Button
                                        data-testid={`elementCanvasAddNode${label}`}
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
                                        data-testid={`elementCanvasAddEdge${label}`}
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