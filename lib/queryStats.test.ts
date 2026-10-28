import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { QueryStatistics } from "falkordb";
import { getExecutionTime, getStatsLines } from "./queryStats.ts";

const EMPTY: QueryStatistics = {
  labelsAdded: 0,
  labelsRemoved: 0,
  nodesCreated: 0,
  nodesDeleted: 0,
  propertiesSet: 0,
  propertiesRemoved: 0,
  relationshipsCreated: 0,
  relationshipsDeleted: 0,
  indicesCreated: 0,
  indicesDeleted: 0,
  constraintsCreated: 0,
  constraintsDeleted: 0,
  cachedExecution: false,
  queryInternalExecutionTime: 0,
};

describe("getStatsLines", () => {
  it("lists the non-zero counters, then cached execution and execution time", () => {
    const stats = { ...EMPTY, nodesCreated: 2, labelsAdded: 1, propertiesSet: 3, queryInternalExecutionTime: 0.42 };
    assert.deepEqual(getStatsLines({ stats }), [
      "Labels added: 1",
      "Nodes created: 2",
      "Properties set: 3",
      "Cached execution: 0",
      "Query internal execution time: 0.42 milliseconds",
    ]);
  });

  it("reports a cached execution as 1", () => {
    assert.deepEqual(getStatsLines({ stats: { ...EMPTY, cachedExecution: true, queryInternalExecutionTime: 1 } }), [
      "Cached execution: 1",
      "Query internal execution time: 1 milliseconds",
    ]);
  });

  it("returns the lines of a query saved before stats existed", () => {
    const metadata = ["Nodes created: 1", "Query internal execution time: 2 milliseconds"];
    assert.deepEqual(getStatsLines({ metadata }), metadata);
  });

  it("returns no lines when the query has neither", () => {
    assert.deepEqual(getStatsLines({}), []);
  });
});

describe("getExecutionTime", () => {
  it("reads the execution time from stats", () => {
    assert.equal(getExecutionTime({ stats: { ...EMPTY, queryInternalExecutionTime: 0.42 } }), "0.42ms");
  });

  it("reads the execution time from saved metadata lines", () => {
    assert.equal(
      getExecutionTime({ metadata: ["Cached execution: 0", "Query internal execution time: 2.5 milliseconds"] }),
      "2.5ms"
    );
  });

  it("is undefined when the time is unknown", () => {
    assert.equal(getExecutionTime({ metadata: ["Nodes created: 1"] }), undefined);
    assert.equal(getExecutionTime({}), undefined);
  });
});
