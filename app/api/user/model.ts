export interface User{
    username: string
    role: string
}

export interface CreateUser {
    username: string
    password: string
    role: string
}

export const ROLE = new Map<string, string[]>(
    [
        ["Admin", ["on", "~*", "&*", "+@all"]],
        ["Read-Write", ["on", "~*", "resetchannels", "-@all", "+graph.explain", "+graph.list", "+ping", "+graph.ro_query", "+info", "+dump", "+graph.delete", "+graph.query", "+graph.profile"]],
        ["Read-Only", ["on", "~*", "resetchannels", "-@all", "+graph.explain", "+graph.list", "+ping", "+graph.ro_query", "+info", "+dump"]]
    ]
)