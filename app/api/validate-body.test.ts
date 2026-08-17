import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { updateGraphElementAttribute } from "./validate-body.ts";

const parse = (body: unknown) => updateGraphElementAttribute.safeParse(body);

describe("updateGraphElementAttribute", () => {
  it("takes each type in the shape its Cypher constructor is built from", () => {
    const accepted: unknown[] = [
      { type: true, valueType: "string", value: "hello" },
      { type: true, valueType: "integer", value: 42 },
      { type: true, valueType: "float", value: 3.14 },
      { type: true, valueType: "boolean", value: false },
      { type: true, valueType: "array", value: [1, "two", [true]] },
      { type: true, valueType: "vector", value: [0.1, 0.2] },
      { type: true, valueType: "point", value: { latitude: 32.07, longitude: 34.79 } },
      { type: true, valueType: "date", value: "2025-09-15" },
      { type: true, valueType: "time", value: "07:00:00" },
      { type: true, valueType: "datetime", value: "2025-06-29T13:45:00" },
      { type: true, valueType: "duration", value: "P3DT12H" },
    ];

    accepted.forEach((body) => assert.equal(parse(body).success, true, JSON.stringify(body)));
  });

  it("turns a value the named type cannot be built from away", () => {
    const rejected: unknown[] = [
      // The pairs the route would hand to a constructor that cannot take them.
      { type: true, valueType: "date", value: true },
      { type: true, valueType: "vector", value: "[0.1, 0.2]" },
      { type: true, valueType: "vector", value: ["a"] },
      { type: true, valueType: "point", value: [32.07, 34.79] },
      { type: true, valueType: "integer", value: 3.14 },
      { type: true, valueType: "integer", value: "42" },
      { type: true, valueType: "boolean", value: "true" },
      { type: true, valueType: "duration", value: "3 days" },
      { type: true, valueType: "datetime", value: "2025-06-29" },
      { type: true, valueType: "array", value: { latitude: 1, longitude: 2 } },
      { type: true, valueType: "string", value: "" },
    ];

    rejected.forEach((body) => assert.equal(parse(body).success, false, JSON.stringify(body)));
  });

  it("names the offending field, so the caller learns what to send", () => {
    const result = parse({ type: true, valueType: "date", value: 5 });

    assert.equal(result.success, false);
    assert.deepEqual(result.error?.issues[0].path, ["value"]);
    assert.match(result.error?.issues[0].message ?? "", /date/);
  });

  it("without a type, takes only what a query parameter carries on its own", () => {
    // Coordinates become a point through `point()`, which only the matching
    // valueType asks for — untyped they would be stored as a map, which
    // FalkorDB refuses.
    assert.equal(parse({ type: true, value: { latitude: 1, longitude: 2 } }).success, false);
    assert.equal(parse({ type: true, value: "hello" }).success, true);
    assert.equal(parse({ type: true, value: 42 }).success, true);
    assert.equal(parse({ type: false, value: [1, [2]] }).success, true);
  });

  it("needs to know which element is edited", () => {
    assert.equal(parse({ value: "hello" }).success, false);
  });
});
