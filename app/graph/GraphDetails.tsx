import { useContext } from "react"
import { GraphContext } from "../components/provider"

export default function GraphDetails({
    tabsValue = "Graph",
    nodesCount,
    edgesCount
}: {
    nodesCount: number,
    edgesCount: number,
    tabsValue?: string,
}) {
    const { graph } = useContext(GraphContext)

    return (
        <div className="flex gap-4">
            {
                graph.Id && tabsValue === "Graph" &&
                <>
                    <p>
                        GraphName:&nbsp;
                        <span
                            data-testid="graphName"
                            className="Gradient bg-clip-text text-transparent"
                        >
                            {graph.Id}
                        </span>
                    </p>
                    <p>
                        Nodes:&nbsp;
                        <span
                            data-testid="nodesCount"
                            className="Gradient bg-clip-text text-transparent"
                        >
                            {nodesCount}
                        </span>
                    </p>
                    <p>
                        Edges:&nbsp;
                        <span
                            data-testid="edgesCount"
                            className="Gradient bg-clip-text text-transparent"
                        >
                            {edgesCount}
                        </span>
                    </p>
                </>
            }
        </div>
    )
}

GraphDetails.defaultProps = {
    tabsValue: "Graph",
}