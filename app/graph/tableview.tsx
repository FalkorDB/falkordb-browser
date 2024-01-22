import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Graph } from "./model";

export function TableView(params: {graph: Graph}) {
    return (
        <Table>
            <TableCaption>A list of results</TableCaption>
            <TableHeader>
                <TableRow>
                    {
                        params.graph.Columns.map((column, index) => {
                            return (<TableHead key={index}>{column}</TableHead>)
                        })
                    }
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    params.graph.Data.map((row, index) => {
                        return (<TableRow key={index}>
                            {
                                Object.values(row).map((cell:any, index) => {
                                    return (<TableCell key={index} className="max-w-96 truncate">{JSON.stringify(cell)}</TableCell>)
                                })
                            }
                        </TableRow>)
                    })
                }
            </TableBody>
        </Table>
    )
}