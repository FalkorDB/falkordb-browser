import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { graphCounts } from "./graphCounts.ts";

describe("graphCounts", () => {
    it("counts every listed graph as loaded when the server cannot offload", () => {
        assert.deepEqual(graphCounts(["a", "b"], ["c"], false), { totalCount: 2, loadedCount: 2, offloadedCount: 0 });
    });

    it("adds offloaded graphs that GRAPH.LIST omits", () => {
        assert.deepEqual(graphCounts(["a", "b", "c"], ["d", "e"], true), { totalCount: 5, loadedCount: 3, offloadedCount: 2 });
    });

    it("does not count offloaded graphs twice when GRAPH.LIST includes them", () => {
        assert.deepEqual(graphCounts(["a", "b", "c", "d", "e"], ["d", "e"], true), { totalCount: 5, loadedCount: 3, offloadedCount: 2 });
    });

    it("ignores duplicate names", () => {
        assert.deepEqual(graphCounts(["a", "a", "d"], ["d", "d"], true), { totalCount: 2, loadedCount: 1, offloadedCount: 1 });
    });

    it("is all zeros with no graphs", () => {
        assert.deepEqual(graphCounts([], [], true), { totalCount: 0, loadedCount: 0, offloadedCount: 0 });
    });
});
