import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { HistoryQuery, Query } from "../../lib/utils.ts";
import { updateQueryHistoryProfile } from "./queryHistoryProfile.ts";

const query = (text: string, timestamp: number, profile: string[] = []): Query => ({
    text,
    explain: [],
    profile,
    graphName: "graph",
    timestamp,
    status: "Success",
    elementsCount: 0,
    fav: false
});

const history = (queries: Query[], currentQuery: Query, counter = 0): HistoryQuery => ({
    queries,
    currentQuery,
    query: currentQuery.text,
    counter
});

describe("updateQueryHistoryProfile", () => {
    it("updates the matching selected row without overwriting the editor draft", () => {
        const draft = query("MATCH (n) RETURN n", 7);
        const selected = query("RETURN 3", 7);
        const previous = history([draft, selected], draft, 2);

        const updated = updateQueryHistoryProfile(previous, selected, ["profile"], 4, 4);

        assert.deepEqual(updated?.queries, [
            draft,
            { ...selected, profile: ["profile"] }
        ]);
        assert.equal(updated?.currentQuery, draft);
    });

    it("does not recreate a history entry that was deleted while profiling", () => {
        const draft = query("MATCH (n) RETURN n", 8);
        const previous = history([draft], draft, 0);

        assert.equal(updateQueryHistoryProfile(previous, query("RETURN 3", 9), ["profile"], 4, 4), undefined);
        assert.deepEqual(previous.queries, [draft]);
    });

    it("updates a current query that is not yet in history", () => {
        const draft = query("RETURN 3", 10);
        const previous = history([], draft);

        const updated = updateQueryHistoryProfile(previous, draft, ["profile"], 4, 4);

        assert.deepEqual(updated?.currentQuery, { ...draft, profile: ["profile"] });
        assert.equal(updated?.queries, previous.queries);
    });

    it("updates both current and history copies when they identify the same query", () => {
        const selected = query("RETURN 3", 11);
        const previous = history([selected], selected);

        const updated = updateQueryHistoryProfile(previous, selected, ["profile"], 4, 4);

        assert.deepEqual(updated?.currentQuery, { ...selected, profile: ["profile"] });
        assert.deepEqual(updated?.queries, [{ ...selected, profile: ["profile"] }]);
    });

    it("ignores a profile result from a superseded connection", () => {
        const selected = query("RETURN 3", 12);
        const previous = history([selected], selected);

        assert.equal(updateQueryHistoryProfile(previous, selected, ["profile"], 4, 5), undefined);
        assert.deepEqual(previous.queries, [selected]);
    });
});
