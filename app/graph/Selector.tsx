'use client'

import { SetStateAction, Dispatch, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Editor } from "@monaco-editor/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { editor } from "monaco-editor";
import { Toast, cn, prepareArg, securedFetch } from "@/lib/utils";
import { Session } from "next-auth";
import { PlusCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import Combobox from "../components/ui/combobox";
import { Graph, Query } from "../api/graph/model";
import UploadGraph from "../components/graph/UploadGraph";
import DialogComponent from "../components/DialogComponent";
import Button from "../components/ui/Button";
import Duplicate from "./Duplicate";
import SchemaView from "../schema/SchemaView";
import View from "./View";
import CreateGraph from "../components/CreateGraph";

interface Props {
    /* eslint-disable react/require-default-props */
    onChange: (selectedGraphName: string) => void
    graphName: string
    setGraphName: Dispatch<SetStateAction<string>>
    runQuery?: (query: string, setQueriesOpen: (open: boolean) => void) => Promise<void>
    queries?: Query[]
    edgesCount: number
    nodesCount: number
    setGraph: (graph: Graph) => void
    graph: Graph
    data: Session | null
}

export default function Selector({ onChange, graphName, setGraphName, queries, runQuery, edgesCount, nodesCount, setGraph, graph, data: session }: Props) {

    const [createOpen, setCreateOpen] = useState<boolean>(false);
    const [exportOpen, setExportOpen] = useState<boolean>(false);
    const [options, setOptions] = useState<string[]>([]);
    const [newGraphName, setNewGraphName] = useState<string>("");
    const [schema, setSchema] = useState<Graph>(Graph.empty());
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [duplicateOpen, setDuplicateOpen] = useState<boolean>(false);
    const [dropOpen, setDropOpen] = useState<boolean>(false);
    const [queriesOpen, setQueriesOpen] = useState<boolean>(false);
    const [query, setQuery] = useState<Query>();
    const [reload, setReload] = useState<boolean>(false);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const pathname = usePathname()
    const type = pathname.includes("/schema") ? "Schema" : "Graph"

    useEffect(() => {
        if (createOpen) return
        setNewGraphName("")
    }, [createOpen])

    useEffect(() => {
        const run = async () => {
            const result = await securedFetch("api/graph", {
                method: "GET"
            })
            if (!result.ok) return
            const res = (await result.json()).result as string[]
            setOptions(!runQuery ? res.filter(name => name.includes("_schema")).map(name => name.split("_")[0]) : res.filter(name => !name.includes("_schema")))
        }
        run()
    }, [runQuery, reload])

    useEffect(() => {
        if (!graphName) return
        setOptions(prev => {
            if (prev.includes(graphName)) return prev
            setSelectedValue(graphName)
            return [...prev, graphName]
        })
    }, [graphName])

    const handleEditorDidMount = (e: editor.IStandaloneCodeEditor) => {
        editorRef.current = e
    }

    const handleOnChange = async (name: string) => {
        if (runQuery) {
            const q = 'MATCH (n)-[e]-(m) return n,e,m'
            const result = await securedFetch(`api/graph/${prepareArg(name)}_schema/?query=${prepareArg(q)}&create=false&role=${session?.user.role}`, {
                method: "GET"
            })

            if (!result.ok) return

            const json = await result.json()
            if (json.result) {
                setSchema(Graph.create(name, json.result))
            }
        }
        onChange(name)
        setSelectedValue(name)
    }

    const handleExport = async () => {
        const name = `${selectedValue}${!runQuery ? "_schema" : ""}`
        const result = await securedFetch(`api/graph/${prepareArg(name)}/export`, {
            method: "GET"
        })

        if (!result.ok) return

        const blob = await result.blob()
        const url = window.URL.createObjectURL(blob)
        try {
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `${name}.dump`)
            document.body.appendChild(link)
            link.click()
            link.parentNode?.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (e) {
            Toast("Error while exporting data")
        }
    }

    const handleCreateGraph = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!newGraphName) {
            Toast("Graph name cannot be empty")
            return
        }
        const q = 'RETURN 1'
        const result = await securedFetch(`api/graph/${prepareArg(newGraphName)}/?query=${prepareArg(q)}`, {
            method: "GET",
        })
        if (!result.ok) {
            Toast("Error while creating graph")
            return
        }

        setOptions(prev => [...prev, newGraphName])
        setGraphName(newGraphName)
        setCreateOpen(false)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <CreateGraph
                        open={createOpen}
                        setOpen={setCreateOpen}
                        graphName={graphName}
                        setGraphName={setGraphName}
                        handleCreateGraph={handleCreateGraph}
                        trigger={
                            <Button
                                variant="Primary"
                                title={`Create New ${type}`}
                                icon={<PlusCircle />}
                            />
                        }
                    />
                    <p className="text-[#57577B]">|</p>
                    <Combobox
                        isSelectGraph
                        options={options}
                        setOptions={setOptions}
                        selectedValue={selectedValue}
                        setSelectedValue={handleOnChange}
                        isSchema={!runQuery}
                        setReload={setReload}
                    />
                </div>
                <div className="flex gap-16 text-[#e5e7eb]">
                    <UploadGraph disabled />
                    <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                        <DialogTrigger disabled={!selectedValue} asChild>
                            <Button
                                label="Export Data"
                                disabled={!selectedValue}
                            />
                        </DialogTrigger>
                        <DialogContent className="gap-8 border-none rounded-lg">
                            <DialogHeader className="border-b p-4">
                                <DialogTitle className="font-Oswald font-normal text-4xl tracking-normal">Export your graph</DialogTitle>
                            </DialogHeader>
                            <DialogDescription className="text-xl">Export a .dump file of your data</DialogDescription>
                            <div className="flex gap-4">
                                <Button
                                    className="flex-1"
                                    variant="Large"
                                    label="Download"
                                    onClick={handleExport}
                                />
                                <Button
                                    className="flex-1"
                                    variant="Secondary"
                                    label="Cancel"
                                    onClick={() => {
                                        setExportOpen(false)
                                    }}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                    <DropdownMenu onOpenChange={setDropOpen}>
                        <DropdownMenuTrigger disabled={!selectedValue} asChild>
                            <Button
                                label="Duplicate"
                                open={dropOpen}
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>
                                <Button
                                    className="w-full p-2 text-start"
                                    label="Duplicate Graph"
                                    onClick={() => setDuplicateOpen(true)}
                                />
                            </DropdownMenuItem >
                            <DropdownMenuItem>
                                <Button
                                    className="w-full p-2 text-start"
                                    label="New graph from schema"
                                />
                            </DropdownMenuItem>
                        </DropdownMenuContent >
                    </DropdownMenu >
                    <Duplicate
                        open={duplicateOpen}
                        onOpenChange={setDuplicateOpen}
                        onDuplicate={(name) => {
                            setOptions(prev => [...prev, name])
                            setSelectedValue(name)
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
                        <p>Created on 2/2 24</p>
                        <span><span className="text-[#7167F6]">{nodesCount}</span>&ensp;Nodes</span>
                        <p className="text-[#57577B]">|</p>
                        <span><span className="text-[#7167F6]">{edgesCount}</span>&ensp;Edges</span>
                    </div>
                }
                {
                    runQuery &&
                    <div className="flex gap-4 items-center">
                        <DialogComponent
                            open={queriesOpen}
                            onOpenChange={setQueriesOpen}
                            trigger={
                                <Button
                                    label="Query History"
                                />
                            }
                            title="Query History"
                        >
                            <div className="grow flex flex-col p-8 gap-8">
                                <DialogTitle>Queries</DialogTitle>
                                <div className="h-1 grow flex">
                                    {
                                        queries && queries.length > 0 &&
                                        <ul className="h-full flex-col border overflow-auto">
                                            {
                                                queries.map((q, index) => (
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
                                    }
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
                                        className="text-white w-1/3"
                                        onClick={() => runQuery(query?.text || "", setQueriesOpen)}
                                        variant="Large"
                                        label="Run"
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