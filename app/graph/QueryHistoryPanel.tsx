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
import { setConnectionItem, removeConnectionItem } from "@/lib/connection-storage";
import Button from "../components/ui/Button";
import EditorComponent from "../components/EditorComponent";
import { LanguageConfig } from "../components/EditorComponent";
import { CYPHER_LANGUAGE_NAME, STATIC_SUGGESTIONS } from "../components/CypherEditor";
import { buildCypherCompletionItems, buildUdfFunctionSuggestions } from "../components/cypherLanguageSuggestions";
import PaginationList from "../components/PaginationList";
import { GraphContext, HistoryQueryContext, IndicatorContext, QueryLoadingContext, UDFContext } from "../components/provider";
import { Explain, Metadata, Profile } from "./MetadataView";

type Tab = "text" | "metadata" | "explain" | "profile";

/** Serializes queries into a runnable `.cypher` batch, one statement per query. */
const buildCypherBatch = (queries: Query[]) => queries.map(query => {
    const header = query.graphName && `// graph: ${query.graphName}`
    const text = query.text.trim().replace(/;+$/, "");

    return header ? `${header}\n${text};` : `${text};`;
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

    const { theme } = useTheme();
    const { background } = getTheme(theme);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const submitQuery = useRef<HTMLButtonElement>(null);
    const searchQueryRef = useRef<HTMLInputElement>(null);

    const [filteredQueries, setFilteredQueries] = useState<Query[]>([]);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [favFilter, setFavFilter] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tab, setTab] = useState<Tab>("text");
    const [selectedQueries, setSelectedQueries] = useState<string[]>([]);
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

    const udfSuggestions = useMemo(() => buildUdfFunctionSuggestions(udfList), [udfList]);
    const udfSuggestionsRef = useRef(udfSuggestions);
    useEffect(() => { udfSuggestionsRef.current = udfSuggestions; }, [udfSuggestions]);

    // Stable language config — getSuggestions reads from refs so it never needs recreation.
    // Shows graph-based suggestions (labels, relationships, property keys) only when the
    // query’s graph name matches the currently selected graph.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const historyLanguageConfig = useMemo((): LanguageConfig => ({
        triggerCharacters: ['.'],
        getSuggestions: async (monacoInstance: Monaco, context) => {
            const g = graphRef.current;
            const graphMatches = currentQueryRef.current?.graphName === graphNameRef.current;
            const udfs = udfSuggestionsRef.current;
            return buildCypherCompletionItems({
                monacoInstance,
                context,
                graphInfo: g.GraphInfo,
                queryText: currentQueryRef.current?.text ?? "",
                udfSuggestions: udfs,
                staticSuggestions: STATIC_SUGGESTIONS,
                includeGraphMetadata: graphMatches,
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []);

    const editorLanguageConfig = useMemo((): LanguageConfig => {
        if (!sharedLanguageConfig) return historyLanguageConfig;

        // Do not reset the global Cypher tokenizer on history-editor mount.
        // The main editor maintains a dynamic tokenizer (bound vars, namespaces),
        // and overriding it here with the default provider causes temporary
        // de-highlighting until the next query-change retokenization.
        const { monarchTokensProvider: _ignored, ...rest } = sharedLanguageConfig;
        return rest;
    }, [sharedLanguageConfig, historyLanguageConfig]);

    const afterSearchCallback = useCallback((newFilteredList: Query[]) => {
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
        // Text editor should stay accessible even when the current query is empty,
        // so users can type a new query from the Current Query state.
        if (tabName === "text") return !!currentQuery;
        if (tabName === "metadata") return !!currentQuery && currentQuery.metadata.length > 0;
        if (tabName === "explain") return !!currentQuery && currentQuery.explain.length > 0;
        return true;
    }, [currentQuery]);

    useEffect(() => {
        if (!currentQuery || tab === "profile") return;

        const currentValue = currentQuery?.[tab];

        // For the text tab, an empty string is expected and should not force
        // fallback to another tab.
        if (tab !== "text" && (!currentValue || currentValue.length === 0)) {
            const fallbackTab = (Object.keys(currentQuery) as Tab[]).find(isTabEnabled);

            if (fallbackTab && fallbackTab !== tab) {
                setTab(fallbackTab);

                if (fallbackTab === "text" && !editorRef.current?.hasTextFocus()) {
                    focusEditorAtEnd();
                }
            }
        } else if (tab === "text" && !editorRef.current?.hasTextFocus()) {
            focusEditorAtEnd();
        }
    }, [currentQuery, setTab, historyQuery?.query, tab, isTabEnabled]);

    const handleEditorDidMount = (e: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = e;

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

        const deleteElements = historyQuery.queries.reduce<number[]>((acc, query, idx) => {
            if (selectedQueries.includes(query.text)) acc.push(idx);
            return acc;
        }, []);

        if (deleteElements.length === 0) return;

        const newQueries = historyQuery.queries.filter((_, idx) => !deleteElements.some((removeIndex) => idx === removeIndex));

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
        setFilteredQueries(current => current.filter(query => !selectedQueries.includes(query.text)));
    }, [historyQuery, setHistoryQuery, selectedQueries]);

    const handleExportSelected = useCallback(() => {
        if (!historyQuery) return;

        const queries = historyQuery.queries.filter(query => selectedQueries.includes(query.text));

        if (queries.length === 0) return;

        const url = URL.createObjectURL(new Blob([`${buildCypherBatch(queries)}\n`], { type: "text/plain;charset=utf-8" }));

        try {
            const link = document.createElement("a");
            link.href = url;
            // Swap characters that are invalid or awkward in file names
            const timestamp = new Date(Date.now())
                .toLocaleString()
                .replace(/[/\\:*?"<>|]/g, "-")
                .replace(/[,\s]+/g, "_");
            link.download = `falkordb-queries-${timestamp}.cypher`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } finally {
            URL.revokeObjectURL(url);
        }
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

        const unFav = (q: Query) =>
            q.fav && selectedQueries.includes(q.text) ? { ...q, fav: false, name: undefined } : q;

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

    const isAllSelected = filteredQueries.length > 0 && filteredQueries.every(q => selectedQueries.includes(q.text));
    const hasSelectedFav = historyQuery.queries.some(q => q.fav && selectedQueries.includes(q.text));

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
                    isSelected={(item) => selectedQueries.includes(item.text)}
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
                                onClick={() => setSelectedQueries(isAllSelected ? [] : filteredQueries.map(q => q.text))}
                                disabled={filteredQueries.length === 0}
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
                                    {`${selectedQueries.length} selected\nPress (Left Click) to select a query\nPress (Ctrl + Left Click) for multi select`}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    }
                    onClick={(counter, evt) => {
                        const index = historyQuery.queries.findIndex(q => q.text === counter);

                        if (index === -1) return;

                        const { text } = historyQuery.queries[index];

                        const isCurrent = index + 1 === historyQuery.counter;

                        if (evt.ctrlKey || evt.metaKey) {
                            setSelectedQueries(prev => prev.includes(text) ? prev.filter(t => t !== text) : [...prev, text]);
                        } else {
                            setSelectedQueries(isCurrent ? [] : [text]);
                        }

                        setHistoryQuery(prev => ({
                            ...prev,
                            counter: isCurrent ? 0 : index + 1
                        }));
                        setTab("text");
                    }}
                    onDoubleClick={async (counter) => {
                        const index = historyQuery.queries.findIndex(q => q.text === counter);
                        setHistoryQuery(prev => ({
                            ...prev,
                            counter: index + 1
                        }));
                        setTab("text");
                        try {
                            setIsLoading(true);
                            if (counter.trim()) {
                                await runQuery(counter.trim());
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
                                    title="Press Enter to run the query"
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
                                    languageConfig={editorLanguageConfig}
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
