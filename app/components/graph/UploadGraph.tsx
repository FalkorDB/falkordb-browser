import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { type FormEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import Dropzone from "../ui/Dropzone";
import Button from "../ui/Button";
import CloseDialog from "../CloseDialog";
import { IndicatorContext } from "../provider";
import DialogComponent from "../DialogComponent";
import { prepareArg, securedFetch } from "@/lib/utils";
import { parseCsvRows, generateCsvQuery, type CsvColumnType } from "@/lib/graphUpload";

type UploadMode = "dump" | "csv" | "cypher";

export default function UploadGraph({ graphName, disabled, open, onOpenChange }: {
    /* eslint-disable react/require-default-props */
    graphName: string
    disabled?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) {

    const [files, setFiles] = useState<File[]>([]);
    const [mode, setMode] = useState<UploadMode>("dump");
    const [csvQuery, setCsvQuery] = useState("");
    const [csvColumns, setCsvColumns] = useState<string[]>([]);
    const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([]);
    const [columnTypes, setColumnTypes] = useState<Record<string, CsvColumnType>>({});
    const [nodeLabel, setNodeLabel] = useState("Row");
    const [isLoading, setIsLoading] = useState(false);
    const uploadInFlightRef = useRef(false);
    const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
    const [internalOpen, setInternalOpen] = useState(false);
    const { toast } = useToast();
    const { indicator, setIndicator } = useContext(IndicatorContext);

    const dialogOpen = useMemo(
        () => (isControlled ? (open as boolean) : internalOpen),
        [isControlled, open, internalOpen]
    );

    const handleOpenChange = (nextOpen: boolean) => {
        if (onOpenChange) {
            onOpenChange(nextOpen);
        } else {
            setInternalOpen(nextOpen);
        }
    };

    useEffect(() => {
        if (!dialogOpen) {
            setFiles([]);
            setCsvQuery("");
            setMode("dump");
            setIsLoading(false);
            setNodeLabel("Row");
            uploadInFlightRef.current = false;
        }
    }, [dialogOpen]);

    useEffect(() => {
        if (mode !== "csv" || files.length !== 1) {
            setCsvColumns([]);
            setCsvPreview([]);
            setColumnTypes({});
            return undefined;
        }

        let cancelled = false;
        // Read only a bounded prefix — enough for headers + preview rows —
        // rather than the whole (up to 5 MB) file into browser memory.
        files[0].slice(0, 64 * 1024).text()
            .then((text) => {
                if (cancelled) return;
                const rows = parseCsvRows(text);
                const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
                setCsvColumns(columns);
                setCsvPreview(rows.slice(0, 5));
                setColumnTypes((prev) => {
                    const next: Record<string, CsvColumnType> = {};
                    columns.forEach((col) => { next[col] = prev[col] ?? "string"; });
                    return next;
                });
            })
            .catch(() => {
                if (cancelled) return;
                setCsvColumns([]);
                setCsvPreview([]);
                setColumnTypes({});
            });

        return () => { cancelled = true; };
    }, [files, mode]);

    const onUploadData = async (e: FormEvent) => {
        e.preventDefault();
        if (uploadInFlightRef.current) return;
        if (!graphName.trim()) {
            toast({
                title: "Error",
                description: "Please select a graph before uploading.",
                variant: "destructive"
            });
            return;
        }
        if (files.length !== 1) {
            toast({
                title: "Error",
                description: "Please select exactly one file.",
                variant: "destructive"
            });
            return;
        }

        if (mode === "csv" && !csvQuery.trim()) {
            toast({
                title: "Error",
                description: "CSV upload requires a query.",
                variant: "destructive"
            });
            return;
        }

        try {
            uploadInFlightRef.current = true;
            setIsLoading(true);

            const uploadFormData = new FormData();
            uploadFormData.append("file", files[0]);

            const uploadResult = await securedFetch(
                "api/upload",
                {
                    method: "POST",
                    body: uploadFormData
                },
                toast,
                setIndicator
            );

            if (!uploadResult.ok) return;

            const { id } = await uploadResult.json() as { id: string };

            const processResult = await securedFetch(
                `api/graph/${prepareArg(graphName)}/upload`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        mode,
                        fileId: id,
                        query: mode === "csv" ? csvQuery : undefined,
                        columnTypes: mode === "csv" ? columnTypes : undefined
                    })
                },
                toast,
                setIndicator
            );

            if (!processResult.ok) return;

            const data = await processResult.json() as { message?: string };

            toast({
                title: "Upload completed",
                description: data.message || "Graph data uploaded successfully."
            });

            setFiles([]);
            handleOpenChange(false);
        } catch {
            toast({
                title: "Error",
                description: "Upload failed unexpectedly. Please try again.",
                variant: "destructive"
            });
        } finally {
            uploadInFlightRef.current = false;
            setIsLoading(false);
        }
    };

    return (
        <DialogComponent
            open={dialogOpen}
            onOpenChange={handleOpenChange}
            trigger={
                !isControlled
                    ? <Button
                        className="p-1 text-xs"
                        variant="Primary"
                        label="Upload Data"
                        title="Upload data into the selected graph"
                        disabled={disabled}
                        data-testid="uploadGraph"
                    />
                    : <Button className="hidden" />
            }
            title="Upload Data"
            className="max-h-[90dvh] max-w-[60dvw]"
        >
            <form onSubmit={onUploadData} className="grow p-2 flex flex-col gap-4 overflow-hidden">
                <Tabs value={mode} onValueChange={(value) => { setMode(value as UploadMode); setFiles([]); setCsvQuery(""); setNodeLabel("Row"); }} className="w-full">
                    <TabsList className="h-fit bg-background gap-1">
                        <TabsTrigger value="dump">Dump restore</TabsTrigger>
                        <TabsTrigger value="csv">CSV + query</TabsTrigger>
                        <TabsTrigger value="cypher">Cypher batch</TabsTrigger>
                    </TabsList>
                    <TabsContent value="dump" className="mt-2">
                        <p className="text-sm text-muted-foreground">
                            Upload a .dump file (from Export Data) to replace the selected graph contents.
                        </p>
                    </TabsContent>
                    <TabsContent value="csv" className="mt-2 flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">
                            Upload a .csv file. Your query runs for each row (available as <code>row</code>, plus <code>index</code>); rows are executed in batches with UNWIND.
                        </p>
                        <textarea
                            className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            aria-label="CSV ingestion Cypher query"
                            value={csvQuery}
                            placeholder="CREATE (:Person {name: row.name, age: toInteger(row.age)})"
                            onChange={(e) => setCsvQuery(e.target.value)}
                        />
                        {csvColumns.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <label className="text-sm text-muted-foreground" htmlFor="csvNodeLabel">Node label</label>
                                    <input
                                        id="csvNodeLabel"
                                        className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                                        value={nodeLabel}
                                        onChange={(e) => setNodeLabel(e.target.value)}
                                        aria-label="Generated node label"
                                    />
                                    <button
                                        type="button"
                                        className="rounded-md border border-input bg-background px-2 py-1 text-sm hover:bg-accent"
                                        onClick={() => setCsvQuery(generateCsvQuery(nodeLabel, csvColumns))}
                                        data-testid="uploadGenerateQuery"
                                    >
                                        Generate query
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Preview & column types (values are coerced server-side before binding):
                                </p>
                                {csvColumns.some((col) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(col)) && (
                                    <p className="text-xs text-red-500">
                                        Some column names aren&apos;t valid identifiers (letters, digits, underscore; not starting with a digit). Rename them in your CSV before uploading.
                                    </p>
                                )}
                                <div className="overflow-auto max-h-[30dvh] border border-input rounded-md">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr>
                                                {csvColumns.map((col) => (
                                                    <th key={col} className="px-2 py-1 text-left align-top">
                                                        <div className="font-medium">{col}</div>
                                                        <select
                                                            className="mt-1 rounded-md border border-input bg-background px-1 py-0.5 text-xs"
                                                            aria-label={`Type for column ${col}`}
                                                            value={columnTypes[col] ?? "string"}
                                                            onChange={(e) => setColumnTypes((prev) => ({ ...prev, [col]: e.target.value as CsvColumnType }))}
                                                        >
                                                            <option value="string">string</option>
                                                            <option value="integer">integer</option>
                                                            <option value="float">float</option>
                                                            <option value="boolean">boolean</option>
                                                        </select>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {csvPreview.map((previewRow, rowIndex) => (
                                                // eslint-disable-next-line react/no-array-index-key
                                                <tr key={rowIndex} className="border-t border-input">
                                                    {csvColumns.map((col) => (
                                                        <td key={col} className="px-2 py-1 align-top">{previewRow[col]}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="cypher" className="mt-2">
                        <p className="text-sm text-muted-foreground">
                            Upload .txt/.cql/.cypher and execute each statement sequentially.
                        </p>
                    </TabsContent>
                </Tabs>
                <Dropzone
                    filesCount
                    className="flex-col"
                    withTable
                    onFileDrop={setFiles}
                    accept={
                        mode === "dump"
                            ? { "application/octet-stream": [".dump"] }
                            : mode === "csv"
                                ? { "text/csv": [".csv"], "application/csv": [".csv"], "text/plain": [".csv"] }
                                : { "text/plain": [".txt", ".cql", ".cypher"], "application/octet-stream": [".cql", ".cypher"] }
                    }
                />
                <div className="flex gap-3 justify-end">
                    <Button
                        type="submit"
                        label="Upload"
                        title="Submit the uploaded data"
                        variant="Primary"
                        isLoading={isLoading}
                        indicator={indicator}
                        disabled={files.length !== 1 || isLoading}
                        data-testid="uploadGraphConfirm"
                    />
                    <CloseDialog data-testid="uploadGraphCancel" />
                </div>
            </form>
        </DialogComponent>
    );
}