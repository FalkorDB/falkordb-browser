import test from "node:test";
import assert from "node:assert/strict";
import { createGraphAppearanceLookup, getGraphAppearance } from "./graphAppearance.ts";

const links = [
    { id: 1, source: 1, target: 2 },
    { id: 2, source: 2, target: 3 },
    { id: 3, source: 3, target: 4 },
];

test("selected nodes activate only their direct neighborhood", () => {
    const appearance = getGraphAppearance([{ id: 1 }], undefined, links);
    assert.deepEqual([...appearance.selectedNodeIds], [1]);
    assert.deepEqual([...appearance.selectedLinkIds], []);
    assert.deepEqual([...appearance.activeNodeIds], [1, 2]);
    assert.deepEqual([...appearance.activeLinkIds], [1]);
});

test("selected links activate endpoints without expanding their neighbors", () => {
    const appearance = getGraphAppearance([links[1]], undefined, links);
    assert.deepEqual([...appearance.selectedNodeIds], []);
    assert.deepEqual([...appearance.selectedLinkIds], [2]);
    assert.deepEqual([...appearance.activeNodeIds], [2, 3]);
    assert.deepEqual([...appearance.activeLinkIds], [2]);
});

test("hover is additive and node/link ids stay independent", () => {
    const appearance = getGraphAppearance([links[0]], { id: 1 }, links);
    assert.equal(appearance.selectedNodeIds.has(1), true);
    assert.equal(appearance.selectedLinkIds.has(1), true);
    assert.deepEqual([...appearance.activeNodeIds], [1, 2]);
    assert.deepEqual([...appearance.activeLinkIds], [1]);
});

test("empty focus produces empty sets and each recomputation drops stale selections", () => {
    const first = getGraphAppearance([{ id: 1 }], undefined, links);
    const empty = getGraphAppearance([], undefined, links);
    assert.equal(empty.activeNodeIds.size, 0);
    assert.equal(empty.activeLinkIds.size, 0);
    assert.equal(first.activeNodeIds.has(1), true);
});

test("lookups reuse cached sets but invalidate for in-place expansion and removal", () => {
    const topology = [...links];
    const lookup = createGraphAppearanceLookup([{ id: 1 }], undefined, () => topology);
    const first = lookup();
    assert.equal(lookup(), first);
    topology.push({ id: 4, source: 1, target: 5 });
    const expanded = lookup();
    assert.notEqual(expanded, first);
    assert.equal(expanded.activeNodeIds.has(5), true);
    topology.pop();
    assert.equal(lookup().activeNodeIds.has(5), false);
});

test("same-sized topology replacement invalidates the cache", () => {
    let topology = [...links];
    const lookup = createGraphAppearanceLookup([{ id: 1 }], undefined, () => topology);
    const first = lookup();
    topology = [{ id: 4, source: 1, target: 5 }, ...links.slice(1)];
    assert.notEqual(lookup(), first);
    assert.equal(lookup().activeNodeIds.has(5), true);
    assert.equal(lookup().activeNodeIds.has(2), false);
});
