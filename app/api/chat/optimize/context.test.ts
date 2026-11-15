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

  for (const count of [255, 256, 257]) {
    it(`bounds the database query and detects truncation with ${count} rows`, async () => {
      const rows = Array.from({ length: count }, (_, id) => ({ id }));
      const context = await getOptimizationContext({
        explain: async () => ({ steps: ["Results"] }),
        roQuery: async (query) => {
          assert.equal(query, "CALL db.indexes() YIELD label, types, entitytype RETURN label, types, entitytype LIMIT 257");
          return { data: rows };
        },
      }, "RETURN 1");
      assert.deepEqual(context.indexes.entries, rows.slice(0, 256));
      assert.equal(context.indexes.truncated, count > 256);
    });
  }

  it("propagates explain failures", async () => {
    const graph = {
      explain: async () => ({ steps: ["Results"] }),
      roQuery: async () => ({ data: [] }),
    };
    await assert.rejects(getOptimizationContext({
      ...graph,
      explain: async () => { throw new Error("Invalid query"); },
    }, "invalid"), /Invalid query/);
  });
});
