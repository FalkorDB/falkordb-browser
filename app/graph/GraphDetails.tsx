import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useContext } from "react"
import { Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Graph } from "../api/graph/model"
import { QuerySettingsContext } from "../components/provider"

export default function GraphDetails({
    graph,
    graphName,
    tabsValue = "Graph",
    edgesCount = -1,
    nodesCount = -1,
}: {
    graph: Graph,
    graphName?: string,
    nodesCount?: number,
    edgesCount?: number,
    tabsValue?: string,
}) {
    const {
        settings: {
            limitSettings: { limit, lastLimit },
        }
    } = useContext(QuerySettingsContext)

    // Check if any content should be displayed
    const hasLimitWarning = graph.CurrentLimit && graph.Data.length >= graph.CurrentLimit
    const hasLimitChangeWarning = graph.CurrentLimit && lastLimit !== limit
    const hasGraphDetails = graph.Id && tabsValue === "Graph" && graphName !== undefined && nodesCount !== -1 && edgesCount !== -1

    if (!hasLimitWarning && !hasLimitChangeWarning && !hasGraphDetails) {
        return null
    }

    return (
        <div className="flex flex-col gap-4 p-1">
            {
                hasLimitWarning ?
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
                hasLimitChangeWarning ?
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
                hasGraphDetails &&
                <div className="flex gap-4 overflow-hidden">
                    {
                        [["Nodes", nodesCount, "nodesCount"], ["Edges", edgesCount, "edgesCount"], ["GraphName", graphName, "graphName"]].map(([label, value, testId]) => (
                            <div className="flex gap-2 overflow-hidden w-1 grow max-w-fit" key={label}>
                                <p>
                                    {label}:
                                </p>
                                {
                                    value !== undefined ?
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
                                        :
                                        <Loader2 className="animate-spin" />
                                }
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
    nodesCount: -1,
    edgesCount: -1,
    graphName: undefined,
}