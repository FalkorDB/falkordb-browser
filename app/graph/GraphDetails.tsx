import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useContext } from "react"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Graph } from "../api/graph/model"
import { QuerySettingsContext } from "../components/provider"

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
    const {
        settings: {
            limitSettings: { limit },
        }
    } = useContext(QuerySettingsContext)

    return (
        <div className="w-1 grow flex flex-col gap-4 p-1">
            {
                graph.CurrentLimit && graph.Data.length >= graph.CurrentLimit ?
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex gap-2 items-center text-orange-300">
                                <Info />
                                <p className="truncate">
                                    Data currently limited to {graph.Data.length} rows
                                </p>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            Data currently limited to {graph.Data.length} rows
                        </TooltipContent>
                    </Tooltip>
                    : null
            }
            {
                graph.CurrentLimit && graph.CurrentLimit !== limit ?
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex gap-2 items-center text-orange-300">
                                <Info />
                                <p className="truncate">
                                    Rerun the query to apply the new limit.
                                </p>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            Rerun the query to apply the new limit.
                        </TooltipContent>
                    </Tooltip>
                    : null
            }
            {
                graph.Id && tabsValue === "Graph" &&
                <div className="flex gap-4 overflow-hidden">
                    {
                        [["Nodes", nodesCount, "nodesCount"], ["Edges", edgesCount, "edgesCount"], ["GraphName", graph.Id, "graphName"]].map(([label, value, testId]) => (
                            <div className="flex gap-2 overflow-hidden w-1 grow max-w-fit" key={label}>
                                <p>
                                    {label}:
                                </p>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p
                                            data-testid={testId}
                                            className={cn("truncate pointer-events-auto", label === "GraphName" && "Gradient bg-clip-text text-transparent")}
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
            }
        </div>
    )
}

GraphDetails.defaultProps = {
    tabsValue: "Graph",
}