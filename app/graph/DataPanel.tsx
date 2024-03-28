import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node: [string, any][] 
}

export default function DataPanel({ node }: Props) {
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
                    node.map((row, index) => {
                        let i = 0;
                        return (
                            // eslint-disable-next-line react/no-array-index-key
                            <TableRow key={index}>
                                {
                                    Object.values(row).map((cell, cellIndex) => {
                                        let text = "";
                                        if (i === 0) {
                                            text = JSON.stringify(cell)
                                            i += 1
                                        } else {
                                            text = JSON.stringify(cell).replace(/"/g, '')
                                            i -= 1
                                        }

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
                        )
                    })
                }
            </TableBody>
        </Table>
    )
}