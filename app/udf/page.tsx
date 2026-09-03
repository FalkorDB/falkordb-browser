"use client";

import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { UDFContext } from "../components/provider";
import Spinning from "../components/ui/spinning";
import Export from "../components/Export";
import { LanguageConfig } from "../components/EditorComponent";
import type { editor } from "monaco-editor";
import { findFunctionLocation } from "./functionNavigation";

const EditorComponent = dynamic(() => import("../components/EditorComponent"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-background flex justify-center items-center border border-border rounded-lg">
        <Spinning />
    </div>,
});

const JS_DECLARATION_KEYWORDS = [
    "function", "class", "extends",
    "export", "import", "from", "default", "static", "async", "await",
    "new", "delete", "typeof", "instanceof", "void", "in", "of", "with",
    "let", "var", "const",
];

const JS_FLOW_KEYWORDS = [
    "return", "if", "else", "for", "while", "do", "switch", "case",
    "break", "continue", "throw", "try", "catch", "finally", "yield",
    "debugger",
];

const JS_CONSTANTS = [
    "true", "false", "null", "undefined", "NaN", "Infinity", "this", "super",
];

const UDF_LANGUAGE_NAME = "udf-javascript";

// Monaco normalises a model's line endings, so compare against the raw source
// with the same normalisation — otherwise a CRLF library never matches.
const normalizeEol = (value: string) => value.replace(/\r\n/g, "\n");

export default function Page() {

    const { selectedUdf, selectedUdfFunction } = useContext(UDFContext);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    // The editor is loaded dynamically, so a pick can land before it mounts.
    const pendingFunctionRef = useRef<string | undefined>(undefined);

    // Extract function names from the selected UDF library
    const udfFunctions = useMemo(() => selectedUdf?.[3] || [], [selectedUdf]);

    const udfJsLanguageConfig: LanguageConfig = useMemo(() => {
        const functionRegex = udfFunctions.length > 0
            ? new RegExp(`\\b(${udfFunctions.map(f => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`)
            : null;

        return {
            monarchTokensProvider: {
                tokenizer: {
                    root: [
                        // Comments (must be before other rules)
                        [/\/\/.*$/, 'comment'],
                        [/\/\*\*/, 'comment.doc', '@jsdoc'],
                        [/\/\*/, 'comment', '@comment'],
                        // Strings
                        [/"([^"\\]|\\.)*"/, 'string'],
                        [/'([^'\\]|\\.)*'/, 'string'],
                        [/`/, 'string', '@templateString'],
                        // Function declaration: function NAME
                        [/(function)(\s+)([a-zA-Z_$][\w$]*)/, ['keyword', 'white', 'function']],
                        // Control flow keywords
                        [new RegExp(`\\b(${JS_FLOW_KEYWORDS.join('|')})\\b`), 'keyword.flow'],
                        // Declaration keywords
                        [new RegExp(`\\b(${JS_DECLARATION_KEYWORDS.join('|')})\\b`), 'keyword'],
                        // Constants
                        [new RegExp(`\\b(${JS_CONSTANTS.join('|')})\\b`), 'constant'],
                        // Numbers
                        [/0[xX][0-9a-fA-F]+/, 'number'],
                        [/\d+(\.\d+)?([eE][+-]?\d+)?/, 'number'],
                        // UDF function names (when used as calls or references)
                        ...(functionRegex ? [[functionRegex, 'function'] as [RegExp, string]] : []),
                        // Regular identifiers
                        [/[a-zA-Z_$][\w$]*/, 'variable'],
                        // Brackets
                        [/[{}()\[\]]/, '@brackets'],
                        // Operators
                        [/[;,.]/, 'delimiter'],
                        [/[+\-*/%=<>!&|^~?:]/, 'operator'],
                    ],
                    comment: [
                        [/[^/*]+/, 'comment'],
                        [/\*\//, 'comment', '@pop'],
                        [/[/*]/, 'comment'],
                    ],
                    jsdoc: [
                        [/@\w+/, 'comment.doc.tag'],
                        [/\{[^}]*\}/, 'comment.doc.type'],
                        [/\*\//, 'comment.doc', '@pop'],
                        [/./, 'comment.doc'],
                    ],
                    templateString: [
                        [/\$\{/, { token: 'delimiter.bracket', next: '@templateStringBracket' }],
                        [/`/, 'string', '@pop'],
                        [/./, 'string'],
                    ],
                    templateStringBracket: [
                        [/\}/, { token: 'delimiter.bracket', next: '@pop' }],
                        { include: 'root' },
                    ],
                },
                ignoreCase: false,
            } as import("monaco-editor").languages.IMonarchLanguage,
            languageConfiguration: {
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
                    { open: "'", close: "'", notIn: ['string', 'comment'] },
                    { open: '`', close: '`', notIn: ['string', 'comment'] },
                ],
                surroundingPairs: [
                    { open: '{', close: '}' },
                    { open: '[', close: ']' },
                    { open: '(', close: ')' },
                    { open: '"', close: '"' },
                    { open: "'", close: "'" },
                    { open: '`', close: '`' },
                ],
                comments: {
                    lineComment: '//',
                    blockComment: ['/*', '*/'],
                },
            },
        };
    }, [udfFunctions]);

    /**
     * Jumps to `functionName` and selects its name, the way a double-click would.
     * Returns false while the editor has not caught up with `source` yet, so the
     * caller can retry once the model content lands.
     */
    const revealFunction = useCallback((functionName: string, source: string) => {
        const editorInstance = editorRef.current;
        if (!editorInstance) return false;

        const model = editorInstance.getModel();
        if (!model || normalizeEol(model.getValue()) !== normalizeEol(source)) return false;

        const location = findFunctionLocation(source, functionName);
        // Nothing to jump to — stop retrying.
        if (!location) return true;

        const range = {
            startLineNumber: location.lineNumber,
            startColumn: location.column,
            endLineNumber: location.lineNumber,
            endColumn: location.column + location.length,
        };

        editorInstance.setSelection(range);
        editorInstance.revealRangeInCenter(range);
        editorInstance.focus();

        return true;
    }, []);

    useEffect(() => {
        const source = selectedUdf?.[5];
        const functionName = selectedUdfFunction?.name;

        if (!functionName || !source) {
            // Drop any navigation intent that was never consumed, so a later
            // mount does not jump to a function the user has since deselected.
            pendingFunctionRef.current = undefined;
            return undefined;
        }

        if (revealFunction(functionName, source)) {
            pendingFunctionRef.current = undefined;
            return undefined;
        }

        pendingFunctionRef.current = functionName;

        const editorInstance = editorRef.current;
        if (!editorInstance) return undefined;

        // The editor is mounted but still holds the previous library's code;
        // retry once its model is updated with the new value.
        const disposable = editorInstance.onDidChangeModelContent(() => {
            if (revealFunction(functionName, source)) {
                pendingFunctionRef.current = undefined;
                disposable.dispose();
            }
        });

        return () => disposable.dispose();
    }, [selectedUdf, selectedUdfFunction, revealFunction]);

    return (
        <div className="Page">
            {
                selectedUdf ?
                    <Export
                        className="z-10 absolute right-36 top-6"
                        content={selectedUdf?.[5] || ""}
                        filename={`${selectedUdf?.[1] || "udf_library"}.js`}
                        title="Export the selected UDF Library"
                        label="Export"
                    />
                    : null
            }
            <div className="w-full h-1 grow [&_.find-widget.visible]:!top-6 [&_.find-widget]:!right-72">
                <EditorComponent
                    value={selectedUdf?.[5] || "// Select a Library to view its code"}
                    language={UDF_LANGUAGE_NAME}
                    languageConfig={udfJsLanguageConfig}
                    onMount={(editorInstance) => {
                        editorRef.current = editorInstance;

                        const functionName = pendingFunctionRef.current;
                        // EditorComponent keeps this callback fresh, so the
                        // selection read here is the one on screen.
                        const source = selectedUdf?.[5];

                        if (functionName && source && revealFunction(functionName, source)) {
                            pendingFunctionRef.current = undefined;
                        }
                    }}
                    height="100%"
                    readOnly
                    options={{
                        fontSize: 14,
                        minimap: { enabled: true },
                        scrollbar: { vertical: 'auto', horizontal: 'auto' },
                        overviewRulerLanes: 3,
                        overviewRulerBorder: true,
                        domReadOnly: false,
                        find: {
                            addExtraSpaceOnTop: true,
                            autoFindInSelection: 'never',
                            seedSearchStringFromSelection: 'always',
                        },
                    }}
                />
            </div>
        </div>
    );
}