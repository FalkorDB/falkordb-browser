/* eslint-disable no-param-reassign */

'use client'

import { useEffect, useState, useContext, Dispatch, SetStateAction, useRef, useCallback } from "react";
import { cn, GraphRef, formatName, getTheme } from "@/lib/utils";
import { History, Info, Maximize2 } from "lucide-react";
import * as monaco from "monaco-editor";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Editor } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import Button from "../components/ui/Button";
import { IndicatorContext } from "../components/provider";
import EditorComponent, { setTheme } from "../components/EditorComponent";
import DialogComponent from "../components/DialogComponent";
import Toolbar from "./toolbar";
import { Node, Link, Graph, Query, HistoryQuery } from "../api/graph/model";
import { Explain, Metadata, Profile } from "./MetadataView";
import PaginationList from "../components/PaginationList";
import SelectGraph from "./selectGraph";

type Tab = "text" | "metadata" | "explain" | "profile"

interface Props {
    graph: Graph
    options: string[]
    setOptions: Dispatch<SetStateAction<string[]>>
    graphName: string
    setGraphName: Dispatch<SetStateAction<string>>
    setGraph: Dispatch<SetStateAction<Graph>>
    // graph
    runQuery?: (query: string) => Promise<void>
    historyQuery?: HistoryQuery
    setHistoryQuery?: Dispatch<SetStateAction<HistoryQuery>>
    fetchCount?: () => Promise<void>
    isQueryLoading?: boolean
    // schema
    selectedElements?: (Node | Link)[]
    setSelectedElement?: (el: Node | Link | undefined) => void
    handleDeleteElement?: () => Promise<void>
    chartRef?: GraphRef
    setIsAddEntity?: (isAdd: boolean) => void
    setIsAddRelation?: (isAdd: boolean) => void
    isCanvasLoading?: boolean
}

const STEP = 8

export default function Selector({ graph, options, setOptions, graphName, setGraphName, runQuery, historyQuery, setHistoryQuery, fetchCount, selectedElements, setSelectedElement, handleDeleteElement, chartRef, setIsAddEntity, setIsAddRelation, setGraph, isCanvasLoading, isQueryLoading }: Props) {

    const { indicator } = useContext(IndicatorContext)

    const { theme } = useTheme()
    const { secondary, currentTheme } = getTheme(theme)

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const submitQuery = useRef<HTMLButtonElement>(null)
    const searchQueryRef = useRef<HTMLInputElement>(null)

    const [queriesOpen, setQueriesOpen] = useState(false)
    const [filteredQueries, setFilteredQueries] = useState<Query[]>([])
    const [activeFilters, setActiveFilters] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [maximize, setMaximize] = useState(false)
    const [tab, setTab] = useState<Tab>("text")

    const filters = Array.from(new Set(historyQuery?.queries.map(query => query.graphName).filter(name => !!name)))
    const currentQuery = historyQuery?.counter === 0 ? historyQuery.currentQuery : historyQuery?.queries[historyQuery.counter - 1]
    const type = runQuery && historyQuery && setHistoryQuery ? "Graph" : "Schema"

    const afterSearchCallback = useCallback((newFilteredList: Query[]) => {
        if (!historyQuery || !setHistoryQuery) return

        if (newFilteredList.every(q => q.text !== historyQuery.query)) {
            setHistoryQuery(prev => ({
                ...prev,
                counter: 0
            }))
        }
    }, [historyQuery, setHistoryQuery])

    const handelSetFilteredQueries = useCallback((name?: string) => {
        if (!historyQuery) return

        let newActiveFilters = activeFilters;
        if (name) {
            if (activeFilters.some(f => f === name)) {
                newActiveFilters = activeFilters.filter(f => f !== name);
            } else {
                newActiveFilters = [...activeFilters, name];
            }
        }

        setActiveFilters(newActiveFilters);

        const newFilteredQueries = [
            ...historyQuery.queries.filter(({ graphName: n }) =>
                newActiveFilters.some(f => f === n)
            )
        ].reverse()

        setFilteredQueries(newFilteredQueries)
        afterSearchCallback(newFilteredQueries)
    }, [activeFilters, afterSearchCallback, historyQuery]);

    useEffect(() => {
        if (!historyQuery) return

        if (filters.some(name => name === graphName) && graphName) {
            setActiveFilters([graphName]);
            
            const newFilteredQueries = [
                ...historyQuery.queries.filter(({ graphName: n }) => graphName === n)
            ].reverse()

            setFilteredQueries(newFilteredQueries)
            afterSearchCallback(newFilteredQueries)
        }
    }, [graphName])

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
        if (!queriesOpen || !currentQuery || tab === "profile") return

        const currentValue = currentQuery?.[tab]

        if (!currentValue || currentValue.length === 0) {
            const fallbackTab = (Object.keys(currentQuery) as Tab[]).find(isTabEnabled);

            if (fallbackTab && fallbackTab !== tab) {
                setTab(fallbackTab);

                if (fallbackTab === "text" && !editorRef.current?.hasTextFocus()) {
                    focusEditorAtEnd()
                }
            }
        } else if (tab === "text" && !editorRef.current?.hasTextFocus()) {
            focusEditorAtEnd()
        }
    }, [currentQuery, setTab, queriesOpen, historyQuery?.query, tab, isTabEnabled])

    const handleOnChange = useCallback((name: string) => {
        setGraphName(formatName(name))
    }, [setGraphName])

    const handleEditorDidMount = (e: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = e

        // eslint-disable-next-line no-bitwise
        e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            submitQuery.current?.click();
        });

        e.addCommand(monaco.KeyCode.Escape, () => {
            searchQueryRef.current?.focus()
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
                submitQuery.current?.click()
            },
            precondition: '!suggestWidgetVisible',
        });
    }

    const handleSubmit = async () => {
        try {
            setIsLoading(true)
            await runQuery!(historyQuery!.query.trim())
            setQueriesOpen(false)
        } finally {
            setIsLoading(false)
        }
    }

    const separator = <div className="h-[80%] w-0.5 bg-border rounded-full" />

    return (
        <div className="z-20 w-full h-[50px] flex flex-row gap-4 items-center">
            <SelectGraph
                options={options}
                setOptions={setOptions}
                selectedValue={graphName}
                setSelectedValue={handleOnChange}
                type={type}
                setGraph={setGraph}
            />
            {
                runQuery && historyQuery && setHistoryQuery && fetchCount && isQueryLoading !== undefined ?
                    <>
                        <div className="h-full w-1 grow relative overflow-visible">
                            <EditorComponent
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
                        <div className="h-full w-[120px] flex gap-2 items-center p-2 border border-border rounded-lg bg-background">
                            <Tooltip>
                                <TooltipTrigger className="cursor-default">
                                    <Info />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Run (Enter) History (Arrow Up/Down) Insert new line (Shift + Enter)</p>
                                </TooltipContent>
                            </Tooltip>
                            {separator}
                            <div className="flex gap-4 items-center">
                                <DialogComponent
                                    className="h-[90dvh] w-[90dvw]"
                                    open={queriesOpen}
                                    tabIndex={-1}
                                    onEscapeKeyDown={(e) => {
                                        if (editorRef.current && editorRef.current.hasTextFocus()) {
                                            e.preventDefault()
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
                                    <div className="h-1 grow flex gap-8 p-8">
                                        <PaginationList
                                            label="Query"
                                            className="w-[40%] bg-secondary rounded-lg overflow-hidden"
                                            isSelected={(item) => historyQuery.queries.findIndex(q => q.text === item.text) + 1 === historyQuery.counter}
                                            afterSearchCallback={afterSearchCallback}
                                            dataTestId="queryHistory"
                                            list={filteredQueries}
                                            step={STEP}
                                            onClick={(counter) => {
                                                const index = historyQuery.queries.findIndex(q => q.text === counter) + 1
                                                setHistoryQuery(prev => ({
                                                    ...prev,
                                                    counter: index === historyQuery.counter ? 0 : index
                                                }))
                                            }}
                                            searchRef={searchQueryRef}
                                        >
                                            <ul className="flex flex-wrap gap-2 overflow-auto max-h-[64px] items-center">
                                                <li className="flex items-center">
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Info />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Press graph name to see history of that graph
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </li>
                                                {
                                                    filters.map(name => (
                                                        <li key={name}>
                                                            <Button
                                                                className={cn("bg-background py-1 px-2 rounded-full", activeFilters.some(f => f === name) && "text-background bg-foreground")}
                                                                label={name}
                                                                onClick={() => handelSetFilteredQueries(name)}
                                                            />
                                                        </li>
                                                    ))
                                                }
                                            </ul>
                                        </PaginationList>
                                        <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="w-[60%] flex flex-col gap-8 items-center">
                                            <TabsList className="bg-secondary h-fit w-fit p-2">
                                                <TabsTrigger className={cn("!text-border data-[state=active]:!bg-background data-[state=active]:!text-foreground")} disabled={!isTabEnabled("text")} value="text">Edit Query</TabsTrigger>
                                                <TabsTrigger className={cn("!text-border data-[state=active]:!bg-background data-[state=active]:!text-foreground")} disabled={!isTabEnabled("profile")} value="profile">Profile</TabsTrigger>
                                                <TabsTrigger className={cn("!text-border data-[state=active]:!bg-background data-[state=active]:!text-foreground")} disabled={!isTabEnabled("metadata")} value="metadata">Metadata</TabsTrigger>
                                                <TabsTrigger className={cn("!text-border data-[state=active]:!bg-background data-[state=active]:!text-foreground")} disabled={!isTabEnabled("explain")} value="explain">Explain</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="text" className="w-full h-1 grow bg-secondary rounded-lg p-2 py-4 relative">
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
                                                        <Editor
                                                            key={currentTheme}
                                                            className="SofiaSans"
                                                            data-testid="queryHistoryEditor"
                                                            width="100%"
                                                            height="100%"
                                                            language="cypher"
                                                            theme="selector-theme"
                                                            options={{
                                                                lineHeight: 30,
                                                                fontSize: 25,
                                                                lineNumbersMinChars: 3,
                                                                scrollbar: {
                                                                    horizontal: "hidden"
                                                                },
                                                                scrollBeyondLastLine: false,
                                                                wordWrap: "on",
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
                                                                    }

                                                                    return newHistoryQuery
                                                                })
                                                            }}
                                                            onMount={handleEditorDidMount}
                                                            beforeMount={(m) => {
                                                                setTheme(m, "selector-theme", secondary, currentTheme === "dark")
                                                            }}
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
                                                                    }

                                                                    const newQueries = prev.queries.map(q => q.text === newQuery.text ? newQuery : q)

                                                                    return {
                                                                        ...prev,
                                                                        currentQuery: newQuery,
                                                                        queries: newQueries
                                                                    }
                                                                })
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
                    </>
                    : selectedElements && setSelectedElement && handleDeleteElement && handleDeleteElement && setIsAddEntity && setIsAddRelation && chartRef && isCanvasLoading !== undefined && <div className="w-full h-full">
                        <Toolbar
                            graph={graph}
                            label={type}
                            selectedElements={selectedElements}
                            setSelectedElement={setSelectedElement}
                            handleDeleteElement={handleDeleteElement}
                            setIsAddEntity={setIsAddEntity}
                            setIsAddRelation={setIsAddRelation}
                            chartRef={chartRef}
                            isLoadingSchema={!!isCanvasLoading}
                            backgroundColor="bg-background"
                        />
                    </div>
            }
        </div>
    )
}

Selector.defaultProps = {
    runQuery: undefined,
    historyQuery: undefined,
    setHistoryQuery: undefined,
    selectedElements: undefined,
    setSelectedElement: undefined,
    handleDeleteElement: undefined,
    chartRef: undefined,
    setIsAddEntity: undefined,
    setIsAddRelation: undefined,
    fetchCount: undefined,
    isQueryLoading: undefined,
    isCanvasLoading: undefined,
}