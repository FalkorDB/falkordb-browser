import { test } from "node:test";
import assert from "node:assert/strict";
import { FalkorDB } from "falkordb";
import FalkorDBTokenStorage from "./FalkorDBTokenStorage.ts";
import { closePATFalkorDBClient } from "./falkordb-client.ts";

test("FalkorDB token listings bind both roles to case-insensitive host and exact port", async (t) => {
  const calls: { query: string; options: { params: Record<string, unknown> } }[] = [];
  const client = {
    connection: Promise.resolve({ ping: async () => "PONG" }),
    selectGraph: () => ({
      query: async (query: string, options: { params: Record<string, unknown> }) => {
        calls.push({ query, options });
        return { data: [] };
      },
    }),
    close: async () => {},
  } as unknown as FalkorDB;
  t.mock.method(FalkorDB, "connect", async () => client);
  t.after(closePATFalkorDBClient);
  const storage = new FalkorDBTokenStorage();
  for (const isAdmin of [true, false]) {
    for (const host of ["localhost", "LOCALHOST"]) {
      await storage.fetchTokens({ isAdmin, username: "fixture", host, port: 6379 });
      const { query, options } = calls.at(-1)!;
      assert.match(query, /toLower\(t\.host\) = toLower\(\$host\) AND t\.port = \$port/);
      assert.equal(query.includes("t.username = $username"), !isAdmin);
      assert.deepEqual(options.params, { username: "fixture", host, port: 6379 });
    }
  }
});
