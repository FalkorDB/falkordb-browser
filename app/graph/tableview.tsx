import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Graph } from "./model";

// eslint-disable-next-line import/prefer-default-export
export function TableView({ graph }: { graph: Graph }) {
    console.log(Object.values(graph.Data[0]).map((cell) => cell));
    return (
        <Table>
            <TableCaption>A list of results</TableCaption>
            <TableHeader>
                <TableRow>
                    {
                        graph.Columns.map((column, index) => {
                            // eslint-disable-next-line react/no-array-index-key
                            return <TableHead key={index}>{column}</TableHead>
                        })
                    }
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    graph.Data.map((row, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableRow key={index}>
                            {
                                Object.values(row).map((cell, cellIndex) => {
                                    const text = JSON.stringify(cell)
                                        .replace(/[{}\[\]":]/g, (match) => {
                                            switch (match) {
                                                case '{':
                                                case '}':
                                                case '[':
                                                case ']':
                                                case '"':
                                                    return '';
                                                case ':':
                                                    return ': ';
                                                case ',':
                                                    return ', ';
                                            }
                                        })
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
