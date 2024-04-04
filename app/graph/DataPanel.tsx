import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function DataPanel({node}: {node: Node}) {
    const rowClass = "dark:hover:bg-slate-700 hover:bg-gray-400 border-y-[1px] border-y-gray-700"
    return (
        <Table>
            <TableHeader>
                <TableRow className={rowClass}>
                    <TableHead>Field</TableHead>
                    <TableHead>Value</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    Object.entries(node).map((row, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableRow className={rowClass} key={index}>
                            {
                                Object.values(row).map((cell, cellIndex) => (
                                    // eslint-disable-next-line react/no-array-index-key
                                    <TableCell key={cellIndex}>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger className="max-w-96 truncate">
                                                    {JSON.stringify(cell)}
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{JSON.stringify(cell)}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    )
}