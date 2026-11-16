import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cellMatchesSearch } from "./tableSearch.ts";

const objectCell = (value: unknown) => ({ type: "object", value });

describe("cellMatchesSearch", () => {
  it("matches primitive values on any substring", () => {
    assert.equal(cellMatchesSearch(objectCell("Apple"), "ap"), true);
    assert.equal(cellMatchesSearch(objectCell("Apple"), "pple"), true);
    assert.equal(cellMatchesSearch(objectCell("Apple"), "pear"), false);
  });

  it("matches numbers and booleans, including zero and false", () => {
    assert.equal(cellMatchesSearch(objectCell(1234), "23"), true);
    assert.equal(cellMatchesSearch(objectCell(0), "0"), true);
    assert.equal(cellMatchesSearch(objectCell(false), "fal"), true);
    assert.equal(cellMatchesSearch(objectCell(1234), "9"), false);
  });

  it("never matches null or undefined values", () => {
    assert.equal(cellMatchesSearch(objectCell(null), "null"), false);
    assert.equal(cellMatchesSearch(objectCell(undefined), "undefined"), false);
  });

  it("matches the values of maps and arrays", () => {
    assert.equal(cellMatchesSearch(objectCell({ name: "Blueberry" }), "berry"), true);
    assert.equal(cellMatchesSearch(objectCell({ name: "Blueberry" }), "name"), false);
    assert.equal(cellMatchesSearch(objectCell([1, 22, 3]), "22"), true);
  });

  it("matches one level into nested values", () => {
    assert.equal(cellMatchesSearch(objectCell({ properties: { city: "paris" } }), "par"), true);
    assert.equal(cellMatchesSearch(objectCell({ properties: { city: "paris" } }), "rome"), false);
  });

  it("searches primitives inside nested arrays but never the text of nested objects", () => {
    assert.equal(cellMatchesSearch(objectCell({ properties: { tags: ["red", "blue"] } }), "blu"), true);
    assert.equal(cellMatchesSearch(objectCell({ properties: { tags: [{ a: 1 }, null, "red"] } }), "red"), true);
    assert.equal(cellMatchesSearch(objectCell({ properties: { tags: [{ a: 1 }] } }), "object"), false);
    assert.equal(cellMatchesSearch(objectCell({ properties: { deep: { a: "x" } } }), "object"), false);
    assert.equal(cellMatchesSearch(objectCell({ properties: { deep: { a: "x" } } }), "x"), false);
  });

  it("skips null values at either level instead of throwing", () => {
    assert.equal(cellMatchesSearch(objectCell({ a: null, b: "x" }), "x"), true);
    assert.equal(cellMatchesSearch(objectCell({ a: null }), "a"), false);
    assert.equal(cellMatchesSearch(objectCell({ a: { b: null, c: "z" } }), "z"), true);
  });

  it("matches non-object cells on their string form", () => {
    assert.equal(cellMatchesSearch({ type: "text", value: "Admin" }, "min"), true);
    assert.equal(cellMatchesSearch({ type: "readonly", value: "Admin" }, "root"), false);
    assert.equal(cellMatchesSearch({ type: "text", value: undefined }, "a"), false);
  });
});
