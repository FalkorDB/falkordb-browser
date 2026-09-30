import test from "node:test";
import assert from "node:assert/strict";
import {
    buildShareUrl,
    clampMaxTabs,
    createTab,
    forStorage,
    normalizeDirection,
    normalizeLayout,
    parseSharedTab,
    parseStoredTabs,
    tabScopedKey,
    tabStripItemWidth,
    DEFAULT_GRAPH_TABS,
    MAX_GRAPH_TABS,
    MIN_GRAPH_TABS,
    TAB_SCOPE_PREFIX,
    withSharedTab,
    type GraphTab,
} from "./graphTabs.ts";

const tab = (overrides: Partial<GraphTab> = {}): GraphTab => ({
    id: "t1",
    graphName: "g",
    query: "MATCH (n) RETURN n",
    view: "Graph",
    graph: {},
    schema: {},
    ...overrides,
});

const stored = (tabs: unknown[], activeTabId?: unknown) =>
    JSON.stringify({ tabs, activeTabId });

test("forStorage drops the open style panel but keeps the rest of the tab", () => {
    const customizing = { kind: "node", name: "person1" } as const;
    const source = tab({
        graph: { customizing, panelOpen: true },
        schema: { layout: "tree", panelOpen: false },
        chatOpen: true,
        name: "mine",
    });
    const result = forStorage(source);

    assert.equal("customizing" in result.graph, false);
    assert.deepEqual(result, tab({
        graph: { panelOpen: true },
        schema: { layout: "tree", panelOpen: false },
        chatOpen: true,
        name: "mine",
    }));
    // Non-destructive: the live tab still knows which panel is open.
    assert.deepEqual(source.graph.customizing, customizing);
});

test("tabStripItemWidth reserves room for the add button and every gap", () => {
    // 4 tabs: 24px add button + 4 x 4px gap = 40px reserved.
    assert.equal(tabStripItemWidth(4), "calc((100% - 40px) / 4)");
    // 10 tabs: 24px + 10 x 4px = 64px reserved.
    assert.equal(tabStripItemWidth(10), "calc((100% - 64px) / 10)");
});

test("tabStripItemWidth clamps the limit before measuring", () => {
    assert.equal(tabStripItemWidth(1), tabStripItemWidth(MIN_GRAPH_TABS));
    assert.equal(tabStripItemWidth(99), tabStripItemWidth(MAX_GRAPH_TABS));
    assert.equal(tabStripItemWidth(Number.NaN), tabStripItemWidth(DEFAULT_GRAPH_TABS));
});

test("normalizeLayout keeps supported layouts and falls back to force", () => {
    assert.equal(normalizeLayout("force"), "force");
    assert.equal(normalizeLayout("tree"), "tree");
    assert.equal(normalizeLayout("radial"), "radial");
    assert.equal(normalizeLayout("spiral"), "force");
    assert.equal(normalizeLayout(""), "force");
    assert.equal(normalizeLayout(null), "force");
    assert.equal(normalizeLayout(undefined), "force");
});

test("normalizeDirection resolves the direction against its layout", () => {
    // The force layout has no direction at all.
    assert.equal(normalizeDirection("force", "td"), "");
    assert.equal(normalizeDirection("force", undefined), "");

    // Tree takes the hierarchy directions and defaults to top-down.
    ["td", "bu", "lr", "rl"].forEach(direction => {
        assert.equal(normalizeDirection("tree", direction), direction);
    });
    assert.equal(normalizeDirection("tree", "out"), "td");
    assert.equal(normalizeDirection("tree", null), "td");

    // Radial takes its own pair and defaults to outward.
    assert.equal(normalizeDirection("radial", "out"), "out");
    assert.equal(normalizeDirection("radial", "in"), "in");
    // A direction that belongs to the other layout must not leak through.
    assert.equal(normalizeDirection("radial", "td"), "out");
    assert.equal(normalizeDirection("radial", undefined), "out");
});

test("clampMaxTabs keeps the limit inside the supported range", () => {
    assert.equal(clampMaxTabs(MIN_GRAPH_TABS), MIN_GRAPH_TABS);
    assert.equal(clampMaxTabs(MAX_GRAPH_TABS), MAX_GRAPH_TABS);
    assert.equal(clampMaxTabs(6), 6);
    assert.equal(clampMaxTabs(1), MIN_GRAPH_TABS);
    assert.equal(clampMaxTabs(99), MAX_GRAPH_TABS);
});

test("clampMaxTabs rounds fractions and falls back for non-numbers", () => {
    assert.equal(clampMaxTabs(6.4), 6);
    assert.equal(clampMaxTabs(6.6), 7);
    assert.equal(clampMaxTabs(NaN), DEFAULT_GRAPH_TABS);
    assert.equal(clampMaxTabs(Infinity), DEFAULT_GRAPH_TABS);
    assert.equal(clampMaxTabs(parseInt("", 10)), DEFAULT_GRAPH_TABS);
});

test("tabScopedKey namespaces a key under its tab", () => {
    assert.equal(tabScopedKey("abc", "chat-social"), `${TAB_SCOPE_PREFIX}abc-chat-social`);
    // Closing a tab wipes the namespace by prefix, so every key must start with it.
    assert.ok(tabScopedKey("abc", "chat-social").startsWith(`${TAB_SCOPE_PREFIX}abc-`));
});

test("parseStoredTabs returns null when there is nothing usable", () => {
    assert.equal(parseStoredTabs(null), null);
    assert.equal(parseStoredTabs(""), null);
    assert.equal(parseStoredTabs("not json"), null);
    assert.equal(parseStoredTabs(stored([])), null);
    assert.equal(parseStoredTabs(JSON.stringify({ tabs: "nope" })), null);
});

test("parseStoredTabs drops entries that are not tabs", () => {
    const result = parseStoredTabs(stored([
        tab({ id: "keep" }),
        { id: "missing-fields" },
        { ...tab(), view: "Chart" },
        null,
    ], "keep"));

    assert.deepEqual(result?.tabs.map(t => t.id), ["keep"]);
    assert.equal(result?.activeTabId, "keep");
});

test("parseStoredTabs keeps every piece of well-formed tab metadata", () => {
    const viewport = { centerX: 1, centerY: 2, zoom: 3 };
    const result = parseStoredTabs(stored([tab({
        name: "My tab",
        chatOpen: true,
        graph: {
            viewport,
            selected: "n:12:s",
            layout: "grid",
            direction: "lr",
            animation: true,
            pinned: false,
            dimmed: true,
            expand: false,
            panelOpen: false,
            customizing: { kind: "edge", name: "KNOWS" },
        },
        schema: {
            viewport,
            selected: "l:Person",
            layout: "tree",
            direction: "td",
            animation: false,
            pinned: true,
            dimmed: false,
            expand: true,
            panelOpen: true,
        },
    })]));

    assert.deepEqual(result?.tabs[0], {
        id: "t1",
        graphName: "g",
        query: "MATCH (n) RETURN n",
        view: "Graph",
        name: "My tab",
        chatOpen: true,
        graph: {
            viewport,
            selected: "n:12:s",
            layout: "grid",
            direction: "lr",
            animation: true,
            pinned: false,
            dimmed: true,
            expand: false,
            panelOpen: false,
            customizing: { kind: "edge", name: "KNOWS" },
        },
        schema: {
            viewport,
            selected: "l:Person",
            layout: "tree",
            direction: "td",
            animation: false,
            pinned: true,
            dimmed: false,
            expand: true,
            panelOpen: true,
        },
    });
});

test("parseStoredTabs reads a strip written before the metadata was split per view", () => {
    const viewport = { centerX: 1, centerY: 2, zoom: 3 };
    // The flat shape: every field sat on the tab itself, and all of it described
    // the graph view — the schema view remembered nothing.
    const result = parseStoredTabs(stored([{
        id: "t1",
        graphName: "g",
        query: "MATCH (n) RETURN n",
        view: "Graph",
        viewport,
        selected: "n:12",
        layout: "tree",
        panelOpen: false,
        customizing: { kind: "node", name: "Person" },
        chatOpen: true,
    }]));

    assert.deepEqual(result?.tabs[0].graph, {
        viewport,
        selected: "n:12",
        layout: "tree",
        direction: undefined,
        animation: undefined,
        pinned: undefined,
        dimmed: undefined,
        expand: undefined,
        panelOpen: false,
        customizing: { kind: "node", name: "Person" },
    });
    // Chat belongs to the tab now, wherever it was stored.
    assert.equal(result?.tabs[0].chatOpen, true);
    assert.deepEqual(result?.tabs[0].schema, {
        viewport: undefined,
        selected: undefined,
        layout: undefined,
        direction: undefined,
        animation: undefined,
        pinned: undefined,
        dimmed: undefined,
        expand: undefined,
        panelOpen: undefined,
    });
});

test("parseStoredTabs lifts chat out of the graph view's metadata", () => {
    const result = parseStoredTabs(stored([tab({
        graph: { chatOpen: true },
    } as unknown as Partial<GraphTab>)]));

    assert.equal(result?.tabs[0].chatOpen, true);
    assert.equal("chatOpen" in result!.tabs[0].graph, false);
});

test("parseStoredTabs strips metadata of the wrong type but keeps the tab", () => {
    const result = parseStoredTabs(stored([tab({
        graph: {
            viewport: { centerX: 1, zoom: 3 },
            selected: 12,
            layout: false,
            animation: "yes",
            pinned: 1,
            dimmed: null,
            expand: "true",
            panelOpen: 0,
            customizing: true,
            chatOpen: "open",
        },
        schema: "not an object",
        name: 7,
    } as unknown as Partial<GraphTab>)]));

    const empty = {
        viewport: undefined,
        selected: undefined,
        layout: undefined,
        direction: undefined,
        animation: undefined,
        pinned: undefined,
        dimmed: undefined,
        expand: undefined,
        panelOpen: undefined,
    };

    assert.deepEqual(result?.tabs, [{
        id: "t1",
        graphName: "g",
        query: "MATCH (n) RETURN n",
        view: "Graph",
        chatOpen: undefined,
        graph: { ...empty, customizing: undefined },
        schema: empty,
        name: undefined,
    }]);
});

test("parseStoredTabs drops a customizing ref that is not a known kind and name", () => {
    const customizing = (value: unknown) => parseStoredTabs(stored([
        tab({ graph: { customizing: value } } as unknown as Partial<GraphTab>),
    ]))?.tabs[0].graph.customizing;

    assert.equal(customizing({ kind: "line", name: "KNOWS" }), undefined);
    assert.equal(customizing({ kind: "node" }), undefined);
    assert.equal(customizing({ name: "Person" }), undefined);
    assert.deepEqual(customizing({ kind: "node", name: "" }), { kind: "node", name: "" });
});

test("parseStoredTabs defaults a missing active tab id to empty", () => {
    const result = parseStoredTabs(JSON.stringify({ tabs: [tab()] }));
    assert.equal(result?.activeTabId, "");

    const numeric = parseStoredTabs(stored([tab()], 5));
    assert.equal(numeric?.activeTabId, "");
});

const BASE = "https://browser.example.com/graph?tab=mine";

test("buildShareUrl carries only the portable part of the tab", () => {
    const url = new URL(buildShareUrl(tab({
        id: "private",
        name: "mine",
        view: "Table",
        graph: {
            layout: "tree",
            direction: "lr",
            viewport: { centerX: 1, centerY: 2, zoom: 3 },
            selected: "node-1",
            panelOpen: false,
        },
        chatOpen: true,
    }), BASE));

    assert.equal(url.pathname, "/graph");
    assert.deepEqual(Object.fromEntries(url.searchParams), {
        graph: "g",
        query: "MATCH (n) RETURN n",
        view: "Table",
        layout: "tree",
        direction: "lr",
    });
});

test("buildShareUrl takes the schema view's own layout", () => {
    const url = new URL(buildShareUrl(tab({
        view: "Schema",
        graph: { layout: "tree", direction: "td" },
        schema: { layout: "radial", direction: "in" },
    }), BASE));

    assert.equal(url.searchParams.get("layout"), "radial");
    assert.equal(url.searchParams.get("direction"), "in");
});

test("buildShareUrl leaves out what the tab does not have", () => {
    const url = new URL(buildShareUrl(tab({ query: "" }), BASE));
    assert.deepEqual([...url.searchParams.keys()], ["graph", "view"]);
});

test("parseSharedTab round-trips a share link", () => {
    const source = tab({ view: "Metadata", graph: { layout: "radial", direction: "out" } });
    const shared = parseSharedTab(new URL(buildShareUrl(source, BASE)).search);

    assert.deepEqual(shared, {
        graphName: "g",
        query: "MATCH (n) RETURN n",
        view: "Metadata",
        layout: "radial",
        direction: "out",
    });
});

test("parseSharedTab needs a graph to open", () => {
    assert.equal(parseSharedTab(""), null);
    assert.equal(parseSharedTab("?tab=abc"), null);
    assert.equal(parseSharedTab("?query=MATCH%20(n)%20RETURN%20n"), null);
});

test("parseSharedTab falls back to the graph view for an unknown view", () => {
    assert.equal(parseSharedTab("?graph=g&view=Bogus")?.view, "Graph");
    assert.equal(parseSharedTab("?graph=g")?.view, "Graph");
});

test("withSharedTab opens the shared context in a new active tab", () => {
    const stored = { tabs: [tab({ id: "a", graphName: "other" })], activeTabId: "a" };
    const result = withSharedTab(
        stored,
        { graphName: "g", query: "q", view: "Table", layout: "tree", direction: "lr" },
        tab({ id: "fresh", graphName: "", query: "" }),
    );

    assert.equal(result.activeTabId, "fresh");
    assert.deepEqual(result.tabs.map(t => t.id), ["a", "fresh"]);
    const opened = result.tabs[1];
    assert.equal(opened.graphName, "g");
    assert.equal(opened.query, "q");
    assert.equal(opened.view, "Table");
    assert.deepEqual(opened.graph, { layout: "tree", direction: "lr" });
    assert.deepEqual(opened.schema, {});
});

test("withSharedTab puts a schema link's layout on the schema view", () => {
    const result = withSharedTab(
        null,
        { graphName: "g", query: "", view: "Schema", layout: "radial", direction: "in" },
        tab({ id: "fresh" }),
    );

    assert.deepEqual(result.tabs[0].graph, {});
    assert.deepEqual(result.tabs[0].schema, { layout: "radial", direction: "in" });
});

test("withSharedTab starts a strip of its own when nothing is stored", () => {
    const result = withSharedTab(null, { graphName: "g", query: "q", view: "Graph" }, tab({ id: "fresh" }));
    assert.deepEqual(result.tabs.map(t => t.id), ["fresh"]);
    assert.equal(result.activeTabId, "fresh");
});

test("withSharedTab reuses a tab that already holds the same graph and query", () => {
    const stored = {
        tabs: [tab({ id: "a", graphName: "other" }), tab({ id: "b", graphName: "g", query: "q" })],
        activeTabId: "a",
    };
    const result = withSharedTab(stored, { graphName: "g", query: "q", view: "Table" }, tab({ id: "fresh" }));

    assert.equal(result.activeTabId, "b");
    assert.equal(result.tabs, stored.tabs);
});

test("withSharedTab opens past the tab limit", () => {
    const tabs = Array.from({ length: MAX_GRAPH_TABS }, (_, i) => tab({ id: `t${i}`, graphName: `g${i}` }));
    const result = withSharedTab({ tabs, activeTabId: "t0" }, { graphName: "new", query: "", view: "Graph" }, tab({ id: "fresh" }));

    assert.equal(result.tabs.length, MAX_GRAPH_TABS + 1);
    assert.equal(result.activeTabId, "fresh");
});

test("createTab starts a blank graph-view tab with a unique id", () => {
    const a = createTab();
    const b = createTab();

    assert.notEqual(a.id, b.id);
    assert.deepEqual({ ...a, id: "" }, { id: "", graphName: "", query: "", view: "Graph", graph: {}, schema: {} });
});

test("createTab falls back to a generated id without crypto.randomUUID", (t) => {
    // Non-secure contexts (plain-http hosts) have no randomUUID.
    const original = Object.getOwnPropertyDescriptor(globalThis, "crypto");
    Object.defineProperty(globalThis, "crypto", { configurable: true, value: {} });
    t.after(() => { if (original) Object.defineProperty(globalThis, "crypto", original); });

    const a = createTab();
    const b = createTab();

    assert.match(a.id, /^tab-\d+-[a-z0-9]+$/);
    assert.notEqual(a.id, b.id);
});

// The strip is never empty, so the most common "nothing stored" case in a real
// browser is a single untouched tab — not `null`.
const blankTab = (id: string, overrides: Partial<GraphTab> = {}) => tab({ id, graphName: "", query: "", ...overrides });

test("withSharedTab fills the untouched tab a fresh visitor already has", () => {
    const result = withSharedTab(
        { tabs: [blankTab("blank")], activeTabId: "blank" },
        { graphName: "g", query: "q", view: "Table", layout: "tree", direction: "lr" },
        tab({ id: "fresh" }),
    );

    assert.deepEqual(result.tabs.map(t => t.id), ["blank"]);
    assert.equal(result.activeTabId, "blank");
    assert.equal(result.tabs[0].graphName, "g");
    assert.equal(result.tabs[0].query, "q");
    assert.equal(result.tabs[0].view, "Table");
    assert.deepEqual(result.tabs[0].graph, { layout: "tree", direction: "lr" });
});

test("withSharedTab fills a blank background tab rather than growing the strip", () => {
    const result = withSharedTab(
        { tabs: [tab({ id: "a", graphName: "other" }), blankTab("blank")], activeTabId: "a" },
        { graphName: "g", query: "q", view: "Graph" },
        tab({ id: "fresh" }),
    );

    assert.deepEqual(result.tabs.map(t => t.id), ["a", "blank"]);
    assert.equal(result.tabs[0].graphName, "other");
    assert.equal(result.activeTabId, "blank");
});

test("withSharedTab prefers the active blank tab over an earlier one", () => {
    const result = withSharedTab(
        { tabs: [blankTab("first"), blankTab("active")], activeTabId: "active" },
        { graphName: "g", query: "q", view: "Graph" },
        tab({ id: "fresh" }),
    );

    assert.equal(result.activeTabId, "active");
    assert.equal(result.tabs[0].graphName, "");
    assert.equal(result.tabs[1].graphName, "g");
});

test("withSharedTab leaves a tab alone once the user has put anything in it", () => {
    const tabs = [
        blankTab("named", { name: "scratch" }),
        blankTab("typed", { query: "MATCH (n) RETURN n" }),
    ];
    const result = withSharedTab({ tabs, activeTabId: "named" }, { graphName: "g", query: "q", view: "Graph" }, tab({ id: "fresh" }));

    assert.deepEqual(result.tabs.map(t => t.id), ["named", "typed", "fresh"]);
    assert.equal(result.tabs[0].name, "scratch");
    assert.equal(result.activeTabId, "fresh");
});
