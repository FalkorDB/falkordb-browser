'use client'

/* eslint-disable react/no-array-index-key */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Dispatch, SetStateAction, useState } from "react"

type EditableCell = {
    index: number
    setState: Dispatch<SetStateAction<string[]>>
}

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tableHeaders: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tableRows: any[][]
    editableCells: EditableCell[]
    onHoverCells: number[]
}

export default function TableView({ tableHeaders, tableRows, editableCells, onHoverCells }: Props) {

    const [hover, setHover] = useState(-1)
    const [editable, setEditable] = useState("")
    const [val, setVal] = useState("")

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, set: Dispatch<SetStateAction<string[]>>) => {
        if (e.key === "Escape") {
            e.preventDefault()
            setEditable("")
            setVal("")
            return
        }

        if (e.key !== "Enter") return

        e.preventDefault()
        const rowIndex = parseInt(editable.split("-")[0], 10)
        const cellIndex = parseInt(editable.split("-")[1], 10)

        set([tableRows[rowIndex][cellIndex], val])

        setEditable("")
    }

    return (
        <div className="border border-[#57577B] rounded-lg overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-none">
                        {
                            tableHeaders.map((header, index) => (
                                <TableHead key={index} className={cn("font-semibold", editableCells.length > 0 && "p-8")}>{Array.isArray(header) ? header[0] : header}</TableHead>
                            ))
                        }
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        tableRows.map((row, index) => (
                            <TableRow
                                className={cn("border-none", !(index % 2) && "bg-[#57577B] hover:bg-[#57577B]")}
                                onMouseEnter={() => setHover(index)}
                                onMouseLeave={() => setHover(-1)} key={index}
                            >
                                {
                                    row.length > 0 ?
                                        row.map((cell, cellIndex) => {
                                            const editableCell = editableCells.find(e => e.index === cellIndex)
                                            const isEditable = editable === `${cellIndex}-${cellIndex}`
                                            const isOnHover = onHoverCells.includes(cellIndex)
                                            const isHover = hover === index
                                            return (
                                                <TableCell className={cn(`text-wrap`, Array.isArray(tableHeaders[cellIndex]) && tableHeaders[cellIndex][1])} key={cellIndex}>
                                                    {
                                                        // eslint-disable-next-line no-nested-ternary
                                                        !isOnHover ?
                                                            editableCell ?
                                                                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                                                                <div
                                                                    ref={(ref) => {
                                                                        if (!ref?.isContentEditable) return
                                                                        ref?.focus()
                                                                    }}
                                                                    className={cn("p-4", isEditable && "bg-[#1F1F3D] hover:bg-[#2E2E51] focus:border focus:border-[#5D5FEF] rounded-lg")}
                                                                    contentEditable={isEditable}
                                                                    onBlur={() => setEditable("")}
                                                                    onKeyDown={(e) => onKeyDown(e, editableCell.setState)}
                                                                    onClick={() => setEditable(`${index}-${cellIndex}`)}
                                                                    onInput={(e) => setVal(e.currentTarget.textContent || "")}
                                                                >
                                                                    {cell}
                                                                </div>
                                                                : cell
                                                            : isHover ? cell : ""
                                                    }
                                                </TableCell>
                                            )
                                        }) : <TableCell />
                                }
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}