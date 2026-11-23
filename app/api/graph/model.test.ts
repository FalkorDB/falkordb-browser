import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import type { Data, LinkCell, NodeCell } from "../../../lib/utils.ts";

const modelUrl = new URL("./model.ts", import.meta.url).href;
const rootUrl = new URL("../../../", import.meta.url);
registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === modelUrl && specifier.startsWith("@/")) {
            return nextResolve(new URL(`${specifier.slice(2)}.ts`, rootUrl).href, context);
        }
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
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

const { Graph, GraphInfo } = await import("./model.ts");

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
