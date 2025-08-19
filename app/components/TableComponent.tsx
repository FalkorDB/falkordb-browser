/* eslint-disable import/no-cycle */
/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/require-default-props */

"use client"

import { Checkbox } from "@/components/ui/checkbox";
import { JSONTree } from "react-json-tree"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cell, cn, Row } from "@/lib/utils";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle, Pencil, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Combobox from "./ui/combobox";
import { IndicatorContext } from "./provider";

interface Props {
    headers: string[],
    rows: Row[],
    label: "Graphs" | "Schemas" | "Configs" | "Users" | "TableView",
    entityName: "Graph" | "Schema" | "Config" | "User" | "Element",
    inputRef?: React.RefObject<HTMLInputElement>,
    children?: React.ReactNode,
    setRows?: (rows: Row[]) => void,
    className?: string
    itemHeight?: number
    itemsPerPage?: number
}

export default function TableComponent({ headers, rows, label, entityName, inputRef, children, setRows, className, itemHeight = 70.5, itemsPerPage = 30 }: Props) {

    const { indicator } = useContext(IndicatorContext)

    const searchRef = useRef<HTMLInputElement>(null)
    const headerRef = useRef<HTMLTableRowElement>(null)
    const tableRef = useRef<HTMLTableElement>(null)

    const [search, setSearch] = useState<string>("")
    const [editable, setEditable] = useState<string>("")
    const [hover, setHover] = useState<string>("")
    const [newValue, setNewValue] = useState<string>("")
    const [filteredRows, setFilteredRows] = useState<Row[]>(rows)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [scrollTop, setScrollTop] = useState<number>(0)
    const [startIndex, setStartIndex] = useState<number>(0)
    const [topFakeRowHeight, setTopFakeRowHeight] = useState<number>(0)
    const [bottomFakeRowHeight, setBottomFakeRowHeight] = useState<number>(0)
    const [visibleRows, setVisibleRows] = useState<Row[]>([])

    useEffect(() => {
        const newStartIndex = Math.max(0, Math.floor((scrollTop - (itemHeight * itemsPerPage)) / itemHeight))
        const newEndIndex = Math.min(filteredRows.length, Math.floor((scrollTop + (itemHeight * (itemsPerPage * 2))) / itemHeight))
        const newTopFakeRowHeight = newStartIndex * itemHeight
        const newBottomFakeRowHeight = (filteredRows.length - newEndIndex) * itemHeight
        const newVisibleRows = filteredRows.slice(newStartIndex, newEndIndex)

        setStartIndex(newStartIndex)
        setTopFakeRowHeight(newTopFakeRowHeight)
        setBottomFakeRowHeight(newBottomFakeRowHeight)
        setVisibleRows(newVisibleRows)
    }, [scrollTop, itemHeight, itemsPerPage, filteredRows])

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
        const timeout = setTimeout(() => {
            setFilteredRows(rows.filter((row) => !search || row.cells.some(cell =>
                handleSearchFilter(cell)
            )))
        }, 500)

        return () => {
            clearTimeout(timeout)
        }
    }, [search, rows, handleSearchFilter])

    const handleSetEditable = (editValue: string, value: string) => {
        setEditable(editValue)
        setNewValue(value)
    }

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop((e.target as HTMLDivElement).scrollTop)
    }

    const stripSVG = useMemo(() => encodeURIComponent(
        `<svg width='100%' height='${itemHeight}' xmlns='http://www.w3.org/2000/svg'>
                <line x1='0' y1='${itemHeight - 1}' x2='100%' y2='${itemHeight - 1}' stroke='#e5e7eb' stroke-width='2'/>
        </svg>`
    ), [itemHeight])
    const stripBackground = useMemo(() => `url("data:image/svg+xml,${stripSVG}")`, [stripSVG])
    const columnCount = setRows ? headers.length + 1 : headers.length;

    return (
        <div className={cn("h-full w-full flex flex-col gap-4", className)}>
            <div className="flex gap-4">
                {children}
                <Input
                    data-testid={`searchInput${label}`}
                    ref={searchRef}
                    className="grow"
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
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <Table ref={tableRef} parentOnScroll={handleScroll} className="h-full overflow-hidden">
                <TableHeader>
                    <TableRow ref={headerRef} className="text-nowrap">
                        {
                            setRows ?
                                <TableHead className="w-5 !pr-2" key={headers[0]}>
                                    <Checkbox
                                        data-testid={`tableCheckbox${label}`}
                                        className="w-6 h-6 rounded-full bg-background border-primary data-[state=checked]:bg-primary"
                                        checked={rows.length > 0 && rows.every(row => row.checked)}
                                        onCheckedChange={() => {
                                            setRows(rows.map((row) => {
                                                // eslint-disable-next-line no-param-reassign
                                                row.checked = !rows.every(r => r.checked)
                                                return row
                                            }))
                                        }}
                                    />
                                </TableHead>
                                : null
                        }
                        {
                            headers.map((header, i) => (
                                <TableHead className={cn(i === 0 ? setRows && "border-l" : "border-l", "font-bold text-lg")} key={header}>
                                    {header}
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
                            const actualIndex = startIndex + index;
                            return (
                                <TableRow
                                    data-testid={`tableRow${label}${row.cells[0].value}`}
                                    onMouseEnter={() => setHover(`${actualIndex}`)}
                                    onMouseLeave={() => setHover("")}
                                    data-id={typeof row.cells[0].value === "string" ? row.cells[0].value : undefined}
                                    key={actualIndex}
                                >
                                    {
                                        setRows ?
                                            <TableCell className="w-5 !pr-2">
                                                <Checkbox
                                                    className="w-6 h-6 rounded-full bg-background border-primary data-[state=checked]:bg-primary"
                                                    data-testid={`tableCheckbox${label}${row.cells[0].value}`}
                                                    checked={row.checked}
                                                    onCheckedChange={() => {
                                                        setRows(rows.map((r, k) => {
                                                            if (k === actualIndex) {
                                                                // eslint-disable-next-line no-param-reassign
                                                                r.checked = !r.checked
                                                            }
                                                            return r
                                                        }))
                                                    }}
                                                />
                                            </TableCell>
                                            : null
                                    }
                                    {
                                        row.cells.map((cell, j) => (
                                            <TableCell className={cn(j === 0 ? setRows && "border-l" : "border-l", row.cells[0]?.value === editable && (cell.type !== "readonly" && cell.type !== "object") && "p-2")} key={j}>
                                                {
                                                    cell.type === "object" ?
                                                        <JSONTree
                                                            key={search}
                                                            shouldExpandNodeInitially={() =>
                                                                !!search && handleSearchFilter(cell)
                                                            }
                                                            keyPath={[headers[j]]}
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
                                                                base0D: '#99E4E5', // * keys
                                                                base0E: '#ae81ff',
                                                                base0F: '#cc6633'
                                                            }}
                                                            data={cell.value}
                                                        />
                                                        : editable === `${actualIndex}-${j}` ?
                                                            <div className="w-full flex gap-2 items-center">
                                                                {
                                                                    cell.type === "select" ?
                                                                        <Combobox
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
                                                            : <div className="flex items-center gap-2">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <p>{cell.value}</p>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {cell.value}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                                <div className="w-4">
                                                                    {
                                                                        cell.type !== "readonly" && hover === `${actualIndex}` &&
                                                                        <Button
                                                                            data-testid={`editButton${label}`}
                                                                            className="disabled:cursor-text disabled:opacity-100"
                                                                            indicator={indicator}
                                                                            title="Edit"
                                                                            onClick={() => handleSetEditable(`${actualIndex}-${j}`, cell.value!.toString())}
                                                                        >
                                                                            <Pencil className="w-4 h-4" />
                                                                        </Button>
                                                                    }
                                                                </div>
                                                            </div>
                                                }
                                            </TableCell>
                                        ))
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
        </div>
    )
}