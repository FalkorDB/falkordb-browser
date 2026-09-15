import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";

class MemoryStorage {
    private store = new Map<string, string>();

    get length() { return this.store.size; }

    key(index: number) { return [...this.store.keys()][index] ?? null; }

    getItem(key: string) { return this.store.get(key) ?? null; }

    setItem(key: string, value: string) { this.store.set(key, value); }

    removeItem(key: string) { this.store.delete(key); }

    clear() { this.store.clear(); }
}

const storage = new MemoryStorage();
(globalThis as Record<string, unknown>).window = globalThis;
(globalThis as Record<string, unknown>).localStorage = storage;

const { setConnectionPrefix, clearConnectionPrefix } = await import("./connection-storage.ts");
const {
    DEFAULT_GRAPH_SORT_ORDER,
    GRAPHS_FIRST_SEEN_KEY,
    normalizeGraphSortOrder,
    readGraphsFirstSeen,
    recordGraphsFirstSeen,
    renameGraphFirstSeen,
    sortGraphNames,
} = await import("./graphSortOrder.ts");

const SCOPED_KEY = `localhost:6379:default:${GRAPHS_FIRST_SEEN_KEY}`;

beforeEach(() => {
    storage.clear();
    setConnectionPrefix("localhost", 6379, "default");
});

test("an unknown sort order falls back to the anti-chronological default", () => {
    assert.equal(DEFAULT_GRAPH_SORT_ORDER, "new-old");
    assert.equal(normalizeGraphSortOrder("a-z"), "a-z");
    assert.equal(normalizeGraphSortOrder("z-a"), "z-a");
    assert.equal(normalizeGraphSortOrder("old-new"), "old-new");
    assert.equal(normalizeGraphSortOrder("by-size"), "new-old");
    assert.equal(normalizeGraphSortOrder(null), "new-old");
    assert.equal(normalizeGraphSortOrder(undefined), "new-old");
});

test("names are sorted by name, without touching the caller's array", () => {
    const names = ["beta", "Alpha", "gamma"];

    assert.deepEqual(sortGraphNames(names, "a-z"), ["Alpha", "beta", "gamma"]);
    assert.deepEqual(sortGraphNames(names, "z-a"), ["gamma", "beta", "Alpha"]);
    assert.deepEqual(names, ["beta", "Alpha", "gamma"]);
});

test("names are sorted by the time they were first seen", () => {
    const firstSeen = { old: 1, mid: 2, new: 3 };

    assert.deepEqual(sortGraphNames(["mid", "old", "new"], "new-old", firstSeen), ["new", "mid", "old"]);
    assert.deepEqual(sortGraphNames(["mid", "new", "old"], "old-new", firstSeen), ["old", "mid", "new"]);
});

test("graphs seen in the same pass, or never seen, fall back to their name", () => {
    const firstSeen = { b: 1, a: 1, latest: 2 };

    assert.deepEqual(sortGraphNames(["b", "a", "latest"], "new-old", firstSeen), ["latest", "a", "b"]);
    assert.deepEqual(sortGraphNames(["b", "a", "latest"], "old-new", firstSeen), ["a", "b", "latest"]);
    // An unrecorded graph counts as the oldest.
    assert.deepEqual(sortGraphNames(["unknown", "a"], "new-old", firstSeen), ["a", "unknown"]);
});

test("first-seen timestamps are recorded once per graph and scoped to the connection", () => {
    assert.deepEqual(recordGraphsFirstSeen(["a", "b"], 100), { a: 100, b: 100 });
    assert.deepEqual(JSON.parse(storage.getItem(SCOPED_KEY)!), { a: 100, b: 100 });

    // An existing graph keeps its stamp, a new one gets the current time.
    assert.deepEqual(recordGraphsFirstSeen(["a", "b", "c"], 200), { a: 100, b: 100, c: 200 });

    setConnectionPrefix("localhost", 6379, "alice");
    assert.deepEqual(readGraphsFirstSeen(), {});
});

test("a dropped graph is forgotten, so reusing its name counts as a new graph", () => {
    recordGraphsFirstSeen(["a", "b"], 100);

    assert.deepEqual(recordGraphsFirstSeen(["a"], 200), { a: 100 });
    assert.deepEqual(recordGraphsFirstSeen(["a", "b"], 300), { a: 100, b: 300 });
});

test("unreadable stored timestamps are ignored", () => {
    storage.setItem(SCOPED_KEY, "not json");
    assert.deepEqual(readGraphsFirstSeen(), {});

    storage.setItem(SCOPED_KEY, JSON.stringify(["a", "b"]));
    assert.deepEqual(readGraphsFirstSeen(), {});

    storage.setItem(SCOPED_KEY, JSON.stringify({ a: 100, b: "yesterday" }));
    assert.deepEqual(readGraphsFirstSeen(), { a: 100 });
});

test("nothing is stored before a connection prefix is set", () => {
    clearConnectionPrefix();

    assert.deepEqual(recordGraphsFirstSeen(["a"], 100), { a: 100 });
    assert.equal(storage.length, 0);

    renameGraphFirstSeen("a", "b");
    assert.equal(storage.length, 0);
});

test("a renamed graph keeps the time it was first seen", () => {
    recordGraphsFirstSeen(["a", "b"], 100);
    recordGraphsFirstSeen(["a", "b", "c"], 200);

    renameGraphFirstSeen("a", "renamed");

    assert.deepEqual(readGraphsFirstSeen(), { renamed: 100, b: 100, c: 200 });
    assert.deepEqual(sortGraphNames(["renamed", "b", "c"], "new-old", readGraphsFirstSeen()), ["c", "b", "renamed"]);
});

test("renaming leaves the timestamps alone when there is nothing to carry over", () => {
    recordGraphsFirstSeen(["a"], 100);

    renameGraphFirstSeen("a", "a");
    renameGraphFirstSeen("missing", "renamed");

    assert.deepEqual(readGraphsFirstSeen(), { a: 100 });
});
