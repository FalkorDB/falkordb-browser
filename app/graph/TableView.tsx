/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useContext } from "react"
import TableComponent from "../components/TableComponent"
import { GraphContext } from "../components/provider"

export default function TableView() {
    const { graph } = useContext(GraphContext)
    if (graph.Data.length === 0) return undefined

    return (
        <TableComponent
            className="py-8"
            headers={Object.keys(graph.Data[0])}
            rows={graph.Data.map(row => ({
                cells: Object.values(row).map((value) => ({
                    value,

                }))
            }))}
        />
    )
}