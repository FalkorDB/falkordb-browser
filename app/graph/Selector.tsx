'use client'

import { useEffect, useRef, useState, useCallback, Dispatch, SetStateAction } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { Editor } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { cn, defaultQuery, HistoryQuery, prepareArg, Query, securedFetch } from "@/lib/utils";
import { Session } from "next-auth";
import { PlusCircle, RefreshCcw } from "lucide-react";
import { usePathname } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import * as monaco from "monaco-editor";
import Combobox from "../components/ui/combobox";
import { Graph } from "../api/graph/model";
import DialogComponent from "../components/DialogComponent";
import Button from "../components/ui/Button";
import Duplicate from "./Duplicate";
import SchemaView from "../schema/SchemaView";
import View from "./View";
import CreateGraph from "../components/CreateGraph";
import ExportGraph from "../components/ExportGraph";
import MetadataView from "./MetadataView";
import Input from "../components/ui/Input";

interface Props {
    setGraphName: (selectedGraphName: string) => void
    graphName: string
    runQuery?: (query: string) => Promise<Query | undefined>
    queries?: Query[]
    historyQuery?: HistoryQuery
    setHistoryQuery?: Dispatch<SetStateAction<HistoryQuery>>
    edgesCount: number
    nodesCount: number
    setGraph: (graph: Graph) => void
    graph: Graph
    data: Session | null
}

export default function Selector({ setGraphName, graphName, queries, runQuery, edgesCount, nodesCount, setGraph, graph, data: session, historyQuery, setHistoryQuery }: Props) {

    const [options, setOptions] = useState<string[]>([]);
    const [schema, setSchema] = useState<Graph>(Graph.empty());
    const [search, setSearch] = useState<string>("")
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [duplicateOpen, setDuplicateOpen] = useState<boolean>(false);
    const [queriesOpen, setQueriesOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const pathname = usePathname()
    const type = pathname.includes("/schema") ? "Schema" : "Graph"
    const [isRotating, setIsRotating] = useState(false);
    const { toast } = useToast()
    const [filteredQueries, setFilteredQueries] = useState<Query[]>(queries || [])

    useEffect(() => {

        const timeout = setTimeout(() => {
            if (!historyQuery) return
            setFilteredQueries(queries?.filter((query, i) => !search || query.text.toLowerCase().includes(search.toLowerCase()) || i === historyQuery.counter - 1) || [])
        }, 500)

        return () => {
            clearTimeout(timeout)
        }
    }, [queries, search, historyQuery?.counter, historyQuery])

    useEffect(() => {
        setSelectedValue(graphName)
    }, [graphName])

    const getOptions = useCallback(async () => {
        const result = await securedFetch("api/graph", {
            method: "GET"
        }, toast)
        if (!result.ok) return
        const res = (await result.json()).result as string[]
        const opts = !runQuery ?
            res.filter(name => name.endsWith("_schema")).map(name => {
                let split = name.split("_schema")[0]
                if (split.startsWith("{") && split.endsWith("}")) {
                    split = split.substring(1, split.length - 1)
                }
                return split
            }) : res.filter(name => !name.endsWith("_schema"))
        setOptions(opts)
        if (opts.length === 1 && setSelectedValue) setSelectedValue(opts[0])
    }, [runQuery, toast])

    useEffect(() => {
        getOptions()
    }, [getOptions])

    const handleOnChange = async (name: string) => {
        const formattedName = name === '""' ? "" : name
        if (runQuery) {
            const result = await securedFetch(`api/graph/${prepareArg(name)}_schema/?query=${prepareArg(defaultQuery())}&create=false`, {
                method: "GET"
            }, toast)

            if (!result.ok) return

            const json = await result.json()
            if (json.result) {
                setSchema(Graph.create(name, json.result, false, true))
            }
        }
        setGraphName(formattedName)
        setSelectedValue(name)
    }

    useEffect(() => {
        getOptions()
    }, [getOptions])

    const handleEditorDidMount = (e: editor.IStandaloneCodeEditor) => {
        editorRef.current = e
        // Disable Ctrl + F keybinding
        // eslint-disable-next-line no-bitwise
        e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => { });
    }

    const handleReloadClick = () => {
        setIsRotating(true);
        getOptions();
        setTimeout(() => setIsRotating(false), 1000);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4" id="graphManager">
                    {
                        session?.user?.role !== "Read-Only" &&
                        <>
                            <CreateGraph
                                type={type}
                                onSetGraphName={(name) => {
                                    handleOnChange(name)
                                    setOptions(prev => [...prev, name])
                                }}
                                trigger={
                                    <Button
                                        variant="Primary"
                                        title={`Create New ${type}`}
                                    >
                                        <PlusCircle size={20} />
                                    </Button>
                                }
                            />
                            <p className="text-secondary">|</p>
                        </>
                    }
                    <Button
                        className={cn(
                            "transition-transform",
                            isRotating && "animate-spin duration-1000"
                        )}
                        onClick={handleReloadClick}
                        title="Reload Graphs List"
                    >
                        <RefreshCcw size={20} />
                    </Button>
                    <p className="text-secondary">|</p>
                    <Combobox
                        isSelectGraph
                        type={type}
                        options={options}
                        setOptions={setOptions}
                        selectedValue={selectedValue}
                        setSelectedValue={handleOnChange}
                    />
                </div>
                <div className="flex gap-16 text-[#e5e7eb]">
                    <ExportGraph
                        trigger={
                            <Button
                                label="Export Data"
                                disabled={!selectedValue}
                                title="Export your data to a file"
                            />
                        }
                        type={type}
                        selectedValues={[selectedValue]}
                    />
                    {
                        session?.user?.role !== "Read-Only" &&
                        <Duplicate
                            disabled={!selectedValue}
                            open={duplicateOpen}
                            onOpenChange={setDuplicateOpen}
                            onDuplicate={(name) => {
                                setOptions(prev => [...prev, name])
                                setSelectedValue(name)
                                handleOnChange(name)
                            }}
                            type={type}
                            selectedValue={selectedValue}
                        />
                    }
                    <View setGraph={setGraph} graph={graph} selectedValue={selectedValue} />
                </div >
            </div >
            <div className={cn("bg-foreground flex gap-4 justify-between items-center p-4 rounded-xl min-h-14", !selectedValue && "justify-end")}>
                {
                    selectedValue &&
                    <div className="flex gap-6">
                        <span>{nodesCount}&ensp;Nodes</span>
                        <p className="text-secondary">|</p>
                        <span>{edgesCount}&ensp;Edges</span>
                    </div>
                }
                {
                    runQuery &&
                    <div className="flex gap-4 items-center">
                        <DialogComponent
                            className="h-[90dvh] w-[90dvw]"
                            open={queriesOpen}
                            onOpenChange={setQueriesOpen}
                            trigger={
                                <Button
                                    disabled={!queries || queries.length === 0}
                                    title={!queries || queries.length === 0 ? "No queries" : "View past queries"}
                                    label="Query History"
                                />
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
                                                setHistoryQuery && historyQuery && queries && filteredQueries && filteredQueries.map((query, index) => {
                                                    const currentIndex = queries.findIndex(q => q.text === query.text)
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
                                                                <div className="h-[20dvh] border">
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
                                        {historyQuery && queries?.[historyQuery.counter - 1] && <MetadataView query={queries[historyQuery.counter - 1]} graphName={selectedValue} />}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        className="text-white flex justify-center w-1/3"
                                        disabled={isLoading || !historyQuery!.counter}
                                        onClick={async () => {
                                            try {
                                                setIsLoading(true);
                                                const q = await runQuery(queries?.[historyQuery!.counter!]?.text || "")
                                                if (q) {
                                                    setQueriesOpen(false)
                                                }
                                            } finally {
                                                setQueriesOpen(false)
                                                setIsLoading(false)
                                            }
                                        }}
                                        variant="Primary"
                                        label={isLoading ? undefined : "Run"}
                                        title={isLoading ? "Please wait..." : "Execute this query again"}
                                        isLoading={isLoading}
                                    />
                                </div>
                            </div >
                        </DialogComponent >
                        <DialogComponent className="h-[90%] w-[90%]" title={`${selectedValue} Schema`} trigger={
                            <Button
                                disabled={!schema.Id}
                                label="View Schema"
                                title="Display the schema structure"
                            />
                        }>
                            <SchemaView schema={schema} />
                        </DialogComponent>
                    </div >
                }
            </div >
        </div >
    )
}

Selector.defaultProps = {
    runQuery: undefined,
    queries: [],
    historyQuery: {
        queries: [],
        counter: 0,
        query: "",
        currentQuery: ""
    },
    setHistoryQuery: () => { }
}