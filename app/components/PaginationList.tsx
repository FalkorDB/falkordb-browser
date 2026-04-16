import { cn, Query } from "@/lib/utils";
import { Fragment, KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { Check, Circle, Loader2, Star, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Button from "./ui/Button";
import Input from "./ui/Input";

type Item = string | Query;

type ElementItem = {
    content: React.ReactNode;
    tooltip: string;
    className?: string;
};

const getLastRun = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const timeDiff = now.getTime() - date.getTime();
    const hoursAgo = timeDiff / (1000 * 60 * 60);

    if (hoursAgo <= 24) {
        return date.toLocaleTimeString([], { hour12: false });
    }

    return date.toLocaleString([], { hour12: false });
};

const getExecutionTime = (metadata: string[]) => metadata.find(value => value.startsWith("Query internal execution time:"))?.split(":")[1].replace(" milliseconds", "ms");

const getItemClassName = (selected: boolean, deleteSelected: boolean, hover: boolean, prefix: "text" | "bg" = "text") => {
    if (selected) return `${prefix}-primary border-primary`;
    if (deleteSelected) return `${prefix}-destructive border-destructive`;
    if (hover) return `${prefix}-foreground border-foreground`;
    return `${prefix}-foreground/50 border-foreground/50`;
};

const getSeparator = () => (
    <div
        className={cn("h-2/3 w-px rounded-full bg-foreground/60")}
    />
);

const getStatusIcon = (status: Query["status"]) => {
    const size = 15;
    switch (status) {
        case "Empty":
            return <Circle color="orange" size={size} />;
        case "Failed":
            return <X size={size} color="red" />;
        default:
            return <Check size={size} color="green" />;
    }
};

const getQueryElement = (item: Query) => {
    const executionTime = getExecutionTime(item.metadata);

    // Build array of items to display
    const elements: ElementItem[] = [];

    if (item.status) {
        elements.push({
            content: getStatusIcon(item.status),
            tooltip: `Status: ${item.status}`,
            className: "text-center truncate"
        });
    }

    if (item.elementsCount) {
        elements.push({
            content: `ELM: ${item.elementsCount}`,
            tooltip: `Elements: ${item.elementsCount}`,
        });
    }

    if (item.timestamp) {
        elements.push({
            content: `LR: ${getLastRun(item.timestamp)}`,
            tooltip: `Last Run: ${getLastRun(item.timestamp)}`,
            className: "truncate"
        });
    }

    if (item.graphName) {
        elements.push({
            content: `GN: ${item.graphName}`,
            tooltip: `Graph Name: ${item.graphName}`,
            className: "truncate"
        });
    }

    if (executionTime) {
        elements.push({
            content: `IET: ${executionTime}`,
            tooltip: `Internal Execution Time: ${executionTime}`,
            className: "truncate"
        });
    }

    return (
        <div className="h-1 grow flex gap-2 items-center w-full text-foreground/60 text-sm">
            {elements.map((element, index) => (
                <Fragment key={element.tooltip}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={element.className}>{element.content}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                            {element.tooltip}
                        </TooltipContent>
                    </Tooltip>
                    {index < elements.length - 1 && getSeparator()}
                </Fragment>
            ))}
        </div>
    );
};

interface Props<T extends Item> {
    list: T[]
    onClick: (label: string, evt: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLInputElement>) => void
    dataTestId: string
    label: string
    afterSearchCallback: (newFilteredList: T[]) => void
    isSelected: (item: T) => boolean
    isDeleteSelected?: (item: T) => boolean
    onDoubleClick?: (label: string, evt: MouseEvent<HTMLButtonElement>) => void
    onToggleFav?: (item: T, name?: string) => void
    searchRef: React.RefObject<HTMLInputElement | null>
    isLoading?: boolean
    className?: string
    children?: React.ReactNode
}

export default function PaginationList<T extends Item>({ list, onClick, onDoubleClick, dataTestId, afterSearchCallback, isSelected, isDeleteSelected, onToggleFav, label, isLoading, className, children, searchRef }: Props<T>) {

    const [filteredList, setFilteredList] = useState<T[]>([...list]);
    const [hoverIndex, setHoverIndex] = useState<number>(0);
    const [stepCounter, setStepCounter] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [search, setSearch] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(1);
    const [favDialogItem, setFavDialogItem] = useState<T | null>(null);
    const [favName, setFavName] = useState("");

    const containerRef = useRef<HTMLUListElement>(null);

    const startIndex = stepCounter * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredList.length);
    const items = filteredList.slice(startIndex, endIndex);
    const itemHeight = typeof items[0] === "string" ? 30 : 50;

    useEffect(() => {
        setStepCounter(0);
        setHoverIndex(0);
    }, [search]);

    useEffect(() => {
        const newPageCount = Math.ceil(filteredList.length / itemsPerPage);
        setPageCount(newPageCount);
        if (newPageCount < stepCounter + 1) setStepCounter(Math.max(0, newPageCount - 1));
    }, [filteredList, itemsPerPage, stepCounter]);

    useEffect(() => {
        const calculateItemsPerPage = () => {
            if (containerRef.current) {
                const containerHeight = containerRef.current.clientHeight;
                const calculatedItems = Math.floor(containerHeight / itemHeight);
                setItemsPerPage(Math.max(1, calculatedItems));
            }
        };

        calculateItemsPerPage();

        const resizeObserver = new ResizeObserver(() => {
            calculateItemsPerPage();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [itemHeight, items, items.length]);

    useEffect(() => {
        const applyFilter = () => {
            const newFilteredList = list.filter((item) => !search || (typeof item === "string" ? item.toLowerCase().includes(search.toLowerCase()) : item.text.toLowerCase().includes(search.toLowerCase()))) || [];
            if (JSON.stringify(newFilteredList) !== JSON.stringify(filteredList)) {
                setFilteredList([...newFilteredList]);
                afterSearchCallback([...newFilteredList]);
            }
        };

        if (!search) {
            applyFilter();
            return undefined;
        }

        const timeout = setTimeout(applyFilter, 500);

        return () => {
            clearTimeout(timeout);
        };
    }, [afterSearchCallback, list, search, filteredList]);

    const handleSetStepCounter = (callback: ((prev: number) => number) | number) => {
        setStepCounter(callback);
        searchRef.current?.focus();
    };

    return (
        <div className={cn("w-full flex flex-col gap-2 p-2", className)}>
            {children}
            <div className="flex gap-2 items-center">
                <Input
                    ref={searchRef}
                    data-testid={`${label}Search`}
                    className="w-full bg-background text-foreground"
                    value={search}
                    placeholder={`Search for a ${label}`}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            e.preventDefault();
                            setSearch("");
                        }

                        if (e.key === "ArrowUp" || (e.shiftKey && e.key === "Tab" && hoverIndex > 0)) {
                            e.preventDefault();

                            setHoverIndex(prev => prev ? prev - 1 : prev);
                        }

                        if (e.key === "ArrowDown" || (!e.shiftKey && e.key === "Tab" && hoverIndex < items.length - 1)) {
                            e.preventDefault();

                            setHoverIndex(prev => prev < items.length - 1 ? prev + 1 : prev);
                        }

                        if (e.key === "Enter") {
                            e.preventDefault();
                            onClick(typeof items[hoverIndex] === "string" ? items[hoverIndex] : items[hoverIndex].text, e);
                        }
                    }}
                    onFocus={() => setHoverIndex(0)}
                    onBlur={() => setHoverIndex(-1)}
                />
                {isLoading && <Loader2 className="w-4 h-4 animate-spin duration-[infinite]" />}
            </div>
            <ul
                ref={containerRef}
                data-testid="queryList"
                className={cn("h-1 grow flex flex-col", items.length > 0 && typeof items[0] === "object" && "SofiaSans")}
            >
                {
                    items.map((item, index) => {
                        const selected = isSelected ? isSelected(item) : false;
                        const deleteSelected = isDeleteSelected ? isDeleteSelected(item) : false;
                        const hover = hoverIndex === index;
                        const isString = typeof item === "string";
                        const text = isString ? item : item.text;

                        const isFav = !isString && item.fav;

                        const content = (
                            <>
                                {
                                    !isString && (item.status || item.elementsCount || item.timestamp || item.graphName || getExecutionTime(item.metadata)) &&
                                    getQueryElement(item)
                                }
                                <p data-testid={`${dataTestId}${text}Text`} className={cn("truncate w-full text-left", !isString && "h-1 grow", getItemClassName(selected, deleteSelected, hover))}>{text}</p>
                            </>
                        );

                        return (
                            <li
                                className={cn(
                                    "border-b cursor-pointer relative",
                                    getItemClassName(selected, deleteSelected, hover)
                                )}
                                data-testid={`${dataTestId}${text}`}
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => searchRef.current !== document.activeElement && setHoverIndex(-1)}
                                style={{ height: `${itemHeight}px` }}
                                key={text}
                            >
                                {!isString && onToggleFav && (
                                    <div
                                        className="absolute right-1 top-1 z-10 flex items-center gap-1"
                                    >
                                        {item.name && <p className="text-fav font-medium truncate max-w-[120px]">{item.name}</p>}
                                        <Button
                                            data-testid={`${dataTestId}${text}Fav`}
                                            title={isFav ? "Remove from favorites" : "Add to favorites"}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isFav) {
                                                    onToggleFav(item);
                                                } else {
                                                    setFavDialogItem(item);
                                                    setFavName("");
                                                }
                                            }}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        >
                                            <Star size={16} className={cn(isFav ? "fill-fav text-fav" : "text-foreground/40")} />
                                        </Button>
                                    </div>
                                )}
                                {
                                    onClick ?
                                        <Button
                                            className={cn("w-full h-full text-xl gap-0", !isString ? "flex-col" : "text-center")}
                                            data-testid={`${dataTestId}${text}Button`}
                                            title={text}
                                            onClick={(e) => {
                                                onClick(text, e);
                                            }}
                                            onDoubleClick={(e) => {
                                                if (onDoubleClick) {
                                                    onDoubleClick(text, e);
                                                }
                                            }}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                const syntheticEvent = {
                                                    ...e,
                                                    type: "rightclick" as const
                                                } as typeof e & { type: "rightclick" };
                                                onClick(text, syntheticEvent);
                                            }}
                                            tabIndex={-1}
                                        >
                                            {content}
                                        </Button>
                                        : content
                                }
                            </li>
                        );
                    })
                }
            </ul>
            <ul className="flex gap-6 p-2 items-center justify-center">
                <li className="flex gap-4">
                    <Button disabled={stepCounter < 4} label="<<" title="Previous 5 pages" onClick={() => setStepCounter(prev => prev > 4 ? prev - 5 : prev)} />
                    <Button disabled={stepCounter === 0} label="<" title="Previous page" onClick={() => handleSetStepCounter(prev => prev > 0 ? prev - 1 : prev)} />
                </li>
                {
                    Array(pageCount).fill(0).map((_, index) => index)
                        .slice(
                            Math.max(0, Math.min(
                                stepCounter - 1,
                                pageCount - 3
                            )),
                            Math.min(
                                Math.max(3, stepCounter + 2),
                                pageCount
                            )
                        )
                        .map((index) => (
                            <li key={index}>
                                <Button
                                    className={cn(index === stepCounter ? "text-foreground" : "text-gray-500")}
                                    label={`[${index + 1}]`}
                                    title={`Page ${index + 1}`}
                                    onClick={() => {
                                        handleSetStepCounter(index);
                                    }}
                                />
                            </li>
                        ))
                }
                <li className="flex gap-4">
                    <Button disabled={stepCounter > pageCount - 2} label=">" title="Next page" onClick={() => handleSetStepCounter(prev => prev < pageCount - 1 ? prev + 1 : prev)} />
                    <Button disabled={stepCounter > pageCount - 6} label=">>" title="Next 5 pages" onClick={() => handleSetStepCounter(prev => prev < pageCount - 5 ? prev + 5 : prev)} />
                </li>
            </ul>
            <Dialog open={!!favDialogItem} onOpenChange={(open) => { if (!open) setFavDialogItem(null); }}>
                <DialogContent className="max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Add to Favorites</DialogTitle>
                        <DialogDescription>Enter a nick name (optional)</DialogDescription>
                    </DialogHeader>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(e) => {
                            e.preventDefault();

                            if (favDialogItem && onToggleFav) {
                                onToggleFav(favDialogItem, favName.trim());
                                setFavDialogItem(null);
                            }
                            
                        }}
                    >
                        <Input
                            autoFocus
                            className="bg-background"
                            placeholder="Favorite name"
                            value={favName}
                            onChange={(e) => setFavName(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="Secondary"
                                label="Cancel"
                                onClick={() => setFavDialogItem(null)}
                            />
                            <Button
                                variant="Primary"
                                label="Save"
                                type="submit"
                            />
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

PaginationList.defaultProps = {
    className: undefined,
    children: undefined,
    isLoading: undefined,
    isDeleteSelected: undefined,
    onToggleFav: undefined,
};