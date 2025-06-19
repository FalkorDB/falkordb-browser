import { cn, GraphRef, handleZoomToFit } from "@/lib/utils"
import { useState, useCallback, useRef, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Graph, Link, Node } from "../api/graph/model"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"

interface Props {
    graph: Graph
    chartRef: GraphRef
    onSearchElement: (element: Node | Link) => void
    label: "Graph" | "Schema"
    backgroundColor?: string
    type?: "Node" | "Edge"
}

export default function SearchElement({ graph, chartRef, onSearchElement, label, backgroundColor, type }: Props) {

    const suggestionRef = useRef<HTMLUListElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const [searchElement, setSearchElement] = useState("")
    const [suggestionIndex, setSuggestionIndex] = useState(0)
    const [suggestions, setSuggestions] = useState<(Node | Link)[]>([])

    const handleOnChange = useCallback(async () => {
        setSuggestionIndex(0)

        if (!searchElement) {
            setSuggestions([])
            return
        }

        let elements: (Node | Link)[] = []

        if (type === "Node") {
            elements = graph.Elements.nodes
        } else if (type === "Edge") {
            elements = graph.Elements.links
        } else {
            elements = graph.getElements()
        }

        elements = elements.filter(el =>
            Object.values(el.data).some(value => value.toString().toLowerCase().startsWith(searchElement.toLowerCase()))
            || el.id.toString().toLowerCase().includes(searchElement.toLowerCase())
            || el.label && (el as Link).label.toLowerCase().includes(searchElement.toLowerCase())
            || el.category && (el as Node).category.some(c => c.toLowerCase().includes(searchElement.toLowerCase()))
        )

        setSuggestions(elements)
    }, [graph, searchElement, type])

    useEffect(() => {
        const timeout = setTimeout(handleOnChange, 500)

        return () => {
            clearTimeout(timeout)
        }
    }, [graph, handleOnChange, searchElement])

    const handleSearchElement = (element: Node | Link) => {
        handleZoomToFit(chartRef, (node: Node) => element.category ? element.id === node.id : node.id === element.source.id || node.id === element.target.id, 4)
        onSearchElement(element)
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
        <div className="relative pointer-events-auto h-full w-full">
            {
                graph.getElements().length > 0 &&
                <Input
                    ref={inputRef}
                    data-testid={`elementCanvasSearch${label}`}
                    className={cn("text-white border border-primary h-full truncate w-full", backgroundColor)}
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
                    style={{ top: (inputRef.current?.clientHeight || 0) + 10 }}
                    className="max-h-[30dvh] overflow-auto absolute left-0 w-full border p-2 rounded-lg flex flex-col gap-2 bg-foreground"
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
    )
}

SearchElement.defaultProps = {
    backgroundColor: "",
    type: undefined
}