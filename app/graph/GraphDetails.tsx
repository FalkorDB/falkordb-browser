import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useContext } from "react"
import { Info } from "lucide-react"
import { Graph } from "../api/graph/model"
import { LimitContext } from "../components/provider"

export default function GraphDetails({
    graph,
    tabsValue = "Graph",
    nodesCount,
    edgesCount
}: {
    graph: Graph,
    nodesCount: number,
    edgesCount: number,
    tabsValue?: string,
}) {
    const { limit } = useContext(LimitContext)

    return (
        <div className="w-1 grow flex flex-col gap-4">
            {
                graph.CurrentLimit && graph.Data.length >= limit ?
                    <div className="flex gap-2 items-center text-orange-300">
                        <Info />
                        <p>
                            Data currently limited to {graph.Data.length} rows
                        </p>
                    </div>
                    : null
            }
            {
                graph.CurrentLimit && graph.CurrentLimit !== limit ?
                    <div className="flex gap-2 items-center text-orange-300">
                        <Info />
                        <p>
                            Rerun the query to apply the new limit.
                        </p>
                    </div>
                    : null
            }
            <div className="flex gap-4 overflow-hidden">
                {
                    graph.Id && tabsValue === "Graph" &&
                    [["Nodes", nodesCount, "nodesCount"], ["Edges", edgesCount, "edgesCount"], ["GraphName", graph.Id, "graphName"]].map(([label, value, testId]) => (
                        <div className="flex gap-2 overflow-hidden w-1 grow max-w-fit" key={label}>
                            <p>
                                {label}:
                            </p>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p
                                        data-testid={testId}
                                        className="Gradient bg-clip-text text-transparent truncate pointer-events-auto"
                                    >
                                        {value}
                                    </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {value}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    ))
                }
            </div >
        </div>
    )
}

GraphDetails.defaultProps = {
    tabsValue: "Graph",
}