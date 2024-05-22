import CytoscapeComponent from "react-cytoscapejs";
import cytoscape, { EdgeDataDefinition, ElementDefinition, EventObject, NodeDataDefinition } from "cytoscape";
import { useRef, useState, useImperativeHandle, forwardRef, useEffect } from "react";
import fcose from 'cytoscape-fcose';
import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { ChevronLeft, Maximize2 } from "lucide-react"
import { securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Category, Graph } from "./model";
import DataPanel from "./DataPanel";
import Labels from "./labels";
import Toolbar from "./toolbar";

const monacoOptions: editor.IStandaloneEditorConstructionOptions = {
    renderLineHighlight: "none",
    quickSuggestions: false,
    glyphMargin: false,
    lineDecorationsWidth: 0,
    folding: false,
    fixedOverflowWidgets: true,
    occurrencesHighlight: "off",
    acceptSuggestionOnEnter: "on",
    hover: {
        delay: 100,
    },
    roundedSelection: false,
    contextmenu: false,
    cursorStyle: "line-thin",
    links: false,
    minimap: { enabled: false },
    // see: https://github.com/microsoft/monaco-editor/issues/1746
    wordBasedSuggestions: "off",
    // disable `Find`
    find: {
        addExtraSpaceOnTop: false,
        autoFindInSelection: "never",
        seedSearchStringFromSelection: "never",
    },
    fontSize: 30,
    fontWeight: "normal",
    wordWrap: "off",
    lineHeight: 40,
    lineNumbers: "off",
    lineNumbersMinChars: 0,
    overviewRulerLanes: 0,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    scrollBeyondLastColumn: 0,
    scrollbar: {
        horizontal: "hidden",
        vertical: "hidden",
        // avoid can not scroll page when hover monaco
        alwaysConsumeMouseWheel: false,
    },
};

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
                "text-valign": "center",
                "text-halign": "center",
                "text-wrap": "ellipsis",
                "text-max-width": "10rem",
                shape: "ellipse",
                height: "10rem",
                width: "10rem",
                "border-width": 0.15,
                "border-opacity": 0.5,
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
            selector: "edge",
            style: {
                width: 0.5,
                "line-color": "#ccc",
                "arrow-scale": 0.3,
                "target-arrow-shape": "triangle",
                label: "data(label)",
                'curve-style': 'straight',
                "text-background-color": "white",
                "color": "black",
                "text-background-opacity": 1,
                "font-size": "3rem",
                "overlay-padding": "2rem",

            },
        },
    ]
    return style
}

export interface GraphViewRef {
    expand: (elements: ElementDefinition[]) => void
}

const GraphView = forwardRef(({ graphName }: {
    graphName: string,
    // eslint-disable-next-line react/require-default-props
}, ref) => {

    const { toast } = useToast()
    const [graph, setGraph] = useState<Graph>(Graph.empty())
    const [query, setQuery] = useState<string>("")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedElement, setSelectedElement] = useState<NodeDataDefinition | EdgeDataDefinition>();
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

    const prepareArg = (arg: string) => encodeURIComponent(arg.trim())

    const defaultQuery = () => query || "MATCH (n) OPTIONAL MATCH (n)-[e]-(m) return n,e,m LIMIT 100"

    const runQuery = async () => {
        if (!graphName) {
            toast({
                title: "Error",
                description: "Select a graph first"
            })
        }

        const result = await fetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(defaultQuery())}`, {
            method: "GET"
        })
        const json = await result.json()

        if (!result.ok) {
            toast({
                title: "Error",
                description: json.message || "Something went wrong"
            })
        }

        setGraph(Graph.create(graphName, json.result))
    }

    const onExpand = () => {
        if (!dataPanel.current) return
        const panel = dataPanel.current
        if (panel.isCollapsed()) {
            panel.expand()
        } else {
            panel.collapse()
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
        const obj = evt.target.json().data;
        setSelectedElement(obj);
        dataPanel.current?.expand()
    }

    const setProperty = async (key: string, newVal: string) => {
        const id = selectedElement?.id
        const q = `MATCH (e) WHERE id(e) = ${id} SET e.${key} = '${newVal}'`
        const success = (await fetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q)}`)).ok
        if (success)
            graph.Elements.forEach(element => {
                const el = element
                if (el.data.id !== id) return
                el.data[key] = newVal
            })
        return success
    }

    const removeProperty = async (key: string) => {
        const id = selectedElement?.id
        const q = `MATCH (e) WHERE id(e) = ${id} SET e.${key} = NULL`
        const success = (await fetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q)}`)).ok
        if (success)
            graph.Elements.forEach(element => {
                if (element.data.id !== id) return
                const e = element
                delete e.data[key]
            })
        return success
    }

    const onDeleteElement = async () => {
        const id = selectedElement?.id
        const q = `MATCH (e) WHERE id(e) = ${id} DELETE e`
        const success = (await fetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q)}`)).ok
        if (!success) return
        graph.Elements = graph.Elements.filter(element => element.data.id !== id)
        setSelectedElement(undefined)
    }

    return (
        <ResizablePanelGroup className="grow shadow-lg rounded-xl" direction="horizontal">
            <ResizablePanel
                className="relative p-8 flex flex-col gap-10"
                defaultSize={100}
            >
                <Toolbar deleteDisable={!selectedElement?.id} onDelete={onDeleteElement} chartRef={chartRef} />
                <div className="w-full flex flex-row items-center gap-8">
                    <p>Query</p>
                    <form action={runQuery} className="grow flex flex-row">
                        {/* <input
                            className="grow border border-gray-700 border-opacity-10 p-2"
                            title="Query"
                            type="text"
                            placeholder="Use Cypher Or Free Language"
                        /> */}
                        <div className="flex flex-row grow">
                            <Editor
                                height="100%"
                                width={isCollapsed ? "100%" : "99.99%"}
                                className="grow border border-gray-700 border-opacity-10"
                                language="cypher"
                                options={monacoOptions}
                                value={query}
                                onChange={(val) => setQuery(val || "")}
                            />
                        </div>
                        <button
                            className="border border-l-gray-700 border-opacity-15 text-gray-700 text-opacity-60 p-2"
                            title="Run"
                            type="submit"
                        >
                            <p>Run</p>
                        </button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <button
                                    className="p-2"
                                    title="Maximize"
                                    type="button"
                                    aria-label="Maximize"
                                >
                                    <Maximize2 size={20} className="text-gray-400 text-opacity-70" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="w-full h-full">
                                <Editor
                                    className="w-full h-full"
                                    value={query}
                                    onChange={(val) => setQuery(val || "")}
                                    language="cypher"
                                />
                            </DialogContent>
                        </Dialog>
                    </form>
                </div>
                {
                    graph.Id &&
                    <div className="flex relative grow">
                        <CytoscapeComponent
                            className="w-full grow bg-slate-100 bg-opacity-20"
                            cy={(cy) => {

                                chartRef.current = cy

                                cy.removeAllListeners()

                                cy.on('tap', 'node', handleTap)
                                cy.on('tap', 'edge', handleTap)
                                cy.on('dbltap', 'node', handleDoubleTap)
                            }}
                            elements={[{
                                data: {
                                    name: "moshes"
                                }
                            }]}
                            layout={LAYOUT}
                            stylesheet={getStyle()}
                        />
                        <Labels className="absolute left-0 bottom-0" categories={graph.Categories} onClick={onCategoryClick} />
                    </div>
                }
                {
                    isCollapsed && graph.Id &&
                    <button
                        className="absolute top-0 right-0 p-4 px-6 bg-indigo-600 rounded-se-xl"
                        title="Open"
                        type="button"
                        onClick={() => onExpand()}
                        disabled={!selectedElement}
                        aria-label="Open"
                    >
                        <ChevronLeft className="border border-white" size={20} color="white" />
                    </button>
                }
            </ResizablePanel>
            <ResizablePanel
                className="rounded-xl shadow-lg"
                collapsible
                ref={dataPanel}
                defaultSize={30}
                onCollapse={() => setIsCollapsed(true)}
                onExpand={() => setIsCollapsed(false)}
            >
                {
                    selectedElement &&
                    <DataPanel
                        removeProperty={removeProperty}
                        setProperty={setProperty}
                        obj={selectedElement}
                        onExpand={onExpand}
                        onDeleteElement={onDeleteElement}
                    />
                }
            </ResizablePanel>
        </ResizablePanelGroup>
    )
});

GraphView.displayName = "GraphView";

export default GraphView;