// Smoke tests for "Did you mean…?" against a REAL FalkorDB server.
//
// These verify our suggestion logic against the actual error wording the server
// produces (so a future FalkorDB rewording is caught). They are gated:
//   * FALKORDB_SMOKE unset            → skipped (safe to run anywhere).
//   * FALKORDB_SMOKE=1, cannot connect → FAIL (so a misconfigured CI job can't pass
//                                        vacuously).
//
// Run locally:
//   docker run -d -p 6379:6379 falkordb/falkordb
//   FALKORDB_SMOKE=1 npm run test:smoke

import { test } from "node:test";
import assert from "node:assert/strict";
import { FalkorDB } from "falkordb";
import { suggestForError } from "./cypherSuggestions.ts";
import { computeEditorDiagnostics } from "./cypherDiagnostics.ts";

const ENABLED = process.env.FALKORDB_SMOKE === "1";
const URL = process.env.FALKORDB_URL ?? "redis://localhost:6379";

test(
  "suggestForError matches live FalkorDB error wording",
  { skip: ENABLED ? false : "set FALKORDB_SMOKE=1 (and run a FalkorDB) to enable" },
  async () => {
    let db;
    try {
      db = await FalkorDB.connect({ url: URL });
    } catch (error) {
      assert.fail(`FALKORDB_SMOKE=1 but could not connect to ${URL}: ${(error as Error).message}`);
    }

    const graphName = `smoke_did_you_mean_${Date.now()}`;
    try {
      const graph = db.selectGraph(graphName);

      // Unknown function — both queries fail, so no graph is actually created.
      let fnError = "";
      try {
        await graph.query('RETURN lenght("hi")');
      } catch (error) {
        fnError = (error as Error).message;
      }
      assert.equal(
        suggestForError(fnError, { functions: ["length"] }),
        "Did you mean length()?",
        `unexpected function-error wording: ${JSON.stringify(fnError)}`
      );

      // Undefined variable.
      const varQuery = "MATCH (person) RETURN prsn";
      let varError = "";
      try {
        await graph.query(varQuery);
      } catch (error) {
        varError = (error as Error).message;
      }
      assert.equal(
        suggestForError(varError, { query: varQuery }),
        "Did you mean person?",
        `unexpected variable-error wording: ${JSON.stringify(varError)}`
      );

      // Editor diagnostics: the live error must map to a marker over the token, with a quick fix.
      const fnDiag = computeEditorDiagnostics('RETURN lenght("hi")', fnError).diagnostics[0];
      assert.equal(fnDiag.code, "unknown-function");
      assert.deepEqual([fnDiag.startColumn, fnDiag.endColumn], [8, 14]);
      assert.deepEqual(fnDiag.quickFix, { title: "Replace with length", newText: "length" });

      const varDiag = computeEditorDiagnostics(varQuery, varError).diagnostics[0];
      assert.equal(varDiag.code, "undefined-variable");
      assert.equal(varDiag.quickFix?.newText, "person");
    } finally {
      await db.selectGraph(graphName).delete().catch(() => {});
      await db.close().catch(() => {});
    }
  }
);
