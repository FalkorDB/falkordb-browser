'use client'

import { useEffect, useState } from "react";
import { Toast, defaultQuery, prepareArg, securedFetch } from "@/lib/utils";
import Header from "../components/Header";
import Selector from "../graph/Selector";
import SchemaView from "./SchemaView";
import { Graph } from "../api/graph/model";

export default function Page() {

    const [schemaName, setSchemaName] = useState<string>("")
    const [schema, setSchema] = useState<Graph>(Graph.empty())
    const [edgesCount, setEdgesCount] = useState<number>(0)
    const [nodesCount, setNodesCount] = useState<number>(0)

    useEffect(() => {
        if (!schemaName) return
        const run = async () => {
            const result = await securedFetch(`/api/graph/${prepareArg(schemaName)}_schema/?query=${defaultQuery()}`, {
                method: "GET"
            })
            if (!result.ok) {
                Toast("Failed fetching schema")
                return
            }
            const json = await result.json()
            setSchema(Graph.create(schemaName, json.result))

            const name = `${schemaName}_schema`
            const q = [
                "MATCH (n) RETURN COUNT(n) as nodes",
                "MATCH ()-[e]->() RETURN COUNT(e) as edges"
            ]

            const nodes = await (await securedFetch(`api/graph/${prepareArg(name)}/?query=${q[0]}`, {
                method: "GET"
            })).json()

            const edges = await (await securedFetch(`api/graph/${prepareArg(name)}/?query=${q[1]}`, {
                method: "GET"
            })).json()

            if (!edges || !nodes) return

            setEdgesCount(edges.result?.data[0].edges)
            setNodesCount(nodes.result?.data[0].nodes)
        }
        run()
    }, [schemaName])

    return (
        <div className="h-full w-full flex flex-col">
            <Header onSetGraphName={setSchemaName} />
            <div className="h-1 grow p-8 px-10 flex flex-col gap-8">
                <Selector
                    edgesCount={edgesCount}
                    nodesCount={nodesCount}
                    setEdgesCount={setEdgesCount}
                    setNodesCount={setNodesCount}
                    onChange={setSchemaName}
                    graphName={schemaName}
                />
                <SchemaView schema={schema} setEdgesCount={setEdgesCount} setNodesCount={setNodesCount} />
            </div>
        </div>
    )
}