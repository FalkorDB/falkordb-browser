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
    observeGraphsFirstSeen,
    renameGraphFirstSeen,
    sortGraphNames,
} = await import("./graphSortOrder.ts");

const SCOPED_KEY = `localhost:6379:default:${GRAPHS_FIRST_SEEN_KEY}`;

// The maps are prototype-less so that a graph named `__proto__` is an ordinary
// entry; `assert.deepEqual` from node:assert/strict compares prototypes, so
// copy into a plain object before asserting on the contents.
const plain = (firstSeen: Record<string, number>) => ({ ...firstSeen });

// An object literal cannot express a `__proto__` key, so name-collision cases
// are asserted as sorted entries instead.
const entries = (firstSeen: Record<string, number>) =>
    Object.entries(firstSeen).sort(([a], [b]) => a.localeCompare(b));

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
    assert.deepEqual(plain(recordGraphsFirstSeen(["a", "b"], 100)), { a: 100, b: 100 });
    assert.deepEqual(JSON.parse(storage.getItem(SCOPED_KEY)!), { a: 100, b: 100 });

    // An existing graph keeps its stamp, a new one gets the current time.
    assert.deepEqual(plain(recordGraphsFirstSeen(["a", "b", "c"], 200)), { a: 100, b: 100, c: 200 });

    setConnectionPrefix("localhost", 6379, "alice");
    assert.deepEqual(plain(readGraphsFirstSeen()), {});
});

test("a list that swaps one graph for another is written back", () => {
    recordGraphsFirstSeen(["a", "b"], 100);

    // Same length as the stored map, so only a key-set comparison notices.
    assert.deepEqual(plain(recordGraphsFirstSeen(["b", "c"], 200)), { b: 100, c: 200 });
    assert.deepEqual(JSON.parse(storage.getItem(SCOPED_KEY)!), { b: 100, c: 200 });

    // Nothing moved, so the entry is left untouched.
    storage.setItem(SCOPED_KEY, JSON.stringify({ b: 100, c: 200, stale: 300 }));
    recordGraphsFirstSeen(["b", "c", "stale"], 400);
    assert.deepEqual(JSON.parse(storage.getItem(SCOPED_KEY)!), { b: 100, c: 200, stale: 300 });
});

test("a dropped graph is forgotten, so reusing its name counts as a new graph", () => {
    recordGraphsFirstSeen(["a", "b"], 100);

    assert.deepEqual(plain(recordGraphsFirstSeen(["a"], 200)), { a: 100 });
    assert.deepEqual(plain(recordGraphsFirstSeen(["a", "b"], 300)), { a: 100, b: 300 });
});

test("deleting the last graph empties the history", () => {
    recordGraphsFirstSeen(["a"], 100);

    // The caller decides whether an empty list is a confirmed observation; when
    // it is (a successful deletion), the name has to be forgotten so that
    // recreating it later counts as a new graph.
    assert.deepEqual(plain(recordGraphsFirstSeen([], 200)), {});
    assert.deepEqual(JSON.parse(storage.getItem(SCOPED_KEY)!), {});
    assert.deepEqual(plain(recordGraphsFirstSeen(["a"], 300)), { a: 300 });
});

test("graph names that collide with Object.prototype members are ordinary graphs", () => {
    const names = ["__proto__", "constructor", "toString"];
    const byName = (a: string, b: string) => a.localeCompare(b);

    assert.deepEqual(entries(recordGraphsFirstSeen(names, 100)), [["__proto__", 100], ["constructor", 100], ["toString", 100]]);
    assert.deepEqual(entries(readGraphsFirstSeen()), [["__proto__", 100], ["constructor", 100], ["toString", 100]]);

    // They keep their stamp, so a later graph really does sort as the newest.
    const firstSeen = recordGraphsFirstSeen([...names, "newest"], 200);

    assert.deepEqual(entries(firstSeen), [["__proto__", 100], ["constructor", 100], ["newest", 200], ["toString", 100]]);
    assert.deepEqual(sortGraphNames([...names, "newest"], "new-old", firstSeen), ["newest", ...[...names].sort(byName)]);

    renameGraphFirstSeen("constructor", "renamed");
    assert.deepEqual(entries(readGraphsFirstSeen()), [["__proto__", 100], ["newest", 200], ["renamed", 100], ["toString", 100]]);
});

test("an ordinary record passed by a caller cannot leak inherited members into the order", () => {
    // The initial React state is a plain `{}`, where `constructor` resolves to a
    // function and would make the comparator return NaN.
    assert.deepEqual(sortGraphNames(["constructor", "a"], "new-old", {}), ["a", "constructor"]);
    assert.deepEqual(sortGraphNames(["constructor", "a"], "new-old", { constructor: 100 }), ["constructor", "a"]);
});

test("unreadable stored timestamps are ignored", () => {
    storage.setItem(SCOPED_KEY, "not json");
    assert.deepEqual(plain(readGraphsFirstSeen()), {});

    storage.setItem(SCOPED_KEY, JSON.stringify(["a", "b"]));
    assert.deepEqual(plain(readGraphsFirstSeen()), {});

    storage.setItem(SCOPED_KEY, JSON.stringify({ a: 100, b: "yesterday" }));
    assert.deepEqual(plain(readGraphsFirstSeen()), { a: 100 });
});

test("nothing is stored before a connection prefix is set", () => {
    clearConnectionPrefix();
    // Drop the scope marker the prefix left behind, so any key here is ours.
    storage.clear();

    assert.deepEqual(plain(recordGraphsFirstSeen(["a"], 100)), { a: 100 });
    assert.equal(storage.length, 0);

    renameGraphFirstSeen("a", "b");
    assert.equal(storage.length, 0);
});

test("a graph missing from an observed list keeps the time it was first seen", () => {
    recordGraphsFirstSeen(["a", "b"], 100);

    // `b` can be absent because it was offloaded, or because the list belongs to
    // a refresh that has not landed — an observation cannot tell those from a
    // deletion, so it forgets nothing.
    assert.deepEqual(plain(observeGraphsFirstSeen(["a"], 200)), { a: 100, b: 100 });
    assert.deepEqual(plain(observeGraphsFirstSeen(["a", "b"], 300)), { a: 100, b: 100 });
    assert.deepEqual(JSON.parse(storage.getItem(SCOPED_KEY)!), { a: 100, b: 100 });
});

test("an observed list still stamps the graphs it does bring", () => {
    observeGraphsFirstSeen(["a"], 100);

    assert.deepEqual(plain(observeGraphsFirstSeen(["a", "b"], 200)), { a: 100, b: 200 });
    assert.deepEqual(plain(readGraphsFirstSeen()), { a: 100, b: 200 });
});

test("a renamed graph keeps the time it was first seen", () => {
    recordGraphsFirstSeen(["a", "b"], 100);
    recordGraphsFirstSeen(["a", "b", "c"], 200);

    // The selector renders from the returned map, so it must already carry the
    // new name — reading the order back off the stored value only is not enough.
    const renamed = renameGraphFirstSeen("a", "renamed");

    assert.deepEqual(plain(renamed), { renamed: 100, b: 100, c: 200 });
    assert.deepEqual(plain(readGraphsFirstSeen()), { renamed: 100, b: 100, c: 200 });
    assert.deepEqual(sortGraphNames(["renamed", "b", "c"], "new-old", renamed), ["c", "b", "renamed"]);
});

test("renaming leaves the timestamps alone when there is nothing to carry over", () => {
    recordGraphsFirstSeen(["a"], 100);

    assert.deepEqual(plain(renameGraphFirstSeen("a", "a")), { a: 100 });
    assert.deepEqual(plain(renameGraphFirstSeen("missing", "renamed")), { a: 100 });

    assert.deepEqual(plain(readGraphsFirstSeen()), { a: 100 });
});
