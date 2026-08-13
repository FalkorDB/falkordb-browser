import test from "node:test";
import assert from "node:assert/strict";
import {
    clampMaxTabs,
    forStorage,
    normalizeDirection,
    normalizeLayout,
    parseStoredTabs,
    tabScopedKey,
    tabStripItemWidth,
    DEFAULT_GRAPH_TABS,
    MAX_GRAPH_TABS,
    MIN_GRAPH_TABS,
    TAB_SCOPE_PREFIX,
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
    const source = tab({
        graph: { customizing: "person1", panelOpen: true },
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
    assert.equal(source.graph.customizing, "person1");
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
            customizing: "Person",
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
            customizing: "Person",
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
        customizing: "Person",
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
        customizing: "Person",
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

test("parseStoredTabs defaults a missing active tab id to empty", () => {
    const result = parseStoredTabs(JSON.stringify({ tabs: [tab()] }));
    assert.equal(result?.activeTabId, "");

    const numeric = parseStoredTabs(stored([tab()], 5));
    assert.equal(numeric?.activeTabId, "");
});
