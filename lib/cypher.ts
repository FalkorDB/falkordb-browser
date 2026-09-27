/**
 * Quoting for the parts of a Cypher query that cannot travel as parameters.
 *
 * Deliberately dependency-free: it is used from API routes as well as from the
 * client, and `lib/utils.ts` is client-only.
 */

/**
 * Quotes an identifier — a property key, a label or a relationship type — so it
 * can be interpolated into a query. Backticks inside are doubled so nothing in
 * `name` can close the quoted span and open a clause of its own. FalkorDB has
 * no escape for a literal backtick, so such a name fails to parse rather than
 * injecting.
 */
export const quoteCypherIdentifier = (name: string) => `\`${name.replace(/`/g, "``")}\``;
