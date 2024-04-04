'use client'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { JSONTree } from "react-json-tree"
import { transparent } from "tailwindcss/colors";
import { useTheme } from "next-themes";
import { Graph } from "./model";

// eslint-disable-next-line import/prefer-default-export
export function TableView({ graph }: { graph: Graph }) {
    const { theme, systemTheme} = useTheme()
    const dark = theme === "dark" || (theme === "system" && systemTheme === "dark")
    const rowClass = !dark ? "hover:bg-gray-400" : undefined
    return (
        <Table>
            <TableCaption>A list of results</TableCaption>
            <TableHeader>
                <TableRow className={rowClass}>
                    {
                        graph.Columns.map((column, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <TableHead key={index}>{column}</TableHead>
                        ))
                    }
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    graph.Data.map((row, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableRow className={rowClass} key={index}>
                            {
                                Object.values(row).map((cell, cellIndex) => {
                                    // eslint-disable-next-line no-useless-escape
                                    const text = JSON.stringify(cell).replace(/[\[\]{}:,]/g, (match) => {
                                        switch (match) {
                                            case ":": return ': ';
                                            case ",": return ', ';
                                            default: return '';
                                        }
                                    });
                                    return (
                                        // eslint-disable-next-line react/no-array-index-key
                                        <TableCell key={cellIndex}>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className="max-w-96 truncate">
                                                        {typeof cell === "object" ? (
                                                            <JSONTree
                                                                data={cell}
                                                                shouldExpandNodeInitially={() => false}
                                                                theme={{
                                                                    // background
                                                                    base00: transparent,
                                                                    // number of keys keys
                                                                    base03: transparent,
                                                                    // value number
                                                                    // base09: transparent,
                                                                    // value string
                                                                    // base0B: transparent,
                                                                    // keys and triangles
                                                                    // base0D: transparent,
                                                                }}
                                                            />
                                                        ) : (text)}
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{text}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                    )
                                })
                            }
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    )
}
