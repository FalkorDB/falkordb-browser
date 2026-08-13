# `generated/` — ANTLR4 grammar artifacts for **falkordb-cypher**

These files are **generated** from an ANTLR4 Cypher grammar and **committed as
source**, so the app builds and ships without needing Java/ANTLR at build time.

```
generated/
  CypherLexer.ts            ← generated lexer (antlr4ng target)
  CypherParser.ts           ← generated parser (antlr4ng target)
  CypherParserListener.ts   ← generated listener (imported by the parser)
  .grammar-src/             ← the .g4 sources used to generate the above
    CypherLexer.g4
    CypherParser.g4
```

## Runtime stack

- **`antlr4ng`** — the runtime the generated TypeScript targets.
- **`antlr4-c3`** — the completion core (its peer runtime is `antlr4ng`).

No Neo4j tooling, libraries, or npm packages are involved. The baseline is the
**authoritative openCypher ANTLR4 grammar** (M23,
`s3.amazonaws.com/artifacts.opencypher.org/M23/Cypher.g4`, Apache-2.0, openCypher
community) — the same reference grammar that defines the whole Cypher language.
The Apache-2.0 attribution header is preserved in `.grammar-src/Cypher.g4` and
must stay. It is **extended with FalkorDB-specific clauses**:

- `FOREACH (x IN list | …)` — list-driven updates
- `CALL { … }` — inline subqueries
- `shortestPath(…)` / `allShortestPaths(…)` — shortest-path pattern functions
- `reduce(acc = init, x IN list | expr)` — list reduction
- `EXISTS { … }` extended to accept a full `MATCH …` subquery
- Schema DDL: `CREATE/DROP INDEX`, `CREATE FULLTEXT INDEX`, `CREATE/DROP CONSTRAINT`

Coverage is verified empirically against 357 real FalkorDB queries extracted from
the FalkorDB test suite: **99.2%** accepted (the remainder are intentionally
invalid negative-test queries, correctly flagged).

All FalkorDB additions follow openCypher's own conventions (explicit `SP`
whitespace, case-insensitive keyword fragments, and new function-keywords also
added to `oC_SymbolicName` so they remain usable as identifiers).

## Regenerating (one-time / when the grammar itself changes)

Needs Java once (the `antlr4ng-cli` dev dependency wraps ANTLR). From the repo
root:

```bash
npm run generate:grammar
```

which (from within `.grammar-src/`, so the combined-grammar token file resolves)
runs `antlr4ng -Dlanguage=TypeScript` on `Cypher.g4` and copies the emitted
`CypherLexer.ts`, `CypherParser.ts`, `CypherListener.ts` up into `generated/`.

Then commit the regenerated `.ts` files. Day-to-day schema changes (labels,
procedures, `algo.*`, `$params`) do **not** require regeneration — they are
injected at runtime via the engine's schema getter.

## How the rest of the engine binds to these

`../grammarMapping.ts` is the single place that references concrete grammar
names (rules `script`, `nodeLabels`, `relationshipTypes`, `invocationName`,
`symbol`; and the ignored lexer tokens). If you swap the grammar, update only
that file.
