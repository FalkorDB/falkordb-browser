import { PlusCircle } from "lucide-react"
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react"
import { cn, GraphRef, handleZoomToFit } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Graph, Link, Node } from "../api/graph/model"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import DeleteElement from "./DeleteElement"
import { GraphContext } from "../components/provider"

interface Props {
    graph: Graph
    selectedElements: (Node | Link)[]
    setSelectedElement: Dispatch<SetStateAction<Node | Link | undefined>>
    handleDeleteElement: () => Promise<void>
    chartRef: GraphRef
    label: "Graph" | "Schema"
    setIsAddEntity?: Dispatch<SetStateAction<boolean>>
    setIsAddRelation?: Dispatch<SetStateAction<boolean>>
    backgroundColor?: string
    isLoadingSchema?: boolean
}

const ITEM_HEIGHT = 48
const GAP = 8
const ITEMS_PER_PAGE = 30

export default function Toolbar({
    graph,
    selectedElements,
    setSelectedElement,
    handleDeleteElement,
    chartRef,
    label,
    setIsAddEntity,
    setIsAddRelation,
    backgroundColor,
    isLoadingSchema,
}: Props) {

    const { isLoading: isLoadingGraph } = useContext(GraphContext)

    const suggestionRef = useRef<HTMLDivElement>(null)

    const [suggestions, setSuggestions] = useState<(Node | Link)[]>([])
    const [suggestionIndex, setSuggestionIndex] = useState(0)
    const [searchElement, setSearchElement] = useState("")
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [addOpen, setAddOpen] = useState(false)
    const [scrollTop, setScrollTop] = useState(0)
    const [startIndex, setStartIndex] = useState(0)
    const [topFakeItemHeight, setTopFakeItemHeight] = useState(0)
    const [bottomFakeItemHeight, setBottomFakeItemHeight] = useState(0)
    const [visibleSuggestions, setVisibleSuggestions] = useState<(Node | Link)[]>([])

    const isLoading = isLoadingSchema || isLoadingGraph
    
    useEffect(() => {
        const newStartIndex = Math.max(0, Math.floor((scrollTop - ((ITEM_HEIGHT + GAP) * ITEMS_PER_PAGE)) / (ITEM_HEIGHT + GAP)))
        const newEndIndex = Math.min(suggestions.length, Math.floor((scrollTop + ((ITEM_HEIGHT + GAP) * (ITEMS_PER_PAGE * 2))) / (ITEM_HEIGHT + GAP)))
        const bottomCount = suggestions.length - newEndIndex
        const newTopFakeItemHeight = newStartIndex > 0 ? (newStartIndex * ITEM_HEIGHT) + ((newStartIndex - 1) * GAP) : 0
        const newBottomFakeItemHeight = bottomCount > 0 ? (bottomCount * ITEM_HEIGHT) + ((bottomCount - 1) * GAP) : 0
        const newVisibleSuggestions = suggestions.slice(newStartIndex, newEndIndex)

        setStartIndex(newStartIndex)
        setTopFakeItemHeight(newTopFakeItemHeight)
        setBottomFakeItemHeight(newBottomFakeItemHeight)
        setVisibleSuggestions(newVisibleSuggestions)
    }, [scrollTop, suggestions])

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop)
    }

    const handleOnChange = useCallback(async () => {
        setSuggestionIndex(0)

        if (!searchElement) {
            setSuggestions([])
            return
        }

        const elements = graph.getElements().filter(el =>
            Object.values(el.data).some(value => value.toString().toLowerCase().startsWith(searchElement.toLowerCase()))
            || el.id.toString().toLowerCase().includes(searchElement.toLowerCase())
            || el.relationship && (el as Link).relationship.toLowerCase().includes(searchElement.toLowerCase())
            || el.labels && (el as Node).labels.some(c => c.toLowerCase().includes(searchElement.toLowerCase()))
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
        handleZoomToFit(chartRef, (node: Node) => element.labels ? element.id === node.id : node.id === element.source.id || node.id === element.target.id, 4)
        setSelectedElement(element)
        setSearchElement("")
        setSuggestions([])
    }

    const scrollToSuggestion = (index: number) => {
        if (suggestionRef.current) {
            suggestionRef.current.scrollTo({ top: (ITEM_HEIGHT * index) + (index > 0 ? (index) * GAP : 0), behavior: "smooth" })
        }
    }

    const stripSVG = encodeURIComponent(
        `<svg width="100%" height="${ITEM_HEIGHT + GAP}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100%" height="${ITEM_HEIGHT}" rx="8" ry="8" fill="#6b7280"/>
      </svg>`
    );
    const stripBackground = `url("data:image/svg+xml,${stripSVG}")`;

    return (
        <div className={cn("w-full flex justify-between items-center", label === "Schema" && "h-full")}>
            <div className={cn("relative pointer-events-auto", label === "Schema" && "h-full")}>
                {
                    graph.getElements().length > 0 && !isLoading &&
                    <Input
                        data-testid={`elementCanvasSearch${label}`}
                        className={cn("w-[30dvw] text-foreground border border-primary", label === "Schema" && "h-full", backgroundColor)}
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
                            if (suggestionRef.current?.contains(e.relatedTarget) || e.relatedTarget === suggestionRef.current) return

                            setSuggestions([])
                        }
                        }
                        onFocus={() => handleOnChange()}
                    />
                }
                {
                    suggestions.length > 0 &&
                    <div tabIndex={-1} onScroll={handleScroll} ref={suggestionRef} className="max-h-[30dvh] overflow-auto absolute left-0 top-14 w-full border border-border p-2 rounded-lg bg-background">
                        <ul
                            data-testid={`elementCanvasSuggestionsList${label}`}
                            className="flex flex-col gap-2"
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
                                topFakeItemHeight > 0
                                && <li
                                    className="animate-pulse"
                                    style={{
                                        height: `${topFakeItemHeight}px`,
                                        backgroundImage: stripBackground,
                                        backgroundRepeat: 'repeat-y',
                                        backgroundSize: `100% ${ITEM_HEIGHT + GAP}px`,
                                        overflow: 'hidden'
                                    }}
                                />
                            }
                            {
                                visibleSuggestions.map((suggestion, index) => {
                                    const actualIndex = index + startIndex

                                    return (
                                        <li key={actualIndex}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        role="option"
                                                        aria-selected={actualIndex === suggestionIndex}
                                                        data-testid={`elementCanvasSuggestion${label}${suggestion.data.name || suggestion.id}`}
                                                        className={cn("w-full h-full p-2 rounded-lg flex gap-2", actualIndex === suggestionIndex ? "bg-gray-300" : "bg-gray-500")}
                                                        onClick={() => handleSearchElement(suggestion)}
                                                        onMouseEnter={() => setSuggestionIndex(actualIndex)}
                                                    >
                                                        <div
                                                            className="rounded-full h-8 w-8 p-2 flex items-center justify-center"
                                                            style={{ backgroundColor: suggestion.color }}
                                                        >
                                                            <p className="text-foreground text-sm font-bold truncate">{("source" in suggestion) ? suggestion.relationship : suggestion.labels[0]}</p>
                                                        </div>
                                                        <div
                                                            className={cn("w-1 grow text-center truncate", actualIndex === suggestionIndex ? "text-black" : "text-foreground")}
                                                        >
                                                            {suggestion.data.name || suggestion.id}
                                                        </div>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {("source" in suggestion) ? suggestion.relationship : suggestion.labels[0]}
                                                </TooltipContent>
                                            </Tooltip>
                                        </li>
                                    )
                                })
                            }
                            {
                                bottomFakeItemHeight > 0
                                && <li
                                    className="animate-pulse"
                                    style={{
                                        height: `${bottomFakeItemHeight}px`,
                                        backgroundImage: stripBackground,
                                        backgroundRepeat: 'repeat-y',
                                        backgroundSize: `100% ${ITEM_HEIGHT + GAP}px`,
                                        overflow: 'hidden'
                                    }}
                                />
                            }
                        </ul>
                    </div>
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
    backgroundColor: undefined,
    isLoadingSchema: false,
}