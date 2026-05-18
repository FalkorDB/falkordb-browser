'use client';

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { useTheme } from "next-themes";
import { History, Info, Star, Trash2, X } from "lucide-react";
import { cn, getTheme, Query } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { setConnectionItem, removeConnectionItem } from "@/lib/connection-storage";
import Button from "../components/ui/Button";
import EditorComponent from "../components/EditorComponent";
import { CYPHER_LANGUAGE_NAME } from "../components/CypherEditor";
import PaginationList from "../components/PaginationList";
import { GraphContext, HistoryQueryContext, IndicatorContext, QueryLoadingContext } from "../components/provider";
import { Explain, Metadata, Profile } from "./MetadataView";

type Tab = "text" | "metadata" | "explain" | "profile";

interface Props {
    onClose: () => void;
    graphName: string;
}

export default function QueryHistoryPanel({ onClose, graphName }: Props) {
    const { historyQuery, setHistoryQuery } = useContext(HistoryQueryContext);
    const { graphNames, runQuery, fetchCount } = useContext(GraphContext);
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
    const [deleteElements, setDeleteElements] = useState<number[]>([]);
    const [wrapLines, setWrapLines] = useState(false);

    const filters = useMemo(() => {
        const queries = historyQuery?.queries ?? [];
        if (graphNames.length + 10 <= queries.length) {
            return graphNames.filter(name => queries.some(query => query.graphName === name));
        }
        return Array.from(new Set(queries.map(query => query.graphName).filter(name => !!name)));
    }, [graphNames, historyQuery?.queries]);

    const currentQuery = historyQuery?.counter === 0
        ? historyQuery.currentQuery
        : historyQuery?.queries[historyQuery.counter - 1];

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
        if (tabName === "text") return !!currentQuery?.text;
        if (tabName === "metadata") return !!currentQuery && currentQuery.metadata.length > 0;
        if (tabName === "explain") return !!currentQuery && currentQuery.explain.length > 0;
        return true;
    }, [currentQuery]);

    useEffect(() => {
        if (!currentQuery || tab === "profile") return;

        const currentValue = currentQuery?.[tab];

        if (!currentValue || currentValue.length === 0) {
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

        e.addCommand(monaco.KeyCode.Escape, () => {
            searchQueryRef.current?.focus();
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
        setDeleteElements([]);
        setFilteredQueries(current => current.filter(query => deleteElements.some((removeIndex) => historyQuery.queries[removeIndex].timestamp === query.timestamp)));
    }, [historyQuery, setHistoryQuery, deleteElements]);

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

    if (!historyQuery || !setHistoryQuery) return null;

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
                    isSelected={(item) => historyQuery.queries.findIndex(q => q.text === item.text) + 1 === historyQuery.counter}
                    isDeleteSelected={(item) => deleteElements.some(idx => historyQuery.queries[idx]?.text === item.text)}
                    afterSearchCallback={afterSearchCallback}
                    onToggleFav={handleToggleFav}
                    dataTestId="queryHistory"
                    list={filteredQueries}
                    actionButtons={
                        <div className="flex gap-2">
                            <Button
                                className="p-1"
                                variant="Delete"
                                data-testid="queryHistoryDelete"
                                title={`Remove selected query from history
                                    press (Right Click) to select
                                    press (Ctrl + Right Click) for multi select`}
                                onClick={handleDeleteQuery}
                                disabled={deleteElements.length === 0}
                            >
                                <Trash2 size={16} />
                            </Button>
                            <Button
                                className="p-1 text-xs"
                                variant="Delete"
                                data-testid="queryHistoryDelete"
                                title="Remove all queries from history"
                                onClick={() => {
                                    removeConnectionItem("query history");
                                    setHistoryQuery(prev => ({
                                        ...prev,
                                        queries: [],
                                        counter: 0
                                    }));
                                    setFilteredQueries([]);
                                    setActiveFilters([]);
                                    setDeleteElements([]);
                                }}
                                disabled={historyQuery.queries.length === 0}
                            >
                                <Trash2 size={16} /> All
                            </Button>
                            <Button
                                variant="Delete"
                                className="p-1 text-xs"
                                data-testid="queryHistoryClearFav"
                                title="Clear all favorites"
                                onClick={() => {
                                    const newQueries = historyQuery.queries.map(q => ({ ...q, fav: false, name: undefined }));
                                    setConnectionItem("query history", JSON.stringify(newQueries));
                                    setHistoryQuery(prev => ({
                                        ...prev,
                                        queries: newQueries,
                                        currentQuery: prev.currentQuery.fav
                                            ? { ...prev.currentQuery, fav: false, name: undefined }
                                            : prev.currentQuery,
                                    }));
                                    setFilteredQueries(prev => prev.map(q => ({ ...q, fav: false, name: undefined })));
                                }}
                                disabled={!historyQuery.queries.some(q => q.fav)}
                            >
                                <Star size={14} /> Clear
                            </Button>
                        </div>
                    }
                    onClick={(counter, evt) => {
                        const index = historyQuery.queries.findIndex(q => q.text === counter);

                        if (evt.type === "rightclick") {
                            if (evt.ctrlKey) {
                                setDeleteElements(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
                            } else {
                                setDeleteElements(prev => prev.includes(index) ? [] : [index]);
                            }
                        } else if (evt.type === "click") {
                            setHistoryQuery(prev => ({
                                ...prev,
                                counter: index + 1 === historyQuery.counter ? 0 : index + 1
                            }));
                            setTab("text");
                        }
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
                <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="w-full flex flex-col items-center basis-0 grow">
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
                                    themeName="selector-theme"
                                    options={{
                                        lineHeight: 22,
                                        fontSize: 14,
                                        lineNumbersMinChars: 3,
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
