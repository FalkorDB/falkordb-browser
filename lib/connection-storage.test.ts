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

test("migrateToScopedStorage leaves another user's scoped keys alone", () => {
    // A username may itself look like a scoped-key prefix, so `chat-bob`'s own
    // keys read as legacy `chat-` keys by shape. Stealing them would both leak
    // his data into this scope and delete his copy.
    setConnectionPrefix("localhost", 6379, "chat-bob");
    storage.setItem("localhost:6379:chat-bob:chat-social", "bob's chat");
    storage.setItem("localhost:6379:chat-bob:query history", "bob's history");

    setConnectionPrefix("localhost", 6379, "chat-alice");
    migrateToScopedStorage();

    assert.equal(storage.getItem("localhost:6379:chat-bob:chat-social"), "bob's chat");
    assert.equal(storage.getItem("localhost:6379:chat-bob:query history"), "bob's history");
    assert.equal(getConnectionItem("chat-bob:chat-social"), null);
    assert.equal(getConnectionItem("chat-bob:query history"), null);
});

test("a colon in the username cannot collide with another scope's key", () => {
    // `alice`'s graph is named `bob:chat-social`; `alice:chat-bob`'s is `social`.
    // Spelled out raw, both would be localhost:6379:alice:chat-bob:chat-social.
    setConnectionPrefix("localhost", 6379, "alice");
    setConnectionItem("chat-bob:chat-social", "alice's chat");

    setConnectionPrefix("localhost", 6379, "alice:chat-bob");
    assert.equal(getConnectionItem("chat-social"), null);
    setConnectionItem("chat-social", "the other alice's chat");

    setConnectionPrefix("localhost", 6379, "alice");
    assert.equal(getConnectionItem("chat-bob:chat-social"), "alice's chat");
});

test("migrateToScopedStorage recognises a scope whose username contains a colon", () => {
    setConnectionPrefix("localhost", 6379, "chat-bob:prod");
    setConnectionItem("chat-social", "bob's chat");
    assert.equal(storage.getItem("localhost:6379:chat-bob%3Aprod:chat-social"), "bob's chat");

    setConnectionPrefix("localhost", 6379, "chat-alice");
    migrateToScopedStorage();

    assert.equal(storage.getItem("localhost:6379:chat-bob%3Aprod:chat-social"), "bob's chat");
    assert.equal(getConnectionItem("chat-bob%3Aprod:chat-social"), null);
});

test("migrateToScopedStorage still upgrades a graph name that looks like a username", () => {
    // No `chat-ns` scope has ever signed in, so this is a legacy key for a
    // graph named `ns:social`, not one of that user's.
    setConnectionPrefix("localhost", 6379, "migrate-colon");
    storage.setItem("localhost:6379:chat-ns:social", "old");
    storage.setItem("localhost:6379:chat-bob:query history", "also legacy");

    migrateToScopedStorage();

    assert.equal(getConnectionItem("chat-ns:social"), "old");
    assert.equal(getConnectionItem("chat-bob:query history"), "also legacy");
    assert.equal(storage.getItem("localhost:6379:chat-ns:social"), null);
});

test("migrateToScopedStorage rescues keys written under an unescaped username", () => {
    // The release before the escape wrote this user's prefix out raw, so the
    // suffix carries the username. Left unrecognized, the data is stranded.
    setConnectionPrefix("localhost", 6379, "migrate:raw");
    storage.setItem("localhost:6379:migrate:raw:query history", "[3]");
    storage.setItem("localhost:6379:migrate:raw:chat-social", "old");

    migrateToScopedStorage();

    assert.equal(getConnectionItem("query history"), "[3]");
    assert.equal(getConnectionItem("chat-social"), "old");
    assert.equal(storage.getItem("localhost:6379:migrate:raw:query history"), null);
    assert.equal(storage.getItem("localhost:6379:migrate:raw:chat-social"), null);
});

test("migrateToScopedStorage leaves an unescaped-username key a live scope could own", () => {
    // By shape `localhost:6379:live:chat-bob:chat-social` is this user's legacy
    // key, but it is just as likely `live`'s key for a graph named
    // `chat-bob:chat-social` — and `live` has signed in, so that scope exists.
    // Ambiguity resolves in favour of the scope that is known to be real.
    setConnectionPrefix("localhost", 6379, "live");
    setConnectionItem("keep", "1");
    storage.setItem("localhost:6379:live:chat-bob:chat-social", "whose?");

    setConnectionPrefix("localhost", 6379, "live:chat-bob");
    migrateToScopedStorage();

    assert.equal(storage.getItem("localhost:6379:live:chat-bob:chat-social"), "whose?");
    assert.equal(getConnectionItem("chat-social"), null);
});
