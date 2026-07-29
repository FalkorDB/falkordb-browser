import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveDroppedFiles } from "./dropzone-utils.ts";

const file = (name: string) => ({ name });
const rejection = (name: string) => ({ file: file(name), errors: [{ code: "file-invalid-type" }] });

describe("resolveDroppedFiles", () => {
  it("returns the accepted files when every dropped file is accepted", () => {
    const accepted = [file("a.txt"), file("b.cypher")];

    assert.deepEqual(resolveDroppedFiles(accepted, []), accepted);
  });

  it("returns a copy rather than the original array", () => {
    const accepted = [file("a.txt")];
    const result = resolveDroppedFiles(accepted, []);

    assert.notEqual(result, accepted);
    assert.deepEqual(result, accepted);
  });

  it("ignores the whole drop when every file is rejected", () => {
    assert.equal(resolveDroppedFiles([], [rejection("a.exe")]), null);
  });

  it("ignores mixed drops with both accepted and rejected files (all-or-nothing)", () => {
    assert.equal(resolveDroppedFiles([file("a.txt")], [rejection("b.exe")]), null);
  });

  it("ignores empty drops so callers are never invoked with an empty selection", () => {
    assert.equal(resolveDroppedFiles([], []), null);
  });
});
