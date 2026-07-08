import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { type FormEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";
import Dropzone from "../ui/Dropzone";
import Button from "../ui/Button";
import CloseDialog from "../CloseDialog";
import { IndicatorContext } from "../provider";
import DialogComponent from "../DialogComponent";
import { prepareArg, securedFetch, uploadFileWithProgress } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { assertSafeCsvHeaders, generateCsvQuery, parseCsvRows } from "@/lib/graphUpload";
import type { Accept, FileRejection } from "react-dropzone";

type UploadMode = "dump" | "csv" | "cypher";

const ACCEPTED_FILES: Record<UploadMode, Accept> = {
    dump: { "application/octet-stream": [".dump"] },
    csv: { "text/csv": [".csv"], "application/vnd.ms-excel": [".csv"] },
    cypher: { "text/plain": [".txt", ".cql", ".cypher"], "application/octet-stream": [".cql", ".cypher"] },
};

const ACCEPTED_HINT: Record<UploadMode, string> = {
    dump: "a .dump file",
    csv: "a .csv file",
    cypher: "a .txt, .cql, or .cypher file",
};

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
    const [csvQueryEdited, setCsvQueryEdited] = useState(false);
    const [csvColumns, setCsvColumns] = useState<string[]>([]);
    const [csvError, setCsvError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [phase, setPhase] = useState<"uploading" | "processing" | null>(null);
    const [uploadPct, setUploadPct] = useState(0);
    const csvReadToken = useRef(0);
    const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
    const [internalOpen, setInternalOpen] = useState(false);
    const { toast } = useToast();
    const { indicator, setIndicator } = useContext(IndicatorContext);

    const dialogOpen = useMemo(
        () => (isControlled ? (open as boolean) : internalOpen),
        [isControlled, open, internalOpen]
    );

    const handleOpenChange = (nextOpen: boolean, force = false) => {
        // Don't let an outside click / Escape dismiss the dialog mid-upload, but
        // allow programmatic closes (e.g. on success) via force.
        if (!nextOpen && isLoading && !force) return;
        if (onOpenChange) {
            onOpenChange(nextOpen);
        } else {
            setInternalOpen(nextOpen);
        }
    };

    useEffect(() => {
        if (!dialogOpen) {
            csvReadToken.current += 1;
            setFiles([]);
            setMode("dump");
            setCsvQuery("");
            setCsvQueryEdited(false);
            setCsvColumns([]);
            setCsvError(null);
            setIsLoading(false);
            setPhase(null);
            setUploadPct(0);
        }
    }, [dialogOpen]);

    const resetSelection = () => {
        csvReadToken.current += 1;
        setFiles([]);
        setCsvQuery("");
        setCsvQueryEdited(false);
        setCsvColumns([]);
        setCsvError(null);
    };

    // When a CSV is chosen, read its header row (client-side, browser-safe helpers)
    // to show the detected columns and prefill a ready-to-run starter query so the
    // common case is a one-click ingest. Only the first 64KB is read to stay snappy.
    // A token guards against a slow read landing after the dialog has moved on.
    const handleFileDrop = (accepted: File[]) => {
        setFiles(accepted);
        setCsvColumns([]);
        setCsvError(null);
        if (mode !== "csv" || accepted.length !== 1) return;

        csvReadToken.current += 1;
        const token = csvReadToken.current;

        accepted[0]
            .slice(0, 64 * 1024)
            .text()
            .then((sample) => {
                if (token !== csvReadToken.current) return;
                const rows = parseCsvRows(sample);
                const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
                setCsvColumns(columns);
                if (columns.length === 0) return;
                // Headers must be valid Cypher identifiers (the server enforces this
                // too); surfacing it here avoids handing the user a query that fails.
                assertSafeCsvHeaders(rows);
                // Prefill a starter query, but never clobber one the user has edited.
                setCsvQuery((current) => (csvQueryEdited && current.trim() ? current : generateCsvQuery("Row", columns)));
            })
            .catch((error: unknown) => {
                if (token !== csvReadToken.current) return;
                setCsvError((error as Error).message);
            });
    };

    const handleDropRejected = (rejections: FileRejection[]) => {
        const tooMany = rejections.some((rejection) =>
            rejection.errors.some((err) => err.code === "too-many-files")
        );
        toast({
            title: "Couldn't add file",
            description: tooMany ? "Please drop a single file." : `Please choose ${ACCEPTED_HINT[mode]}.`,
            variant: "destructive",
        });
    };

    const onUploadData = async (e: FormEvent) => {
        e.preventDefault();

        if (!graphName) {
            toast({
                title: "Error",
                description: "Select a single graph before uploading.",
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
                description: "Enter a Cypher query to run for each CSV row.",
                variant: "destructive"
            });
            return;
        }

        if (mode === "csv" && csvError) {
            toast({
                title: "Error",
                description: csvError,
                variant: "destructive"
            });
            return;
        }

        try {
            setIsLoading(true);
            setPhase("uploading");
            setUploadPct(0);

            const uploadResult = await uploadFileWithProgress(
                "api/upload",
                files[0],
                toast,
                setIndicator,
                setUploadPct
            );

            if (!uploadResult.ok) return;

            const { id } = JSON.parse(uploadResult.body) as { id: string };

            setPhase("processing");

            const payload: { mode: UploadMode; fileId: string; query?: string } = { mode, fileId: id };
            if (mode === "csv") payload.query = csvQuery;

            const processResult = await securedFetch(
                `api/graph/${prepareArg(graphName)}/upload`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                },
                toast,
                setIndicator
            );

            if (!processResult.ok) return;

            const data = await processResult.json() as { message?: string };

            toast({
                title: mode === "dump" ? "Graph restored successfully" : "Upload completed",
                description: data.message || "Graph data uploaded successfully."
            });

            resetSelection();
            handleOpenChange(false, true);
        } finally {
            setIsLoading(false);
            setPhase(null);
            setUploadPct(0);
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
                <Tabs value={mode} onValueChange={(value) => { setMode(value as UploadMode); resetSelection(); }} className="w-full">
                    <TabsList className="h-fit bg-background gap-1">
                        <TabsTrigger value="dump" disabled={isLoading}>Restore</TabsTrigger>
                        <TabsTrigger value="csv" disabled={isLoading}>CSV</TabsTrigger>
                        <TabsTrigger value="cypher" disabled={isLoading}>Cypher batch</TabsTrigger>
                    </TabsList>
                    <TabsContent value="dump" className="mt-2 flex flex-col gap-2">
                        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            <TriangleAlert size={16} className="mt-0.5 shrink-0" />
                            <span>
                                Restoring from a dump will <strong>replace all current data</strong> in <strong>{graphName}</strong>. This action cannot be undone.
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Upload a .dump file previously exported via the Export button to restore this graph.
                        </p>
                    </TabsContent>
                    <TabsContent value="csv" className="mt-2">
                        <p className="text-sm text-muted-foreground">
                            Upload a .csv file and run one Cypher statement for every row. Each row&apos;s
                            columns are available as <code className="rounded bg-muted px-1 py-0.5 text-xs">row.column</code>.
                        </p>
                    </TabsContent>
                    <TabsContent value="cypher" className="mt-2">
                        <p className="text-sm text-muted-foreground">
                            Upload a .txt, .cql, or .cypher file and execute each statement sequentially into the existing graph.
                        </p>
                    </TabsContent>
                </Tabs>
                <Dropzone
                    key={mode}
                    filesCount
                    className="flex-col"
                    withTable
                    maxFiles={1}
                    disabled={isLoading}
                    onFileDrop={handleFileDrop}
                    onDropRejected={handleDropRejected}
                    accept={ACCEPTED_FILES[mode]}
                />
                {mode === "csv" && (
                    <div className="flex flex-col gap-2">
                        {csvColumns.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                <span className="text-muted-foreground">Detected columns:</span>
                                {csvColumns.map((col) => (
                                    <span key={col} className="rounded bg-muted px-1.5 py-0.5 font-mono">{col}</span>
                                ))}
                            </div>
                        )}
                        {csvError && (
                            <p className="text-xs text-destructive" data-testid="uploadCsvError">{csvError}</p>
                        )}
                        <label htmlFor="csvUploadQuery" className="text-sm font-medium">Cypher query</label>
                        <Textarea
                            id="csvUploadQuery"
                            value={csvQuery}
                            onChange={(e) => { setCsvQuery(e.target.value); setCsvQueryEdited(true); }}
                            placeholder="CREATE (:Person {name: row.name, age: row.age})"
                            className="min-h-[96px] font-mono text-xs"
                            disabled={isLoading}
                            data-testid="uploadCsvQuery"
                        />
                        <p className="text-xs text-muted-foreground">
                            Runs once per row. Dropping a .csv prefills a starter query — rename the
                            {" "}<code className="rounded bg-muted px-1 py-0.5">:Row</code> label to your node type.
                        </p>
                    </div>
                )}
                {phase && (
                    <div className="flex flex-col gap-1" data-testid="uploadProgress">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{phase === "uploading" ? "Uploading file…" : "Processing…"}</span>
                            {phase === "uploading" && <span>{uploadPct}%</span>}
                        </div>
                        <Progress
                            value={phase === "uploading" ? uploadPct : 100}
                            className={phase === "processing" ? "animate-pulse" : undefined}
                        />
                    </div>
                )}
                <div className="flex gap-3 justify-end">
                    <Button
                        type="submit"
                        label={mode === "dump" ? "Restore" : "Upload"}
                        title={
                            mode === "dump"
                                ? "Restore graph from dump file"
                                : mode === "csv"
                                    ? "Ingest CSV rows into the graph"
                                    : "Execute Cypher statements into the graph"
                        }
                        variant="Primary"
                        isLoading={isLoading}
                        indicator={indicator}
                        disabled={files.length !== 1 || (mode === "csv" && (!csvQuery.trim() || Boolean(csvError)))}
                        data-testid="uploadGraphConfirm"
                    />
                    <CloseDialog data-testid="uploadGraphCancel" disabled={isLoading} />
                </div>
            </form>
        </DialogComponent>
    );
}