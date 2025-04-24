/* eslint-disable consistent-return */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Editor, Monaco } from "@monaco-editor/react"
import { SetStateAction, Dispatch, useEffect, useRef, useState, useContext } from "react"
import * as monaco from "monaco-editor";
import { Info, Maximize2, Minimize2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { HistoryQuery, prepareArg, securedFetch } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Button from "./ui/Button";
import CloseDialog from "./CloseDialog";
import { IndicatorContext, GraphContext } from "./provider";

interface Props {
    historyQuery: HistoryQuery
    maximize: boolean
    runQuery: (query: string, timeout?: number) => Promise<boolean>
    setHistoryQuery: Dispatch<SetStateAction<HistoryQuery>>
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

const SUGGESTIONS: monaco.languages.CompletionItem[] = [
    ...KEYWORDS.map(key => ({
        insertText: key,
        label: key,
        kind: monaco.languages.CompletionItemKind.Keyword,
        range: new monaco.Range(1, 1, 1, 1),
        detail: "(keyword)"
    })),
    ...FUNCTIONS.map(f => ({
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        insertText: `${f}(\${0})`,
        label: `${f}()`,
        kind: monaco.languages.CompletionItemKind.Function,
        range: new monaco.Range(1, 1, 1, 1),
        detail: "(function)"
    }))
]

const MAX_HEIGHT = 20
const LINE_HEIGHT = 38

const PLACEHOLDER = "Type your query here to start"

export default function EditorComponent({ historyQuery, maximize, runQuery, setHistoryQuery }: Props) {

    const placeholderRef = useRef<HTMLDivElement>(null)
    const [lineNumber, setLineNumber] = useState(1)
    const [blur, setBlur] = useState(false)
    const [sugDisposed, setSugDisposed] = useState<monaco.IDisposable>()
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const { indicator, setIndicator } = useContext(IndicatorContext)
    const { graph } = useContext(GraphContext)
    const graphIdRef = useRef(graph.Id)
    const submitQuery = useRef<HTMLButtonElement>(null)
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const indicatorRef = useRef(indicator)

    useEffect(() => {
        indicatorRef.current = indicator
    }, [indicator])

    useEffect(() => {
        setHistoryQuery(prev => ({
            ...prev,
            query: historyQuery.counter ? historyQuery.queries[historyQuery.counter - 1].text : historyQuery.currentQuery
        }))
    }, [historyQuery.counter])

    useEffect(() => {
        if (historyQuery.query && placeholderRef.current) {
            placeholderRef.current.style.display = "none"
        } else if (!historyQuery.query && placeholderRef.current && blur) {
            placeholderRef.current.style.display = "block"
        }
    }, [historyQuery.query])

    useEffect(() => {
        graphIdRef.current = graph.Id
    }, [graph.Id])

    useEffect(() => () => {
        sugDisposed?.dispose()
    }, [sugDisposed])

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
                'focusBorder': '#00000000',
            },
        });

        monacoI.editor.setTheme('custom-theme')
    }

    const fetchSuggestions = async (detail: string): Promise<monaco.languages.CompletionItem[]> => {
        if (indicator === "offline") return []

        const result = await securedFetch(`api/graph/${graphIdRef.current}/suggestions/?type=${prepareArg(detail)}`, {
            method: 'GET',
        }, toast, setIndicator)

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

    const getSuggestions = async () => (await Promise.all([
        fetchSuggestions('(function)'),
        fetchSuggestions('(property key)'),
        fetchSuggestions('(label)'),
        fetchSuggestions('(relationship type)')
    ])).flat()

    const addSuggestions = async (monacoI: Monaco) => {
        const sug = [
            ...SUGGESTIONS,
            ...(graphIdRef.current ? await getSuggestions() : [])
        ];

        const functions = sug.filter(({ detail }) => detail === "(function)")

        const namespaces = new Set(
            functions
                .filter(({ label }) => (label as string).includes("."))
                .map(({ label }) => {
                    const newNamespaces = (label as string).split(".")
                    newNamespaces.pop()
                    return newNamespaces
                }).flat()
        )

        monacoI.languages.setMonarchTokensProvider('custom-language', {
            tokenizer: {
                root: graphIdRef.current ? [
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
                ] : [
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

        return sug
    }

    const handleSubmit = async () => {
        try {
            setIsLoading(true)
            await runQuery(historyQuery.query)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditorWillMount = async (monacoI: Monaco) => {

        monacoI.languages.register({ id: "custom-language" })

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

        setTheme(monacoI)

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

        const provider = monacoI.languages.registerCompletionItemProvider("custom-language", {
            provideCompletionItems: async (model, position) => {
                const word = model.getWordUntilPosition(position)
                const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn)
                return {
                    suggestions: (await addSuggestions(monacoI)).map(s => ({ ...s, range }))
                }
            },
        })

        setSugDisposed(provider)
    }

    const handleEditorDidMount = (e: monaco.editor.IStandaloneCodeEditor) => {
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

        const isFirstLine = e.createContextKey<boolean>('isFirstLine', true);

        // Update the context key value based on the cursor position
        e.onDidChangeCursorPosition(() => {
            const position = e.getPosition();
            if (position) {
                isFirstLine.set(position.lineNumber === 1);
            }
        });

        // eslint-disable-next-line no-bitwise
        e.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
            e.trigger('keyboard', 'type', { text: '\n' });
        });

        // eslint-disable-next-line no-bitwise
        e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            if (indicatorRef.current === "offline") return
            submitQuery.current?.click();
        });

        e.addAction({
            id: 'submit',
            label: 'Submit Query',
            // eslint-disable-next-line no-bitwise
            keybindings: [monaco.KeyCode.Enter],
            contextMenuOrder: 1.5,
            run: async () => {
                if (indicatorRef.current === "offline") return
                submitQuery.current?.click()
            },
            precondition: '!suggestWidgetVisible',
        });

        e.addAction({
            id: 'history up',
            label: 'history up',
            keybindings: [monaco.KeyCode.UpArrow],
            contextMenuOrder: 1.5,
            run: async () => {
                setHistoryQuery(prev => {
                    if (prev.queries.length === 0) return prev;

                    let counter;
                    if (prev.counter !== 1) {
                        counter = prev.counter ? prev.counter - 1 : prev.queries.length;
                        // Run provideCompletion when counter changes from 0 to queries.length
                        if (!prev.counter && counter === prev.queries.length) {
                            e.trigger('keyboard', 'editor.action.triggerSuggest', {});
                        }
                    } else {
                        counter = 1;
                    }

                    return {
                        ...prev,
                        counter
                    }
                })
            },
            precondition: 'isFirstLine && !suggestWidgetVisible',
        });

        e.addAction({
            id: 'history down',
            label: 'history down',
            keybindings: [monaco.KeyCode.DownArrow],
            contextMenuOrder: 1.5,
            run: async () => {
                setHistoryQuery(prev => {
                    if (prev.queries.length === 0) return prev
                    let counter
                    if (prev.counter) {
                        counter = prev.counter + 1 > prev.queries.length ? 0 : prev.counter + 1
                    } else {
                        counter = 0
                    }
                    return {
                        ...prev,
                        counter
                    }
                })
            },
            precondition: 'isFirstLine && !suggestWidgetVisible',
        });

        // Override the default Ctrl + F keybinding
        // eslint-disable-next-line no-bitwise
        e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => { });
    }

    useEffect(() => {
        setLineNumber(historyQuery.query.split("\n").length)
    }, [historyQuery.query])

    return (
        <div>
            {
                !maximize &&
                <Dialog>
                    <div className="w-full flex items-center gap-8">
                        <p>Query</p>
                        <div className="w-1 grow flex rounded-lg overflow-hidden">
                            <div ref={containerRef} className="relative grow w-1" id="editor-container">
                                <Editor
                                    // eslint-disable-next-line no-nested-ternary
                                    height={blur ? LINE_HEIGHT : lineNumber * LINE_HEIGHT > document.body.clientHeight / 100 * MAX_HEIGHT ? document.body.clientHeight / 100 * MAX_HEIGHT : lineNumber * LINE_HEIGHT}
                                    language="custom-language"
                                    options={{
                                        ...monacoOptions,
                                        lineNumbers: lineNumber > 1 ? "on" : "off",
                                    }}
                                    value={blur ? historyQuery.query.replace(/\s+/g, ' ').trim() : historyQuery.query}
                                    onChange={(val) => {
                                        if (!historyQuery.counter) {
                                            setHistoryQuery(prev => ({
                                                ...prev,
                                                currentQuery: val || "",
                                                query: val || "",
                                            }))
                                        } else {
                                            setHistoryQuery(prev => ({
                                                ...prev,
                                                query: val || "",
                                            }))
                                        }
                                    }}
                                    theme="custom-theme"
                                    beforeMount={handleEditorWillMount}
                                    onMount={handleEditorDidMount}
                                />
                                <div className="h-full absolute top-0 px-2 right-0 flex gap-2 items-center justify-center pointer-events-none">
                                    <DialogTrigger className="pointer-events-auto" asChild>
                                        <Button
                                            title="Maximize"
                                        >
                                            <Maximize2 size={20} />
                                        </Button>
                                    </DialogTrigger>
                                    <Button
                                        className="pointer-events-auto"
                                        title="Run (Enter) History (Arrow Up/Down) Insert new line (Shift + Enter)"
                                    >
                                        <Info />
                        
                                    </Button>
                                </div>
                                <div ref={placeholderRef} className="absolute top-2 left-2 pointer-events-none">
                                    {PLACEHOLDER}
                                </div>
                            </div>
                            <Button
                                ref={submitQuery}
                                indicator={indicator}
                                className="rounded-none py-2 px-8"
                                variant="Primary"
                                label="Run"
                                title="Press Enter to run the query"
                                onClick={handleSubmit}
                                isLoading={isLoading}
                            />
                        </div>
                        <DialogContent disableClose className="w-full h-full">
                            <div className="relative w-full h-full">
                                <VisuallyHidden>
                                    <DialogTitle />
                                    <DialogDescription />
                                </VisuallyHidden>
                                <div className="z-10 absolute right-0 top-0 bottom-0 py-4 px-8 flex flex-col items-end justify-between pointer-events-none">
                                    <CloseDialog
                                        className="pointer-events-auto"
                                    >
                                        <Minimize2 size={20} />
                                    </CloseDialog>
                                    <CloseDialog
                                        className="pointer-events-auto py-2 px-8"
                                        indicator={indicator}
                                        variant="Primary"
                                        label="Run"
                                        title="Press Enter to run the query"
                                        onClick={handleSubmit}
                                        isLoading={isLoading}
                                    />
                                </div>
                                <Editor
                                    className="w-full h-full"
                                    onMount={handleEditorDidMount}
                                    theme="custom-theme"
                                    options={{
                                        padding: {
                                            bottom: 10,
                                            top: 10,
                                        },
                                        lineNumbersMinChars: 3,
                                        minimap: { enabled: false },
                                        lineHeight: 30,
                                        fontSize: 25,
                                    }}
                                    value={(blur ? historyQuery.query.replace(/\s+/g, ' ').trim() : historyQuery.query)}
                                    onChange={(val) => {
                                        if (historyQuery.counter) {
                                            setHistoryQuery(prev => ({
                                                ...prev,
                                                query: val || ""
                                            }))
                                        } else {
                                            setHistoryQuery(prev => ({
                                                ...prev,
                                                query: val || "",
                                                currentQuery: val || ""
                                            }))
                                        }
                                    }}
                                    language="custom-language"
                                />
                            </div>
                        </DialogContent>
                    </div>
                </Dialog>
            }
        </div >
    )
}
