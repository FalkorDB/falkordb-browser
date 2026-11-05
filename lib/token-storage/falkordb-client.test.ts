import { test } from "node:test";
import assert from "node:assert/strict";
import { inspect } from "node:util";
import { parseFalkorDBUrl } from "./falkordb-client.ts";

test("token database URL supports legacy aliases, TLS and IPv6", (t) => {
  const previous = process.env.API_TOKEN_FALKORDB_URL;
  t.after(() => {
    if (previous === undefined) delete process.env.API_TOKEN_FALKORDB_URL;
    else process.env.API_TOKEN_FALKORDB_URL = previous;
  });
  for (const [scheme, tls] of [
    ["falkordb", false], ["falkor", false], ["redis", false], ["falkors", true], ["rediss", true],
  ] as const) {
    process.env.API_TOKEN_FALKORDB_URL = `${scheme}://user:p%40ss@[::1]:6379/0`;
    assert.deepEqual(parseFalkorDBUrl(), {
      host: "::1", port: 6379, username: "user", password: "p@ss", tls,
    });
  }
});

test("token database URL rejects unsupported options without retaining credential-bearing errors", (t) => {
  const previous = process.env.API_TOKEN_FALKORDB_URL;
  t.after(() => {
    if (previous === undefined) delete process.env.API_TOKEN_FALKORDB_URL;
    else process.env.API_TOKEN_FALKORDB_URL = previous;
  });

  test("token database URL uses Redis default ports without changing legacy FalkorDB defaults", (t) => {
    const previous = process.env.API_TOKEN_FALKORDB_URL;
    t.after(() => {
      if (previous === undefined) delete process.env.API_TOKEN_FALKORDB_URL;
      else process.env.API_TOKEN_FALKORDB_URL = previous;
    });
    for (const scheme of ["redis", "rediss", "falkor", "falkordb", "falkors"]) {
      process.env.API_TOKEN_FALKORDB_URL = `${scheme}://localhost`;
      assert.equal(parseFalkorDBUrl().port, scheme.startsWith("redis") ? 6379 : 6380);
      process.env.API_TOKEN_FALKORDB_URL = `${scheme}://localhost:6381`;
      assert.equal(parseFalkorDBUrl().port, 6381);
    }
  });
  for (const value of [
    "redis://user:private-secret@host:invalid", "http://user:private-secret@host",
    "redis://user:private-secret@host/1", "redis://user:private-secret@host/?tls=false",
    "redis://user:private-secret@host/#options", "redis://user:private-secret%ZZ@host",
  ]) {
    process.env.API_TOKEN_FALKORDB_URL = value;
    assert.throws(parseFalkorDBUrl, (error: Error) => {
      assert.match(error.message, /API_TOKEN_FALKORDB_URL/);
      assert.equal(inspect(error).includes("private-secret"), false);
      assert.equal(error.cause, undefined);
      return true;
    });
  }
});
