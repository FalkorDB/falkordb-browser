import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { HistoryQuery, Query } from "../../lib/utils.ts";
import {
    applyQueryHistoryProfileUpdates,
    applyQueryHistoryProfileUpdatesToStoredQueries,
    getSelectedHistoryQuery,
    isQueryHistoryTabEnabled,
    reconcilePendingQueryHistoryProfileUpdates,
    retainPendingQueryHistoryProfileUpdates,
    updateQueryHistoryProfile
} from "./queryHistoryProfile.ts";

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
    it("does not treat the latest executed query as selected history when no row is selected", () => {
        const latest = query("RETURN 3", 1);
        const previous = history([latest], latest, 0);

        assert.equal(getSelectedHistoryQuery(previous), undefined);
    });

    it("returns the history row selected by the history counter", () => {
        const latest = query("RETURN 3", 1);
        const selected = query("RETURN 1", 2);
        const previous = history([latest, selected], latest, 2);

        assert.equal(getSelectedHistoryQuery(previous), selected);
    });

    it("keeps the draft editor available but disables result tabs without a selected row", () => {
        const latest = query("RETURN 3", 1);
        const previous = history([latest], latest, 0);

        assert.equal(isQueryHistoryTabEnabled(previous, "text"), true);
        assert.equal(isQueryHistoryTabEnabled(previous, "profile"), false);
        assert.equal(isQueryHistoryTabEnabled(previous, "metadata"), false);
        assert.equal(isQueryHistoryTabEnabled(previous, "explain"), false);
    });

    it("enables result tabs according to the selected history row's data", () => {
        const latest = query("RETURN 3", 1);
        const selected = {
            ...query("CREATE (n) RETURN n", 2),
            metadata: ["Nodes created: 1"],
            explain: ["Results"]
        };
        const previous = history([latest, selected], latest, 2);

        assert.equal(isQueryHistoryTabEnabled(previous, "text"), true);
        assert.equal(isQueryHistoryTabEnabled(previous, "profile"), true);
        assert.equal(isQueryHistoryTabEnabled(previous, "metadata"), true);
        assert.equal(isQueryHistoryTabEnabled(previous, "explain"), true);
    });

    it("retains a profile update when the matching current query is still running", () => {
        const inFlight = query("RETURN 3", 1);
        const previous = history([], inFlight);
        const update = { target: inFlight, profile: ["profile"], connectionEpoch: 4 };

        assert.deepEqual(
            retainPendingQueryHistoryProfileUpdates(previous, [update], 4, true),
            [update]
        );
    });

    it("retains a stored-row profile update until a running query commits", () => {
        const stored = query("RETURN 3", 1);
        const running = query("RETURN 5", 2);
        const whileRunning = history([stored], running);
        const update = { target: stored, profile: ["profile"], connectionEpoch: 4 };

        const retained = retainPendingQueryHistoryProfileUpdates(whileRunning, [update], 4, true);
        assert.deepEqual(retained, [update]);

        const afterCommit = history([stored], running);
        assert.deepEqual(
            retainPendingQueryHistoryProfileUpdates(afterCommit, retained, 4, false),
            []
        );
        assert.deepEqual(
            applyQueryHistoryProfileUpdates(afterCommit, retained, 4).queries,
            [{ ...stored, profile: ["profile"] }]
        );
    });

    it("reconciles a retained profile into history state after a query commits its captured snapshot", () => {
        const stored = query("RETURN 3", 1);
        const running = query("RETURN 5", 2);
        const update = { target: stored, profile: ["profile"], connectionEpoch: 4 };
        const profiledStored = { ...stored, profile: ["profile"] };
        let currentHistory = history([profiledStored], running);
        const updateState = (updater: (previous: HistoryQuery) => HistoryQuery) => {
            currentHistory = updater(currentHistory);
        };

        const retained = reconcilePendingQueryHistoryProfileUpdates(
            currentHistory,
            [update],
            4,
            true,
            updateState,
            JSON.stringify([profiledStored])
        ).retained;
        assert.deepEqual(retained, [update]);
        assert.deepEqual(currentHistory.queries, [profiledStored]);

        currentHistory = history([stored], running);
        const { updated } = reconcilePendingQueryHistoryProfileUpdates(
            currentHistory,
            retained,
            4,
            false,
            updateState,
            JSON.stringify([stored])
        );

        assert.deepEqual(currentHistory.queries, [{ ...stored, profile: ["profile"] }]);
        assert.deepEqual(updated.queries, currentHistory.queries);
    });

    it("reconciles pending profiles even when stored history is malformed", () => {
        const stored = query("RETURN 3", 1);
        const current = query("RETURN 5", 2);
        const update = { target: stored, profile: ["profile"], connectionEpoch: 4 };
        let currentHistory = history([stored], current);
        const updateState = (updater: (previous: HistoryQuery) => HistoryQuery) => {
            currentHistory = updater(currentHistory);
        };

        const result = reconcilePendingQueryHistoryProfileUpdates(
            currentHistory,
            [update],
            4,
            false,
            updateState,
            "{not json"
        );

        assert.deepEqual(currentHistory.queries, [{ ...stored, profile: ["profile"] }]);
        assert.deepEqual(result.retained, []);
        assert.equal(result.persistedQueries, undefined);
        assert.ok(result.storageError instanceof SyntaxError);
    });

    it("applies pending profiles without persisting malformed non-array storage", () => {
        const stored = query("RETURN 3", 1);
        const current = query("RETURN 5", 2);
        const update = { target: stored, profile: ["profile"], connectionEpoch: 4 };
        let currentHistory = history([stored], current);
        const updateState = (updater: (previous: HistoryQuery) => HistoryQuery) => {
            currentHistory = updater(currentHistory);
        };

        const result = reconcilePendingQueryHistoryProfileUpdates(
            currentHistory,
            [update],
            4,
            false,
            updateState,
            JSON.stringify({ text: stored.text })
        );

        assert.deepEqual(currentHistory.queries, [{ ...stored, profile: ["profile"] }]);
        assert.deepEqual(result.retained, []);
        assert.equal(result.persistedQueries, undefined);
        assert.ok(result.storageError instanceof TypeError);
    });

    it("skips non-object rows when reconciling profiles while a query is loading", () => {
        const stored = query("RETURN 3", 1);
        const current = query("RETURN 5", 2);
        const update = { target: stored, profile: ["profile"], connectionEpoch: 4 };
        const malformedQueries = JSON.parse(JSON.stringify([null, "invalid", stored])) as Query[];
        let currentHistory = history(malformedQueries, current);
        const updateState = (updater: (previous: HistoryQuery) => HistoryQuery) => {
            currentHistory = updater(currentHistory);
        };

        const result = reconcilePendingQueryHistoryProfileUpdates(
            currentHistory,
            [update],
            4,
            true,
            updateState,
            JSON.stringify([null, "invalid", stored])
        );

        assert.deepEqual(result.retained, [update]);
        assert.deepEqual(result.persistedQueries, [null, "invalid", { ...stored, profile: ["profile"] }]);
        assert.equal(result.storageError, undefined);
    });

    it("does not restore a missing history list while applying a current-query profile", () => {
        const current = query("RETURN 5", 2);
        const update = { target: current, profile: ["profile"], connectionEpoch: 4 };
        let currentHistory = history([], current);
        const updateState = (updater: (previous: HistoryQuery) => HistoryQuery) => {
            currentHistory = updater(currentHistory);
        };

        const result = reconcilePendingQueryHistoryProfileUpdates(
            currentHistory,
            [update],
            4,
            false,
            updateState,
            null
        );

        assert.deepEqual(currentHistory.currentQuery.profile, ["profile"]);
        assert.deepEqual(result.persistedQueries, []);
        assert.equal(result.storageError, undefined);
    });

    it("does not restore a deleted row when reconciling profiles into the latest stored history", () => {
        const deleted = query("RETURN 3", 1);
        const current = query("RETURN 5", 2);
        const staleSnapshot = history([deleted], current);
        const update = { target: deleted, profile: ["profile"], connectionEpoch: 4 };

        assert.deepEqual(
            applyQueryHistoryProfileUpdatesToStoredQueries(staleSnapshot, [], [update], 4),
            []
        );
    });

    it("does not retain deleted or stale profile updates during a query", () => {
        const deleted = query("RETURN 3", 1);
        const unrelated = query("RETURN 5", 2);
        const previous = history([unrelated], unrelated);
        const update = { target: deleted, profile: ["profile"], connectionEpoch: 4 };
        const staleUpdate = { ...update, connectionEpoch: 3 };

        assert.deepEqual(
            retainPendingQueryHistoryProfileUpdates(previous, [update, staleUpdate], 4, true),
            []
        );
    });

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

    it("applies queued profile results only to live entries from the active connection", () => {
        const draft = query("MATCH (n) RETURN n", 13);
        const selected = query("RETURN 3", 14);
        const previous = history([draft, selected], draft, 2);

        const updated = applyQueryHistoryProfileUpdates(previous, [
            { target: selected, profile: ["selected profile"], connectionEpoch: 4 },
            { target: query("RETURN 5", 15), profile: ["deleted profile"], connectionEpoch: 4 },
            { target: draft, profile: ["stale profile"], connectionEpoch: 3 },
        ], 4);

        assert.deepEqual(updated.queries, [
            draft,
            { ...selected, profile: ["selected profile"] }
        ]);
        assert.equal(updated.currentQuery, draft);
    });
});
