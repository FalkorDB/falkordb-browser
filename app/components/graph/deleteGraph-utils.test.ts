import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildDeleteGraphToast } from "./deleteGraph-utils.ts";

describe("buildDeleteGraphToast", () => {
  it("returns a success toast when all deletions succeed", () => {
    const toast = buildDeleteGraphToast(["g1", "g2"], []);
    assert.deepEqual(toast, {
      title: "Graph(s) deleted successfully",
      description: "The graph(s) g1, g2 have been deleted successfully.",
    });
  });

  it("reports both successes and failures on a partial success", () => {
    const toast = buildDeleteGraphToast(["g1"], ["g2", "g3"]);
    assert.deepEqual(toast, {
      title: "Graph(s) deleted successfully",
      description:
        "The graph(s) g1 have been deleted successfully. The graph(s) g2, g3 could not be deleted.",
    });
  });

  it("returns null when every deletion fails (no misleading success toast)", () => {
    assert.equal(buildDeleteGraphToast([], ["g1", "g2"]), null);
  });

  it("returns null when nothing was requested", () => {
    assert.equal(buildDeleteGraphToast([], []), null);
  });
});
