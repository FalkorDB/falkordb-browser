'use client'

import { AlertCircle, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import useSWR from "swr";
import { EdgeDataDefinition, NodeDataDefinition } from "cytoscape";
import { Toast, prepareArg, securedFetch } from "@/lib/utils";
import Header from "../graph/Header";
import { Graph } from "../graph/model";
import Input from "../components/Input";
import Button from "../components/Button";
import GraphView from "../graph/GraphView";
import SchemaView from "../graph/SchemaView";
import Dropzone from "../components/Dropzone";

type CurrentTab = "loadSchema" | "schema" | "graph"

type ElementDataDefinition = NodeDataDefinition | EdgeDataDefinition

export default function Create() {

    const [currentTab, setCurrentTab] = useState<CurrentTab | null>()
    const [schema, setSchema] = useState<Graph>(Graph.empty())
    const [token, setToken] = useState()
    const [files, setFiles] = useState<File[]>([])
    const [filesPath, setFilesPath] = useState<string[]>()
    const [nodesCount, setNodesCount] = useState<number>(0)
    const [edgesCount, setEdgesCount] = useState<string[]>([])
    const [graphName, setGraphName] = useState<string>("")
    const [progress, setProgress] = useState<number>(0)
    const [openaiKey, setOpenaiKey] = useState<string>("")
    const router = useRouter()

    const fetcher = async (url: string) => {

        const result = await securedFetch(url, {
            method: "GET",
        })

        if (!result.ok) {
            Toast()
            return
        }

        const json = await result.json()

        setProgress(json.progress * 100)

        if (json.progress === 1) {
            const q = "MATCH (n)-[e]-(m) RETURN n,e,m"

            const res = await securedFetch(`api/graph/${prepareArg(graphName)}_schema/?query=${prepareArg(q)}`, {
                method: "GET"
            })

            if (!res.ok) {
                Toast()
                setProgress(0)
                setCurrentTab(null)
                setFilesPath([])
                return
            }

            const j = await res.json()

            if (!j.result.data.length) {
                Toast()
                setProgress(0)
                setCurrentTab(null)
                setFilesPath([])
                return
            }

            setProgress(0)
            setSchema(Graph.create(`${graphName}_schema`, j.result))
            setCurrentTab("schema")
        }
    }

    useSWR((currentTab === "loadSchema" && progress < 100 && token) && `api/graph/${graphName}/?token=${token}`, fetcher, { refreshInterval: 2500 })

    const handleCreateSchema = async (e: FormEvent) => {

        e.preventDefault()

        setCurrentTab("loadSchema")

        if (!files) return

        const newFilesPath = (await Promise.all(files.map(async (file) => {
            const formData = new FormData();

            formData.append("file", file);

            const result = await securedFetch(`api/upload`, {
                method: "POST",
                body: formData
            });

            if (!result.ok) return ""

            const json = await result.json()

            return json.path
        }))).filter((path) => path)

        setFilesPath(newFilesPath)

        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/?type=detect_schema&key=${prepareArg(openaiKey)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newFilesPath)
        })


        if (!result.ok) {
            Toast()
            setFilesPath([])
            setProgress(0)
            setCurrentTab(null)
            return
        }

        const json = await result.json()
        
        setToken(json.token)
    }

    const handleCreateGraph = async () => {

        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/?type=populate_kg/?key=${openaiKey}`, {
            method: "POST",
            body: JSON.stringify(filesPath)
        })

        if (!result.ok) {
            Toast()
            return
        }
        setCurrentTab("graph")
    }

    const handleGoToMain = () => {
        router.push("/graph")
    }

    const onDelete = async (selectedValue: ElementDataDefinition) => {
        const { id } = selectedValue
        const q = `MATCH (n) WHERE ID(n) = ${id} delete n`
        const result = await securedFetch(`api/graph/${prepareArg(graphName)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (!result.ok) {
            Toast("Faild to delete")
            return
        }
        schema.Elements = schema.Elements.filter(e => e.data.id !== id)
    }

    const onAddEntity = () => {
        schema.Elements = [...schema.Elements, { data: { id: "number" } }]
    }

    const onAddRelation = () => {
        schema.Elements = [...schema.Elements, { data: { id: "number" } }]
    }

    const setLabel = async (selectedElement: ElementDataDefinition, label: string) => {

        const { id } = selectedElement
        const q = `MATCH (n) WHERE ID(n) = ${id} SET n:${label} WITH n REMOVE n:${selectedElement.category || selectedElement.label}`
        const { ok } = await securedFetch(`api/graph/${prepareArg(graphName)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (!ok) {
            Toast("Failed to set label")
            return ok
        }

        schema.Elements = schema.Elements.map(e => {
            if (e.data.id === id) {
                const updatedElement = { ...e }
                if (updatedElement.data.label) {
                    updatedElement.data.label = label
                } else {
                    updatedElement.data.category = label
                }
                return updatedElement
            }
            return e
        })

        return ok
    }

    const setProperty = async (selectedElement: ElementDataDefinition, key: string, newVal: string[]) => {
        const { id } = selectedElement
        const q = `MATCH (n) WHERE ID(n) = ${id} SET n.${key} = "${newVal}"`
        const { ok } = await securedFetch(`api/graph/${prepareArg(graphName)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (!ok) {
            Toast("Failed to set property")
            return ok
        }

        schema.Elements = schema.Elements.map(e => {
            if (e.data.id === id) {
                const updatedElement = e
                updatedElement.data[key] = newVal
                return updatedElement
            }
            return e
        })

        return ok
    }

    const removeProperty = async (selectedElement: ElementDataDefinition, key: string) => {
        const { id } = selectedElement
        const q = `MATCH (n) WHERE ID(n) = ${id} SET n.${key} = null`
        const result = await securedFetch(`api/graph/${prepareArg(graphName)}_schema/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        const json = await result.json()

        if (!result.ok) {
            Toast(json.message || "Failed to remove property")
            return result.ok
        }

        schema.Elements = schema.Elements.map(e => {
            if (e.data.id === id) {
                const updatedElement = e
                delete updatedElement.data[key]
                return updatedElement
            }
            return e
        })

        return result.ok
    }

    const handelCreateEmptyGraph = async () => {

        if (!graphName) {
            Toast("Graph name is required")
            return
        }

        const q = "MATCH (n) RETURN n"
        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (!result.ok) {
            Toast("Failed to create graph")
            return
        }

        router.push(`/graph/?emptyGraphName=${prepareArg(graphName)}`)
    }

    const getCurrentTab = () => {
        switch (currentTab) {
            case "loadSchema":
                return (
                    <div className="grow flex flex-col justify-center">
                        <div className="h-1/2 bg-[#434366] rounded-lg flex flex-col justify-center items-center p-16 gap-6">
                            <p>Processing ...</p>
                            <Progress value={progress} />
                        </div>
                    </div>
                )
            case "schema":
                return (
                    <div className="grow flex flex-col gap-10">
                        <SchemaView schema={schema} onAddEntity={onAddEntity} onAddRelation={onAddRelation} onDelete={onDelete} removeProperty={removeProperty} setLabel={setLabel} setProperty={setProperty} />
                        <div className="flex flex-row justify-end gap-16">
                            <button
                                className="flex flex-row gap-1 items-center text-[#7167F6]"
                                title="Back"
                                type="button"
                                onClick={() => setCurrentTab(null)}
                            >
                                <ChevronLeft size={15} />
                                <p>back</p>
                            </button>
                            <Button
                                variant="Large"
                                label="Create Graph"
                                type="button"
                                onClick={() => handleCreateGraph()}
                            />
                        </div>
                    </div>
                )
            case "graph": {

                const q = "MATCH (n) WITH Count(n) as nodes MATCH ()-[e]-() return nodes, Count(e) as edges"

                securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q)}`, {
                    method: "GET",
                }).then((response) => response.json()).then((json) => {
                    const data = json.result.data[0]
                    if (!data) return
                    setNodesCount(data.nodes)
                    setEdgesCount(data.edges)
                }).catch(() => {
                    Toast("Failed to get graph metadata")
                })

                return (
                    <div className="grow flex flex-col gap-8">
                        <div className="p-4 bg-[#2C2C4C] text-[#FFFFFF] flex flex-row gap-12 items-center rounded-lg">
                            <span >Created on 2/2 24</span>
                            <span><span>{nodesCount}</span>&emsp;Nodes</span>
                            <p className="text-[#57577B]">|</p>
                            <span><span>{edgesCount}</span>&emsp;Edges</span>
                        </div>
                        <GraphView schema={schema} graphName={graphName} />
                        <div className="flex flex-row justify-end gap-16">
                            <button
                                className="flex flex-row gap-1 items-center text-[#7167F6]"
                                title="Back"
                                type="button"
                                onClick={() => setCurrentTab("schema")}
                            >
                                <ChevronLeft size={15} />
                                <p>back</p>
                            </button>
                            <Button
                                className="w-1/4"
                                variant="Large"
                                label="Go To Main Screen"
                                type="button"
                                onClick={handleGoToMain}
                            />
                        </div>
                    </div>
                )
            }
            default:
                return (
                    <form onSubmit={async (e) => { await handleCreateSchema(e) }} className="grow flex flex-col gap-8">
                        <div className="grow flex flex-col gap-6">
                            <div className="flex flex-row gap-8">
                                <div className="flex flex-row gap-4">
                                    <p>Graph Name</p>
                                    <Input
                                        className="w-1/2"
                                        variant="Small"
                                        title="GraphName"
                                        type="text"
                                        onChange={(e) => setGraphName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grow flex flex-row gap-4">
                                    <p className="flex flex-row gap-2 items-center">OpenAI Key <AlertCircle size={15} /></p>
                                    <Input
                                        className="w-1/2"
                                        variant="Small"
                                        title="OpenAI Key"
                                        type="text"
                                        onChange={(e) => setOpenaiKey(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-row gap-16">
                                <h1>Files</h1>
                                <p>URLs</p>
                                <p>Amazon S3/GCP</p>
                            </div>
                            <Dropzone filesCount={false} withTable onFileDrop={setFiles} />
                        </div>
                        <div className="flex flex-row-reverse gap-4">
                            <Button
                                variant="Large"
                                icon={<PlusCircle />}
                                label="Create Schema"
                                type="submit"
                            />
                            <Button
                                variant="Large"
                                icon={<PlusCircle />}
                                label="Create Empty Graph"
                                onClick={handelCreateEmptyGraph}
                            />
                        </div>
                    </form>
                )
        }
    }

    return (
        <div className="flex flex-col h-full w-full gap-4">
            <Header inCreate />
            <div className="grow flex flex-col p-8 gap-8">
                <h1 className="text-2xl font-medium">Create New Graph</h1>
                <div className="grow flex flex-col gap-16 p-6">
                    <div className="flex flex-col">
                        <div className="bg-[#2C2C4C] p-4 rounded-xl flex flex-row gap-8 justify-center">
                            <p className={(currentTab || "data") === "data" ? "text-[#7167F6]" : "text-[#57577B]"}>Add Data</p>
                            <ChevronRight color="#57577B" />
                            <p className={currentTab === "schema" ? "text-[#7167F6]" : "text-[#57577B]"}>Schema</p>
                            <ChevronRight color="#57577B" />
                            <p className={currentTab === "graph" ? "text-[#7167F6]" : "text-[#57577B]"}>Knowledge Graph</p>
                        </div>
                    </div>
                    {getCurrentTab()}
                </div>
            </div>
        </div>
    )
}