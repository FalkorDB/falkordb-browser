/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Data } from "../api/graph/model"
import TableComponent from "../components/TableComponent"

interface Props {
    data: Data
}

export default function TableView({ data }: Props) {

    return (
        <TableComponent
            headers={Object.keys(data[0])}
            rows={data.map(row => ({
                cells: Object.values(row).map((value) => ({
                    value,

                }))
            }))}
        />
    )
}