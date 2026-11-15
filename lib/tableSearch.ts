const includesTerm = (value: unknown, lowerTerm: string): boolean =>
  value !== null && value !== undefined && String(value).toLowerCase().includes(lowerTerm);

const isObject = (value: unknown): value is object => typeof value === "object" && value !== null;

/**
 * Whether a table cell matches a search term (already lower-cased).
 * Object cells match on their values, looking one level into nested ones;
 * every other value matches on its string form, so numbers and booleans count.
 */
export function cellMatchesSearch(cell: { type: string; value?: unknown }, lowerTerm: string): boolean {
  const { type, value } = cell;

  if (type !== "object" || !isObject(value)) return includesTerm(value, lowerTerm);

  return Object.values(value).some(inner =>
    isObject(inner)
      ? Object.values(inner).some(nested => includesTerm(nested, lowerTerm))
      : includesTerm(inner, lowerTerm)
  );
}
