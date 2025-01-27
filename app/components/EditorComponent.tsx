/* eslint-disable consistent-return */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Editor, Monaco } from "@monaco-editor/react"
import { useEffect, useRef, useState } from "react"
import * as monaco from "monaco-editor";
import { Maximize2 } from "lucide-react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Session } from "next-auth";
import { Graph } from "../api/graph/model";
import Button from "./ui/Button";

interface Props {
    currentQuery: string
    historyQueries: string[]
    setCurrentQuery: (query: string) => void
    maximize: boolean
    runQuery: (query: string) => void
    graph: Graph
    data: Session | null
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
    fontSize: 26,
    fontWeight: "200",
    wordWrap: "off",
    lineHeight: 37,
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
    "MERGE",
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

const SUGGESTIONS: monaco.languages.CompletionItem[] = KEYWORDS.map(key => ({
    insertText: key,
    label: key,
    kind: monaco.languages.CompletionItemKind.Keyword,
    range: new monaco.Range(1, 1, 1, 1),
    detail: "(keyword)"
}))

const MAX_HEIGHT = 20
const LINE_HEIGHT = 38

const PLACEHOLDER = "Type your query here to start"

export default function EditorComponent({ currentQuery, historyQueries, setCurrentQuery, maximize, runQuery, graph, data }: Props) {

    const [query, setQuery] = useState(currentQuery)
    const placeholderRef = useRef<HTMLDivElement>(null)
    const [monacoInstance, setMonacoInstance] = useState<Monaco>()
    const [sugProvider, setSugProvider] = useState<monaco.IDisposable>()
    const [lineNumber, setLineNumber] = useState(1)
    const [blur, setBlur] = useState(false)
    const { toast } = useToast()
    const submitQuery = useRef<HTMLButtonElement>(null)
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const historyRef = useRef({
        historyQueries,
        currentQuery,
        historyCounter: historyQueries.length
    })

    useEffect(() => {
        historyRef.current.historyQueries = historyQueries
    }, [historyQueries, currentQuery])

    useEffect(() => {
        if (!containerRef.current) return

        const handleResize = () => {
            editorRef.current?.layout()
        }

        window.addEventListener("resize", handleResize)

        const observer = new ResizeObserver(handleResize)

        observer.observe(containerRef.current)

        return () => {
            window.removeEventListener("resize", handleResize)
            observer.disconnect()
        }
    }, [containerRef.current])

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
                { token: 'string', foreground: '#CE9178' },
                { token: 'number', foreground: '#b5cea8' },
            ],
            colors: {
                'editor.background': '#191919',
                'editor.foreground': '#ffffff',
                'editorSuggestWidget.background': '#272745',
                'editorSuggestWidget.foreground': '#FFFFFF',
                'editorSuggestWidget.selectedBackground': '#57577B',
                'editorSuggestWidget.hoverBackground': '#28283F',
            },
        });
    }

    const fetchSuggestions = async (q: string, detail: string): Promise<monaco.languages.CompletionItem[]> => {
        const result = await securedFetch(`api/graph/${graph.Id}/?query=${prepareArg(q)}&role=${data?.user.role}`, {
            method: 'GET',
        }, toast)

        if (!result) return []

        const json = await result.json()

        if (json.result.data.length === 0) return []

        return json.result.data.map(({ sug }: { sug: string }) => ({
            insertTextRules: detail === '(function)' ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
            insertText: detail === '(function)' ? `${sug}(\${0})` : sug,
            label: detail === '(function)' ? `${sug}()` : sug,
            kind: (() => {
                switch (detail) {
                    case '(function)':
                        return monaco.languages.CompletionItemKind.Function;
                    case '(property key)':
                        return monaco.languages.CompletionItemKind.Property;
                    default:
                        return monaco.languages.CompletionItemKind.Variable;
                }
            })(),
            range: new monaco.Range(1, 1, 1, 1),
            detail
        }))
    }

    const getSuggestions = async (): Promise<monaco.languages.CompletionItem[]> => {
        const suggestions = await Promise.all([
            ['CALL dbms.procedures() YIELD name as sug', '(function)'],
            ['CALL db.propertyKeys() YIELD propertyKey as sug', '(property key)'],
            ['CALL db.labels() YIELD label as sug', '(label)'],
            ['CALL db.relationshipTypes() YIELD relationshipType as sug', '(relationship type)']
        ].map(([q, detail]) => fetchSuggestions(q, detail)))

        return [...suggestions.flatMap(arr => arr), ...FUNCTIONS.map(f => ({
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            insertText: `${f}(\${0})`,
            label: `${f}()`,
            kind: monaco.languages.CompletionItemKind.Function,
            range: new monaco.Range(1, 1, 1, 1),
            detail: "(function)"
        }))]
    }

    const addSuggestions = async (monacoI: Monaco) => {
        console.log("addSuggestions");
        const suggestions = SUGGESTIONS

        if (graph.Id) {
            console.log("getSuggestions");
            suggestions.push(...(await getSuggestions()))
        }

        const functions = suggestions.filter(({ detail }) => detail === "(function)")

        const namespaces = new Set(functions.filter(({ label }) => (label as string).includes(".")).map(({ label }) => {
            const [namespace] = (label as string).split(".")
            return namespace
        }))

        if (sugProvider) {
            sugProvider.dispose()
            console.log("dispose");
        }

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

        if (graph.Id) {
            monacoI.languages.setMonarchTokensProvider('custom-language', {
                tokenizer: {
                    root: [
                        [new RegExp(`\\b(${Array.from(namespaces.keys()).join('|')})\\b`), "keyword"],
                        [new RegExp(`\\b(${KEYWORDS.join('|')})\\b`), "keyword"],
                        [
                            new RegExp(`\\b(${functions.map(({ label }) => {
                                if ((label as string).includes(".")) {
                                    const labels = (label as string).split(".")
                                    return labels[labels.length - 1]
                                }
                                return label
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
        } else {
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
            })
        }

        return monacoI.languages.registerCompletionItemProvider("custom-language", {
            provideCompletionItems: (model, position) => {
                const word = model.getWordUntilPosition(position)
                const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn)
                console.log(suggestions);
                return {
                    suggestions: suggestions.map(s => ({ ...s, range }))
                }
            },
        })
    }

    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (!monacoInstance) return
            const provider = await addSuggestions(monacoInstance)
            setSugProvider(provider)
        }, 5000)

        return () => {
            clearTimeout(timeout)
            if (sugProvider) {
                sugProvider.dispose()
                console.log("cleanup dispose");
            }
            console.log("cleanup");
        }
    }, [graph.Id])

    const handleEditorWillMount = async (monacoI: Monaco) => {

        monacoI.languages.register({ id: "custom-language" })

        setTheme(monacoI)

        const provider = await addSuggestions(monacoI)

        setSugProvider(provider)
        setMonacoInstance(monacoI)
    }
    
    const handleEditorDidMount = (e: monaco.editor.IStandaloneCodeEditor, monacoI: Monaco) => {
        editorRef.current = e

        const updatePlaceholderVisibility = () => {
            const hasContent = !!e.getValue();
            if (placeholderRef.current) {
                placeholderRef.current.style.display = hasContent ? 'none' : 'block';
            }
        };

        e.onDidFocusEditorText(() => {
            if (placeholderRef.current) {
                placeholderRef.current.style.display = 'none';
            }
            setBlur(false)
        });

        e.onDidBlurEditorText(() => {
            updatePlaceholderVisibility();
            setBlur(true)
        });

        updatePlaceholderVisibility();

        setMonacoInstance(monacoI)


        const isFirstLine = e.createContextKey<boolean>('isFirstLine', true);

        // Update the context key value based on the cursor position
        e.onDidChangeCursorPosition(() => {
            const position = e.getPosition();
            if (position) {
                isFirstLine.set(position.lineNumber === 1);
            }
        });

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
                if (historyRef.current.historyQueries.length === 0) return
                const counter = historyRef.current.historyCounter ? historyRef.current.historyCounter - 1 : historyRef.current.historyQueries.length;
                historyRef.current.historyCounter = counter;
                setQuery(counter ? historyRef.current.historyQueries[counter - 1] : historyRef.current.currentQuery);
            },
            precondition: 'isFirstLine && !suggestWidgetVisible',
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
            precondition: 'isFirstLine && !suggestWidgetVisible',
        });
    }

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
                            <div ref={containerRef} className="relative grow w-1">
                                <Editor
                                    // eslint-disable-next-line no-nested-ternary
                                    height={blur ? LINE_HEIGHT : lineNumber * LINE_HEIGHT > document.body.clientHeight / 100 * MAX_HEIGHT ? document.body.clientHeight / 100 * MAX_HEIGHT : lineNumber * LINE_HEIGHT}
                                    language="custom-language"
                                    options={{
                                        ...monacoOptions,
                                        lineNumbers: lineNumber > 1 ? "on" : "off",
                                    }}
                                    value={(blur ? query.replace(/\s+/g, ' ').trim() : query)}
                                    onChange={(val) => {
                                        if (historyRef.current.historyCounter) {
                                            setQuery(val || "");
                                        } else {
                                            setCurrentQuery(val || "");
                                        }
                                        setLineNumber(val?.split("\n").length || 1);
                                    }}
                                    theme="custom-theme"
                                    beforeMount={handleEditorWillMount}
                                    onMount={handleEditorDidMount}
                                />
                                <DialogTrigger asChild>
                                    <Button
                                        className="absolute top-0 right-3 p-2.5"
                                        title="Maximize"
                                    >
                                        <Maximize2 size={20} />
                                    </Button>
                                </DialogTrigger>
                                <div ref={placeholderRef} className="absolute top-2 left-2 pointer-events-none">
                                    {PLACEHOLDER}
                                </div>
                            </div>
                            <Button
                                ref={submitQuery}
                                className="rounded-none py-2 px-8"
                                variant="Primary"
                                title="Run (Ctrl + Enter)"
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