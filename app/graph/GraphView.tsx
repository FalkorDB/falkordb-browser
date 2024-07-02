'use client'

import CytoscapeComponent from "react-cytoscapejs";
import cytoscape, { EdgeDefinition, ElementDefinition, EventObject, NodeDataDefinition, NodeDefinition } from "cytoscape";
import { useRef, useState, useImperativeHandle, forwardRef, useEffect, Dispatch, SetStateAction } from "react";
import fcose from 'cytoscape-fcose';
import Editor, { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { ChevronDown, ChevronLeft, Maximize2 } from "lucide-react"
import { Toast, cn, prepareArg, securedFetch } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Category, Graph } from "./model";
import DataPanel from "./DataPanel";
import Labels from "./labels";
import Toolbar from "./toolbar";
import { Query } from "./Selector";

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
    lineHeight: 42,
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

const GraphView = forwardRef(({ graphName, setQueries, schema }: {
    graphName: string,
    schema: Graph,
    // eslint-disable-next-line react/require-default-props
    setQueries?: Dispatch<SetStateAction<Query[]>>,
}, ref) => {

    const [graph, setGraph] = useState<Graph>(Graph.empty())
    const [query, setQuery] = useState<string>("")
    const [selectedElement, setSelectedElement] = useState<NodeDefinition | EdgeDefinition>();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
    const chartRef = useRef<cytoscape.Core | null>(null)
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
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

    const handleEditorWillMount = (monaco: Monaco) => {
        monaco.editor.defineTheme('custom-theme', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: '', foreground: 'ffffff' },
                { token: 'keyword', foreground: '0000ff' },
            ],
            colors: {
                'editor.background': '#1F1F3D',
                'editor.foreground': 'ffffff',
            },
        });
    };

    const handleEditorDidMount = (e: editor.IStandaloneCodeEditor) => {
        editorRef.current = e
    }

    useEffect(() => {
        if (chartRef.current) {
            const layout = chartRef.current.layout(LAYOUT);
            layout.run();
        }
    }, [graph.Elements]);

    useEffect(() => {
        if (!editorRef.current) return
        editorRef.current.layout();
    }, [isCollapsed])

    useEffect(() => {
        dataPanel.current?.collapse()
    }, [])

    const defaultQuery = () => query || "MATCH (n) OPTIONAL MATCH (n)-[e]-(m) return n,e,m LIMIT 100"

    const runQuery = async () => {

        if (!graphName) {
            Toast("Select a graph first")
            return
        }

        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(defaultQuery())}`, {
            method: "GET"
        })
        const json = await result.json()

        if (!result.ok) {
            Toast(json.message)
            return
        }
        if (!setQueries) return
        setQueries(prev => [...prev, { text: defaultQuery(), metadata: json.result.metadata }])
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
        if (selectedElement) {
            selectedElement.selected = false
        }
        const obj: NodeDefinition | EdgeDefinition = evt.target.json();
        obj.selected = true
        setSelectedElement(obj);
        dataPanel.current?.expand()
    }

    const setProperty = async (key: string, newVal: string) => {
        const id = selectedElement?.data.id
        const q = `MATCH (e) WHERE id(e) = ${id} SET e.${key} = '${newVal}'`
        const success = (await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok
        if (success)
            graph.Elements.forEach(e => {
                const el = e
                if (el.data.id !== id) return
                el.data[key] = newVal
            })
        return success
    }

    const removeProperty = async (key: string) => {
        const id = selectedElement?.data.id
        const q = `MATCH (e) WHERE id(e) = ${id} SET e.${key} = NULL`
        const success = (await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok
        if (success)
            graph.Elements.forEach(element => {
                if (element.data.id !== id) return
                const e = element
                delete e.data[key]
            })
        return success
    }

    const onDeleteElement = async () => {
        const id = selectedElement?.data.id
        const q = `MATCH (e) WHERE id(e) = ${id} DELETE e`
        const success = (await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok
        if (!success) return
        graph.Elements = graph.Elements.filter(element => element.data.id !== id)
        setSelectedElement(undefined)
        dataPanel.current?.collapse()
    }

    const onSetLabel = async (label: string) => {
        const isNode = !!selectedElement?.data.category
        const id = selectedElement?.data.id
        const q = `MATCH (n) WHERE id(n) = ${id} `
        const success = (await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok
        if (success)
            graph.Elements.forEach(element => {
                if (element.data.id !== id) return
                const e = element
                if (isNode) {
                    e.data.category = label
                } else e.data.label = label
            })
        return success
    }

    const onAddEntity = async (entityAttributes: string[][]) => {
        const category = entityAttributes.find(row => row[0] === "category")
        const filteredAttributes = entityAttributes.filter(row => row[0] !== "category")
        if (!category) {
            Toast("Missing Category")
            return
        }
        const q = `CREATE (n:${category[1]} {${filteredAttributes.map(([k, v]) => `${k}: '${v}'`)}}) return n`
        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })
        if (!result.ok) return
        const node = (await result.json()).result.data[0].n
        graph.Elements = graph.extendNode(node, graph.Elements)
    }

    const onAddRelation = async (relationAttributes: string[][]) => {
        const label = relationAttributes.find(row => row[0] === "label")
        const filteredAttributes = relationAttributes.filter(row => row[0] !== "label")
        if (!label) {
            Toast("Missing Label")
            return
        }
        const q = `CREATE (e:${label[1]} {${filteredAttributes.map(([k, v]) => `${k}: '${v}'`)}}) return e`
        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })
        if (!result.ok) return
        const edge = (await result.json()).result.data[0].e
        graph.Elements = graph.extendEdge(edge, graph.Elements)
    }

    return (
        <ResizablePanelGroup className={cn("grow", !isCollapsed && "gap-8")} direction="horizontal">
            <ResizablePanel
                className="w-1 grow pt-8 flex flex-col gap-10"
                defaultSize={100}
            >
                <div className="w-full flex flex-row items-center gap-8">
                    <p>Query</p>
                    <form action={runQuery} className="w-1 grow flex flex-row border border-[#343459]">
                        <div className="flex flex-row grow w-1">
                            <Editor
                                width="100%"
                                height="100%"
                                language="cypher"
                                options={monacoOptions}
                                value={query}
                                onChange={(val) => setQuery(val || "")}
                                theme="custom-theme"
                                beforeMount={handleEditorWillMount}
                                onMount={handleEditorDidMount}
                            />
                        </div>
                        <button
                            className="flex flex-row gap-8 bg-[#59597C] border border-[#737392] p-2 rounded-r-lg"
                            title="Run"
                            type="submit"
                        >
                            <p>Run</p>
                            <ChevronDown />
                        </button>
                    </form>
                    <Dialog>
                        <DialogTrigger asChild>
                            <button
                                className="p-2"
                                title="Maximize"
                                type="button"
                                aria-label="Maximize"
                            >
                                <Maximize2 size={20} />
                            </button>
                        </DialogTrigger>
                        <DialogContent closeSize={30} className="w-full h-full">
                            <Editor
                                // width={isCollapsed ? "100%" : "99.99%"}
                                className="w-full h-full"
                                beforeMount={handleEditorWillMount}
                                theme="custom-theme"
                                options={{
                                    lineHeight: 30,
                                    fontSize: 25
                                }}
                                value={query}
                                onChange={(val) => setQuery(val || "")}
                                language="cypher"
                            />
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="relative">
                    <Toolbar schema={schema} deleteDisable={!selectedElement?.data.id} onDeleteElementGraph={onDeleteElement} onAddEntityGraph={onAddEntity} onAddRelationGraph={onAddRelation} chartRef={chartRef} />
                    {
                        isCollapsed && graph.Id &&
                        <button
                            className="absolute top-0 right-0 p-4 bg-[#7167F6] rounded-lg"
                            title="Open"
                            type="button"
                            onClick={() => onExpand()}
                            disabled={!selectedElement}
                            aria-label="Open"
                        >
                            <ChevronLeft />
                        </button>
                    }
                </div>
                <div className="flex relative grow">
                    <CytoscapeComponent
                        className="Canvas"
                        cy={(cy) => {

                            chartRef.current = cy

                            cy.removeAllListeners()

                            cy.on('tap', 'node', handleTap)
                            cy.on('tap', 'edge', handleTap)
                            cy.on('dbltap', 'node', handleDoubleTap)
                        }}
                        elements={graph.Elements}
                        layout={LAYOUT}
                        stylesheet={getStyle()}
                    />
                    {
                        graph.Id &&
                        <div className="absolute w-full bottom-2 flex flex-row justify-between">
                            <Labels categories={graph.Categories} onClick={onCategoryClick} label="Categories" />
                            <Labels categories={graph.Labels} onClick={onLabelClick} label="Labels" />
                        </div>
                    }
                </div>
            </ResizablePanel>
            <ResizablePanel
                className="rounded-lg"
                collapsible
                ref={dataPanel}
                defaultSize={30}
                onCollapse={() => setIsCollapsed(true)}
                onExpand={() => setIsCollapsed(false)}
            >
                {
                    selectedElement &&
                    <DataPanel
                        setLabel={onSetLabel}
                        removeProperty={removeProperty}
                        setProperty={setProperty}
                        obj={selectedElement.data}
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