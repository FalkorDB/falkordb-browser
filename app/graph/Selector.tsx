'use client'

import { FormEvent, useEffect, useRef, useState } from "react";
import { Dialog, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { editor } from "monaco-editor";
import { Toast, cn, prepareArg, securedFetch } from "@/lib/utils";
import Combobox from "../components/ui/combobox";
import { Graph, Query } from "./model";
import SchemaView from "../schema/SchemaView";
import Upload from "../components/graph/UploadGraph";
import DialogComponent from "../components/DialogComponent";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import CloseDialog from "../components/CloseDialog";

export default function Selector({ onChange, queries, inSchema = false, graphName }: {
    /* eslint-disable react/require-default-props */
    onChange: (selectedGraphName: string, selectedSchema: Graph) => void
    queries?: Query[]
    inSchema?: boolean
    graphName?: string
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

    useEffect(() => {
        const run = async () => {
            const result = await securedFetch("api/graph", {
                method: "GET"
            })
            if (!result.ok) return
            const res = (await result.json()).result as string[]
            setOptions(inSchema ? res.filter(name => name.includes("_schema")) : res.filter(name => !name.includes("_schema")))
        }
        run()
    }, [inSchema])

    useEffect(() => {
        if (!graphName) return
            setOptions(prev => {
                if (prev.includes(graphName)) return prev
                setSelectedValue(graphName)
                return [...prev, graphName]
            })
            setSelectedValue(graphName)
    }, [graphName])

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

            if (!data) return

            setEdgesCount(data.edges)
            setNodesCount(data.nodes)
        }
        run()
    }, [selectedValue])

    const handleEditorDidMount = (e: editor.IStandaloneCodeEditor) => {
        editorRef.current = e
    }

    const handleOnChange = async (name: string) => {
        if (!inSchema) {
            const q = 'MATCH (n)-[e]-(m) return n,e,m'
            const result = await securedFetch(`api/graph/${name}_schema/?query=${q}`, {
                method: "GET"
            })

            if (!result.ok) return

            const json = await result.json()

            setSchema(Graph.create(name, json.result))
            onChange(name, Graph.create(name, json.result))
        }
        onChange(name, Graph.empty())
        setSelectedValue(name)
    }

    const onDuplicate = async (e: FormEvent) => {
        e.preventDefault()
        const result = await securedFetch(`api/graph/${duplicateName}/?sourceName=${selectedValue}`, {
            method: "POST"
        })

        if (!result.ok) {
            Toast()
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
            Toast("Error while exporting data")
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
            Toast("Error while exporting data")
        }
    }



    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
                <Combobox isSelectGraph options={options} setOptions={setOptions} selectedValue={selectedValue} setSelectedValue={handleOnChange} />
                <div className="flex flex-row gap-16 text-[#7167F6]">
                    {
                        !inSchema &&
                        <p className={cn(!selectedValue && "opacity-50 cursor-not-allowed")}>Versions</p>
                    }
                    <Button
                        label="Upload Data"
                        onClick={() => setIsUploadOpen(true)}
                        disabled={!selectedValue}
                    />
                    <Upload isOpen={isUploadOpen} onOpen={setIsUploadOpen} />
                    <Button
                        label="Export Data"
                        onClick={onExport}
                        disabled={!selectedValue}
                    />
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DropdownMenu onOpenChange={setDropOpen}>
                            <DropdownMenuTrigger className="disabled:text-[#57577B]" disabled={!selectedValue} asChild>
                                <button
                                    className="flex flex-row gap-2"
                                    title="Duplicate"
                                    type="button"
                                    disabled={!selectedValue}
                                >
                                    <p>Duplicate</p>
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
                                            className="text-[#7167f6]"
                                            title="Duplicate Graph"
                                            type="button"
                                        >
                                            <p>Duplicate Graph</p>
                                        </button>
                                    </DialogTrigger>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <button
                                        className="text-[#7167f6]"
                                        title="New graph from schema"
                                        type="button"
                                    >
                                        <p>New graph from schema</p>
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DialogComponent description="Enter a new graph name" title="Duplicate Graph">
                            <form onSubmit={onDuplicate} className="grow flex flex-col gap-8">
                                <div className="flex flex-col gap-2">
                                    <p className="font-medium text-xl">Graph Name</p>
                                    <Input variant="Small" onChange={(e) => setDuplicateName(e.target.value)} required />
                                </div>
                                <div className="flex flex-row justify-end">
                                    <CloseDialog className="px-8" variant="Primary" />
                                </div>
                            </form>
                        </DialogComponent>
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
                {
                    !inSchema &&
                    <div className="flex flex-row gap-4 items-center">
                        <Dialog>
                            <DialogTrigger disabled={!selectedValue || !queries || queries.length === 0} asChild>
                                <Button
                                    disabled={!selectedValue || !queries || queries.length === 0}
                                    label="Query History"
                                />
                            </DialogTrigger>
                            <DialogComponent className="h-[80%] w-[70%]" title="Query History">
                                <div className="h-1 grow flex flex-col p-8 gap-8">
                                    <DialogTitle>Queries</DialogTitle>
                                    <div className="h-1 grow w-full flex flex-row">
                                        {
                                            queries && queries.length > 0 &&
                                            <ul className="flex-col border overflow-auto">
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
                                                        onMount={handleEditorDidMount}
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
                                            className="text-[#7167f6]"
                                            title="Profile"
                                            type="button"
                                        >
                                            <p>Profile</p>
                                        </button>
                                        <button
                                            className="text-[#7167f6]"
                                            title="Explain"
                                            type="button"
                                        >
                                            <p>Explain</p>
                                        </button>
                                        <button
                                            className="text-[#7167f6]"
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
                            </DialogComponent>
                        </Dialog>
                        <Dialog>
                            <DialogTrigger disabled={!selectedValue} asChild>
                                <Button
                                    disabled={!selectedValue}
                                    label="View Schema"
                                />
                            </DialogTrigger>
                            <DialogComponent title={`${selectedValue} Schema`} className="w-[90%] h-[90%]">
                                <div className="grow flex p-8">
                                    <SchemaView schema={schema} />
                                </div>
                            </DialogComponent>
                        </Dialog>
                    </div>
                }
            </div>
        </div >
    )
}