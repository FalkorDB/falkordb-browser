'use client'

import { useRef, useState, useEffect } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { ChevronLeft, Maximize2, Minimize2 } from "lucide-react"
import { cn, prepareArg, securedFetch } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Category, Graph } from "../api/graph/model";
import DataPanel from "./GraphDataPanel";
import Labels from "./labels";
import Toolbar from "./toolbar";
import Button from "../components/ui/Button";
import { Switch } from "@/components/ui/switch";
import { GraphCanvas, GraphCanvasRef, GraphEdge, GraphNode, InternalGraphEdge, InternalGraphNode, darkTheme } from "reagraph";

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

const GraphView = ({ graph, runQuery, historyQuery, fetchCount }: {
    graph: Graph
    runQuery: (query: string) => Promise<void>
    historyQuery: string
    fetchCount: () => void
}) => {

    const [query, setQuery] = useState<string>("")
    const [selectedElement, setSelectedElement] = useState<GraphNode | GraphEdge>();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const dataPanel = useRef<ImperativePanelHandle>(null)
    const graphRef = useRef<GraphCanvasRef>(null)
    const submitQuery = useRef<HTMLButtonElement>(null)
    const [maximize, setMaximize] = useState<boolean>(false)
    const [isThreeD, setIsThreeD] = useState<boolean>(false)

    useEffect(() => {
        setQuery(historyQuery)
    }, [historyQuery])

    useEffect(() => {
        setSelectedElement(undefined)
        dataPanel.current?.collapse()
    }, [graph.Id])

    useEffect(() => {
        if (!editorRef.current) return
        editorRef.current.layout();
    }, [isCollapsed])

    const handelSetSelectedElement = (element?: GraphNode | GraphEdge) => {
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
        const nodes = graphRef.current?.getGraph().nodes()
        category.show = !category.show
    }

    const onLabelClick = (label: Category) => {
        label.show = !label.show
    }

    // const handleDoubleTap = async (evt: EventObject) => {
    //     const node = evt.target.json().data;
    //     const elements = await onFetchNode(node);
    //     chartRef.current?.add(elements);
    // }

    const handleSelectedEdge = (edge: InternalGraphEdge) => {
        handelSetSelectedElement(edge);
    }

    const handleSelectedNode = (node: InternalGraphNode) => {
        handelSetSelectedElement(node);
    }

    // const handleBoxSelected = (evt: EventObject) => {
    //     const { target } = evt
    //     const type = target.isEdge() ? "edge" : "node"

    //     if (type === "edge") {
    //         target.style("line-opacity", 0.9);
    //         target.style("width", 2);
    //         target.style("arrow-scale", 1);
    //     } else target.style("border-width", 0.7);

    //     const obj: ElementDataDefinition = target.json().data;

    //     setSelectedElements(prev => [...prev, obj]);
    // }

    const handleUnselected = () => {
        handelSetSelectedElement();
    }

    const handleMouseOverNode = (node: InternalGraphNode) => {
        node.size = 15;
    };

    const handleMouseOverEdge = (edge: InternalGraphEdge) => {
        edge.size = 5;
    };

    const handleMouseOutNode = async (node: InternalGraphNode) => {
        node.size = 10;
    };

    const handleMouseOutEdge = async (edge: InternalGraphEdge) => {
        edge.size = 3;
    };

    const setProperty = async (key: string, newVal: string) => {
        const type = selectedElement && "sucre" in selectedElement;
        const id = selectedElement?.id
        const q = `MATCH (e) WHERE id(e) = ${id} SET e.${key} = '${newVal}'`
        const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok
        if (success)
            if (type) {

                graph.Nodes.forEach(node => {
                    if (node.id !== id) return
                    node.data[key] = newVal
                })
            } else graph.Edges.forEach(edge => {
                if (edge.id !== id) return
                edge.data[key] = newVal
            })
        return success
    }

    const removeProperty = async (key: string) => {
        const type = selectedElement && "sucre" in selectedElement;
        const id = selectedElement?.id
        const q = `MATCH (e) WHERE id(e) = ${id} SET e.${key} = NULL`
        const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })).ok
        if (success)
            if (type) {

                graph.Nodes.forEach(node => {
                    if (node.data.id !== id) return
                    const e = node
                    delete e.data[key]
                })
            } else graph.Edges.forEach(edge => {
                if (edge.data.id !== id) return
                const e = edge
                delete e.data[key]
            })
        return success
    }

    const handelDeleteElement = async () => {
        const type = selectedElement ? !("source" in selectedElement) : false
        const id = selectedElement?.id
        const q = `MATCH ${type ? "(e)" : "()-[e]-()"} WHERE ID(e) = ${id} DELETE e`

        const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(q)} `, {
            method: "GET"
        })

        if (!result.ok) return

        graph.updateCategories(type ? selectedElement?.data.category : selectedElement?.data.label, type)

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
                        deleteDisabled={!selectedElement}
                        onDeleteElement={handelDeleteElement}
                        chartRef={graphRef}
                        isThreeD={isThreeD}
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
                <div className="relative h-1 grow rounded-lg overflow-hidden">
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
                    <div
                        className="z-10 absolute top-4 left-4 flex gap-3 items-center"
                    >
                        <div className="flex flex-col gap-2 items-center">
                            <p>Graph 3D</p>
                            <Switch
                                checked={isThreeD}
                                onCheckedChange={(checked) => setIsThreeD(checked)}
                            />
                        </div>
                    </div>
                    <GraphCanvas
                        ref={graphRef}
                        nodes={graph.Nodes}
                        edges={graph.Edges}
                        theme={{
                            ...darkTheme,
                            canvas: {
                                background: "#434366"
                            }
                        }}
                        onNodeClick={handleSelectedNode}
                        onEdgeClick={handleSelectedEdge}
                        onCanvasClick={handleUnselected}
                        onNodePointerOver={handleMouseOverNode}
                        onNodePointerOut={handleMouseOutNode}
                        onEdgePointerOver={handleMouseOverEdge}
                        onEdgePointerOut={handleMouseOutEdge}
                        layoutType={isThreeD ? "forceDirected3d" : "forceDirected2d"}
                        cameraMode={isThreeD ? "rotate" : "pan"}
                        draggable
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
            <ResizableHandle className={cn(isCollapsed ? "w-0 !cursor-default" : "w-3")} disabled={!selectedElement} />
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
};

GraphView.displayName = "GraphView";

export default GraphView