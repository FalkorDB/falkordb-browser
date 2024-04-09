import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
    object: any;
}

const excludedProperties = new Set([
    "category",
    "color",
    "label",
    "target",
    "source"
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataPanel({ object }: Props) {
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
                    Object.entries(object).filter((row) => !excludedProperties.has(row[0])).map((row, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableRow className={rowClass} key={index}>
                            {
                                Object.values(row).map((cell, cellIndex) => {

                                    const strCell = JSON.stringify(cell)
                                    const text = cellIndex === 1 ? JSON.parse(strCell) : strCell
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