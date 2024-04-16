import { Query } from "./query"
import { QueryState } from "./page"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MetaDataView from "./metadataview"
import GraphView, { GraphViewRef } from "./GraphView"
import { TableView } from "./tableview"
import { useEffect, useRef, useState } from "react"
import { Graph } from "./model"
import { useTheme } from "next-themes"

export const QuerySection = ({ onSubmit, onDelete, queryState }: {
    onSubmit: (e: React.FormEvent<HTMLElement>, queryState: QueryState) => Promise<any>,
    onDelete: (graphName: string) => void,
    queryState: QueryState,
}) => {

    const [graph, setGraph] = useState<Graph>(Graph.create(queryState.graphName, queryState.data))
    const [value, setValue] = useState<string>()
    const [metadata, setMetadata] = useState<string[]>(queryState.data.metadata)
    const graphView = useRef<GraphViewRef>(null)
    const showGraph = graph.Elements && graph.Elements.length > 0
    const showTable = graph.Data && graph.Data.length > 0
    const { theme, systemTheme } = useTheme()
    const darkmode = theme === "dark" || (theme === "system" && systemTheme === "dark")
    useEffect(() => {
        if (showGraph) {
            setValue("graph")
        } else if (showTable) {
            setValue("table")
        }
    }, [showTable, showGraph])

    const handelSubmit = async (e: React.FormEvent<HTMLElement>, state: QueryState) => {
        const data = await onSubmit(e, state)
        setGraph(Graph.create(state.graphName, data))
        setMetadata(data.metadata)
        graphView.current?.expand(graph.Elements)
    }

    return (
        <div className="h-full flex flex-col gap-y-2">
            <Query
                queryState={queryState}
                onSubmit={handelSubmit}
                onDelete={onDelete}
                className="border rounded-lg border-gray-300 p-2"
            />
            {
                graph.Id &&
                <>
                    <div className="grow border flex flex-col border-gray-300 rounded-lg p-2">
                        {
                            (showTable || showGraph) &&
                            <Tabs value={value} className="h-1 grow flex flex-row">
                                <div className="w-20 flex flex-row items-center">
                                    <TabsList className="h-fit flex flex-col p-0">
                                        {showGraph && <TabsTrigger className="w-full" value="graph" onClick={() => setValue("graph")}>Graph</TabsTrigger>}
                                        {showTable && <TabsTrigger className="w-full" value="table" onClick={() => setValue("table")}>Table</TabsTrigger>}
                                    </TabsList>
                                </div>
                                <TabsContent value="table" className="w-1 grow overflow-auto">
                                    <TableView graph={graph} />
                                </TabsContent>
                                <TabsContent value="graph" className="w-1 grow">
                                    <GraphView ref={graphView} graph={graph} darkmode={darkmode} />
                                </TabsContent>
                            </Tabs>
                        }
                    </div>
                    <div>
                        <MetaDataView metadata={metadata} />
                    </div>
                </>
            }
        </div>
    )
} 