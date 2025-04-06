'use client'

import { useCallback, useEffect, useContext, useState } from "react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import Header from "../components/Header";
import SchemaView from "./SchemaView";
import { Graph } from "../api/graph/model";
import { IndicatorContext } from "../components/provider";

const Selector = dynamic(() => import("../graph/Selector"), { ssr: false })

export default function Page() {

    const [schemaName, setSchemaName] = useState<string>("")
    const [schema, setSchema] = useState<Graph>(Graph.empty())
    const [edgesCount, setEdgesCount] = useState<number>(0)
    const [nodesCount, setNodesCount] = useState<number>(0)
    const [schemaNames, setSchemaNames] = useState<string[]>([])
    const { data: session } = useSession()
    const { toast } = useToast()
    const { indicator, setIndicator } = useContext(IndicatorContext);

    const fetchCount = useCallback(async () => {
        const result = await securedFetch(`api/schema/${prepareArg(schemaName)}/count`, {
            method: "GET"
        }, toast, setIndicator)

        if (!result) return

        const json = await result.json()

        setEdgesCount(json.result.edges)
        setNodesCount(json.result.nodes)
    }, [schemaName, toast, setIndicator])

    useEffect(() => {
        if (!schemaName || indicator === "offline") return
        const run = async () => {
            const result = await securedFetch(`/api/schema/${prepareArg(schemaName)}`, {
                method: "GET"
            }, toast, setIndicator)
            if (!result.ok) return
            const json = await result.json()
            const colors = localStorage.getItem(schemaName)?.split(/[[\]",]/).filter(c => c)
            setSchema(Graph.create(schemaName, json.result, false, true, colors))

            fetchCount()

        }
        run()
    }, [fetchCount, schemaName, toast, setIndicator, indicator])

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