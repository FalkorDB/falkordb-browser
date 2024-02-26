import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function DataPanel({node}: {node: Node}) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="border-gray-300 border">
                    <TableHead>Field</TableHead>
                    <TableHead>Value</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    Object.entries(node).map((row, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableRow key={index} className="border-gray-300">
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