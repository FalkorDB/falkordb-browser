"use client";

import { useContext, useMemo } from "react";
import dynamic from "next/dynamic";
import { UDFContext } from "../components/provider";
import Spinning from "../components/ui/spinning";
import Export from "../components/Export";
import { LanguageConfig } from "../components/EditorComponent";

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

export default function Page() {

    const { selectedUdf } = useContext(UDFContext);

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
                        // eslint-disable-next-line no-useless-escape
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
                    height="100%"
                    readOnly
                    options={{
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