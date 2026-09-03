import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { stripCypherFenceTag } from "./cypherDisplay.ts";

describe("stripCypherFenceTag", () => {
    it("strips a bare fence-language tag before a clause", () => {
        assert.equal(stripCypherFenceTag("cypher MATCH (n) RETURN n"), "MATCH (n) RETURN n");
        assert.equal(stripCypherFenceTag("Cypher\nMATCH (n) RETURN n"), "MATCH (n) RETURN n");
    });

    it("keeps a FalkorDB parameter header intact", () => {
        const query =
            "CYPHER sourceCode='TLV' targetDesc='Narita' MATCH (src:airport), (dst:airport) WHERE src.code = $sourceCode RETURN src";
        assert.equal(stripCypherFenceTag(query), query);
    });

    it("keeps a lowercase parameter header intact", () => {
        const query = "cypher a=1 b='x' MATCH (n {v: $a}) RETURN n";
        assert.equal(stripCypherFenceTag(query), query);
    });

    it("keeps a parameter header whose first param name is keyword-like", () => {
        const query = "CYPHER match='x' a=1 MATCH (n {v: $a}) RETURN n";
        assert.equal(stripCypherFenceTag(query), query);
    });

    it("strips a fence tag even when the query itself starts with a CYPHER header", () => {
        const query = "CYPHER sourceCode='TLV' MATCH (src:airport {code: $sourceCode}) RETURN src";
        assert.equal(stripCypherFenceTag(`cypher ${query}`), query);
    });

    it("strips the fence tag before any clause, not only MATCH", () => {
        assert.equal(
            stripCypherFenceTag("cypher FOREACH (x IN [1,2] | CREATE (:N {v: x}))"),
            "FOREACH (x IN [1,2] | CREATE (:N {v: x}))"
        );
        assert.equal(
            stripCypherFenceTag("cypher LOAD CSV FROM 'file://a.csv' AS row RETURN row"),
            "LOAD CSV FROM 'file://a.csv' AS row RETURN row"
        );
        assert.equal(stripCypherFenceTag("cypher EXPLAIN MATCH (n) RETURN n"), "EXPLAIN MATCH (n) RETURN n");
    });

    it("keeps a parameter header whose value is not quoted", () => {
        const query = "CYPHER limit=10 ids=[1,2] MATCH (n) RETURN n LIMIT $limit";
        assert.equal(stripCypherFenceTag(query), query);
    });

    it("leaves queries without a prefix unchanged", () => {
        assert.equal(stripCypherFenceTag("MATCH (n) RETURN n"), "MATCH (n) RETURN n");
    });
});
