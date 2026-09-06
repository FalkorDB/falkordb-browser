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

const {
    setConnectionPrefix,
    clearConnectionPrefix,
    getConnectionPrefix,
    getConnectionItem,
    setConnectionItem,
    removeConnectionItem,
    removeConnectionItemsByPrefix,
    migrateToScopedStorage,
} = await import("./connection-storage.ts");

beforeEach(() => {
    storage.clear();
    setConnectionPrefix("localhost", 6379, "default");
});

test("keys are scoped by host, port and username", () => {
    setConnectionItem("chat-social", "hello");

    assert.equal(getConnectionPrefix(), "localhost:6379:default:");
    assert.equal(storage.getItem("localhost:6379:default:chat-social"), "hello");
    assert.equal(getConnectionItem("chat-social"), "hello");

    // Another connection reads its own value, not this one.
    setConnectionPrefix("localhost", 6379, "alice");
    assert.equal(getConnectionItem("chat-social"), null);
});

test("removeConnectionItem only drops the scoped key", () => {
    setConnectionItem("a", "1");
    setConnectionItem("b", "2");

    removeConnectionItem("a");

    assert.equal(getConnectionItem("a"), null);
    assert.equal(getConnectionItem("b"), "2");
});

test("removeConnectionItemsByPrefix drops a whole tab namespace", () => {
    setConnectionItem("tab-1-chat-social", "one");
    setConnectionItem("tab-1-chat-movies", "two");
    setConnectionItem("tab-2-chat-social", "keep");
    setConnectionItem("graph-tabs", "keep");

    removeConnectionItemsByPrefix("tab-1-");

    assert.equal(getConnectionItem("tab-1-chat-social"), null);
    assert.equal(getConnectionItem("tab-1-chat-movies"), null);
    assert.equal(getConnectionItem("tab-2-chat-social"), "keep");
    assert.equal(getConnectionItem("graph-tabs"), "keep");
});

test("removeConnectionItemsByPrefix leaves other connections alone", () => {
    setConnectionItem("tab-1-chat-social", "mine");
    setConnectionPrefix("localhost", 6379, "alice");
    setConnectionItem("tab-1-chat-social", "theirs");

    removeConnectionItemsByPrefix("tab-1-");

    assert.equal(getConnectionItem("tab-1-chat-social"), null);
    setConnectionPrefix("localhost", 6379, "default");
    assert.equal(getConnectionItem("tab-1-chat-social"), "mine");
});

test("an unset prefix leaves reads and writes unscoped", () => {
    clearConnectionPrefix();
    setConnectionItem("x", "1");

    assert.equal(getConnectionPrefix(), "");
    assert.equal(storage.getItem("x"), "1");
});

// Migration runs at most once per prefix (module-level bookkeeping), so each of
// these tests uses a username of its own.
test("migrateToScopedStorage moves recognized unscoped keys under the prefix", () => {
    setConnectionPrefix("localhost", 6379, "migrate-plain");
    storage.setItem("query history", "[1]");
    storage.setItem("chat-social", "hi");
    storage.setItem("cypherOnly-social", "true");
    storage.setItem("labelStyle_Person", "{}");

    migrateToScopedStorage();

    assert.equal(getConnectionItem("query history"), "[1]");
    assert.equal(getConnectionItem("chat-social"), "hi");
    assert.equal(getConnectionItem("cypherOnly-social"), "true");
    assert.equal(getConnectionItem("labelStyle_Person"), "{}");
    // The legacy entries are gone, so migration never repeats itself.
    assert.equal(storage.getItem("query history"), null);
    assert.equal(storage.getItem("chat-social"), null);
});

test("migrateToScopedStorage ignores unrelated and no-longer-scoped keys", () => {
    setConnectionPrefix("localhost", 6379, "migrate-ignore");
    // Browser settings are deliberately unscoped, and savedContent was dropped
    // from the scoped set when tabs took over context persistence.
    storage.setItem("limit", "300");
    storage.setItem("maxTabs", "8");
    storage.setItem("savedContent", "legacy");

    migrateToScopedStorage();

    assert.equal(storage.getItem("limit"), "300");
    assert.equal(storage.getItem("maxTabs"), "8");
    assert.equal(storage.getItem("savedContent"), "legacy");
    assert.equal(getConnectionItem("savedContent"), null);
});

test("migrateToScopedStorage upgrades the username-less legacy prefix", () => {
    setConnectionPrefix("localhost", 6379, "migrate-legacy");
    storage.setItem("localhost:6379:query history", "[2]");
    storage.setItem("localhost:6379:chat-social", "old");

    migrateToScopedStorage();

    assert.equal(getConnectionItem("query history"), "[2]");
    assert.equal(getConnectionItem("chat-social"), "old");
    assert.equal(storage.getItem("localhost:6379:query history"), null);
});

test("migrateToScopedStorage never overwrites an existing scoped value", () => {
    setConnectionPrefix("localhost", 6379, "migrate-keep");
    setConnectionItem("query history", "[current]");
    storage.setItem("query history", "[legacy]");

    migrateToScopedStorage();

    assert.equal(getConnectionItem("query history"), "[current]");
});
