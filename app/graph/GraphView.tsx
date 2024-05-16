import CytoscapeComponent from "react-cytoscapejs";
import cytoscape, { ElementDefinition, EventObject, NodeDataDefinition } from "cytoscape";
import { useRef, useState, useImperativeHandle, forwardRef, useEffect } from "react";
import fcose from 'cytoscape-fcose';
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { ChevronLeft } from "lucide-react"
import { cn, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Category, Graph } from "./model";
import DataPanel from "./DataPanel";
import Labels from "./labels";
import Toolbar from "./toolbar";

const LAYOUT = {
    name: "fcose",
    fit: true,
    padding: 30,
}

cytoscape.use(fcose);

// The stylesheet for the graph

export interface GraphViewRef {
    expand: (elements: ElementDefinition[]) => void
}

const GraphView = forwardRef(({ graphName, className }: {
    graphName: string,
    // eslint-disable-next-line react/require-default-props
    className?: string
}, ref) => {

    const { toast } = useToast()
    const [graph, setGraph] = useState<Graph>(Graph.empty())
    const [query, setQuery] = useState<string>("")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedObject, setSelectedObject] = useState<ElementDefinition>();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

    // A reference to the chart container to allowing zooming and editing
    const chartRef = useRef<cytoscape.Core | null>(null)
    const dataPanel = useRef<ImperativePanelHandle>(null)

    useImperativeHandle(ref, () => ({
        expand: (elements: ElementDefinition[]) => {
            const chart = chartRef.current
            if (chart) {
                chart.elements().remove()
                chart.add(elements)
                chart.elements().layout(LAYOUT).run();
            }
        }
    }))

    useEffect(() => {
        dataPanel.current?.collapse()
    }, [])

    const runQuery = async () => {
        const result = await fetch(`api/graph/${encodeURIComponent(graphName)}?query=${query.trim()}`, {
            method: "GET"
        })

        if (!result.ok) {
            toast({
                title: "Error",
                description: "Something went wrong"
            })
        }

        const json = await result.json()
        setGraph(Graph.create(graphName, json.result))
    }

    const onExpand = () => {
        if (dataPanel.current) {
            const panel = dataPanel.current
            if (panel.isCollapsed()) {
                panel.expand()
            } else {
                panel.collapse()
            }
        }
    }

    // Send the user query to the server to expand a node
    const onFetchNode = async (node: NodeDataDefinition) => {
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
        return [] as ElementDefinition[]


    }

    const onCategoryClick = (category: Category) => {
        const chart = chartRef.current
        if (chart) {
            const elements = chart.elements(`node[category = "${category.name}"]`)

            // eslint-disable-next-line no-param-reassign
            category.show = !category.show

            if (category.show) {
                elements.style({ display: 'element' })
            } else {
                elements.style({ display: 'none' })
            }
            chart.elements().layout(LAYOUT).run();
        }
    }

    const handleDoubleTap = async (evt: EventObject) => {
        const node = evt.target.json().data;
        const elements = await onFetchNode(node);

        // adjust entire graph.
        if (chartRef.current && elements.length > 0) {
            chartRef.current.add(elements);
            chartRef.current.elements().layout(LAYOUT).run();
        }
    }

    const handleTap = (evt: EventObject) => {
        const object = evt.target.json().data;
        setSelectedObject(object);
        dataPanel.current?.expand()
    }

    return (
        <ResizablePanelGroup className={cn("shadow-xl rounded-xl ring-offset-white", className)} direction="horizontal">
            <ResizablePanel
                className="relative p-8 ring-4 ring-white flex flex-col gap-10 rounded-xl"
                defaultSize={100}
            >
                <Toolbar chartRef={chartRef} />
                <div className="w-full flex flex-row items-center gap-8">
                    <p>Query</p>
                    <form action={runQuery} className="grow flex flex-row">
                        <input
                            className="grow border border-[#0000001A] p-2"
                            title="Query"
                            type="text"
                            placeholder="Use Cypher Or Free Language"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button
                            className="border border-[#0000001A] text-[#47556999] p-2"
                            title="Run"
                            type="submit"
                        >
                            <p>Run</p>
                        </button>
                    </form>
                </div>
                {
                    graph.Id &&
                    <div className="relative grow">
                        <CytoscapeComponent
                            cy={(cy) => {

                                chartRef.current = cy

                                cy.removeAllListeners()

                                cy.on('tap', handleTap)
                                cy.on('dbltap', 'node', handleDoubleTap)
                            }}
                            elements={graph.Elements}
                            layout={LAYOUT}
                        />
                        <Labels className="absolute left-0 bottom-0" categories={graph.Categories} onClick={onCategoryClick} />
                    </div>
                }
                {
                    isCollapsed &&
                    <button
                        className="absolute top-0 right-0 p-4 px-6 bg-blue-800 rounded-se-xl"
                        title="Open"
                        type="button"
                        onClick={() => onExpand()}
                        aria-label="Open"
                    >
                        <ChevronLeft className="border border-white" size={20} color="white" />
                    </button>
                }
            </ResizablePanel>
            <ResizablePanel
                className="shadow-xl"
                ref={dataPanel}
                defaultSize={0}
                collapsedSize={0}
                onCollapse={() => setIsCollapsed(true)}
                onExpand={() => setIsCollapsed(false)}
            >
                {selectedObject && <DataPanel object={selectedObject} onExpand={onExpand} />}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
});

GraphView.displayName = "GraphView";

export default GraphView;