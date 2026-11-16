import * as monaco from "monaco-editor";
import { Monaco } from "@monaco-editor/react";
import { UDFEntry } from "@/lib/utils";
import {
    buildCompletionItems,
    buildUdfItems,
    type BuildItemsArgs,
    type SuggestionItem,
} from "./cypherSuggestionItems";

type BuildSuggestionsArgs = Omit<BuildItemsArgs, "kinds" | "context"> & {
    monacoInstance: Monaco;
    context?: monaco.languages.CompletionContext;
};

export function buildUdfFunctionSuggestions(udfList: UDFEntry[]): SuggestionItem[] {
    return buildUdfItems(
        udfList,
        monaco.languages.CompletionItemKind,
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    );
}

export function buildCypherCompletionItems({
    monacoInstance,
    ...args
}: BuildSuggestionsArgs): SuggestionItem[] {
    return buildCompletionItems({ ...args, kinds: monacoInstance.languages.CompletionItemKind });
}
