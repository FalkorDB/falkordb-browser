// Prepares a generated Cypher query for display in the Chat panel.
//
// LLMs sometimes leave a bare "cypher" fence-language tag in front of the
// query (residue of a ```cypher code block). Strip that, but never touch a
// FalkorDB parameter header such as `CYPHER name='x' MATCH ...` — the CYPHER
// keyword is mandatory there and removing it makes the query unparseable
// ("Invalid input 'o': expected SET or START").

const PARAMETER_HEADER = /^[A-Za-z_][A-Za-z0-9_]*\s*=/;

export function stripCypherFenceTag(query: string): string {
    const match = /^cypher\s+/i.exec(query);
    if (!match) return query;

    const rest = query.slice(match[0].length);
    // A parameter header (`name=value ...`) needs the CYPHER prefix to stay;
    // anything else (MATCH, FOREACH, LOAD CSV, EXPLAIN, ...) is fence residue.
    return PARAMETER_HEADER.test(rest) ? query : rest;
}
