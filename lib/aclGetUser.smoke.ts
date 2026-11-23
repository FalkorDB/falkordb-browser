// Smoke test for lib/aclGetUser.ts against a REAL FalkorDB server (Redis- or
// Valkey-based). Login role detection depends on it: the typed node-redis
// aclGetUser() crashes on Valkey 9.x replies, so every login failed on
// falkordb/falkordb:latest (6.2.0+). Gated like the other smoke tests:
//   * FALKORDB_SMOKE unset            → skipped.
//   * FALKORDB_SMOKE=1, cannot connect → FAIL.
//
// Run locally (connecting user must have ACL permissions, e.g. the default user):
//   docker run -d -p 6379:6379 falkordb/falkordb
//   FALKORDB_SMOKE=1 npm run test:smoke

import { test } from "node:test";
import assert from "node:assert/strict";
import { FalkorDB } from "falkordb";
import aclGetUser from "./aclGetUser.ts";

const ENABLED = process.env.FALKORDB_SMOKE === "1";
const URL = process.env.FALKORDB_URL ?? "redis://localhost:6379";

test(
    "aclGetUser detects admin, unknown and non-admin users on a live server",
    { skip: ENABLED ? false : "set FALKORDB_SMOKE=1 (and run a FalkorDB) to enable" },
    async () => {
        let db!: FalkorDB;
        try {
            db = await FalkorDB.connect({ url: URL });
        } catch (error) {
            assert.fail(`FALKORDB_SMOKE=1 but could not connect to ${URL}: ${(error as Error).message}`);
        }

        const connection = await db.connection;
        const limitedUser = `smoke_acl_${Date.now()}`;
        const limitedPassword = `pw_${Date.now()}`;
        let limitedDb: FalkorDB | undefined;
        try {
            const self = String(await connection.sendCommand(["ACL", "WHOAMI"]));
            const reply = await aclGetUser(connection, self);
            assert.ok(Array.isArray(reply) && reply.includes("flags"), `unexpected reply: ${JSON.stringify(reply)}`);

            assert.equal(await aclGetUser(connection, `${limitedUser}_missing`), null);

            await connection.sendCommand(["ACL", "SETUSER", limitedUser, "on", `>${limitedPassword}`, "~*", "+@all", "-@admin"]);
            const limitedUrl = new globalThis.URL(URL);
            limitedUrl.username = limitedUser;
            limitedUrl.password = limitedPassword;
            limitedDb = await FalkorDB.connect({ url: limitedUrl.toString() });
            const limitedConnection = await limitedDb.connection;
            await assert.rejects(aclGetUser(limitedConnection, limitedUser), { message: /^NOPERM/ });
        } finally {
            await limitedDb?.close();
            await connection.sendCommand(["ACL", "DELUSER", limitedUser]);
            await db.close();
        }
    }
);
