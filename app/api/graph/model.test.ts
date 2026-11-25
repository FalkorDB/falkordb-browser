import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import {
    clearConnectionPrefix,
    getConnectionItem,
    setConnectionItem,
    setConnectionPrefix,
} from "../../../lib/connection-storage.ts";
import type {
    Data,
    InfoLabel,
    InfoRelationship,
    LinkCell,
    NodeCell,
} from "../../../lib/utils.ts";

const modelUrl = new URL("./model.ts", import.meta.url).href;
const rootUrl = new URL("../../../", import.meta.url);
const utilsUrl = new URL("../../../lib/utils.ts", import.meta.url).href;

type MetaStatsResult = [Array<[string, number]>, Array<[string, number]>];
type MetaStatsHandler = (
    graphName: string,
    toast: unknown,
    setIndicator: unknown,
    isReadOnly?: boolean,
    options?: { connectionId?: string | null },
) => Promise<MetaStatsResult | undefined>;

const modelTestGlobals = globalThis as typeof globalThis & {
    __graphModelTestGetMetaStats?: MetaStatsHandler;
};

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === modelUrl && specifier.startsWith("@/")) {
            return nextResolve(new URL(`${specifier.slice(2)}.ts`, rootUrl).href, context);
        }
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
        if (url === utilsUrl) {
            return {
                format: "module",
                source: `
                    export async function getMetaStats(...args) {
                        const handler = globalThis.__graphModelTestGetMetaStats;
                        if (typeof handler !== "function") {
                            throw new Error("Unexpected graph model metadata request");
                        }
                        return handler(...args);
                    }
                `,
                shortCircuit: true,
            };
        }
        if (url === modelUrl) {
            const source = ts.transpileModule(readFileSync(new URL(url), "utf8"), {
                fileName: fileURLToPath(url),
                compilerOptions: {
                    module: ts.ModuleKind.ESNext,
                    target: ts.ScriptTarget.ES2022,
                    inlineSourceMap: true,
                    inlineSources: true,
                },
            }).outputText;
            return { format: "module", source, shortCircuit: true };
        }
        return nextLoad(url, context);
    },
});

const {
    Graph,
    GraphInfo,
    labelStyleKey,
    loadLabelStyle,
    loadRelationshipStyle,
    relationshipStyleKey,
} = await import("./model.ts");

const node = (id: number, labels = ["Person"]): NodeCell => ({
    id, labels, properties: { name: `person-${id}`, age: 30 },
});
const edge = (id: number, sourceId = 1, destinationId = 2): LinkCell => ({
    id, sourceId, destinationId, relationshipType: "KNOWS", properties: { since: 2020 },
});

async function graphWith(data: Data) {
    const info = await GraphInfo.create(
        ["name", "age", "since"],
        [["Person", 2], ["Employee", 1]],
        [["KNOWS", 1]],
        new Map(),
        () => assert.fail("Unexpected metadata error"),
        () => assert.fail("Unexpected connection status update"),
    );
    return Graph.create("test-graph", { data }, false, 100, info);
}

async function withMetaStats(
    handler: MetaStatsHandler,
    run: () => Promise<void>,
): Promise<void> {
    const previousHandler = modelTestGlobals.__graphModelTestGetMetaStats;
    modelTestGlobals.__graphModelTestGetMetaStats = handler;
    try {
        await run();
    } finally {
        if (previousHandler) {
            modelTestGlobals.__graphModelTestGetMetaStats = previousHandler;
        } else {
            delete modelTestGlobals.__graphModelTestGetMetaStats;
        }
    }
}

type StorageDouble = {
    readonly length: number;
    key(index: number): string | null;
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
};

function restoreGlobal(name: "window" | "localStorage", descriptor: PropertyDescriptor | undefined): void {
    if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor);
    } else {
        Reflect.deleteProperty(globalThis, name);
    }
}

function withBrowserStorage(run: () => void): void {
    const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
    const previousStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    const values = new Map<string, string>();
    const storage: StorageDouble = {
        get length() {
            return values.size;
        },
        key(index) {
            return [...values.keys()][index] ?? null;
        },
        getItem(key) {
            return values.get(key) ?? null;
        },
        setItem(key, value) {
            values.set(key, String(value));
        },
        removeItem(key) {
            values.delete(key);
        },
    };

    Object.defineProperty(globalThis, "window", { configurable: true, value: {} });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
    try {
        setConnectionPrefix("graph-model-test", 9999, "unit-test");
        run();
    } finally {
        clearConnectionPrefix();
        restoreGlobal("window", previousWindow);
        restoreGlobal("localStorage", previousStorage);
    }
}

test("graph results promote missing edge endpoints when their node records arrive", async () => {
    const graph = await graphWith([{ edge: edge(10) }]);
    assert.deepEqual(graph.Elements.nodes.map((item) => [item.id, item.data.fake]), [[1, true], [2, true]]);
    assert.equal(graph.Elements.links.length, 1);
    const added = await graph.extend({ data: [{ nodes: [node(1), node(2)] }] });
    assert.equal(added.length, 2);
    assert.deepEqual(graph.Elements.nodes.map((item) => [item.id, item.labels, item.data.name]), [
        [1, ["Person"], "person-1"],
        [2, ["Person"], "person-2"],
    ]);
    assert.equal(graph.LabelsMap.has(""), false);
    assert.equal(graph.LabelsMap.get("Person")?.elements.length, 2);
    assert.equal((await graph.extend({ data: [{ node: node(1), edge: edge(10) }] })).length, 0);
});

test("self-loop edges create one placeholder and distinct curves for parallel links", async () => {
    const graph = await graphWith([{ edge: edge(10, 1, 1) }]);
    await graph.extend({ data: [{ edge: edge(11, 1, 1) }] });
    assert.equal(graph.Elements.nodes.length, 1);
    assert.equal(graph.Elements.links.length, 2);
    assert.ok(Math.abs(graph.calculateLinkCurve(graph.Elements.links[0]) + 1.2) < 1e-12);
    assert.ok(Math.abs(graph.calculateLinkCurve(graph.Elements.links[1]) - 1.2) < 1e-12);
});

test("property edits target the matching kind in single, array, and path results", async () => {
    const first = node(1);
    const second = node(2);
    const link = edge(1);
    const graph = await graphWith([{ single: first, nodes: [first, second], edge: link, edges: [link], path: { nodes: [first, second], edges: [link] }, scalar: "kept" }]);
    graph.setProperty("name", "updated", 1, true);
    assert.deepEqual(graph.Data[0], {
        single: { ...first, properties: { name: "updated", age: 30 } },
        nodes: [{ ...first, properties: { name: "updated", age: 30 } }, second],
        edge: link,
        edges: [link],
        path: { nodes: [{ ...first, properties: { name: "updated", age: 30 } }, second], edges: [link] },
        scalar: "kept",
    });
    graph.removeProperty("age", 1, true);
    assert.deepEqual(graph.Data[0].single, { ...first, properties: { name: "updated" } });
    assert.deepEqual(graph.Data[0].nodes, [{ ...first, properties: { name: "updated" } }, second]);
    assert.deepEqual(graph.Data[0].edge, link);
});

test("edge property edits update edge results and preserve node results", async () => {
    const first = node(1);
    const link = edge(10);
    const graph = await graphWith([{ single: link, edges: [link], path: { nodes: [first], edges: [link] }, node: first }]);
    graph.setProperty("since", 2024, 10, false);
    assert.deepEqual(graph.Data[0], {
        single: { ...link, properties: { since: 2024 } },
        edges: [{ ...link, properties: { since: 2024 } }],
        path: { nodes: [first], edges: [{ ...link, properties: { since: 2024 } }] },
        node: first,
    });
    graph.removeProperty("since", 10, false);
    assert.deepEqual(graph.Data[0], {
        single: { ...link, properties: {} },
        edges: [{ ...link, properties: {} }],
        path: { nodes: [first], edges: [{ ...link, properties: {} }] },
        node: first,
    });
});

test("adding and removing a label updates only the selected node across result shapes", async () => {
    const first = node(1);
    const second = node(2);
    const graph = await graphWith([{ single: first, nodes: [first, second], path: { nodes: [first, second] }, scalar: "kept" }]);
    const selected = graph.NodesMap.get(1);
    assert.ok(selected);
    await graph.addLabel("Employee", selected);
    assert.deepEqual(graph.Data[0], {
        single: { ...first, labels: ["Person", "Employee"] },
        nodes: [{ ...first, labels: ["Person", "Employee"] }, second],
        path: { nodes: [{ ...first, labels: ["Person", "Employee"] }, second] },
        scalar: "kept",
    });
    assert.deepEqual(first.labels, ["Person"]);
    await graph.removeLabel("Person", selected);
    assert.deepEqual(selected.labels, ["Employee"]);
    assert.deepEqual(graph.Data[0], {
        single: { ...first, labels: ["Employee"] },
        nodes: [{ ...first, labels: ["Employee"] }, second],
        path: { nodes: [{ ...first, labels: ["Employee"] }, second] },
        scalar: "kept",
    });
    assert.equal(graph.LabelsMap.get("Person")?.elements.length, 1);
});

test("removing graph elements clears matching result cells but preserves unrelated values", async () => {
    const first = node(1);
    const second = node(2);
    const link = edge(10);
    const graph = await graphWith([
        { node: first, edge: link, scalar: "kept" },
        { path: { nodes: [first, second], edges: [link] } },
        { nodes: [first, second], other: second },
    ]);
    const selected = graph.NodesMap.get(1);
    assert.ok(selected);
    graph.removeElements([selected]);
    assert.equal(graph.NodesMap.has(1), false);
    assert.equal(graph.NodesMap.has(2), true);
    assert.deepEqual(graph.Data, [
        { node: undefined, edge: link, scalar: "kept" },
        { nodes: undefined, other: second },
    ]);
});

test("merging results keeps distinct rows without duplicating existing graph elements", async () => {
    const first = node(1);
    const second = node(2);
    const graph = await graphWith([{ item: first }]);
    const added = await graph.extend({ data: [{ item: first }, { item: second }] }, false, true);
    assert.deepEqual(graph.Data, [{ item: first }, { item: second }]);
    assert.deepEqual(added.map((item) => item.id), [2]);
    assert.deepEqual(graph.Elements.nodes.map((item) => item.id), [1, 2]);
});

test("removing a node's final label places it in the unlabeled category", async () => {
    const graph = await graphWith([{ item: node(1) }]);
    const selected = graph.NodesMap.get(1);
    assert.ok(selected);
    await graph.removeLabel("Person", selected);
    assert.deepEqual(selected.labels, [""]);
    assert.equal(graph.LabelsMap.has("Person"), false);
    assert.deepEqual(graph.LabelsMap.get("")?.elements.map((item) => item.id), [1]);
    assert.deepEqual(graph.Data, [{ item: node(1, []) }]);
});

test("removing a collapsed node removes its connected collapsed edge but keeps other edges", async () => {
    const graph = await graphWith([{ nodes: [node(1), node(2)], edges: [edge(10), edge(11)] }]);
    graph.Elements.links[0].collapsed = true;
    graph.removeLinks([1]);
    assert.deepEqual(graph.Elements.links.map((item) => item.id), [11]);
    assert.deepEqual(graph.RelationshipsMap.get("KNOWS")?.elements.map((item) => item.id), [11]);
    assert.equal(graph.LinksMap.has(10), false);
});

test("GraphInfo resolves missing counts with metadata for its pinned connection", async () => {
    const calls: Array<[string, string | null | undefined]> = [];
    const stats: MetaStatsResult = [[["Person", 4]], [["KNOWS", 7]]];

    await withMetaStats(async (graphName, _toast, _setIndicator, _isReadOnly, options) => {
        calls.push([graphName, options?.connectionId]);
        return stats;
    }, async () => {
        const info = GraphInfo.empty(() => {}, () => {}, undefined, undefined, "connection-1");
        const [label] = await info.createLabel([["Person", undefined]], "test-graph");
        const relationship = await info.createRelationship(["KNOWS", undefined], "test-graph");

        assert.equal(label.count, 4);
        assert.equal(relationship.count, 7);
        assert.deepEqual(calls, [
            ["test-graph", "connection-1"],
            ["test-graph", "connection-1"],
        ]);
    });
});

test("GraphInfo defaults missing metadata counts to zero without querying for the empty label", async () => {
    const calls: string[] = [];

    await withMetaStats(async (graphName) => {
        calls.push(graphName);
        return undefined;
    }, async () => {
        const info = GraphInfo.empty(() => {}, () => {});
        const [emptyLabel, personLabel] = await info.createLabel(
            [["", undefined], ["Person", undefined]],
            "test-graph",
        );
        const relationship = await info.createRelationship(["KNOWS", undefined], "test-graph");

        assert.equal(emptyLabel.count, 0);
        assert.equal(personLabel.count, 0);
        assert.equal(relationship.count, 0);
        assert.deepEqual(calls, ["test-graph", "test-graph"]);
    });
});

test("GraphInfo clones isolate maps and generated colors", () => {
    const label: InfoLabel = {
        name: "Person",
        style: { color: "#123456", size: 12 },
        show: true,
        count: 2,
    };
    const relationship: InfoRelationship = {
        name: "KNOWS",
        style: { color: "#654321", width: 2 },
        show: true,
        count: 1,
    };
    const info = GraphInfo.empty(
        () => {},
        () => {},
        ["name"],
        new Map([["used_memory", 32]]),
    );
    info.Labels.set(label.name, label);
    info.Relationships.set(relationship.name, relationship);
    info.Colors.push("#abc123");

    const clone = info.clone();
    clone.Labels.set("Employee", { ...label, name: "Employee" });
    clone.Colors.push("#def456");

    assert.notEqual(clone, info);
    assert.notEqual(clone.Labels, info.Labels);
    assert.notEqual(clone.Relationships, info.Relationships);
    assert.notEqual(clone.MemoryUsage, info.MemoryUsage);
    assert.equal(info.Labels.has("Employee"), false);
    assert.deepEqual(clone.Colors, ["#abc123", "#def456"]);
    assert.deepEqual(info.Colors, ["#abc123"]);
});

test("GraphInfo uses supplied colors before generating additional styles", () => {
    const info = GraphInfo.empty(() => {}, () => {});
    info.Colors.push("#123456");

    assert.equal(info.getLabelColorValue(0), "#123456");
    const generated = info.getLabelColorValue(1);
    assert.match(generated, /^hsl\(\d+, \d+%, \d+%\)$/);
    assert.equal(info.Colors[1], generated);
});

test("Graph.clone creates a new identity while retaining shared graph state", async () => {
    const graph = await graphWith([{ item: node(1) }]);
    const clone = graph.clone();

    assert.notEqual(clone, graph);
    assert.equal(clone.Elements, graph.Elements);
    assert.equal(clone.Data, graph.Data);
    assert.equal(clone.GraphInfo, graph.GraphInfo);
    assert.deepEqual(clone.getElements(), graph.getElements());
});

test("stored label and relationship styles load from connection-scoped storage", () => {
    withBrowserStorage(() => {
        setConnectionItem(labelStyleKey("Person"), JSON.stringify({ color: "#123456", size: 24 }));
        setConnectionItem(relationshipStyleKey("KNOWS"), JSON.stringify({
            color: "#654321",
            width: 4,
            fontSize: 16,
            arrowSize: 8,
        }));

        const label: InfoLabel = {
            name: "Person",
            style: { color: "#base", size: 8 },
            show: true,
            count: 2,
        };
        const relationship: InfoRelationship = {
            name: "KNOWS",
            style: { color: "#base", width: 2, fontSize: 10, arrowSize: 4 },
            show: true,
            count: 1,
        };

        loadLabelStyle(label);
        loadRelationshipStyle(relationship);

        assert.deepEqual(label.style, { color: "#123456", size: 24 });
        assert.deepEqual(relationship.style, {
            color: "#654321",
            width: 4,
            fontSize: 16,
            arrowSize: 8,
        });
    });
});

test("invalid saved style values preserve the current label and relationship styles", () => {
    withBrowserStorage(() => {
        setConnectionItem(labelStyleKey("Person"), JSON.stringify({ color: " ", size: 0 }));
        setConnectionItem(relationshipStyleKey("KNOWS"), JSON.stringify({
            color: 7,
            width: 0,
            fontSize: -1,
            arrowSize: "large",
        }));

        const label: InfoLabel = {
            name: "Person",
            style: { color: "#base", size: 8 },
            show: true,
            count: 2,
        };
        const relationship: InfoRelationship = {
            name: "KNOWS",
            style: { color: "#base", width: 2, fontSize: 10, arrowSize: 4 },
            show: true,
            count: 1,
        };

        loadLabelStyle(label);
        loadRelationshipStyle(relationship);

        assert.deepEqual(label.style, { color: "#base", size: 8 });
        assert.deepEqual(relationship.style, {
            color: "#base",
            width: 2,
            fontSize: 10,
            arrowSize: 4,
        });
    });
});

test("corrupt saved styles are removed from connection-scoped storage", () => {
    withBrowserStorage(() => {
        setConnectionItem(labelStyleKey("Person"), "{");
        setConnectionItem(relationshipStyleKey("KNOWS"), "{");
        const label: InfoLabel = {
            name: "Person",
            style: { color: "#base", size: 8 },
            show: true,
            count: 2,
        };
        const relationship: InfoRelationship = {
            name: "KNOWS",
            style: { color: "#base", width: 2 },
            show: true,
            count: 1,
        };

        loadLabelStyle(label);
        loadRelationshipStyle(relationship);

        assert.equal(getConnectionItem(labelStyleKey("Person")), null);
        assert.equal(getConnectionItem(relationshipStyleKey("KNOWS")), null);
        assert.deepEqual(label.style, { color: "#base", size: 8 });
        assert.deepEqual(relationship.style, { color: "#base", width: 2 });
    });
});

test("adding a label to an unlabeled node removes its empty category", async () => {
    const original = node(1, []);
    const graph = await graphWith([{ item: original }]);
    const selected = graph.NodesMap.get(1);
    assert.ok(selected);
    assert.deepEqual(selected.labels, [""]);

    await graph.addLabel("Person", selected);

    assert.deepEqual(selected.labels, ["Person"]);
    assert.equal(graph.LabelsMap.has(""), false);
    assert.deepEqual(graph.Data, [{ item: { ...original, labels: ["Person"] } }]);
});

test("visibleLinks follows relationship and endpoint visibility", async () => {
    const graph = await graphWith([{
        nodes: [node(1), node(2), node(3)],
        edges: [edge(10, 1, 2), edge(11, 2, 3)],
    }]);
    const [first, second] = graph.Elements.links;
    const relationship = graph.RelationshipsMap.get("KNOWS");
    const middle = graph.NodesMap.get(2);
    assert.ok(first);
    assert.ok(second);
    assert.ok(relationship);
    assert.ok(middle);

    first.visible = false;
    graph.visibleLinks(true);
    assert.equal(first.visible, true);

    relationship.show = false;
    first.visible = false;
    graph.visibleLinks(true);
    assert.equal(first.visible, false);

    middle.visible = false;
    graph.visibleLinks(false);
    assert.equal(first.visible, false);
    assert.equal(second.visible, false);

    first.relationship = "MISSING";
    first.visible = true;
    graph.visibleLinks(true);
    assert.equal(first.visible, false);
});

test("topology version advances on link changes and element replacement", async () => {
    const graph = await graphWith([]);
    assert.equal(graph.TopologyVersion, 0);

    await graph.extend({ data: [{ node: node(1) }] });
    assert.equal(graph.TopologyVersion, 0);

    await graph.extend({ data: [{ edge: edge(10) }] });
    assert.equal(graph.TopologyVersion, 1);
    await graph.extend({ data: [{ edge: edge(10) }] });
    assert.equal(graph.TopologyVersion, 1);

    graph.Elements = { nodes: graph.Elements.nodes, links: graph.Elements.links };
    assert.equal(graph.TopologyVersion, 2);

    graph.Elements.links[0].collapsed = true;
    graph.removeLinks([1]);
    assert.equal(graph.TopologyVersion, 3);
    assert.equal(graph.LinksMap.has(10), false);
    assert.equal(graph.RelationshipsMap.has("KNOWS"), false);
});

test("removing a relationship element clears its results and final category", async () => {
    const first = node(1);
    const second = node(2);
    const link = edge(10);
    const graph = await graphWith([{ nodes: [first, second], edges: [link], scalar: "kept" }]);
    const selected = graph.LinksMap.get(10);
    assert.ok(selected);

    graph.removeElements([selected]);

    assert.deepEqual(graph.Elements.links, []);
    assert.equal(graph.LinksMap.has(10), false);
    assert.equal(graph.RelationshipsMap.has("KNOWS"), false);
    assert.deepEqual(graph.Data, [{ nodes: [first, second], edges: undefined, scalar: "kept" }]);
});
