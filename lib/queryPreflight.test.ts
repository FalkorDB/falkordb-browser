import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { preflightQuery, type PreflightContext } from "./queryPreflight.ts";

const FILE_OK: PreflightContext = { fileUriSupported: true };
const FILE_UNAVAILABLE: PreflightContext = { fileUriSupported: false };

const codes = (query: string, context: PreflightContext) =>
  preflightQuery(query, context).map((issue) => issue.code);

describe("preflightQuery", () => {
  it("stays silent on queries that have nothing to load", () => {
    for (const query of ["", "MATCH (n) RETURN n", "CREATE (:A {from: 'ftp://x'})"]) {
      assert.deepEqual(codes(query, FILE_UNAVAILABLE), [], query);
    }
  });

  it("reports the schemes FalkorDB answers with 'Unsupported URI'", () => {
    const cases = [
      "LOAD CSV FROM 'http://example.com/a.csv' AS row RETURN row",
      "LOAD CSV FROM 'ftp://example.com/a.csv' AS row RETURN row",
      "LOAD CSV FROM 's3://bucket/a.csv' AS row RETURN row",
      "LOAD CSV FROM 'a.csv' AS row RETURN row",
      "LOAD CSV FROM '/var/lib/a.csv' AS row RETURN row",
      "LOAD CSV FROM './a.csv' AS row RETURN row",
    ];

    for (const query of cases) {
      assert.deepEqual(codes(query, FILE_OK), ["LOAD_CSV_UNSUPPORTED_URI"], query);
    }
  });

  it("accepts the two schemes FalkorDB actually fetches", () => {
    const cases = [
      "LOAD CSV FROM 'https://example.com/a.csv' AS row RETURN row",
      "LOAD CSV FROM 'HTTPS://example.com/a.csv' AS row RETURN row",
      "LOAD CSV FROM 'file://a.csv' AS row RETURN row",
      "load csv with headers from 'file://a.csv' as row return row",
      "LOAD CSV WITH HEADERS FROM 'file://a.csv' AS row FIELDTERMINATOR ';' RETURN row",
    ];

    for (const query of cases) {
      assert.deepEqual(codes(query, FILE_OK), [], query);
    }
  });

  it("judges the literal exactly as written", () => {
    // Measured on FalkorDB: each of these answers "Unsupported URI" — the scheme
    // has to start the value and be followed by "//".
    const rejected = [
      "LOAD CSV FROM ' https://example.com/a.csv' AS row RETURN row",
      "LOAD CSV FROM ' file://a.csv' AS row RETURN row",
      "LOAD CSV FROM 'https:example.com/a.csv' AS row RETURN row",
      "LOAD CSV FROM 'file:a.csv' AS row RETURN row",
    ];

    for (const query of rejected) {
      assert.deepEqual(codes(query, FILE_OK), ["LOAD_CSV_UNSUPPORTED_URI"], query);
    }

    // A trailing space, on the other hand, the server accepts.
    assert.deepEqual(codes("LOAD CSV FROM 'https://example.com/a.csv ' AS row RETURN row", FILE_OK), []);
  });

  it("flags file:// only where an operator has turned it off", () => {
    const query = "LOAD CSV FROM 'file://a.csv' AS row RETURN row";

    assert.deepEqual(codes(query, FILE_OK), []);
    assert.deepEqual(codes(query, FILE_UNAVAILABLE), ["LOAD_CSV_FILE_URI_UNAVAILABLE"]);
  });

  it("says nothing about a source it cannot read", () => {
    const cases = [
      "LOAD CSV FROM $url AS row RETURN row",
      "LOAD CSV FROM source AS row RETURN row",
      "LOAD CSV FROM toString($url) AS row RETURN row",
      "LOAD CSV FROM 'unterminated AS row RETURN row",
      // FalkorDB evaluates these to a URI it can fetch, so reading only the
      // first literal and judging that would block a working query.
      "LOAD CSV FROM 'http' + 's://example.com/a.csv' AS row RETURN row",
      "LOAD CSV FROM 'ftp' + '://example.com/a.csv' AS row RETURN row",
      "LOAD CSV FROM 'file://' + $name AS row RETURN row",
    ];

    for (const query of cases) {
      assert.deepEqual(codes(query, FILE_UNAVAILABLE), [], query);
    }
  });

  it("reads a source the query wraps in parentheses", () => {
    assert.deepEqual(
      codes("LOAD CSV FROM ('ftp://example.com/a.csv') AS row RETURN row", FILE_UNAVAILABLE),
      ["LOAD_CSV_UNSUPPORTED_URI"]
    );
    assert.deepEqual(
      codes("LOAD CSV FROM ( ( 'file://a.csv' ) ) AS row RETURN row", FILE_UNAVAILABLE),
      ["LOAD_CSV_FILE_URI_UNAVAILABLE"]
    );

    // Unbalanced parentheses mean something else is going on in there, and an
    // expression is exactly what we must not judge.
    assert.deepEqual(codes("LOAD CSV FROM ('a' + 'b.csv') AS row RETURN row", FILE_UNAVAILABLE), []);
    assert.deepEqual(codes("LOAD CSV FROM (('ftp://a.csv') AS row RETURN row", FILE_UNAVAILABLE), []);
  });

  it("ignores LOAD CSV that is only mentioned, not written", () => {
    const cases = [
      "// LOAD CSV FROM 'ftp://example.com/a.csv' AS row\nMATCH (n) RETURN n",
      "/* LOAD CSV FROM 'ftp://a.csv' AS row */ MATCH (n) RETURN n",
      "RETURN \"LOAD CSV FROM 'ftp://a.csv' AS row\" AS doc",
      "MATCH (n) WHERE n.`LOAD CSV FROM 'ftp://a.csv'` = 1 RETURN n",
    ];

    for (const query of cases) {
      assert.deepEqual(codes(query, FILE_UNAVAILABLE), [], query);
    }
  });

  it("reports every offending source in a multi-clause query", () => {
    const query = [
      "LOAD CSV FROM 'ftp://a.csv' AS a",
      "LOAD CSV FROM 'https://example.com/b.csv' AS b",
      "LOAD CSV FROM 'file://c.csv' AS c",
      "RETURN a, b, c",
    ].join("\n");

    assert.deepEqual(codes(query, FILE_UNAVAILABLE), [
      "LOAD_CSV_UNSUPPORTED_URI",
      "LOAD_CSV_FILE_URI_UNAVAILABLE",
    ]);
  });

  it("decodes the escapes FalkorDB decodes, and only those", () => {
    // `\\` is decoded on the server, so the path below really is `file://a\b.csv`.
    assert.deepEqual(codes("LOAD CSV FROM 'file://a\\\\b.csv' AS row RETURN row", FILE_OK), []);

    // `\uXXXX` is not: the server keeps the backslash and answers "Unsupported URI",
    // and a backslash is never legal in a scheme, so we must reach the same verdict.
    const escaped = "LOAD CSV FROM 'ht\\u0074ps://example.com/a.csv' AS row RETURN row";
    const [issue] = preflightQuery(escaped, FILE_OK);

    assert.equal(issue.code, "LOAD_CSV_UNSUPPORTED_URI");
    assert.equal(issue.uri, "ht\\u0074ps://example.com/a.csv");
  });

  it("reports an unknown escape in the scheme, as the server does", () => {
    const query = "LOAD CSV FROM 'ft\\p://a.csv' AS row RETURN row";

    assert.deepEqual(codes(query, FILE_OK), ["LOAD_CSV_UNSUPPORTED_URI"]);
  });

  it("offers the upload route for every issue it reports", () => {
    const query = "LOAD CSV FROM 'ftp://a.csv' AS a LOAD CSV FROM 'file://b.csv' AS b RETURN a, b";
    const issues = preflightQuery(query, FILE_UNAVAILABLE);

    assert.equal(issues.length, 2);
    assert.ok(issues.every((issue) => issue.fixableByUpload));
    assert.ok(issues.every((issue) => issue.message && issue.hint && issue.uri));
  });

  it("does not carry regex state between calls", () => {
    const query = "LOAD CSV FROM 'ftp://a.csv' AS row RETURN row";

    assert.deepEqual(codes(query, FILE_OK), ["LOAD_CSV_UNSUPPORTED_URI"]);
    assert.deepEqual(codes(query, FILE_OK), ["LOAD_CSV_UNSUPPORTED_URI"]);
  });
});
