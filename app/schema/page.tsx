'use client'

import { useCallback, useEffect, useState } from "react";
import { defaultQuery, prepareArg, securedFetch } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import Header from "../components/Header";
import SchemaView from "./SchemaView";
import { Graph } from "../api/graph/model";

const Selector = dynamic(() => import("../graph/Selector"), { ssr: false })

export default function Page() {

    const [schemaName, setSchemaName] = useState<string>("")
    const [schema, setSchema] = useState<Graph>(Graph.empty())
    const [edgesCount, setEdgesCount] = useState<number>(0)
    const [nodesCount, setNodesCount] = useState<number>(0)
    const [schemaNames, setSchemaNames] = useState<string[]>([])
    const { data: session } = useSession()
    const { toast } = useToast()

    const fetchCount = useCallback(async () => {
        const name = `${schemaName}_schema`
        const q1 = "MATCH (n) RETURN COUNT(n) as nodes"
        const q2 = "MATCH ()-[e]->() RETURN COUNT(e) as edges"

        const nodes = await (await securedFetch(`api/graph/${prepareArg(name)}/?query=${q1}`, {
            method: "GET"
        }, toast)).json()

        const edges = await (await securedFetch(`api/graph/${prepareArg(name)}/?query=${q2}`, {
            method: "GET"
        }, toast)).json()

        if (!edges || !nodes) return

        setEdgesCount(edges.result?.data[0].edges)
        setNodesCount(nodes.result?.data[0].nodes)
    }, [schemaName, toast])

    useEffect(() => {
        if (!schemaName) return
        const run = async () => {
            const result = await securedFetch(`/api/graph/${prepareArg(schemaName)}_schema/?query=${prepareArg(defaultQuery())}`, {
                method: "GET"
            }, toast)
            if (!result.ok) return
            const json = await result.json()
            const colors = localStorage.getItem(schemaName)?.split(/[[\]",]/).filter(c => c)
            setSchema(Graph.create(schemaName, json.result, false, true, colors))

            fetchCount()

        }
        run()
    }, [fetchCount, schemaName, toast])

    return (
        <div className="Page">
            <Header onSetGraphName={setSchemaName} graphNames={schemaNames} />
            <div className="h-1 grow p-8 px-10 flex flex-col gap-8">
                <Selector
                    setGraphName={setSchemaName}
                    edgesCount={edgesCount}
                    nodesCount={nodesCount}
                    graphName={schemaName}
                    options={schemaNames}
                    setOptions={setSchemaNames}
                    graph={schema}
                    setGraph={setSchema}
                    data={session}
                />
                <SchemaView schema={schema} fetchCount={fetchCount} />
            </div>
        </div>
    )
}