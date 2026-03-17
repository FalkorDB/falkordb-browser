/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useContext, useMemo, useEffect, useRef } from "react";
import { Row } from "@/lib/utils";
import TableComponent from "../components/TableComponent";
import { BrowserSettingsContext, GraphContext, TableViewContext } from "../components/provider";
import Export from "../components/Export";

export default function TableView() {
    const { graph } = useContext(GraphContext);
    const { scrollPosition, setScrollPosition, search, setSearch, expand, setExpand, dataHash } = useContext(TableViewContext);
    const { settings: { tableViewSettings: { rowHeight, rowHeightExpandMultiple, columnWidth } } } = useContext(BrowserSettingsContext);
    const previousDataHash = useRef<string>("");

    const tableData = useMemo(() => {
        if (graph.Data.length === 0) return undefined;

        const headers = graph.Data.reduce<string[]>((acc, row) => {
            Object.keys(row).forEach((key) => {
                if (!acc.includes(key)) acc.push(key);
            });
            return acc;
        }, []);

        return {
            headers,
            rows: graph.Data.map((row, index): Row => ({
                name: `row-${index}`,
                cells: headers.map((header) => ({
                    value: row[header] ?? null,
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

    const csvContent = useMemo(() => {
        if (!tableData) return "";

        const csvRows: string[] = [];

        csvRows.push(tableData.headers.map(header => `"${header}"`).join(','));

        graph.Data.forEach((row) => {
            const csvRow = tableData.headers.map((header) => {
                const value = row[header];
                if (value === null || value === undefined) return '""';

                if (typeof value === 'object') {
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                }

                const stringValue = String(value).replace(/"/g, '""');
                return `"${stringValue}"`;
            });
            csvRows.push(csvRow.join(','));
        });

        return csvRows.join('\n');
    }, [tableData, graph.Data]);

    if (tableData === undefined) return undefined;

    return (
        <TableComponent
            label="TableView"
            className="p-2 pb-12"
            valueClassName="SofiaSans"
            headers={tableData.headers}
            rows={tableData.rows}
            entityName="Element"
            itemHeight={rowHeight}
            itemHeightExpandMultiple={rowHeightExpandMultiple}
            itemWidth={columnWidth}
            initialScrollPosition={scrollPosition}
            onScrollChange={setScrollPosition}
            initialSearch={search}
            onSearchChange={setSearch}
            initialExpand={expand}
            onExpandChange={setExpand}
        >
            <Export
                data-testid="exportTableViewButton"
                content={csvContent}
                filename={`${graph.Id}_table_export.csv`}
                title="Export table data to CSV"
                label="Export"

            />
        </TableComponent>
    );
}