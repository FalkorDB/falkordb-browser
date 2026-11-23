type CommandConnection = { sendCommand: (args: string[]) => Promise<unknown> };

/**
 * Runs `ACL GETUSER` as a raw command. node-redis's typed `aclGetUser()` parses the
 * reply by position and throws on Valkey 9.x (the default `falkordb/falkordb` server
 * since 6.2.0), which adds fields to the reply. Resolves to `null` for an unknown user
 * and rejects with `NOPERM` when the caller lacks ACL permissions.
 */
export default function aclGetUser(connection: CommandConnection, username: string): Promise<unknown> {
    return connection.sendCommand(["ACL", "GETUSER", username]);
}
