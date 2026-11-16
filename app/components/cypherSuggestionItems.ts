import type * as monaco from "monaco-editor";
import type { UDFEntry } from "../../lib/utils.ts";
import { extractVariableCandidates } from "../../lib/cypherSuggestions.ts";

export type GraphInfoLike = {
    PropertyKeys?: string[];
    Labels: Map<string, unknown>;
    Relationships: Map<string, unknown>;
};

export type SuggestionItem = Omit<monaco.languages.CompletionItem, "range"> & {
    range?: monaco.languages.CompletionItem["range"];
};

// Monaco enum values are injected so this module never imports the editor runtime.
export type SuggestionKinds = {
    Function: monaco.languages.CompletionItemKind;
    Property: monaco.languages.CompletionItemKind;
    Variable: monaco.languages.CompletionItemKind;
    Class: monaco.languages.CompletionItemKind;
    Interface: monaco.languages.CompletionItemKind;
};

export type BuildItemsArgs = {
    kinds: SuggestionKinds;
    context?: Pick<monaco.languages.CompletionContext, "triggerCharacter">;
    graphInfo: GraphInfoLike;
    queryText: string;
    udfSuggestions: SuggestionItem[];
    staticSuggestions: SuggestionItem[];
    includeGraphMetadata: boolean;
};

export function buildUdfItems(
    udfList: UDFEntry[],
    kinds: SuggestionKinds,
    snippetRule: monaco.languages.CompletionItemInsertTextRule,
): SuggestionItem[] {
    return udfList.flatMap(([, libName, , functions]) =>
        functions.map((fn: string) => ({
            insertTextRules: snippetRule,
            insertText: `${libName}.${fn}(\${0})`,
            label: `${libName}.${fn}()`,
            kind: kinds.Function,
            detail: "(udf function)",
        }))
    );
}

export function buildCompletionItems({
    kinds,
    context,
    graphInfo,
    queryText,
    udfSuggestions,
    staticSuggestions,
    includeGraphMetadata,
}: BuildItemsArgs): SuggestionItem[] {
    if (context?.triggerCharacter === ".") {
        if (!includeGraphMetadata) return [];
        return (graphInfo.PropertyKeys ?? []).map((key) => ({
            insertText: key,
            label: key,
            kind: kinds.Property,
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
            kind: kinds.Variable,
            detail: "(variable)",
        });
    });

    if (includeGraphMetadata) {
        graphInfo.Labels.forEach((_, name) => {
            if (!name) return;
            items.push({
                insertText: name,
                label: name,
                kind: kinds.Class,
                detail: "(label)",
            });
        });

        graphInfo.Relationships.forEach((_, name) => {
            if (!name) return;
            items.push({
                insertText: name,
                label: name,
                kind: kinds.Interface,
                detail: "(relationship type)",
            });
        });

        (graphInfo.PropertyKeys ?? []).forEach((key) => {
            items.push({
                insertText: key,
                label: key,
                kind: kinds.Property,
                detail: "(property key)",
            });
        });
    }

    return items;
}
