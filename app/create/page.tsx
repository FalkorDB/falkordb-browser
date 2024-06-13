'use client'

import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Header from "../graph/Header";
import { Graph } from "../graph/model";
import Input from "../components/Input";
import Button from "../components/Button";
import GraphView from "../graph/GraphView";
import SchemaView from "../graph/SchemaView";
import Dropzone from "../components/Dropzone";

const prepareArg = (arg: string) => encodeURIComponent(arg.trim())

type CurrentTab = "schema" | "graph"

export default function Create() {

    const [currentTab, setCurrentTab] = useState<CurrentTab | null>()
    const [schema, setSchema] = useState<Graph>(Graph.empty())
    const [files, setFiles] = useState<File[]>([])
    const [filesPath, setFilesPath] = useState<string[]>([])
    const [nodesCount, setNodesCount] = useState<number>(0)
    const [edgesCount, setEdgesCount] = useState<string[]>([])
    const [graphName, setGraphName] = useState<string>("")
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
                toast(({
                    title: "Error",
                    description: "Something went wrong"
                }))
                return
            }

            const json = await result.json()

            const data = json.result.data[0]
            setNodesCount(data.nodes)
            setEdgesCount(data.edges)
        }
        run()
    }, [graphName])

    const handleCreateSchema = async () => {

        setFilesPath([])

        if (!files) return

        files.forEach(async (file) => {
            const formData = new FormData()

            formData.append("file", file)

            const result = await fetch(`api/upload`, {
                method: "POST",
                body: formData
            })

            if (!result.ok) {
                toast({
                    title: "Error",
                    description: "Something went wrong"
                })
                return
            }

            const json = await result.json()

            setFilesPath(prev => [...prev, json.path])
        })

        const r = await fetch(`api/graph/${prepareArg(graphName)}/?type=schema&key=${prepareArg(openaiKey)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(filesPath)
        })

        const j = await r.json()

        if (!r.ok) {
            toast({
                style: {
                    backgroundColor: "white"
                },
                title: "Error",
                description: j.message || "Create Schema Failed"
            })
        }

        const q = ` MATCH (n)-[e]-(m) return n,e,m`

        const result = await fetch(`api/graph/${prepareArg(graphName)}-schema&query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (!result.ok) {
            toast({
                title: "Error",
                description: "Create Schema Failed"
            })
        }

        setCurrentTab("schema")

        const json = await result.json()

        setSchema(Graph.create(graphName, json.result))
    }

    const handleCreateGraph = async () => {

        const result = await fetch(`api/graph/${prepareArg(graphName)}/?type=graph/?key=${openaiKey}`, {
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getCurrentTab = async () => {
        switch (currentTab) {
            case "schema":
                return (
                    <div className="flex flex-col gap-10">
                        <SchemaView schema={schema} />
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
                                className="w-1/4"
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
                    <form onSubmit={() => handleCreateSchema()} className="grow flex flex-col gap-8">
                        <div className="grow flex flex-col gap-6 p-8">
                            <div className="flex flex-col gap-2">
                                <p>Graph Name</p>
                                <Input
                                    className="w-1/2"
                                    variant="Default"
                                    title="GraphName"
                                    type="text"
                                    onChange={(e) => setGraphName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-row gap-16">
                                <h1>Files</h1>
                                <p>URLs</p>
                                <p>Link DB</p>
                                <p>Amzon S3/GCP</p>
                            </div>
                            <Dropzone withTable onFileDrop={setFiles} />
                            <div className="flex flex-col gap-2">
                                <p className="flex flex-row gap-2 items-center">OpenAI Key <AlertCircle size={15} /></p>
                                <Input
                                    className="w-1/2"
                                    variant="Default"
                                    title="OpenAI Key"
                                    type="text"
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-row justify-end">
                            <Button
                                className="w-1/4"
                                variant="Large"
                                label="Create Schema"
                                type="submit"
                            />
                        </div>
                    </form>
                )
        }
    }

    return (
        <div className="flex flex-col gap-4 h-full w-full">
            <Header inCreate />
            <div className="grow flex flex-col gap-8 p-8">
                <div className="flex flex-col gap-4">
                    <h1 className="text-2xl font-medium">Create New Graph</h1>
                    <div className="flex flex-row justify-center">
                        <div className="w-2/3 bg-[#2C2C4C] p-4 rounded-xl flex flex-row gap-8 justify-center">
                            <p className={(currentTab || "data") === "data" ? "text-[#7167F6]" : "text-[#57577B]"}>Add Data</p>
                            <ChevronRight color="#57577B" />
                            <p className={currentTab === "schema" ? "text-[#7167F6]" : "text-[#57577B]"}>Schema</p>
                            <ChevronRight color="#57577B" />
                            <p className={currentTab === "graph" ? "text-[#7167F6]" : "text-[#57577B]"}>Knowledge Graph</p>
                        </div>
                    </div>
                </div>
                {getCurrentTab()}
            </div>
        </div>
    )
}