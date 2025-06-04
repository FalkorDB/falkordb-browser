import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Graph } from "../api/graph/model"

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
    return (
        <div className="w-1 grow flex gap-4 overflow-hidden">
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
    )
}

GraphDetails.defaultProps = {
    tabsValue: "Graph",
}