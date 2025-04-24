'use client'

import { useEffect, useState, useContext, useCallback, Dispatch, SetStateAction, useRef } from "react";
import { cn, HistoryQuery, Query, securedFetch } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { History, Info, Maximize2, RefreshCcw } from "lucide-react";
import { usePathname } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { DialogTitle } from "@/components/ui/dialog";
import * as monaco from "monaco-editor";
import { Editor } from "@monaco-editor/react";
import Combobox from "../components/ui/combobox";
import Button from "../components/ui/Button";
import CreateGraph from "../components/CreateGraph";
import { GraphNameContext, GraphNamesContext, IndicatorContext } from "../components/provider";
import EditorComponent from "../components/EditorComponent";
import DialogComponent from "../components/DialogComponent";
import Input from "../components/ui/Input";
import MetadataView from "./MetadataView";

interface Props {
    runQuery?: (query: string) => Promise<void>
    historyQuery: HistoryQuery
    setHistoryQuery: Dispatch<SetStateAction<HistoryQuery>>
}

export default function Selector({ runQuery, historyQuery, setHistoryQuery }: Props) {

    const [maximize, setMaximize] = useState(false)
    const pathname = usePathname()
    const type = pathname.includes("/schema") ? "Schema" : "Graph"
    const [isRotating, setIsRotating] = useState(false);
    const { toast } = useToast()
    const { indicator, setIndicator } = useContext(IndicatorContext)
    const { graphNames: options, setGraphNames: setOptions } = useContext(GraphNamesContext)
    const { graphName, setGraphName } = useContext(GraphNameContext)
    const [queriesOpen, setQueriesOpen] = useState(false)
    const [search, setSearch] = useState("")
    const { data: session } = useSession()
    const [filteredQueries, setFilteredQueries] = useState<Query[]>([])
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

    const handleOnChange = useCallback(async (name: string) => {
        const formattedName = name === '""' ? "" : name
        setGraphName(formattedName)
    }, [setGraphName, setIndicator, toast, type])

    const getOptions = useCallback(async () => {
        if (indicator === "offline") return

        const result = await securedFetch(`api/${type === "Graph" ? "graph" : "schema"}`, {
            method: "GET"
        }, toast, setIndicator)
        if (!result.ok) return
        const { opts } = (await result.json()) as { opts: string[] }
        setOptions(opts)
        if (opts.length === 1) handleOnChange(opts[0])
        if (opts.length === 0) handleOnChange("")
    }, [indicator, type, toast, setIndicator, setOptions, handleOnChange])

    useEffect(() => {
        getOptions()
    }, [getOptions])

    useEffect(() => {
        if (indicator === "online") getOptions()
    }, [indicator, getOptions])

    const handleReloadClick = () => {
        setIsRotating(true);
        getOptions();
        setTimeout(() => setIsRotating(false), 1000);
    };

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

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!historyQuery) return
            setFilteredQueries(historyQuery.queries?.filter((query, i) => !search || query.text.toLowerCase().includes(search.toLowerCase()) || i === historyQuery.counter - 1) || [])
            focusEditorAtEnd()
        }, 500)

        return () => {
            clearTimeout(timeout)
        }
    }, [historyQuery?.queries, search, historyQuery?.counter, historyQuery])
    const submitQuery = useRef<HTMLButtonElement>(null)

    const handleEditorDidMount = (e: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = e

        // eslint-disable-next-line no-bitwise
        e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            submitQuery.current?.click();
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

    return (
        <div className="z-10 absolute w-[90%] top-5 left-[50%] translate-x-[-50%] flex flex-row gap-4 items-center">
            {
                session?.user?.role !== "Read-Only" &&
                <CreateGraph
                    type={type}
                    graphNames={options}
                    onSetGraphName={(name) => {
                        handleOnChange(name)
                        setOptions(prev => [...prev, name])
                    }}
                />
            }
            <div className="p-2 border rounded-lg overflow-hidden bg-foreground">
                <Button
                    indicator={indicator}
                    className={cn(
                        "transition-transform w-full h-full",
                        isRotating && "animate-spin duration-1000"
                    )}
                    onClick={handleReloadClick}
                    title="Reload Graphs List"
                >
                    <RefreshCcw />
                </Button>
            </div>
            <Combobox
                isSelectGraph
                type={type}
                options={options}
                setOptions={setOptions}
                selectedValue={graphName}
                setSelectedValue={handleOnChange}
            />
            {
                runQuery &&
                <div className="h-[56px] w-full relative overflow-visible">
                    <EditorComponent
                        maximize={maximize}
                        setMaximize={setMaximize}
                        runQuery={runQuery}
                        historyQuery={historyQuery}
                        setHistoryQuery={setHistoryQuery}
                    />
                </div>
            }
            <div className="flex gap-2 p-2 border rounded-lg bg-foreground">
                {
                    runQuery &&
                    <div className="flex gap-4 items-center">
                        <DialogComponent
                            className="h-[90dvh] w-[90dvw]"
                            open={queriesOpen}
                            onOpenChange={(open) => {
                                setQueriesOpen(open)
                                if (open) {
                                    setTimeout(() => {
                                        focusEditorAtEnd()
                                    }, 100)
                                }
                            }}
                            trigger={
                                <Button
                                    disabled={!historyQuery || historyQuery.queries.length === 0}
                                    title={!historyQuery || historyQuery.queries.length === 0 ? "No queries" : "View past queries"}
                                >
                                    <History />
                                </Button>
                            }
                            title="Query History"
                        >
                            <div className="grow flex flex-col p-8 gap-8" id="queryHistory">
                                <DialogTitle>Queries</DialogTitle>
                                <div className="h-1 grow flex border">
                                    <div className="w-1 grow border-r overflow-auto">
                                        <div className="p-8 border-b">
                                            <Input
                                                className="w-full"
                                                value={search}
                                                placeholder="Search for a query"
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                        <ul className="flex flex-col-reverse">
                                            {
                                                setHistoryQuery && historyQuery && filteredQueries.length > 0 && filteredQueries.map((query: Query, index) => {
                                                    const currentIndex = historyQuery.queries.findIndex(q => q.text === query.text)
                                                    return (
                                                        // eslint-disable-next-line react/no-array-index-key
                                                        <li key={index} className="flex flex-col gap-2 w-full border-b py-3 px-12">
                                                            <Button
                                                                className="w-full truncate text-sm"
                                                                label={query.text}
                                                                onClick={() => {
                                                                    setHistoryQuery(prev => ({
                                                                        ...prev,
                                                                        counter: currentIndex + 1
                                                                    }))
                                                                }}
                                                            />
                                                            {
                                                                historyQuery.counter - 1 === currentIndex &&
                                                                <div className="h-[20dvh] border" id="queryHistoryEditor">
                                                                    <Editor
                                                                        width="100%"
                                                                        height="100%"
                                                                        language="cypher"
                                                                        theme="custom-theme"
                                                                        options={{
                                                                            lineHeight: 30,
                                                                            fontSize: 25,
                                                                            lineNumbersMinChars: 3,
                                                                            scrollbar: {
                                                                                horizontal: "hidden"
                                                                            },
                                                                            wordWrap: "on",
                                                                            scrollBeyondLastLine: false,
                                                                            renderWhitespace: "none"
                                                                        }}
                                                                        value={historyQuery.query}
                                                                        onChange={(value) => setHistoryQuery(prev => ({
                                                                            ...prev,
                                                                            query: value || ""
                                                                        }))}
                                                                        onMount={handleEditorDidMount}
                                                                    />
                                                                </div>
                                                            }
                                                        </li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </div>
                                    <div className="w-1 grow">
                                        {historyQuery && historyQuery.queries.length > 0 && historyQuery.counter ? <MetadataView query={historyQuery.queries[historyQuery.counter - 1]} /> : undefined}
                                    </div>
                                </div>
                            </div>
                        </DialogComponent>
                    </div>
                }
                <div className="w-[1px] bg-white" />
                <Button
                    title="Maximize"
                    onClick={() => setMaximize(true)}
                >
                    <Maximize2 size={20} />
                </Button>
                <div className="w-[1px] bg-white" />
                <Button
                    className="pointer-events-auto"
                    title="Run (Enter) History (Arrow Up/Down) Insert new line (Shift + Enter)"
                >
                    <Info />
                </Button>
            </div>
        </div >
    )
}

Selector.defaultProps = {
    runQuery: undefined
}