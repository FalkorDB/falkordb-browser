import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ReactJson from "react-json-view";
import { useTheme } from "next-themes";
import { transparent } from "tailwindcss/colors";
import { Graph } from "./model";

// eslint-disable-next-line import/prefer-default-export
export function TableView({ graph }: { graph: Graph }) {
    const { theme, systemTheme } = useTheme()
    const darkmode = theme === "dark" || (theme === "system" && systemTheme === "dark")
    return (
        <Table>
            <TableCaption>A list of results</TableCaption>
            <TableHeader>
                <TableRow>
                    {
                        // eslint-disable-next-line arrow-body-style
                        graph.Columns.map((column, index) => {
                            // eslint-disable-next-line react/no-array-index-key
                            return <TableHead key={index}>{column.replace(/'/g, '')}</TableHead>
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
                                    const columnName = graph.Columns[cellIndex];
                                    let jsonName = ""
                                    if (columnName === "n") {
                                        jsonName = "node"
                                    }else if(columnName === "e") {
                                        jsonName = "edge"
                                    }else {
                                        jsonName = columnName
                                    }
                                    const text = JSON.stringify(cell)
                                        .replace(/[{}\]":]/g, (match) => {
                                            switch (match) {
                                                case '{':
                                                case '}':
                                                case '[':
                                                case ']':
                                                case '"':
                                                    return '';
                                                case ':':
                                                    return ': ';
                                                default:
                                                    return ', ';
                                            }
                                        })
                                    return (
                                        // eslint-disable-next-line react/no-array-index-key
                                        <TableCell key={cellIndex}>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className="max-w-96 truncate">
                                                        {typeof cell === "object" ? (
                                                            <ReactJson
                                                                src={cell as object}
                                                                name={jsonName}
                                                                collapsed={0}
                                                                style={{ backgroundColor: transparent }}
                                                                theme={darkmode ? "grayscale" : "grayscale:inverted"}
                                                                displayDataTypes={false}
                                                                displayObjectSize={false}
                                                                collapseStringsAfterLength={10}
                                                            />
                                                        ) : ( text )
                                                        }
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
