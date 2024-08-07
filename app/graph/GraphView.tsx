'use client'

import CytoscapeComponent from "react-cytoscapejs";
import cytoscape, { EdgeDefinition, EdgeSingular, ElementDefinition, EventObject, NodeDataDefinition, NodeDefinition } from "cytoscape";
import { useRef, useState, useImperativeHandle, forwardRef, useEffect, Dispatch, SetStateAction } from "react";
import fcose from 'cytoscape-fcose';
import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { ChevronLeft, Maximize2 } from "lucide-react"
import { cn, prepareArg, securedFetch } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Category, Graph } from "../api/graph/model";
import DataPanel from "./DataPanel";
import Labels from "./labels";
import Toolbar from "./toolbar";
import Button from "../components/ui/Button";

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
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
                "color": "black",
                "text-valign": "center",
                "text-halign": "center",
                "text-wrap": "ellipsis",
                "text-max-width": "10rem",
                shape: "ellipse",
                height: "15rem",
                width: "15rem",
                "border-width": 0.3,
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
            selector: "edge",
            style: {
                width: 1,
                "line-color": "white",
                "line-opacity": 1,
                "arrow-scale": 0.7,
                "target-arrow-color": "white",
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

const GraphView = forwardRef(({ graph, runQuery, setGraph, historyQuery }: {
    graph: Graph
    setGraph: Dispatch<SetStateAction<Graph>>
    runQuery: (query: string) => Promise<void>
    historyQuery: string
}, ref) => {

    const [query, setQuery] = useState<string>("")
    const [selectedElement, setSelectedElement] = useState<NodeDefinition | EdgeDefinition>();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
    const chartRef = useRef<cytoscape.Core | null>(null)
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const dataPanel = useRef<ImperativePanelHandle>(null)
    const submitQuery = useRef<HTMLButtonElement>(null)

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
        setQuery(historyQuery)
    }, [historyQuery])

    const handelSetSelectedElement = (element?: NodeDefinition | EdgeDefinition) => {
        setSelectedElement(element)
        if (element) {
            dataPanel.current?.expand()
        } else dataPanel.current?.collapse()
    }

    const handleEditorWillMount = (monacoInstance: Monaco) => {
        monacoInstance.editor.defineTheme('custom-theme', {
            base: 'vs-dark',
            inherit: false,
            rules: [
                { token: 'keyword', foreground: '#99E4E5' },
                { token: 'type', foreground: '#89D86D' },
            ],
            colors: {
                'editor.background': '#1F1F3D',
                'editor.foreground': 'ffffff',
            },
        });
    };

    const handleEditorDidMount = (e: monaco.editor.IStandaloneCodeEditor) => {
        
        editorRef.current = e

        // if (typeof window !== "undefined") return
        // e.addAction({
        //     id: 'submit',
        //     label: 'Submit Query',
        //     // eslint-disable-next-line no-bitwise
        //     keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
        //     contextMenuOrder: 1.5,
        //     run: async () => {
        //         submitQuery.current?.click()
        //     }
        // });
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

    const handleSelected = (evt: EventObject) => {
        const { target } = evt

        if (target.isEdge()) {
            const { color } = target.data()
            target.style("line-color", color);
            target.style("target-arrow-color", color);
            target.style("line-opacity", 0.5);
            target.style("width", 2);
            target.style("arrow-scale", 1);
        } else target.style("border-width", 0.7);

        const obj: NodeDefinition | EdgeDefinition = evt.target.json();
        handelSetSelectedElement(obj);
    }

    const handleUnselected = (evt: EventObject) => {
        const { target } = evt

        if (target.isEdge()) {
            target.style("line-color", "white");
            target.style("target-arrow-color", "white");
            target.style("line-opacity", 1);
            target.style("width", 1);
            target.style("arrow-scale", 0.7);
        } else target.style("border-width", 0.3);

        handelSetSelectedElement();
    }

    const handleMouseOver = (evt: EventObject) => {
        const edge: EdgeSingular = evt.target;
        const { color } = edge.data();

        edge.style("line-color", color);
        edge.style("target-arrow-color", color);
        edge.style("line-opacity", 0.5);
    };

    const handleMouseOut = async (evt: EventObject) => {
        const edge: EdgeSingular = evt.target;

        if (edge.selected()) return

        edge.style("line-color", "white");
        edge.style("target-arrow-color", "white");
        edge.style("line-opacity", 1);
    };

    const setProperty = async (key: string, newVal: string) => {
        const id = selectedElement?.data.id
        const q = `MATCH (e) WHERE id(e) = ${id} SET e.${key} = '${newVal}'`
        const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)}`, {
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
        const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)}`, {
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
        const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok
        if (!success) return
        setGraph(prev => {
            const p = prev
            p.Elements = p.Elements.filter(element => element.data.id !== id)
            return p
        })
        setSelectedElement(undefined)
        dataPanel.current?.collapse()
    }

    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
                className={cn("flex flex-col gap-8", !isCollapsed && "mr-8")}
                defaultSize={100}
            >
                <div className="w-full flex items-center gap-8">
                    <p>Query</p>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        runQuery(query)
                    }} className="w-1 grow flex border border-[#343459] rounded-r-lg overflow-hidden">
                        <div className="flex grow w-1">
                            <Editor
                                className="Editor"
                                language="cypher"
                                options={monacoOptions}
                                value={query}
                                onChange={(val) => setQuery(val || "")}
                                theme="custom-theme"
                                beforeMount={handleEditorWillMount}
                                onMount={handleEditorDidMount}
                            />
                        </div>
                        <Button
                            ref={submitQuery}
                            className="bg-[#59597C] border border-[#737392] p-2 px-8"
                            label="Run"
                            title="Run (Ctrl+Enter)"
                            type="submit"
                        />
                    </form>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                className="p-2"
                                title="Maximize"
                                icon={<Maximize2 size={20} />}
                            />
                        </DialogTrigger>
                        <DialogContent closeSize={30} className="w-full h-full">
                            <Editor
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
                <div className="flex items-center justify-between">
                    <Toolbar disabled={!graph.Id} deleteDisabled={!selectedElement} onDeleteElement={onDeleteElement} chartRef={chartRef} />
                    {
                        isCollapsed && graph.Id &&
                        <Button
                            className="p-3 bg-[#7167F6] rounded-lg"
                            icon={<ChevronLeft />}
                            onClick={() => onExpand()}
                            disabled={!selectedElement}
                        />
                    }
                </div>
                <div className="relative grow">
                    <CytoscapeComponent
                        className="Canvas"
                        cy={(cy) => {

                            chartRef.current = cy

                            cy.removeAllListeners()

                            cy.on('dbltap', 'node', handleDoubleTap)
                            cy.on('mouseover', 'edge', handleMouseOver)
                            cy.on('mouseout', 'edge', handleMouseOut)
                            cy.on('tapunselect', 'edge', handleUnselected)
                            cy.on('tapunselect', 'node', handleUnselected)
                            cy.on('tapselect', 'edge', handleSelected)
                            cy.on('tapselect', 'node', handleSelected)
                        }}
                        elements={graph.Elements}
                        layout={LAYOUT}
                        stylesheet={getStyle()}
                    />
                    {
                        (graph.Categories.length > 0 || graph.Labels.length > 0) &&
                        <>
                            <Labels className="left-2" categories={graph.Categories} onClick={onCategoryClick} label="Labels" />
                            <Labels className="right-2 text-end" categories={graph.Labels} onClick={onLabelClick} label="RelationshipTypes" />
                        </>
                    }
                </div>
            </ResizablePanel>
            {
                !isCollapsed &&
                <ResizableHandle className="w-3" />
            }
            <ResizablePanel
                className="rounded-lg"
                collapsible
                ref={dataPanel}
                defaultSize={25}
                minSize={25}
                maxSize={50}
                onCollapse={() => setIsCollapsed(true)}
                onExpand={() => setIsCollapsed(false)}
            >
                {
                    selectedElement &&
                    <DataPanel
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