import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isReadOnlyQuery } from "./readOnly.ts";

describe("isReadOnlyQuery (#2206)", () => {
  const readOnly = [
    "MATCH (n) RETURN n",
    "MATCH (n)-[r]->(m) WHERE n.age > 3 RETURN n, count(r) ORDER BY n.age LIMIT 5",
    "UNWIND [1, 2] AS x RETURN x",
    "MATCH (n) WITH n RETURN n UNION MATCH (m) RETURN m",
    "RETURN 'CREATE DELETE SET MERGE'",
    "RETURN 1 // CREATE (:Injected)\n",
    "RETURN 1 /* DELETE n */",
    "MATCH (n:Create) RETURN n.set",
    "CALL { MATCH (n) RETURN n } RETURN n",
  ];

  for (const query of readOnly) {
    it(`allows profiling read-only query: ${JSON.stringify(query)}`, () => {
      assert.equal(isReadOnlyQuery(query), true);
    });
  }

  const notReadOnly = [
    "CREATE (:Dup)",
    "create (:Dup)",
    "MERGE (n:Dup {id: 1})",
    "MATCH (n) SET n.value = 1 RETURN n",
    "MATCH (n) REMOVE n.value RETURN n",
    "MATCH (n) DELETE n",
    "MATCH (n) DETACH DELETE n",
    "MATCH (n) CREATE (n)-[:R]->(:M) RETURN n",
    "MATCH (n) CALL { WITH n CREATE (:Copy) } RETURN n",
    "UNWIND [1] AS x CREATE (:N {x: x}) RETURN x",
    "MATCH (n) RETURN n UNION CREATE (m:M) RETURN m",
    "CREATE INDEX FOR (n:Item) ON (n.name)",
    "CREATE VECTOR INDEX FOR (n:Item) ON (n.embedding)",
    "FOREACH (x IN [1] | CREATE (:Dup))",
    "DROP INDEX FOR (n:Item) ON (n.name)",
    "CREATE CONSTRAINT FOR (n:Item) REQUIRE n.name IS UNIQUE",
    "DROP CONSTRAINT FOR (n:Item) REQUIRE n.name IS UNIQUE",
    "CYPHER p=1 CREATE (:Dup {value: $p})",
    "RETURN 1; CREATE (:Dup)",
    "CALL db.labels()",
    "CALL db.idx.vector.queryNodes('Item', 'embedding', 5, [1, 2])",
    "CALL db.idx.fulltext.queryNodes('Item', 'search')",
    "MATCH (n) CALL db.labels() YIELD label RETURN label",
  ];

  for (const query of notReadOnly) {
    it(`refuses to profile write, DDL or procedure query: ${JSON.stringify(query)}`, () => {
      assert.equal(isReadOnlyQuery(query), false);
    });
  }

  it("refuses queries it cannot parse or that are empty", () => {
    assert.equal(isReadOnlyQuery("MATCH (n) RETRUN n"), false);
    assert.equal(isReadOnlyQuery(""), false);
    assert.equal(isReadOnlyQuery("   "), false);
  });
});
