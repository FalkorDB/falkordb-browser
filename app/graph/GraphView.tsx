// eslint-disable-next-line import/no-extraneous-dependencies
import { GraphCanvas } from "reagraph";
import { GraphState } from "./graphSection";

export default function GraphView(graph: GraphState) {
    return (
        <GraphCanvas
            // eslint-disable-next-line react/destructuring-assignment
            nodes={graph.nodes}
            // eslint-disable-next-line react/destructuring-assignment
            edges={graph.edges}
             />
    )
}