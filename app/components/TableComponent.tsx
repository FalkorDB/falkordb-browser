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
import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Pencil, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Combobox from "./ui/combobox";

interface Props {
    headers: string[],
    rows: Row[],
    children?: React.ReactNode,
    setRows?: (rows: Row[]) => void,
    options?: string[]
    className?: string
}

export default function TableComponent({ headers, rows, children, setRows, options, className }: Props) {

    const [search, setSearch] = useState<string>("")
    const [isSearchable, setIsSearchable] = useState<boolean>(false)
    const [editable, setEditable] = useState<string>("")
    const [hover, setHover] = useState<string>("")
    const [newValue, setNewValue] = useState<string>("")
    const [filteredRows, setFilteredRows] = useState<Row[]>(rows)

    const handleSearchFilter = useCallback((cell: Cell): boolean => {
        if (!cell.value) return false;

        const searchLower = search.toLowerCase();

        if (typeof cell.value === "object") {
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

    return (
        <div className={cn("h-full w-full flex flex-col gap-4", className)}>
            <div className="flex gap-4" id="tableComponent">
                {children}
                {
                    isSearchable ?
                        <Input
                            ref={ref => ref?.focus()}
                            variant="primary"
                            className="grow"
                            value={search}
                            type="text"
                            placeholder="Search for"
                            onBlur={() => setIsSearchable(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                    e.preventDefault()
                                    setIsSearchable(false)
                                    setSearch("")
                                }

                                if (e.key !== "Enter") return
                                e.preventDefault()
                                setIsSearchable(false)
                            }}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        : <Button
                            variant="Secondary"
                            label="Search"
                            title="Search within the table"
                            onClick={() => setIsSearchable(true)}
                        />
                }
            </div>
            <Table className="h-full overflow-hidden">
                <TableHeader>
                    <TableRow className="text-nowrap">
                        {
                            setRows ?
                                <TableHead className="w-5 !pr-2" key={headers[0]}>
                                    <Checkbox
                                        checked={rows.length > 0 && rows.every(row => row.checked)}
                                        onCheckedChange={() => {
                                            const checked = !rows.every(row => row.checked)
                                            setRows(rows.map(row => ({ ...row, checked })))
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
                <TableBody className="overflow-auto">
                    {
                        filteredRows.map((row, i) => (
                            <TableRow
                                onMouseEnter={() => setHover(`${i}`)}
                                onMouseLeave={() => setHover("")}
                                data-id={typeof row.cells[0].value === "string" ? row.cells[0].value : undefined}
                                key={i}
                            >
                                {
                                    setRows ?
                                        <TableCell className="w-5 !pr-2">
                                            <Checkbox
                                                checked={row.checked}
                                                onCheckedChange={() => {
                                                    setRows(rows.map((r, k) => k === i ? ({ ...r, checked: !r.checked }) : r))
                                                }}
                                            />
                                        </TableCell>
                                        : null
                                }
                                {
                                    row.cells.map((cell, j) => (
                                        <TableCell className={cn(j === 0 ? setRows && "border-l" : "border-l", row.cells[0]?.value === editable && cell.onChange && "p-2")} key={j}>
                                            {
                                                typeof cell.value === "object" ?
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
                                                      : editable === `${i}-${j}` ?
                                                        <div className="w-full flex gap-2 items-center">
                                                            {
                                                                cell.type === "combobox" ?
                                                                    <Combobox
                                                                        options={options!}
                                                                        setSelectedValue={(value) => {
                                                                            cell.onChange!(value)
                                                                            handleSetEditable("", "")
                                                                        }}
                                                                        label={cell.comboboxType}
                                                                        selectedValue={cell.value.toString()}
                                                                    />
                                                                    : <Input
                                                                        ref={ref => ref?.focus()}
                                                                        variant="primary"
                                                                        className="grow"
                                                                        value={newValue}
                                                                        onChange={(e) => setNewValue(e.target.value)}
                                                                        onKeyDown={async (e) => {
                                                                            if (e.key === "Escape") {
                                                                                e.preventDefault()
                                                                                handleSetEditable("", "")
                                                                            }

                                                                            if (e.key !== "Enter") return

                                                                            e.preventDefault()
                                                                            const result = await cell.onChange!(newValue)
                                                                            if (result) {
                                                                                handleSetEditable("", "")
                                                                            }
                                                                        }}
                                                                    />
                                                            }
                                                            <div className="flex flex-col gap-1">
                                                                {
                                                                    cell.type !== "combobox" &&
                                                                    <Button
                                                                        title="Save"
                                                                        onClick={() => {
                                                                            cell.onChange!(newValue)
                                                                            handleSetEditable("", "")
                                                                        }}
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    </Button>
                                                                }
                                                                <Button
                                                                    title="Cancel"
                                                                    onClick={() => {
                                                                        handleSetEditable("", "")
                                                                    }}
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </Button>
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
                                                                    cell.onChange && hover === `${i}` &&
                                                                    <Button
                                                                        className="disabled:cursor-text disabled:opacity-100"
                                                                        disabled={!cell.onChange}
                                                                        title="Edit"
                                                                        onClick={() => handleSetEditable(`${i}-${j}`, cell.value!.toString())}
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
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}