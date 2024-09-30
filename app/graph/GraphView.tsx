/* eslint-disable consistent-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-template-curly-in-string */

'use client'

import CytoscapeComponent from "react-cytoscapejs";
import cytoscape, { ElementDefinition, EventObject, NodeDataDefinition } from "cytoscape";
import { useRef, useState, useImperativeHandle, forwardRef, useEffect } from "react";
import fcose from 'cytoscape-fcose';
import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { ChevronLeft, Maximize2, Minimize2 } from "lucide-react"
import { cn, ElementDataDefinition, prepareArg, securedFetch } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Category, Graph } from "../api/graph/model";
import DataPanel from "./GraphDataPanel";
import Labels from "./labels";
import Toolbar from "./toolbar";
import Button from "../components/ui/Button";

type Suggestions = {
    keywords: monaco.languages.CompletionItem[],
    labels: monaco.languages.CompletionItem[],
    relationshipTypes: monaco.languages.CompletionItem[],
    propertyKeys: monaco.languages.CompletionItem[],
    procedures: monaco.languages.CompletionItem[]
}

const MAX_LINE_NUMBER = 2

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    renderLineHighlight: "none",
    glyphMargin: false,
    lineDecorationsWidth: 0,
    folding: false,
    fixedOverflowWidgets: true,
    occurrencesHighlight: "off",
    hover: {
        delay: 100,
    },
    roundedSelection: false,
    contextmenu: false,
    cursorStyle: "line-thin",
    links: false,
    minimap: { enabled: false },
    // disable `Find`
    find: {
        addExtraSpaceOnTop: false,
        autoFindInSelection: "never",
        seedSearchStringFromSelection: "never",
        loop: false,
    },
    automaticLayout: true,
    fontSize: 30,
    fontWeight: "normal",
    wordWrap: "off",
    lineHeight: 38,
    lineNumbers: "on",
    lineNumbersMinChars: 0,
    overviewRulerLanes: 0,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    scrollBeyondLastColumn: 0,
    scrollBeyondLastLine: false,
    scrollbar: {
        horizontal: "hidden",
        // avoid can not scroll page when hover monaco
        alwaysConsumeMouseWheel: false,
    },
};

const KEYWORDS = [
    "CREATE",
    "MATCH",
    "OPTIONAL",
    "AS",
    "WHERE",
    "RETURN",
    "ORDER BY",
    "SKIP",
    "LIMIT",
    "MARGE",
    "DELETE",
    "SET",
    "WITH",
    "UNION",
    "UNWIND",
    "FOREACH",
    "CALL",
    "YIELD",
]

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
                "selection-box-border-color": 'gray',
                "selection-box-border-width": 3,
                "selection-box-opacity": 0.5,
                "selection-box-color": 'gray',
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
                "line-color": "data(color)",
                "line-opacity": 0.7,
                "arrow-scale": 0.7,
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

const getElementId = (element: ElementDataDefinition) => element.source ? { id: element.id?.slice(1), query: "()-[e]-()" } : { id: element.id, query: "(e)" }

const getEmptySuggestions = (): Suggestions => ({
    keywords: KEYWORDS.map(key => ({
        insertText: key,
        label: key,
        kind: monaco.languages.CompletionItemKind.Keyword,
        range: new monaco.Range(1, 1, 1, 1),
        detail: "(keyword)"
    })),
    labels: [],
    relationshipTypes: [],
    propertyKeys: [],
    procedures: []
})

const GraphView = forwardRef(({ graph, runQuery, historyQuery, fetchCount }: {
    graph: Graph
    runQuery: (query: string) => Promise<void>
    historyQuery: string
    fetchCount: () => void
}, ref) => {

    const [query, setQuery] = useState<string>("")
    const lineNumber = query.split("\n").length
    const [selectedElements, setSelectedElements] = useState<(ElementDataDefinition)[]>([]);
    const [selectedElement, setSelectedElement] = useState<ElementDataDefinition>();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
    const chartRef = useRef<cytoscape.Core | null>(null)
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const dataPanel = useRef<ImperativePanelHandle>(null)
    const submitQuery = useRef<HTMLButtonElement>(null)
    const [maximize, setMaximize] = useState<boolean>(false)
    const [monacoInstance, setMonacoInstance] = useState<Monaco>()
    const [prevGraphName, setPrevGraphName] = useState<string>("")
    const [sugProvider, setSugProvider] = useState<monaco.IDisposable>()
    const [suggestions, setSuggestions] = useState<Suggestions>(getEmptySuggestions())

    const setTheme = (monacoI: Monaco) => {
        monacoI.editor.defineTheme('custom-theme', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'string', foreground: '#CE9178' },
                { token: 'number', foreground: '#B5CEA8' },
                { token: 'keyword', foreground: '#99E4E5' },
                { token: 'function', foreground: '#DCDCAA' },
                { token: 'type', foreground: '#89D86D' },
            ],
            colors: {
                'editor.background': '#1F1F3D',
                'editor.foreground': 'ffffff',
                'editorSuggestWidget.background': '#272745',
                'editorSuggestWidget.foreground': '#FFFFFF',
                'editorSuggestWidget.selectedBackground': '#57577B',
                'editorSuggestWidget.hoverBackground': '#28283F',
            },
        });
    }

    const addSuggestions = (MonacoI: Monaco, sug: monaco.languages.CompletionItem[], procedures?: monaco.languages.CompletionItem[]) => {

        sugProvider?.dispose()
        const provider = MonacoI.languages.registerCompletionItemProvider('custom-language', {
            triggerCharacters: ["."],
            provideCompletionItems: (model, position) => {
                const word = model.getWordUntilPosition(position)
                const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn)

                return {
                    suggestions: [
                        ...sug.map(s => ({ ...s, range })),
                        ...suggestions.keywords.map(s => ({ ...s, range })),
                        ...(procedures || [])
                    ]
                }
            },
        })

        setSugProvider(provider)
    }

    const addLabelsSuggestions = async (sug: monaco.languages.CompletionItem[]) => {
        const labelsQuery = `CALL db.labels()`

        await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(labelsQuery)}`, {
            method: "GET"
        }).then((res) => res.json()).then((json) => {
            json.result.data.forEach(({ label }: { label: string }) => {
                sug.push({
                    label,
                    kind: monaco.languages.CompletionItemKind.TypeParameter,
                    insertText: label,
                    range: new monaco.Range(1, 1, 1, 1),
                    detail: "(label)"
                })
            })
        })
    }

    const addRelationshipTypesSuggestions = async (sug: monaco.languages.CompletionItem[]) => {
        const relationshipTypeQuery = `CALL db.relationshipTypes()`

        await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(relationshipTypeQuery)}`, {
            method: "GET"
        }).then((res) => res.json()).then((json) => {
            json.result.data.forEach(({ relationshipType }: { relationshipType: string }) => {
                sug.push({
                    label: relationshipType,
                    kind: monaco.languages.CompletionItemKind.TypeParameter,
                    insertText: relationshipType,
                    range: new monaco.Range(1, 1, 1, 1),
                    detail: "(relationship type)"
                })
            })
        })
    }

    const addPropertyKeysSuggestions = async (sug: monaco.languages.CompletionItem[]) => {
        const propertyKeysQuery = `CALL db.propertyKeys()`

        await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(propertyKeysQuery)}`, {
            method: "GET"
        }).then((res) => res.json()).then((json) => {
            json.result.data.forEach(({ propertyKey }: { propertyKey: string }) => {
                sug.push({
                    label: propertyKey,
                    kind: monaco.languages.CompletionItemKind.Property,
                    insertText: propertyKey,
                    range: new monaco.Range(1, 1, 1, 1),
                    detail: "(property)"
                })
            })
        })
    }

    const addProceduresSuggestions = async (procedures: monaco.languages.CompletionItem[]) => {
        const proceduresQuery = `CALL dbms.procedures() YIELD name`
        await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(proceduresQuery)}`, {
            method: "GET"
        }).then((res) => res.json()).then((json) => {
            json.result.data.forEach(({ name }: { name: string }) => {
                procedures.push({
                    label: name,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: `${name}()`,
                    range: new monaco.Range(1, 1, 1, 1),
                    detail: "(function)"
                })
            })
        })
    }

    const getSuggestions = async () => {

        if (!graph.Id || !monacoInstance) return

        const sug: Suggestions = getEmptySuggestions()

        await Promise.all([
            addLabelsSuggestions(sug.labels),
            addRelationshipTypesSuggestions(sug.relationshipTypes),
            addPropertyKeysSuggestions(sug.propertyKeys),
            addProceduresSuggestions(sug.procedures)
        ])

        const namespaces = new Map()

        sug.procedures.forEach(({ label }) => {
            const [namespace] = (label as string).split(".")
            namespaces.set(namespace, namespace)
        })

        monacoInstance.languages.setMonarchTokensProvider('custom-language', {
            brackets: [
                { open: '{', close: '}', token: 'brackets.level1' },
                { open: '(', close: ')', token: 'brackets.level2' },
                { open: '[', close: ']', token: 'brackets.level3' }
            ],
            tokenizer: {
                root: [
                    [new RegExp(`\\b(${[...KEYWORDS, ...Array.from(namespaces.keys())].join('|')})\\b`), "keyword"],
                    [new RegExp(`\\b(${sug.procedures.map(({ label }) => label).join('|')})\\b`), "function"],
                    [/"([^"\\]|\\.)*"/, 'string'],
                    [/\d+/, 'number'],
                    [/:(\w+)/, 'type'],
                    [/\{|\}|\(|\)|\[|\]/, '@brackets'],
                ],
            },
            ignoreCase: true,
        })

        monacoInstance.editor.setTheme('custom-theme');

        addSuggestions(monacoInstance, [...sug.labels, ...sug.propertyKeys, ...sug.relationshipTypes], sug.procedures)

        setSuggestions(sug)
    }

    useEffect(() => {
        if (!graph || !monacoInstance || graph.Id !== prevGraphName) return setPrevGraphName(graph.Id)

        const run = async () => {
            const sug: Suggestions = getEmptySuggestions()

            await Promise.all(graph.Metadata.map(async (meta: string) => {
                if (meta.includes("Labels")) await addLabelsSuggestions(sug.labels)
                if (meta.includes("RelationshipTypes")) await addRelationshipTypesSuggestions(sug.relationshipTypes)
                if (meta.includes("PropertyKeys")) await addPropertyKeysSuggestions(sug.propertyKeys)
            }))
            Object.entries(sug).forEach(([key, value]) => {
                if (value.length === 0) {
                    sug[key as "labels" || "propertyKeys" || "relationshipTypes"] = suggestions[key as "labels" || "propertyKeys" || "relationshipTypes"]
                }
            })

            addSuggestions(monacoInstance, [...sug.labels, ...sug.propertyKeys, ...sug.relationshipTypes], sug.procedures)

            setSuggestions(sug)
        }

        run()
    }, [graph])


    useEffect(() => {
        getSuggestions()
    }, [graph.Id])

    useEffect(() => {
        const interval = setInterval(() => {
            getSuggestions()
        }, 5000)

        return () => {
            clearInterval(interval)
        }
    }, [])

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
        setSelectedElement(undefined)
        setSelectedElements([])
        dataPanel.current?.collapse()
    }, [graph.Id])

    useEffect(() => {
        setQuery(historyQuery)
    }, [historyQuery])

    const handelSetSelectedElement = (element?: ElementDataDefinition) => {
        setSelectedElement(element)
        if (element) {
            dataPanel.current?.expand()
        } else dataPanel.current?.collapse()
    }

    const handleEditorWillMount = (monacoI: Monaco) => {
        monacoI.languages.setMonarchTokensProvider('custom-language', {
            brackets: [
                { open: '{', close: '}', token: 'brackets.level1' },
                { open: '(', close: ')', token: 'brackets.level2' },
                { open: '[', close: ']', token: 'brackets.level3' }
            ],
            tokenizer: {
                root: [
                    [new RegExp(`\\b(${KEYWORDS.join('|')})\\b`), "keyword"],
                    [/"([^"\\]|\\.)*"/, 'string'],
                    [/\d+/, 'number'],
                    [/:(\w+)/, 'type'],
                    [/\{|\}|\(|\)|\[|\]/, '@brackets'],
                ],
            },
            ignoreCase: true,
        });

        setTheme(monacoI)

        const provider = monacoI.languages.registerCompletionItemProvider('custom-language', {
            triggerCharacters: ["."],
            provideCompletionItems: (model, position) => {
                const word = model.getWordUntilPosition(position)
                const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn)
                return {
                    suggestions: suggestions.keywords.map(s => ({ ...s, range }))
                }
            }
        })

        setSugProvider(provider)
        monacoI.editor.setTheme('custom-theme');
        monacoI.languages.register({ id: 'custom-language' });
    };

    const handleEditorDidMount = (e: monaco.editor.IStandaloneCodeEditor, monacoI: Monaco) => {

        setMonacoInstance(monacoI)

        editorRef.current = e

        e.addAction({
            id: 'submit',
            label: 'Submit Query',
            // eslint-disable-next-line no-bitwise
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            contextMenuOrder: 1.5,
            run: async () => {
                submitQuery.current?.click()
            }
        });
    }

    useEffect(() => {
        const chart = chartRef.current
        if (chart) {
            chart.resize()
            chart.fit()
            chart.center()
        }
    }, [maximize])

    useEffect(() => {
        chartRef?.current?.layout(LAYOUT).run();
    }, [graph.Elements.length]);

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
            return graph.extend(json.result)
        }

        return []
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
        chartRef.current?.add(elements);
    }

    const handleSelected = (evt: EventObject) => {
        const { target } = evt

        if (target.isEdge()) {
            target.style("line-opacity", 0.9);
            target.style("width", 2);
            target.style("arrow-scale", 1);
        } else target.style("border-width", 0.7);

        const obj: ElementDataDefinition = target.json().data;
        handelSetSelectedElement(obj);
    }

    const handleBoxSelected = (evt: EventObject) => {
        const { target } = evt
        const type = target.isEdge() ? "edge" : "node"

        if (type === "edge") {
            target.style("line-opacity", 0.9);
            target.style("width", 2);
            target.style("arrow-scale", 1);
        } else target.style("border-width", 0.7);

        const obj: ElementDataDefinition = target.json().data;

        setSelectedElements(prev => [...prev, obj]);
    }

    const handleUnselected = (evt: EventObject) => {
        const { target } = evt

        if (target.isEdge()) {
            target.style("line-opacity", 0.7);
            target.style("width", 1);
            target.style("arrow-scale", 0.7);
        } else target.style("border-width", 0.3);

        handelSetSelectedElement();
        setSelectedElements([]);
    }

    const handleMouseOver = (evt: EventObject) => {
        const { target } = evt;

        if (target.selected()) return
        if (target.isEdge()) {
            target.style("line-opacity", 0.9);
            target.style("width", 2);
            target.style("arrow-scale", 1);
        } else target.style("border-width", 0.7);
    };

    const handleMouseOut = async (evt: EventObject) => {
        const { target } = evt;

        if (target.selected()) return
        if (target.isEdge()) {
            target.style("line-opacity", 0.7);
            target.style("width", 1);
            target.style("arrow-scale", 0.7);
        } else target.style("border-width", 0.3);
    };

    const setProperty = async (key: string, newVal: string) => {
        const id = selectedElement?.id
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
        const id = selectedElement?.id
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
            graph.Elements.splice(graph.Elements.findIndex(e => e.data.id === id), 1)
            chartRef.current?.remove(`#${id} `)

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
                defaultSize={100}
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
                                        height={lineNumber > MAX_LINE_NUMBER ? MAX_LINE_NUMBER * 38 : lineNumber * 38}
                                        className="Editor"
                                        language="custom-language"
                                        options={{
                                            ...monacoOptions,
                                            lineNumbers: lineNumber > 1 ? "on" : "off",
                                        }}
                                        value={query}
                                        onChange={(val) => setQuery(val || "")}
                                        theme="custom-theme"
                                        beforeMount={handleEditorWillMount}
                                        onMount={handleEditorDidMount}
                                    />
                                    <DialogTrigger asChild>
                                        <Button
                                            className="absolute top-0 right-3 p-2.5"
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
                                    onMount={handleEditorDidMount}
                                    theme="custom-theme"
                                    options={{
                                        lineHeight: 30,
                                        fontSize: 25
                                    }}
                                    value={query}
                                    onChange={(val) => setQuery(val || "")}
                                    language="custom-language"
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
                        chartRef={chartRef}
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
                                onKeyDown={(e) => e.code === "Escape" && setMaximize(false)}
                            />
                    }
                    <CytoscapeComponent
                        className="Canvas"
                        cy={(cy) => {

                            chartRef.current = cy

                            cy.removeAllListeners()

                            cy.on('dbltap', 'node', handleDoubleTap)
                            cy.on('mouseover', 'node', handleMouseOver)
                            cy.on('mouseover', 'edge', handleMouseOver)
                            cy.on('mouseout', 'node', handleMouseOut)
                            cy.on('mouseout', 'edge', handleMouseOut)
                            cy.on('tapunselect', 'node', handleUnselected)
                            cy.on('tapunselect', 'edge', handleUnselected)
                            cy.on('tapselect', 'node', handleSelected)
                            cy.on('tapselect', 'edge', handleSelected)
                            cy.on('boxselect', 'node', handleBoxSelected)
                            cy.on('boxselect', 'edge', handleBoxSelected)
                        }}
                        elements={graph.Elements}
                        layout={LAYOUT}
                        stylesheet={getStyle()}
                    />
                    {
                        (graph.Categories.length > 0 || graph.Labels.length > 0) &&
                        <>
                            <Labels className="left-2" categories={graph.Categories} onClick={onCategoryClick} label="Labels" graph={graph} />
                            <Labels className="right-2 text-end" categories={graph.Labels} onClick={onLabelClick} label="RelationshipTypes" graph={graph} />
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
                        obj={selectedElement}
                        onExpand={onExpand}
                        onDeleteElement={handelDeleteElement}
                    />
                }
            </ResizablePanel>
        </ResizablePanelGroup>
    )
});

GraphView.displayName = "GraphView";

export default GraphView;