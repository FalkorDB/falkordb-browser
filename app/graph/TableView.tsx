/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-explicit-any */

import TableComponent from "../components/TableComponent"

interface Props {
    data: any[]
}

export default function TableView({ data }: Props) {

    return (
        <TableComponent
            headers={Object.keys(data[0])}
            rows={data.map(row => ({
                id: row.id,
                cells: Object.values(row).map((value) => ({
                    value,

                }))
            }))}
        />
    )
}