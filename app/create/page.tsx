'use client'

import { AlertCircle, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import useSWR from "swr";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import Header from "../components/Header";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Dropzone from "../components/ui/Dropzone";

type CurrentTab = "loadSchema" | "schema" | "graph"

export default function Create() {

    const [currentTab, setCurrentTab] = useState<CurrentTab | null>()
    // const [schema, setSchema] = useState<Graph>(Graph.empty())
    const [ID, setID] = useState<undefined | string>()
    const [files, setFiles] = useState<File[]>([])
    const [filesPath, setFilesPath] = useState<string[]>()
    const [nodesCount, setNodesCount] = useState<number>(0)
    const [edgesCount, setEdgesCount] = useState<string[]>([])
    const [graphName, setGraphName] = useState<string>("")
    const [progress, setProgress] = useState<number>(0)
    const [openaiKey, setOpenaiKey] = useState<string>("")
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (progress !== 100) return
        const run = async () => {
            const q = "MATCH (n)-[e]-(m) RETURN n,e,m"

            const res = await securedFetch(`api/graph/${prepareArg(graphName)}_schema/?query=${prepareArg(q)}`, {
                method: "GET"
            }, toast)

            if (!res.ok) {
                toast({
                    title: "Error",
                    description: "Error while loading schema",
                    variant: "destructive"
                })
                setProgress(0)
                setCurrentTab(null)
                setFilesPath([])
                return
            }

            const j = await res.json()

            if (!j.result.data.length) {
                toast({
                    title: "Error",
                    description: "Error while loading schema",
                    variant: "destructive"
                })
                setProgress(0)
                setCurrentTab(null)
                setFilesPath([])
                return
            }

            setProgress(0)
            // setSchema(Graph.create(`${graphName}_schema`, j.result))
            setCurrentTab("schema")
        }
        run()
    }, [progress])

    const fetcher = async (url: string) => {

        const result = await securedFetch(url, {
            method: "GET",
        }, toast)

        if (!result.ok) {
            toast({
                title: "Error",
                description: "Error while loading schema",
                variant: "destructive"
            })
            return
        }

        const json = await result.json()

        setProgress(prev => json.progress + prev)
    }

    useSWR((currentTab === "loadSchema" && progress < 100) && ID && `api/graph/${prepareArg(graphName)}/?ID=${prepareArg(ID)}`, fetcher, { refreshInterval: 2500 })

    const handleCreateSchema = async (e: FormEvent) => {

        e.preventDefault()

        setCurrentTab("loadSchema")

        if (!files) return

        const newFilesPath = await Promise.all(files.map(async (file) => {
            const formData = new FormData();

            formData.append("file", file);

            const result = await securedFetch(`api/upload`, {
                method: "POST",
                body: formData
            }, toast);

            if (!result.ok) {
                toast({
                    title: "Error",
                    description: "Error while uploading file",
                    variant: "destructive"
                })
                return ""
            }

            const json = await result.json()

            return json.path
        }))

        setFilesPath(newFilesPath)

        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/?type=detect_schema&key=${prepareArg(openaiKey)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newFilesPath)
        }, toast)


        if (!result.ok) {
            toast({
                title: "Error",
                description: "Error while creating schema",
                variant: "destructive"
            })
            setFilesPath([])
            setProgress(0)
            setCurrentTab(null)
            return
        }

        const json = await result.json()

        setID(json.ID)
    }

    const handleCreateGraph = async () => {

        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/?type=populate_kg/?key=${prepareArg(openaiKey)}`, {
            method: "POST",
            body: JSON.stringify(filesPath)
        }, toast)

        if (!result.ok) {
            toast({
                title: "Error",
                description: "Error while creating graph",
                variant: "destructive"
            })
            return
        }
        setCurrentTab("graph")
    }

    const handleGoToMain = () => {
        router.push("/graph")
    }

    // const setLabel = async (selectedElement: ElementDataDefinition, label: string) => {

    //     const { id } = selectedElement
    //     const q = `MATCH (n) WHERE ID(n) = ${id} SET n:${label} WITH n REMOVE n:${selectedElement.category || selectedElement.label}`
    //     const { ok } = await securedFetch(`api/graph/${prepareArg(graphName)}_schema/?query=${prepareArg(q)}`, {
    //         method: "GET"
    //     })

    //     if (!ok) {
    //         return ok
    //     }

    //     schema.Elements = schema.Elements.map(e => {
    //         if (e.data.id === id) {
    //             const updatedElement = { ...e }
    //             if (updatedElement.data.label) {
    //                 updatedElement.data.label = label
    //             } else {
    //                 updatedElement.data.category = label
    //             }
    //             return updatedElement
    //         }
    //         return e
    //     })

    //     return ok
    // }

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
                        <div className="flex justify-end gap-16">
                            <Button
                                className="flex gap-1 items-center text-[#7167F6]"
                                label="Back"
                                onClick={() => setCurrentTab(null)}
                            />
                            <Button
                                variant="Primary"
                                label="Create Graph"
                                type="button"
                                onClick={() => handleCreateGraph()}
                            />
                        </div>
                    </div>
                )
            case "graph": {

                const q = "MATCH (n) WITH Count(n) as nodes MATCH ()-[e]->() return nodes, Count(e) as edges"

                securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q)}`, {
                    method: "GET",
                }, toast).then((response) => response.json()).then((json) => {
                    const data = json.result.data[0]
                    setNodesCount(data.nodes)
                    setEdgesCount(data.edges)
                }).catch(() => {
                    toast({
                        title: "Error",
                        description: "Failed to get graph metadata",
                        variant: "destructive"
                    })
                })

                return (
                    <div className="grow flex flex-col gap-8">
                        <div className="p-4 bg-[#2C2C4C] text-[#FFFFFF] flex gap-12 items-center rounded-lg">
                            <span >Created on 2/2 24</span>
                            <span><span>{nodesCount}</span>&emsp;Nodes</span>
                            <p className="text-[#57577B]">|</p>
                            <span><span>{edgesCount}</span>&emsp;Edges</span>
                        </div>
                        {/* <GraphView graphName={graphName} /> */}
                        <div className="flex justify-end gap-16">
                            <Button
                                className="flex gap-1 items-center text-[#7167F6]"
                                label="Back"
                                onClick={() => setCurrentTab("schema")}
                            >
                                <ChevronLeft size={25} />
                            </Button>
                            <Button
                                className="w-1/4"
                                variant="Primary"
                                label="Go To Main Screen"
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
                            <div className="flex gap-8">
                                <div className="flex gap-4">
                                    <p>Graph Name</p>
                                    <Input
                                        className="w-1/2"
                                        title="GraphName"
                                        type="text"
                                        onChange={(e) => setGraphName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grow flex gap-4">
                                    <p className="flex gap-2 items-center">OpenAI Key <AlertCircle size={15} /></p>
                                    <Input
                                        className="w-1/2"
                                        title="OpenAI Key"
                                        type="text"
                                        onChange={(e) => setOpenaiKey(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-16">
                                <h1>Files</h1>
                                <p>URLs</p>
                                <p>Amazon S3/GCP</p>
                            </div>
                            <Dropzone filesCount={false} withTable onFileDrop={setFiles} />
                        </div>
                        <div className="flex justify-end">
                            <Button
                                variant="Primary"
                                label="Create Schema"
                                type="submit"
                            >
                                <PlusCircle />
                            </Button>
                        </div>
                    </form>
                )
        }
    }

    return (
        <div className="flex flex-col h-full w-full gap-4">
            <Header onSetGraphName={setGraphName} />
            <div className="grow flex flex-col p-8 gap-8">
                <h1 className="text-2xl font-medium">Create New Graph</h1>
                <div className="grow flex flex-col gap-16 p-6">
                    <div className="flex flex-col">
                        <div className="bg-[#2C2C4C] p-4 rounded-xl flex gap-8 justify-center">
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