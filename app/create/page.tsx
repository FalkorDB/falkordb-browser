'use client'

import { AlertCircle, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import useSWR from "swr";
import Header from "../graph/Header";
import { Graph } from "../graph/model";
import Input from "../components/Input";
import Button from "../components/Button";
import GraphView from "../graph/GraphView";
import SchemaView from "../graph/SchemaView";
import Dropzone from "../components/Dropzone";

const prepareArg = (arg: string) => encodeURIComponent(arg.trim())

type CurrentTab = "loadSchema" | "schema" | "graph"

export default function Create() {

    const [currentTab, setCurrentTab] = useState<CurrentTab | null>("schema")
    const [schema, setSchema] = useState<Graph>(Graph.empty())
    const [ID, setID] = useState()
    const [files, setFiles] = useState<File[]>([])
    const [filesPath, setFilesPath] = useState<string[]>()
    const [nodesCount, setNodesCount] = useState<number>(0)
    const [edgesCount, setEdgesCount] = useState<string[]>([])
    const [graphName, setGraphName] = useState<string>("")
    const [progress, setProgress] = useState<number>(0)
    const [openaiKey, setOpenaiKey] = useState<string>("")
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        const run = async () => {

            if (currentTab !== "graph") return
            const q = "MATCH (n) WITH Count(n) as nodes MATCH ()-[e]-() return nodes, Count(e) as edges"
            const result = await fetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q)}`, {
                method: "GET",
            })

            if (!result.ok) {
                toast({
                    title: "Error",
                    description: "Something went wrong"
                })
                return
            }

            const json = await result.json()

            const data = json.result.data[0]
            setNodesCount(data.nodes)
            setEdgesCount(data.edges)
        }
        run()
    }, [graphName, toast])

    useEffect(() => {
        if (!filesPath) return

        const run = async () => {
            const result = await fetch(`api/graph/${prepareArg(graphName)}/?type=detect_schema&key=${prepareArg(openaiKey)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(filesPath)
            })


            if (!result.ok) {
                toast({
                    title: "Error",
                    description: "Create Schema Failed"
                })
                setProgress(0)
                setCurrentTab(null)
            }
            const json = await result.json()

            setID(json.ID)
        }

        run()
    }, [filesPath, toast])

    useEffect(() => {
        if (progress !== 100) return

        const run = async () => {
            const q = "MATCH (n)-[e]-(m) RETURN n,e,m"

            const result = await fetch(`api/graph/${prepareArg(graphName)}_schema/?query=${prepareArg(q)}`, {
                method: "GET"
            })

            if (!result.ok) {
                toast({
                    title: "Error",
                    description: "Something went wrong"
                })
                setProgress(0)
                setCurrentTab(null)
                return
            }

            const json = await result.json()

            if (!json.result.data.length) {
                toast({
                    title: "Error",
                    description: "Something went wrong"
                })
                setProgress(0)
                setCurrentTab(null)
                return
            }

            setProgress(0)
            setSchema(Graph.create(`${graphName}-schema`, json.result))
            setCurrentTab("schema")
        }
        run()
    }, [progress, toast])

    const fetcher = async (url: string) => {

        const result = await fetch(url, {
            method: "GET",
        })

        if (!result.ok) {
            toast({
                title: "Error",
                description: "Something went wrong"
            })
            return
        }

        const json = await result.json()

        setProgress(prev => prev + json.progress)
    }

    useSWR((currentTab === "loadSchema" && progress < 100) && `api/graph/${graphName}/?ID=${ID}`, fetcher, { refreshInterval: 2500 })

    const handleCreateSchema = async (e: FormEvent) => {

        e.preventDefault()

        setCurrentTab("loadSchema")

        if (!files) return

        const newFilesPath = await Promise.all(files.map(async (file) => {
            const formData = new FormData();

            formData.append("file", file);

            const result = await fetch(`api/upload`, {
                method: "POST",
                body: formData
            });

            if (!result.ok) {
                toast({
                    title: "Error",
                    description: "Something went wrong"
                });
                return "";
            }

            const json = await result.json();

            return json.path
        }))

        setFilesPath(newFilesPath)

    }

    const handleCreateGraph = async () => {

        const result = await fetch(`api/graph/${prepareArg(graphName)}/?type=populate_kg/?key=${openaiKey}`, {
            method: "POST",
            body: JSON.stringify(filesPath)
        })

        if (!result.ok) {
            toast({
                title: "Error",
                description: "Something went wrong"
            })
            return
        }
        setCurrentTab("graph")
    }

    const handelGoToMain = () => {
        router.push("/graph")
    }

    const onDelete = () => {

    }

    const onAddEntity = () => {
        setSchema(prev => {
            const p = prev
            p.Elements = [...p.Elements, { data: { id: "-1" } }]
            return p
        })
    }

    const onAddRelation = () => {
        schema.Elements = [...schema.Elements, { data: { id: "number" } }]
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
                        <SchemaView schema={schema} onAddEntity={onAddEntity} onAddRelation={onAddRelation} onDelete={onDelete} />
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
            case "graph":
                return (
                    <div className="grow flex flex-col gap-8">
                        <div className="p-4 bg-[#2C2C4C] text-[#FFFFFF] flex flex-row gap-12 items-center rounded-lg">
                            <span >Created on 2/2 24</span>
                            <span><span>{nodesCount}</span>&emsp;Nodes</span>
                            <p className="text-[#57577B]">|</p>
                            <span><span>{edgesCount}</span>&emsp;Edges</span>
                        </div>
                        <GraphView graphName={graphName} />
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
                                onClick={handelGoToMain}
                            />
                        </div>
                    </div>
                )
            default:
                return (
                    <form onSubmit={(e) => handleCreateSchema(e)} className="grow flex flex-col gap-8">
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
                            <Dropzone className="grow" withTable onFileDrop={setFiles} />
                        </div>
                        <div className="flex flex-row justify-end">
                            <Button
                                variant="Large"
                                icon={<PlusCircle />}
                                label="Create Schema"
                                type="submit"
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