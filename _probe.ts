import { createFalkorCypherEngine } from "./lib/falkordb-cypher/engine.ts";
const engine = createFalkorCypherEngine(() => ({}));
// Real FalkorDB-supported constructs beyond FOREACH/CALL{}. Anything that lints
// as "error" here is a GAP (false positive) in the current grammar.
const probes: [string, string][] = [
  ["shortestPath()", "MATCH p = shortestPath((a)-[*]-(b)) RETURN p"],
  ["allShortestPaths()", "MATCH p = allShortestPaths((a)-[*]-(b)) RETURN p"],
  ["reduce()", "RETURN reduce(s = 0, x IN [1,2,3] | s + x) AS total"],
  ["map projection", "MATCH (n) RETURN n {.name, .age}"],
  ["list slice", "RETURN [1,2,3,4][0..2] AS s"],
  ["node WHERE pattern", "MATCH (n WHERE n.age > 30) RETURN n"],
  ["label expr |", "MATCH (n:A|B) RETURN n"],
  ["LOAD CSV", "LOAD CSV FROM 'file:///x.csv' AS row RETURN row"],
  ["EXISTS { subq }", "MATCH (n) WHERE EXISTS { MATCH (n)-->(m) } RETURN n"],
  ["COUNT { subq }", "MATCH (n) RETURN COUNT { (n)-->() } AS deg"],
  ["quantified path", "MATCH (a)-[:R]->{1,3}(b) RETURN b"],
  ["WITH * ", "MATCH (n) WITH * RETURN n"],
  ["multiple labels : :", "MATCH (n:A:B) RETURN n"],
  ["param $p", "MATCH (n {id: $id}) RETURN n"],
  ["CASE expr", "RETURN CASE WHEN 1 > 0 THEN 'y' ELSE 'n' END"],
  ["pattern comprehension", "MATCH (n) RETURN [(n)-->(m) | m.name] AS names"],
  ["SET += map", "MATCH (n) SET n += {a: 1, b: 2}"],
  ["DISTINCT in agg", "MATCH (n) RETURN count(DISTINCT n.name)"],
];
let gaps = 0;
for (const [label, q] of probes) {
  const errs = engine.lint(q);
  const ok = errs.length === 0;
  if (!ok) gaps++;
  console.log(`${ok ? "ok  " : "GAP "} ${label.padEnd(22)} ${ok ? "" : ":: " + errs[0].message}`);
}
console.log(`\n${gaps} / ${probes.length} constructs are GAPS (falsely flagged as errors)`);
