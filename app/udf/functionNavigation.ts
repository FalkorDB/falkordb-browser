const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The name as the patterns' only capture group, matched with indices (`d`), so
 * the column comes from the name itself: `register('register', …)` must point
 * at the quoted name, not at the method that shares it.
 */
const named = (name: string) => `(${escapeRegExp(name)})`;

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
 * The list can nest (`(a = fallback(), b)`), so track depth instead of stopping
 * at the first line that merely contains a `)`.
 */
const closesIntoArrow = (lines: string[], index: number) => {
  // The matched line carries no `)` after its opening paren, so the last `(` on
  // it is the one that must close.
  let depth = 1;

  for (let i = index; i < lines.length; i += 1) {
    const line = lines[i];

    for (let c = i === index ? line.lastIndexOf("(") + 1 : 0; c < line.length; c += 1) {
      if (line[c] === "(") depth += 1;
      else if (line[c] === ")") {
        depth -= 1;
        if (depth === 0) return /^\s*=>/.test(line.slice(c + 1));
      }
    }
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
  { build: (name: string) => new RegExp(`\\bfunction\\s+${named(name)}\\s*\\(`, "d") },
  // The trailing alternation covers `function`, an arrow parameter list (greedy
  // to the last paren, so defaults may contain calls) and a bare-identifier
  // arrow parameter (`const fn = x => …`). A parameter list with no arrow after
  // it is an expression (`const fn = (1 + 2)`), not a declaration.
  {
    build: (name: string) =>
      new RegExp(
        `\\b(?:const|let|var)\\s+${named(name)}\\s*=\\s*(?:async\\s*)?(?:function\\b|\\(.*\\)\\s*=>|[A-Za-z_$][\\w$]*\\s*=>)`,
        "d"
      ),
  },
  {
    build: (name: string) =>
      new RegExp(`\\b(?:const|let|var)\\s+${named(name)}\\s*=\\s*(?:async\\s*)?\\([^)]*$`, "d"),
    confirm: closesIntoArrow,
  },
  { build: (name: string) => new RegExp(`\\b${named(name)}\\s*:\\s*(?:async\\s*)?function\\b`, "d") },
  // `falkor.register('name', impl)` — the registered name may differ from the
  // implementation it points at, so this is the only anchor for such libraries.
  // It outranks a bare `name(`, which may just be a call site.
  { build: (name: string) => new RegExp(`register\\s*\\(\\s*['"\`]${named(name)}['"\`]`, "d") },
  // Any `name(` — covers class methods, shorthand object methods and
  // declaration styles the patterns above don't spell out.
  { build: (name: string) => new RegExp(`\\b${named(name)}\\s*\\(`, "d") },
  { build: (name: string) => new RegExp(`\\b${named(name)}\\b`, "d") },
];

/**
 * Replaces comments with spaces so a name mentioned in one is not taken for the
 * code, keeping every line and column where it was. Strings and regex literals
 * are skipped, not blanked: `register('name')` lives in a string, and either can
 * hold a `//` or `/*`. Quoted strings stop at a line end, so a stray quote cannot
 * swallow code. A `/` opens a regex only where a value may start (after an
 * operator, an opening bracket, `return`/`typeof` or at a line start), so a
 * division is never mistaken for one.
 */
const blankComments = (source: string) =>
  source.replace(
    /\/\*[\s\S]*?\*\/|\/\/[^\n]*|(?<=(?:^|[(,=:[!&|?{};~^%*+<>-]|\breturn|\btypeof)\s*)\/(?![*/])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\/|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\[\s\S]|[^`\\])*`/gm,
    (match) => (/^\/[/*]/.test(match) ? match.replace(/[^\n]/g, " ") : match)
  );

export const findFunctionLocation = (source: string, functionName: string): FunctionLocation | null => {
  if (!source || !functionName) return null;

  const name = stripNamespace(functionName);
  if (!name) return null;

  const lines = blankComments(source).split(/\r?\n/);

  for (let p = 0; p < FUNCTION_PATTERNS.length; p += 1) {
    const { build, confirm } = FUNCTION_PATTERNS[p];
    const pattern = build(name);

    for (let i = 0; i < lines.length; i += 1) {
      const match = pattern.exec(lines[i]);

      if (match && (!confirm || confirm(lines, i))) {
        return {
          lineNumber: i + 1,
          // Every pattern captures the name, so its indices are always there.
          column: match.indices![1]![0] + 1,
          length: name.length,
        };
      }
    }
  }

  return null;
};

export const findFunctionLine = (source: string, functionName: string): number | null =>
  findFunctionLocation(source, functionName)?.lineNumber ?? null;
