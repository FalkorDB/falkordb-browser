import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const unusedProperties = [
    "category",
    "color",
    "label",
    "target",
    "source",
    "value",
]

export default function DataPanel({ object }: { object: any }) {
    const rowClass = "dark:hover:bg-slate-700 hover:bg-gray-400 border-y-[1px] border-y-gray-700"

    return (
        <div>
            <p className={rowClass + " text-center p-2"}>
                {object.source ? "edge properties" : "node properties"}
            </p>
            <Table>
                <TableHeader>
                    <TableRow className={rowClass}>
                        <TableHead>Field</TableHead>
                        <TableHead>Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        Object.entries(object).filter((row) => unusedProperties.find(obj => obj === row[0]) === undefined).map((row, index) => (
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
        </div>
    )
}