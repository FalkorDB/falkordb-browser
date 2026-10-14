import test from "node:test";
import assert from "node:assert/strict";
import { quoteCypherIdentifier } from "./cypher.ts";

test("quoteCypherIdentifier wraps a plain identifier", () => {
    assert.equal(quoteCypherIdentifier("name"), "`name`");
    assert.equal(quoteCypherIdentifier(""), "``");
});

test("quoteCypherIdentifier doubles the backticks that would end the span", () => {
    assert.equal(quoteCypherIdentifier("na`me"), "`na``me`");
    assert.equal(quoteCypherIdentifier("`"), "````");
});

test("quoteCypherIdentifier keeps a crafted key from becoming a clause", () => {
    // A property key arrives from a URL path, so it cannot be bound as a
    // parameter: everything it holds has to stay inside the quoted span.
    const crafted = "x = 1 WITH n MATCH (m) DETACH DELETE m //";

    assert.equal(quoteCypherIdentifier(crafted), "`x = 1 WITH n MATCH (m) DETACH DELETE m //`");
});

test("quoteCypherIdentifier keeps a backtick breakout inside the quoted span", () => {
    // The backtick is the one character that can end the span early: undoubled,
    // everything after it would run as Cypher.
    assert.equal(quoteCypherIdentifier("x` DETACH DELETE n //"), "`x`` DETACH DELETE n //`");
    assert.equal(quoteCypherIdentifier("x`: 0} ) DETACH DELETE n //"), "`x``: 0} ) DETACH DELETE n //`");
});
