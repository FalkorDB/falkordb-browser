/* eslint-disable react/require-default-props */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { loader, Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { getTheme } from "@/lib/utils";

export const LINE_HEIGHT = 22;

export const DEFAULT_MONACO_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
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
    overflowWidgetsDomNode: undefined,
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

    monacoI.editor.setTheme(themeName);
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
     */
    getSuggestions?: (monacoInstance: Monaco) => Promise<monaco.languages.CompletionItem[]>;
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
    // editorKey is accepted for API compat but not used (no key-based remount needed)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const onChangeRef = useRef(onChange);
    const onMountRef = useRef(onMount);
    const onMonacoReadyRef = useRef(onMonacoReady);

    // Keep refs in sync
    useEffect(() => { languageConfigRef.current = languageConfig; }, [languageConfig]);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
    useEffect(() => { onMountRef.current = onMount; }, [onMount]);
    useEffect(() => { onMonacoReadyRef.current = onMonacoReady; }, [onMonacoReady]);

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
                const languages = monacoInstance.languages.getLanguages();
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
                    const provider = monacoInstance.languages.registerCompletionItemProvider(language, {
                        provideCompletionItems: async (model, position) => {
                            const currentConfig = languageConfigRef.current;
                            if (!currentConfig?.getSuggestions) return { suggestions: [] };
                            const word = model.getWordUntilPosition(position);
                            const range = new monacoInstance.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
                            const suggestions = await currentConfig.getSuggestions(monacoInstance);
                            return {
                                suggestions: suggestions.map(s => ({ ...s, range }))
                            };
                        },
                    });
                    sugDisposableRef.current = provider;
                }
            }

            onMonacoReadyRef.current?.(monacoInstance);

            // Create the editor
            const editor = monacoInstance.editor.create(containerRef.current, {
                ...mergedOptions,
                value,
                language,
                theme: themeName,
            });

            editorRef.current = editor;

            // Listen for content changes
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
    }, []);

    // Re-register monarch tokenizer when languageConfig changes
    useEffect(() => {
        const monacoInstance = monacoRef.current;
        const lc = languageConfigRef.current;
        if (monacoInstance && lc?.monarchTokensProvider) {
            monacoInstance.languages.setMonarchTokensProvider(language, lc.monarchTokensProvider);
        }
    }, [languageConfig, language]);

    // Update value when prop changes (but not if the editor content already matches)
    useEffect(() => {
        const editor = editorRef.current;
        if (editor && value !== undefined && editor.getValue() !== value) {
            editor.setValue(value);
        }
    }, [value]);

    // Update options when they change
    useEffect(() => {
        editorRef.current?.updateOptions(mergedOptions);
    }, [readOnly, options]);

    // Update theme when it changes
    useEffect(() => {
        if (monacoRef.current) {
            setEditorTheme(monacoRef.current, themeName, themeBackground || background, currentTheme === "dark");
        }
    }, [currentTheme, themeName, themeBackground, background]);

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
