import { ArrowRight, Circle, Search, X } from "lucide-react";
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn, GraphRef, Link, Node } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Graph } from "../api/graph/model";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import DeleteElement from "./DeleteElement";
import { BrowserSettingsContext, ConnectionContext, GraphContext } from "../components/provider";
import { getNodeDisplayText } from "@falkordb/canvas";

interface Props {
    graph: Graph
    graphName: string
    selectedElements: (Node | Link)[]
    setSelectedElements: (elements: (Node | Link)[], fromSearch?: boolean) => void
    handleDeleteElement: () => Promise<void>
    canvasRef: GraphRef
    setIsAddNode: (isAddNode: boolean) => void
    setIsAddEdge?: (isAddEdge: boolean) => void
    setExpand: Dispatch<SetStateAction<boolean>>
    expand: boolean
    isAddNode: boolean
    isAddEdge: boolean
}

const ITEM_HEIGHT = 32;
const GAP = 8;
const ITEMS_PER_PAGE = 30;

export default function Toolbar({
    graph,
    graphName,
    selectedElements,
    setSelectedElements,
    handleDeleteElement,
    canvasRef,
    setIsAddNode,
    setIsAddEdge,
    isAddEdge,
    isAddNode,
    setExpand,
    expand,
}: Props) {

    const { isLoading: isLoadingGraph } = useContext(GraphContext);
    const { settings: { userExperienceSettings: { captionKeysSettings: { captionsKeys, showPropertyKeyPrefix } } } } = useContext(BrowserSettingsContext);
    const { isReadOnly } = useContext(ConnectionContext);


    const suggestionRef = useRef<HTMLDivElement>(null);

    const [suggestions, setSuggestions] = useState<(Node | Link)[]>([]);
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [hoverIndex, setHoverIndex] = useState(-1);
    const [searchElement, setSearchElement] = useState("");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [scrollTop, setScrollTop] = useState(0);

    const isLoading = isLoadingGraph;

    const { startIndex, topFakeItemHeight, bottomFakeItemHeight, visibleSuggestions } = useMemo(() => {
        const newStartIndex = Math.max(0, Math.min(
            Math.floor((scrollTop - ((ITEM_HEIGHT + GAP) * ITEMS_PER_PAGE)) / (ITEM_HEIGHT + GAP)),
            Math.max(0, suggestions.length - 1)
        ));
        const newEndIndex = Math.min(suggestions.length, Math.floor((scrollTop + ((ITEM_HEIGHT + GAP) * (ITEMS_PER_PAGE * 2))) / (ITEM_HEIGHT + GAP)));
        const bottomCount = suggestions.length - newEndIndex;
        return {
            startIndex: newStartIndex,
            topFakeItemHeight: newStartIndex > 0 ? (newStartIndex * ITEM_HEIGHT) + ((newStartIndex - 1) * GAP) : 0,
            bottomFakeItemHeight: bottomCount > 0 ? (bottomCount * ITEM_HEIGHT) + ((bottomCount - 1) * GAP) : 0,
            visibleSuggestions: suggestions.slice(newStartIndex, newEndIndex),
        };
    }, [scrollTop, suggestions]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    const handleOnChange = useCallback(() => {
        setSuggestionIndex(0);
        setHoverIndex(-1);
        setScrollTop(0);
        suggestionRef.current?.scrollTo({ top: 0 });

        if (!searchElement) {
            setSuggestions([]);
            return;
        }

        const elements = graph.getElements().filter(el =>
            Object.values(el.data).some(value => value != null && value.toString().toLowerCase().startsWith(searchElement.toLowerCase()))
            || el.id.toString().toLowerCase().includes(searchElement.toLowerCase())
            || ("relationship" in el && (el as Link).relationship.toLowerCase().includes(searchElement.toLowerCase()))
            || ("labels" in el && (el as Node).labels.some(c => c.toLowerCase().includes(searchElement.toLowerCase())))
        );

        setSuggestions(elements);
        // Recompute when the search text OR the graph changes so suggestions
        // don't go stale after a new query / graph switch keeps the same text.
    }, [searchElement, graph]);

    useEffect(() => {
        const timeout = setTimeout(handleOnChange, 300);

        return () => {
            clearTimeout(timeout);
        };
    }, [handleOnChange, searchElement]);

    const handleSearchElement = (element: Node | Link) => {
        canvasRef.current?.zoomToFit(4, (node) => "labels" in element ? element.id === node.id : node.id === element.source || node.id === element.target);
        setSelectedElements([element], true);
        setSearchElement("");
        setSuggestions([]);
    };

    const scrollToSuggestion = (index: number) => {
        if (suggestionRef.current) {
            const itemTop = index * (ITEM_HEIGHT + GAP);
            suggestionRef.current.scrollTo({ top: itemTop, behavior: "instant" as ScrollBehavior });
        }
    };

    const getMatchingProp = (el: Node | Link): { key: string; value: string } | null => {
        if (!searchElement) return null;
        const lowerSearch = searchElement.toLowerCase();

        for (const [key, value] of Object.entries(el.data)) {
            if (value != null && value.toString().toLowerCase().startsWith(lowerSearch)) {
                return { key, value: value.toString() };
            }
        }

        if (el.id.toString().toLowerCase().includes(lowerSearch)) {
            return { key: "id", value: el.id.toString() };
        }

        if ("relationship" in el && (el as Link).relationship.toLowerCase().includes(lowerSearch)) {
            return { key: "type", value: (el as Link).relationship };
        }

        if ("labels" in el) {
            const matchingLabel = (el as Node).labels.find(c => c.toLowerCase().includes(lowerSearch));
            if (matchingLabel) {
                return { key: "label", value: matchingLabel };
            }
        }

        return null;
    };

    const highlightMatch = (value: string, search: string) => {
        if (!search) return <>{value}</>;
        const idx = value.toLowerCase().indexOf(search.toLowerCase());
        if (idx === -1) return <>{value}</>;
        return (
            <>
                {value.slice(0, idx)}
                <span className="text-primary font-semibold">{value.slice(idx, idx + search.length)}</span>
                {value.slice(idx + search.length)}
            </>
        );
    };

    const stripBackground = `repeating-linear-gradient(to bottom, hsl(var(--muted)) 0px, hsl(var(--muted)) ${ITEM_HEIGHT}px, transparent ${ITEM_HEIGHT}px, transparent ${ITEM_HEIGHT + GAP}px)`;

    return (
        <div className={cn("w-full flex flex-wrap gap-4 justify-between items-center")}>
            <div className="flex gap-2 items-center">

                {
                    graph.getElements().length > 0 &&
                    <Button
                        title={expand ? "Close Search & Filter" : "Open Search & Filter"}
                        className="pointer-events-auto"
                        onClick={() => setExpand(prev => !prev)}
                    >
                        {
                            expand ? <X size={25} /> : <Search size={25} />
                        }
                    </Button>
                }
                <div className={cn("basis-0 grow relative pointer-events-auto min-w-[20dvw] max-w-[55dvw]")}>
                    {
                        expand && graph.getElements().length > 0 && !isLoading &&
                        <Input
                            data-testid="elementCanvasSearchGraph"
                            className={cn("w-full text-foreground border border-primary")}
                            placeholder="Search for element"
                            value={searchElement}
                            onChange={(e) => setSearchElement(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setSearchElement("");
                                }

                                if (e.key === 'Enter' && suggestions[suggestionIndex]) {
                                    e.preventDefault();
                                    handleSearchElement(suggestions[suggestionIndex]);
                                    setSearchElement("");
                                }

                                if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    const index = suggestionIndex === suggestions.length - 1 ? 0 : suggestionIndex + 1;
                                    setSuggestionIndex(index);
                                    scrollToSuggestion(index);
                                }

                                if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    const index = suggestionIndex === 0 ? suggestions.length - 1 : suggestionIndex - 1;
                                    setSuggestionIndex(index);
                                    scrollToSuggestion(index);
                                }
                            }}
                            onBlur={(e) => {
                                if (suggestionRef.current?.contains(e.relatedTarget) || e.relatedTarget === suggestionRef.current) return;

                                setSuggestions([]);
                            }
                            }
                            onFocus={() => handleOnChange()}
                        />
                    }
                    {
                        expand && suggestions.length > 0 &&
                        <div className="z-10 absolute left-0 top-14 w-full border border-border rounded-lg bg-background overflow-hidden flex flex-col max-h-[30dvh]">
                            <div className="grid gap-2 items-center px-3 py-1.5 border-b border-border text-xs font-semibold text-muted-foreground shrink-0" style={{ gridTemplateColumns: '1rem 1fr 2fr 1.5fr' }}>
                                <div />
                                <span>Type</span>
                                <span className="text-center">Caption</span>
                                <span className="text-right">Matched</span>
                            </div>
                            <div tabIndex={-1} onScroll={handleScroll} ref={suggestionRef} className="overflow-auto flex-1 min-h-0 p-2">
                            <ul
                                data-testid="elementCanvasSuggestionsListGraph"
                                className="flex flex-col gap-2"
                                role="listbox"
                                tabIndex={-1}
                                onMouseLeave={() => setHoverIndex(-1)}
                            >
                                {
                                    topFakeItemHeight > 0
                                    && <li
                                        className="animate-pulse"
                                        style={{
                                            height: `${topFakeItemHeight}px`,
                                            backgroundImage: stripBackground,
                                        }}
                                    />
                                }
                                {
                                    visibleSuggestions.map((suggestion, index) => {
                                        const actualIndex = index + startIndex;
                                        const type = "source" in suggestion;
                                        const matchingProp = getMatchingProp(suggestion);

                                        return (
                                            <li key={actualIndex}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            role="option"
                                                            aria-selected={actualIndex === suggestionIndex}
                                                            data-testid={`elementCanvasSuggestionGraph${suggestion.data.name || suggestion.id}`}
                                                            className={cn(
                                                                "w-full h-8 p-1 rounded-lg transition-colors",
                                                                actualIndex === suggestionIndex
                                                                    ? "bg-primary/10"
                                                                    : actualIndex === hoverIndex
                                                                        ? "bg-muted"
                                                                        : "bg-secondary"
                                                            )}
                                                            style={type ? { borderLeft: `2px solid ${suggestion.color}` } : undefined}
                                                            onMouseEnter={() => { setHoverIndex(actualIndex); setSuggestionIndex(actualIndex); }}
                                                            onClick={() => handleSearchElement(suggestion)}
                                                        >
                                                            <div className="w-full h-full grid gap-2 items-center" style={{ gridTemplateColumns: '1rem 1fr 2fr 1.5fr' }}>
                                                                <div className="flex items-center justify-center">
                                                                    {!type && (
                                                                        <div className="rounded-full h-3 w-3" style={{ backgroundColor: suggestion.color }} />
                                                                    )}
                                                                </div>
                                                                <p className="truncate text-sm">{type ? (suggestion as Link).relationship : (suggestion as Node).labels[0]}</p>
                                                                <div className={cn("text-center truncate", actualIndex === suggestionIndex ? "text-accent-foreground" : "text-foreground")}>
                                                                    {type ? suggestion.relationship : getNodeDisplayText(suggestion as Node, captionsKeys, showPropertyKeyPrefix)}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground text-right truncate">
                                                                    {matchingProp && (
                                                                        <>
                                                                            <span className="font-bold">{matchingProp.key}</span>
                                                                            {': '}{highlightMatch(matchingProp.value, searchElement)}
                                                                        </>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {type ? (suggestion as Link).relationship : (suggestion as Node).labels[0]}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </li>
                                        );
                                    })
                                }
                                {
                                    bottomFakeItemHeight > 0
                                    && <li
                                        className="animate-pulse"
                                        style={{
                                            height: `${bottomFakeItemHeight}px`,
                                            backgroundImage: stripBackground,
                                        }}
                                    />
                                }
                            </ul>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <div data-testid="elementCanvasToolbarActionGraph" className={cn("flex flex-row-reverse gap-2 pointer-events-auto")}>
                {
                    graphName && !isReadOnly &&
                    <>
                        <Button
                            data-testid="elementCanvasAddNodeGraph"
                            className="p-1 bg-background border-green text-green"
                            variant="Secondary"
                            tooltipVariant="Primary"
                            tooltipSide="bottom"
                            title="Add Node"
                            onClick={() => setIsAddNode(!isAddNode)}
                        >
                            <Circle size={20} />
                        </Button>
                        {
                            setIsAddEdge &&
                            <Button
                                data-testid="elementCanvasAddEdgeGraph"
                                className="p-1 bg-background border-green text-green"
                                variant="Secondary"
                                tooltipVariant="Primary"
                                tooltipSide="bottom"
                                title="Add Edge"
                                onClick={() => setIsAddEdge(!isAddEdge)}
                            >
                                <ArrowRight size={20} />
                            </Button>
                        }
                        {
                            selectedElements.length !== 0 &&
                            <DeleteElement
                                description="Are you sure you want to delete this element(s)?"
                                open={deleteOpen}
                                setOpen={setDeleteOpen}
                                onDeleteElement={handleDeleteElement}
                            />
                        }
                    </>
                }
            </div>
        </div>
    );
}

Toolbar.defaultProps = {
    setIsAddEdge: undefined,
};