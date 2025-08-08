/* eslint-disable no-param-reassign */

'use client'

import { useEffect, useState, useContext, Dispatch, SetStateAction, useRef, useCallback } from "react";
import { cn, GraphRef, fetchOptions, formatName } from "@/lib/utils";
import { History, Info, Maximize2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import * as monaco from "monaco-editor";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Editor } from "@monaco-editor/react";
import Button from "../components/ui/Button";
import { IndicatorContext } from "../components/provider";
import EditorComponent, { setTheme } from "../components/EditorComponent";
import DialogComponent from "../components/DialogComponent";
import Toolbar from "./toolbar";
import { Node, Link, Graph, HistoryQuery, Query } from "../api/graph/model";
import { Explain, Metadata, Profile } from "./MetadataView";
import PaginationList from "../components/PaginationList";
import SelectGraph from "./selectGraph";

interface Props {
    graph: Graph
    options: string[]
    setOptions: Dispatch<SetStateAction<string[]>>
    graphName: string
    setGraphName: Dispatch<SetStateAction<string>>
    runQuery?: (query: string) => Promise<void>
    historyQuery?: HistoryQuery
    setHistoryQuery?: Dispatch<SetStateAction<HistoryQuery>>
    fetchCount?: () => Promise<void>
    selectedElements: (Node | Link)[]
    setSelectedElement: Dispatch<SetStateAction<Node | Link | undefined>>
    handleDeleteElement: () => Promise<void>
    chartRef: GraphRef
    setGraph: Dispatch<SetStateAction<Graph>>
    setIsAddEntity?: Dispatch<SetStateAction<boolean>>
    setIsAddRelation?: Dispatch<SetStateAction<boolean>>
    isCanvasLoading?: boolean
    isQueryLoading?: boolean
}

const STEP = 8

export default function Selector({ graph, options, setOptions, graphName, setGraphName, runQuery, historyQuery, setHistoryQuery, fetchCount, selectedElements, setSelectedElement, handleDeleteElement, chartRef, setIsAddEntity, setIsAddRelation, setGraph, isCanvasLoading, isQueryLoading }: Props) {

    const { indicator, setIndicator } = useContext(IndicatorContext)

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const submitQuery = useRef<HTMLButtonElement>(null)
    const searchQueryRef = useRef<HTMLInputElement>(null)

    const { toast } = useToast()

    const [queriesOpen, setQueriesOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [maximize, setMaximize] = useState(false)
    const [tab, setTab] = useState<keyof Query>("text")

    const currentQuery = historyQuery?.currentQuery === historyQuery?.query && historyQuery?.counter === 0 && graph.CurrentQuery || historyQuery?.queries.find(q => q.text === historyQuery?.query)
    const type = runQuery && historyQuery && setHistoryQuery ? "Graph" : "Schema"

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


    const isTabEnabled = useCallback((tabName: keyof Query) => {
        if (tabName === "text") return !!currentQuery?.text;
        if (tabName === "metadata") return !!currentQuery && currentQuery.metadata.length > 0;
        if (tabName === "explain") return !!currentQuery && currentQuery.explain.length > 0;
        return true;
    }, [currentQuery]);

    useEffect(() => {
        if (queriesOpen && currentQuery && tab !== "profile") {
            const currentValue = currentQuery?.[tab]

            if (!currentValue || currentValue.length === 0) {
                const fallbackTab = (Object.keys(currentQuery) as (keyof Query)[]).find(isTabEnabled);

                if (fallbackTab && fallbackTab !== tab) {
                    setTab(fallbackTab);

                    if (fallbackTab === "text") {
                        focusEditorAtEnd()
                    }
                }
            } else if (tab === "text") {
                focusEditorAtEnd()

                return
            }

            setTimeout(() => {
                if (searchQueryRef.current) {
                    searchQueryRef.current.focus()
                }
            }, 100)
        }
    }, [currentQuery, setTab, queriesOpen, historyQuery?.query, tab, isTabEnabled])

    const handleOnChange = useCallback((name: string) => {
        setGraphName(formatName(name))
    }, [setGraphName])

    const getOptions = useCallback(async () => {
        const [opts] = await fetchOptions(type, toast, setIndicator, indicator)
        setOptions(opts)
    }, [setOptions, toast, setIndicator, indicator, type])


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

    const afterSearchCallback = useCallback((newFilteredList: Query[]) => {
        if (!historyQuery || !setHistoryQuery) return

        if (newFilteredList.every(q => q.text !== historyQuery.query)) {
            setHistoryQuery(prev => ({
                ...prev,
                counter: 0
            }))
        }
    }, [historyQuery, setHistoryQuery])

    return (
        <div className="z-20 absolute top-5 inset-x-24 h-[50px] flex flex-row gap-4 items-center">
            <SelectGraph
                options={options}
                setOptions={setOptions}
                selectedValue={graphName}
                setSelectedValue={handleOnChange}
                type={type}
                onOpenChange={async (o) => {
                    if (o) await getOptions()
                }}
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
                        <div className="h-full flex gap-2 p-2 border rounded-lg bg-foreground">
                            <Tooltip>
                                <TooltipTrigger className="cursor-default">
                                    <Info />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Run (Enter) History (Arrow Up/Down) Insert new line (Shift + Enter)</p>
                                </TooltipContent>
                            </Tooltip>
                            <div className="w-[1px] bg-white" />
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
                                            className="w-[40%] bg-background rounded-lg overflow-hidden"
                                            isSelected={(item) => historyQuery.queries.findIndex(q => q.text === item.text) + 1 === historyQuery.counter}
                                            afterSearchCallback={afterSearchCallback}
                                            dataTestId="queryHistory"
                                            list={historyQuery.queries.reverse()}
                                            step={STEP}
                                            onClick={(counter) => {
                                                setHistoryQuery(prev => ({
                                                    ...prev,
                                                    counter: historyQuery.queries.findIndex(q => q.text === counter) + 1
                                                }))
                                            }}
                                            searchRef={searchQueryRef}
                                        />
                                        <Tabs value={tab} onValueChange={(value) => setTab(value as keyof Query)} className="w-[60%] flex flex-col gap-8 items-center">
                                            <TabsList className="bg-black h-fit w-fit p-2">
                                                <TabsTrigger className={cn("!text-gray-500 data-[state=active]:!bg-background data-[state=active]:!text-white")} disabled={!isTabEnabled("text")} value="text">Edit Query</TabsTrigger>
                                                <TabsTrigger className={cn("!text-gray-500 data-[state=active]:!bg-background data-[state=active]:!text-white")} disabled={!isTabEnabled("profile")} value="profile">Profile</TabsTrigger>
                                                <TabsTrigger className={cn("!text-gray-500 data-[state=active]:!bg-background data-[state=active]:!text-white")} disabled={!isTabEnabled("metadata")} value="metadata">Metadata</TabsTrigger>
                                                <TabsTrigger className={cn("!text-gray-500 data-[state=active]:!bg-background data-[state=active]:!text-white")} disabled={!isTabEnabled("explain")} value="explain">Explain</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="text" className="w-full h-1 grow bg-background rounded-lg p-2 py-4 relative">
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
                                                            value={currentQuery.text}
                                                            onChange={(value) => setHistoryQuery(prev => ({
                                                                ...prev,
                                                                query: value || ""
                                                            }))}
                                                            onMount={handleEditorDidMount}
                                                            beforeMount={(m) => {
                                                                setTheme(m, "selector-theme", "#242424")
                                                            }}
                                                        />
                                                    </>
                                                }
                                            </TabsContent>
                                            <TabsContent className="w-full h-1 grow bg-background rounded-lg p-8" value="profile">
                                                <div className="h-full w-full overflow-hidden flex flex-col gap-4">
                                                    {
                                                        currentQuery &&
                                                        <Profile
                                                            graphName={graphName}
                                                            query={currentQuery}
                                                            setQuery={({ profile, text }) => {
                                                                const newQueries = historyQuery!.queries.map(q => q.text === text ? { ...q, profile } : q)
                                                                localStorage.setItem("query history", JSON.stringify(newQueries))
                                                                setHistoryQuery(prev => ({
                                                                    ...prev,
                                                                    queries: newQueries,
                                                                }))
                                                            }}
                                                            fetchCount={fetchCount}
                                                        />
                                                    }
                                                </div>
                                            </TabsContent>
                                            <TabsContent className="w-full h-1 grow bg-background rounded-lg p-8" value="metadata">
                                                <div className="h-full w-full overflow-hidden flex flex-col gap-4">
                                                    {
                                                        currentQuery &&
                                                        <Metadata
                                                            query={currentQuery}
                                                        />
                                                    }
                                                </div>
                                            </TabsContent>
                                            <TabsContent className="w-full h-1 grow bg-background rounded-lg p-8" value="explain">
                                                <div className="h-full w-full overflow-hidden flex flex-col gap-4">
                                                    {
                                                        currentQuery &&
                                                        <Explain
                                                            query={currentQuery}
                                                        />
                                                    }
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </DialogComponent>
                            </div>
                            <div className="w-[1px] bg-white" />
                            <Button
                                data-testid="editorMaximize"
                                title="Maximize"
                                onClick={() => setMaximize(true)}
                            >
                                <Maximize2 size={20} />
                            </Button>
                        </div>
                    </>
                    : <div className="w-full h-[58px]">
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
                            backgroundColor="bg-foreground"
                        />
                    </div>
            }
        </div >
    )
}

Selector.defaultProps = {
    runQuery: undefined,
    historyQuery: undefined,
    setHistoryQuery: undefined,
    setIsAddEntity: undefined,
    setIsAddRelation: undefined,
    fetchCount: undefined,
    isQueryLoading: undefined,
    isCanvasLoading: undefined,
}