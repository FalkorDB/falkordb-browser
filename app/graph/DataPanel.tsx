import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataPanel({ node }: { node: [string, any][] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Value</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    node.map((row, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableRow key={index}>
                            {
                                row.map((cell, cellIndex) => {
                                    const text = cellIndex === 1 ? JSON.stringify(cell).replace(/["]/g, "") : JSON.stringify(cell);
                                    return (
                                        // eslint-disable-next-line react/no-array-index-key
                                        <TableCell key={cellIndex}>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className="max-w-96 truncate">
                                                        {text}
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