import test from "node:test";
import assert from "node:assert/strict";
import {
    formatValue,
    getDefaultValue,
    inferValueType,
    isGeoPoint,
    parseValue,
    VALUE_EXPRESSIONS,
    VALUE_TYPES,
    type PropertyValue,
    type ValueType,
} from "./graphValues.ts";

const parsed = (type: ValueType, raw: PropertyValue) => {
    const result = parseValue(type, raw);
    assert.ok(!("error" in result), `expected ${type} "${String(raw)}" to parse`);
    return result.value;
};

const failure = (type: ValueType, raw: PropertyValue) => {
    const result = parseValue(type, raw);
    assert.ok("error" in result, `expected ${type} "${String(raw)}" to be rejected`);
    return result.error;
};

test("every type knows how it is written", () => {
    VALUE_TYPES.forEach((type) => {
        assert.match(VALUE_EXPRESSIONS[type], /\$value/);
    });
});

test("only a boolean is edited as something other than text", () => {
    assert.equal(getDefaultValue("boolean"), false);
    VALUE_TYPES.filter((type) => type !== "boolean").forEach((type) => {
        assert.equal(getDefaultValue(type), "", `for ${type}`);
    });
});

test("isGeoPoint accepts a point and nothing else", () => {
    assert.equal(isGeoPoint({ latitude: 1, longitude: 2 }), true);
    assert.equal(isGeoPoint({ latitude: "1", longitude: 2 }), false);
    assert.equal(isGeoPoint([1, 2]), false);
    assert.equal(isGeoPoint(null), false);
    assert.equal(isGeoPoint("point"), false);
});

test("inferValueType picks the type an existing value reads back as", () => {
    const cases: [unknown, ValueType][] = [
        [true, "boolean"],
        [7, "integer"],
        [-7, "integer"],
        [7.5, "float"],
        [[1, 2], "array"],
        // A vector comes back as plain numbers, so it is indistinguishable.
        [[0.1, 0.2], "array"],
        [{ latitude: 1, longitude: 2 }, "point"],
        ["2025-09-15", "string"],
        [undefined, "string"],
    ];

    cases.forEach(([value, expected]) => {
        assert.equal(inferValueType(value), expected, `for ${JSON.stringify(value) ?? "undefined"}`);
    });
});

test("getDefaultValue starts each type from an empty value", () => {
    assert.equal(getDefaultValue("boolean"), false);
    assert.equal(getDefaultValue("integer"), "");
    assert.equal(getDefaultValue("string"), "");
});

test("formatValue renders every type as editable text", () => {
    assert.equal(formatValue("text"), "text");
    assert.equal(formatValue(7), "7");
    assert.equal(formatValue(false), "false");
    assert.equal(formatValue([1, "two"]), '[1,"two"]');
    assert.equal(formatValue({ latitude: 1, longitude: 2 }), '{"latitude":1,"longitude":2}');
    assert.equal(formatValue(undefined), "");
    assert.equal(formatValue(null), "");
});

test("parseValue reads booleans from the switch and from text", () => {
    assert.equal(parsed("boolean", true), true);
    assert.equal(parsed("boolean", "true"), true);
    assert.equal(parsed("boolean", "anything else"), false);
});

test("parseValue keeps integers whole and floats numeric", () => {
    assert.equal(parsed("integer", " 42 "), 42);
    assert.equal(parsed("integer", 42), 42);
    assert.equal(parsed("float", "42.5"), 42.5);
    assert.match(failure("integer", "42.5"), /whole number/);
    assert.match(failure("float", "abc"), /has to be a number/);
    assert.match(failure("float", ""), /has to be a number/);
});

test("parseValue accepts the arrays FalkorDB can store", () => {
    assert.deepEqual(parsed("array", '[1, "two", true]'), [1, "two", true]);
    assert.deepEqual(parsed("array", "[[1], [2]]"), [[1], [2]]);
    assert.match(failure("array", "[1,"), /valid JSON/);
    assert.match(failure("array", '"text"'), /has to be a list/);
    assert.match(failure("array", "[null]"), /strings, numbers, booleans/);
    assert.match(failure("array", '[{"a": 1}]'), /strings, numbers, booleans/);
});

test("parseValue holds vectors to numbers", () => {
    assert.deepEqual(parsed("vector", "[0.1, 0.2]"), [0.1, 0.2]);
    assert.match(failure("vector", '["a"]'), /numbers only/);
    assert.match(failure("vector", "{}"), /has to be a list/);
});

test("parseValue keeps only the coordinates of a point", () => {
    assert.deepEqual(parsed("point", '{ "latitude": 32.07, "longitude": 34.79, "extra": 1 }'), {
        latitude: 32.07,
        longitude: 34.79,
    });
    assert.match(failure("point", '{ "latitude": 32.07 }'), /latitude and longitude/);
});

test("parseValue checks the temporal formats", () => {
    assert.equal(parsed("date", " 2025-09-15 "), "2025-09-15");
    assert.equal(parsed("time", "07:00"), "07:00");
    assert.equal(parsed("time", "07:00:00.500"), "07:00:00.500");
    assert.equal(parsed("datetime", "2025-06-29T13:45:00"), "2025-06-29T13:45:00");
    assert.equal(parsed("duration", "P3DT12H"), "P3DT12H");

    assert.match(failure("date", "15/09/2025"), /Expected the format/);
    assert.match(failure("time", "7:00"), /Expected the format/);
    assert.match(failure("datetime", "2025-06-29 13:45:00"), /Expected the format/);
    assert.match(failure("duration", "P"), /Expected the format/);
    assert.match(failure("duration", "P3T12H"), /Expected the format/);
});

test("parseValue rejects a temporal value that has the right shape but cannot exist", () => {
    // These used to reach FalkorDB, where `date()`/`localtime()` failed and the
    // user saw a raw Cypher error instead of the format hint.
    assert.match(failure("date", "2025-13-15"), /Expected the format/);
    assert.match(failure("date", "2025-09-45"), /Expected the format/);
    assert.match(failure("date", "2025-00-15"), /Expected the format/);
    assert.match(failure("time", "25:00"), /Expected the format/);
    assert.match(failure("time", "07:61"), /Expected the format/);
    assert.match(failure("time", "07:00:61"), /Expected the format/);
    assert.match(failure("datetime", "2025-06-29T25:61"), /Expected the format/);

    // The edges of each range still pass.
    assert.equal(parsed("date", "2025-12-31"), "2025-12-31");
    assert.equal(parsed("time", "23:59:59"), "23:59:59");
    assert.equal(parsed("datetime", "2025-01-01T00:00"), "2025-01-01T00:00");
});

test("parseValue rejects a day the month never had", () => {
    // The component ranges alone let these through: the day is within 1-31, but
    // not within the month it sits in.
    assert.match(failure("date", "2025-02-31"), /does not exist/);
    assert.match(failure("date", "2025-04-31"), /does not exist/);
    assert.match(failure("date", "2025-06-31"), /does not exist/);
    assert.match(failure("datetime", "2025-02-30T12:00"), /does not exist/);

    // February follows the leap year, including the century rules.
    assert.match(failure("date", "2025-02-29"), /does not exist/);
    assert.match(failure("date", "1900-02-29"), /does not exist/);
    assert.equal(parsed("date", "2024-02-29"), "2024-02-29");
    assert.equal(parsed("date", "2000-02-29"), "2000-02-29");
    assert.equal(parsed("date", "2025-02-28"), "2025-02-28");

    // A time carries no date, so it is left alone.
    assert.equal(parsed("time", "23:59:59"), "23:59:59");
});

test("parseValue passes strings through", () => {
    assert.equal(parsed("string", "  keeps its spaces  "), "  keeps its spaces  ");
});
