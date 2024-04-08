'use client'

import { toast } from "@/components/ui/use-toast";
import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Query, QueryState } from "./query";
import { TableView } from "./tableview";
import MetaDataView from "./metadataview";
import { Graph } from "./model";
import GraphView, { GraphViewRef } from "./GraphView";



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
    const [value, setValue] = useState<string>("");
    const [metaData, setMetaData] = useState<string[]>([]);
    const [showGraph, setShowGraph] = useState<boolean>(true);
    const [showData, setShowData] = useState<boolean>(true);

    useEffect(() => {
        if (showGraph) {
            setValue("graph")
        } else if (showData) {
            setValue("data")
        } else {
            setValue("metadata")
        }
    }, [showData, showGraph])
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

        const q = state.query.trim() || "MATCH (n) OPTIONAL MATCH (n)-[e]-(m) RETURN n,e,m limit 100";

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
        setMetaData(json.result.metadata)
        const newGraph = Graph.create(state.graphName, json.result)
        setGraph(newGraph)
        setShowGraph(!!newGraph.Categories && newGraph.Categories.length > 0)
        setShowData(!!newGraph.Data && newGraph.Data.length > 0)
        graphView.current?.expand(newGraph.Elements)
    }

    return (
        <div className="h-full flex flex-col p-2 gap-y-2">
            <Query
                className="border rounded-lg border-gray-300 p-2"
                onSubmit={runQuery}
                onQueryUpdate={(state) => { queryState.current = state }}
                onDeleteGraph={() => setGraph(Graph.empty())}
            />
            <div className="flex grow border border-gray-300 rounded-lg p-2 flex-[1_1_0] overflow-auto">
                {
                    graph.Id &&
                    <Tabs value={value} className="grow flex flex-row">
                        <div className="h-full w-20">
                            {
                                (showData || showGraph) &&
                                <TabsList className="border h-fit fixed top-72 flex flex-col p-0">
                                    {showGraph && <TabsTrigger className="w-full" value="graph" onClick={() => setValue("graph")}>Graph </TabsTrigger>}
                                    {showData && <TabsTrigger className="w-full" value="table" onClick={() => setValue("table")}> Table </TabsTrigger>}
                                </TabsList>
                            }
                        </div>
                            <TabsContent value="table" className="grow w-full">
                                <TableView graph={graph} />
                            </TabsContent>
                        <TabsContent value="graph" className="grow w-full max-w-[1267px]">
                            <GraphView ref={graphView} graph={graph} darkmode={darkmode} />
                        </TabsContent>
                    </Tabs>
                }
            </div>
            {
                graph.Id &&
                <div className="border rounded-md border-gray-300 p-2">
                    <MetaDataView metadata={metaData} />
                </div>
            }
        </div>
    )
}
