/* eslint-disable consistent-return */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Monaco } from "@monaco-editor/react";
import { SetStateAction, Dispatch, useEffect, useRef, useState, useContext, useMemo, useCallback } from "react";
import * as monaco from "monaco-editor";
import { Info, Maximize2, Minimize2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn, HistoryQuery, prepareArg, securedFetch } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Button from "./ui/Button";
import CloseDialog from "./CloseDialog";
import EditorComponent, { LINE_HEIGHT, LanguageConfig } from "./EditorComponent";
import { BrowserSettingsContext, IndicatorContext, UDFContext, ConnectionContext, SyntaxErrorContext } from "./provider";
import { Graph } from "../api/graph/model";

interface Props {
    graph: Graph
    graphName: string
    historyQuery: HistoryQuery
    maximize: boolean
    setMaximize: Dispatch<SetStateAction<boolean>>
    runQuery: (query: string) => Promise<void>
    setHistoryQuery: Dispatch<SetStateAction<HistoryQuery>>
    editorKey: string
    isQueryLoading: boolean
}

const MAX_HEIGHT = 20;
const PLACEHOLDER = "Type your query here to start";
export const CYPHER_LANGUAGE_NAME = "cypher-custom-language";
const LANGUAGE_NAME = CYPHER_LANGUAGE_NAME;

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
];

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
];

const STATIC_SUGGESTIONS: monaco.languages.CompletionItem[] = [
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
];

const DEFAULT_MONARCH_TOKENIZER: monaco.languages.IMonarchLanguage = {
    tokenizer: {
        root: [
            [new RegExp(`\\b(${KEYWORDS.join('|')})\\b`), "keyword"],
            [/"([^"\\]|\\.)*"/, 'string'],
            [/'([^'\\]|\\.)*'/, 'string'],
            [/\d+/, 'number'],
            [/:(\w+)/, 'type'],
            [/\{/, { token: 'delimiter.curly', next: '@bracketCounting' }],
            [/\[/, { token: 'delimiter.square', next: '@insideBracket' }],
            [/\(/, { token: 'delimiter.parenthesis', next: '@insideParen' }],
        ],
        insideParen: [
            [/[A-Za-z_]\w*/, { token: 'variable', next: '@bracketCounting' }],
            [/\)/, { token: 'delimiter.parenthesis', next: '@pop' }],
            [/./, { token: '@rematch', next: '@bracketCounting' }],
        ],
        insideBracket: [
            [/[A-Za-z_]\w*/, { token: 'variable', next: '@bracketCounting' }],
            [/\]/, { token: 'delimiter.square', next: '@pop' }],
            [/./, { token: '@rematch', next: '@bracketCounting' }],
        ],
        bracketCounting: [
            [/\{/, 'delimiter.curly', '@bracketCounting'],
            [/\}/, 'delimiter.curly', '@pop'],
            [/\[/, 'delimiter.square', '@insideBracket'],
            [/\]/, 'delimiter.square', '@pop'],
            [/\(/, 'delimiter.parenthesis', '@insideParen'],
            [/\)/, 'delimiter.parenthesis', '@pop'],
            { include: 'root' }
        ],
    },
    ignoreCase: true,
};

const CYPHER_LANGUAGE_CONFIGURATION: monaco.languages.LanguageConfiguration = {
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
};

export default function CypherEditor({ graph, graphName, historyQuery, maximize, setMaximize, runQuery, setHistoryQuery, editorKey, isQueryLoading }: Props) {
    const { indicator, setIndicator } = useContext(IndicatorContext);
    const { tutorialOpen } = useContext(BrowserSettingsContext);
    const { udfList } = useContext(UDFContext);
    const { isReadOnly } = useContext(ConnectionContext);
    const { syntaxError, setSyntaxError } = useContext(SyntaxErrorContext);

    const { toast } = useToast();
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const dialogEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const placeholderRef = useRef<HTMLDivElement>(null);
    const submitQuery = useRef<HTMLButtonElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const indicatorRef = useRef(indicator);
    const graphIdRef = useRef(graph.Id);
    const graphNameRef = useRef(graphName);
    const queryRef = useRef(historyQuery.query);
    const tutorialOpenRef = useRef(tutorialOpen);
    const isReadOnlyRef = useRef(isReadOnly);
    const monacoRef = useRef<Monaco | null>(null);
    const decorationsRef = useRef<monaco.editor.IEditorDecorationsCollection | null>(null);
    const boundVarsRef = useRef<Set<string>>(new Set());

    const [lineNumber, setLineNumber] = useState(1);
    const [blur, setBlur] = useState(false);
    const [editorMountVersion, setEditorMountVersion] = useState(0);

    const editorHeight = useMemo(() => blur
        ? LINE_HEIGHT
        : Math.min(lineNumber * LINE_HEIGHT, document.body.clientHeight / 100 * MAX_HEIGHT),
        [blur, lineNumber]);

    useEffect(() => {
        setHistoryQuery(prev => {
            if (prev.counter && prev.counter <= prev.queries.length) {
                return { ...prev, query: prev.queries[prev.counter - 1].text };
            }
            if (prev.counter && prev.counter > prev.queries.length) {
                const clamped = prev.queries.length;
                return clamped > 0
                    ? { ...prev, counter: clamped, query: prev.queries[clamped - 1].text }
                    : { ...prev, counter: 0, query: prev.currentQuery.text };
            }
            return { ...prev, query: prev.currentQuery.text };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [historyQuery.counter, setHistoryQuery]);

    useEffect(() => {
        tutorialOpenRef.current = tutorialOpen;
    }, [tutorialOpen]);

    useEffect(() => {
        graphNameRef.current = graphName;
    }, [graphName]);

    useEffect(() => {
        queryRef.current = historyQuery.query;
    }, [historyQuery.query]);

    useEffect(() => {
        indicatorRef.current = indicator;
    }, [indicator]);

    useEffect(() => {
        if (historyQuery.query && placeholderRef.current) {
            placeholderRef.current.style.display = "none";
        } else if (!historyQuery.query && placeholderRef.current && blur) {
            placeholderRef.current.style.display = "block";
        }
    }, [historyQuery.query, blur]);

    useEffect(() => {
        graphIdRef.current = graph.Id;
    }, [graph.Id]);

    useEffect(() => {
        isReadOnlyRef.current = isReadOnly;
    }, [isReadOnly]);

    useEffect(() => {
        if (!containerRef.current) return;

        const handleResize = () => {
            editorRef.current?.layout();
        };

        window.addEventListener("resize", handleResize);

        const observer = new ResizeObserver(handleResize);

        observer.observe(containerRef.current);

        return () => {
            window.removeEventListener("resize", handleResize);
            observer.disconnect();
        };
    }, [containerRef.current]);

    useEffect(() => {
        setLineNumber(historyQuery.query.split("\n").length);
    }, [historyQuery.query]);

    // Apply or clear syntax error decorations in the editor
    useEffect(() => {
        if (decorationsRef.current) {
            decorationsRef.current.clear();
            decorationsRef.current = null;
        }

        const editor = maximize ? dialogEditorRef.current : editorRef.current;
        if (!editor || !syntaxError) return;

        const { line, column } = syntaxError;
        const model = editor.getModel();
        if (!model) return;

        const decorations = editor.createDecorationsCollection([
            {
                range: new monaco.Range(line, column, line, column + 1),
                options: {
                    inlineClassName: 'syntax-error-highlight',
                    hoverMessage: { value: syntaxError.message },
                },
            },
        ]);
        decorationsRef.current = decorations;

        return () => {
            decorations.clear();
            if (decorationsRef.current === decorations) decorationsRef.current = null;
        };
    }, [syntaxError, maximize, editorMountVersion]);

    // Clear syntax error when the user modifies the query
    useEffect(() => {
        if (syntaxError) {
            setSyntaxError(null);
        }
    }, [historyQuery.query]);

    // Extract bound element variables from the query and rebuild tokenizer when they change
    // Use Monaco's tokenizer to detect bound variables (tokens marked as 'variable'
    // by the insideParen/insideBracket states) and rebuild tokenizer to color them everywhere.
    useEffect(() => {
        if (!monacoRef.current) return;

        const queryText = historyQuery.query;
        const lines = queryText.split('\n');

        // Tokenize the query using Monaco's built-in tokenizer
        const tokenized = monacoRef.current.editor.tokenize(queryText, LANGUAGE_NAME);

        const boundVars = new Set<string>();
        tokenized.forEach((lineTokens: monaco.Token[], lineIdx: number) => {
            const line = lines[lineIdx];
            lineTokens.forEach((token: monaco.Token, tokenIdx: number) => {
                if (token.type === `variable.${LANGUAGE_NAME}`) {
                    const start = token.offset;
                    const end = tokenIdx < lineTokens.length - 1 ? lineTokens[tokenIdx + 1].offset : line.length;
                    const varName = line.substring(start, end);
                    if (varName) boundVars.add(varName);
                }
            });
        });

        // Only rebuild tokenizer if the set of variables actually changed
        const newVars = Array.from(boundVars).sort().join(',');
        const oldVars = Array.from(boundVarsRef.current).sort().join(',');
        if (newVars !== oldVars) {
            boundVarsRef.current = boundVars;
            updateTokenizer(monacoRef.current);
        }
    }, [historyQuery.query]);

    const fetchSuggestions = async (detail: string): Promise<monaco.languages.CompletionItem[]> => {
        if (indicator === "offline") return [];

        const readOnlyParam = isReadOnlyRef.current ? '&readOnly=true' : '';
        const result = await securedFetch(`api/graph/${graphIdRef.current}/info?type=${prepareArg(detail)}${readOnlyParam}`, {
            method: 'GET',
        }, toast, setIndicator);

        if (!result) return [];

        const json = await result.json();

        if (json.result.data.length === 0) return [];

        return json.result.data.map(({ info }: { info: string }) => ({
            insertTextRules: detail === '(function)' ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
            insertText: detail === '(function)' ? `${info}(\${0})` : info,
            label: detail === '(function)' ? `${info}()` : info,
            kind: (() => {
                switch (detail) {
                    case '(function)':
                        return monaco.languages.CompletionItemKind.Function;
                    case '(property key)':
                        return monaco.languages.CompletionItemKind.Property;
                    case '(label)':
                        return monaco.languages.CompletionItemKind.Class;
                    case '(relationship type)':
                        return monaco.languages.CompletionItemKind.Interface;
                    default:
                        return monaco.languages.CompletionItemKind.Variable;
                }
            })(),
            range: new monaco.Range(1, 1, 1, 1),
            detail
        }));
    };

    const getRemoteSuggestions = async () => (await Promise.all([
        fetchSuggestions('(function)'),
        fetchSuggestions('(property key)'),
        fetchSuggestions('(label)'),
        fetchSuggestions('(relationship type)')
    ])).flat();

    const udfSuggestions = useMemo((): monaco.languages.CompletionItem[] =>
        udfList.flatMap(([, libName, , functions]) =>
            functions.map((fn: string) => ({
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                insertText: `${libName}.${fn}(\${0})`,
                label: `${libName}.${fn}()`,
                kind: monaco.languages.CompletionItemKind.Function,
                range: new monaco.Range(1, 1, 1, 1),
                detail: "(udf function)"
            }))
        )
        , [udfList]);

    // Returns ALL suggestions including full-path namespaced functions (for tokenizer & dot navigation)
    const getFullSuggestions = useCallback(async (): Promise<monaco.languages.CompletionItem[]> => {
        const remoteSuggestions = graphIdRef.current ? await getRemoteSuggestions() : [];

        // Add bound element variables as suggestions
        const varSuggestions: monaco.languages.CompletionItem[] = Array.from(boundVarsRef.current).map(v => ({
            insertText: v,
            label: v,
            kind: monaco.languages.CompletionItemKind.Variable,
            range: new monaco.Range(1, 1, 1, 1),
            detail: '(variable)',
        }));

        // Extract only top-level namespace prefixes from all namespaced functions
        // (e.g. db.idx.fulltext.queryNodes -> "db"). Deeper levels show via '.' trigger.
        const allFunctions = [...STATIC_SUGGESTIONS, ...udfSuggestions, ...remoteSuggestions].filter(s => s.detail === '(function)' || s.detail === '(udf function)');
        const namespaceParts = new Set<string>();
        allFunctions.forEach(({ label }) => {
            const name = typeof label === 'string' ? label : label.label;
            if (name.includes('.')) {
                const topLevel = name.split('.')[0];
                namespaceParts.add(topLevel);
            }
        });
        const namespaceSuggestions: monaco.languages.CompletionItem[] = Array.from(namespaceParts).map(ns => ({
            insertText: ns,
            label: ns,
            kind: monaco.languages.CompletionItemKind.Module,
            range: new monaco.Range(1, 1, 1, 1),
            detail: '(namespace)',
        }));

        const all = [...STATIC_SUGGESTIONS, ...udfSuggestions, ...remoteSuggestions, ...varSuggestions, ...namespaceSuggestions];

        // Deduplicate by label + detail
        const seen = new Set<string>();
        return all.filter(s => {
            const label = typeof s.label === 'string' ? s.label : s.label.label;
            const key = `${label}::${s.detail}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [udfSuggestions]);

    // Returns filtered suggestions for the default (non-dot) autocomplete display:
    // excludes full-path namespaced functions and property keys (both accessed via dot navigation)
    const getAllSuggestions = useCallback(async (): Promise<monaco.languages.CompletionItem[]> => {
        const full = await getFullSuggestions();

        const filtered = full.filter(s => {
            const label = typeof s.label === 'string' ? s.label : s.label.label;
            // Skip namespaced functions — they are accessed via dot navigation
            if ((s.detail === '(function)' || s.detail === '(udf function)') && label.includes('.')) return false;
            // Skip property keys — they are shown only after typing '.' on a bound variable
            if (s.detail === '(property key)') return false;
            return true;
        });

        // Sort priority by type, then alphabetically within each type
        const typePriority: Record<string, string> = {
            '(variable)': '0',
            '(keyword)': '1',
            '(namespace)': '2',
            '(label)': '3',
            '(relationship type)': '4',
            '(property key)': '5',
            '(function)': '6',
            '(udf function)': '6',
        };

        return filtered.map(s => {
            const prefix = typePriority[s.detail as string] ?? '9';
            const label = typeof s.label === 'string' ? s.label : s.label.label;
            return { ...s, sortText: `${prefix}_${label.toLowerCase()}` };
        });
    }, [udfSuggestions]);

    const updateTokenizer = async (monacoI: Monaco, prefetchedSuggestions?: monaco.languages.CompletionItem[]) => {
        const sug = prefetchedSuggestions ?? await getFullSuggestions();

        const functions = sug.filter(({ detail }) => detail === "(function)" || detail === "(udf function)");

        // Collect labels and relationship types as element namespaces
        const labels = sug.filter(({ detail }) => detail === '(label)').map(({ label }) => label as string);
        const relTypes = sug.filter(({ detail }) => detail === '(relationship type)').map(({ label }) => label as string);

        // Collect property keys for keyword coloring
        const propertyKeys = sug.filter(({ detail }) => detail === '(property key)').map(({ label }) => label as string);

        // Collect UDF library names for keyword coloring
        const udfLibNames = udfList.map(([, libName]) => libName).filter(Boolean);

        const namespaces = new Set([
            ...udfLibNames,
            ...labels,
            ...relTypes,
            ...functions
                .filter(({ label }) => (label as string).includes("."))
                .map(({ label }) => {
                    const newNamespaces = (label as string).split(".");
                    newNamespaces.pop();
                    return newNamespaces;
                }).flat()
        ]);

        // Build keywords regex including static keywords and property keys
        const allKeywords = [...KEYWORDS, ...propertyKeys].join('|');

        // Build bound variables rule from the ref
        const boundVarsArray = Array.from(boundVarsRef.current);
        const boundVarsRule: [RegExp, string][] = boundVarsArray.length > 0
            ? [[new RegExp(`\\b(${boundVarsArray.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`), "variable"]]
            : [];

        monacoI.languages.setMonarchTokensProvider(LANGUAGE_NAME, {
            tokenizer: {
                root: graphIdRef.current ? [
                    ...boundVarsRule,
                    ...(namespaces.size > 0 ? [[new RegExp(`\\b(${Array.from(namespaces.keys()).join('|')})\\b`), "keyword"] as [RegExp, string]] : []),
                    [new RegExp(`\\b(${allKeywords})\\b`), "keyword"],
                    [
                        new RegExp(`\\b(${functions.map(({ label }) => {
                            if ((label as string).includes(".")) {
                                const labels = (label as string).split(".");
                                return labels[labels.length - 1];
                            }
                            return label;
                        }).join('|')})\\b`),
                        "function"
                    ],
                    [/"([^"\\]|\\.)*"/, 'string'],
                    [/'([^'\\]|\\.)*'/, 'string'],
                    [/\d+/, 'number'],
                    [/:(\w+)/, 'type'],
                    [/\{/, { token: 'delimiter.curly', next: '@bracketCounting' }],
                    [/\[/, { token: 'delimiter.square', next: '@insideBracket' }],
                    [/\(/, { token: 'delimiter.parenthesis', next: '@insideParen' }],
                ] : [
                    ...boundVarsRule,
                    [new RegExp(`\\b(${KEYWORDS.join('|')})\\b`), "keyword"],
                    [/"([^"\\]|\\.)*"/, 'string'],
                    [/'([^'\\]|\\.)*'/, 'string'],
                    [/\d+/, 'number'],
                    [/:(\w+)/, 'type'],
                    [/\{/, { token: 'delimiter.curly', next: '@bracketCounting' }],
                    [/\[/, { token: 'delimiter.square', next: '@insideBracket' }],
                    [/\(/, { token: 'delimiter.parenthesis', next: '@insideParen' }],
                ],
                insideParen: [
                    [/[A-Za-z_]\w*/, { token: 'variable', next: '@bracketCounting' }],
                    [/\)/, { token: 'delimiter.parenthesis', next: '@pop' }],
                    [/./, { token: '@rematch', next: '@bracketCounting' }],
                ],
                insideBracket: [
                    [/[A-Za-z_]\w*/, { token: 'variable', next: '@bracketCounting' }],
                    [/\]/, { token: 'delimiter.square', next: '@pop' }],
                    [/./, { token: '@rematch', next: '@bracketCounting' }],
                ],
                bracketCounting: [
                    [/\{/, 'delimiter.curly', '@bracketCounting'],
                    [/\}/, 'delimiter.curly', '@pop'],
                    [/\[/, 'delimiter.square', '@insideBracket'],
                    [/\]/, 'delimiter.square', '@pop'],
                    [/\(/, 'delimiter.parenthesis', '@insideParen'],
                    [/\)/, 'delimiter.parenthesis', '@pop'],
                    { include: 'root' }
                ],
            },
            ignoreCase: true,
        });
    };

    // Update monarch tokenizer when graph or UDF list changes (to include dynamic functions/namespaces)
    useEffect(() => {
        if (monacoRef.current && graphIdRef.current) {
            updateTokenizer(monacoRef.current);
        }
    }, [graph.Id, udfList]);

    const cypherLanguageConfig: LanguageConfig = useMemo(() => ({
        monarchTokensProvider: DEFAULT_MONARCH_TOKENIZER,
        languageConfiguration: CYPHER_LANGUAGE_CONFIGURATION,
        triggerCharacters: ['.'],
        getSuggestions: async (
            monacoI: Monaco,
            context?: monaco.languages.CompletionContext,
            model?: monaco.editor.ITextModel,
            position?: monaco.Position,
        ) => {
            // Get the full list (including namespaced functions) for tokenizer & dot navigation
            const fullSug = await getFullSuggestions();
            // Update the tokenizer with the full list
            await updateTokenizer(monacoI, fullSug);

            // Detect dot context: either from trigger character or from cursor position.
            // This handles both auto-trigger and manual Ctrl+Space after typing '.'.
            let hasDot = context?.triggerCharacter === '.';
            if (!hasDot && model && position) {
                const charBeforeCursor = model.getValueInRange({
                    startLineNumber: position.lineNumber,
                    startColumn: Math.max(1, position.column - 1),
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                });
                hasDot = charBeforeCursor === '.';
            }

            // When in dot context, show property keys if the variable before '.' is bound
            // in a node (varName) or relationship [varName] pattern.
            // Otherwise show only namespaced functions matching the prefix.
            if (hasDot && model && position) {
                const allPropertyKeys = fullSug.filter(s => s.detail === '(property key)');

                // Extract the full dotted prefix before the cursor's trailing '.'.
                // e.g. "CALL db.idx." → captures "db.idx", "RETURN n." → captures "n"
                const linePrefix = model.getValueInRange({
                    startLineNumber: position.lineNumber,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                });
                const varMatch = linePrefix.match(/([A-Za-z_]\w*(?:\.\w+)*)\.$/);
                if (!varMatch) return [];
                const fullPrefix = varMatch[1];
                // The root identifier (first segment) is used to check node/rel binding
                const varName = fullPrefix.split('.')[0];

                // Check if the variable is bound in a node or relationship pattern.
                const queryText = model.getValue();
                const escapedVar = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                const nodePattern = new RegExp(`\\(\\s*${escapedVar}\\b`);
                const relPattern = new RegExp(`\\[\\s*${escapedVar}\\b`);

                const isBound = nodePattern.test(queryText) || relPattern.test(queryText);

                if (isBound) return allPropertyKeys;

                // Not a node/relationship variable — show the next level inside this namespace.
                // e.g. "db." shows ["idx", "labels"], "db.idx." shows ["vector", "fulltext"]
                const prefix = `${fullPrefix}.`;
                const nextSegments = new Map<string, boolean>(); // segment -> isNamespace
                fullSug.forEach(s => {
                    const label = typeof s.label === 'string' ? s.label : s.label.label;
                    if (!label.startsWith(prefix)) return;
                    const remainder = label.slice(prefix.length);
                    const dotIdx = remainder.indexOf('.');
                    if (dotIdx === -1) {
                        // Leaf item (function) — show as-is
                        nextSegments.set(remainder, false);
                    } else {
                        // Sub-namespace — extract just the next segment
                        const segment = remainder.slice(0, dotIdx);
                        if (!nextSegments.has(segment)) {
                            nextSegments.set(segment, true);
                        }
                    }
                });

                return Array.from(nextSegments.entries()).map(([segment, isNamespace]) => ({
                    insertText: segment,
                    label: segment,
                    kind: isNamespace
                        ? monaco.languages.CompletionItemKind.Module
                        : monaco.languages.CompletionItemKind.Function,
                    detail: isNamespace ? '(namespace)' : '(function)',
                }));
            }

            // Default (non-dot) case: return filtered suggestions (no full-path functions)
            return getAllSuggestions();
        },
    }), []);

    const handleSubmit = async () => {
        runQuery(historyQuery.query.trim());
    };

    const handleMonacoReady = (monacoI: Monaco) => {
        monacoRef.current = monacoI;
        // Trigger initial tokenizer update with dynamic suggestions
        updateTokenizer(monacoI);
    };

    const handleEditorDidMount = (e: monaco.editor.IStandaloneCodeEditor) => {
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

            setBlur(false);
        });

        e.onDidBlurEditorText(() => {
            updatePlaceholderVisibility();

            setBlur(true);
        });

        updatePlaceholderVisibility();

        const isFirstLine = e.createContextKey<boolean>('isFirstLine', true);
        const isLastLine = e.createContextKey<boolean>('isLastLine', true);

        const updateLineKeys = () => {
            const position = e.getPosition();
            if (position) {
                const lineCount = e.getModel()?.getLineCount() ?? 1;
                isFirstLine.set(position.lineNumber === 1);
                isLastLine.set(position.lineNumber === lineCount);
            }
        };

        // Update the context key value based on the cursor position
        e.onDidChangeCursorPosition(updateLineKeys);

        // Also update when content changes (e.g. setValue from history navigation)
        e.onDidChangeModelContent(updateLineKeys);

        // Escape: dismiss suggestions if visible, otherwise blur the editor
        e.addCommand(monaco.KeyCode.Escape, () => {
            const domNode = e.getDomNode();
            if (!domNode) return;

            // Check if the suggest widget is visible in the DOM
            const suggestWidget = domNode.querySelector('.editor-widget.suggest-widget.visible');
            if (suggestWidget) {
                // Dismiss the suggestion widget
                e.trigger('keyboard', 'hideSuggestWidget', {});
            } else {
                const textarea = domNode.querySelector('textarea');
                if (textarea) (textarea as HTMLTextAreaElement).blur();
            }
        });

        // eslint-disable-next-line no-bitwise
        e.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
            e.trigger('keyboard', 'type', { text: '\n' });
        });

        // eslint-disable-next-line no-bitwise
        e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            if (indicatorRef.current === "offline" || !queryRef.current || !graphNameRef.current || tutorialOpenRef.current) return;
            submitQuery.current?.click();
        });

        e.addAction({
            id: 'submit',
            label: 'Submit Query',
            // eslint-disable-next-line no-bitwise
            keybindings: [monaco.KeyCode.Enter],
            contextMenuOrder: 1.5,
            run: async () => {
                if (indicatorRef.current === "offline" || !queryRef.current || !graphNameRef.current || tutorialOpenRef.current) return;
                submitQuery.current?.click();
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

                    const counter = prev.counter > 1 ? prev.counter - 1 : (prev.counter === 0 ? prev.queries.length : 1);
                    if (counter === prev.counter) return prev;

                    const query = prev.queries[counter - 1].text;
                    return { ...prev, counter, query };
                });
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
                    if (prev.queries.length === 0) return prev;

                    const counter = prev.counter ? (prev.counter + 1 > prev.queries.length ? 0 : prev.counter + 1) : 0;
                    if (counter === prev.counter) return prev;

                    const query = counter ? prev.queries[counter - 1].text : prev.currentQuery.text;
                    return { ...prev, counter, query };
                });
            },
            precondition: 'isLastLine && !suggestWidgetVisible',
        });

        // Disable Ctrl+F search in the compact cypher editor
        // eslint-disable-next-line no-bitwise
        e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => { });
    };

    const getLabel = () => {
        if (!graphName) return "Select a graph first";
        if (!historyQuery.query) return "You need to type a query first";
        return "Press Enter to run the query";
    };

    return (
        <div data-testid="editor" style={{ height: editorHeight + 18 }} className="absolute w-full flex items-start gap-8 border border-border rounded-lg overflow-hidden bg-background p-2">
            <div className="h-full w-1 grow flex rounded-lg overflow-hidden">
                <div ref={containerRef} className="h-full relative grow w-1" data-value={historyQuery.query} data-testid="editorContainer">
                    <EditorComponent
                        className="SofiaSans"
                        editorKey={editorKey}
                        height={editorHeight}
                        language={LANGUAGE_NAME}
                        languageConfig={cypherLanguageConfig}
                        options={{
                            lineNumbers: lineNumber > 1 ? "on" : "off",
                        }}
                        value={blur ? historyQuery.query.replace(/\n/g, ' ') : historyQuery.query}
                        onChange={(val) => {
                            if (blur) return;
                            const newVal = val || "";
                            if (newVal === historyQuery.query) return;
                            if (!historyQuery.counter) {
                                setHistoryQuery(prev => ({
                                    ...prev,
                                    currentQuery: {
                                        ...prev.currentQuery,
                                        text: newVal,
                                    },
                                    query: newVal,
                                }));
                            } else {
                                setHistoryQuery(prev => ({
                                    ...prev,
                                    query: newVal,
                                }));
                            }
                        }}
                        onMonacoReady={handleMonacoReady}
                        onMount={(e) => {
                            handleEditorDidMount(e);
                            editorRef.current = e;
                            setEditorMountVersion(version => version + 1);
                        }}
                    />
                    <span ref={placeholderRef} className="w-full top-0 left-0 absolute pointer-events-none truncate SofiaSans">
                        {PLACEHOLDER}
                    </span>
                </div>
                <div style={{ height: LINE_HEIGHT }} className={cn("flex gap-2 items-center px-2", historyQuery.query ? "bg-background" : "bg-transparent")} data-testid="editorToolbar">
                    {historyQuery.counter > 0 && (
                        <Tooltip>
                            <TooltipTrigger>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    [ {historyQuery.queries.length - historyQuery.counter + 1}/{historyQuery.queries.length} ]
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                Query History Index: {historyQuery.queries.length - historyQuery.counter + 1}
                            </TooltipContent>
                        </Tooltip>
                    )}
                    {
                        historyQuery.query &&
                        <Button
                            data-testid="clearEditor"
                            title="Clear"
                            onClick={() => {
                                setHistoryQuery(prev => ({
                                    ...prev,
                                    query: "",
                                }));
                                editorRef.current?.focus();
                            }}
                        >
                            <X />
                        </Button>
                    }
                    <Button
                        data-testid="editorMaximize"
                        title="Maximize"
                        onClick={() => setMaximize(true)}
                    >
                        <Maximize2 size={20} />
                    </Button>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="flex items-center cursor-default" aria-label="Keyboard shortcuts" tabIndex={-1}>
                                    <Info />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                {"Run (Enter) | History (Arrow Up/Down) | Insert new line (Shift + Enter)"}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button
                        className="text-xs py-0.5"
                        data-testid="editorRun"
                        ref={submitQuery}
                        indicator={indicator}
                        disabled={!historyQuery.query || !graphName}
                        variant="Primary"
                        label="RUN"
                        title={getLabel()}
                        onClick={handleSubmit}
                        isLoading={isQueryLoading}
                    />
                </div>
            </div>
            <Dialog open={maximize} onOpenChange={setMaximize}>
                <DialogContent hideClose className="w-full h-full">
                    <div className="relative w-full h-full">
                        <VisuallyHidden>
                            <DialogTitle />
                            <DialogDescription />
                        </VisuallyHidden>
                        <div className="z-10 absolute right-0 top-0 bottom-0 p-2 flex flex-col items-end justify-between pointer-events-none">
                            <CloseDialog
                                className="pointer-events-auto"
                            >
                                <Minimize2 size={20} />
                            </CloseDialog>
                            <div className="flex gap-2 items-center pointer-events-auto">
                                {
                                    historyQuery.query &&
                                    <Button
                                        data-testid="clearEditor"
                                        title="Clear"
                                        onClick={() => {
                                            setHistoryQuery(prev => ({
                                                ...prev,
                                                query: "",
                                            }));
                                            dialogEditorRef.current?.focus();
                                        }}
                                    >
                                        <X />
                                    </Button>
                                }
                                <CloseDialog
                                    data-testid="editorRun"
                                    className="pointer-events-auto py-2 px-8"
                                    indicator={indicator}
                                    disabled={!historyQuery.query || !graphName}
                                    variant="Primary"
                                    label="RUN"
                                    title={getLabel()}
                                    onClick={handleSubmit}
                                    isLoading={isQueryLoading}
                                />
                            </div>
                        </div>
                        <EditorComponent
                            editorKey={editorKey}
                            className="w-full h-full"
                            language={LANGUAGE_NAME}
                            languageConfig={cypherLanguageConfig}
                            options={{
                                lineNumbersMinChars: 3,
                                fontSize: 25,
                                minimap: { enabled: true },
                                scrollbar: { vertical: 'auto', horizontal: 'auto' },
                                overviewRulerLanes: 3,
                                overviewRulerBorder: true,
                            }}
                            value={historyQuery.query}
                            onChange={(val) => {
                                if (historyQuery.counter) {
                                    setHistoryQuery(prev => ({
                                        ...prev,
                                        query: val || ""
                                    }));
                                } else {
                                    setHistoryQuery(prev => ({
                                        ...prev,
                                        query: val || "",
                                        currentQuery: {
                                            ...prev.currentQuery,
                                            text: val || "",
                                        },
                                    }));
                                }
                            }}
                            onMount={(e) => {
                                handleEditorDidMount(e);
                                dialogEditorRef.current = e;
                                setEditorMountVersion(version => version + 1);
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
