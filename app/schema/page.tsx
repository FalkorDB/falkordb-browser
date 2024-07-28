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
        }
        run()
    }, [schemaName])

    return (
        <div className="h-full w-full flex flex-col">
            <Header onSetGraphName={setSchemaName}/>
            <div className="h-1 grow p-8 px-10 flex flex-col gap-8">
                <Selector onChange={setSchemaName} graph={schema} isSchema/>
                <SchemaView schema={schema} setSchema={setSchema}/>
            </div>
        </div>
    )
}