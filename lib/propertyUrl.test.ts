import { describe, it } from "node:test";
import assert from "node:assert/strict";
import getPropertyUrl from "./propertyUrl.ts";

describe("getPropertyUrl (#2205)", () => {
  it("encodes property keys containing URL-reserved characters", () => {
    assert.equal(getPropertyUrl("g", 1, "a?b"), "api/graph/g/1/a%3Fb");
    assert.equal(getPropertyUrl("g", 1, "a#b"), "api/graph/g/1/a%23b");
    assert.equal(getPropertyUrl("g", 1, "a/b"), "api/graph/g/1/a%2Fb");
    assert.equal(getPropertyUrl("g", 1, "100%"), "api/graph/g/1/100%25");
  });

  it("keeps the key as a single path segment the route decodes back unchanged", () => {
    for (const key of ["a?b", "a#b", "a/b", "100%", "x y", "?#/%"]) {
      const url = new URL(getPropertyUrl("g", 7, key), "http://localhost/");
      const segments = url.pathname.split("/");
      assert.equal(segments.length, 6);
      assert.equal(decodeURIComponent(segments[5]), key);
      assert.equal(url.search, "");
      assert.equal(url.hash, "");
    }
  });

  it("encodes the graph name and appends the read-only flag as a query", () => {
    assert.equal(getPropertyUrl("my graph#1", 3, "k", true), "api/graph/my%20graph%231/3/k?readOnly=true");
  });

  it("preserves graph-name whitespace instead of targeting a trimmed graph (#2209)", () => {
    for (const graphId of [" trail", "trail ", " trail ", "\ttrail\n"]) {
      for (const readOnly of [false, true]) {
        const url = new URL(getPropertyUrl(graphId, 3, "a?b", readOnly), "http://localhost/");
        const segments = url.pathname.split("/");
        assert.equal(segments.length, 6);
        assert.equal(decodeURIComponent(segments[3]), graphId);
        assert.equal(decodeURIComponent(segments[5]), "a?b");
        assert.notEqual(url.pathname, new URL(getPropertyUrl(graphId.trim(), 3, "a?b", readOnly), url).pathname);
        assert.equal(url.search, readOnly ? "?readOnly=true" : "");
      }
    }
  });
});
