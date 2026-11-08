import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getOptimizationContext } from "./context.ts";

describe("optimization context", () => {
  it("continues with an explicit warning when indexes are denied", async (t) => {
    const warning = t.mock.method(console, "warn", () => {});
    const context = await getOptimizationContext({
      explain: async () => ({ steps: ["Results", "Scan"] }),
      roQuery: async () => { throw new Error("Permission denied"); },
    }, "MATCH (n) RETURN n");
    assert.deepEqual(context.plan, ["Results", "Scan"]);
    assert.equal(context.indexes.available, false);
    assert.match(context.indexes.warning ?? "", /unavailable/);
    assert.deepEqual(context.indexes.entries, []);
    assert.equal(warning.mock.callCount(), 1);
  });

  it("distinguishes known empty indexes from unavailable metadata", async () => {
    const context = await getOptimizationContext({
      explain: async () => ({ steps: ["Results"] }),
      roQuery: async () => ({ data: [] }),
    }, "RETURN 1");
    assert.equal(context.indexes.available, true);
    assert.equal(context.indexes.warning, undefined);
  });

  it("caps available indexes and propagates explain failures", async () => {
    const graph = {
      explain: async () => ({ steps: ["Results"] }),
      roQuery: async () => ({ data: Array.from({ length: 300 }, (_, id) => ({ id })) }),
    };
    const context = await getOptimizationContext(graph, "RETURN 1");
    assert.equal(context.indexes.entries.length, 256);
    assert.equal(context.indexes.truncated, true);
    await assert.rejects(getOptimizationContext({
      ...graph,
      explain: async () => { throw new Error("Invalid query"); },
    }, "invalid"), /Invalid query/);
  });
});
