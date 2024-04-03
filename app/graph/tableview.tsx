import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Graph } from "./model";
import { useTheme } from "next-themes";

// eslint-disable-next-line import/prefer-default-export
export function TableView({ graph }: { graph: Graph }) {
    const { theme, systemTheme} = useTheme()
    const dark = theme === "dark" || (theme === "system" && systemTheme === "dark")
    
    return (
        <Table>
            <TableCaption>A list of results</TableCaption>
            <TableHeader>
                <TableRow className={!dark ? "hover:bg-gray-400" : undefined}>
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
                        <TableRow className={!dark ? "hover:bg-gray-400" : undefined} key={index}>
                            {
                                Object.values(row).map((cell, cellIndex) => (
                                    // eslint-disable-next-line react/no-array-index-key
                                    <TableCell key={cellIndex}>
                                        <TooltipProvider><Tooltip><TooltipTrigger className="max-w-96 truncate">
                                            {JSON.stringify(cell)}
                                        </TooltipTrigger><TooltipContent><p>{JSON.stringify(cell)}</p></TooltipContent></Tooltip></TooltipProvider>
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
