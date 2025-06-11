/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useContext, useMemo } from "react"
import { Row } from "@/lib/utils";
import TableComponent from "../components/TableComponent"
import { GraphContext } from "../components/provider"

export default function TableView() {
    const { graph } = useContext(GraphContext)

    const tableData = useMemo(() => {
        if (graph.Data.length === 0) return undefined;
        
        return {
            headers: Object.keys(graph.Data[0]),
            rows: graph.Data.map((row): Row => ({
                cells: Object.values(row).map((value) => ({
                    value,
                    type: "object"
                }))
            }))
        };
    }, [graph.Data]);

    if (tableData === undefined) return undefined

    return (
        <TableComponent
            label="TableView"
            className="p-12"
            headers={tableData.headers}
            rows={tableData.rows}
            entityName="Element"
        />
    )
}