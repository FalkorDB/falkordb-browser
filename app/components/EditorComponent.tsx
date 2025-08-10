/* eslint-disable consistent-return */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Editor, Monaco } from "@monaco-editor/react"
import { SetStateAction, Dispatch, useEffect, useRef, useState, useContext, useMemo } from "react"
import * as monaco from "monaco-editor";
import { Minimize2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn, prepareArg, securedFetch } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTheme } from "next-themes";
import Button from "./ui/Button";
import CloseDialog from "./CloseDialog";
import { IndicatorContext } from "./provider";
import { Graph, HistoryQuery } from "../api/graph/model";

export const setTheme = (monacoI: Monaco, themeName: string, isDark: boolean) => {
    const backgroundColor = isDark ? '#191919' : '#ffffff';
    const foregroundColor = isDark ? '#ffffff' : '#000000';
    
    monacoI.editor.defineTheme(themeName, {
        base: isDark ? 'vs-dark' : 'vs',
        inherit: true,
        rules: [
            { token: 'keyword', foreground: isDark ? '#99E4E5' : '#0000FF' },
            { token: 'function', foreground: isDark ? '#DCDCAA' : '#795E26' },
            { token: 'type', foreground: isDark ? '#89D86D' : '#267F99' },
            { token: 'string', foreground: isDark ? '#CE9178' : '#A31515' },
            { token: 'number', foreground: isDark ? '#b5cea8' : '#098658' },
        ],
        colors: {
            'editor.background': backgroundColor,
            'editor.foreground': foregroundColor,
            'editor.lineHighlightBackground': isDark ? '#2A2A2A' : '#F7F7F7',
            'editor.selectionBackground': isDark ? '#264F78' : '#ADD6FF',
            'editor.inactiveSelectionBackground': isDark ? '#3A3D41' : '#E5EBF1',
            'editorCursor.foreground': isDark ? '#AEAFAD' : '#000000',
            'editorSuggestWidget.background': isDark ? '#272745' : '#F3F3F3',
            'editorSuggestWidget.foreground': isDark ? '#FFFFFF' : '#000000',
            'editorSuggestWidget.selectedBackground': isDark ? '#57577B' : '#0060C0',
            'editorSuggestWidget.hoverBackground': isDark ? '#28283F' : '#F0F0F0',
            'focusBorder': '#00000000',
        },
    });

    monacoI.editor.setTheme(themeName)
}

interface Props {
    graph: Graph
    historyQuery: HistoryQuery
    maximize: boolean
    setMaximize: Dispatch<SetStateAction<boolean>>
    runQuery: (query: string) => Promise<void>
    setHistoryQuery: Dispatch<SetStateAction<HistoryQuery>>
    editorKey: string
    isQueryLoading: boolean
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
    fontSize: 24,
    fontWeight: "400",
    wordWrap: "off",
    lineHeight: 32,
    lineNumbersMinChars: 2,
    overviewRulerLanes: 0,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    scrollBeyondLastColumn: 0,
    scrollBeyondLastLine: false,
    overflowWidgetsDomNode: undefined,
    scrollbar: {
        vertical: 'hidden',
        horizontal: 'hidden'
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
const LINE_HEIGHT = 32

const PLACEHOLDER = "Type your query here to start"

export default function EditorComponent({ graph, historyQuery, maximize, setMaximize, runQuery, setHistoryQuery, editorKey, isQueryLoading }: Props) {
    const { indicator, setIndicator } = useContext(IndicatorContext)
    const { theme, resolvedTheme } = useTheme()

    const { toast } = useToast()

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const dialogEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const placeholderRef = useRef<HTMLDivElement>(null)
    const submitQuery = useRef<HTMLButtonElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const indicatorRef = useRef(indicator)
    const graphIdRef = useRef(graph.Id)

    const [monacoEditor, setMonacoEditor] = useState<Monaco | null>(null)
    const [sugDisposed, setSugDisposed] = useState<monaco.IDisposable>()
    const [lineNumber, setLineNumber] = useState(1)
    const [blur, setBlur] = useState(false)

    const editorHeight = useMemo(() => blur
        ? LINE_HEIGHT
        : Math.min(lineNumber * LINE_HEIGHT, document.body.clientHeight / 100 * MAX_HEIGHT),
        [blur, lineNumber])

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

    useEffect(() => {
        setLineNumber(historyQuery.query.split("\n").length)
    }, [historyQuery.query])

    // Update Monaco theme when theme changes
    useEffect(() => {
        if (monacoEditor) {
            const isDark = resolvedTheme === 'dark';
            setTheme(monacoEditor, editorKey, isDark)
        }
    }, [theme, resolvedTheme, monacoEditor, editorKey])

    const fetchSuggestions = async (detail: string): Promise<monaco.languages.CompletionItem[]> => {
        if (indicator === "offline") return []

        const result = await securedFetch(`api/graph/${graphIdRef.current}/suggestions?type=${prepareArg(detail)}`, {
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

    useEffect(() => {
        if (monacoEditor) {
            addSuggestions(monacoEditor)
        }
    }, [monacoEditor, graphIdRef.current])

    const handleSubmit = async () => {
        runQuery(historyQuery.query.trim())
    }

    const handleEditorWillMount = async (monacoI: Monaco) => {
        setMonacoEditor(monacoI)

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

        // Check theme and apply it - more explicit dark mode detection
        const isDark = resolvedTheme === 'dark';

        // Apply theme immediately and also with a small delay to ensure it takes effect
        setTheme(monacoI, editorKey, isDark)
        setTimeout(() => {
            setTheme(monacoI, editorKey, isDark)
        }, 100)

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

        addSuggestions(monacoI)

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
        const updatePlaceholderVisibility = () => {
            const hasContent = !!e.getValue();
            if (placeholderRef.current) {
                placeholderRef.current.style.display = hasContent ? 'none' : 'block';
            }
        };

        // Ensure theme is applied after editor is mounted
        if (monacoEditor) {
            const isDark = resolvedTheme === 'dark';
            setTheme(monacoEditor, editorKey, isDark);
        }

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
        const isLastLine = e.createContextKey<boolean>('isLastLine', true);

        // Update the context key value based on the cursor position
        e.onDidChangeCursorPosition(() => {
            const position = e.getPosition();
            if (position) {
                isFirstLine.set(position.lineNumber === 1);
                isLastLine.set(position.lineNumber === e.getModel()?.getLineCount());
            }
        });

        e.addCommand(monaco.KeyCode.Escape, () => {
            const domNode = e.getDomNode();
            if (domNode) {
                const textarea = domNode.querySelector('textarea');
                if (textarea) (textarea as HTMLTextAreaElement).blur();
            }
        })

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
            precondition: 'isLastLine && !suggestWidgetVisible',
        });

        // Override the default Ctrl + F keybinding
        // eslint-disable-next-line no-bitwise
        e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => { });
    }

    return (
        <div style={{ height: editorHeight + 18 }} className="absolute w-full flex items-start gap-8 border rounded-lg overflow-hidden bg-background p-2">
            <div className="h-full w-1 grow flex rounded-lg overflow-hidden">
                <div ref={containerRef} className="h-full relative grow w-1" data-testid="editorContainer">
                    <Editor
                        key={editorKey}
                        height={editorHeight}
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
                        theme={editorKey}
                        beforeMount={handleEditorWillMount}
                        onMount={(e) => {
                            handleEditorDidMount(e)
                            editorRef.current = e
                        }}
                    />
                    <span ref={placeholderRef} className="w-full top-0 left-0 absolute pointer-events-none text-2xl truncate text-muted-foreground">
                        {PLACEHOLDER}
                    </span>
                </div>
                <div style={{ height: LINE_HEIGHT }} className={cn("flex gap-2")}>
                    {
                        historyQuery.query &&
                        <Button
                            title="Clear"
                            onClick={() => {
                                setHistoryQuery(prev => ({
                                    ...prev,
                                    query: "",
                                }))
                                editorRef.current?.focus()
                            }}
                        >
                            <X />
                        </Button>
                    }
                    <Button
                        data-testid="editorRun"
                        ref={submitQuery}
                        indicator={indicator}
                        variant="Primary"
                        label="RUN"
                        title="Press Enter to run the query"
                        onClick={handleSubmit}
                        isLoading={isQueryLoading}
                    />
                </div>
            </div>
            <Dialog open={maximize} onOpenChange={setMaximize}>
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
                            <div className="flex gap-2 items-center pointer-events-auto">
                                {
                                    historyQuery.query &&
                                    <Button
                                        title="Clear"
                                        onClick={() => {
                                            setHistoryQuery(prev => ({
                                                ...prev,
                                                query: "",
                                            }))
                                            dialogEditorRef.current?.focus()
                                        }}
                                    >
                                        <X />
                                    </Button>
                                }
                                <CloseDialog
                                    data-testid="editorRun"
                                    className="pointer-events-auto py-2 px-8"
                                    indicator={indicator}
                                    variant="Primary"
                                    label="Run"
                                    title="Press Enter to run the query"
                                    onClick={handleSubmit}
                                    isLoading={isQueryLoading}
                                />
                            </div>
                        </div>
                        <Editor
                            className="w-full h-full"
                            onMount={(e) => {
                                handleEditorDidMount(e)
                                dialogEditorRef.current = e
                            }}
                            theme={editorKey}
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
            </Dialog>
        </div>
    )
}
