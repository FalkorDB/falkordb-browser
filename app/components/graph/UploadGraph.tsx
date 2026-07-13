import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { type FormEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FileSpreadsheet, X } from "lucide-react";
import { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import Dropzone from "../ui/Dropzone";
import Button from "../ui/Button";
import CloseDialog from "../CloseDialog";
import { BrowserSettingsContext, ConnectionContext, CypherLanguageContext, ForceGraphContext, GraphContext, HistoryQueryContext, IndicatorContext, TableViewContext, UDFContext } from "../provider";
import DialogComponent from "../DialogComponent";
import { cn, Data, getActiveConnectionIdGlobal, getMemoryUsage, getMetaStats, MemoryValue, prepareArg, securedFetch, toUserFriendlyMessage, uploadFileWithProgress } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { FileRejection } from "react-dropzone";
import EditorComponent, { LanguageConfig } from "../EditorComponent";
import { CYPHER_LANGUAGE_CONFIGURATION, CYPHER_LANGUAGE_NAME, DEFAULT_MONARCH_TOKENIZER, STATIC_SUGGESTIONS } from "../CypherEditor";
import { buildCypherCompletionItems, buildUdfFunctionSuggestions } from "../cypherLanguageSuggestions";
import { Graph, GraphInfo } from "../../api/graph/model";
import { CSV_UPLOAD_ENABLED } from "@/lib/graphUpload";

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

const CSV_URL_PLACEHOLDER = "$csvUrl";

function buildLoadCsvPrefix(withHeaders: boolean): string {
    const loadPrefix = withHeaders ? "LOAD CSV WITH HEADERS" : "LOAD CSV";
    return `${loadPrefix} FROM ${CSV_URL_PLACEHOLDER} AS row`;
}

function buildLoadCsvBodyStarter(): string {
    return "WITH row\nRETURN count(*) AS rows_loaded\n";
}

function buildLoadCsvQuery(withHeaders: boolean, body: string): string {
    const prefix = buildLoadCsvPrefix(withHeaders);
    const normalizedBody = body.trim();
    return normalizedBody ? `${prefix}\n${normalizedBody}` : prefix;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadGraph({ graphName, disabled, open, onOpenChange, onSuccess }: {
    /* eslint-disable react/require-default-props */
    graphName: string
    disabled?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}) {
    // ── shared ──────────────────────────────────────────────────────────────
    const [mode, setMode] = useState<UploadMode>("cypher");
    const [isLoading, setIsLoading] = useState(false);
    const [phase, setPhase] = useState<"uploading" | "processing" | null>(null);
    const [uploadPct, setUploadPct] = useState(0);
    const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
    const [internalOpen, setInternalOpen] = useState(false);
    const { toast } = useToast();
    const { settings: { showPropertyKeyPrefixSettings: { showPropertyKeyPrefix }, graphInfo: { showMemoryUsage } }, tutorialOpen } = useContext(BrowserSettingsContext);
    const { isReadOnly } = useContext(ConnectionContext);
    const { setData, setViewport, setGraphData } = useContext(ForceGraphContext);
    const { setSearch, setScrollPosition } = useContext(TableViewContext);
    const { graph, setGraph, setGraphInfo, fetchCount, setCurrentTab } = useContext(GraphContext);
    const { setHistoryQuery } = useContext(HistoryQueryContext);
    const { udfList } = useContext(UDFContext);
    const { cypherLanguageConfig } = useContext(CypherLanguageContext);
    const { indicator, setIndicator } = useContext(IndicatorContext);

    // ── cypher batch ─────────────────────────────────────────────────────────
    const [cypherFiles, setCypherFiles] = useState<File[]>([]);

    // ── load-csv ─────────────────────────────────────────────────────────────
    const [csvFiles, setCsvFiles] = useState<File[]>([]);
    /** Non-null once the CSV has been uploaded and a storage key is available. */
    const [csvKey, setCsvKey] = useState<string | null>(null);
    const [csvFileName, setCsvFileName] = useState("");
    const [csvQuery, setCsvQuery] = useState("");
    const [csvWithHeaders, setCsvWithHeaders] = useState(true);
    const loadCsvFormRef = useRef<HTMLFormElement>(null);
    // Synchronous re-entrancy guard shared by all three ingestion handlers.
    // `isLoading` is async React state, but Monaco's Enter keybinding calls
    // requestSubmit() directly, so two submits can race before it renders —
    // guarding here prevents executing a Cypher batch / LOAD CSV twice.
    const inFlightRef = useRef(false);

    const udfSuggestions = useMemo(() => buildUdfFunctionSuggestions(udfList), [udfList]);

    const loadCsvLanguageConfig = useMemo((): LanguageConfig => ({
        monarchTokensProvider: DEFAULT_MONARCH_TOKENIZER,
        languageConfiguration: CYPHER_LANGUAGE_CONFIGURATION,
        triggerCharacters: ["."],
        getSuggestions: async (monacoInstance: Monaco, context, model) => {
            return buildCypherCompletionItems({
                monacoInstance,
                context,
                graphInfo: graph.GraphInfo,
                queryText: model?.getValue() ?? "",
                udfSuggestions,
                staticSuggestions: STATIC_SUGGESTIONS,
                includeGraphMetadata: true,
            });
        },
    }), [graph, udfSuggestions]);

    const editorLanguageConfig = useMemo((): LanguageConfig => {
        if (!cypherLanguageConfig) return loadCsvLanguageConfig;

        // Keep tokenizer ownership in the main Cypher editor so all Cypher
        // editors share the same highlighting state.
        const { monarchTokensProvider: _ignored, ...rest } = cypherLanguageConfig;
        return rest;
    }, [cypherLanguageConfig, loadCsvLanguageConfig]);

    const loadCsvPrefix = useMemo(
        () => (csvKey ? buildLoadCsvPrefix(csvWithHeaders) : ""),
        [csvKey, csvWithHeaders]
    );

    const fullCsvQuery = useMemo(
        () => (csvKey ? buildLoadCsvQuery(csvWithHeaders, csvQuery) : ""),
        [csvKey, csvWithHeaders, csvQuery]
    );

    // ─────────────────────────────────────────────────────────────────────────

    const dialogOpen = useMemo(
        () => (isControlled ? (open as boolean) : internalOpen),
        [isControlled, open, internalOpen]
    );

    const cleanupUploadedCsv = useCallback((key: string) => {
        // Best-effort cleanup for cancel/exit paths. Leading slash so the request
        // targets /api/... regardless of the current route (e.g. /graph).
        void fetch(`/api/csv-temp/${encodeURIComponent(key)}`, {
            method: "DELETE",
            credentials: "same-origin",
        }).catch(() => undefined);
    }, []);

    const handleOpenChange = (nextOpen: boolean, force = false) => {
        if (!nextOpen && (isLoading || inFlightRef.current) && !force) return;

        // If user closes/cancels after uploading a CSV (but before execution),
        // try deleting the temp file immediately as a best-effort cleanup.
        if (!nextOpen && !force && csvKey) {
            cleanupUploadedCsv(csvKey);
        }

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
            setCsvFileName("");
            setCsvQuery("");
            setCsvWithHeaders(true);
            setIsLoading(false);
            setPhase(null);
            setUploadPct(0);
        }
    }, [dialogOpen]);

    const resetMode = useCallback(() => {
        if (csvKey) {
            cleanupUploadedCsv(csvKey);
        }
        setCypherFiles([]);
        setCsvFiles([]);
        setCsvKey(null);
        setCsvFileName("");
        setCsvQuery("");
        setCsvWithHeaders(true);
        setPhase(null);
        setUploadPct(0);
    }, [csvKey, cleanupUploadedCsv]);

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
        if (inFlightRef.current) return;
        inFlightRef.current = true;

        try {
            setIsLoading(true);
            setPhase("uploading");
            setUploadPct(0);

            const uploadResult = await uploadFileWithProgress("api/upload", cypherFiles[0], toast, setIndicator, setUploadPct);
            if (!uploadResult.ok) return;

            let id: string;
            try {
                const parsed = JSON.parse(uploadResult.body) as { id?: string };
                if (!parsed.id) throw new Error("Missing id in upload response");
                id = parsed.id;
            } catch {
                toast({ title: "Upload failed", description: "Unexpected response from server.", variant: "destructive" });
                return;
            }
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
            onSuccess?.();
            handleOpenChange(false, true);
        } catch {
            toast({
                title: "Upload state uncertain",
                description: "The request may have completed. Refresh and verify graph data before retrying.",
                variant: "destructive",
                variant: "destructive",
            });
        } finally {
            inFlightRef.current = false;
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
        if (inFlightRef.current) return;
        inFlightRef.current = true;

        try {
            setIsLoading(true);
            setPhase("uploading");
            setUploadPct(0);

            // Upload CSV to per-user temp storage — returns an opaque { key }.
            // The client never receives/handles the storage URL (SSRF-safe): the
            // server resolves the owner-scoped URL when running LOAD CSV.
            const fileName = csvFiles[0].name;
            const uploadResult = await uploadFileWithProgress("api/csv-temp", csvFiles[0], toast, setIndicator, setUploadPct);
            if (!uploadResult.ok) return;

            let key: string;
            try {
                const parsed = JSON.parse(uploadResult.body) as { key?: string };
                if (!parsed.key) throw new Error("Missing key in upload response");
                key = parsed.key;
            } catch {
                toast({ title: "Upload failed", description: "Unexpected response from server.", variant: "destructive" });
                return;
            }
            setCsvKey(key);
            setCsvFileName(fileName);
            setCsvQuery(buildLoadCsvBodyStarter());
        } catch {
            toast({
                title: "Upload state uncertain",
                description: "The request may have completed. Refresh and verify before retrying.",
                variant: "destructive",
                variant: "destructive",
            });
        } finally {
            inFlightRef.current = false;
            setIsLoading(false);
            setPhase(null);
            setUploadPct(0);
        }
    };

    const onRunLoadCsv = async (e: FormEvent) => {
        e.preventDefault();

        if (!graphName) {
            toast({ title: "Error", description: "Select a single graph before running LOAD CSV.", variant: "destructive" });
            return;
        }

        if (!csvKey || !csvQuery.trim()) return;
        if (inFlightRef.current) return;
        inFlightRef.current = true;

        try {
            setIsLoading(true);
            setPhase("processing");

            const result = await securedFetch(
                `api/graph/${prepareArg(graphName)}/load-csv`,
                { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: csvKey, withHeaders: csvWithHeaders, body: csvQuery }) },
                toast,
                setIndicator
            );
            if (!result.ok) return;

            const data = await result.json() as {
                message?: string;
                error?: { message?: string; status?: number };
                result?: { data?: Data; metadata?: unknown[] };
            };

            // The import streams a keep-alive heartbeat then a single JSON object;
            // a query-execution failure is reported in the body (HTTP 200) as
            // `error` rather than a status code. Route it through the same
            // user-friendly mapping securedFetch uses (syntax highlighting, hints,
            // allowlisted verbatim messages).
            if (data.error) {
                const friendly = toUserFriendlyMessage(
                    data.error.message ?? "Failed to execute the LOAD CSV query.",
                    data.error.status ?? 422,
                    { query: fullCsvQuery }
                );
                toast({
                    title: friendly.title,
                    description: friendly.description,
                    variant: "destructive",
                    rawMessage: friendly.rawMessage,
                    hint: friendly.hint,
                    hintLink: friendly.hintLink,
                });
                return;
            }

            if (data.result?.data && Array.isArray(data.result.metadata)) {
                let graphInfo: GraphInfo | undefined;
                try {
                    const readOnlyParam = isReadOnly ? '&readOnly=true' : '';
                    const metaStats = await getMetaStats(graphName, toast, setIndicator, isReadOnly);
                    const propertyInfo = await securedFetch(
                        `api/graph/${prepareArg(graphName)}/info?type=${prepareArg("(property key)")}${readOnlyParam}`,
                        { method: "GET" },
                        toast,
                        setIndicator
                    );
                    const propertyJson = propertyInfo.ok
                        ? await propertyInfo.json() as { result?: { data?: Array<{ info?: unknown }> } }
                        : undefined;
                    const propertyKeys = (propertyJson?.result?.data ?? [])
                        .map((entry) => (typeof entry?.info === "string" ? entry.info : undefined))
                        .filter((value): value is string => typeof value === "string");
                    const memoryUsage = showMemoryUsage
                        ? await getMemoryUsage(graphName, toast, setIndicator, getActiveConnectionIdGlobal())
                        : new Map<string, MemoryValue>();

                    graphInfo = await GraphInfo.create(
                        propertyKeys,
                        metaStats?.[0] ?? [],
                        metaStats?.[1] ?? [],
                        memoryUsage,
                        toast,
                        setIndicator
                    );
                } catch {
                    graphInfo = graph.Id === graphName
                        ? graph.GraphInfo
                        : undefined;
                }

                const nextGraph = await Graph.create(
                    graphName,
                    { data: data.result.data, metadata: data.result.metadata },
                    showPropertyKeyPrefix,
                    graph.CurrentLimit,
                    graphInfo
                );

                setGraph(nextGraph);
                setGraphInfo(nextGraph.GraphInfo);
                setData({ ...nextGraph.Elements });
                setViewport(undefined);
                setGraphData(undefined);
                setSearch("");
                setScrollPosition(0);
                await fetchCount(graphName);
                if (!tutorialOpen) {
                    setCurrentTab(nextGraph.getElements().length === 0 && nextGraph.Data.length !== 0 ? "Table" : "Graph");
                }
            }

            toast({ title: "LOAD CSV completed", description: data.message || "Data imported successfully." });

            // Reflect the executed LOAD CSV query in the main editor state
            // without appending anything to query history.
            setHistoryQuery((prev) => ({
                ...prev,
                counter: 0,
                query: fullCsvQuery,
                currentQuery: {
                    ...prev.currentQuery,
                    text: fullCsvQuery,
                    graphName,
                },
            }));

            onSuccess?.();
            handleOpenChange(false, true);
        } catch {
            toast({
                title: "Upload state uncertain",
                description: "The import may have completed. Refresh and verify graph data before retrying.",
                variant: "destructive",
                variant: "destructive",
            });
        } finally {
            inFlightRef.current = false;
            setIsLoading(false);
            setPhase(null);
        }
    };

    const handleLoadCsvEditorDidMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
        editor.addAction({
            id: "upload-load-csv-submit",
            label: "Run LOAD CSV query",
            keybindings: [monaco.KeyCode.Enter],
            precondition: "!suggestWidgetVisible",
            run: () => {
                loadCsvFormRef.current?.requestSubmit();
            },
        });

        // Ctrl/Cmd+Enter inserts a raw newline in the Upload editor.
        // eslint-disable-next-line no-bitwise
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            editor.trigger("keyboard", "type", { text: "\n" });
        });

        editor.addAction({
            id: "upload-load-csv-escape",
            label: "Blur upload editor",
            keybindings: [monaco.KeyCode.Escape],
            precondition: "!suggestWidgetVisible",
            run: () => {
                (document.activeElement as HTMLElement | null)?.blur();
            },
        });
    }, []);

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
                        <TabsTrigger
                            className={cn("px-2 py-0.5 text-sm border border-transparent hover:bg-background/10 hover:border-border/10 data-[state=active]:!bg-secondary data-[state=active]:!text-primary")}
                            value="cypher"
                            disabled={isLoading}
                        >
                            Cypher batch
                        </TabsTrigger>
                        {CSV_UPLOAD_ENABLED && (
                            <TabsTrigger
                                className={cn("px-2 py-0.5 text-sm border border-transparent hover:bg-background/10 hover:border-border/10 data-[state=active]:!bg-secondary data-[state=active]:!text-primary")}
                                value="load-csv"
                                disabled={isLoading}
                            >
                                Load CSV
                            </TabsTrigger>
                        )}
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
                                maxFiles={1}
                                disabled={isLoading}
                                onFileDrop={setCypherFiles}
                                onDropRejected={handleCypherDropRejected}
                                accept={ACCEPTED_CYPHER}
                            />
                            {cypherFiles.length === 1 && (
                                <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                            <FileSpreadsheet size={16} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium" title={cypherFiles[0].name}>
                                                {cypherFiles[0].name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(cypherFiles[0].size)} · Cypher file ready to upload
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCypherFiles([])}
                                            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
                                            title="Remove file"
                                            aria-label="Remove selected Cypher file"
                                            disabled={isLoading}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {progressBar}
                            <div className="flex gap-3 justify-end">
                                <Button
                                    type="submit"
                                    label="Upload"
                                    title="Execute Cypher statements into the graph"
                                    variant="Primary"
                                    isLoading={isLoading}
                                    indicator={indicator}
                                    disabled={cypherFiles.length !== 1 || isLoading}
                                    data-testid="uploadGraphConfirm"
                                />
                                <CloseDialog data-testid="uploadGraphCancel" disabled={isLoading} />
                            </div>
                        </form>
                    </TabsContent>

                    {/* ── Load CSV ─────────────────────────────────────── */}
                    {CSV_UPLOAD_ENABLED && (
                    <TabsContent value="load-csv">
                        {/* Step 1: pick and upload the CSV file */}
                        {!csvKey && (
                            <form onSubmit={onUploadCsvToTemp} className="flex flex-col gap-4 mt-2">
                                <p className="text-sm text-muted-foreground">
                                    Upload a .csv file, then complete the{" "}
                                    <code className="rounded bg-muted px-1 py-0.5 text-xs">LOAD CSV ... AS row</code>{" "}
                                    query body to import it into the graph.
                                </p>
                                <Dropzone
                                    filesCount
                                    className="flex-col"
                                    maxFiles={1}
                                    disabled={isLoading}
                                    onFileDrop={setCsvFiles}
                                    onDropRejected={handleCsvDropRejected}
                                    accept={ACCEPTED_CSV}
                                />
                                {csvFiles.length === 1 && (
                                    <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                <FileSpreadsheet size={16} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium" title={csvFiles[0].name}>
                                                    {csvFiles[0].name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatFileSize(csvFiles[0].size)} · CSV file ready to upload
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCsvFiles([])}
                                                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
                                                title="Remove file"
                                                aria-label="Remove selected CSV file"
                                                disabled={isLoading}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {progressBar}
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        type="submit"
                                        label="Upload CSV"
                                        title="Upload the CSV to temporary storage and get a temporary key"
                                        variant="Primary"
                                        isLoading={isLoading}
                                        indicator={indicator}
                                        disabled={csvFiles.length !== 1 || isLoading}
                                        data-testid="uploadCsvTempConfirm"
                                    />
                                    <CloseDialog data-testid="uploadGraphCancel" disabled={isLoading} />
                                </div>
                            </form>
                        )}

                        {/* Step 2: edit query and run */}
                        {csvKey && (
                            <form ref={loadCsvFormRef} onSubmit={onRunLoadCsv} className="flex flex-col gap-4 mt-2">
                                <p className="text-sm text-muted-foreground">
                                    CSV uploaded. Complete the query below and click <strong>Run</strong>.
                                    The file will be deleted after the query finishes.
                                </p>

                                {/* Uploaded file display */}
                                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                                    <FileSpreadsheet size={14} className="shrink-0 text-muted-foreground" />
                                    <span className="flex-1 truncate font-mono text-xs" title={csvFileName}>{csvFileName}</span>
                                </div>

                                {/* Editable LOAD CSV query */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="loadCsvQuery" className="text-sm font-medium">
                                        Cypher query
                                    </label>
                                    <label
                                        htmlFor="loadCsvWithHeaders"
                                        className="inline-flex items-center gap-2 text-xs text-muted-foreground"
                                    >
                                        <input
                                            id="loadCsvWithHeaders"
                                            type="checkbox"
                                            checked={csvWithHeaders}
                                            onChange={(e) => setCsvWithHeaders(e.target.checked)}
                                            disabled={isLoading}
                                            className="h-4 w-4 rounded border border-border bg-background align-middle"
                                        />
                                        Use CSV headers
                                    </label>
                                    <div className="rounded-md border bg-muted/40 px-3 py-2">
                                        <code className="font-mono text-xs">{loadCsvPrefix}</code>
                                    </div>
                                    <div className="h-36 w-full rounded-lg border border-border overflow-hidden" data-testid="loadCsvQuery">
                                        <EditorComponent
                                            className="SofiaSans"
                                            height="100%"
                                            language={CYPHER_LANGUAGE_NAME}
                                            languageConfig={editorLanguageConfig}
                                            themeName="selector-theme"
                                            options={{
                                                lineHeight: 22,
                                                fontSize: 14,
                                                lineNumbersMinChars: 3,
                                                quickSuggestions: true,
                                                suggestOnTriggerCharacters: true,
                                                scrollBeyondLastLine: false,
                                                wordWrap: "on",
                                                renderWhitespace: "none"
                                            }}
                                            value={csvQuery}
                                            onChange={(value) => setCsvQuery(value ?? "")}
                                            onMount={handleLoadCsvEditorDidMount}
                                            readOnly={isLoading}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {csvWithHeaders ? (
                                            <>
                                                Each CSV column is available as{" "}
                                                <code className="rounded bg-muted px-1 py-0.5">row.columnName</code>.
                                            </>
                                        ) : (
                                            <>
                                                Without headers, columns are available as{" "}
                                                <code className="rounded bg-muted px-1 py-0.5">row[0]</code>,{" "}
                                                <code className="rounded bg-muted px-1 py-0.5">row[1]</code>, ...
                                            </>
                                        )}
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
                                        disabled={!graphName || !csvQuery.trim() || isLoading}
                                        data-testid="loadCsvRunConfirm"
                                    />
                                    <CloseDialog data-testid="uploadGraphCancel" disabled={isLoading} />
                                </div>
                            </form>
                        )}
                    </TabsContent>
                    )}
                </Tabs>
            </div>
        </DialogComponent>
    );
}
