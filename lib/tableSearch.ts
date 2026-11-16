const includesTerm = (value: unknown, lowerTerm: string): boolean =>
  value !== null && value !== undefined && String(value).toLowerCase().includes(lowerTerm);

const isObject = (value: unknown): value is object => typeof value === "object" && value !== null;

// Objects have no useful string form ("[object Object]"), so only primitives, and primitives inside arrays, are searched.
const nestedMatches = (value: unknown, lowerTerm: string): boolean =>
  Array.isArray(value)
    ? value.some(element => !isObject(element) && includesTerm(element, lowerTerm))
    : !isObject(value) && includesTerm(value, lowerTerm);

/**
 * Whether a table cell matches a search term (already lower-cased).
 * Object cells match on their values and on the values of nested objects or arrays.
 * Below that, only primitives and primitives inside arrays are searched, never the text of an object.
 * Every other value matches on its string form, so numbers and booleans count.
 */
export function cellMatchesSearch(cell: { type: string; value?: unknown }, lowerTerm: string): boolean {
  const { type, value } = cell;

  if (type !== "object" || !isObject(value)) return includesTerm(value, lowerTerm);

  return Object.values(value).some(inner =>
    isObject(inner)
      ? Object.values(inner).some(nested => nestedMatches(nested, lowerTerm))
      : includesTerm(inner, lowerTerm)
  );
}
