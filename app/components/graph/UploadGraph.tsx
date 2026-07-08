import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { type FormEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import Dropzone from "../ui/Dropzone";
import Button from "../ui/Button";
import CloseDialog from "../CloseDialog";
import { IndicatorContext } from "../provider";
import DialogComponent from "../DialogComponent";
import { prepareArg, securedFetch, uploadFileWithProgress } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import type { FileRejection } from "react-dropzone";

type UploadMode = "cypher" | "load-csv";

const ACCEPTED_CYPHER = {
    "text/plain": [".txt", ".cql", ".cypher"],
    "application/octet-stream": [".cql", ".cypher"],
};

const ACCEPTED_CSV = {
    "text/csv": [".csv"],
    "application/vnd.ms-excel": [".csv"],
    "text/plain": [".csv"],
};

function buildLoadCsvStarter(url: string): string {
    return `LOAD CSV FROM '${url}' AS row\n`;
}

export default function UploadGraph({ graphName, disabled, open, onOpenChange }: {
    /* eslint-disable react/require-default-props */
    graphName: string
    disabled?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) {
    // ── shared ──────────────────────────────────────────────────────────────
    const [mode, setMode] = useState<UploadMode>("cypher");
    const [isLoading, setIsLoading] = useState(false);
    const [phase, setPhase] = useState<"uploading" | "processing" | null>(null);
    const [uploadPct, setUploadPct] = useState(0);
    const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
    const [internalOpen, setInternalOpen] = useState(false);
    const { toast } = useToast();
    const { indicator, setIndicator } = useContext(IndicatorContext);

    // ── cypher batch ─────────────────────────────────────────────────────────
    const [cypherFiles, setCypherFiles] = useState<File[]>([]);

    // ── load-csv ─────────────────────────────────────────────────────────────
    const [csvFiles, setCsvFiles] = useState<File[]>([]);
    /** Non-null once the CSV has been uploaded and a storage key is available. */
    const [csvKey, setCsvKey] = useState<string | null>(null);
    const [csvUrl, setCsvUrl] = useState("");
    const [csvQuery, setCsvQuery] = useState("");
    const [csvUrlCopied, setCsvUrlCopied] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────

    const dialogOpen = useMemo(
        () => (isControlled ? (open as boolean) : internalOpen),
        [isControlled, open, internalOpen]
    );

    const handleOpenChange = (nextOpen: boolean, force = false) => {
        if (!nextOpen && isLoading && !force) return;
        if (onOpenChange) {
            onOpenChange(nextOpen);
        } else {
            setInternalOpen(nextOpen);
        }
    };

    useEffect(() => {
        if (!dialogOpen) {
            setCypherFiles([]);
            setCsvFiles([]);
            setCsvKey(null);
            setCsvUrl("");
            setCsvQuery("");
            setCsvUrlCopied(false);
            setIsLoading(false);
            setPhase(null);
            setUploadPct(0);
        }
    }, [dialogOpen]);

    const resetMode = useCallback(() => {
        setCypherFiles([]);
        setCsvFiles([]);
        setCsvKey(null);
        setCsvUrl("");
        setCsvQuery("");
        setCsvUrlCopied(false);
        setPhase(null);
        setUploadPct(0);
    }, []);

    // ── cypher batch handlers ─────────────────────────────────────────────────

    const handleCypherDropRejected = (rejections: FileRejection[]) => {
        const tooMany = rejections.some((r) => r.errors.some((e) => e.code === "too-many-files"));
        toast({
            title: "Couldn't add file",
            description: tooMany ? "Please drop a single file." : "Please choose a .txt, .cql, or .cypher file.",
            variant: "destructive",
        });
    };

    const onUploadCypher = async (e: FormEvent) => {
        e.preventDefault();

        if (!graphName) {
            toast({ title: "Error", description: "Select a single graph before uploading.", variant: "destructive" });
            return;
        }
        if (cypherFiles.length !== 1) {
            toast({ title: "Error", description: "Please select exactly one file.", variant: "destructive" });
            return;
        }

        try {
            setIsLoading(true);
            setPhase("uploading");
            setUploadPct(0);

            const uploadResult = await uploadFileWithProgress("api/upload", cypherFiles[0], toast, setIndicator, setUploadPct);
            if (!uploadResult.ok) return;

            const { id } = JSON.parse(uploadResult.body) as { id: string };
            setPhase("processing");

            const processResult = await securedFetch(
                `api/graph/${prepareArg(graphName)}/upload`,
                { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileId: id }) },
                toast,
                setIndicator
            );
            if (!processResult.ok) return;

            const data = await processResult.json() as { message?: string };
            toast({ title: "Upload completed", description: data.message || "Graph data uploaded successfully." });
            setCypherFiles([]);
            handleOpenChange(false, true);
        } finally {
            setIsLoading(false);
            setPhase(null);
            setUploadPct(0);
        }
    };

    // ── load-csv handlers ─────────────────────────────────────────────────────

    const handleCsvDropRejected = (rejections: FileRejection[]) => {
        const tooMany = rejections.some((r) => r.errors.some((e) => e.code === "too-many-files"));
        toast({
            title: "Couldn't add file",
            description: tooMany ? "Please drop a single file." : "Please choose a .csv file.",
            variant: "destructive",
        });
    };

    const onUploadCsvToTemp = async (e: FormEvent) => {
        e.preventDefault();

        if (!graphName) {
            toast({ title: "Error", description: "Select a single graph before uploading.", variant: "destructive" });
            return;
        }
        if (csvFiles.length !== 1) {
            toast({ title: "Error", description: "Please select exactly one CSV file.", variant: "destructive" });
            return;
        }

        try {
            setIsLoading(true);
            setPhase("uploading");
            setUploadPct(0);

            // Upload CSV to temp storage — returns { key, readUrl }.
            const uploadResult = await uploadFileWithProgress("api/csv-temp", csvFiles[0], toast, setIndicator, setUploadPct);
            if (!uploadResult.ok) return;

            const { key, readUrl } = JSON.parse(uploadResult.body) as { key: string; readUrl: string };
            setCsvKey(key);
            setCsvUrl(readUrl);
            setCsvQuery(buildLoadCsvStarter(readUrl));
        } finally {
            setIsLoading(false);
            setPhase(null);
            setUploadPct(0);
        }
    };

    const onRunLoadCsv = async (e: FormEvent) => {
        e.preventDefault();

        if (!csvKey || !csvQuery.trim()) return;

        try {
            setIsLoading(true);
            setPhase("processing");

            const result = await securedFetch(
                `api/graph/${prepareArg(graphName)}/load-csv`,
                { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: csvKey, query: csvQuery }) },
                toast,
                setIndicator
            );
            if (!result.ok) return;

            const data = await result.json() as { message?: string };
            toast({ title: "LOAD CSV completed", description: data.message || "Data imported successfully." });
            handleOpenChange(false, true);
        } finally {
            setIsLoading(false);
            setPhase(null);
        }
    };

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(csvUrl);
            setCsvUrlCopied(true);
            setTimeout(() => setCsvUrlCopied(false), 2000);
        } catch {
            // ignore clipboard errors
        }
    };

    // ─────────────────────────────────────────────────────────────────────────

    const progressBar = phase && (
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
    );

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
            <div className="grow p-2 flex flex-col gap-4 overflow-hidden">
                <Tabs
                    value={mode}
                    onValueChange={(v) => { setMode(v as UploadMode); resetMode(); }}
                    className="w-full"
                >
                    <TabsList className="h-fit bg-background gap-1">
                        <TabsTrigger value="cypher" disabled={isLoading}>Cypher batch</TabsTrigger>
                        <TabsTrigger value="load-csv" disabled={isLoading}>Load CSV</TabsTrigger>
                    </TabsList>

                    {/* ── Cypher batch ─────────────────────────────────── */}
                    <TabsContent value="cypher">
                        <form onSubmit={onUploadCypher} className="flex flex-col gap-4 mt-2">
                            <p className="text-sm text-muted-foreground">
                                Upload a .txt, .cql, or .cypher file and execute each statement sequentially into the existing graph.
                            </p>
                            <Dropzone
                                filesCount
                                className="flex-col"
                                withTable
                                maxFiles={1}
                                disabled={isLoading}
                                onFileDrop={setCypherFiles}
                                onDropRejected={handleCypherDropRejected}
                                accept={ACCEPTED_CYPHER}
                            />
                            {progressBar}
                            <div className="flex gap-3 justify-end">
                                <Button
                                    type="submit"
                                    label="Upload"
                                    title="Execute Cypher statements into the graph"
                                    variant="Primary"
                                    isLoading={isLoading}
                                    indicator={indicator}
                                    disabled={cypherFiles.length !== 1}
                                    data-testid="uploadGraphConfirm"
                                />
                                <CloseDialog data-testid="uploadGraphCancel" disabled={isLoading} />
                            </div>
                        </form>
                    </TabsContent>

                    {/* ── Load CSV ─────────────────────────────────────── */}
                    <TabsContent value="load-csv">
                        {/* Step 1: pick and upload the CSV file */}
                        {!csvKey && (
                            <form onSubmit={onUploadCsvToTemp} className="flex flex-col gap-4 mt-2">
                                <p className="text-sm text-muted-foreground">
                                    Upload a .csv file to get a temporary URL, then write a{" "}
                                    <code className="rounded bg-muted px-1 py-0.5 text-xs">LOAD CSV FROM &apos;url&apos; AS row</code>{" "}
                                    Cypher query to import it into the graph.
                                </p>
                                <Dropzone
                                    filesCount
                                    className="flex-col"
                                    withTable
                                    maxFiles={1}
                                    disabled={isLoading}
                                    onFileDrop={setCsvFiles}
                                    onDropRejected={handleCsvDropRejected}
                                    accept={ACCEPTED_CSV}
                                />
                                {progressBar}
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        type="submit"
                                        label="Upload CSV"
                                        title="Upload the CSV to temporary storage and get a URL"
                                        variant="Primary"
                                        isLoading={isLoading}
                                        indicator={indicator}
                                        disabled={csvFiles.length !== 1}
                                        data-testid="uploadCsvTempConfirm"
                                    />
                                    <CloseDialog data-testid="uploadGraphCancel" disabled={isLoading} />
                                </div>
                            </form>
                        )}

                        {/* Step 2: edit query and run */}
                        {csvKey && (
                            <form onSubmit={onRunLoadCsv} className="flex flex-col gap-4 mt-2">
                                <p className="text-sm text-muted-foreground">
                                    CSV uploaded. Complete the query below and click <strong>Run</strong>.
                                    The file will be deleted after the query finishes.
                                </p>

                                {/* URL display with copy button */}
                                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                                    <span className="flex-1 truncate font-mono text-xs" title={csvUrl}>{csvUrl}</span>
                                    <button
                                        type="button"
                                        onClick={handleCopyUrl}
                                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                        title="Copy URL"
                                        aria-label="Copy CSV URL"
                                    >
                                        {csvUrlCopied ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                </div>

                                {/* Editable LOAD CSV query */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="loadCsvQuery" className="text-sm font-medium">
                                        Cypher query
                                    </label>
                                    <Textarea
                                        id="loadCsvQuery"
                                        value={csvQuery}
                                        onChange={(e) => setCsvQuery(e.target.value)}
                                        className="min-h-[120px] font-mono text-xs"
                                        disabled={isLoading}
                                        data-testid="loadCsvQuery"
                                        placeholder={`LOAD CSV FROM '${csvUrl}' AS row\nCREATE (:Node {name: row.name})`}
                                        spellCheck={false}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Each CSV column is available as{" "}
                                        <code className="rounded bg-muted px-1 py-0.5">row.columnName</code>.
                                    </p>
                                </div>

                                {progressBar}

                                <div className="flex gap-3 justify-end">
                                    <Button
                                        type="submit"
                                        label="Run"
                                        title="Execute the LOAD CSV query and import data into the graph"
                                        variant="Primary"
                                        isLoading={isLoading}
                                        indicator={indicator}
                                        disabled={!csvQuery.trim()}
                                        data-testid="loadCsvRunConfirm"
                                    />
                                    <CloseDialog data-testid="uploadGraphCancel" disabled={isLoading} />
                                </div>
                            </form>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DialogComponent>
    );
}
