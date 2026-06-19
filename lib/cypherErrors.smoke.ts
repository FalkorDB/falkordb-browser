// Drift-guard smoke tests for the Cypher error catalog against a REAL FalkorDB.
//
// For every DriftCase we run its query on a live server and assert that the catalog
// still recognizes the resulting message — i.e. the server wording hasn't drifted away
// from our regexes. This is the early-warning system for a FalkorDB rewording: if a
// message changes, this fails loudly instead of users silently losing their hint.
//
// Gated like the other smoke tests:
//   * FALKORDB_SMOKE unset            → skipped (safe to run anywhere).
//   * FALKORDB_SMOKE=1, cannot connect → FAIL (a misconfigured CI job can't pass
//                                        vacuously).
//
// Run locally:
//   docker run -d -p 6379:6379 falkordb/falkordb
//   FALKORDB_SMOKE=1 npm run test:smoke

import { test } from "node:test";
import assert from "node:assert/strict";
import { FalkorDB } from "falkordb";
import { getCypherErrorHint } from "./cypherErrors.ts";
import { DRIFT_CASES } from "./cypherErrorDriftCases.ts";

const ENABLED = process.env.FALKORDB_SMOKE === "1";
const URL = process.env.FALKORDB_URL ?? "redis://localhost:6379";

test(
  "every DRIFT_CASE still matches live FalkorDB error wording",
  { skip: ENABLED ? false : "set FALKORDB_SMOKE=1 (and run a FalkorDB) to enable" },
  async () => {
    let db!: FalkorDB;
    try {
      db = await FalkorDB.connect({ url: URL });
    } catch (error) {
      assert.fail(`FALKORDB_SMOKE=1 but could not connect to ${URL}: ${(error as Error).message}`);
    }

    const graphName = `smoke_cypher_errors_${Date.now()}`;
    try {
      const graph = db.selectGraph(graphName);
      // Seed a node so MATCH-based queries operate on real data rather than an empty graph.
      await graph.query("CREATE (:Person {name:'a'})");

      for (const { id, query, expectedMessage } of DRIFT_CASES) {
        let message = "";
        let succeeded = false;
        try {
          // eslint-disable-next-line no-await-in-loop
          await graph.query(query);
          succeeded = true;
        } catch (error) {
          message = (error as Error).message;
        }
        assert.ok(!succeeded, `expected query to error but it succeeded: ${query}`);

        assert.match(
          message,
          expectedMessage,
          `[${id}] live wording drifted for query ${JSON.stringify(query)}: ${JSON.stringify(message)}`
        );

        const hint = getCypherErrorHint(message);
        assert.equal(
          hint?.id,
          id,
          `[${id}] catalog no longer recognizes live message ${JSON.stringify(message)} (got ${JSON.stringify(hint?.id)})`
        );
      }
    } finally {
      await db.selectGraph(graphName).delete().catch(() => {});
      await db.close().catch(() => {});
    }
  }
);
