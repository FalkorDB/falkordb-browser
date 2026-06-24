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
import { BUILTIN_FUNCTIONS, CYPHER_KEYWORDS } from "@/lib/cypherLang";
import { codeActionEditsForMarkers, analyzeSchemaWarnings, type EditorDiagnostic } from "@/lib/cypherDiagnostics";
import { extractVariableCandidates } from "@/lib/cypherSuggestions";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Button from "./ui/Button";
import CloseDialog from "./CloseDialog";
import EditorComponent, { LINE_HEIGHT, LanguageConfig } from "./EditorComponent";
import { BrowserSettingsContext, IndicatorContext, UDFContext, ConnectionContext, DiagnosticsContext } from "./provider";
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
    /** Called whenever the Cypher language config (suggestions) is created or updated. */
    onLanguageConfig?: (config: LanguageConfig) => void
}

const MAX_HEIGHT = 20;
const PLACEHOLDER = "Type your query here to start";
export const CYPHER_LANGUAGE_NAME = "cypher-custom-language";
const LANGUAGE_NAME = CYPHER_LANGUAGE_NAME;

const KEYWORDS = CYPHER_KEYWORDS;

const FUNCTIONS = BUILTIN_FUNCTIONS;

export const STATIC_SUGGESTIONS: monaco.languages.CompletionItem[] = [
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

const escapeRegExp = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const DEFAULT_MONARCH_TOKENIZER: monaco.languages.IMonarchLanguage = {
    tokenizer: {
        root: [
            [new RegExp(`\\b(${KEYWORDS.join('|')})\\b`, 'i'), "keyword"],
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

// Disables Monaco's built-in power-user shortcuts for the compact query input bar.
// The full-page (maximized) editor keeps them.
function disableCompactEditorShortcuts(e: monaco.editor.IStandaloneCodeEditor) {
    /* eslint-disable no-bitwise */
    e.addCommand(monaco.KeyCode.F1, () => { });
    e.addCommand(monaco.KeyCode.F12, () => { });
    e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => { });
    e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => { });
    e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG, () => { });
    e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => { });
    e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => { });
    e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Period, () => { });
    e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK, () => { });
    e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyL, () => { });
    e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, () => { });
    e.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => { });
    e.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.UpArrow, () => { });
    e.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.DownArrow, () => { });
    e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.UpArrow, () => { });
    e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.DownArrow, () => { });
    // Pass browser reload shortcuts through rather than silently swallowing them.
    e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => { window.location.reload(); });
    e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyR, () => { window.location.reload(); });
    /* eslint-enable no-bitwise */
}

// Registers Shift+Enter for all CypherEditor instances.
// Escape is registered separately per editor context (see handleEditorDidMount).
function registerUniversalEditorBindings(e: monaco.editor.IStandaloneCodeEditor) {
    /* eslint-disable no-bitwise */
    // Shift+Enter: always insert a raw newline regardless of suggest widget state.
    e.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
        e.trigger('keyboard', 'type', { text: '\n' });
    });
    /* eslint-enable no-bitwise */
}

export default function CypherEditor({ graph, graphName, historyQuery, maximize, setMaximize, runQuery, setHistoryQuery, editorKey, isQueryLoading, onLanguageConfig }: Props) {
    const { indicator, setIndicator } = useContext(IndicatorContext);
    const { tutorialOpen } = useContext(BrowserSettingsContext);
    const { udfList } = useContext(UDFContext);
    const { isReadOnly } = useContext(ConnectionContext);
    const { diagnostics, setDiagnostics } = useContext(DiagnosticsContext);

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
    const diagnosticsRef = useRef<EditorDiagnostic[]>([]);
    const schemaWarningsRef = useRef<EditorDiagnostic[]>([]);
    const schemaLabelsRef = useRef<string[]>([]);
    const codeActionProviderRef = useRef<monaco.IDisposable | null>(null);
    const boundVarsRef = useRef<Set<string>>(new Set());
    // Cached full suggestion list so getSuggestions never calls updateTokenizer during typing.
    const cachedSuggestionsRef = useRef<monaco.languages.CompletionItem[]>([]);

    const [lineNumber, setLineNumber] = useState(1);
    const [blur, setBlur] = useState(false);
    const [editorMountVersion, setEditorMountVersion] = useState(0);
    const [schemaLabelsVersion, setSchemaLabelsVersion] = useState(0);

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
        // containerRef is stable after mount; [] is correct here.
    }, []);

    useEffect(() => {
        setLineNumber(historyQuery.query.split("\n").length);
    }, [historyQuery.query]);

    // Apply editor diagnostics as Monaco markers (squiggle + hover + quick fixes) on both
    // editor models, plus a precise inline highlight on the active editor. A stale guard
    // ensures we only mark a model whose content still matches the query that produced the
    // diagnostics.
    useEffect(() => {
        const editors = [editorRef.current, dialogEditorRef.current];

        const markersFor = (model: monaco.editor.ITextModel): monaco.editor.IMarkerData[] => {
            if (!diagnostics || diagnostics.sourceQuery !== model.getValue()) return [];
            return diagnostics.diagnostics.map(d => ({
                severity: d.severity === "warning" ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
                message: d.hint ? `${d.message}\n\n💡 ${d.hint}` : d.message,
                code: d.code,
                source: "cypher-diagnostics",
                startLineNumber: d.startLineNumber,
                startColumn: d.startColumn,
                endLineNumber: d.endLineNumber,
                endColumn: d.endColumn,
            }));
        };

        const models: monaco.editor.ITextModel[] = [];
        let activeMatched = false;
        editors.forEach(editor => {
            const model = editor?.getModel();
            if (!model) return;
            const markers = markersFor(model);
            monaco.editor.setModelMarkers(model, 'cypher-diagnostics', markers);
            models.push(model);
            if (markers.length > 0) activeMatched = true;
        });

        // Keep the diagnostics available to the code-action provider only while a model
        // actually shows them.
        diagnosticsRef.current = activeMatched && diagnostics ? diagnostics.diagnostics : [];

        // Precise inline highlight on the active editor.
        if (decorationsRef.current) {
            decorationsRef.current.clear();
            decorationsRef.current = null;
        }
        const activeEditor = maximize ? dialogEditorRef.current : editorRef.current;
        const activeModel = activeEditor?.getModel();
        if (activeEditor && activeModel && diagnostics && diagnostics.sourceQuery === activeModel.getValue()) {
            decorationsRef.current = activeEditor.createDecorationsCollection(
                diagnostics.diagnostics.map(d => ({
                    range: new monaco.Range(d.startLineNumber, d.startColumn, d.endLineNumber, d.endColumn),
                    options: { inlineClassName: 'syntax-error-highlight' },
                }))
            );
        }

        return () => {
            models.forEach(model => {
                if (!model.isDisposed()) monaco.editor.setModelMarkers(model, 'cypher-diagnostics', []);
            });
            diagnosticsRef.current = [];
            if (decorationsRef.current) {
                decorationsRef.current.clear();
                decorationsRef.current = null;
            }
        };
        // `blur` is an intentional dependency: it isn't read by name here, but it flips the
        // editor's displayed value (newlines→spaces, see the textarea `value` below), which
        // changes `model.getValue()` that markersFor()/the decoration guard compare against
        // `diagnostics.sourceQuery`. Re-running on blur keeps markers correct (cleared on the
        // collapsed single-line view, re-applied when focused) — removing it brings back the
        // multi-line blur marker bug.
    }, [diagnostics, maximize, editorMountVersion, blur]);

    // Clear diagnostics when the user modifies the query
    useEffect(() => {
        setDiagnostics(null);
    }, [historyQuery.query]);

    // Dispose the code-action provider on unmount.
    useEffect(() => () => {
        codeActionProviderRef.current?.dispose();
        codeActionProviderRef.current = null;
    }, []);

    // Proactive (debounced) schema lint: warn about node labels that look like a typo of
    // a known label. Anchored to node patterns, so map keys are never flagged.
    useEffect(() => {
        // Eagerly drop existing schema markers so warnings computed for the *previous* query
        // text don't linger (at stale positions) during the debounce; the timeout below
        // re-adds fresh ones once typing pauses.
        [editorRef.current, dialogEditorRef.current].forEach(editor => {
            const model = editor?.getModel();
            if (model && monacoRef.current) monaco.editor.setModelMarkers(model, 'cypher-schema', []);
        });
        const handle = setTimeout(() => {
            const warnings = analyzeSchemaWarnings(historyQuery.query, schemaLabelsRef.current);
            schemaWarningsRef.current = warnings;
            [editorRef.current, dialogEditorRef.current].forEach(editor => {
                const model = editor?.getModel();
                if (!model || !monacoRef.current) return;
                const markers: monaco.editor.IMarkerData[] = (warnings.length > 0 && model.getValue() === historyQuery.query)
                    ? warnings.map(d => ({
                        severity: monaco.MarkerSeverity.Warning,
                        message: d.hint ? `${d.message}\n\n💡 ${d.hint}` : d.message,
                        code: d.code,
                        source: 'cypher-schema',
                        startLineNumber: d.startLineNumber,
                        startColumn: d.startColumn,
                        endLineNumber: d.endLineNumber,
                        endColumn: d.endColumn,
                    }))
                    : [];
                monaco.editor.setModelMarkers(model, 'cypher-schema', markers);
            });
        }, 400);
        return () => clearTimeout(handle);
    }, [historyQuery.query, editorMountVersion, schemaLabelsVersion]);

    // Extract bound variables from the query and rebuild the tokenizer whenever the set changes.
    // boundVarsRule inside updateTokenizer reads boundVarsRef.current directly, so updating the
    // ref before calling is all that's needed for correct highlighting. The cache is only used to
    // avoid re-fetching schema data from the server on every keystroke.
    useEffect(() => {
        // Always update the ref so that programmatically-set queries (URL params,
        // saved context, default query) populate boundVarsRef before the editor
        // mounts and calls updateTokenizer via handleMonacoReady.
        const boundVars = new Set(extractVariableCandidates(historyQuery.query));
        boundVarsRef.current = boundVars;
        if (!monacoRef.current) return;

        const baseCache = cachedSuggestionsRef.current.filter(s => s.detail !== '(variable)');

        if (baseCache.length > 0) {
            // Schema already loaded — rebuild cache with fresh vars and retokenize (no server fetch).
            const freshVarSuggestions: monaco.languages.CompletionItem[] = Array.from(boundVars).map(v => ({
                insertText: v,
                label: v,
                kind: monaco.languages.CompletionItemKind.Variable,
                range: new monaco.Range(1, 1, 1, 1),
                detail: '(variable)',
            }));
            updateTokenizer(monacoRef.current, [...baseCache, ...freshVarSuggestions]);
        } else {
            // Cache empty (schema not yet loaded) — let updateTokenizer do a fresh fetch.
            // It will include vars from boundVarsRef.current (already updated above).
            updateTokenizer(monacoRef.current);
        }
    }, [historyQuery.query]);

    // Build label, relationship, and property-key suggestions directly from the graph
    // object (already in memory) — no extra network round-trips needed.
    const getGraphInfoSuggestions = useCallback((): monaco.languages.CompletionItem[] => {
        const items: monaco.languages.CompletionItem[] = [];
        const range = new monaco.Range(1, 1, 1, 1);

        // Labels
        graph.GraphInfo.Labels.forEach((_, name) => {
            if (!name) return;
            items.push({ insertText: name, label: name, kind: monaco.languages.CompletionItemKind.Class, range, detail: '(label)' });
        });

        // Relationship types
        graph.GraphInfo.Relationships.forEach((_, name) => {
            if (!name) return;
            items.push({ insertText: name, label: name, kind: monaco.languages.CompletionItemKind.Interface, range, detail: '(relationship type)' });
        });

        // Property keys
        (graph.GraphInfo.PropertyKeys ?? []).forEach(key => {
            items.push({ insertText: key, label: key, kind: monaco.languages.CompletionItemKind.Property, range, detail: '(property key)' });
        });

        return items;
    }, [graph.GraphInfo]);

    // Fetch only functions from the server — everything else comes from graphInfo.
    const fetchFunctions = async (): Promise<monaco.languages.CompletionItem[]> => {
        if (indicatorRef.current === "offline") return [];

        const readOnlyParam = isReadOnlyRef.current ? '&readOnly=true' : '';
        const result = await securedFetch(`api/graph/${graphIdRef.current}/info?type=${prepareArg('(function)')}${readOnlyParam}`, {
            method: 'GET',
        }, toast, setIndicator);

        if (!result) return [];

        const json = await result.json();

        if (json.result.data.length === 0) return [];

        return json.result.data.map(({ info }: { info: string }) => ({
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            insertText: `${info}(\${0})`,
            label: `${info}()`,
            kind: monaco.languages.CompletionItemKind.Function,
            range: new monaco.Range(1, 1, 1, 1),
            detail: '(function)',
        }));
    };

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
        // Labels, relationship types, and property keys come from the in-memory graph object.
        // Only functions require a server fetch (they are not part of graph metadata).
        const graphInfoSuggestions = getGraphInfoSuggestions();
        const functionSuggestions = graphIdRef.current ? await fetchFunctions() : [];
        const remoteSuggestions = [...graphInfoSuggestions, ...functionSuggestions];

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
            insertText: `${ns}.`,
            label: ns,
            kind: monaco.languages.CompletionItemKind.Module,
            range: new monaco.Range(1, 1, 1, 1),
            detail: '(namespace)',
            command: { id: 'editor.action.triggerSuggest', title: 'Re-trigger completions' },
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
    }, [udfSuggestions, getGraphInfoSuggestions]);

    // Returns suggestions for the default (non-dot) autocomplete display.
    // Excludes namespaced functions (accessed via dot drill-down) and property keys.
    const getAllSuggestions = useCallback(async (prefetched?: monaco.languages.CompletionItem[]): Promise<monaco.languages.CompletionItem[]> => {
        const full = prefetched ?? await getFullSuggestions();

        const filtered = full.filter(s => {
            const label = typeof s.label === 'string' ? s.label : s.label.label;
            // Skip namespaced functions — accessed only via dot drill-down
            if ((s.detail === '(function)' || s.detail === '(udf function)') && label.includes('.')) return false;
            // Skip property keys — shown only after typing '.' on a bound variable
            if (s.detail === '(property key)') return false;
            // Skip namespaces — shown only after CALL keyword
            if (s.detail === '(namespace)') return false;
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
    }, [getFullSuggestions]);

    const updateTokenizer = async (monacoI: Monaco, prefetchedSuggestions?: monaco.languages.CompletionItem[]) => {
        const sug = prefetchedSuggestions ?? await getFullSuggestions();
        cachedSuggestionsRef.current = sug;

        const functions = sug.filter(({ detail }) => detail === "(function)" || detail === "(udf function)");

        // Collect labels and relationship types as element namespaces
        const labels = sug.filter(({ detail }) => detail === '(label)').map(({ label }) => label as string);
        // Bump a version when the known-label *set* changes so the schema-lint effect re-runs:
        // it reads schemaLabelsRef (a ref), which alone wouldn't re-lint a query the user
        // already typed before the schema finished loading. Compare order-insensitively, since
        // suggestion order from the server isn't guaranteed stable.
        const labelSetKey = (arr: string[]) => arr.slice().sort().join('\u0000');
        const labelsChanged = labelSetKey(labels) !== labelSetKey(schemaLabelsRef.current);
        schemaLabelsRef.current = labels;
        if (labelsChanged) setSchemaLabelsVersion(v => v + 1);
        const relTypes = sug.filter(({ detail }) => detail === '(relationship type)').map(({ label }) => label as string);

        // Collect UDF library names for namespace coloring
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

        const allKeywords = KEYWORDS.join('|');

        // Build bound variables rule from the ref
        const boundVarsArray = Array.from(boundVarsRef.current);
        const boundVarsRule: [RegExp, string][] = boundVarsArray.length > 0
            ? [[new RegExp(`\\b(${boundVarsArray.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`), "variable"]]
            : [];

        monacoI.languages.setMonarchTokensProvider(LANGUAGE_NAME, {
            tokenizer: {
                root: graphIdRef.current ? [
                    ...boundVarsRule,
                    ...(namespaces.size > 0 ? [[new RegExp(`\\b(${Array.from(namespaces.keys()).map(escapeRegExp).join('|')})\\b`, 'i'), "keyword"] as [RegExp, string]] : []),
                    [new RegExp(`\\b(${allKeywords})\\b`, 'i'), "keyword"],
                    [
                        new RegExp(`\\b(${functions.map(({ label }) => {
                            const labelStr = (label as string).replace(/\(\)$/, '');
                            if (labelStr.includes(".")) {
                                const parts = labelStr.split(".");
                                return escapeRegExp(parts[parts.length - 1]);
                            }
                            return escapeRegExp(labelStr);
                        }).join('|')})\\b`, 'i'),
                        "function"
                    ],
                    [/[A-Za-z_]\w*/, ''],
                    [/"([^"\\]|\\.)*"/, 'string'],
                    [/'([^'\\]|\\.)*'/, 'string'],
                    [/\d+/, 'number'],
                    [/:(\w+)/, 'type'],
                    [/\{/, { token: 'delimiter.curly', next: '@bracketCounting' }],
                    [/\[/, { token: 'delimiter.square', next: '@bracketCounting' }],
                    [/\(/, { token: 'delimiter.parenthesis', next: '@bracketCounting' }],
                ] : [
                    ...boundVarsRule,
                    [new RegExp(`\\b(${KEYWORDS.join('|')})\\b`, 'i'), "keyword"],
                    [/[A-Za-z_]\w*/, ''],
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
        });
    };

    // Invalidate the suggestion cache and rebuild the tokenizer when the graph, its info, or UDFs change.
    useEffect(() => {
        cachedSuggestionsRef.current = [];
        if (monacoRef.current && graphIdRef.current) {
            updateTokenizer(monacoRef.current);
        }
    }, [graph.Id, graph.GraphInfo, udfList]);

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
            // Use the suggestion cache populated by updateTokenizer (on graph/UDF/variable change).
            // Falling back to a fresh fetch only if the cache is empty (e.g. graph not yet loaded).
            // We intentionally do NOT call updateTokenizer here — doing so on every keystroke
            // triggers setMonarchTokensProvider which re-tokenizes the model and flickers decorations.
            const fullSug = cachedSuggestionsRef.current.length > 0
                ? cachedSuggestionsRef.current
                : await getFullSuggestions();

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

                if (isBound) return allPropertyKeys.map(s => {
                    const keyLabel = typeof s.label === 'string' ? s.label : s.label.label;
                    return { ...s, filterText: '', sortText: `5_${keyLabel.toLowerCase()}`, range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column) };
                });

                // Not a node/relationship variable — build a recursive flat list for this namespace.
                // Rules:
                //   depth 1            : direct child (function or namespace) — always show
                //   depth 2, function  : namespace.function() — show the namespace only (drill-down),
                //                        skip full path (too shallow to warrant a shortcut)
                //   depth >= 2, other  : show immediate namespace + full relative path + any
                //                        intermediate namespaces (idx.fulltext for idx.fulltext.fn())
                const prefix = `${fullPrefix}.`;
                const resultItems: { remainder: string; isNamespace: boolean }[] = [];
                const seen = new Set<string>();

                const addItem = (remainder: string, isNamespace: boolean) => {
                    if (seen.has(remainder)) return;
                    seen.add(remainder);
                    resultItems.push({ remainder, isNamespace });
                };

                fullSug.forEach(s => {
                    const rawLabel = (typeof s.label === 'string' ? s.label : s.label.label) as string;
                    if (!rawLabel.startsWith(prefix)) return;
                    const remainder = rawLabel.slice(prefix.length);
                    const parts = remainder.split('.');
                    const depth = parts.length;
                    const isFunction = parts[depth - 1].includes('(');

                    if (depth === 1) {
                        // Direct child: show as function or namespace
                        addItem(remainder, !isFunction);
                    } else {
                        // Deeper: only expose the immediate first-level namespace for drill-down.
                        // Never show full paths (e.g. idx.fulltext.queryNodes()) at this level.
                        addItem(parts[0], true);
                    }
                });

                // Cursor is right after the dot — use this as the insert position so Monaco
                // knows completions replace nothing (pure insert). filterText="" bypasses
                // Monaco's client-side prefix filter which would otherwise hide items whose
                // labels (e.g. "idx.fulltext.queryNodes()") don't match the typed prefix.
                const insertRange = new monaco.Range(
                    position.lineNumber, position.column,
                    position.lineNumber, position.column,
                );

                return resultItems.map(({ remainder, isNamespace }) => ({
                    insertText: isNamespace ? `${remainder}.` : remainder.replace(/\(\)$/, '(\${0})'),
                    insertTextRules: isNamespace ? undefined : monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    label: remainder,
                    filterText: '',
                    sortText: isNamespace ? `0_${remainder.toLowerCase()}` : `1_${remainder.toLowerCase()}`,
                    kind: isNamespace
                        ? monaco.languages.CompletionItemKind.Module
                        : monaco.languages.CompletionItemKind.Function,
                    detail: isNamespace ? '(namespace)' : '(function)',
                    command: isNamespace ? { id: 'editor.action.triggerSuggest', title: 'Re-trigger completions' } : undefined,
                    range: insertRange,
                }));
            }

            // CALL context: show only procedure namespaces (e.g. "db", "algo").
            // Dot-chaining after a namespace ("CALL db.") is handled by the hasDot branch above.
            if (model && position) {
                const linePrefix = model.getValueInRange({
                    startLineNumber: position.lineNumber,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                });
                const callMatch = linePrefix.match(/\bCALL\s+(\w*)$/i);
                if (callMatch) {
                    const typedPrefix = callMatch[1];
                    const namespaces = fullSug.filter(s => s.detail === '(namespace)');
                    return namespaces.map(s => {
                        const label = typeof s.label === 'string' ? s.label : s.label.label;
                        return {
                            ...s,
                            filterText: label,
                            range: new monaco.Range(
                                position.lineNumber, position.column - typedPrefix.length,
                                position.lineNumber, position.column,
                            ),
                        };
                    });
                }
            }

            // Default (non-dot, non-CALL) case.
            return getAllSuggestions(fullSug);
        },
        // updateTokenizer intentionally excluded: getSuggestions no longer calls it.
    }), [getFullSuggestions, getAllSuggestions]);

    // Publish the language config to callers (e.g. QueryHistoryPanel) whenever it changes.
    useEffect(() => {
        onLanguageConfig?.(cypherLanguageConfig);
    }, [cypherLanguageConfig, onLanguageConfig]);

    const handleSubmit = async () => {
        runQuery(historyQuery.query.trim());
    };

    const handleMonacoReady = (monacoI: Monaco) => {
        monacoRef.current = monacoI;
        // Pre-warm the tokenizer + suggestion cache immediately so highlights are
        // correct before the user opens autocomplete for the first time.
        updateTokenizer(monacoI);

        // Register the quick-fix (code action) provider exactly once.
        if (!codeActionProviderRef.current) {
            codeActionProviderRef.current = monacoI.languages.registerCodeActionProvider(LANGUAGE_NAME, {
                provideCodeActions: (model: monaco.editor.ITextModel, _range: monaco.Range, context: monaco.languages.CodeActionContext): monaco.languages.CodeActionList => {
                    const markers = context.markers.filter(m => m.source === 'cypher-diagnostics' || m.source === 'cypher-schema');
                    const edits = codeActionEditsForMarkers(
                        [...diagnosticsRef.current, ...schemaWarningsRef.current],
                        markers.map(m => ({
                            code: typeof m.code === 'string' ? m.code : (m.code?.value ?? ''),
                            startLineNumber: m.startLineNumber,
                            startColumn: m.startColumn,
                            endLineNumber: m.endLineNumber,
                            endColumn: m.endColumn,
                        }))
                    );
                    return {
                        actions: edits.map(edit => ({
                            title: edit.title,
                            kind: 'quickfix',
                            edit: {
                                edits: [{
                                    resource: model.uri,
                                    versionId: model.getVersionId(),
                                    textEdit: { range: edit.range, text: edit.newText },
                                }],
                            },
                        })),
                        dispose: () => { },
                    };
                },
            });
        }
    };

    const handleEditorDidMount = (e: monaco.editor.IStandaloneCodeEditor, onEscape?: () => void) => {
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

        // Escape: dismiss suggestions if visible (Monaco built-in), then run context action.
        // The precondition `!suggestWidgetVisible` ensures this only fires after suggestions
        // are already dismissed — so two Escape presses are needed when suggestions are open.
        registerUniversalEditorBindings(e);

        // eslint-disable-next-line no-bitwise
        e.addAction({
            id: 'escape-action',
            label: onEscape ? 'Close full-screen editor' : 'Blur editor',
            keybindings: [monaco.KeyCode.Escape],
            precondition: '!suggestWidgetVisible',
            run: () => {
                if (onEscape) {
                    onEscape();
                } else {
                    (document.activeElement as HTMLElement)?.blur();
                }
            },
        });

        // eslint-disable-next-line no-bitwise
        e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            if (indicatorRef.current === "offline" || !queryRef.current || !graphNameRef.current || tutorialOpenRef.current) return;
            submitQuery.current?.click();
        });

        // The compact bar uses Enter to submit and Up/Down to navigate history.
        // The fullscreen dialog editor (onEscape defined) should have standard
        // Monaco behaviour: Enter = newline, arrow keys = cursor movement.
        if (!onEscape) {
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
        }

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
                            disableCompactEditorShortcuts(e);
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
                <DialogContent hideClose className="w-full h-full" onEscapeKeyDown={(e) => {
                    // When Monaco has focus, let it handle Escape (closes suggestions or blurs).
                    // Only allow the Dialog to handle Escape if Monaco is not focused.
                    if ((e.target as HTMLElement)?.closest?.('.monaco-editor')) e.preventDefault();
                }}>
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
                                handleEditorDidMount(e, () => setMaximize(false));
                                /* eslint-disable no-bitwise */
                                // Enable find widget in the fullscreen editor (compact bar disables it).
                                e.addAction({
                                    id: 'open-find-dialog',
                                    label: 'Find',
                                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
                                    run: (editor) => { editor.getAction('actions.find')?.run(); },
                                });
                                // Prevent the browser reload shortcuts from triggering a page reload
                                // inside the fullscreen editor. Users can press Escape first to exit.
                                e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => { });
                                e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyR, () => { });
                                /* eslint-enable no-bitwise */
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
