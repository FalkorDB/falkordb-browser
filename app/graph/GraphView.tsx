"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { securedFetch } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { forwardRef, useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { GraphCanvas, GraphCanvasRef, GraphEdge, GraphNode, darkTheme } from "reagraph";
import DataPanel from "./DataPanel";
import Labels from "./labels";
import { Category, Elements, Graph, getCategoryByColorName } from "./model";
import Toolbar from "./toolbar";

interface GraphViewProps {
    graph: Graph,
    darkmode: boolean
}

const GraphView = forwardRef(({ graph, darkmode }: GraphViewProps) => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedObject, setSelectedObject] = useState<any | null>(null);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

    // A reference to the chart container to allowing zooming and editing
    const chartRef = useRef<GraphCanvasRef>(null)
    const dataPanel = useRef<ImperativePanelHandle>(null)

    const onExpand = () => {
        if (dataPanel.current) {
            if (dataPanel.current.isCollapsed()) {
                dataPanel.current.expand()
            } else {
                dataPanel.current.collapse()
            }
        }
    }

    // Send the user query to the server to expand a node
    async function onFetchNode(node: GraphNode) {
        const result = await securedFetch(`/api/graph/${graph.Id}/${node.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (result.ok) {
            const json = await result.json()
            const elements = graph.extend(json.result)
            return elements

        }
        return [[], []] as Elements


    }

    const onCategoryClick = (category: Category) => {
        const chart = chartRef.current
        if (chart) {

            // eslint-disable-next-line no-param-reassign
            category.show = !category.show

            if (category.show) {
                // eslint-disable-next-line no-param-reassign
                graph.addNodes = graph.Elements[0].filter((node) => node.fill && getCategoryByColorName(node.fill) === category.index)
            } else {
                // eslint-disable-next-line no-param-reassign
                graph.removeNodes = graph.Nodes.filter((node) => node.fill && getCategoryByColorName(node.fill) !== category.index)
            }
        }
    }

    const handleDoubleClick = async (node: GraphNode) => {
        const elements = await onFetchNode(node);

        // adjust entire graph.
        if (elements.length > 0) {
            // eslint-disable-next-line no-param-reassign
            graph.addNodes = [...elements[0]]
            // eslint-disable-next-line no-param-reassign
            graph.addNodes = [...elements[1]]
        }
    }

    const handleTap = (object: (GraphNode | GraphEdge)) => {
        setSelectedObject(object);
        dataPanel.current?.expand()
    }

    return (
        <ResizablePanelGroup className="relative" direction="horizontal">
            <ResizablePanel defaultSize={selectedObject ? 80 : 100} className="h-full flex flex-col">
                <div className="flex flex-row justify-between">
                    <Toolbar className="" chartRef={chartRef} />
                    <Labels className="pr-16" categories={graph.Categories} onClick={onCategoryClick} />
                </div>
                <GraphCanvas
                    ref={chartRef}
                    nodes={[{id: "1", label: "Rider", fill: "#f43f5e"}, {id: "2", label: "Team"}]}
                    edges={[{id: "1-2", source: "1", target: "2", label: "ride"}]}
                    onEdgeClick={handleTap} 
                    onNodeClick={handleTap}
                    onNodeDoubleClick={handleDoubleClick}
                    theme={darkmode ? darkTheme : undefined}
                    />
            </ResizablePanel>
            <ResizableHandle />
            {
                selectedObject &&
                <button title={isCollapsed ? "open" : "close"} type="button" onClick={() => onExpand()} className="absolute top-1/2 right-0 transform -translate-y-1/2">
                    {!isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </button>
            }
            <ResizablePanel
                id="panel"
                ref={dataPanel}
                maxSize={50}
                minSize={20}
                onCollapse={() => { setIsCollapsed(true) }}
                onExpand={() => { setIsCollapsed(false) }}
                collapsible
                defaultSize={selectedObject ? 20 : 0}
                className="bg-gray-100 dark:bg-gray-800"
            >
                {selectedObject && <DataPanel object={selectedObject} />}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
});

GraphView.displayName = "GraphView";

export default GraphView;