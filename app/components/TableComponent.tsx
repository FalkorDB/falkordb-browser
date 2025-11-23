/* eslint-disable no-param-reassign */
/* eslint-disable import/no-cycle */
/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/require-default-props */

"use client"

import { Checkbox } from "@/components/ui/checkbox";
import { JSONTree } from "react-json-tree"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cell, cn, getTheme, Row } from "@/lib/utils";
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle, ChevronDown, ChevronsDown, ChevronsUp, Loader2, Pencil, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Combobox from "./ui/combobox";
import { IndicatorContext } from "./provider";

interface Props {
    headers: string[],
    rows: Row[],
    label: "Graphs" | "Schemas" | "Configs" | "Users" | "TableView",
    entityName: "Graph" | "Schema" | "Config" | "User" | "Element",
    valueClassName?: string
    inputRef?: React.RefObject<HTMLInputElement>,
    children?: React.ReactNode,
    setRows?: (rows: Row[]) => void,
    className?: string
    itemHeight?: number
    itemsPerPage?: number
    initialScrollPosition?: number
    onScrollChange?: Dispatch<SetStateAction<number>>
    initialSearch?: string
    onSearchChange?: Dispatch<SetStateAction<string>>
    initialExpand?: Map<number, number>
    onExpandChange?: Dispatch<SetStateAction<Map<number, number>>>
}

export default function TableComponent({
    headers,
    rows,
    label,
    entityName,
    valueClassName,
    inputRef,
    children,
    setRows,
    className,
    itemHeight = 70.5,
    itemsPerPage = 30,
    initialScrollPosition,
    onScrollChange,
    initialSearch,
    onSearchChange,
    initialExpand,
    onExpandChange
}: Props) {

    const { indicator } = useContext(IndicatorContext)

    const { theme } = useTheme()
    const { currentTheme } = getTheme(theme)

    const searchRef = useRef<HTMLInputElement>(null)
    const headerRef = useRef<HTMLTableRowElement>(null)
    const tableRef = useRef<HTMLTableElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const loadAttemptedRef = useRef<Set<string>>(new Set());
    const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

    const [hasRestored, setHasRestored] = useState(false)
    const [search, setSearch] = useState<string>("")
    const [editable, setEditable] = useState<string>("")
    const [hover, setHover] = useState<string>("")
    const [newValue, setNewValue] = useState<string>("")
    const [filteredRows, setFilteredRows] = useState<Row[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [scrollTop, setScrollTop] = useState<number>(0)
    const [topFakeRowHeight, setTopFakeRowHeight] = useState<number>(0)
    const [bottomFakeRowHeight, setBottomFakeRowHeight] = useState<number>(0)
    const [visibleRows, setVisibleRows] = useState<Row[]>([])
    const [loadingCells, setLoadingCells] = useState<Set<string>>(new Set())
    const [loadedCells, setLoadedCells] = useState<Set<string>>(new Set())
    const [expandArr, setExpandArr] = useState(new Map(initialExpand))

    const height = useMemo(() => expandArr.size === 0 ? itemHeight : itemHeight * 2, [expandArr.size, itemHeight])

    const handleLoadLazyCell = useCallback((rowName: string, cellIndex: number, loadFn: () => Promise<any>) => {
        // Use row name for stable cell key
        const cellKey = `${rowName}-${cellIndex}`;

        // If already loading or loaded, don't load again
        if (loadingCells.has(cellKey) || loadedCells.has(cellKey)) {
            return;
        }

        // Verify the row still exists before starting the request (prevents loading deleted rows)
        const rowStillExists = rows.some(r => r.name === rowName);
        if (!rowStillExists) {
            return;
        }

        // Create abort controller for this request
        const abortController = new AbortController();
        abortControllersRef.current.set(cellKey, abortController);

        // Mark as loading
        setLoadingCells(prev => new Set(prev).add(cellKey));

        // Load the cell value asynchronously
        loadFn().then(value => {
            // Check if request was aborted
            if (abortController.signal.aborted) {
                return;
            }

            // Verify the row still exists and update it
            let rowFound = false;
            rows.forEach((r) => {
                if (r.name === rowName) {
                    rowFound = true;
                    r.cells.forEach((c, j) => {
                        if (j === cellIndex) {
                            c.value = value
                        }
                    })
                }
            });

            // Only mark as loaded if row still exists
            if (rowFound) {
                setLoadedCells(prev => new Set(prev).add(cellKey));
            }

            setLoadingCells(prev => {
                const newSet = new Set(prev);
                newSet.delete(cellKey);
                return newSet;
            });

            // Clean up abort controller
            abortControllersRef.current.delete(cellKey);
        }).catch((error) => {
            // Only log error if not aborted
            if (!abortController.signal.aborted) {
                // eslint-disable-next-line no-console
                console.error(`Failed to load cell ${cellKey}:`, error);
            }

            // Remove from loading set on error
            setLoadingCells(prev => {
                const newSet = new Set(prev);
                newSet.delete(cellKey);
                return newSet;
            });

            // Clean up abort controller
            abortControllersRef.current.delete(cellKey);
        });
    }, [loadingCells, loadedCells, rows])

    useEffect(() => {
        const newStartIndex = Math.max(0, Math.floor((scrollTop - (height * itemsPerPage)) / height))
        const newEndIndex = Math.min(filteredRows.length, Math.floor((scrollTop + (height * (itemsPerPage * 2))) / height))
        const newTopFakeRowHeight = newStartIndex * height
        const newBottomFakeRowHeight = (filteredRows.length - newEndIndex) * height
        const newVisibleRows = [...filteredRows].slice(newStartIndex, newEndIndex)

        setTopFakeRowHeight(newTopFakeRowHeight)
        setBottomFakeRowHeight(newBottomFakeRowHeight)
        setVisibleRows(newVisibleRows)
    }, [scrollTop, itemHeight, itemsPerPage, filteredRows, height])

    useEffect(() => {
        if (searchRef.current) {
            searchRef.current.focus()
        }
    }, [])

    useEffect(() => {
        if (inputRef && inputRef.current && editable) {
            inputRef.current.focus()
        }
    }, [inputRef, editable])

    useEffect(() => {
        if (searchRef.current) {
            searchRef.current.focus()
        }
    }, [])

    const handleSearchFilter = useCallback((cell: Cell): boolean => {
        if (!cell.value) return false;

        const searchLower = search.toLowerCase();

        if (cell.type === "object") {
            return Object.values(cell.value).some(value => {
                if (typeof value === "object") {
                    return Object.values(value).some(val =>
                        val?.toString().toLowerCase().includes(searchLower)
                    );
                }
                return value?.toString().toLowerCase().includes(searchLower);
            });
        }

        return cell.value.toString().toLowerCase().includes(searchLower);
    }, [search])

    useEffect(() => {
        if (!search) {
            setFilteredRows([...rows])
            return undefined
        }

        const timeout = setTimeout(() => {
            setFilteredRows([...rows].filter((row) => row.cells.some(cell =>
                handleSearchFilter(cell)
            )))
        }, 500)

        return () => {
            clearTimeout(timeout)
        }
    }, [search, rows, handleSearchFilter])

    // Clean up when rows change and cells no longer have values
    useEffect(() => {
        // Clear both loaded cells and load attempts when rows are recreated without values
        const newLoadedCells = new Set<string>();
        const newLoadAttempts = new Set<string>();
        const validCellKeys = new Set<string>();

        rows.forEach((row) => {
            row.cells.forEach((cell, cellIndex) => {
                // Use row name for stable cell key
                const cellKey = `${row.name}-${cellIndex}`;
                validCellKeys.add(cellKey);

                // If cell has a value, keep it as loaded
                if (cell.value) {
                    newLoadedCells.add(cellKey);
                    newLoadAttempts.add(cellKey);
                }
                // If it's a lazy cell without value, clear the attempt so it can retry
                else if (cell.type === "readonly" && "loadCell" in cell) {
                    loadAttemptedRef.current.delete(cellKey);
                }
            });
        });

        // Abort any pending requests for cells that no longer exist
        abortControllersRef.current.forEach((controller, cellKey) => {
            if (!validCellKeys.has(cellKey)) {
                controller.abort();
                abortControllersRef.current.delete(cellKey);
            }
        });

        loadAttemptedRef.current = newLoadAttempts;
        setLoadedCells(newLoadedCells);

        // Also clean up loading cells state for cells that no longer exist
        setLoadingCells(prev => {
            const newSet = new Set<string>();
            prev.forEach(cellKey => {
                if (validCellKeys.has(cellKey)) {
                    newSet.add(cellKey);
                }
            });
            return newSet;
        });
    }, [rows])

    useEffect(() => {
        // Restore scroll position on mount
        if (hasRestored || filteredRows.length === 0) return () => { }

        // Use setTimeout to ensure virtual scroll content is rendered
        const timer = setTimeout(() => {
            if (initialScrollPosition && scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = initialScrollPosition
                setScrollTop(initialScrollPosition)
            }

            if (initialSearch) {
                setSearch(initialSearch)
            }

            setHasRestored(true)
        }, 0)

        return () => clearTimeout(timer)
    }, [hasRestored, initialScrollPosition, filteredRows.length, initialSearch])

    // Cleanup: abort all pending requests on unmount
    useEffect(() => () => {
        abortControllersRef.current.forEach((controller) => {
            controller.abort();
        });
        abortControllersRef.current.clear();
    }, [])

    const handleSetEditable = (editValue: string, value: string) => {
        setEditable(editValue)
        setNewValue(value)
    }

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const newScrollTop = (e.target as HTMLDivElement).scrollTop
        setScrollTop(newScrollTop)
        if (onScrollChange) {
            onScrollChange(newScrollTop)
        }
    }

    const stripSVG = useMemo(() => encodeURIComponent(
        `<svg width='100%' height='${itemHeight}' xmlns='http://www.w3.org/2000/svg'>
                <line x1='0' y1='${itemHeight - 1}' x2='100%' y2='${itemHeight - 1}' stroke='#e5e7eb' stroke-width='2'/>
        </svg>`
    ), [itemHeight])
    const stripBackground = useMemo(() => `url("data:image/svg+xml,${stripSVG}")`, [stripSVG])
    const columnCount = setRows ? headers.length + 1 : headers.length;

    const renderValue = (v: any) => (
        <span className={cn("pointer-events-auto", valueClassName)}>{v}</span>
    )

    const renderLabel = (l: any) => (
        <span className={cn(valueClassName)}>{l[0]}:</span>
    )

    const getClassName = (index: number, level?: number) => cn("text-border rounded-lg", expandArr.get(index) === level && "bg-background text-foreground")

    return (
        <div className={cn("h-full w-full flex flex-col gap-4", className)}>
            <div className="flex gap-4">
                {children}
                <Input
                    data-testid={`searchInput${label}`}
                    ref={searchRef}
                    className={cn("grow", valueClassName)}
                    value={search}
                    type="text"
                    placeholder={`Search for${entityName ? ` a ${entityName}` : ""}`}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            e.preventDefault()
                            setSearch("")
                        }

                        if (e.key !== "Enter") return
                        e.preventDefault()
                    }}
                    onChange={(e) => {
                        const val = e.target.value
                        setSearch(val)
                        if (onSearchChange) onSearchChange(val)
                    }}
                />
            </div>
            <Table ref={tableRef} parentRef={scrollContainerRef} parentOnScroll={handleScroll} className="h-full" parentClassName="p-1 relative">
                <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow ref={headerRef} className="text-nowrap border-border">
                        {
                            setRows ?
                                <TableHead className="w-5 !pr-2 border-r border-border" key={headers[0]}>
                                    <Checkbox
                                        data-testid={`tableCheckbox${label}`}
                                        className="w-6 h-6 rounded-full bg-background border-primary data-[state=checked]:bg-primary"
                                        checked={rows.length > 0 && rows.every(row => row.checked)}
                                        onCheckedChange={() => {
                                            const checked = rows.every(row => row.checked)
                                            setRows(rows.map((row) => {
                                                row.checked = !checked
                                                return row
                                            }))
                                        }}
                                    />
                                </TableHead>
                                : null
                        }
                        <TableHead key="index" className="w-0 border-r border-border">Index</TableHead>
                        {
                            headers.map((header, i) => (
                                <TableHead className={cn(i + 1 !== headers.length && "border-r", "font-bold text-lg border-border")} key={header}>
                                    <div className="flex gap-2 justify-between">
                                        <p>{header}</p>
                                        {
                                            visibleRows.some(r => r.cells[i].type === "object") &&
                                            <div className="flex gap-2 bg-secondary p-1 rounded-lg">
                                                <Button
                                                    className={getClassName(i, 1)}
                                                    title="Expand Root"
                                                    onClick={() => {
                                                        const newExpandArr = new Map(expandArr).set(i, 1)
                                                        setExpandArr(newExpandArr)

                                                        if (onExpandChange) onExpandChange(newExpandArr)
                                                    }}
                                                >
                                                    <ChevronDown />
                                                </Button>
                                                <Button
                                                    title="Expand All"
                                                    className={getClassName(i, -1)}
                                                    onClick={() => {
                                                        const newExpandArr = new Map(expandArr).set(i, -1)
                                                        setExpandArr(newExpandArr)

                                                        if (onExpandChange) onExpandChange(newExpandArr)
                                                    }}
                                                >
                                                    <ChevronsDown />
                                                </Button>
                                                <Button
                                                    title="Collapse All"
                                                    className={getClassName(i)}
                                                    onClick={() => {
                                                        const newExpandArr = new Map(expandArr)
                                                        newExpandArr.delete(i)
                                                        setExpandArr(newExpandArr)

                                                        if (onExpandChange) onExpandChange(newExpandArr)
                                                    }}
                                                >
                                                    <ChevronsUp />
                                                </Button>
                                            </div>
                                        }
                                    </div>
                                </TableHead>
                            ))
                        }
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        topFakeRowHeight > 0 && (
                            <tr className="fakeRow">
                                {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                                <td
                                    className="animate-pulse"
                                    style={{
                                        height: `${topFakeRowHeight}px`,
                                        backgroundImage: stripBackground,
                                        backgroundRepeat: 'repeat-y',
                                        backgroundSize: `100% ${itemHeight}px`,
                                        overflow: 'hidden'
                                    }}
                                    colSpan={columnCount}
                                />
                            </tr>
                        )
                    }
                    {
                        visibleRows.map((row, index) => {
                            const rowTestID = `${label}${row.name}`

                            return (
                                <TableRow
                                    className="border-border"
                                    data-testid={`tableRow${rowTestID}`}
                                    onMouseEnter={() => setHover(row.name)}
                                    onMouseLeave={() => setHover("")}
                                    key={row.name}
                                >
                                    {
                                        setRows ?
                                            <TableCell className="w-5 !pr-2 border-r border-border">
                                                <Checkbox
                                                    className="w-6 h-6 rounded-full bg-background border-primary data-[state=checked]:bg-primary"
                                                    data-testid={`tableCheckbox${rowTestID}`}
                                                    checked={row.checked}
                                                    onCheckedChange={() => {
                                                        setRows(rows.map((r) => {
                                                            if (r.name === row.name) {
                                                                r.checked = !r.checked
                                                            }
                                                            return r
                                                        }))
                                                    }}
                                                />
                                            </TableCell>
                                            : null
                                    }
                                    <TableCell className="border-r border-border">
                                        <p>{index + 1}.</p>
                                    </TableCell>
                                    {
                                        row.cells.map((cell, j) => {
                                            // Use row name for stable cell key
                                            const cellKey = `${row.name}-${j}`;
                                            const cellTestId = `${label}${row.name}`;
                                            const isCellLoading = loadingCells.has(cellKey);
                                            const isLazyCell = cell.type === "readonly" && "loadCell" in cell && cell.loadCell;

                                            // Only load if it's a lazy cell, has no value, not currently loading, and we haven't attempted to load it yet
                                            if (isLazyCell && !cell.value && !loadingCells.has(cellKey) && !loadAttemptedRef.current.has(cellKey)) {
                                                loadAttemptedRef.current.add(cellKey);
                                                handleLoadLazyCell(row.name, j, cell.loadCell);
                                            }

                                            // Show loader while loading
                                            if (isCellLoading) {
                                                return <TableCell className={cn(j + 1 !== row.cells.length && "border-r", row.cells[0]?.value === editable && (cell.type !== "readonly" && cell.type !== "object") && "p-2", cell.type === "object" && "p-1", "border-border")} key={j}><Loader2 className="w-4 h-4 animate-spin" /></TableCell>;
                                            }

                                            // Show value once loaded
                                            return (
                                                <TableCell className={cn("border-border p-0", j + 1 !== row.cells.length && "border-r")} key={cellKey}>
                                                    <div style={{ height }} className={cn("overflow-auto p-4", row.cells[0]?.value === editable && (cell.type !== "readonly" && cell.type !== "object") && "p-2", cell.type === "object" && "p-1")}>
                                                        {
                                                            cell.type === "object" ?
                                                                <div className="pointer-events-none json-tree-container">
                                                                    <JSONTree
                                                                        key={`${Array.from(expandArr.values()).join(",")}-${j}`}
                                                                        shouldExpandNodeInitially={(keyPath) => expandArr.get(j) === -1 || keyPath.length === expandArr.get(j)}
                                                                        keyPath={[headers[j]]}
                                                                        valueRenderer={renderValue}
                                                                        labelRenderer={(keyPath) => renderLabel(keyPath)}
                                                                        theme={{
                                                                            base00: "var(--background)", // background
                                                                            base01: '#000000',
                                                                            base02: '#CE9178',
                                                                            base03: '#CE9178', // open values
                                                                            base04: '#CE9178',
                                                                            base05: '#CE9178',
                                                                            base06: '#CE9178',
                                                                            base07: '#CE9178',
                                                                            base08: '#CE9178',
                                                                            base09: '#b5cea8', // numbers
                                                                            base0A: '#CE9178',
                                                                            base0B: '#CE9178', // close values
                                                                            base0C: '#CE9178',
                                                                            base0D: currentTheme === "dark" ? '#66B2B5' : '#4A90A4', // * keys
                                                                            base0E: '#ae81ff',
                                                                            base0F: '#cc6633'
                                                                        }}
                                                                        data={cell.value}
                                                                    />
                                                                </div>
                                                                : editable === cellKey ?
                                                                    <div className="w-full flex gap-2 items-center">
                                                                        {
                                                                            cell.type === "select" ?
                                                                                <Combobox
                                                                                    data-testid={`select${label}`}
                                                                                    inTable
                                                                                    options={cell.options}
                                                                                    setSelectedValue={async (value) => {
                                                                                        const result = await cell.onChange(value)
                                                                                        if (result) {
                                                                                            handleSetEditable("", "")
                                                                                        }
                                                                                    }}
                                                                                    label={cell.selectType}
                                                                                    selectedValue={cell.value.toString()}
                                                                                />
                                                                                : cell.type === "text" &&
                                                                                <Input
                                                                                    data-testid={`input${label}`}
                                                                                    ref={inputRef}
                                                                                    className="grow"
                                                                                    value={newValue}
                                                                                    onChange={(e) => setNewValue(e.target.value)}
                                                                                    onKeyDown={async (e) => {
                                                                                        if (e.key === "Escape") {
                                                                                            e.preventDefault()
                                                                                            e.stopPropagation()
                                                                                            handleSetEditable("", "")
                                                                                        }

                                                                                        if (e.key !== "Enter") return

                                                                                        e.preventDefault()
                                                                                        const result = await cell.onChange(newValue)
                                                                                        if (result) {
                                                                                            handleSetEditable("", "")
                                                                                        }
                                                                                    }}
                                                                                />
                                                                        }
                                                                        <div className="flex flex-col gap-1">
                                                                            {
                                                                                cell.type !== "select" && cell.type !== "readonly" &&
                                                                                <Button
                                                                                    data-testid={`saveButton${label}`}
                                                                                    title="Save"
                                                                                    onClick={async () => {
                                                                                        try {
                                                                                            setIsLoading(true)
                                                                                            const result = await cell.onChange(newValue)
                                                                                            if (result) {
                                                                                                handleSetEditable("", "")
                                                                                            }
                                                                                        } finally {
                                                                                            setIsLoading(false)
                                                                                        }
                                                                                    }}
                                                                                    isLoading={isLoading}
                                                                                >
                                                                                    <CheckCircle className="w-4 h-4" />
                                                                                </Button>
                                                                            }
                                                                            {
                                                                                !isLoading &&
                                                                                <Button
                                                                                    data-testid={`cancelButton${label}`}
                                                                                    title="Cancel"
                                                                                    onClick={() => {
                                                                                        handleSetEditable("", "")
                                                                                    }}
                                                                                >
                                                                                    <XCircle className="w-4 h-4" />
                                                                                </Button>
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    : <div className="h-full flex items-center gap-2">
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <p data-testid={`content${cellTestId}${headers[j]}`} >{cell.value}</p>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                {cell.value}
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                        <div className="w-4">
                                                                            {
                                                                                cell.type !== "readonly" && hover === row.name &&
                                                                                <Button
                                                                                    data-testid={`editButton${label}`}
                                                                                    className="disabled:cursor-text disabled:opacity-100"
                                                                                    indicator={indicator}
                                                                                    title="Edit"
                                                                                    onClick={() => handleSetEditable(cellKey, cell.value!.toString())}
                                                                                >
                                                                                    <Pencil className="w-4 h-4" />
                                                                                </Button>
                                                                            }
                                                                        </div>
                                                                    </div>
                                                        }
                                                    </div>
                                                </TableCell>
                                            )
                                        })
                                    }
                                </TableRow>
                            )
                        })
                    }
                    {
                        bottomFakeRowHeight > 0 && (
                            <tr
                                className="animate-pulse fakeRow"
                                style={{
                                    height: `${bottomFakeRowHeight}px`,
                                    backgroundImage: stripBackground,
                                    backgroundRepeat: 'repeat-y',
                                    backgroundSize: `100% ${itemHeight}px`,
                                    overflow: 'hidden'
                                }}
                            >
                                {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                                <td
                                    className="animate-pulse"
                                    style={{
                                        height: `${bottomFakeRowHeight}px`,
                                        backgroundImage: stripBackground,
                                        backgroundRepeat: 'repeat-y',
                                        backgroundSize: `100% ${itemHeight}px`,
                                        overflow: 'hidden'
                                    }}
                                    colSpan={columnCount}
                                />
                            </tr>
                        )
                    }
                </TableBody>
            </Table>
        </div >
    )
}