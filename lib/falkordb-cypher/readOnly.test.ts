import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isReadOnlyQuery } from "./readOnly.ts";

describe("isReadOnlyQuery", () => {
  it("accepts valid read-only queries and ignores update words in strings/comments", () => {
    assert.equal(isReadOnlyQuery("MATCH (n) RETURN n"), true);
    assert.equal(isReadOnlyQuery("RETURN 'CREATE DELETE SET'"), true);
    assert.equal(isReadOnlyQuery("RETURN 1 // CREATE (:Injected)\n"), true);
  });

  it("rejects updates, DDL, procedure calls, and invalid syntax", () => {
    for (const query of [
      "CREATE (:Dup)",
      "MATCH (n) SET n.value = 1 RETURN n",
      "CREATE VECTOR INDEX FOR (n:Item) ON (n.embedding)",
      "CALL db.labels()",
      "MATCH (n) RETRUN n",
    ]) {
      assert.equal(isReadOnlyQuery(query), false, query);
    }
  });
});
