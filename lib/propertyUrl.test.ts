import { describe, it } from "node:test";
import assert from "node:assert/strict";
import getPropertyUrl from "./propertyUrl.ts";

describe("getPropertyUrl (#2205)", () => {
  it("encodes property keys containing URL-reserved characters", () => {
    assert.equal(getPropertyUrl("g", 1, "a?b"), "api/graph/g/1/property?propertyKey=a%3Fb");
    assert.equal(getPropertyUrl("g", 1, "a#b"), "api/graph/g/1/property?propertyKey=a%23b");
    assert.equal(getPropertyUrl("g", 1, "a/b"), "api/graph/g/1/property?propertyKey=a%2Fb");
    assert.equal(getPropertyUrl("g", 1, "100%"), "api/graph/g/1/property?propertyKey=100%25");
  });

  it("preserves keys outside dynamic parameters without query injection", () => {
    for (const key of ["a?b", "a#b", "a/b", "100%", "x y", "?#/%", "_NEXTSEP_name/part", "_NEXTSEP__NEXTSEP_x", ".", "..", "", "a&readOnly=false"]) {
      const url = new URL(getPropertyUrl("g", 7, key), "http://localhost/");
      const segments = url.pathname.split("/");
      assert.equal(segments.length, 6);
      assert.equal(segments[5], "property");
      assert.equal(url.searchParams.get("propertyKey"), key);
      assert.equal(url.searchParams.get("readOnly"), null);
      assert.equal(url.searchParams.size, 1);
      assert.equal(url.hash, "");
    }
  });

  it("encodes the graph name and appends the read-only flag as a query", () => {
    assert.equal(getPropertyUrl("my graph#1", 3, "k", true), "api/graph/my%20graph%231/3/property?propertyKey=k&readOnly=true");
  });

  it("encodes string element IDs without allowing query-parameter injection", () => {
    const url = new URL(getPropertyUrl("g", "a/b?readOnly=false", "k", true), "http://localhost/");
    assert.equal(url.pathname.split("/").length, 6);
    assert.equal(decodeURIComponent(url.pathname.split("/")[4]), "a/b?readOnly=false");
    assert.equal(url.searchParams.get("readOnly"), "true");
  });

  it("preserves graph-name whitespace instead of targeting a trimmed graph (#2209)", () => {
    for (const graphId of [" trail", "trail ", " trail ", "\ttrail\n"]) {
      for (const readOnly of [false, true]) {
        const url = new URL(getPropertyUrl(graphId, 3, "a?b", readOnly), "http://localhost/");
        const segments = url.pathname.split("/");
        assert.equal(segments.length, 6);
        assert.equal(decodeURIComponent(segments[3]), graphId);
        assert.equal(url.searchParams.get("propertyKey"), "a?b");
        assert.notEqual(url.pathname, new URL(getPropertyUrl(graphId.trim(), 3, "a?b", readOnly), url).pathname);
        assert.equal(url.searchParams.get("readOnly"), readOnly ? "true" : null);
      }
    }
  });
});
