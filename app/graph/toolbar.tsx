import { PlusCircle } from "lucide-react"
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react"
import { cn, GraphRef, handleZoomToFit } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Graph, Link, Node } from "../api/graph/model"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import DeleteElement from "./DeleteElement"

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
    setIsAddEntity,
    setIsAddRelation,
    backgroundColor,
    label
}: Props) {

    const suggestionRef = useRef<HTMLUListElement>(null)

    const [suggestions, setSuggestions] = useState<(Node | Link)[]>([])
    const [suggestionIndex, setSuggestionIndex] = useState(0)
    const [searchElement, setSearchElement] = useState("")
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [addOpen, setAddOpen] = useState(false)


    const handleOnChange = useCallback(async () => {
        if (!searchElement) {
            setSuggestions([])
            return
        }

        const elements = graph.getElements().filter(el =>
            Object.values(el.data).some(value => value.toString().toLowerCase().startsWith(searchElement.toLowerCase()))
            || el.id.toString().toLowerCase().includes(searchElement.toLowerCase())
            || el.label && (el as Link).label.toLowerCase().includes(searchElement.toLowerCase())
            || el.category && (el as Node).category.some(c => c.toLowerCase().includes(searchElement.toLowerCase()))
        )

        setSuggestions(elements)
    }, [graph, searchElement])

    useEffect(() => {
        const timeout = setTimeout(handleOnChange, 500)

        return () => {
            clearTimeout(timeout)
        }
    }, [graph, handleOnChange, searchElement])

    const handleSearchElement = (element: Node | Link) => {
        handleZoomToFit(chartRef, (node: Node) => element.category ? element.id === node.id : node.id === element.source.id || node.id === element.target.id, 4)
        setSelectedElement(element)
        setSearchElement("")
        setSuggestions([])
    }

    const scrollToSuggestion = (index: number) => {
        const suggestionElement = suggestionRef.current?.querySelector(`li:nth-child(${index + 1})`)
        if (suggestionElement) {
            suggestionRef.current?.scrollTo({ top: (suggestionElement.clientHeight + 8) * index, behavior: "smooth" })
        }
    }

    return (
        <div className="w-full h-full flex justify-between items-center">
            <div className={cn("relative pointer-events-auto", label === "Schema" && "h-full")}>
                {
                    graph.getElements().length > 0 &&
                    <Input
                        data-testid={`elementCanvasSearch${label}`}
                        className={cn("w-[30dvw] text-white border border-primary", label === "Schema" && "h-full", backgroundColor)}
                        placeholder="Search for element in the graph"
                        value={searchElement}
                        onChange={(e) => setSearchElement(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                e.preventDefault()
                                setSearchElement("")
                            }

                            if (e.key === 'Enter' && suggestions[suggestionIndex]) {
                                e.preventDefault()
                                handleSearchElement(suggestions[suggestionIndex])
                                setSearchElement("")
                            }

                            if (e.key === 'ArrowDown') {
                                e.preventDefault()
                                const index = suggestionIndex === suggestions.length - 1 ? 0 : suggestionIndex + 1
                                setSuggestionIndex(index)
                                scrollToSuggestion(index)
                            }

                            if (e.key === 'ArrowUp') {
                                e.preventDefault()
                                const index = suggestionIndex === 0 ? suggestions.length - 1 : suggestionIndex - 1
                                setSuggestionIndex(index)
                                scrollToSuggestion(index)
                            }
                        }}
                        onBlur={(e) => {
                            if (suggestionRef.current?.contains(e.relatedTarget) || (e.target as HTMLElement) === suggestionRef.current) {
                                return
                            }

                            setSuggestions([])
                        }}
                        onFocus={() => handleOnChange()}
                    />
                }
                {
                    suggestions.length > 0 &&
                    <ul
                        data-testid={`elementCanvasSuggestionsList${label}`}
                        ref={suggestionRef}
                        className="max-h-[30dvh] overflow-auto absolute left-0 top-14 w-full border p-2 rounded-lg flex flex-col gap-2 bg-foreground"
                        role="listbox"
                        tabIndex={-1}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                e.preventDefault()
                                setSearchElement("")
                            }

                            if (e.key === 'Enter' && suggestions[suggestionIndex]) {
                                e.preventDefault()
                                handleSearchElement(suggestions[suggestionIndex])
                                setSearchElement("")
                            }

                            if (e.key === 'ArrowDown') {
                                e.preventDefault()
                                const index = suggestionIndex === suggestions.length - 1 ? 0 : suggestionIndex + 1
                                setSuggestionIndex(index)
                                scrollToSuggestion(index)
                            }

                            if (e.key === 'ArrowUp') {
                                e.preventDefault()
                                const index = suggestionIndex === 0 ? suggestions.length - 1 : suggestionIndex - 1
                                setSuggestionIndex(index)
                                scrollToSuggestion(index)
                            }
                        }}
                    >
                        {
                            suggestions.map((suggestion, index) =>
                                // eslint-disable-next-line react/no-array-index-key
                                <li key={index}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                role="option"
                                                aria-selected={index === suggestionIndex}
                                                data-testid={`elementCanvasSuggestion${label}${suggestion.data.name || suggestion.id}`}
                                                className={cn("w-full h-full p-2 rounded-lg flex gap-2", index === suggestionIndex ? "bg-gray-300" : "bg-gray-500")}
                                                onClick={() => handleSearchElement(suggestion)}
                                                onMouseEnter={() => setSuggestionIndex(index)}
                                            >
                                                <div
                                                    className="rounded-full h-8 w-8 p-2 flex items-center justify-center"
                                                    style={{ backgroundColor: suggestion.color }}
                                                >
                                                    <p className="text-white text-sm font-bold truncate">{suggestion.label || suggestion.category}</p>
                                                </div>
                                                <div
                                                    className={cn("w-1 grow text-center truncate", index === suggestionIndex ? "text-black" : "text-white")}
                                                >
                                                    {suggestion.data.name || suggestion.id}
                                                </div>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {suggestion.label || suggestion.category}
                                        </TooltipContent>
                                    </Tooltip>
                                </li>
                            )
                        }
                    </ul>
                }
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