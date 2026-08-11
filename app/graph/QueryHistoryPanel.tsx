'use client';

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { Monaco } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Download, History, Info, ListChecks, ListX, Star, StarX, Trash2, X } from "lucide-react";
import { cn, getTheme, Query } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { setConnectionItem, removeConnectionItem } from "@/lib/connection-storage";
import Button from "../components/ui/Button";
import EditorComponent from "../components/EditorComponent";
import { LanguageConfig } from "../components/EditorComponent";
import { CYPHER_LANGUAGE_NAME, STATIC_SUGGESTIONS } from "../components/CypherEditor";
import { extractVariableCandidates } from "@/lib/cypherSuggestions";
import { udfFunctionNames } from "@/lib/cypherLang";
import { createFalkorCypherEngine, attachGrammarLinting, registerGrammarCodeActions, getGrammarDiagnostics, toCompletionItems, type FalkorSchema } from "@/lib/falkordb-cypher";
import PaginationList from "../components/PaginationList";
import { GraphContext, HistoryQueryContext, IndicatorContext, QueryLoadingContext, UDFContext, AiFixContext } from "../components/provider";
import { Explain, Metadata, Profile } from "./MetadataView";

type Tab = "text" | "metadata" | "explain" | "profile";

/** Serializes queries into a runnable `.cypher` batch, one statement per query.
 *  The terminator sits on its own line so a trailing `//` comment can't swallow it. */
const buildCypherBatch = (queries: Query[]) => queries.map(query => {
    const header = query.graphName && `// graph: ${query.graphName}`
    const text = query.text.trim().replace(/;+$/, "");

    return header ? `${header}\n${text}\n;` : `${text}\n;`;
}).join("\n\n");

interface Props {
    onClose: () => void;
    graphName: string;
    /** Optional: language config from the main Cypher editor. When provided, the
     *  history editor shares the same suggestion logic (same schema, same sorting). */
    languageConfig?: LanguageConfig;
}

export default function QueryHistoryPanel({ onClose, graphName, languageConfig: sharedLanguageConfig }: Props) {
    const { historyQuery, setHistoryQuery } = useContext(HistoryQueryContext);
    const { graph, graphNames, runQuery, fetchCount } = useContext(GraphContext);
    const { udfList } = useContext(UDFContext);
    const { isQueryLoading } = useContext(QueryLoadingContext);
    const { indicator } = useContext(IndicatorContext);
    const { aiFixSupported, requestAiFix, reportClientError } = useContext(AiFixContext);
    const { toast } = useToast();

    const { theme } = useTheme();
    const { background } = getTheme(theme);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const submitQuery = useRef<HTMLButtonElement>(null);
    const searchQueryRef = useRef<HTMLInputElement>(null);

    // falkordb-cypher engine — same brain the main editor uses, so the history
    // editor gets identical real-time syntax validation. Its schema getter reads
    // the always-current engineSchemaRef (kept in sync below).
    const engineSchemaRef = useRef<FalkorSchema>({});
    const engineRef = useRef(createFalkorCypherEngine(() => engineSchemaRef.current));
    // Latest AI-fix capability/handler for the shared grammar code-action provider.
    const aiFixRef = useRef({ aiFixSupported, requestAiFix });
    useEffect(() => { aiFixRef.current = { aiFixSupported, requestAiFix }; }, [aiFixSupported, requestAiFix]);
    // Toggled by the real-time linter; false blocks execution.
    const [isQueryValid, setIsQueryValid] = useState(true);

    const [filteredQueries, setFilteredQueries] = useState<Query[]>([]);
    // The list PaginationList actually renders, i.e. `filteredQueries` after its internal
    // search filtering. Select-all must act on what the user can see.
    const [visibleQueries, setVisibleQueries] = useState<Query[]>([]);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [favFilter, setFavFilter] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tab, setTab] = useState<Tab>("text");
    // Timestamps, not query text: the same text can be run many times, and text-keyed
    // selection makes delete/export/un-fav hit every repeat. `timestamp` is already the
    // entry identity used by handleToggleFav and is present on every stored record.
    const [selectedQueries, setSelectedQueries] = useState<number[]>([]);
    const [wrapLines, setWrapLines] = useState(false);

    const filters = useMemo(() => {
        const queries = historyQuery?.queries ?? [];
        const availableGraphNames = graphNames ?? [];
        if (availableGraphNames.length + 10 <= queries.length) {
            return availableGraphNames.filter(name => queries.some(query => query.graphName === name));
        }
        return Array.from(new Set(queries.map(query => query.graphName).filter(name => !!name)));
    }, [graphNames, historyQuery?.queries]);

    const currentQuery = historyQuery?.counter === 0
        ? historyQuery.currentQuery
        : historyQuery?.queries[historyQuery.counter - 1];

    // Refs so getSuggestions closure always reads fresh values without recreating the config
    const currentQueryRef = useRef(currentQuery);
    const graphRef = useRef(graph);
    const graphNameRef = useRef(graphName);
    useEffect(() => { currentQueryRef.current = currentQuery; }, [currentQuery]);
    useEffect(() => { graphRef.current = graph; }, [graph]);
    useEffect(() => { graphNameRef.current = graphName; }, [graphName]);

    // Keep the engine schema in sync so completion (once the grammar is generated)
    // sees this graph's labels, relationship types, property keys, and UDFs.
    useEffect(() => {
        engineSchemaRef.current = {
            labels: Array.from(graph.GraphInfo.Labels.keys()).filter(Boolean) as string[],
            relationshipTypes: Array.from(graph.GraphInfo.Relationships.keys()).filter(Boolean) as string[],
            propertyKeys: (graph.GraphInfo.PropertyKeys ?? []) as string[],
            functions: udfFunctionNames(udfList),
        };
    }, [graph, udfList]);

    const udfSuggestions = useMemo(() =>
        udfList.flatMap(([, libName, , functions]) =>
            functions.map((fn: string) => ({
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                insertText: `${libName}.${fn}(\${0})`,
                label: `${libName}.${fn}()`,
                kind: monaco.languages.CompletionItemKind.Function,
                detail: '(udf function)',
            }))
        ), [udfList]);
    const udfSuggestionsRef = useRef(udfSuggestions);
    useEffect(() => { udfSuggestionsRef.current = udfSuggestions; }, [udfSuggestions]);

    // Stable language config — getSuggestions reads from refs so it never needs recreation.
    // Shows graph-based suggestions (labels, relationships, property keys) only when the
    // query’s graph name matches the currently selected graph.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const historyLanguageConfig = useMemo((): LanguageConfig => ({
        triggerCharacters: ['.'],
        getSuggestions: async (monacoInstance: Monaco, context, model, position) => {
            const g = graphRef.current;
            const graphMatches = currentQueryRef.current?.graphName === graphNameRef.current;
            const udfs = udfSuggestionsRef.current;

            // Dot-triggered: property keys only (when graph matches)
            if (context?.triggerCharacter === '.') {
                if (!graphMatches) return [];
                return (g.GraphInfo.PropertyKeys ?? []).map(key => ({
                    insertText: key,
                    label: key,
                    kind: monacoInstance.languages.CompletionItemKind.Property,
                    detail: '(property key)',
                }));
            }

            // EditorComponent always overwrites `range`; use a loose type to avoid
            // the strict `range` requirement on every push.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const items: any[] = [...STATIC_SUGGESTIONS, ...udfs];

            // Bound variables from the currently displayed query
            const queryText = currentQueryRef.current?.text ?? "";
            extractVariableCandidates(queryText).forEach(v => {
                items.push({
                    insertText: v,
                    label: v,
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    detail: '(variable)',
                });
            });

            if (graphMatches) {
                g.GraphInfo.Labels.forEach((_, name) => {
                    if (!name) return;
                    items.push({ insertText: name, label: name, kind: monacoInstance.languages.CompletionItemKind.Class, detail: '(label)' });
                });
                g.GraphInfo.Relationships.forEach((_, name) => {
                    if (!name) return;
                    items.push({ insertText: name, label: name, kind: monacoInstance.languages.CompletionItemKind.Interface, detail: '(relationship type)' });
                });
                (g.GraphInfo.PropertyKeys ?? []).forEach(key => {
                    items.push({ insertText: key, label: key, kind: monacoInstance.languages.CompletionItemKind.Property, detail: '(property key)' });
                });
            }

            // Grammar-aware completions from the engine (inert until the ANTLR
            // grammar is generated), merged in and deduped by label.
            if (model && position) {
                const engineItems = toCompletionItems(monacoInstance, engineRef.current.getCompletions(model.getValue(), position.lineNumber, position.column - 1));
                const seen = new Set(items.map(s => (typeof s.label === 'string' ? s.label : s.label.label)));
                engineItems.forEach(s => {
                    const l = typeof s.label === 'string' ? s.label : s.label.label;
                    if (!seen.has(l)) items.push(s);
                });
            }

            return items;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []);

    // Monaco tokenization is global per language id. If we pass through
    // monarchTokensProvider from the main editor config here, mounting this
    // history editor can clobber the main editor tokenizer registration.
    const historyEditorLanguageConfig = useMemo((): LanguageConfig => {
        if (!sharedLanguageConfig) return historyLanguageConfig;
        const { monarchTokensProvider: _monarchTokensProvider, ...safeConfig } = sharedLanguageConfig;
        return safeConfig;
    }, [sharedLanguageConfig, historyLanguageConfig]);

    const afterSearchCallback = useCallback((newFilteredList: Query[]) => {
        setVisibleQueries(newFilteredList);

        const selectedQuery = historyQuery.counter === 0
            ? historyQuery.currentQuery
            : historyQuery.queries[historyQuery.counter - 1];

        if (selectedQuery && newFilteredList.every(q => q.text !== selectedQuery.text)) {
            setHistoryQuery(prev => {
                if (prev.counter === 0) return prev;
                return {
                    ...prev,
                    counter: 0
                };
            });
        }
    }, [historyQuery, setHistoryQuery]);

    const resetHistoryFilters = useCallback(() => {
        if (!historyQuery) {
            setFilteredQueries([]);
            setActiveFilters([]);
            setFavFilter(false);
            return;
        }

        if (graphName && filters.some(name => name === graphName)) {
            setActiveFilters([graphName]);
            const scopedQueries = [
                ...historyQuery.queries.filter(({ graphName: n }) => graphName === n)
            ].reverse();

            setFilteredQueries(scopedQueries);
            afterSearchCallback(scopedQueries);
            return;
        }

        const allQueries = [...historyQuery.queries].reverse();
        setActiveFilters([]);
        setFavFilter(false);
        setFilteredQueries(allQueries);
        afterSearchCallback(allQueries);
    }, [historyQuery, graphName, filters, afterSearchCallback]);

    const applyFilters = useCallback((queries: Query[], graphFilters: string[], onlyFav: boolean) => {
        let result = queries;
        if (graphFilters.length > 0) {
            result = result.filter(({ graphName: n }) => graphFilters.some(f => f === n));
        }
        if (onlyFav) {
            result = result.filter(q => q.fav);
        }
        return [...result].reverse();
    }, []);

    const handelSetFilteredQueries = useCallback((name?: string, toggleFav?: boolean) => {
        if (!historyQuery) return;

        let newActiveFilters = activeFilters;
        if (name) {
            if (activeFilters.some(f => f === name)) {
                newActiveFilters = activeFilters.filter(f => f !== name);
            } else {
                newActiveFilters = [...activeFilters, name];
            }
        }

        const newFavFilter = toggleFav !== undefined ? toggleFav : favFilter;

        setActiveFilters(newActiveFilters);
        if (toggleFav !== undefined) setFavFilter(toggleFav);

        const newFilteredQueries = applyFilters(historyQuery.queries, newActiveFilters, newFavFilter);

        setFilteredQueries(newFilteredQueries);
        afterSearchCallback(newFilteredQueries);
    }, [activeFilters, afterSearchCallback, historyQuery, favFilter, applyFilters]);

    // Initialize filters on mount.
    useEffect(() => {
        resetHistoryFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const focusEditorAtEnd = () => {
        if (editorRef.current) {
            editorRef.current.focus();

            const model = editorRef.current.getModel();
            if (model) {
                const lastLine = model.getLineCount();
                const lastColumn = model.getLineMaxColumn(lastLine);

                editorRef.current.setPosition({ lineNumber: lastLine, column: lastColumn });
                editorRef.current.revealPositionInCenter({ lineNumber: lastLine, column: lastColumn });
            }
        }
    };

    const isTabEnabled = useCallback((tabName: Tab) => {
        if (tabName === "text") return !!currentQuery;
        if (tabName === "metadata") return !!currentQuery && currentQuery.metadata.length > 0;
        if (tabName === "explain") return !!currentQuery && currentQuery.explain.length > 0;
        return true;
    }, [currentQuery]);

    useEffect(() => {
        if (!currentQuery || tab === "profile") return;

        // Keep users on the text tab even when the query is empty so they can type a new query.
        if (tab === "text") {
            if (!editorRef.current?.hasTextFocus()) {
                focusEditorAtEnd();
            }
            return;
        }

        const currentValue = currentQuery?.[tab];

        if (!currentValue || currentValue.length === 0) {
            const fallbackTab = (Object.keys(currentQuery) as Tab[]).find(isTabEnabled);

            if (fallbackTab && fallbackTab !== tab) {
                setTab(fallbackTab);

                if (fallbackTab === "text" && !editorRef.current?.hasTextFocus()) {
                    focusEditorAtEnd();
                }
            }
        }
    }, [currentQuery, setTab, historyQuery?.query, tab, isTabEnabled]);

    const handleEditorDidMount = (e: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = e;

        // Real-time grammar linting: enriched (prettified + hint + quick-fix)
        // squigglies and the isQueryValid execution gate — identical to the main
        // editor. Register the shared quick-fix + "Fix with AI" provider (guarded).
        registerGrammarCodeActions(monaco, CYPHER_LANGUAGE_NAME, () => aiFixRef.current);
        const lintDisposable = attachGrammarLinting(monaco, e, engineRef.current, setIsQueryValid);
        e.onDidDispose(() => lintDisposable.dispose());

        // eslint-disable-next-line no-bitwise
        e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            submitQuery.current?.click();
        });

        e.addAction({
            id: 'escape-focus-search',
            label: 'Focus search',
            keybindings: [monaco.KeyCode.Escape],
            precondition: '!suggestWidgetVisible',
            run: () => {
                searchQueryRef.current?.focus();
            },
        });

        // eslint-disable-next-line no-bitwise
        e.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
            e.trigger('keyboard', 'type', { text: '\n' });
        });

        e.addAction({
            id: 'submit',
            label: 'Submit Query',
            keybindings: [monaco.KeyCode.Enter],
            contextMenuOrder: 1.5,
            run: async () => {
                submitQuery.current?.click();
            },
            precondition: '!suggestWidgetVisible',
        });

        /* eslint-disable no-bitwise */
        // Enable the Monaco find widget in the history editor.
        e.addAction({
            id: 'open-find-history',
            label: 'Find',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
            run: (editor) => { editor.getAction('actions.find')?.run(); },
        });
        // Prevent browser reload shortcuts from reloading the page inside the history editor.
        // Users can press Escape to leave the editor, then reload normally.
        e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => { });
        e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyR, () => { });
        /* eslint-enable no-bitwise */
    };

    const handleSubmit = async () => {
        // Grammar validation gates execution: invalid syntax never runs. Reuse the
        // failed-run pipeline: prettified toast + "Fix with AI" button.
        if (!isQueryValid) {
            const model = editorRef.current?.getModel();
            const message = (model ? getGrammarDiagnostics(model)[0]?.message : undefined) ?? "Syntax error";
            const query = historyQuery!.query.trim();
            reportClientError(query, message);
            toast({ title: "Syntax Error", description: message, variant: "destructive", query });
            return;
        }
        try {
            setIsLoading(true);
            await runQuery(historyQuery!.query.trim());
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteQuery = useCallback(() => {
        if (!historyQuery || !setHistoryQuery) return;

        const selected = new Set(selectedQueries);
        const deleteElements = historyQuery.queries.reduce<number[]>((acc, query, idx) => {
            if (selected.has(query.timestamp)) acc.push(idx);
            return acc;
        }, []);

        if (deleteElements.length === 0) return;

        const deleteIndices = new Set(deleteElements);
        const newQueries = historyQuery.queries.filter((_, idx) => !deleteIndices.has(idx));

        if (newQueries.length === 0) removeConnectionItem("query history");
        else setConnectionItem("query history", JSON.stringify(newQueries));

        const isCounterDeleted = historyQuery.counter > 0 && deleteElements.includes(historyQuery.counter - 1);

        let nextCounter: number;
        if (isCounterDeleted) {
            nextCounter = 0;
        } else if (historyQuery.counter > 0) {
            const deletedBeforeCount = deleteElements.filter(idx => idx < historyQuery.counter - 1).length;
            nextCounter = Math.max(1, historyQuery.counter - deletedBeforeCount);
            nextCounter = Math.min(nextCounter, newQueries.length);
        } else {
            nextCounter = 0;
        }

        const nextQuery = nextCounter ? newQueries[nextCounter - 1].text : historyQuery.currentQuery.text;

        setHistoryQuery(prev => ({
            ...prev,
            queries: newQueries,
            counter: nextCounter,
            query: nextQuery
        }));
        setSelectedQueries([]);
        setFilteredQueries(current => current.filter(query => !selected.has(query.timestamp)));
    }, [historyQuery, setHistoryQuery, selectedQueries]);

    const handleExportSelected = useCallback(() => {
        if (!historyQuery) return;

        const selected = new Set(selectedQueries);
        const queries = historyQuery.queries.filter(query => selected.has(query.timestamp));

        if (queries.length === 0) return;

        const url = URL.createObjectURL(new Blob([`${buildCypherBatch(queries)}\n`], { type: "text/plain;charset=utf-8" }));

        const link = document.createElement("a");
        link.href = url;
        // ISO, not toLocaleString(): the file name must not change with the user's locale.
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        link.download = `falkordb-queries-${timestamp}.cypher`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        // Deferred: Firefox and Safari abort the download if the blob URL is revoked
        // in the same task as the click.
        setTimeout(() => URL.revokeObjectURL(url), 0);
    }, [historyQuery, selectedQueries]);

    const handleToggleFav = useCallback((item: Query, name?: string) => {
        if (!historyQuery || !setHistoryQuery) return;

        const newQueries = historyQuery.queries.map(q =>
            q.timestamp === item.timestamp ? { ...q, fav: !q.fav, name } : q
        );

        setConnectionItem("query history", JSON.stringify(newQueries));

        setHistoryQuery(prev => ({
            ...prev,
            queries: newQueries,
            currentQuery: prev.currentQuery.timestamp === item.timestamp
                ? { ...prev.currentQuery, fav: !prev.currentQuery.fav, name }
                : prev.currentQuery,
        }));

        setFilteredQueries(prev =>
            prev.map(q => q.timestamp === item.timestamp ? { ...q, fav: !q.fav, name } : q)
        );
    }, [historyQuery, setHistoryQuery]);

    const handleClearSelectedFav = useCallback(() => {
        if (!historyQuery || !setHistoryQuery) return;

        const selected = new Set(selectedQueries);
        const unFav = (q: Query) =>
            q.fav && selected.has(q.timestamp) ? { ...q, fav: false, name: undefined } : q;

        const newQueries = historyQuery.queries.map(unFav);

        setConnectionItem("query history", JSON.stringify(newQueries));

        setHistoryQuery(prev => ({
            ...prev,
            queries: newQueries,
            currentQuery: unFav(prev.currentQuery),
        }));

        setFilteredQueries(prev => prev.map(unFav));
    }, [historyQuery, setHistoryQuery, selectedQueries]);

    if (!historyQuery || !setHistoryQuery) return null;

    const selectedSet = new Set(selectedQueries);
    const isAllSelected = visibleQueries.length > 0 && visibleQueries.every(q => selectedSet.has(q.timestamp));
    const hasSelectedFav = historyQuery.queries.some(q => q.fav && selectedSet.has(q.timestamp));

    return (
        <div data-testid="queryHistoryPanel" className="h-full w-full border border-border rounded-lg bg-background">
            <div className="relative h-full w-full flex flex-col rounded-lg p-3 overflow-y-auto">
                <Button
                    data-testid="queryHistoryCloseButton"
                    className="absolute top-2 right-2"
                    title="Close"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
                <div className="w-full flex justify-between items-center pr-8">
                    <h1 className="text-lg font-semibold">Query History</h1>
                    <History size={20} className="text-foreground/50" />
                </div>
                <PaginationList
                    label="Query"
                    className="overflow-hidden h-[313px] max-h-[393px] p-1 border-b border-border"
                    isSelected={(item) => selectedSet.has(item.timestamp)}
                    afterSearchCallback={afterSearchCallback}
                    onToggleFav={handleToggleFav}
                    dataTestId="queryHistory"
                    list={filteredQueries}
                    actionButtons={
                        <div className="flex gap-2 items-center">
                            <Button
                                variant="Delete"
                                className="p-1"
                                data-testid="queryHistoryClearSelected"
                                title="Remove selected queries from favorites"
                                onClick={handleClearSelectedFav}
                                disabled={!hasSelectedFav}
                            >
                                <StarX size={16} />
                            </Button>
                            <Button
                                className="p-1"
                                variant="Delete"
                                data-testid="queryHistoryDelete"
                                title="Remove selected queries from history"
                                onClick={handleDeleteQuery}
                                disabled={selectedQueries.length === 0}
                            >
                                <Trash2 size={16} />
                            </Button>
                            <Button
                                className="p-1"
                                variant="Primary"
                                data-testid="queryHistoryExport"
                                title="Export selected queries to a .cypher file"
                                onClick={handleExportSelected}
                                disabled={selectedQueries.length === 0}
                            >
                                <Download size={16} />
                            </Button>
                            <Button
                                className="p-1"
                                variant="Primary"
                                data-testid="queryHistorySelectAll"
                                title={isAllSelected ? "Deselect all queries" : "Select all queries"}
                                onClick={() => setSelectedQueries(isAllSelected ? [] : visibleQueries.map(q => q.timestamp))}
                                disabled={visibleQueries.length === 0}
                            >
                                {
                                    !isAllSelected
                                        ? <ListChecks size={16} />
                                        : <ListX size={16} />
                                }
                            </Button>
                            <Tooltip>
                                <TooltipTrigger data-testid="queryHistorySelectInfo" className="flex items-center gap-1 text-foreground/60">
                                    <Info size={16} />
                                    {/* Fixed two-digit slot keeps the row from shifting; longer counts are clipped */}
                                    <span data-testid="queryHistorySelectedCount" className="text-xs tabular-nums w-[2ch] text-left overflow-hidden whitespace-nowrap">
                                        {selectedQueries.length || ""}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent className="whitespace-pre-line">
                                    {`${selectedQueries.length} selected\nPress (Left Click) to select a query\nPress (Ctrl/Cmd + Left Click) for multi select`}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    }
                    onClick={(item, evt) => {
                        const index = historyQuery.queries.findIndex(q => q.timestamp === item.timestamp);

                        if (index === -1) return;

                        const { timestamp } = historyQuery.queries[index];

                        const isCurrent = index + 1 === historyQuery.counter;

                        if (evt.ctrlKey || evt.metaKey) {
                            setSelectedQueries(prev => prev.includes(timestamp) ? prev.filter(t => t !== timestamp) : [...prev, timestamp]);
                        } else {
                            setSelectedQueries(isCurrent ? [] : [timestamp]);
                        }

                        setHistoryQuery(prev => ({
                            ...prev,
                            counter: isCurrent ? 0 : index + 1
                        }));
                        setTab("text");
                    }}
                    onDoubleClick={async (item) => {
                        const index = historyQuery.queries.findIndex(q => q.timestamp === item.timestamp);
                        setHistoryQuery(prev => ({
                            ...prev,
                            counter: index + 1
                        }));
                        setTab("text");
                        try {
                            setIsLoading(true);
                            if (item.text.trim()) {
                                await runQuery(item.text.trim());
                            }
                            onClose();
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                    searchRef={searchQueryRef}
                >
                    <ul className="w-full flex flex-wrap  items-center gap-2 overflow-y-auto max-h-[80px] p-1">
                        <li key="info" className="flex flex-col items-center">
                            <Tooltip>
                                <TooltipTrigger className="flex items-center text-foreground/60">
                                    <Info size={16} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Press graph name to see history of that graph
                                    <br />
                                    (show all queries if no graph name is selected).
                                </TooltipContent>
                            </Tooltip>
                        </li>
                        <li key="fav-filter" className="max-w-full">
                            <Button
                                data-testid="queryHistoryFavFilter"
                                className={cn("bg-background py-0.5 px-2 rounded-full w-full flex items-center gap-1 text-xs", favFilter && "text-background bg-foreground")}
                                title="Filter by favorites"
                                onClick={() => handelSetFilteredQueries(undefined, !favFilter)}
                            >
                                <Star size={12} className={cn(favFilter ? "fill-fav text-fav" : "")} />
                                Favorites
                            </Button>
                        </li>
                        {
                            filters.map(name => (
                                <li key={name} className="max-w-full">
                                    <Button
                                        className={cn("bg-background py-0.5 px-2 rounded-full w-full text-xs", activeFilters.some(f => f === name) && "text-background bg-foreground")}
                                        label={name}
                                        onClick={() => handelSetFilteredQueries(name)}
                                    />
                                </li>
                            ))
                        }
                    </ul>
                </PaginationList>
                <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="w-full flex flex-col items-center basis-0 grow min-h-0 overflow-hidden">
                    <TabsList className="h-fit bg-background gap-1">
                        <TabsTrigger className={cn("px-2 py-0.5 text-sm border border-transparent hover:bg-background/10 hover:border-border/10 data-[state=active]:!bg-secondary data-[state=active]:!text-primary")} disabled={!isTabEnabled("text")} value="text">Edit Query</TabsTrigger>
                        <TabsTrigger className={cn("px-2 py-0.5 text-sm border border-transparent hover:bg-background/10 hover:border-border/10 data-[state=active]:!bg-secondary data-[state=active]:!text-primary")} disabled={!isTabEnabled("profile")} value="profile">Profile</TabsTrigger>
                        <TabsTrigger className={cn("px-2 py-0.5 text-sm border border-transparent hover:bg-background/10 hover:border-border/10 data-[state=active]:!bg-secondary data-[state=active]:!text-primary")} disabled={!isTabEnabled("metadata")} value="metadata">Metadata</TabsTrigger>
                        <TabsTrigger className={cn("px-2 py-0.5 text-sm border border-transparent hover:bg-background/10 hover:border-border/10 data-[state=active]:!bg-secondary data-[state=active]:!text-primary")} disabled={!isTabEnabled("explain")} value="explain">Explain</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" className="mt-0 h-full w-full rounded-lg relative p-1 overflow-hidden">
                        {
                            currentQuery &&
                            <>
                                <Button
                                    ref={submitQuery}
                                    data-testid="queryHistoryEditorRun"
                                    className="z-10 absolute bottom-3 right-4 py-1.5 px-6 text-sm"
                                    indicator={indicator}
                                    variant="Primary"
                                    label="Run"
                                    title={isQueryValid ? "Press Enter to run the query" : "Fix the highlighted syntax errors to run"}
                                    onClick={handleSubmit}
                                    isLoading={isLoading}
                                    disabled={isQueryLoading}
                                />
                                <label
                                    htmlFor="queryHistoryEditorWrapLines"
                                    className="z-10 absolute bottom-3 right-28 py-1.5 px-2 text-sm flex items-center gap-2 cursor-pointer select-none bg-background/80 rounded"
                                >
                                    <Checkbox
                                        id="queryHistoryEditorWrapLines"
                                        data-testid="queryHistoryEditorWrapLines"
                                        checked={wrapLines}
                                        onCheckedChange={(checked) => setWrapLines(checked as boolean)}
                                    />
                                    Wrap lines
                                </label>
                                <EditorComponent
                                    className="SofiaSans"
                                    height="100%"
                                    language={CYPHER_LANGUAGE_NAME}
                                    languageConfig={historyEditorLanguageConfig}
                                    themeName="selector-theme"
                                    options={{
                                        lineHeight: 22,
                                        fontSize: 14,
                                        lineNumbersMinChars: 3,
                                        quickSuggestions: true,
                                        suggestOnTriggerCharacters: true,
                                        scrollbar: {
                                            horizontal: wrapLines ? "hidden" : "auto"
                                        },
                                        scrollBeyondLastLine: false,
                                        wordWrap: wrapLines ? "on" : "off",
                                        renderWhitespace: "none"
                                    }}
                                    value={historyQuery.query}
                                    onChange={(value) => {
                                        setHistoryQuery(prev => {
                                            const newHistoryQuery = {
                                                ...prev,
                                                query: value || "",
                                                currentQuery: {
                                                    ...prev.currentQuery,
                                                    text: prev.counter ? prev.currentQuery.text : value || ""
                                                }
                                            };

                                            return newHistoryQuery;
                                        });
                                    }}
                                    onMount={handleEditorDidMount}
                                />
                            </>
                        }
                    </TabsContent>
                    <TabsContent className="h-full w-full rounded-lg overflow-auto" value="profile">
                        <div className="h-full w-full overflow-auto flex flex-col gap-4">
                            {
                                currentQuery &&
                                <Profile
                                    hideTitle
                                    background={background}
                                    query={currentQuery}
                                    setQuery={({ profile }) => {
                                        setHistoryQuery(prev => {
                                            const newQuery = {
                                                ...prev.currentQuery,
                                                profile: profile || []
                                            };

                                            const newQueries = prev.queries.map(q => q.text === newQuery.text ? newQuery : q);

                                            return {
                                                ...prev,
                                                currentQuery: newQuery,
                                                queries: newQueries
                                            };
                                        });
                                    }}
                                    fetchCount={fetchCount}
                                />
                            }
                        </div>
                    </TabsContent>
                    <TabsContent className="h-full w-full rounded-lg overflow-auto" value="metadata">
                        <div className="h-full w-full overflow-auto flex flex-col gap-4">
                            {
                                currentQuery &&
                                <Metadata
                                    hideTitle
                                    query={currentQuery}
                                />
                            }
                        </div>
                    </TabsContent>
                    <TabsContent className="h-full w-full rounded-lg overflow-auto" value="explain">
                        <div className="h-full w-full overflow-auto flex flex-col gap-4">
                            {
                                currentQuery &&
                                <Explain
                                    hideTitle
                                    background={background}
                                    query={currentQuery}
                                />
                            }
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
