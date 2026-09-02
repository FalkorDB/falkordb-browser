const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export interface FunctionLocation {
  /** 1-based line of the match. */
  lineNumber: number;
  /** 1-based column where the function name starts. */
  column: number;
  /** Length of the matched function name. */
  length: number;
}

/**
 * A UDF is called as `<library>.<function>()`, so the listed name can carry a
 * namespace the JS source never mentions. Match on the last segment only.
 */
const stripNamespace = (functionName: string) => functionName.slice(functionName.lastIndexOf(".") + 1);

/**
 * A signature whose parameter list wraps closes on a later line; only an arrow
 * after that closing paren makes it a declaration rather than an expression.
 */
const closesIntoArrow = (lines: string[], index: number) => {
  for (let i = index + 1; i < lines.length; i += 1) {
    if (lines[i].includes(")")) return /^[^()]*\)\s*=>/.test(lines[i]);
  }

  return false;
};

interface FunctionPattern {
  build: (name: string) => RegExp;
  /** Extra check against the lines after a match. */
  confirm?: (lines: string[], index: number) => boolean;
}

/**
 * Ordered from the most specific declaration form down to a bare occurrence.
 * Every line is scanned with one pattern before moving on to the next, so a
 * declaration always wins over a call site further up the file.
 */
const FUNCTION_PATTERNS: FunctionPattern[] = [
  { build: (name: string) => new RegExp(`\\bfunction\\s+${escapeRegExp(name)}\\s*\\(`) },
  // The trailing alternation covers `function`, an arrow parameter list (greedy
  // to the last paren, so defaults may contain calls) and a bare-identifier
  // arrow parameter (`const fn = x => …`). A parameter list with no arrow after
  // it is an expression (`const fn = (1 + 2)`), not a declaration.
  {
    build: (name: string) =>
      new RegExp(
        `\\b(?:const|let|var)\\s+${escapeRegExp(name)}\\s*=\\s*(?:async\\s*)?(?:function\\b|\\(.*\\)\\s*=>|[A-Za-z_$][\\w$]*\\s*=>)`
      ),
  },
  {
    build: (name: string) =>
      new RegExp(`\\b(?:const|let|var)\\s+${escapeRegExp(name)}\\s*=\\s*(?:async\\s*)?\\([^)]*$`),
    confirm: closesIntoArrow,
  },
  { build: (name: string) => new RegExp(`\\b${escapeRegExp(name)}\\s*:\\s*(?:async\\s*)?function\\b`) },
  // Any `name(` — covers class methods, shorthand object methods and
  // declaration styles the patterns above don't spell out.
  { build: (name: string) => new RegExp(`\\b${escapeRegExp(name)}\\s*\\(`) },
  // `falkor.register('name', impl)` — the registered name may differ from the
  // implementation it points at, so this is the only anchor for such libraries.
  { build: (name: string) => new RegExp(`register\\s*\\(\\s*['"\`]${escapeRegExp(name)}['"\`]`) },
  { build: (name: string) => new RegExp(`\\b${escapeRegExp(name)}\\b`) },
];

export const findFunctionLocation = (source: string, functionName: string): FunctionLocation | null => {
  if (!source || !functionName) return null;

  const name = stripNamespace(functionName);
  if (!name) return null;

  const lines = source.split(/\r?\n/);

  for (let p = 0; p < FUNCTION_PATTERNS.length; p += 1) {
    const { build, confirm } = FUNCTION_PATTERNS[p];
    const pattern = build(name);

    for (let i = 0; i < lines.length; i += 1) {
      const match = pattern.exec(lines[i]);

      if (match && (!confirm || confirm(lines, i))) {
        const offset = match[0].indexOf(name);
        return {
          lineNumber: i + 1,
          column: match.index + (offset < 0 ? 0 : offset) + 1,
          length: name.length,
        };
      }
    }
  }

  return null;
};

export const findFunctionLine = (source: string, functionName: string): number | null =>
  findFunctionLocation(source, functionName)?.lineNumber ?? null;
