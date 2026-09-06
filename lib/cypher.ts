/**
 * Quoting for the parts of a Cypher query that cannot travel as parameters.
 *
 * Deliberately dependency-free: it is used from API routes as well as from the
 * client, and `lib/utils.ts` is client-only.
 */

/**
 * Quotes an identifier — a property key, a label or a relationship type — so it
 * can be interpolated into a query. Backticks inside are doubled, which is how
 * Cypher escapes them, so nothing in `name` can close the quoted span and open
 * a clause of its own.
 */
export const quoteCypherIdentifier = (name: string) => `\`${name.replace(/`/g, "``")}\``;
