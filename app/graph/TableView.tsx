import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Graph } from "./model";

export default function TableView({ graph }: { graph: Graph }) {
    return (
        <Table>
            <TableCaption>A list of results</TableCaption>
            <TableHeader>
                <TableRow>
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
                        <TableRow key={index}>
                            {
                                // eslint-disable-next-line react/no-array-index-key
                                Object.values(row).map((cell, cellIndex) => (<TableCell key={cellIndex} className="max-w-96 truncate">{JSON.stringify(cell)}</TableCell>))
                            }
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    )
}