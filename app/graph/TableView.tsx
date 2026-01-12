/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useContext, useMemo, useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { Row } from "@/lib/utils";
import TableComponent from "../components/TableComponent";
import { GraphContext, TableViewContext } from "../components/provider";
import Button from "../components/ui/Button";

export default function TableView() {
    const { graph } = useContext(GraphContext);
    const { scrollPosition, setScrollPosition, search, setSearch, expand, setExpand, dataHash } = useContext(TableViewContext);
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

    const handleExportCSV = () => {
        if (!tableData) return;

        // Convert data to CSV format
        const csvRows: string[] = [];
        
        // Add headers
        csvRows.push(tableData.headers.map(header => `"${header}"`).join(','));
        
        // Add data rows
        graph.Data.forEach((row) => {
            const csvRow = tableData.headers.map((header) => {
                const value = row[header];
                if (value === null || value === undefined) return '""';
                
                // Handle different types of values
                if (typeof value === 'object') {
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                }
                
                // Escape quotes and wrap in quotes
                const stringValue = String(value).replace(/"/g, '""');
                return `"${stringValue}"`;
            });
            csvRows.push(csvRow.join(','));
        });

        const csvContent = csvRows.join('\n');
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${graph.Id}_table_export.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    if (tableData === undefined) return undefined;

    return (
        <TableComponent
            label="TableView"
            className="p-2 pb-10"
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
        >
            <Button
                data-testid="exportTableViewButton"
                variant="Primary"
                label="Export"
                title="Export table data to CSV"
                onClick={handleExportCSV}
            >
                <Download size={20} />
            </Button>
        </TableComponent>
    );
}