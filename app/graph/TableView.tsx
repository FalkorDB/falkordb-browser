/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useContext, useMemo, useEffect, useRef } from "react"
import { Row } from "@/lib/utils";
import TableComponent from "../components/TableComponent"
import { GraphContext, TableViewContext } from "../components/provider"

export default function TableView() {
    const { graph } = useContext(GraphContext)
    const { scrollPosition, setScrollPosition, search, setSearch, expand, setExpand, dataHash } = useContext(TableViewContext)
    const previousDataHash = useRef<string>("")

    const tableData = useMemo(() => {
        if (graph.Data.length === 0) return undefined;
        
        return {
            headers: Object.keys(graph.Data[0]),
            rows: graph.Data.map((row, index): Row => ({
                name: `row-${index}`,
                cells: Object.values(row).map((value) => ({
                    value,
                    type: "object"
                }))
            }))
        };
    }, [graph.Data]);

    // Reset scroll position if data has changed
    useEffect(() => {
        if (dataHash !== previousDataHash.current) {
            // Only reset scroll if data actually changed (not on initial mount)
            if (previousDataHash.current !== "") {
                setScrollPosition(0);
            }
            previousDataHash.current = dataHash;
        }
    }, [dataHash, setScrollPosition]);

    if (tableData === undefined) return undefined

    return (
        <TableComponent
            label="TableView"
            className="p-12"
            valueClassName="SofiaSans text-xl"
            headers={tableData.headers}
            rows={tableData.rows}
            entityName="Element"
            initialScrollPosition={scrollPosition}
            onScrollChange={setScrollPosition}
            initialSearch={search}
            onSearchChange={setSearch}
            initialExpand={expand}
            onExpandChange={setExpand}
        />
    )
}