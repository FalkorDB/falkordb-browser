'use client'

import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import Dropzone from "@/components/custom/Dropzone";
import CytoscapeComponent from "react-cytoscapejs";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { EdgeDataDefinition, EventObject, NodeDataDefinition } from "cytoscape";
import Header from "../graph/Header";
import Toolbar from "../graph/toolbar";
import { Graph } from "../graph/model";

type CurrentTab = "data" | "schema" | "graph"

export default function Create() {

    const [currentTab, setCurrentTab] = useState<CurrentTab>("data")
    const [selectedElement, setSelectedElement] = useState<NodeDataDefinition | EdgeDataDefinition>()
    const schemaRef = useRef<cytoscape.Core | null>(null)
    const graphRef = useRef<cytoscape.Core | null>(null)
    const [schema, setSchema] = useState<Graph>(Graph.empty())
    const [graph, setGraph] = useState<Graph>(Graph.empty())
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [files, setFiles] = useState<File[]>([])
    const [graphName, setGraphName] = useState<string>("")
    // const [openAIKey, setOpenAIKey] = useState<string>("")
    const { toast } = useToast()
    const router = useRouter()

    const handleCreateSchema = async () => {
        setCurrentTab("schema")

        const result = await fetch(`api/graph/${graphName}/schema`, {
            method: "GET"
        })

        if (!result.ok) {
            toast({
                title: "Error",
                description: "Something went wrong"
            })
            return
        }

        const json = await result.json()

        setSchema(Graph.create(graphName, json.result))
    }

    const handleCreateGraph = async () => {
        setCurrentTab("graph")

        const result = await fetch(`api/graph/${graphName}/schema`, {
            method: "GET"
        })

        if (!result.ok) {
            toast({
                title: "Error",
                description: "Something went wrong"
            })
            return
        }

        const json = await result.json()

        setGraph(Graph.create(graphName, json.result))
    }

    const onFileDrop = (acceptedFiles: File[]) => {
        setFiles(acceptedFiles)
    }

    const handelTap = (evt: EventObject) =>
        setSelectedElement(evt.target.json().data)

    const onDelete = async (type: "schema" | "graph") => {
        const id = selectedElement?.id
        const q = `MATCH (n) WHERE ID(n) = ${id} delete n`
        const success = (await fetch(`api/graph/${type === "schema" ? schema.Id : graph.Id}/?query=${q}`)).ok
        if (!success) return
        if (type === "schema") {
            schema.Elements = schema.Elements.filter(element => element.data.id !== id)
        }else {
            graph.Elements = graph.Elements.filter(element => element.data.id !== id)
        }
    }

    const getCurrentTab = () => {
        switch (currentTab) {
            case "schema":
                return (
                    <>
                        <div className="grow flex flex-col shadow-lg ring-offset-white rounded-xl p-8">
                            <Toolbar
                                chartRef={schemaRef}
                                onDelete={() => onDelete("schema")}
                                deleteDisable={!schema.Id}
                            />
                            <CytoscapeComponent
                                className="grow"
                                elements={schema.Elements}
                                cy={(cy) => {

                                    schemaRef.current = cy

                                    cy.removeAllListeners()

                                    cy.on('tap', 'node', handelTap)

                                    cy.on('tap', 'edge', handelTap)
                                }}
                            />
                        </div>
                        <div className="flex flex-row justify-end gap-16">
                            <button
                                className="flex flex-row gap-1 items-center"
                                title="Back"
                                type="button"
                                onClick={() => setCurrentTab("data")}
                            >
                                <ChevronLeft size={15} className="text-indigo-600" />
                                <p className="text-indigo-600">back</p>
                            </button>
                            <button
                                className="w-96 bg-indigo-600 p-4"
                                title="Create Graph"
                                type="button"
                                onClick={() => handleCreateGraph()}
                            >
                                <p className="text-white">CREATE GRAPH</p>
                            </button>
                        </div>
                    </>
                )
            case "graph":
                return (
                    <div className="grow flex flex-col gap-4">
                        <div className="space-x-12 flex flex-row items-center shadow-lg ring-offset-white p-6 rounded-xl">
                            <span className="text-gray-400">Created on 2/2 24</span>
                            <span className="text-slate-700 opacity-60">12 Data sources &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; 2,542 Nodes &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; 1,600 connections</span>
                        </div>
                        <div className="grow flex flex-col shadow-lg ring-offset-white rounded-xl p-8">
                            <Toolbar
                                chartRef={graphRef}
                                onDelete={() => onDelete("graph")}
                                deleteDisable={!selectedElement?.id}
                            />
                            <CytoscapeComponent
                                className="grow"
                                elements={graph.Elements}
                                cy={(cy) => {
                                    graphRef.current = cy
                                }}
                            />
                        </div>
                        <div className="flex flex-row justify-end gap-16">
                            <button
                                className="flex flex-row gap-1 items-center"
                                title="Back"
                                type="button"
                                onClick={() => setCurrentTab("schema")}
                            >
                                <ChevronLeft size={15} className="bg-indigo-600" />
                                <p className="text-indigo-600">back</p>
                            </button>
                            <button
                                className="w-96 p-4 bg-indigo-600 text-white disabled:bg-[#E3EDF7] disabled:text-black"
                                title="Main Screen"
                                type="button"
                                onClick={() => router.push("/graph")}
                            // disabled
                            >
                                <p>Go To Main Screen</p>
                            </button>
                        </div>
                    </div>
                )
            default:
                return (
                    <div className="grow flex flex-col gap-4 ">
                        <div className="grow flex flex-col gap-6 shadow-lg rounded-xl p-4">
                            <div className="flex flex-col gap-2">
                                <p>Graph Name</p>
                                <input
                                    className="w-1/2 border border-gray-200"
                                    title="GraphName"
                                    type="text"
                                    onChange={(e) => setGraphName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-row gap-6">
                                <h1>Files</h1>
                                <p>URLs</p>
                                <p>Link DB</p>
                                <p>Amzon S3/GCP</p>
                            </div>
                            <Dropzone inCreate onFileDrop={onFileDrop} />
                            <div className="flex flex-col gap-2">
                                <p className="flex flex-row gap-2 items-center">OpenAI Key <AlertCircle size={15} /></p>
                                <input
                                    className="w-1/2 border border-gray-200"
                                    title="OpenAI Key"
                                    type="text"
                                // onChange={(e) => setOpenAIKey(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-row justify-end">
                            <button
                                className="w-96 bg-indigo-600 p-4"
                                title="Create Schema"
                                type="button"
                                onClick={() => handleCreateSchema()}
                            >
                                <p className="text-white">CREATE SCHEMA</p>
                            </button>
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className="flex flex-col gap-4 h-full w-full">
            <Header inCreate />
            <div className="grow flex flex-col gap-8 p-8">
                <div className="flex flex-col gap-4">
                    <h1 className="text-2xl font-medium">Create New Graph</h1>
                    <div className="p-4 shadow-lg rounded-xl flex flex-row gap-8 justify-center">
                        <p className={currentTab === "data" ? "text-indigo-600" : "text-slate-700 opacity-60"}>Add Data</p>
                        <ChevronRight />
                        <p className={currentTab === "schema" ? "text-indigo-600" : "text-slate-700 opacity-60"}>Schema</p>
                        <ChevronRight />
                        <p className={currentTab === "graph" ? "text-indigo-600" : "text-slate-700 opacity-60"}>Knowledge Graph</p>
                    </div>
                </div>
                {getCurrentTab()}
            </div>
        </div>
    )
}