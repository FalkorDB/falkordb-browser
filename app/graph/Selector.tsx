/* eslint-disable no-param-reassign */

'use client';

import { useEffect, useState, useContext, Dispatch, SetStateAction, useRef, useCallback, useMemo } from "react";
import { cn, GraphRef, formatName, Node, Link, getTheme, Query, HistoryQuery } from "@/lib/utils";
import { ChevronDown, History, Info, Maximize2, MessagesSquare, Network, Star, Trash2 } from "lucide-react";
import * as monaco from "monaco-editor";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Button from "../components/ui/Button";
import { BrowserSettingsContext, ConnectionContext, GraphContext, IndicatorContext, PanelContext } from "../components/provider";
import { setConnectionItem, removeConnectionItem } from "@/lib/connection-storage";
import CypherEditor, { CYPHER_LANGUAGE_NAME } from "../components/CypherEditor";
import EditorComponent from "../components/EditorComponent";
import DialogComponent from "../components/DialogComponent";
import Toolbar from "./toolbar";
import { Graph } from "../api/graph/model";
import { Explain, Metadata, Profile } from "./MetadataView";
import PaginationList from "../components/PaginationList";
import SelectGraph from "./selectGraph";

type Tab = "text" | "metadata" | "explain" | "profile";

interface BaseProps<T = "Schema" | "Graph"> {
    type: T
    graph: Graph
    options: string[]
    setOptions: Dispatch<SetStateAction<string[]>>
    graphName: string
    setGraphName: Dispatch<SetStateAction<string>>
    setGraph: Dispatch<SetStateAction<Graph>>
}

interface SchemaProps {
    selectedElements: (Node | Link)[];
    setSelectedElements: (el: (Node | Link)[]) => void;
    handleDeleteElement: () => Promise<void>;
    canvasRef: GraphRef;
    setIsAddNode: (isAdd: boolean) => void;
    setIsAddEdge: (isAdd: boolean) => void;
    isAddNode: boolean;
    isAddEdge: boolean;
    isCanvasLoading: boolean;
    runQuery?: never;
    historyQuery?: never;
    setHistoryQuery?: never;
    fetchCount?: never;
    isQueryLoading?: never;
}

interface GraphProps {
    runQuery: (query: string) => Promise<void>;
    historyQuery: HistoryQuery;
    setHistoryQuery: Dispatch<SetStateAction<HistoryQuery>>;
    fetchCount: () => Promise<void>;
    isQueryLoading: boolean;
    selectedElements?: never;
    setSelectedElements?: never;
    handleDeleteElement?: never;
    canvasRef?: never;
    setIsAddNode?: never;
    setIsAddEdge?: never;
    isAddNode?: never;
    isAddEdge?: never;
    isCanvasLoading?: never;
}

type Props<T = "Graph" | "Schema"> =
    BaseProps<T> & (
        T extends "Graph"
        ? GraphProps
        : SchemaProps
    );

export default function Selector<T extends "Graph" | "Schema" = "Graph" | "Schema">({
    graph,
    options,
    setOptions,
    graphName,
    setGraphName,
    runQuery,
    historyQuery,
    setHistoryQuery,
    fetchCount,
    selectedElements,
    setSelectedElements,
    handleDeleteElement,
    canvasRef,
    setIsAddNode,
    setIsAddEdge,
    isAddNode,
    isAddEdge,
    setGraph,
    type,
    isCanvasLoading,
    isQueryLoading
}: Props<T>) {

    const { indicator } = useContext(IndicatorContext);
    const { tutorialOpen, settings: { limitSettings: { limit, lastLimit }, showPropertyKeyPrefixSettings: { showPropertyKeyPrefix } } } = useContext(BrowserSettingsContext);
    const { isReadOnly } = useContext(ConnectionContext);
    const { graphNames } = useContext(GraphContext);
    const { panel, setPanel, panelOpen, onTogglePanel } = useContext(PanelContext);

    const { theme } = useTheme();
    const { secondary } = getTheme(theme);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const submitQuery = useRef<HTMLButtonElement>(null);
    const searchQueryRef = useRef<HTMLInputElement>(null);

    const [queriesOpen, setQueriesOpen] = useState(false);
    const [filteredQueries, setFilteredQueries] = useState<Query[]>([]);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [favFilter, setFavFilter] = useState(false);
    const [favOpen, setFavOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [maximize, setMaximize] = useState(false);
    const [tab, setTab] = useState<Tab>("text");
    const [deleteElements, setDeleteElements] = useState<number[]>([]);

    const filters = useMemo(() => {
        const queries = historyQuery?.queries ?? [];
        if (graphNames.length + 10 <= queries.length) {
            return graphNames.filter(name => queries.some(query => query.graphName === name));
        }
        return Array.from(new Set(queries.map(query => query.graphName).filter(name => !!name)));
    }, [graphNames, historyQuery?.queries]);
    const currentQuery = historyQuery?.counter === 0 ? historyQuery.currentQuery : historyQuery?.queries[historyQuery.counter - 1];

    useEffect(() => {
        if (!historyQuery || !setHistoryQuery) return;
        setHistoryQuery(prev => ({
            ...prev,
            query: prev.counter ? prev.queries[prev.counter - 1].text : prev.currentQuery.text
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [historyQuery?.counter, setHistoryQuery]);

    const afterSearchCallback = useCallback((newFilteredList: Query[]) => {
        if (!historyQuery || !setHistoryQuery) return;

        // Get the currently selected query based on counter
        const selectedQuery = historyQuery.counter === 0
            ? historyQuery.currentQuery
            : historyQuery.queries[historyQuery.counter - 1];

        // If the selected query is not in the filtered list, reset counter to 0
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

    useEffect(() => {
        if (!queriesOpen) {
            setIsLoading(false);
            setTab("text");
            searchQueryRef.current?.blur();
        }
        resetHistoryFilters();
    }, [queriesOpen, resetHistoryFilters]);

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
        if (!queriesOpen || !currentQuery || tab === "profile") return;

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
    }, [currentQuery, setTab, queriesOpen, historyQuery?.query, tab, isTabEnabled]);

    const handleOnChange = useCallback((name: string) => {
        setGraphName(formatName(name));
    }, [setGraphName]);

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
            // eslint-disable-next-line no-bitwise
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
            await runQuery!(historyQuery!.query.trim());
            setQueriesOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteQuery = useCallback(() => {
        if (!historyQuery || !setHistoryQuery) return;

        const newQueries = historyQuery.queries.filter((_, idx) => !deleteElements.some((removeIndex) => idx === removeIndex));

        if (newQueries.length === 0) removeConnectionItem("query history");
        else setConnectionItem("query history", JSON.stringify(newQueries));

        // Check if counter points to a deleted query (counter is 1-indexed, so counter - 1 is the index)
        const isCounterDeleted = historyQuery.counter > 0 && deleteElements.includes(historyQuery.counter - 1);

        let nextCounter: number;
        if (isCounterDeleted) {
            // Unselect if counter points to deleted query
            nextCounter = 0;
        } else if (historyQuery.counter > 0) {
            // Adjust counter to account for deleted queries before it
            const deletedBeforeCount = deleteElements.filter(idx => idx < historyQuery.counter - 1).length;
            nextCounter = Math.max(1, historyQuery.counter - deletedBeforeCount);
            // Clamp to new array length
            nextCounter = Math.min(nextCounter, newQueries.length);
        } else {
            // Counter is 0 (currentQuery), keep it
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

    const favQueries = useMemo(() =>
        [...(historyQuery?.queries ?? []).filter(q => q.fav && q.name).sort((a, b) => (a.name!).localeCompare(b.name!)), ...(historyQuery?.queries ?? []).filter(q => q.fav && !q.name).sort((a, b) => (a.text).localeCompare(b.text))],
        [historyQuery?.queries]
    );

    const separator = <div className="h-[80%] w-0.5 bg-border rounded-full" />;

    return (
        <div className="z-20 w-full h-[44px] flex flex-row gap-3 items-center">
            {
                type === "Schema" &&
                <SelectGraph
                    options={options}
                    setOptions={setOptions}
                    selectedValue={graphName}
                    setSelectedValue={handleOnChange}
                    type={type}
                    setGraph={setGraph}
                />
            }
            {
                historyQuery &&
                <Button
                    indicator={indicator}
                    className={cn(
                        "h-full text-foreground p-2 rounded-lg border border-border bg-background hover:bg-secondary",
                        panelOpen && "!text-primary"
                    )}
                    title="Graph info"
                    onClick={() => onTogglePanel()}
                    data-testid="graphInfoToggle"
                >
                    <Network size={20} />
                </Button>
            }
            {
                historyQuery ?
                    <>
                        <div className="h-full w-1 grow relative overflow-visible">
                            <CypherEditor
                                graph={graph}
                                graphName={graphName}
                                maximize={maximize}
                                setMaximize={setMaximize}
                                runQuery={runQuery}
                                isQueryLoading={isQueryLoading}
                                historyQuery={historyQuery}
                                setHistoryQuery={setHistoryQuery}
                                editorKey={queriesOpen ? "selector-theme" : "editor-theme"}
                            />
                        </div>
                        <Popover open={favOpen} onOpenChange={setFavOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    data-testid="favoritesDropdown"
                                    disabled={favQueries.length === 0}
                                    title={favQueries.length === 0 ? "No favorite queries" : "Quick access to favorite queries"}
                                    className={cn(
                                        "h-full flex items-center gap-1 px-2 border border-border rounded-lg bg-background transition-colors",
                                        "hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                >
                                    <Star size={16} className={cn(favQueries.length > 0 ? "fill-fav text-fav" : "text-foreground/50")} />
                                    <ChevronDown size={14} className="text-foreground/50" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-[500px] max-h-64 overflow-y-auto p-2">
                                <p className="text-sm font-medium mb-2 px-1">Favorite Queries</p>
                                <ul className="flex flex-col gap-1">
                                    {favQueries.map(q => (
                                        <li key={q.text}>
                                            <Button
                                                className="w-full text-left hover:bg-secondary border-b"
                                                tooltipSide="left"
                                                title={q.text}
                                                onClick={async () => {
                                                    await runQuery(q.text);
                                                    setFavOpen(false);
                                                }}
                                            >
                                                <p className="truncate text-sm">{q.name ? <><span className="font-bold text-base">{q.name} {`->`}</span> {q.text}</> : q.text}</p>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </PopoverContent>
                        </Popover>
                        <div className="h-full w-fit min-w-[120px] flex gap-3 items-center p-2 border border-border rounded-lg bg-background">
                            <Button
                                className="cursor-default"
                                title={`Run (Enter)
                                     History (Arrow Up/Down)
                                     Insert new line (Shift + Enter)`}
                            >
                                <Info />
                            </Button>
                            {
                                graphName && !isReadOnly &&
                                <Button
                                    data-testid="selectorCanvasInfo"
                                    className="cursor-default"
                                    title={`Select And Show Properties (Right Click)
                                        Select Multiple Entities (Right Click + Left Ctrl)
                                        Select 2 Nodes to Create Edge`}
                                >
                                    <Info size={16} className="text-primary" />
                                </Button>
                            }
                            {
                                (() => {
                                    const hasLimitWarning = graph.CurrentLimit && graph.Data.length >= graph.CurrentLimit;
                                    const hasLimitChangeWarning = graph.CurrentLimit && lastLimit !== limit;
                                    const hasPrefixChange = graph.ShowPropertyKeyPrefix !== showPropertyKeyPrefix;
                                    return (hasLimitWarning || hasLimitChangeWarning || hasPrefixChange) ? (
                                        <Button
                                            data-testid="selectorLimitWarning"
                                            className="cursor-default"
                                            title={`${hasLimitWarning ? `Data currently limited to ${graph.Data.length} rows` : ""}
${hasLimitChangeWarning ? "Rerun the query to apply the new limit." : ""}
${hasPrefixChange ? "Rerun the query to apply the new property key prefix settings." : ""}`}
                                        >
                                            <Info size={16} className="text-orange-300" />
                                        </Button>
                                    ) : null;
                                })()
                            }
                            {separator}
                            <div className="flex gap-4 items-center">
                                <DialogComponent
                                    label="queryHistory"
                                    preventOutsideClose={tutorialOpen}
                                    className="h-[90dvh] w-[90dvw]"
                                    open={queriesOpen}
                                    tabIndex={-1}
                                    onEscapeKeyDown={(e) => {
                                        if (editorRef.current && editorRef.current.hasTextFocus()) {
                                            e.preventDefault();
                                        }
                                    }}
                                    onOpenChange={setQueriesOpen}
                                    trigger={
                                        <Button
                                            data-testid="queryHistory"
                                            disabled={historyQuery.queries.length === 0}
                                            title={historyQuery.queries.length === 0 ? "No queries" : "View past queries"}
                                        >
                                            <History />
                                        </Button>
                                    }
                                    title="Query History"
                                >
                                    <div className="h-1 grow flex gap-4">
                                        <PaginationList
                                            label="Query"
                                            className="w-1/2 bg-secondary rounded-lg overflow-hidden"
                                            isSelected={(item) => historyQuery.queries.findIndex(q => q.text === item.text) + 1 === historyQuery.counter}
                                            isDeleteSelected={(item) => deleteElements.some(idx => historyQuery.queries[idx]?.text === item.text)}
                                            afterSearchCallback={afterSearchCallback}
                                            onToggleFav={handleToggleFav}
                                            dataTestId="queryHistory"
                                            list={filteredQueries}
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
                                                        await runQuery!(counter.trim());
                                                    }
                                                    setQueriesOpen(false);
                                                } finally {
                                                    setIsLoading(false);
                                                }
                                            }}
                                            searchRef={searchQueryRef}
                                        >
                                            <ul className="w-full flex flex-wrap gap-2 overflow-y-auto max-h-[80px] p-1">
                                                <li key="info">
                                                    <Tooltip>
                                                        <TooltipTrigger className="h-[32px] flex items-center">
                                                            <Info />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Press graph name to see history of that graph
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </li>
                                                <li key="fav-filter" className="max-w-full h-[32px]">
                                                    <Button
                                                        data-testid="queryHistoryFavFilter"
                                                        className={cn("bg-background py-1 px-2 rounded-full w-full flex items-center gap-1", favFilter && "text-background bg-foreground")}
                                                        title="Filter by favorites"
                                                        onClick={() => handelSetFilteredQueries(undefined, !favFilter)}
                                                    >
                                                        <Star size={14} className={cn(favFilter ? "fill-fav text-fav" : "")} />
                                                        Favorites
                                                    </Button>
                                                </li>
                                                {
                                                    filters.map(name => (
                                                        <li key={name} className="max-w-full h-[32px]">
                                                            <Button
                                                                className={cn("bg-background py-1 px-2 rounded-full w-full", activeFilters.some(f => f === name) && "text-background bg-foreground")}
                                                                label={name}
                                                                onClick={() => handelSetFilteredQueries(name)}
                                                            />
                                                        </li>
                                                    ))
                                                }
                                            </ul>
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
                                                    <Trash2 />
                                                </Button>
                                                <Button
                                                    className="p-1"
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
                                                    <Trash2 /> All
                                                </Button>
                                                <Button
                                                    variant="Delete"
                                                    className="p-1"
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
                                                    <Star size={16} /> Clear
                                                </Button>
                                            </div>
                                        </PaginationList>
                                        <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="w-1/2 flex flex-col gap-2 items-center">
                                            <TabsList className="h-fit bg-background">
                                                <TabsTrigger className={cn("border border-transparent hover:bg-background/10 hover:border-border/10 data-[state=active]:!bg-background data-[state=active]:!text-primary")} disabled={!isTabEnabled("text")} value="text">Edit Query</TabsTrigger>
                                                <TabsTrigger className={cn("border border-transparent hover:bg-background/10 hover:border-border/10 data-[state=active]:!bg-background data-[state=active]:!text-primary")} disabled={!isTabEnabled("profile")} value="profile">Profile</TabsTrigger>
                                                <TabsTrigger className={cn("border border-transparent hover:bg-background/10 hover:border-border/10 data-[state=active]:!bg-background data-[state=active]:!text-primary")} disabled={!isTabEnabled("metadata")} value="metadata">Metadata</TabsTrigger>
                                                <TabsTrigger className={cn("border border-transparent hover:bg-background/10 hover:border-border/10 data-[state=active]:!bg-background data-[state=active]:!text-primary")} disabled={!isTabEnabled("explain")} value="explain">Explain</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="text" className="mt-0 w-full h-1 grow bg-secondary rounded-lg relative p-2">
                                                {
                                                    currentQuery &&
                                                    <>
                                                        <Button
                                                            ref={submitQuery}
                                                            data-testid="queryHistoryEditorRun"
                                                            className="z-10 absolute bottom-4 right-8 py-2 px-8"
                                                            indicator={indicator}
                                                            variant="Primary"
                                                            label="Run"
                                                            title="Press Enter to run the query"
                                                            onClick={handleSubmit}
                                                            isLoading={isLoading}
                                                        />
                                                        <EditorComponent
                                                            className="SofiaSans"
                                                            height="100%"
                                                            language={CYPHER_LANGUAGE_NAME}
                                                            themeName="selector-theme"
                                                            themeBackground={secondary}
                                                            options={{
                                                                lineHeight: 30,
                                                                fontSize: 25,
                                                                lineNumbersMinChars: 3,
                                                                scrollbar: {
                                                                    horizontal: "auto"
                                                                },
                                                                scrollBeyondLastLine: false,
                                                                wordWrap: "off",
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
                                            <TabsContent className="w-full h-1 grow bg-secondary rounded-lg p-8" value="profile">
                                                <div className="h-full w-full overflow-hidden flex flex-col gap-4">
                                                    {
                                                        currentQuery &&
                                                        <Profile
                                                            background={secondary}
                                                            graphName={graphName}
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
                                            <TabsContent className="w-full h-1 grow bg-secondary rounded-lg p-8" value="metadata">
                                                <div className="h-full w-full overflow-hidden flex flex-col gap-4">
                                                    {
                                                        currentQuery &&
                                                        <Metadata
                                                            query={currentQuery}
                                                        />
                                                    }
                                                </div>
                                            </TabsContent>
                                            <TabsContent className="w-full h-1 grow bg-secondary rounded-lg p-8" value="explain">
                                                <div className="h-full w-full overflow-hidden flex flex-col gap-4">
                                                    {
                                                        currentQuery &&
                                                        <Explain
                                                            background={secondary}
                                                            query={currentQuery}
                                                        />
                                                    }
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </DialogComponent>
                            </div>
                            {separator}
                            <Button
                                data-testid="editorMaximize"
                                title="Maximize"
                                onClick={() => setMaximize(true)}
                            >
                                <Maximize2 size={20} />
                            </Button>
                        </div>
                        <Button
                                data-testid="chatToggleButton"
                                className={cn(
                                    "text-foreground border border-border rounded-lg p-2 hover:bg-secondary",
                                    panel === "chat" && "!text-primary"
                                )}
                                indicator={indicator}
                                title="Chat"
                                onClick={() => {
                                    setPanel(prev => prev === "chat" ? undefined : "chat");
                                }}
                            >
                                <MessagesSquare size={20} />
                            </Button>
                    </>
                    : selectedElements && handleDeleteElement && setSelectedElements && setIsAddNode && setIsAddEdge && canvasRef && isCanvasLoading !== undefined && <div className="w-full h-full">
                        <Toolbar
                            graph={graph}
                            graphName={graphName}
                            label={type}
                            selectedElements={selectedElements}
                            setSelectedElements={setSelectedElements}
                            handleDeleteElement={handleDeleteElement}
                            setIsAddNode={setIsAddNode}
                            setIsAddEdge={selectedElements.length === 2 && selectedElements.every(e => "labels" in e) ? setIsAddEdge : undefined}
                            canvasRef={canvasRef}
                            setExpand={() => {}}
                            expand={true}
                            isLoadingSchema={!!isCanvasLoading}
                            isAddNode={isAddNode}
                            isAddEdge={isAddEdge}
                        />
                    </div>
            }
        </div >
    );
}