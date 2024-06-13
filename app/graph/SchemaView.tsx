import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import CytoscapeComponent from "react-cytoscapejs"
import { ChevronLeft } from "lucide-react"
import cytoscape, { EdgeDataDefinition, EventObject, NodeDataDefinition } from "cytoscape"
import { ImperativePanelHandle } from "react-resizable-panels"
import { useEffect, useRef, useState } from "react"
import fcose from "cytoscape-fcose";
import Toolbar from "./toolbar"
import DataPanel from "./DataPanel"
import Labels from "./labels"
import { Category, Graph } from "./model"

const LAYOUT = {
    name: "fcose",
    fit: true,
    padding: 30,
}

cytoscape.use(fcose);

function getStyle() {

    const style: cytoscape.Stylesheet[] = [
        {
            selector: "core",
            style: {
                'active-bg-size': 0,  // hide gray circle when panning
                // All of the following styles are meaningless and are specified
                // to satisfy the linter...
                'active-bg-color': 'blue',
                'active-bg-opacity': 0.3,
                "selection-box-border-color": 'blue',
                "selection-box-border-width": 0,
                "selection-box-opacity": 1,
                "selection-box-color": 'blue',
                "outside-texture-bg-color": 'blue',
                "outside-texture-bg-opacity": 1,
            },
        },
        {
            selector: "node",
            style: {
                label: "data(name)",
                "color": "white",
                "text-valign": "center",
                "text-halign": "center",
                "text-wrap": "ellipsis",
                "text-max-width": "10rem",
                shape: "ellipse",
                height: "15rem",
                width: "15rem",
                "border-width": 0.5,
                "border-color": "white",
                "border-opacity": 1,
                "background-color": "data(color)",
                "font-size": "3rem",
                "overlay-padding": "1rem",
            },
        },
        {
            selector: "node:active",
            style: {
                "overlay-opacity": 0,  // hide gray box around active node
            },
        },
        {
            selector: "node:selected",
            style: {
                "border-width": 1,
            }
        },
        {
            selector: "edge",
            style: {
                width: 0.5,
                "line-color": "data(color)",
                "arrow-scale": 0.3,
                "target-arrow-color": "data(color)",
                "target-arrow-shape": "triangle",
                'curve-style': 'straight',
            },
        },
        {
            selector: "edge:active",
            style: {
                "overlay-opacity": 0,
            },
        },
    ]
    return style
}

export default function SchemaView({ schema }: { schema: Graph }) {

    const [selectedElement, setSelectedElement] = useState<NodeDataDefinition | EdgeDataDefinition>();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const chartRef = useRef<cytoscape.Core | null>(null);
    const dataPanel = useRef<ImperativePanelHandle>(null);

    useEffect(() => {
        dataPanel.current?.collapse()
    }, [])

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

    const onLabelClick = (label: Category) => {
        const chart = chartRef.current
        if (chart) {
            const elements = chart.elements(`edge[label = "${label.name}"]`)

            // eslint-disable-next-line no-param-reassign
            label.show = !label.show

            if (label.show) {
                elements.style({ display: 'element' })
            } else {
                elements.style({ display: 'none' })
            }
            chart.elements().layout(LAYOUT).run();
        }
    }

    const handelTap = (e: EventObject) => {
        const element = e.target.json().data
        element.id = "number"
        setSelectedElement(element)
        dataPanel.current?.expand()
    }

    const onExpand = () => {
        if (!dataPanel.current) return
        const panel = dataPanel.current
        if (panel.isExpanded()) {
            panel.collapse()
        } else {
            panel.expand()
        }
    }

    const onAddEntitySchema = () => { 
        schema.Elements.push({
            data: {
                id: "number",
            }
        })
    }
    
    const onAddRelationSchema = () => { 
        schema.Elements.push({
            data: {
                id: "number",
            }
        })
    }

    const onDelete = () => {
        const s = schema
        s.Elements = s.Elements.filter((element) => element.data.id !== selectedElement?.id)
    }

    return (
        <ResizablePanelGroup className="grow" direction="horizontal">
            <ResizablePanel defaultSize={100} className="relative grow flex flex-col gap-4 p-8">
                <Toolbar onAddEntitySchema={onAddEntitySchema} onAddRelationSchema={onAddRelationSchema} onDeleteElementSchema={onDelete} chartRef={chartRef} />
                <div className="grow relative">
                    <CytoscapeComponent
                        className="w-full h-full"
                        layout={LAYOUT}
                        stylesheet={getStyle()}
                        elements={schema.Elements}
                        cy={(cy) => {
                            chartRef.current = cy

                            cy.removeAllListeners()

                            cy.on('tap', 'node', handelTap)
                            cy.on('tap', 'edge', handelTap)
                        }}
                    />
                    <Labels className="absolute left-0 bottom-0" categories={schema.Categories} onClick={onCategoryClick} />
                    <Labels className="absolute right-0 bottom-0" categories={schema.Labels} onClick={onLabelClick} />
                </div>
                {
                    isCollapsed &&
                    <button
                        className="absolute top-2 right-4 p-4 bg-indigo-600 rounded-lg"
                        title="Open"
                        type="button"
                        onClick={() => onExpand()}
                        disabled={!selectedElement}
                        aria-label="Open"
                    >
                        <ChevronLeft />
                    </button>
                }
            </ResizablePanel>
            <ResizablePanel
                className="rounded-lg"
                collapsible
                ref={dataPanel}
                defaultSize={25}
                onCollapse={() => setIsCollapsed(true)}
                onExpand={() => setIsCollapsed(false)}
            >
                {
                    selectedElement &&
                    <DataPanel
                        obj={selectedElement}
                        onExpand={onExpand}
                    />
                }
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}