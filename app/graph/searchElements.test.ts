import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SCHEMA_CAPTION_KEY, SCHEMA_RULES_KEY, type Link, type Node } from "../../lib/utils.ts";
import { filterSearchElements, getSearchMatch } from "./searchElements.ts";

const node = (id: number, labels: string[], data: Node["data"]): Node => ({
    id, labels, data, color: "", visible: true, expand: false, collapsed: false,
});

const link = (id: number, relationship: string, data: Link["data"]): Link => ({
    id, relationship, data, source: 0, target: 1, color: "", visible: true, expand: false, collapsed: false,
});

describe("getSearchMatch", () => {
    it("returns null for an empty search", () => {
        assert.equal(getSearchMatch(node(1, ["Person"], { name: "Alice" }), ""), null);
    });

    it("matches a property value from its start", () => {
        assert.deepEqual(getSearchMatch(node(1, ["Person"], { name: "Alice" }), "Ali"), { key: "name", value: "Alice" });
    });

    it("matches a property value from its middle or end", () => {
        const alice = node(1, ["Person"], { name: "Alice" });
        assert.deepEqual(getSearchMatch(alice, "lic"), { key: "name", value: "Alice" });
        assert.deepEqual(getSearchMatch(alice, "ice"), { key: "name", value: "Alice" });
    });

    it("ignores case", () => {
        assert.deepEqual(getSearchMatch(node(1, ["Person"], { name: "Alice" }), "LIC"), { key: "name", value: "Alice" });
    });

    it("matches non-string values by their string form", () => {
        assert.deepEqual(getSearchMatch(node(1, ["Person"], { age: 1234 }), "23"), { key: "age", value: "1234" });
        assert.deepEqual(getSearchMatch(node(1, ["Person"], { active: true }), "ru"), { key: "active", value: "true" });
    });

    it("skips null and undefined values", () => {
        assert.equal(getSearchMatch(node(7, ["Person"], { name: null, nick: undefined }), "null"), null);
    });

    it("skips the schema caption and rules keys", () => {
        const el = node(7, ["Person"], { [SCHEMA_CAPTION_KEY]: "hidden", [SCHEMA_RULES_KEY]: "hidden" });
        assert.equal(getSearchMatch(el, "hid"), null);
    });

    it("prefers a property over the id, type and labels", () => {
        assert.deepEqual(getSearchMatch(node(12, ["Person"], { code: "x12x" }), "12"), { key: "code", value: "x12x" });
    });

    it("falls back to the id", () => {
        assert.deepEqual(getSearchMatch(node(4521, ["Person"], {}), "52"), { key: "id", value: "4521" });
    });

    it("falls back to a relationship's type", () => {
        assert.deepEqual(getSearchMatch(link(1, "WORKS_AT", {}), "ks_a"), { key: "type", value: "WORKS_AT" });
    });

    it("falls back to a node's label", () => {
        assert.deepEqual(getSearchMatch(node(1, ["Person", "Employee"], {}), "ploy"), { key: "label", value: "Employee" });
    });

    it("returns null when nothing matches", () => {
        assert.equal(getSearchMatch(node(1, ["Person"], { name: "Alice" }), "bob"), null);
        assert.equal(getSearchMatch(link(1, "KNOWS", { since: 2020 }), "bob"), null);
    });
});

describe("filterSearchElements", () => {
    const alice = node(1, ["Person"], { name: "Alice" });
    const bob = node(2, ["Person"], { name: "Bob" });
    const malice = node(3, ["Person"], { name: "Malice" });
    const knows = link(4, "KNOWS", {});

    it("returns nothing for an empty search", () => {
        assert.deepEqual(filterSearchElements([alice, bob], ""), []);
    });

    it("keeps every element that contains the search, in order", () => {
        assert.deepEqual(filterSearchElements([alice, bob, malice, knows], "lic"), [alice, malice]);
    });

    it("includes relationships", () => {
        assert.deepEqual(filterSearchElements([alice, bob, knows], "now"), [knows]);
    });
});
