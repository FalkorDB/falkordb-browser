const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const FUNCTION_PATTERNS = [
  (name: string) => new RegExp(`\\bfunction\\s+${escapeRegExp(name)}\\b`),
  (name: string) => new RegExp(`\\b(?:const|let|var)\\s+${escapeRegExp(name)}\\s*=\\s*(?:async\\s*)?(?:function\\b|\\()`),
  (name: string) => new RegExp(`\\b${escapeRegExp(name)}\\s*:\\s*(?:async\\s*)?function\\b`),
];

export const findFunctionLine = (source: string, functionName: string): number | null => {
  if (!source || !functionName) return null;

  const lines = source.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    if (FUNCTION_PATTERNS.some((patternFactory) => patternFactory(functionName).test(lines[i]))) {
      return i + 1;
    }
  }

  return null;
};
