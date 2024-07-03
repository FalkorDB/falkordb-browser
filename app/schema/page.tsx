'use client'

import { useEffect, useState } from "react";
import { Toast, prepareArg, securedFetch } from "@/lib/utils";
import Header from "../components/Header";
import Selector from "../graph/Selector";
import SchemaView from "./SchemaView";
import { Graph } from "../graph/model";

export default function Page() {

    const [schemaName, setSchemaName] = useState<string>("")
    const [schema, setSchema] = useState<Graph>(Graph.empty())

    useEffect(() => {
        if (!schemaName) return
        const run = async () => {
            const q = "MATCH (n)-[e]-(m) RETURN n, e, m"
            const result = await securedFetch(`/api/schema/${prepareArg(schemaName)}/?query=${prepareArg(q)}`, {
                method: "GET"
            })
            if (!result.ok) {
                Toast("Failed fetching schema")
                return
            }
            const json = await result.json()
            setSchema(Graph.create(schemaName, json.result))
        }
        run()
    }, [schemaName])

    return (
        <div className="h-full w-full flex flex-col">
            <Header />
            <div className="h-1 grow p-8 flex flex-col gap-8">
                <Selector inSchema onChange={setSchemaName} />
                <SchemaView schema={schema} />
            </div>
        </div>
    )
}