import { GraphCanvas, GraphCanvasRef, darkTheme } from "reagraph";
import { useTheme } from "next-themes";
import { useRef } from "react";
import { Graph } from "./model";
import Toolbar from "./Toolbar";

export default function GraphView({ graph }: { graph: Graph }) {

    const { theme, systemTheme } = useTheme()
    const darkmode = theme === "dark" || (theme === "system" && systemTheme === "dark")

    // A reference to the chart container to allowing zooming and editing
    const chartRef = useRef<GraphCanvasRef | null>(null)

    return (
        <div className="h-full flex flex-col space-y-20">

            <div className="grid grid-cols-6 h-10">
                <Toolbar className="col-start-1 justify-start" chartRef={chartRef} />
                {/* <Labels className="col-end-7 justify-end" categories={graph.Categories} onClick={onCategoryClick} /> */}
            </div>
            <div className="fixed w-[88.5%] h-[80%]">
                <GraphCanvas
                    ref={chartRef}
                    // cy={(cy) => {
                    //     chartRef.current = cy

                    //     // Make sure no previous listeners are attached
                    //     cy.removeAllListeners();

                    //     // Listen to the click event on nodes for expanding the node
                    //     cy.on('dbltap', 'node', async (evt) => {
                    //         const node: Node = evt.target.json().data;
                    //         const elements = await onFetchNode(node);

                    //         // adjust entire graph.
                    //         if (elements.length > 0) {
                    //             cy.add(elements);
                    //             cy.elements().layout(LAYOUT).run();
                    //         }
                    //     });
                    // }}
                    // stylesheet={STYLESHEET}
                    draggable
                    // animated
                    nodes={graph.Nodes}
                    edges={graph.Edges}
                    theme={darkmode ? darkTheme : undefined}
                // layout={LAYOUT}
                />
            </div>
        </div>
    )
}