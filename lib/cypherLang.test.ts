import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { CYPHER_KEYWORDS } from "./cypherLang.ts";

function grammarKeywordSingles(): Set<string> {
  const lexerSource = fs.readFileSync(new URL("./falkordb-cypher/generated/CypherLexer.ts", import.meta.url), "utf8");
  const symbolicNamesBlock = lexerSource.match(/public static readonly symbolicNames = \[(.*?)\];/s)?.[1] ?? "";
  const symbolicNames = Array.from(symbolicNamesBlock.matchAll(/"([A-Za-z_][A-Za-z0-9_]*)"/g), (match) => match[1]);

  return new Set(
    symbolicNames
      .filter((name) => /^[A-Z][A-Z0-9_]*$/.test(name))
      .map((name) => name.replace(/^L_/, ""))
      .filter((name) => name !== "SP" && name !== "WHITESPACE")
  );
}

function hardcodedKeywordSingles(): Set<string> {
  return new Set(CYPHER_KEYWORDS.flatMap((keyword) => keyword.split(" ")).map((part) => part.toUpperCase()));
}

describe("CYPHER_KEYWORDS", () => {
  it("stays in sync with generated grammar keyword tokens", () => {
    const grammarSingles = grammarKeywordSingles();
    const hardcodedSingles = hardcodedKeywordSingles();

    const missing = Array.from(grammarSingles).filter((token) => !hardcodedSingles.has(token)).sort();
    const extra = Array.from(hardcodedSingles).filter((token) => !grammarSingles.has(token)).sort();

    assert.deepEqual(missing, [], `Missing keyword token(s): ${missing.join(", ")}`);
    assert.deepEqual(extra, [], `Extra keyword token(s): ${extra.join(", ")}`);
  });
});
