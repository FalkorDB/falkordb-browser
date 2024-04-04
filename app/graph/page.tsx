'use client'

import { toast } from "@/components/ui/use-toast";
import { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Query, QueryState } from "./query";
import { TableView } from "./tableview";
import MetaDataView from "./metadataview";
import { Graph } from "./model";
import GraphView,  { GraphViewRef } from "./GraphView";



// Validate the graph selection is not empty and show an error message if it is
function validateGraphSelection(graphName: string): boolean {
    if (!graphName) {
        toast({
            title: "Error",
            description: "Please select a graph from the list",
        });
        return false;
    }
    return true;
}

export default function Page() {
    const [graph, setGraph] = useState(Graph.empty());
    const [metaData, setMetaData] = useState<string[]>([]);
    const [showGraph, setShowGraph] = useState<boolean>(true);

    const graphView = useRef<GraphViewRef>(null)


    // A reference to the query state to allow running the user query
    const queryState = useRef<QueryState | null>(null)

    const { theme, systemTheme } = useTheme()
    const darkmode = theme === "dark" || (theme === "system" && systemTheme === "dark")

    function prepareArg(arg: string): string {
        return encodeURIComponent(arg.trim())
    }

    const runQuery = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const state = queryState.current;
        if (!state) {
            return
        }

        // Proposed abstraction for improved modularity
        if (!validateGraphSelection(state.graphName)) return;

        const q = state.query.trim() || "MATCH (n)-[e]-() RETURN n,e limit 100";

        const result = await fetch(`/api/graph?graph=${prepareArg(state.graphName)}&query=${prepareArg(q)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (result.status >= 300) {
            toast({
                title: "Error",
                description: result.text(),
            })
            if (result.status >= 400 && result.status < 500) {
                signOut({ callbackUrl: '/login' })
            }
            return
        }

        const json = await result.json()
        const newGraph = Graph.create(state.graphName, json.result)
        setGraph(newGraph)
        setMetaData(json.result.metadata)
        setShowGraph((!!json.result.data && json.result.data.length > 0))

        graphView.current?.expand(newGraph.Elements)
    }

    return (
        <div className="h-full flex flex-col p-2 gap-y-2">
            <Query className="border rounded-lg border-gray-300 p-2" onSubmit={runQuery} onQueryUpdate={(state) => { queryState.current = state }} />
            <div className="flex flex-col grow border border-gray-300 rounded-lg p-2 overflow-auto">
                {
                    graph.Id &&
                    <Tabs defaultValue={showGraph ? "graph" : "metaData"} className="grow flex flex-col justify-center items-center">
                        <TabsList className="border w-fit">
                            <TabsTrigger value="metaData">MetaData</TabsTrigger>
                            {showGraph && <TabsTrigger value="data">Data</TabsTrigger>}
                            {showGraph && <TabsTrigger value="graph">Graph</TabsTrigger>}
                        </TabsList>
                        <TabsContent value="metaData" className="grow w-full">
                            <MetaDataView metadata={metaData} />
                        </TabsContent>
                        <TabsContent value="data" className="grow w-full flex-[1_1_0] overflow-auto">
                            <TableView graph={graph} />
                        </TabsContent>
                        <TabsContent value="graph" className="grow w-full">
                            <GraphView ref={graphView} graph={graph} darkmode={darkmode} />
                        </TabsContent>
                    </Tabs>
                }
            </div>
        </div>
    )
}
