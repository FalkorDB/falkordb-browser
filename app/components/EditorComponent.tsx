/* eslint-disable react/require-default-props */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { Editor, Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";
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
            { token: 'keyword', foreground: isDark ? '#99E4E5' : '#7568F2' },
            { token: 'function', foreground: isDark ? '#DCDCAA' : '#5A5A42' },
            { token: 'type', foreground: isDark ? '#89D86D' : '#2E5A27' },
            { token: 'string', foreground: isDark ? '#CE9178' : '#53392C' },
            { token: 'number', foreground: isDark ? '#b5cea8' : '#3C5335' },
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
}: EditorComponentProps) {
    const { theme } = useTheme();
    const { background, currentTheme } = getTheme(theme);
    const [sugDisposable, setSugDisposable] = useState<monaco.IDisposable>();
    const languageConfigRef = useRef(languageConfig);

    // Keep ref in sync so the completion provider always calls the latest getSuggestions
    useEffect(() => {
        languageConfigRef.current = languageConfig;
    }, [languageConfig]);

    // Dispose completion provider on unmount
    useEffect(() => () => {
        sugDisposable?.dispose();
    }, [sugDisposable]);

    const handleBeforeMount = (monacoI: Monaco) => {
        setEditorTheme(monacoI, "editor-theme", background, currentTheme === "dark");

        if (languageConfig) {
            // Register the custom language if not already registered
            const languages = monacoI.languages.getLanguages();
            if (!languages.some(l => l.id === language)) {
                monacoI.languages.register({ id: language });
            }

            // Set monarch tokenizer if provided
            if (languageConfig.monarchTokensProvider) {
                monacoI.languages.setMonarchTokensProvider(language, languageConfig.monarchTokensProvider);
            }

            // Set language configuration if provided
            if (languageConfig.languageConfiguration) {
                monacoI.languages.setLanguageConfiguration(language, languageConfig.languageConfiguration);
            }

            // Register completion provider if getSuggestions is provided
            if (languageConfig.getSuggestions) {
                const provider = monacoI.languages.registerCompletionItemProvider(language, {
                    provideCompletionItems: async (model, position) => {
                        const currentConfig = languageConfigRef.current;
                        if (!currentConfig?.getSuggestions) return { suggestions: [] };

                        const word = model.getWordUntilPosition(position);
                        const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
                        const suggestions = await currentConfig.getSuggestions(monacoI);
                        return {
                            suggestions: suggestions.map(s => ({ ...s, range }))
                        };
                    },
                });
                setSugDisposable(provider);
            }
        }

        onMonacoReady?.(monacoI);
    };

    const mergedOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
        ...DEFAULT_MONACO_OPTIONS,
        readOnly,
        ...options,
    };

    return (
        <Editor
            className={className}
            key={editorKey ? `${editorKey}-${currentTheme}` : currentTheme}
            height={height}
            language={language}
            options={mergedOptions}
            value={value}
            onChange={onChange}
            theme="editor-theme"
            beforeMount={handleBeforeMount}
            onMount={onMount}
        />
    );
}
