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
    tableHeaders: string[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tableRows: any[][]
    editableCells: EditableCell[]
}

export default function TableView({ tableHeaders, tableRows, editableCells }: Props) {

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
        <Table className="border border-gray-200 rounded-lg">
            <TableHeader className="rounded-t-lg">
                <TableRow className="border-none">
                    {
                        tableHeaders.map((header, index) => (
                            <TableHead key={index} className="font-semibold">{header}</TableHead>
                        ))
                    }
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    tableRows.map((row, index) => (
                        <TableRow key={index} className={cn("border-none", !(index % 2) && "bg-[#57577B] hover:bg-[#57577B]", (index + 1) === tableRows.length && "rounded-b-lg")}>
                            {
                                row.length > 0 ?
                                    row.map((cell, cellIndex) => {
                                        const editableCell = editableCells.find(e => e.index === cellIndex)
                                        const isEditable = editable === `${cellIndex}-${cellIndex}`
                                        return (
                                            <TableCell key={cellIndex}>
                                                {
                                                    editableCell ?
                                                        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                                                        <div
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
    )
}