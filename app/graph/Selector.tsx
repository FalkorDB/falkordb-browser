'use client'

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Editor } from "@monaco-editor/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { editor } from "monaco-editor";
import { Toast, cn, prepareArg, securedFetch } from "@/lib/utils";
import Combobox from "../components/ui/combobox";
import { Graph, Query } from "../api/graph/model";
import SchemaView from "../schema/SchemaView";
import UploadGraph from "../components/graph/UploadGraph";
import DialogComponent from "../components/DialogComponent";
import Button from "../components/ui/Button";
import Duplicate from "./Duplicate";
import CloseDialog from "../components/CloseDialog";

export default function Selector({ onChange, queries, graphName, runQuery }: {
    /* eslint-disable react/require-default-props */
    onChange: (selectedGraphName: string) => void
    runQuery?: (query: string) => Promise<void>
    queries?: Query[]
    graphName?: string
}) {

    const [options, setOptions] = useState<string[]>([]);
    const [schema, setSchema] = useState<Graph>(Graph.empty());
    const [selectedValue, setSelectedValue] = useState<string>(graphName || "");
    const [duplicateOpen, setDuplicateOpen] = useState<boolean>(false);
    const [dropOpen, setDropOpen] = useState<boolean>(false);
    const [edgesCount, setEdgesCount] = useState<number>(0);
    const [nodesCount, setNodesCount] = useState<number>(0);
    const [query, setQuery] = useState<Query>();
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

    useEffect(() => {
        const run = async () => {
            const result = await securedFetch("api/graph", {
                method: "GET"
            })
            if (!result.ok) return
            const res = (await result.json()).result as string[]
            setOptions(!runQuery ? res.filter(name => name.includes("_schema")) : res.filter(name => !name.includes("_schema")))
        }
        run()
    }, [runQuery])

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

            const data = json.result?.data[0]

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
        if (runQuery) {
            const q = 'MATCH (n)-[e]-(m) return n,e,m'
            const result = await securedFetch(`api/graph/${name}_schema/?query=${q}`, {
                method: "GET"
            })

            if (!result.ok) return

            const json = await result.json()

            setSchema(Graph.create(name, json.result))
            onChange(name)
        }
        onChange(name)
        setSelectedValue(name)
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
            <div className="flex justify-between items-center">
                <Combobox isSelectGraph options={options} setOptions={setOptions} selectedValue={selectedValue} setSelectedValue={handleOnChange} />
                <div className="flex gap-16 text-[#7167F6]">
                    <UploadGraph disabled={!selectedValue} />
                    <Button
                        label="Export Data"
                        onClick={onExport}
                        disabled={!selectedValue}
                    />
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
                                    className="text-[#7167F6]"
                                    label="Duplicate Graph"
                                    onClick={() => setDuplicateOpen(true)}
                                />
                            </DropdownMenuItem >
                            <DropdownMenuItem>
                                <Button
                                    className="text-[#7167F6]"
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
                </div >
            </div >
            <div className={cn("bg-[#2C2C4C] flex gap-4 justify-between items-center p-4 rounded-xl min-h-14", !selectedValue && "justify-end")}>
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
                        <Dialog>
                            <DialogTrigger disabled={!selectedValue || !queries || queries.length === 0} asChild>
                                <Button
                                    disabled={!selectedValue || !queries || queries.length === 0}
                                    label="Query History"
                                />
                            </DialogTrigger>
                            <DialogComponent className="h-[80%] w-[80%]" title="Query History">
                                <div className="grow flex flex-col p-8 gap-8">
                                    <DialogTitle>Queries</DialogTitle>
                                    <div className="grow flex">
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
                                        <CloseDialog
                                            className="text-white"
                                            onClick={() => runQuery(query?.text || "")}
                                            variant="Large"
                                            label="Run"
                                        />
                                    </div>
                                </div>
                            </DialogComponent>
                        </Dialog>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    disabled={!selectedValue}
                                    label="View Schema"
                                />
                            </DialogTrigger>
                            <DialogComponent className="h-[90%] w-[90%]" title={`${selectedValue} Schema`}>
                                <SchemaView schema={schema} />
                            </DialogComponent>
                        </Dialog>
                    </div>
                }
            </div>
        </div >
    )
}