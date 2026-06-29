/* eslint-disable react/require-default-props */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { loader, Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { getTheme } from "@/lib/utils";

if (typeof window !== 'undefined') {
    (window as Window & { MonacoEnvironment?: { getWorker: (_moduleId: unknown, label: string) => Worker } }).MonacoEnvironment = {
        getWorker(_moduleId: unknown, label: string) {
            switch (label) {
                case 'json':
                    return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url));
                case 'css':
                case 'scss':
                case 'less':
                    return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker', import.meta.url));
                case 'html':
                case 'handlebars':
                case 'razor':
                    return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker', import.meta.url));
                case 'typescript':
                case 'javascript':
                    return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url));
                default:
                    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
            }
        },
    };
}

loader.config({ monaco });

// ---------------------------------------------------------------------------
// Singleton completion-provider registry.
// Monaco calls ALL registered providers for a language — registering one per
// EditorComponent instance causes duplicated suggestions when multiple editors
// share the same language. This registry ensures at most ONE provider exists
// per language at any time, while keeping the config ref always up-to-date.
// ---------------------------------------------------------------------------
interface ProviderEntry {
    configRef: { current: LanguageConfig | undefined };
    disposable: monaco.IDisposable;
    count: number;
}
const completionProviderRegistry = new Map<string, ProviderEntry>();

// Per-model config registry: maps model URI → LanguageConfig.
// Allows multiple editors using the same language to each have their own
// suggestions (e.g. query history vs. main editor) without registering
// duplicate Monaco providers.
const modelConfigRegistry = new Map<string, LanguageConfig>();

export const LINE_HEIGHT = 22;

export const DEFAULT_MONACO_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
    renderLineHighlight: "none",
    glyphMargin: false,
    lineDecorationsWidth: 5,
    folding: false,
    fixedOverflowWidgets: true,
    occurrencesHighlight: "off",
    wordBasedSuggestions: "off",
    hover: {
        delay: 100,
    },
    roundedSelection: false,
    contextmenu: false,
    cursorStyle: "line-thin",
    links: false,
    minimap: { enabled: false },
    automaticLayout: true,
    fontSize: 20,
    fontWeight: "400",
    wordWrap: "off",
    lineHeight: LINE_HEIGHT,
    lineNumbersMinChars: 2,
    overviewRulerLanes: 0,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    scrollBeyondLastColumn: 0,
    scrollBeyondLastLine: false,
    scrollbar: {
        vertical: 'hidden',
        horizontal: 'hidden'
    },
};

export const setEditorTheme = (monacoI: Monaco, themeName: string, backgroundColor: string, isDark: boolean) => {
    monacoI.editor.defineTheme(themeName, {
        base: isDark ? 'vs-dark' : 'vs',
        inherit: true,
        rules: [
            { token: 'keyword', foreground: isDark ? '#569CD6' : '#0000FF' },
            { token: 'keyword.flow', foreground: isDark ? '#C586C0' : '#AF00DB' },
            { token: 'function', foreground: isDark ? '#DCDCAA' : '#795E26' },
            { token: 'type', foreground: isDark ? '#89D86D' : '#2E5A27' },
            { token: 'string', foreground: isDark ? '#CE9178' : '#A31515' },
            { token: 'number', foreground: isDark ? '#b5cea8' : '#098658' },
            { token: 'variable', foreground: isDark ? '#9CDCFE' : '#001080' },
            { token: 'constant', foreground: isDark ? '#4FC1FF' : '#0070C1' },
            { token: 'comment', foreground: isDark ? '#6A9955' : '#008000' },
        ],
        colors: {
            'editor.background': backgroundColor,
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
};

// Keep backward-compatible alias
export const setTheme = setEditorTheme;

export interface LanguageConfig {
    /** Monarch tokenizer rules for syntax highlighting */
    monarchTokensProvider?: monaco.languages.IMonarchLanguage;
    /** Language configuration (brackets, auto-closing pairs, etc.) */
    languageConfiguration?: monaco.languages.LanguageConfiguration;
    /** 
     * Async function that returns completion suggestions. 
     * Called once on mount and whenever the completion provider triggers.
     * The `range` property is optional since EditorComponent always overwrites it.
     */
    getSuggestions?: (
        monacoInstance: Monaco,
        context?: monaco.languages.CompletionContext,
        model?: monaco.editor.ITextModel,
        position?: monaco.Position
    ) => Promise<(Omit<monaco.languages.CompletionItem, 'range'> & { range?: monaco.languages.CompletionItem['range'] })[]>;
    /** Characters that trigger the completion provider in addition to typing identifier characters. */
    triggerCharacters?: string[];
}

export interface EditorComponentProps {
    value: string;
    onChange?: (value: string | undefined) => void;
    /** Language id. For custom languages, also pass languageConfig. For built-in languages (javascript, json, etc.) just pass the id. */
    language?: string;
    /** Configuration for custom language registration (tokenizer, brackets, suggestions) */
    languageConfig?: LanguageConfig;
    options?: monaco.editor.IStandaloneEditorConstructionOptions;
    height?: number | string;
    className?: string;
    editorKey?: string;
    onMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
    /** Callback fired with the Monaco instance after beforeMount completes */
    onMonacoReady?: (monacoInstance: Monaco) => void;
    readOnly?: boolean;
    /** Custom Monaco theme name (defaults to "editor-theme") */
    themeName?: string;
    /** Custom background color for the editor theme (defaults to the app background color) */
    themeBackground?: string;
}

export default function EditorComponent({
    value,
    onChange,
    language = "plaintext",
    languageConfig,
    options,
    height,
    className,
    editorKey,
    onMount,
    onMonacoReady,
    readOnly = false,
    themeName = "editor-theme",
    themeBackground,
}: EditorComponentProps) {
    const { theme } = useTheme();
    const { background, currentTheme } = getTheme(theme);
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const sugDisposableRef = useRef<monaco.IDisposable | null>(null);
    const languageConfigRef = useRef(languageConfig);
    const participatesInRegistry = useRef(false);
    const onChangeRef = useRef(onChange);
    const onMountRef = useRef(onMount);
    const onMonacoReadyRef = useRef(onMonacoReady);
    const valueRef = useRef(value);
    const overflowHostRef = useRef<HTMLDivElement | null>(null);

    // Keep refs in sync; also update model-specific and shared registry configs when languageConfig changes.
    useEffect(() => {
        languageConfigRef.current = languageConfig;
        if (participatesInRegistry.current && languageConfig?.getSuggestions) {
            const editorModel = editorRef.current?.getModel();
            if (editorModel) modelConfigRegistry.set(editorModel.uri.toString(), languageConfig);
            const entry = completionProviderRegistry.get(language);
            if (entry) entry.configRef.current = languageConfig;
        }
    }, [languageConfig, language]);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
    useEffect(() => { onMountRef.current = onMount; }, [onMount]);
    useEffect(() => { onMonacoReadyRef.current = onMonacoReady; }, [onMonacoReady]);
    useEffect(() => { valueRef.current = value; }, [value]);

    const mergedOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
        ...DEFAULT_MONACO_OPTIONS,
        readOnly,
        ...options,
    };

    // Initialize the editor once the container is mounted
    useEffect(() => {
        let disposed = false;

        loader.init().then((monacoInstance: Monaco) => {
            if (disposed || !containerRef.current) return;

            monacoRef.current = monacoInstance;

            // Set up theme
            setEditorTheme(monacoInstance, themeName, themeBackground || background, currentTheme === "dark");

            // Register custom language if needed
            if (languageConfigRef.current) {
                const lc = languageConfigRef.current;
                const languages: monaco.languages.ILanguageExtensionPoint[] = monacoInstance.languages.getLanguages();
                if (!languages.some(l => l.id === language)) {
                    monacoInstance.languages.register({ id: language });
                }
                if (lc.monarchTokensProvider) {
                    monacoInstance.languages.setMonarchTokensProvider(language, lc.monarchTokensProvider);
                }
                if (lc.languageConfiguration) {
                    monacoInstance.languages.setLanguageConfiguration(language, lc.languageConfiguration);
                }
                if (lc.getSuggestions) {
                    const existingEntry = completionProviderRegistry.get(language);
                    if (existingEntry) {
                        // Another editor already owns the provider — update config and share it.
                        existingEntry.configRef.current = lc;
                        existingEntry.count += 1;
                    } else {
                        // First instance for this language — register the singleton provider.
                        const sharedConfigRef: { current: LanguageConfig | undefined } = { current: lc };
                        const disposable = monacoInstance.languages.registerCompletionItemProvider(language, {
                            triggerCharacters: lc.triggerCharacters,
                            provideCompletionItems: (async (model, position, context) => {
                        const currentConfig = modelConfigRegistry.get(model.uri.toString()) ?? sharedConfigRef.current;
                                if (!currentConfig?.getSuggestions) return { suggestions: [] };
                                const word = model.getWordUntilPosition(position);
                                const range = new monacoInstance.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
                                const suggestions = await currentConfig.getSuggestions(monacoInstance, context, model, position);
                                return { suggestions: suggestions.map(s => ({ ...s, range })) };
                            }) as monaco.languages.CompletionItemProvider['provideCompletionItems'],
                        });
                        completionProviderRegistry.set(language, { configRef: sharedConfigRef, disposable, count: 1 });
                    }
                    participatesInRegistry.current = true;
                }
            }

            onMonacoReadyRef.current?.(monacoInstance);

            // Create a theme-aware host element at body level for Monaco's overflow widgets
            // (suggest, hover, find). This solves the Radix UI transform trap:
            //   • Radix positions PopoverContent via `transform: matrix(...)` which makes
            //     it the CSS containing block for `position:fixed` descendants.
            //   • Monaco computes suggest-widget positions in viewport coordinates, but the
            //     browser interprets them relative to the transformed popper → off-screen.
            // Placing the overflow widget container at body level (no ancestor transform)
            // restores correct viewport-relative positioning.
            // We give the host the `.monaco-editor` class so Monaco's own CSS rules
            // (`.monaco-editor .suggest-widget { … }`) and CSS variables still apply.
            const isDark = currentTheme === "dark";
            const overflowHost = document.createElement('div');
            overflowHost.className = `monaco-editor ${isDark ? 'vs-dark' : 'vs'}`;
            Object.assign(overflowHost.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '0',
                height: '0',
                overflow: 'visible',
                pointerEvents: 'none',
                // Must be above the Radix popper (z-index: 30) so suggest/hover/find
                // widgets are painted on top of any popover they overlap.
                zIndex: '50',
            });
            document.body.appendChild(overflowHost);
            overflowHostRef.current = overflowHost;

            //Claude Create the editor
            const editor = monacoInstance.editor.create(containerRef.current, {
                ...mergedOptions,
                value: valueRef.current,
                language,
                theme: themeName,
                overflowWidgetsDomNode: overflowHost,
            });

            editorRef.current = editor;

            // Register this editor's model for per-model suggestion dispatch.
            const currentLc = languageConfigRef.current;
            if (currentLc?.getSuggestions) {
                const editorModel = editor.getModel();
                if (editorModel) modelConfigRegistry.set(editorModel.uri.toString(), currentLc);
            }

            // Listen for content changes — skip callback when change is from our own setValue
            editor.onDidChangeModelContent(() => {
                onChangeRef.current?.(editor.getValue());
            });

            onMountRef.current?.(editor);
        });

        return () => {
            disposed = true;
        };
    }, []);

    // Synchronous cleanup before DOM removal — prevents rAF callbacks
    // from accessing destroyed DOM nodes during HMR
    useLayoutEffect(() => () => {
        // Release this instance's hold on the singleton provider.
        if (participatesInRegistry.current) {
            // Remove model-specific suggestion config.
            const editorModel = editorRef.current?.getModel();
            if (editorModel) modelConfigRegistry.delete(editorModel.uri.toString());

            const entry = completionProviderRegistry.get(language);
            if (entry) {
                entry.count -= 1;
                if (entry.count <= 0) {
                    entry.disposable.dispose();
                    completionProviderRegistry.delete(language);
                }
            }
            participatesInRegistry.current = false;
        }
        // Legacy per-instance disposable (kept for safety).
        sugDisposableRef.current?.dispose();
        sugDisposableRef.current = null;

        if (editorRef.current) {
            // Get the model before disposing the editor
            const model = editorRef.current.getModel();
            editorRef.current.dispose();
            editorRef.current = null;
            // Dispose the model separately to avoid leaks
            model?.dispose();
        }
        // Remove the overflow widget host from body when the editor unmounts.
        if (overflowHostRef.current?.parentNode) {
            overflowHostRef.current.parentNode.removeChild(overflowHostRef.current);
            overflowHostRef.current = null;
        }
    }, []);

    // Re-register monarch tokenizer when languageConfig changes
    useEffect(() => {
        const monacoInstance = monacoRef.current;
        const lc = languageConfigRef.current;
        if (monacoInstance && lc?.monarchTokensProvider) {
            monacoInstance.languages.setMonarchTokensProvider(language, lc.monarchTokensProvider);
        }
    }, [languageConfig, language]);

    // Sync external value changes (history navigation, etc.) into the editor.
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor || value === undefined) return;
        if (editor.getValue() === value) return;

        editor.setValue(value);

        // Move cursor to end so context keys (isFirstLine/isLastLine) stay accurate
        const model = editor.getModel();
        if (model) {
            const lastLine = model.getLineCount();
            const lastCol = model.getLineMaxColumn(lastLine);
            editor.setPosition({ lineNumber: lastLine, column: lastCol });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Update options when they change
    useEffect(() => {
        editorRef.current?.updateOptions(mergedOptions);
    }, [readOnly, options]);

    // Update theme when it changes (editorKey is included so that external state
    // changes – such as closing the query-history dialog – trigger a re-apply)
    useEffect(() => {
        if (monacoRef.current) {
            setEditorTheme(monacoRef.current, themeName, themeBackground || background, currentTheme === "dark");
            editorRef.current?.updateOptions({ theme: themeName });
        }
        // Keep the overflow host base-theme class in sync so Monaco's CSS variables
        // resolve correctly when the user switches between light and dark mode.
        if (overflowHostRef.current) {
            overflowHostRef.current.className = `monaco-editor ${currentTheme === "dark" ? 'vs-dark' : 'vs'}`;
        }
    }, [currentTheme, themeName, themeBackground, background, editorKey]);

    // Update language when it changes
    useEffect(() => {
        const editor = editorRef.current;
        const monacoInstance = monacoRef.current;
        if (editor && monacoInstance) {
            const model = editor.getModel();
            if (model) {
                monacoInstance.editor.setModelLanguage(model, language);
            }
        }
    }, [language]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{ height: typeof height === "number" ? `${height}px` : (height || "100%"), width: "100%" }}
        />
    );
}
