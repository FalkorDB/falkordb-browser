/* eslint-disable consistent-return */
/* eslint-disable react-hooks/exhaustive-deps */
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Editor, Monaco } from "@monaco-editor/react"
import { useEffect, useRef, useState } from "react"
import * as monaco from "monaco-editor";
import { prepareArg, securedFetch } from "@/lib/utils";
import { Maximize2 } from "lucide-react";
import { Graph } from "../api/graph/model";
import Button from "./ui/Button";

type Suggestions = {
    keywords: monaco.languages.CompletionItem[],
    labels: monaco.languages.CompletionItem[],
    relationshipTypes: monaco.languages.CompletionItem[],
    propertyKeys: monaco.languages.CompletionItem[],
    functions: monaco.languages.CompletionItem[]
}

interface Props {
    currentQuery: string
    historyQueries: string[]
    setCurrentQuery: (query: string) => void
    maximize: boolean
    runQuery: (query: string) => void
    graph: Graph
    isCollapsed: boolean
}

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    renderLineHighlight: "none",
    glyphMargin: false,
    lineDecorationsWidth: 5,
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
    fontWeight: "200",
    wordWrap: "off",
    lineHeight: 38,
    lineNumbers: "on",
    lineNumbersMinChars: 2,
    overviewRulerLanes: 0,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    scrollBeyondLastColumn: 0,
    scrollBeyondLastLine: false,
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

const FUNCTIONS = [
    "all",
    "any",
    "exists",
    "isEmpty",
    "none",
    "single",
    "coalesce",
    "endNode",
    "hasLabels",
    "id",
    "labels",
    "properties",
    "randomUUID",
    "startNode",
    "timestamp",
    "type",
    "typeOf",
    "avg",
    "collect",
    "count",
    "max",
    "min",
    "percentileCont",
    "percentileDisc",
    "stDevP",
    "sum",
    "head",
    "keys",
    "last",
    "range",
    "size",
    "tail",
    "reduce",
    "abs",
    "ceil",
    "e",
    "exp",
    "floor",
    "log",
    "log10",
    "pow",
    "rand",
    "round",
    "sign",
    "sqrt",
    "acos",
    "atan",
    "atan2",
    "cos",
    "cot",
    "degrees",
    "haversin",
    "pi",
    "radians",
    "sin",
    "tan",
    "left",
    "lTrim",
    "replace",
    "reverse",
    "right",
    "rTrim",
    "split",
    "substring",
    "toLower",
    "toJSON",
    "toUpper",
    "trim",
    "size",
    "point",
    "distance",
    "toBoolean",
    "toBooleanList",
    "toBooleanOrNull",
    "toFloat",
    "toFloatList",
    "toFloatOrNull",
    "toInteger",
    "toIntegerList",
    "toIntegerOrNull",
    "toString",
    "toStringList",
    "toStringOrNull",
    "indegree",
    "outdegree",
    "nodes",
    "relationships",
    "length",
    "shortestPath",
    "vecf32",
    "vec.euclideanDistance",
    "vec.cosineDistance",
]

const MAX_HEIGHT = 20
const LINE_HEIGHT = 38

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
    functions: []
})

export default function EditorComponent({ currentQuery, historyQueries, setCurrentQuery, maximize, runQuery, graph, isCollapsed }: Props) {

    const [query, setQuery] = useState(currentQuery)
    const [monacoInstance, setMonacoInstance] = useState<Monaco>()
    const [prevGraphName, setPrevGraphName] = useState<string>("")
    const [sugProvider, setSugProvider] = useState<monaco.IDisposable>()
    const [suggestions, setSuggestions] = useState<Suggestions>(getEmptySuggestions())
    const [lineNumber, setLineNumber] = useState(0)
    const submitQuery = useRef<HTMLButtonElement>(null)
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const [blur, setBlur] = useState(false)
    const historyRef = useRef({
        historyQueries,
        currentQuery,
        historyCounter: historyQueries.length
    })

    useEffect(() => {
        historyRef.current.historyQueries = historyQueries
    }, [historyQueries, currentQuery])

    useEffect(() => {
        if (!editorRef.current) return
        editorRef.current.layout();
    }, [isCollapsed])

    useEffect(() => {
        setQuery(currentQuery)
        historyRef.current.currentQuery = currentQuery
    }, [currentQuery])

    const setTheme = (monacoI: Monaco) => {
        monacoI.editor.defineTheme('custom-theme', {
            base: 'vs-dark',
            inherit: true,
            rules: [
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

    const addSuggestions = (MonacoI: Monaco, sug?: monaco.languages.CompletionItem[], procedures?: monaco.languages.CompletionItem[]) => {

        sugProvider?.dispose()
        const provider = MonacoI.languages.registerCompletionItemProvider('custom-language', {
            triggerCharacters: ["."],
            provideCompletionItems: (model, position) => {
                const word = model.getWordUntilPosition(position)
                const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn)

                return {
                    suggestions: [
                        ...(sug || []).map(s => ({ ...s, range })),
                        ...suggestions.keywords.map(s => ({ ...s, range })),
                        ...(procedures || []).map(s => ({ ...s, range,  }))
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

    const addFunctionsSuggestions = async (functions: monaco.languages.CompletionItem[]) => {
        const proceduresQuery = `CALL dbms.procedures() YIELD name`
        await securedFetch(`api/graph/${prepareArg(graph.Id)}/?query=${prepareArg(proceduresQuery)}`, {
            method: "GET"
        }).then((res) => res.json()).then((json) => {
            [...json.result.data.map(({ name }: { name: string }) => name), ...FUNCTIONS].forEach((name: string) => {
                functions.push({
                    label: name,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    insertText: `${name}($0)`,
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
            addFunctionsSuggestions(sug.functions)
        ])

        const namespaces = new Map()

        sug.functions.forEach(({ label }) => {
            const names = (label as string).split(".")
            names.forEach((name, i) => {
                if (i === names.length - 1) return
                namespaces.set(name, name)
            })
        })

        monacoInstance.languages.setMonarchTokensProvider('custom-language', {
            tokenizer: {
                root: [
                    [new RegExp(`\\b(${Array.from(namespaces.keys()).join('|')})\\b`), "keyword"],
                    [new RegExp(`\\b(${KEYWORDS.join('|')})\\b`), "keyword"],
                    [
                        new RegExp(`\\b(${sug.functions.map(({ label }) => {
                            const labels = (label as string).split(".")
                            return labels[labels.length - 1]
                        }).join('|')})\\b`),
                        "function"
                    ],
                    [/"([^"\\]|\\.)*"/, 'string'],
                    [/'([^'\\]|\\.)*'/, 'string'],
                    [/\d+/, 'number'],
                    [/:(\w+)/, 'type'],
                    [/\{/, { token: 'delimiter.curly', next: '@bracketCounting' }],
                    [/\[/, { token: 'delimiter.square', next: '@bracketCounting' }],
                    [/\(/, { token: 'delimiter.parenthesis', next: '@bracketCounting' }],
                ],
                bracketCounting: [
                    [/\{/, 'delimiter.curly', '@bracketCounting'],
                    [/\}/, 'delimiter.curly', '@pop'],
                    [/\[/, 'delimiter.square', '@bracketCounting'],
                    [/\]/, 'delimiter.square', '@pop'],
                    [/\(/, 'delimiter.parenthesis', '@bracketCounting'],
                    [/\)/, 'delimiter.parenthesis', '@pop'],
                    { include: 'root' }
                ],
            },
            ignoreCase: true,
        })

        monacoInstance.languages.setLanguageConfiguration('custom-language', {
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
            ],
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"', notIn: ['string'] },
                { open: "'", close: "'", notIn: ['string', 'comment'] }
            ],
            surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" }
            ]
        });

        monacoInstance.editor.setTheme('custom-theme');

        addSuggestions(monacoInstance, [...sug.labels, ...sug.propertyKeys, ...sug.relationshipTypes], sug.functions)

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

            addSuggestions(monacoInstance, [...sug.labels, ...sug.propertyKeys, ...sug.relationshipTypes], sug.functions)

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

    const handleEditorWillMount = (monacoI: Monaco) => {
        monacoI.languages.setMonarchTokensProvider('custom-language', {
            tokenizer: {
                root: [
                    [new RegExp(`\\b(${KEYWORDS.join('|')})\\b`), "keyword"],
                    [/"([^"\\]|\\.)*"/, 'string'],
                    [/'([^'\\]|\\.)*'/, 'string'],
                    [/\d+/, 'number'],
                    [/:(\w+)/, 'type'],
                    [/\{/, { token: 'delimiter.curly', next: '@bracketCounting' }],
                    [/\[/, { token: 'delimiter.square', next: '@bracketCounting' }],
                    [/\(/, { token: 'delimiter.parenthesis', next: '@bracketCounting' }],
                ],
                bracketCounting: [
                    [/\{/, 'delimiter.curly', '@bracketCounting'],
                    [/\}/, 'delimiter.curly', '@pop'],
                    [/\[/, 'delimiter.square', '@bracketCounting'],
                    [/\]/, 'delimiter.square', '@pop'],
                    [/\(/, 'delimiter.parenthesis', '@bracketCounting'],
                    [/\)/, 'delimiter.parenthesis', '@pop'],
                    { include: 'root' }
                ],
            },
            ignoreCase: true,
        });

        monacoI.languages.register({ id: 'custom-language' });

        monacoI.languages.setLanguageConfiguration('custom-language', {
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
            ],
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"', notIn: ['string'] },
                { open: "'", close: "'", notIn: ['string', 'comment'] }
            ],
            surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" }
            ]
        });

        setTheme(monacoI)

        monacoI.editor.setTheme('custom-theme');

        addSuggestions(monacoI)
    };

    const handleEditorDidMount = (e: monaco.editor.IStandaloneCodeEditor, monacoI: Monaco) => {

        setMonacoInstance(monacoI)

        editorRef.current = e

        e.onDidBlurEditorText(() => {
            setBlur(true)
        })

        e.onDidFocusEditorText(() => {
            setBlur(false)
        })

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

        e.addAction({
            id: 'history up',
            label: 'history up',
            keybindings: [monaco.KeyCode.UpArrow],
            contextMenuOrder: 1.5,
            run: async () => {
                const counter = historyRef.current.historyCounter ? historyRef.current.historyCounter - 1 : historyRef.current.historyQueries.length
                historyRef.current.historyCounter = counter
                setQuery(counter ? historyRef.current.historyQueries[counter - 1] : historyRef.current.currentQuery)
            },
            precondition: '!suggestWidgetVisible',
        });
        
        e.addAction({
            id: 'history down',
            label: 'history down',
            keybindings: [monaco.KeyCode.DownArrow],
            contextMenuOrder: 1.5,
            run: async () => {
                if (historyRef.current.historyQueries.length === 0) return
                const counter = (historyRef.current.historyCounter + 1) % (historyRef.current.historyQueries.length + 1)
                historyRef.current.historyCounter = counter
                setQuery(counter ? historyRef.current.historyQueries[counter - 1] : historyRef.current.currentQuery)
            },
            precondition: '!suggestWidgetVisible',
        });
    }

    useEffect(() => {
        setLineNumber(query.split("\n").length)
    }, [query])

    return (
        <div>
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
                                    // eslint-disable-next-line no-nested-ternary
                                    height={blur ? LINE_HEIGHT : lineNumber * LINE_HEIGHT > document.body.clientHeight / 100 * MAX_HEIGHT ? document.body.clientHeight / 100 * MAX_HEIGHT : lineNumber * LINE_HEIGHT}
                                    className="Editor"
                                    language="custom-language"
                                    options={monacoOptions}
                                    value={blur ? query.trim() : query}
                                    onChange={(val) => historyRef.current.historyCounter ? setQuery(val || "") : setCurrentQuery(val || "")}
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
        </div>
    )
}