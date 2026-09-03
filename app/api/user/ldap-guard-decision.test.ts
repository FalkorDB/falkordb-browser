import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import type { FalkorDB } from "falkordb";
import resolveLdapRejection, {
    LDAP_MANAGED_MESSAGE,
    LDAP_PROBE_FAILED_MESSAGE,
} from "./ldap-guard-decision.ts";

function makeClient(configGet: () => Promise<Record<string, unknown>>) {
    const params: string[] = [];
    const client = {
        connection: Promise.resolve({
            configGet: (param: string) => {
                params.push(param);
                return configGet();
            },
        }),
    } as unknown as FalkorDB;

    // Spelled out rather than imported: the point is to catch the guard probing
    // a different parameter than the one FalkorDB Enterprise registers.
    const assertProbedLdapServers = () => assert.deepEqual(params, ["falkordbe.ldap_servers"]);

    return { client, assertProbedLdapServers };
}

describe("resolveLdapRejection", () => {
    it("lets the write through on a community deployment", async () => {
        const { client, assertProbedLdapServers } = makeClient(async () => ({}));

        assert.equal(await resolveLdapRejection(client), null);
        assertProbedLdapServers();
    });

    it("lets the write through when the parameter is present but empty", async () => {
        const { client, assertProbedLdapServers } = makeClient(async () => ({ "falkordbe.ldap_servers": "" }));

        assert.equal(await resolveLdapRejection(client), null);
        assertProbedLdapServers();
    });

    it("refuses the write when LDAP servers are configured", async () => {
        const { client, assertProbedLdapServers } = makeClient(async () => ({
            "falkordbe.ldap_servers": "ldap://ldap.example.com:389",
        }));

        assert.deepEqual(await resolveLdapRejection(client), {
            status: 403,
            message: LDAP_MANAGED_MESSAGE,
        });
        assertProbedLdapServers();
    });

    it("fails closed when the probe throws", async () => {
        const { client } = makeClient(async () => {
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
