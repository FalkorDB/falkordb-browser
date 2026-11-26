import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextResponse } from "next/server.js";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__connectionInfoTestSession(request); }";

declare global {
    var __connectionInfoTestSession: ((request: Request) => Promise<unknown>) | undefined;
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") return { url: authModule, shortCircuit: true };
            if (specifier === "next/server") return nextResolve("next/server.js", context);
            if (specifier === "@/app/api/utils") return nextResolve(new URL("../utils.ts", import.meta.url).href, context);
        }
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
        if (url === routeUrl) {
            const source = ts.transpileModule(readFileSync(new URL(url), "utf8"), {
                fileName: fileURLToPath(url),
                compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, inlineSourceMap: true, inlineSources: true },
            }).outputText;
            return { format: "module", source, shortCircuit: true };
        }
        return nextLoad(url, context);
    },
});

const { GET } = await import("./route.ts");
const request = () => new Request("http://localhost/api/connection-info");
after(() => { delete globalThis.__connectionInfoTestSession; });

function session(info: string, replication: string, clusterNodes = "") {
    const commands: string[][] = [];
    globalThis.__connectionInfoTestSession = async () => ({
        client: {
            connection: Promise.resolve({
                info: async (section?: string) => section === "replication" ? replication : info,
                sendCommand: async (command: string[]) => { commands.push(command); return clusterNodes; },
            }),
        },
    });
    return commands;
}

test("reports cluster nodes, including IPv6, hostnames, roles and slots", async () => {
    const commands = session("redis_mode:cluster\r\n", "role:master\r\nconnected_slaves:0\r\n", [
        "id1 10.1.0.1:6379@16379,db.example master - 0 0 1 connected 0-8191",
        "id2 [2001:db8::1]:6380@16380 slave id1 0 0 2 connected",
        "id3 10.1.0.3:0@16381 master - 0 0 3 connected",
        "id4 10.1.0.4:6381@16381 handshake - 0 0 4 connected",
    ].join("\n"));
    const response = await GET(request());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { result: { clusterNodes: [
        { host: "db.example", port: 6379, role: "master", slots: "0-8191" },
        { host: "[2001:db8::1]", port: 6380, role: "slave" },
    ] } });
    assert.deepEqual(commands, [["CLUSTER", "NODES"]]);
});

test("reports standalone master and replica topology without cluster commands", async () => {
    const commands = session("redis_mode:standalone\n", "role:master\nconnected_slaves:2\n");
    const master = await GET(request());
    assert.deepEqual(await master.json(), { result: { sentinelRole: "master", sentinelReplicas: 2 } });
    assert.deepEqual(commands, []);
    session("redis_mode:standalone\r\n", "role:replica\r\nmaster_host:primary.example\r\nmaster_port:6380\r\n");
    const replica = await GET(request());
    assert.deepEqual(await replica.json(), { result: {
        sentinelRole: "replica", sentinelMasterHost: "primary.example", sentinelMasterPort: 6380,
    } });
    session("redis_mode:standalone\r\n", "role:master\r\nconnected_slaves:0\r\n");
    assert.deepEqual(await (await GET(request())).json(), { result: {} });
});

test("passes authentication errors through and reports connection failures", async (t) => {
    t.mock.method(console, "error", () => {});
    globalThis.__connectionInfoTestSession = async () => NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    assert.equal((await GET(request())).status, 401);
    globalThis.__connectionInfoTestSession = async () => { throw new Error("session failure"); };
    const failure = await GET(request());
    assert.equal(failure.status, 500);
    assert.deepEqual(await failure.json(), { message: "Internal server error" });
});

test("returns available topology when cluster details cannot be read", async (t) => {
    const errors: unknown[][] = [];
    t.mock.method(console, "error", (...args: unknown[]) => { errors.push(args); });
    const failure = new Error("cluster unavailable");
    globalThis.__connectionInfoTestSession = async () => ({
        client: { connection: Promise.resolve({
            info: async (section?: string) => section === "replication" ? "role:master\r\n" : "redis_mode:cluster\r\n",
            sendCommand: async () => { throw failure; },
        }) },
    });
    const response = await GET(request());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { result: {} });
    assert.ok(errors.some(([message, error]) => message === "Failed to get cluster details:" && error === failure));
});
