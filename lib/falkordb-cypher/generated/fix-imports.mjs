import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const generatedDirectory = dirname(fileURLToPath(import.meta.url));

for (const filename of ["CypherLexer.ts", "CypherParser.ts", "CypherListener.ts"]) {
  const path = join(generatedDirectory, filename);
  const source = await readFile(path, "utf8");
  const typeImports = filename === "CypherListener.ts"
    ? "ErrorNode, ParseTreeListener, ParserRuleContext, TerminalNode"
    : "Token";
  const fixed = source
    .replaceAll(/from "(\.\/[^"]+)\.js"/g, 'from "$1.ts"')
    .replace(
      `import { ${typeImports} } from "antlr4ng";`,
      `import type { ${typeImports} } from "antlr4ng";`,
    )
    .replaceAll(/[ \t]+$/gm, "")
    .replaceAll(/^[ \t]+/gm, indentation => indentation.replaceAll("\t", "    "));
  if (fixed !== source) await writeFile(path, fixed);
}
