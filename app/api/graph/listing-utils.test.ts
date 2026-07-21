import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildGraphListEntries, extractCount, isEnterpriseModuleLoaded, toGraphNames } from "./listing-utils.ts";

describe("graph listing helpers", () => {
  it("detects enterprise module names from module list", () => {
    assert.equal(isEnterpriseModuleLoaded([{ name: "graph" }]), false);
    assert.equal(isEnterpriseModuleLoaded([{ name: "FalkorDB-Enterprise" }]), true);
    assert.equal(isEnterpriseModuleLoaded([{ name: "FalkorDB-Enteprise" }]), true);
  });

  it("normalizes graph names from nested command responses", () => {
    const names = toGraphNames(["g1", Buffer.from("g2"), ["g3", ["g4"]]]);
    assert.deepEqual(names, ["g1", "g2", "g3", "g4"]);
  });

  it("builds active and stub graph entries with counts", () => {
    const entries = buildGraphListEntries(
      ["active", "active_schema"],
      ["stub", "active", "stub"],
      new Map([["active", { nodes: 5, edges: 7 }]])
    );

    assert.deepEqual(entries, [
      { name: "active", type: "active", nodes: 5, edges: 7 },
      { name: "stub", type: "stub", nodes: null, edges: null },
    ]);
  });

  it("extracts count values from graph query responses", () => {
    assert.equal(extractCount({ data: [{ nodes: 11 }] }, "nodes"), 11);
    assert.equal(extractCount({ data: [{ edges: "3" }] }, "edges"), 3);
    assert.equal(extractCount({ data: [{}] }, "nodes"), null);
  });
});
