import { readFileSync } from "node:fs";
import { createFalkorCypherEngine } from "./lib/falkordb-cypher/engine.ts";
const engine = createFalkorCypherEngine(() => ({}));
const queries = readFileSync("/tmp/fdb_queries.txt", "utf8").split("\n").filter((q) => q.trim());
let pass = 0; const fails: string[] = [];
for (const q of queries) { const e = engine.lint(q); if (e.length === 0) pass++; else fails.push(q + "   ::" + e[0].message); }
console.log(`Corpus ${queries.length}: accepted ${pass} (${((pass/queries.length)*100).toFixed(1)}%), rejected ${fails.length}\n`);
console.log(fails.join("\n"));
