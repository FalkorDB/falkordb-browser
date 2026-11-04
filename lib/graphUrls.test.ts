import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getNodeUrl, getProfileUrl } from "./graphUrls.ts";

const reservedNames = ["a#b", "a/b", "100%", "a?b", "my graph", "#/%?"];

const graphSegment = (url: string) => {
  const parsed = new URL(url, "http://localhost/");
  const segments = parsed.pathname.split("/");
  return { parsed, segments, graph: decodeURIComponent(segments[3]) };
};

describe("graph API URLs (#2207)", () => {
  it("sends the whole graph name as one path segment for profile", () => {
    for (const name of reservedNames) {
      const { parsed, segments, graph } = graphSegment(getProfileUrl(name, "MATCH (n) RETURN n"));
      assert.equal(graph, name);
      assert.equal(segments.length, 5);
      assert.equal(segments[4], "profile");
      assert.equal(parsed.searchParams.get("query"), "MATCH (n) RETURN n");
      assert.equal(parsed.hash, "");
    }
  });

  it("keeps the read-only flag and query intact for profile", () => {
    const parsed = new URL(getProfileUrl("g#1", "RETURN '&x'", true), "http://localhost/");
    assert.equal(parsed.searchParams.get("query"), "RETURN '&x'");
    assert.equal(parsed.searchParams.get("readOnly"), "true");
  });

  it("sends the whole graph name as one path segment for node expansion", () => {
    for (const name of reservedNames) {
      const { parsed, segments, graph } = graphSegment(getNodeUrl(name, 42));
      assert.equal(graph, name);
      assert.equal(segments.length, 5);
      assert.equal(segments[4], "42");
      assert.equal(parsed.search, "");
      assert.equal(parsed.hash, "");
    }
    assert.equal(getNodeUrl("g/1", 3, true), "/api/graph/g%2F1/3?readOnly=true");
  });

  it("encodes string node IDs without allowing them to change the read-only flag", () => {
    const url = new URL(getNodeUrl("g", "a/b?readOnly=false", true), "http://localhost/");
    assert.equal(url.pathname.split("/").length, 5);
    assert.equal(decodeURIComponent(url.pathname.split("/")[4]), "a/b?readOnly=false");
    assert.equal(url.searchParams.get("readOnly"), "true");
  });
});
