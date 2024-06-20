'use client'

import { FormEvent, useEffect, useRef, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { editor } from "monaco-editor";
import { cn, securedFetch } from "@/lib/utils";
import Combobox from "../components/combobox";
import { Graph } from "./model";
import SchemaView from "./SchemaView";
import Upload from "../components/Upload";

export interface Query {
    text: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: string[]
}

export default function Selector({ onChange, queries }: {
    onChange: (selectedGraphName: string, selectedSchema: Graph) => void
    queries: Query[]
}) {

    const [options, setOptions] = useState<string[]>([]);
    const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
    const [schema, setSchema] = useState<Graph>(Graph.empty());
    const [duplicateName, setDuplicateName] = useState("");
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [dropOpen, setDropOpen] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [edgesCount, setEdgesCount] = useState<boolean>(false);
    const [nodesCount, setNodesCount] = useState<boolean>(false);
    const [query, setQuery] = useState<Query>();
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const { toast } = useToast();

    const prepareArg = (arg: string) => encodeURIComponent(arg.trim())

    const handelViewSchema = async () => {

    }

    useEffect(() => {
        const run = async () => {
            const result = await securedFetch("api/graph", {
                method: "GET"
            })
            if (!result.ok) return
            const res = (await result.json()).result as string[]
            setOptions(res.filter(name => !name.includes("_schema")))
        }
        run()
    }, [])

    useEffect(() => {
        if (!selectedValue) return
        const run = async () => {
            const q = "MATCH (n) WITH COUNT(n) as nodes MATCH ()-[e]-() RETURN nodes, COUNT(e) as edges"
            const result = await securedFetch(`api/graph/${prepareArg(selectedValue)}/?query=${prepareArg(q)}`, {
                method: "GET"
            })

            if (!result.ok) return

            const json = await result.json()

            const data = json.result.data[0]

            setEdgesCount(data.edges)
            setNodesCount(data.nodes)
        }
        run()
    }, [selectedValue])

    const handelEditorDidMount = (e: editor.IStandaloneCodeEditor) => {
        editorRef.current = e
    }

    const handelOnChange = async (name: string) => {
        const q = 'MATCH (n)-[e]-(m) return n,e,m'
        const result = await securedFetch(`api/graph/${name}_schema/?query=${q}`, {
            method: "GET"
        })

        const json = await result.json()

        if (!result.ok) {
            toast({
                title: "Error",
                description: json.message || "Schema not found"
            })
            return
        }

        setSelectedValue(name)
        setSchema(Graph.create(name, json.result))
        onChange(name, Graph.create(name, json.result))
    }

    const onDuplicate = async (e: FormEvent) => {
        e.preventDefault()
        const result = await securedFetch(`api/graph/${duplicateName}/?sourceName=${selectedValue}`, {
            method: "POST"
        })

        if (!result.ok) {
            toast({
                title: "Error",
                description: "Something went wrong"
            })
        }

        setDialogOpen(false)
        setOptions(prev => [...prev, duplicateName])
        setSelectedValue(duplicateName)
    }

    const onExport = async () => {
        const result = await securedFetch(`api/graph/${selectedValue}/export`, {
            method: "GET"
        })

        if (!result.ok) {
            const json = await result.json()
            toast({
                title: "Error",
                description: json.message || "Something went wrong"
            })
            return
        }

        const blob = await result.blob()
        const url = window.URL.createObjectURL(blob)
        try {
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `${selectedValue}.dump`)
            document.body.appendChild(link)
            link.click()
            link.parentNode?.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (e) {
            toast({
                title: "Error",
                description: (e as Error).message || "Something went wrong"
            })
        }
    }



    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
                <Combobox isSelectGraph options={options} setOptions={setOptions} selectedValue={selectedValue} setSelectedValue={handelOnChange} />
                <div className="flex flex-row gap-16 text-[#9192FD]">
                    <p className={cn(!selectedValue && "text-[#57577B]")}>Versions</p>
                    <button
                        className="disabled:text-[#57577B]"
                        title="Upload Data"
                        type="button"
                        onClick={() => setIsUploadOpen(true)}
                        disabled={!selectedValue}
                    >
                        <p>Upload Data</p>
                    </button>
                    <Upload isOpen={isUploadOpen} onOpen={setIsUploadOpen} />
                    <button
                        className="disabled:text-[#57577B]"
                        title="Export Data"
                        type="button"
                        onClick={onExport}
                        disabled={!selectedValue}
                    >
                        <p>Export Data</p>
                    </button>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DropdownMenu onOpenChange={setDropOpen}>
                            <DropdownMenuTrigger className="disabled:text-[#57577B]" disabled={!selectedValue} asChild>
                                <button
                                    className="flex flex-row gap-2"
                                    title="Duplicate"
                                    type="button"
                                >
                                    <p className={cn(!selectedValue && "text-[#57577B]")} >Duplicate</p>
                                    {
                                        dropOpen ?
                                            <ChevronUp />
                                            : <ChevronDown />
                                    }
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <DialogTrigger asChild>
                                        <button
                                            className="text-indigo-600"
                                            title="Duplicate Graph"
                                            type="button"
                                        >
                                            <p>Duplicate Graph</p>
                                        </button>
                                    </DialogTrigger>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <button
                                        className="text-indigo-600"
                                        title="New graph from schema"
                                        type="button"
                                    >
                                        <p>New graph from schema</p>
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DialogContent displayClose className="h-[30%] w-[20%] flex flex-col p-0">
                            <DialogHeader className="h-[20%] bg-indigo-600 flex flex-row justify-between p-4 items-center">
                                <DialogTitle className="text-white">Duplicate Graph</DialogTitle>
                                <DialogClose asChild>
                                    <button
                                        title="Close"
                                        type="button"
                                        aria-label="Close"
                                    >
                                        <X color="white" size={30} />
                                    </button>
                                </DialogClose>
                            </DialogHeader>
                            <form onSubmit={onDuplicate} className="grow p-8 flex flex-col gap-8">
                                <div className="flex flex-col gap-2">
                                    <p className="font-medium text-xl">Graph Name</p>
                                    <input className="border" type="text" value={duplicateName} onChange={(e) => setDuplicateName(e.target.value)} />
                                </div>
                                <div className="flex flex-row justify-end">
                                    <button
                                        className="bg-indigo-600 p-4 text-white w-[30%]"
                                        type="submit"
                                    >
                                        <p>OK</p>
                                    </button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className={cn("bg-[#2C2C4C] flex flex-row gap-4 justify-between items-center p-4 rounded-xl", !selectedValue && "justify-end")}>
                {
                    selectedValue &&
                    <div className="flex flex-row gap-6">
                        <p>Created on 2/2 24</p>
                        <span><span className="text-[#7167F6]">{nodesCount}</span>&ensp;Nodes</span>
                        <p className="text-[#57577B]">|</p>
                        <span><span className="text-[#7167F6]">{edgesCount}</span>&ensp;Edges</span>
                    </div>
                }
                <div className="flex flex-row gap-4 items-center">
                    <Dialog>
                        <DialogTrigger disabled={!selectedValue} asChild>
                            <button
                                className="disabled:text-[#57577B]"
                                title="Query History"
                                type="button"
                            >
                                <p>Query History</p>
                            </button>
                        </DialogTrigger>
                        <DialogContent displayClose className="w-[70%] h-[70%] flex flex-col p-0 shadow-lg rounded-xl">
                            <DialogHeader className="h-[10%] p-4 bg-indigo-600 flex flex-row justify-between items-center rounded-t-xl">
                                <DialogTitle className="text-white">
                                    Query History
                                </DialogTitle>
                                <DialogClose asChild>
                                    <button
                                        title="Close"
                                        type="button"
                                        aria-label="Close"
                                    >
                                        <X color="white" size={30} />
                                    </button>
                                </DialogClose>
                            </DialogHeader>
                            <div className="h-1 grow flex flex-col p-8 gap-8">
                                <DialogTitle>Queries</DialogTitle>
                                <div className="h-1 grow w-full flex flex-row">
                                    {
                                        queries.length > 0 &&
                                        <ul className="flex-col border overflow-auto">
                                            {
                                                queries.map((q, index) => (
                                                    // eslint-disable-next-line react/no-array-index-key
                                                    <li key={index} className="w-full text-sm border-b py-3 px-12">
                                                        <button
                                                            className="w-full truncate"
                                                            title={`Query ${index + 1}`}
                                                            type="button"
                                                            onClick={() => setQuery(q)}
                                                        >
                                                            <p>{q.text}</p>
                                                        </button>
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    }
                                    <div className="w-1 grow flex flex-col gap-2 p-4 border">
                                        {
                                            schema.Id &&
                                            <div className="h-1 grow flex flex-row">
                                                <Editor
                                                    width="100%"
                                                    height="100%"
                                                    language="cypher"
                                                    theme="custom-theme"
                                                    options={{
                                                        lineHeight: 30,
                                                        fontSize: 25,
                                                        scrollbar: {
                                                            horizontal: "hidden"
                                                        },
                                                        wordWrap: "on",
                                                        scrollBeyondLastLine: false,
                                                        renderWhitespace: "none"
                                                    }}
                                                    value={query?.text}
                                                    onChange={(q) => setQuery(({ text: q || "", metadata: query?.metadata || [] }))}
                                                    onMount={handelEditorDidMount}
                                                />
                                            </div>
                                        }
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
                                <div className="flex flex-row justify-end items-center gap-12">
                                    <button
                                        className="text-indigo-600"
                                        title="Profile"
                                        type="button"
                                    >
                                        <p>Profile</p>
                                    </button>
                                    <button
                                        className="text-indigo-600"
                                        title="Explain"
                                        type="button"
                                    >
                                        <p>Explain</p>
                                    </button>
                                    <button
                                        className="text-indigo-600"
                                        title="Profile"
                                        type="button"
                                    >
                                        <p>Translate to Cypher</p>
                                    </button>
                                    <button
                                        className="w-1/6 bg-indigo-600 text-white p-4"
                                        title="Run"
                                        type="button"
                                    >
                                        <p>RUN</p>
                                    </button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog>
                        <DialogTrigger disabled={!selectedValue} asChild>
                            <button
                                className="disabled:text-[#57577B]"
                                title="View Schema"
                                type="button"
                                onClick={handelViewSchema}
                            >
                                <p>View Schema</p>
                            </button>
                        </DialogTrigger>
                        <DialogContent displayClose className="w-[90%] h-[90%] flex flex-col p-0 rounded-lg">
                            <DialogHeader className="h-[10%] p-4 bg-indigo-600 flex flex-row justify-between items-center rounded-t-xl">
                                <DialogTitle className="text-white">
                                    {selectedValue} Schema
                                </DialogTitle>
                                <DialogClose asChild>
                                    <button
                                        title="Close"
                                        type="button"
                                        aria-label="Close"
                                    >
                                        <X color="white" size={30} />
                                    </button>
                                </DialogClose>
                            </DialogHeader>
                            <div className="grow flex p-8">
                                <SchemaView schema={schema} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div >
    )
}