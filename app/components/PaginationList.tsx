import { cn } from "@/lib/utils"
import { Fragment, useEffect, useRef, useState } from "react"
import { Check, Circle, Loader2, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Button from "./ui/Button"
import { Query } from "../api/graph/model"
import Input from "./ui/Input"

type Item = string | Query

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
}

const getExecutionTime = (metadata: string[]) => metadata.find(value => value.startsWith("Query internal execution time:"))?.split(":")[1].replace(" milliseconds", "ms")

const getSeparator = (selected: boolean, hover: boolean) => (
    <div
        className={cn("h-2/3 w-px rounded-full",
            // eslint-disable-next-line no-nested-ternary
            selected
                ? "bg-primary"
                : hover
                    ? "bg-foreground"
                    : "bg-border"
        )}
    />
)

const getStatusIcon = (status: Query["status"]) => {
    const size = 20
    switch (status) {
        case "Empty":
            return <Circle color="orange" size={size} />
        case "Failed":
            return <X size={size} color="red" />
        default:
            return <Check size={size} color="green" />
    }
}

const getQueryElement = (item: Query, selected: boolean, hover: boolean) => {
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
            content: item.elementsCount,
            tooltip: `Elements: ${item.elementsCount}`,
        });
    }

    if (item.timestamp) {
        elements.push({
            content: getLastRun(item.timestamp),
            tooltip: `Last Run: ${getLastRun(item.timestamp)}`,
            className: "truncate"
        });
    }

    if (item.graphName) {
        elements.push({
            content: item.graphName,
            tooltip: `Graph Name: ${item.graphName}`,
            className: "truncate"
        });
    }

    if (executionTime) {
        elements.push({
            content: executionTime,
            tooltip: `Internal Execution Time: ${executionTime}`,
            className: "truncate"
        });
    }

    return (
        <div className="h-1 grow flex gap-2 items-center w-full">
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
                    {index < elements.length - 1 && getSeparator(selected, hover)}
                </Fragment>
            ))}
        </div>
    );
}

interface Props<T extends Item> {
    list: T[]
    onClick: (label: string) => void
    dataTestId: string
    label: string
    afterSearchCallback: (newFilteredList: T[]) => void
    isSelected: (item: T) => boolean
    searchRef: React.RefObject<HTMLInputElement>
    isLoading?: boolean
    className?: string
    children?: React.ReactNode
}

export default function PaginationList<T extends Item>({ list, onClick, dataTestId, afterSearchCallback, isSelected, label, isLoading, className, children, searchRef }: Props<T>) {

    const [filteredList, setFilteredList] = useState<T[]>([...list])
    const [hoverIndex, setHoverIndex] = useState<number>(0)
    const [stepCounter, setStepCounter] = useState(0)
    const [pageCount, setPageCount] = useState(0)
    const [search, setSearch] = useState("")
    const [itemsPerPage, setItemsPerPage] = useState(1)

    const containerRef = useRef<HTMLUListElement>(null)

    const startIndex = stepCounter * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, filteredList.length)
    const items = filteredList.slice(startIndex, endIndex)
    const itemHeight = typeof items[0] === "string" ? 30 : 50

    useEffect(() => {
        setStepCounter(0)
    }, [filteredList])

    useEffect(() => {
        const newPageCount = Math.ceil(filteredList.length / itemsPerPage)
        setPageCount(newPageCount)
        if (newPageCount < stepCounter + 1) setStepCounter(0)
    }, [filteredList, itemsPerPage, stepCounter])

    useEffect(() => {
        const calculateItemsPerPage = () => {
            if (containerRef.current) {
                const containerHeight = containerRef.current.clientHeight
                const calculatedItems = Math.floor(containerHeight / itemHeight)
                setItemsPerPage(Math.max(1, calculatedItems))
            }
        }

        calculateItemsPerPage()

        const resizeObserver = new ResizeObserver(() => {
            calculateItemsPerPage()
        })

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        return () => {
            resizeObserver.disconnect()
        }
    }, [itemHeight, items, items.length])

    useEffect(() => {
        const timeout = setTimeout(() => {
            const newFilteredList = list.filter((item) => !search || (typeof item === "string" ? item.toLowerCase().includes(search.toLowerCase()) : item.text.toLowerCase().includes(search.toLowerCase()))) || []
            if (JSON.stringify(newFilteredList) !== JSON.stringify(filteredList)) {
                setFilteredList([...newFilteredList])
                afterSearchCallback([...newFilteredList])
                setStepCounter(0)
                setHoverIndex(0)
            }
        }, 500)

        return () => {
            clearTimeout(timeout)
        }
    }, [afterSearchCallback, list, search, filteredList])

    const handleSetStepCounter = (callback: ((prev: number) => number) | number) => {
        setStepCounter(callback)
        searchRef.current?.focus()
    }

    return (
        <div className={cn("w-full flex flex-col gap-2 p-3", className)}>
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
                            e.preventDefault()
                            setSearch("")
                        }

                        if (e.key === "ArrowUp" || (e.shiftKey && e.key === "Tab" && hoverIndex > 0)) {
                            e.preventDefault()

                            setHoverIndex(prev => prev ? prev - 1 : prev)
                        }

                        if (e.key === "ArrowDown" || (!e.shiftKey && e.key === "Tab" && hoverIndex < items.length - 1)) {
                            e.preventDefault()

                            setHoverIndex(prev => prev < items.length - 1 ? prev + 1 : prev)
                        }

                        if (e.key === "Enter") {
                            e.preventDefault()
                            onClick(typeof items[hoverIndex] === "string" ? items[hoverIndex] : items[hoverIndex].text)
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
                className={cn("h-1 grow flex flex-col p-2", items.length > 0 && typeof items[0] === "object" && "SofiaSans")}
            >
                {
                    items.map((item, index) => {
                        const selected = isSelected ? isSelected(item) : false
                        const hover = hoverIndex === index
                        const isString = typeof item === "string"
                        const text = isString ? item : item.text

                        const content = (
                            <>
                                {
                                    !isString && (item.status || item.elementsCount || item.timestamp || item.graphName || getExecutionTime(item.metadata)) &&
                                    getQueryElement(item, selected, hover)
                                }
                                <p data-testid={`${dataTestId}${text}Text`} className={cn("truncate w-full text-left", !isString && "h-1 grow")}>{text}</p>
                            </>
                        )

                        return (
                            <li
                                className={cn(
                                    "border-b cursor-pointer",
                                    // eslint-disable-next-line no-nested-ternary
                                    selected
                                        ? "text-primary border-primary"
                                        : hover
                                            ? "text-foreground border-foreground"
                                            : "text-border border-border"
                                )}
                                data-testid={`${dataTestId}${text}`}
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => searchRef.current !== document.activeElement && setHoverIndex(-1)}
                                style={{ height: `${itemHeight}px` }}
                                key={text}
                            >
                                {
                                    onClick ?
                                        <Button
                                            className={cn("w-full h-full text-xl gap-0", !isString ? "flex-col" : "text-center")}
                                            data-testid={`${dataTestId}${text}Button`}
                                            title={text}
                                            onClick={() => {
                                                onClick(text)
                                            }}
                                            tabIndex={-1}
                                        >
                                            {content}
                                        </Button>
                                        : content
                                }
                            </li>
                        )
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
                                        handleSetStepCounter(index)
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
        </div>
    )
}

PaginationList.defaultProps = {
    className: undefined,
    children: undefined,
    isLoading: undefined,
}