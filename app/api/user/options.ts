export interface CreateUser {
    username: string
    password: string
    role: string
}

export const ROLE = new Map<string, string[]>(
    [
        ["Admin", ["on", "~*", "&*", "+@all"]],
        ["Read-Write", ["on", "~*", "resetchannels", "-@all", "+graph.query", "+graph.ro_query", "+graph.explain", "+graph.list", "+ping", "+graph.profile", "+info"]],
        ["Read-Only", ["on", "~*", "resetchannels", "-@all", "+graph.ro_query", "+graph.explain", "+graph.list", "+ping", "+info"]]
    ]
)