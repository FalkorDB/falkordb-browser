'use client'

import { useCallback, useEffect, useContext, useState } from "react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import SchemaView from "./SchemaView";
import { Graph } from "../api/graph/model";
import { GraphNameContext, IndicatorContext } from "../components/provider";

const Selector = dynamic(() => import("../graph/Selector"), { ssr: false })

export default function Page() {

    const [schema, setSchema] = useState<Graph>(Graph.empty())
    const [edgesCount, setEdgesCount] = useState<number>(0)
    const [nodesCount, setNodesCount] = useState<number>(0)
    const { toast } = useToast()
    const { indicator, setIndicator } = useContext(IndicatorContext);
    const { graphName: schemaName } = useContext(GraphNameContext)
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
            const schemaGraph = Graph.create(schemaName, json.result, false, true, colors)
            setSchema(schemaGraph)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.schema = schemaGraph

            fetchCount()

        }
        run()
    }, [fetchCount, schemaName, toast, setIndicator, indicator])

    return (
        <div className="Page">
            <Selector
                fetchCount={fetchCount}
            />
            <div className="h-1 grow p-12">
                <SchemaView
                    schema={schema}
                    fetchCount={fetchCount}
                    edgesCount={edgesCount}
                    nodesCount={nodesCount}
                />
            </div>
            <div className="h-4 w-full Gradient" />
        </div>
    )
}