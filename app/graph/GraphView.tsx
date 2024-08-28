'use client'

import { useRef, useState, useEffect } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { ChevronLeft, Maximize2, Minimize2 } from "lucide-react"
import { cn, ElementDataDefinition, prepareArg, securedFetch } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ForceGraphMethods, LinkObject, NodeObject } from "react-force-graph-3d";
import { Category, Edge, Graph, Node } from "../api/graph/model";
import DataPanel from "./GraphDataPanel";
import Labels from "./labels";
import Toolbar from "./toolbar";
import Button from "../components/ui/Button";
import dynamic from 'next/dynamic';

const ForceGraph3D: = dynamic(() => import('react-force-graph-3d'), {
    ssr: false,
});

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    renderLineHighlight: "none",
    quickSuggestions: false,
    glyphMargin: false,
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
    fontSize: 25,
    fontWeight: "normal",
    wordWrap: "off",
    lineHeight: 42,
    lineNumbers: "off",
    lineNumbersMinChars: 0,
    lineDecorationsWidth: 10,
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

const getElementId = (element: ElementDataDefinition) => element.source ? { id: element.id?.slice(1), query: "()-[e]-()" } : { id: element.id, query: "(e)" }

function GraphView({ graph, runQuery, historyQuery, fetchCount }: {
    graph: Graph
    runQuery: (query: string) => Promise<void>
    historyQuery: string
    fetchCount: () => void
}) {

    const [query, setQuery] = useState<string>("")
    const [selectedElements, setSelectedElements] = useState<(ElementDataDefinition)[]>([]);
    const [selectedElement, setSelectedElement] = useState<ElementDataDefinition>();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const dataPanel = useRef<ImperativePanelHandle>(null)
    const submitQuery = useRef<HTMLButtonElement>(null)
    const graphRef = useRef<ForceGraphMethods<NodeObject<Node>, LinkObject<Node, Edge>> | undefined>()
    const parentGraphRef = useRef<HTMLDivElement | null>(null)
    const [maximize, setMaximize] = useState<boolean>(false)
    const [graphHeight, setGraphHeight] = useState<number>(0)

    useEffect(() => {
        console.log(graphRef);
    }, [graphRef.current])

    useEffect(() => {
        if (parentGraphRef.current) {
            setGraphHeight(parentGraphRef.current.clientHeight)
        }
    }, [parentGraphRef.current, maximize])

    useEffect(() => {
        setSelectedElement(undefined)
        setSelectedElements([])
        dataPanel.current?.collapse()
    }, [graph.Id])

    useEffect(() => {
        setQuery(historyQuery)
    }, [historyQuery])

    useEffect(() => {
        setSelectedElement(undefined)
        setSelectedElements([])
    }, [graph.Id])

    const handelSetSelectedElement = (element?: ElementDataDefinition) => {
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
    // const onFetchNode = async (node: NodeDataDefinition) => {
    //     const result = await securedFetch(`/api/graph/${graph.Id}/${node.id}`, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     });

    //     if (result.ok) {
    //         const json = await result.json()
    //         return graph.extend(json.result)
    //     }

    //     return []
    // }

    const onCategoryClick = (category: Category) => {
        if (category) return 1
        return 0
        // const chart = chartRef.current
        // if (chart) {
        //     const elements = chart.elements(`node[category = "${category.name}"]`)

        //     // eslint-disable-next-line no-param-reassign
        //     category.show = !category.show

        //     if (category.show) {
        //         elements.style({ display: 'element' })
        //     } else {
        //         elements.style({ display: 'none' })
        //     }
        //     chart.elements().layout(LAYOUT).run();
        // }
    }

    const onLabelClick = (label: Category) => {
        const graph = graphRef.current
        if (graph) {
            const elements = graph(`edge[label = "${label.name}"]`)

            // eslint-disable-next-line no-param-reassign
            label.show = !label.show

            if (label.show) {
                elements.style({ display: 'element' })
            } else {
                elements.style({ display: 'none' })
            }
        }
    }

    // const handleDoubleTap = async (node: Node) => {
    //     const elements = await onFetchNode(node);
    
    //     chartRef.current?.add(elements);
    // }

    const handleSelectedNode = (node: Node) => {

        handelSetSelectedElement(node);
    }

    const handleSelectedEdge = (edge: Edge) => {

        handelSetSelectedElement(edge);
    }

    const handleUnselected = () => {
        handelSetSelectedElement();
        setSelectedElements([]);
    }

    const handleMouseHoverNode = (node: Node) => {
        // if (element.selected()) return
        node.color = "#FF0000"
        console.log(graphRef.current);
        graphRef.current?.refresh()
    };

    const handleMouseHoverEdge = (edge: Edge) => {
        if (edge) return 1
        return 0
        // if (element.selected()) return
        // if (element.isEdge()) {
        //     element.style("line-opacity", 0.9);
        //     element.style("width", 2);
        //     element.style("arrow-scale", 1);
        // } else element.style("border-width", 0.7);
    };

    const handleMouseOutNode = async (node: Node) => {
        if (node) return 1
        return 0
        // if (element.selected()) return
        // if (element.isEdge()) {
        //     element.style("line-opacity", 0.7);
        //     element.style("width", 1);
        //     element.style("arrow-scale", 0.7);
        // } else element.style("border-width", 0.3);
    };

    const handleMouseOutEdge = async (edge: Edge) => {
        if (edge) return 1
        return 0
        // if (element.selected()) return
        // if (element.isEdge()) {
        //     element.style("line-opacity", 0.7);
        //     element.style("width", 1);
        //     element.style("arrow-scale", 0.7);
        // } else element.style("border-width", 0.3);
    };

    const handleMouseNode = (node: Node | null, prevNode: Node | null) => {
        if (node) {
            handleMouseHoverNode(node)
        } else if (!node && prevNode) {
            handleMouseOutNode(prevNode)
        }
    }

    const handleMouseEdge = (edge: Edge | null, prevEdge: Edge | null) => {
        if (edge) {
            handleMouseHoverEdge(edge)
        } else if (!edge && prevEdge) {
            handleMouseOutEdge(prevEdge)
        }
    }

    const setProperty = async (key: string, newVal: string) => {
        const id = selectedElement?.id
        const q = `MATCH (e) WHERE id(e) = ${id} SET e.${key} = '${newVal}'`
        const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok
        if (success) {
            Object.values(graph.GraphData).forEach((arr, i) => {
                if (i === 0) {
                    graph.GraphData.nodes.forEach(n => {
                        const node = n
                        if (node.id !== id) return
                        node[key] = newVal
                    })
                } else {
                    graph.GraphData.links.forEach(e => {
                        const edge = e
                        if (edge.id !== id) return
                        edge[key] = newVal
                    })
                }
            }
            )
        }
        return success
    }

    const removeProperty = async (key: string) => {
        const id = selectedElement?.id
        const q = `MATCH (e) WHERE id(e) = ${id} SET e.${key} = NULL`
        const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok

        if (success) {
            Object.values(graph.GraphData).forEach((arr, i) => {
                if (i === 0) {
                    graph.GraphData.nodes.forEach(n => {
                        if (n.id !== id) return
                        const node = n
                        delete node[key]
                    })
                } else {
                    graph.GraphData.links.forEach(e => {
                        if (e.id !== id) return
                        const edge = e
                        delete edge[key]
                    })
                }
            })
        }
        return success
    }

    const handelDeleteElement = async () => {
        if (selectedElements.length === 0 && selectedElement) {
            selectedElements.push(selectedElement)
            setSelectedElement(undefined)
        }

        const conditionsNodes: string[] = []
        const conditionsEdges: string[] = []

        selectedElements.forEach((element) => {
            const { id } = getElementId(element)
            if (element.source) {
                conditionsEdges.push(`id(e) = ${id}`)
            } else {
                conditionsNodes.push(`id(n) = ${id}`)
            }
        })

        const q = `${conditionsNodes.length !== 0 ? `MATCH (n) WHERE ${conditionsNodes.join(" OR ")} DELETE n` : ""}${conditionsEdges.length > 0 && conditionsNodes.length > 0 ? " WITH * " : ""}${conditionsEdges.length !== 0 ? `MATCH ()-[e]-() WHERE ${conditionsEdges.join(" OR ")} DELETE e` : ""}`

        const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)} `, {
            method: "GET"
        })

        if (!result.ok) return

        selectedElements.forEach((element) => {
            const type = !element.source
            const { id } = getElementId(element)

            if (type) {
                graph.GraphData.nodes.splice(graph.GraphData.nodes.findIndex(n => n.id === id), 1)
            } else {
                graph.GraphData.links.splice(graph.GraphData.links.findIndex(e => e.id === id), 1)
            }

            // chartRef.current?.remove(`#${id} `)

            fetchCount()

            graph.updateCategories(type ? element.category : element.label, type)
        })

        setSelectedElements([])
        setSelectedElement(undefined)

        dataPanel.current?.collapse()
    }

    return (
        <ResizablePanelGroup direction="horizontal" className={cn(maximize && "h-full p-10 bg-background fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%]")}>
            <ResizablePanel
                className={cn("flex flex-col gap-8", !isCollapsed && "mr-8")}
                defaultSize={selectedElement ? 75 : 100}
            >
                {
                    !maximize &&
                    <Dialog>
                        <div className="w-full flex items-center gap-8">
                            <p>Query</p>
                            <form
                                className="w-1 grow flex rounded-lg overflow-hidden"
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    runQuery(query)
                                }}
                            >
                                <div className="relative border border-[#343459] flex grow w-1">
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
                                    <DialogTrigger asChild>
                                        <Button
                                            className="absolute top-0 right-0 p-2.5"
                                            title="Maximize"
                                            icon={<Maximize2 size={20} />}
                                        />
                                    </DialogTrigger>
                                </div>
                                <Button
                                    ref={submitQuery}
                                    className="rounded-none px-8"
                                    variant="Secondary"
                                    label="Run"
                                    type="submit"
                                />
                            </form>
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
                        </div>
                    </Dialog>
                }
                <div className="flex items-center justify-between">
                    <Toolbar
                        disabled={!graph.Id}
                        deleteDisabled={Object.values(selectedElements).length === 0 && !selectedElement}
                        onDeleteElement={handelDeleteElement}
                        graphRef={graphRef}
                    />
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
                <div ref={parentGraphRef} className="relative h-1 grow rounded-lg overflow-hidden">
                    {
                        !maximize ?
                            <Button
                                className="z-10 absolute top-4 right-4"
                                icon={<Maximize2 />}
                                title="Maximize"
                                onClick={() => setMaximize(true)}

                            /> : <Button
                                className="z-10 absolute top-4 right-4"
                                icon={<Minimize2 />}
                                title="Minimize"
                                onClick={() => setMaximize(false)}
                            />
                    }
                    <ForceGraph3D
                        ref={graphRef}
                        graphData={graph.GraphData}
                        onNodeClick={handleSelectedNode}
                        onLinkClick={handleSelectedEdge}
                        onNodeHover={handleMouseNode}
                        onLinkHover={handleMouseEdge}
                        onBackgroundClick={handleUnselected}
                        backgroundColor="#434366"
                        height={graphHeight}
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
                <ResizableHandle className={cn(selectedElement ? "w-3" : "w-0 !cursor-default")} disabled={!selectedElement} />
            <ResizablePanel
                className="rounded-lg"
                collapsible
                ref={dataPanel}
                defaultSize={selectedElement ? 25 : 0}
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
                        obj={selectedElement}
                        onExpand={onExpand}
                        onDeleteElement={handelDeleteElement}
                    />
                }
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}

GraphView.displayName = "GraphView";

export default GraphView;