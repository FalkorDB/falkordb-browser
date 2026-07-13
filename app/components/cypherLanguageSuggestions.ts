import * as monaco from "monaco-editor";
import { Monaco } from "@monaco-editor/react";
import { UDFEntry } from "@/lib/utils";
import { extractVariableCandidates } from "@/lib/cypherSuggestions";

type GraphInfoLike = {
    PropertyKeys?: string[];
    Labels: Map<string, unknown>;
    Relationships: Map<string, unknown>;
};

type SuggestionItem = Omit<monaco.languages.CompletionItem, "range"> & {
    range?: monaco.languages.CompletionItem["range"];
};

type BuildSuggestionsArgs = {
    monacoInstance: Monaco;
    context?: monaco.languages.CompletionContext;
    graphInfo: GraphInfoLike;
    queryText: string;
    udfSuggestions: SuggestionItem[];
    staticSuggestions: SuggestionItem[];
    includeGraphMetadata: boolean;
};

export function buildUdfFunctionSuggestions(udfList: UDFEntry[]): SuggestionItem[] {
    return udfList.flatMap(([, libName, , functions]) =>
        functions.map((fn: string) => ({
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            insertText: `${libName}.${fn}(\${0})`,
            label: `${libName}.${fn}()`,
            kind: monaco.languages.CompletionItemKind.Function,
            detail: "(udf function)",
        }))
    );
}

export function buildCypherCompletionItems({
    monacoInstance,
    context,
    graphInfo,
    queryText,
    udfSuggestions,
    staticSuggestions,
    includeGraphMetadata,
}: BuildSuggestionsArgs): SuggestionItem[] {
    if (context?.triggerCharacter === ".") {
        if (!includeGraphMetadata) return [];
        return (graphInfo.PropertyKeys ?? []).map((key) => ({
            insertText: key,
            label: key,
            kind: monacoInstance.languages.CompletionItemKind.Property,
            detail: "(property key)",
        }));
    }

    // Strip the placeholder (1,1)-(1,1) range that STATIC_SUGGESTIONS carry so
    // EditorComponent applies its word-based cursor range instead of inserting
    // the completion at the start of the document. Mirrors CypherEditor's own
    // provider, which strips the same placeholder range.
    const items: SuggestionItem[] = [
        ...staticSuggestions.map(({ range: _range, ...rest }) => rest),
        ...udfSuggestions,
    ];

    extractVariableCandidates(queryText).forEach((v) => {
        items.push({
            insertText: v,
            label: v,
            kind: monacoInstance.languages.CompletionItemKind.Variable,
            detail: "(variable)",
        });
    });

    if (includeGraphMetadata) {
        graphInfo.Labels.forEach((_, name) => {
            if (!name) return;
            items.push({
                insertText: name,
                label: name,
                kind: monacoInstance.languages.CompletionItemKind.Class,
                detail: "(label)",
            });
        });

        graphInfo.Relationships.forEach((_, name) => {
            if (!name) return;
            items.push({
                insertText: name,
                label: name,
                kind: monacoInstance.languages.CompletionItemKind.Interface,
                detail: "(relationship type)",
            });
        });

        (graphInfo.PropertyKeys ?? []).forEach((key) => {
            items.push({
                insertText: key,
                label: key,
                kind: monacoInstance.languages.CompletionItemKind.Property,
                detail: "(property key)",
            });
        });
    }

    return items;
}