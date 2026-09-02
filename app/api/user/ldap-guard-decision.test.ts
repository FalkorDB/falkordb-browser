import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import type { FalkorDB } from "falkordb";
import resolveLdapRejection, {
    LDAP_MANAGED_MESSAGE,
    LDAP_PROBE_FAILED_MESSAGE,
} from "./ldap-guard-decision.ts";

function makeClient(configGet: () => Promise<Record<string, unknown>>): FalkorDB {
    return { connection: Promise.resolve({ configGet }) } as unknown as FalkorDB;
}

describe("resolveLdapRejection", () => {
    it("lets the write through on a community deployment", async () => {
        const client = makeClient(async () => ({}));

        assert.equal(await resolveLdapRejection(client), null);
    });

    it("lets the write through when the parameter is present but empty", async () => {
        const client = makeClient(async () => ({ "falkordbe.ldap_servers": "" }));

        assert.equal(await resolveLdapRejection(client), null);
    });

    it("refuses the write when LDAP servers are configured", async () => {
        const client = makeClient(async () => ({
            "falkordbe.ldap_servers": "ldap://ldap.example.com:389",
        }));

        assert.deepEqual(await resolveLdapRejection(client), {
            status: 403,
            message: LDAP_MANAGED_MESSAGE,
        });
    });

    it("fails closed when the probe throws", async () => {
        const client = makeClient(async () => {
            throw new Error("CONFIG GET failed");
        });
        const consoleError = mock.method(console, "error", () => { });

        try {
            assert.deepEqual(await resolveLdapRejection(client), {
                status: 502,
                message: LDAP_PROBE_FAILED_MESSAGE,
            });
            assert.equal(consoleError.mock.callCount(), 1);
        } finally {
            consoleError.mock.restore();
        }
    });
});
