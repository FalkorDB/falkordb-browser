'use client'

import { useEffect, useRef, useState, useCallback } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { Editor } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { cn, defaultQuery, prepareArg, securedFetch } from "@/lib/utils";
import { Session } from "next-auth";
import { PlusCircle, RefreshCcw } from "lucide-react";
import { usePathname } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import * as monaco from "monaco-editor";
import Combobox from "../components/ui/combobox";
import { Graph, Query } from "../api/graph/model";
import DialogComponent from "../components/DialogComponent";
import Button from "../components/ui/Button";
import Duplicate from "./Duplicate";
import SchemaView from "../schema/SchemaView";
import View from "./View";
import CreateGraph from "../components/CreateGraph";
import ExportGraph from "../components/ExportGraph";

interface Props {
    setGraphName: (selectedGraphName: string) => void
    graphName: string
    runQuery?: (query: string, setQueriesOpen: (open: boolean) => void) => Promise<void>
    queries?: Query[]
    edgesCount: number
    nodesCount: number
    setGraph: (graph: Graph) => void
    graph: Graph
    data: Session | null
}

export default function Selector({ setGraphName, graphName, queries, runQuery, edgesCount, nodesCount, setGraph, graph, data: session }: Props) {

    const [options, setOptions] = useState<string[]>([]);
    const [schema, setSchema] = useState<Graph>(Graph.empty());
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [duplicateOpen, setDuplicateOpen] = useState<boolean>(false);
    const [query, setQuery] = useState<Query>();
    const [queriesOpen, setQueriesOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const pathname = usePathname()
    const type = pathname.includes("/schema") ? "Schema" : "Graph"
    const [isRotating, setIsRotating] = useState(false);
    const { toast } = useToast()
    const submitQuery = useRef<HTMLButtonElement>(null)
    
    useEffect(() => {
        setSelectedValue(graphName)
    }, [graphName])

    const getOptions = useCallback(async () => {
        const result = await securedFetch("api/graph", {
            method: "GET"
        }, session?.user?.role, toast)
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
    }, [runQuery, session?.user?.role, toast])

    useEffect(() => {
        getOptions()
    }, [getOptions])

    const handleEditorDidMount = (e: editor.IStandaloneCodeEditor) => {
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

    const handleOnChange = async (name: string) => {
        const formattedName = name === '""' ? "" : name
        if (runQuery) {
            const result = await securedFetch(`api/graph/${prepareArg(name)}_schema/?query=${prepareArg(defaultQuery())}&create=false`, {
                method: "GET"
            }, session?.user?.role, toast)

            if (!result.ok) return

            const json = await result.json()
            if (json.result) {
                setSchema(Graph.create(name, json.result, false, true))
            }
        }
        setGraphName(formattedName)
        setSelectedValue(name)
    }

    const handleReloadClick = () => {
        setIsRotating(true);
        getOptions();
        setTimeout(() => setIsRotating(false), 1000);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
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
                        options={options}
                        setOptions={setOptions}
                        selectedValue={selectedValue}
                        setSelectedValue={handleOnChange}
                        isSchema={!runQuery}
                    />
                </div>
                <div className="flex gap-16 text-[#e5e7eb]">
                    <ExportGraph
                        trigger={
                            <Button
                                label="Export Data"
                                disabled={!selectedValue}
                            />
                        }
                        type={type}
                        selectedValues={[selectedValue]}
                    />
                    <Duplicate
                        disabled={!selectedValue}
                        open={duplicateOpen}
                        onOpenChange={setDuplicateOpen}
                        onDuplicate={(name) => {
                            setOptions(prev => [...prev, name])
                            setSelectedValue(name)
                            handleOnChange(name)
                        }}
                        selectedValue={selectedValue}
                    />
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
                            className="h-[80dvh] w-[90dvw]"
                            open={queriesOpen}
                            onOpenChange={setQueriesOpen}
                            trigger={
                                <Button
                                    disabled={!queries || queries.length === 0}
                                    title={!queries || queries.length === 0 ? "No queries" : undefined}
                                    label="Query History"
                                />
                            }
                            title="Query History"
                        >
                            <div className="grow flex flex-col p-8 gap-8">
                                <DialogTitle>Queries</DialogTitle>
                                <div className="h-1 grow flex">
                                    <ul className="w-1 grow flex-col border overflow-auto">
                                        {
                                            queries && queries.map((q, index) => (
                                                // eslint-disable-next-line react/no-array-index-key
                                                <li key={index} className="w-full text-sm border-b py-3 px-12">
                                                    <Button
                                                        className="w-full truncate"
                                                        label={q.text}
                                                        onClick={() => setQuery(q)}
                                                    />
                                                </li>
                                            ))
                                        }
                                    </ul>
                                    <div className="w-1 grow flex flex-col gap-2 p-4 border">
                                        <div className="h-1 grow flex">
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
                                                value={query?.text}
                                                onChange={(q) => setQuery(({ text: q || "", metadata: query?.metadata || [] }))}
                                                onMount={handleEditorDidMount}
                                            />
                                        </div>
                                        <ul className="flex flex-col gap-2">
                                            {
                                                query?.metadata &&
                                                query.metadata.map((line, index) => (
                                                    // eslint-disable-next-line react/no-array-index-key
                                                    <li key={index}>
                                                        <p>{line}</p>
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </div>
                                </div>
                                <div className="flex justify-end items-center gap-12 text-[#7167F6]">
                                    <Button
                                        label="Profile"
                                        disabled
                                    />
                                    <Button
                                        label="Explain"
                                        disabled
                                    />
                                    <Button
                                        label="Translate to cypher"
                                        disabled
                                    />
                                    <Button
                                        ref={submitQuery}
                                        className="text-white flex justify-center w-1/3"
                                        disabled={isLoading}
                                        onClick={async () => {
                                            try {
                                                setIsLoading(true);
                                                await runQuery(query?.text || "", setQueriesOpen)
                                            } finally {
                                                setIsLoading(false)
                                            }
                                        }}
                                        variant="Primary"
                                        label={isLoading ? undefined : "Run"}
                                        title={isLoading ? "Please wait..." : undefined}
                                    />
                                </div>
                            </div>
                        </DialogComponent>
                        <DialogComponent className="h-[90%] w-[90%]" title={`${selectedValue} Schema`} trigger={
                            <Button
                                disabled={!schema.Id}
                                label="View Schema"
                            />
                        }>
                            <SchemaView schema={schema} session={session} />
                        </DialogComponent>
                    </div>
                }
            </div>
        </div >
    )
}

Selector.defaultProps = {
    runQuery: undefined,
    queries: [],
}
