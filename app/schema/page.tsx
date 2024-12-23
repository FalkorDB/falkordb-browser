'use client'

import { useCallback, useEffect, useState } from "react";
import { Toast, defaultQuery, prepareArg, securedFetch } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Header from "../components/Header";
import Selector from "../graph/Selector";
import SchemaView from "./SchemaView";
import { Graph } from "../api/graph/model";

export default function Page() {

    const [schemaName, setSchemaName] = useState<string>("")
    const [schema, setSchema] = useState<Graph>(Graph.empty())
    const [edgesCount, setEdgesCount] = useState<number>(0)
    const [nodesCount, setNodesCount] = useState<number>(0)
    const { data: session } = useSession()

    const fetchCount = useCallback(async () => {
        const name = `${schemaName}_schema`
        const q1 = "MATCH (n) RETURN COUNT(n) as nodes"
        const q2 = "MATCH ()-[e]->() RETURN COUNT(e) as edges"

        const nodes = await (await securedFetch(`api/graph/${prepareArg(name)}/?query=${q1}&role=${session?.user.role}`, {
            method: "GET"
        })).json()

        const edges = await (await securedFetch(`api/graph/${prepareArg(name)}/?query=${q2}&role=${session?.user.role}`, {
            method: "GET"
        })).json()

        if (!edges || !nodes) return

        setEdgesCount(edges.result?.data[0].edges)
        setNodesCount(nodes.result?.data[0].nodes)
    }, [schemaName])

    useEffect(() => {
        if (!schemaName) return
        const run = async () => {
            const result = await securedFetch(`/api/graph/${prepareArg(schemaName)}_schema/?query=${defaultQuery()}&role=${session?.user.role}`, {
                method: "GET"
            })
            if (!result.ok) {
                Toast("Failed fetching schema")
                return
            }
            const json = await result.json()
            const colors = localStorage.getItem(schemaName)?.split(/[[\]",]/).filter(c => c)
            setSchema(Graph.create(schemaName, json.result, colors))
            
            fetchCount()

        }
        run()
    }, [fetchCount, schemaName])

    return (
        <div className="Page">
            <Header onSetGraphName={setSchemaName} />
            <div className="h-1 grow p-8 px-10 flex flex-col gap-8">
                <Selector
                    edgesCount={edgesCount}
                    nodesCount={nodesCount}
                    onChange={setSchemaName}
                    graphName={schemaName}
                    graph={schema}
                    setGraph={setSchema}
                    data={session}
                />
                <SchemaView schema={schema} fetchCount={fetchCount} session={session} />
            </div>
        </div>
    )
}