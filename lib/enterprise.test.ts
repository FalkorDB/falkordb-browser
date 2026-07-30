import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isEnterpriseModuleList } from "./enterprise.ts";

describe("isEnterpriseModuleList", () => {
  it("detects the enterprise module alongside the graph module", () => {
    assert.equal(isEnterpriseModuleList([{ name: "graph" }, { name: "falkordbe" }]), true);
  });

  it("returns false for a community module list", () => {
    assert.equal(isEnterpriseModuleList([{ name: "graph" }]), false);
  });

  it("returns false for an empty module list", () => {
    assert.equal(isEnterpriseModuleList([]), false);
  });

  it("ignores modules without a name", () => {
    assert.equal(isEnterpriseModuleList([{}, { name: "graph" }]), false);
  });
});
