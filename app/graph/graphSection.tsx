import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// eslint-disable-next-line import/no-extraneous-dependencies
import { GraphEdge, GraphNode } from "reagraph"
import SectionQuery, { QueryState } from "./sectionQuery"
import MetaDataView from "./metadataview"
// eslint-disable-next-line import/no-cycle
import GraphView from "./GraphView"
// eslint-disable-next-line import/no-cycle
import { TableView } from "./tableview"

export interface GraphState extends QueryState{
    id: number,
    nodes: GraphNode[],
    edges: GraphEdge[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: any
}

export default function GraphSection({ onSubmit, graphState }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubmit: (e: React.FormEvent<HTMLElement>, graphName: string, query: string) => Promise<GraphState>,
    graphState: GraphState,
}) {

    const [graph, setGraph] = useState<GraphState>(graphState)
    const [value, setValue] = useState<string>()
    const [metadata, setMetadata] = useState<string[]>(graphState.data.metadata)
    const showGraph = graph.nodes && graph.edges
    const showTable = graph.data && graph.data.length > 0

    useEffect(() => {
        if (showGraph) {
            setValue("graph")
        } else if (showTable) {
            setValue("table")
        }
    }, [showTable, showGraph])

    const handelSubmit = async (e: React.FormEvent<HTMLElement>, graphName: string, query: string) => {
        const result = await onSubmit(e, graphName, query)
        setGraph(result)
        setMetadata(result.data.metadata)
    }

    return (
        <div className="h-full flex flex-col gap-y-2">
            <SectionQuery
                queryState={graphState}
                onSubmit={handelSubmit}
                className="border rounded-lg border-gray-300 p-2"
            />
             {
                graph.id &&
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
                                    <TableView data={graph.data} />
                                </TabsContent>
                                <TabsContent value="graph" className="w-1 grow">
                                <GraphView graph={graph} />
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