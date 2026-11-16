import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    buildCompletionItems,
    buildUdfItems,
    type BuildItemsArgs,
    type SuggestionItem,
    type SuggestionKinds,
} from "./cypherSuggestionItems.ts";

const kinds = { Function: 1, Property: 2, Variable: 3, Class: 4, Interface: 5 } as unknown as SuggestionKinds;
const SNIPPET = 4 as never;

const base = (over: Partial<BuildItemsArgs> = {}): BuildItemsArgs => ({
    kinds,
    graphInfo: { Labels: new Map(), Relationships: new Map() },
    queryText: "",
    udfSuggestions: [],
    staticSuggestions: [],
    includeGraphMetadata: true,
    ...over,
});

describe("buildUdfItems", () => {
    it("flattens every function of every library into snippet items", () => {
        const items = buildUdfItems(
            [
                ["id1", "mylib", "", ["foo", "bar"]],
                ["id2", "other", "", ["baz"]],
                ["id3", "empty", "", []],
            ],
            kinds,
            SNIPPET,
        );
        assert.deepEqual(items, [
            { insertTextRules: SNIPPET, insertText: "mylib.foo(${0})", label: "mylib.foo()", kind: 1, detail: "(udf function)" },
            { insertTextRules: SNIPPET, insertText: "mylib.bar(${0})", label: "mylib.bar()", kind: 1, detail: "(udf function)" },
            { insertTextRules: SNIPPET, insertText: "other.baz(${0})", label: "other.baz()", kind: 1, detail: "(udf function)" },
        ]);
    });

    it("returns an empty list for no libraries", () => {
        assert.deepEqual(buildUdfItems([], kinds, SNIPPET), []);
    });
});

describe("buildCompletionItems", () => {
    const graphInfo = {
        PropertyKeys: ["name", "age"],
        Labels: new Map<string, unknown>([["Person", 1], ["", 2], ["City", 3]]),
        Relationships: new Map<string, unknown>([["KNOWS", 1], ["", 2]]),
    };

    it("after a dot returns only property keys", () => {
        const items = buildCompletionItems(base({
            context: { triggerCharacter: "." },
            graphInfo,
            queryText: "MATCH (n) RETURN n.",
            udfSuggestions: [{ label: "u" } as SuggestionItem],
            staticSuggestions: [{ label: "MATCH" } as SuggestionItem],
        }));
        assert.deepEqual(items, [
            { insertText: "name", label: "name", kind: 2, detail: "(property key)" },
            { insertText: "age", label: "age", kind: 2, detail: "(property key)" },
        ]);
    });

    it("after a dot returns nothing without graph metadata", () => {
        assert.deepEqual(
            buildCompletionItems(base({ context: { triggerCharacter: "." }, graphInfo, includeGraphMetadata: false })),
            [],
        );
    });

    it("after a dot tolerates missing PropertyKeys", () => {
        assert.deepEqual(buildCompletionItems(base({ context: { triggerCharacter: "." } })), []);
    });

    it("ignores other trigger characters", () => {
        const items = buildCompletionItems(base({
            context: { triggerCharacter: "(" },
            staticSuggestions: [{ label: "MATCH" } as SuggestionItem],
        }));
        assert.deepEqual(items, [{ label: "MATCH" }]);
    });

    it("lists static, udf, variable, label, relationship and property items in order", () => {
        const udf = { label: "mylib.foo()", insertText: "mylib.foo(${0})" } as SuggestionItem;
        const items = buildCompletionItems(base({
            graphInfo,
            queryText: "MATCH (alpha) RETURN alpha",
            udfSuggestions: [udf],
            staticSuggestions: [
                { label: "MATCH", insertText: "MATCH", range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } } as SuggestionItem,
                { label: "WHERE", insertText: "WHERE" } as SuggestionItem,
            ],
        }));
        assert.deepEqual(items, [
            { label: "MATCH", insertText: "MATCH" },
            { label: "WHERE", insertText: "WHERE" },
            udf,
            { insertText: "alpha", label: "alpha", kind: 3, detail: "(variable)" },
            { insertText: "Person", label: "Person", kind: 4, detail: "(label)" },
            { insertText: "City", label: "City", kind: 4, detail: "(label)" },
            { insertText: "KNOWS", label: "KNOWS", kind: 5, detail: "(relationship type)" },
            { insertText: "name", label: "name", kind: 2, detail: "(property key)" },
            { insertText: "age", label: "age", kind: 2, detail: "(property key)" },
        ]);
        assert.ok(!("range" in items[0]));
    });

    it("omits graph metadata when not included but keeps variables", () => {
        const items = buildCompletionItems(base({
            graphInfo,
            queryText: "MATCH (alpha) RETURN alpha",
            includeGraphMetadata: false,
        }));
        assert.deepEqual(items, [
            { insertText: "alpha", label: "alpha", kind: 3, detail: "(variable)" },
        ]);
    });

    it("tolerates missing PropertyKeys when including graph metadata", () => {
        const items = buildCompletionItems(base({
            graphInfo: { Labels: new Map([["Person", 1]]), Relationships: new Map() },
        }));
        assert.deepEqual(items, [
            { insertText: "Person", label: "Person", kind: 4, detail: "(label)" },
        ]);
    });
});
