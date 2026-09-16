import test from "node:test";
import assert from "node:assert/strict";
import {
    parsePreconfiguredUrl,
    readPreconfiguredConnection,
    toPreconfiguredConnectionInfo,
    DEFAULT_PRECONFIGURED_HOST,
    DEFAULT_PRECONFIGURED_PORT,
} from "./preconfiguredConnection.ts";

test("no connection is configured when neither url nor host is set", () => {
    assert.equal(readPreconfiguredConnection({}), null);
    assert.equal(readPreconfiguredConnection({ FALKORDB_PORT: "6380" }), null);
    assert.equal(readPreconfiguredConnection({ FALKORDB_HOST: "   " }), null);
});

test("discrete vars build a connection and default the rest", () => {
    const conn = readPreconfiguredConnection({ FALKORDB_HOST: "db.internal" });

    assert.deepEqual(conn, {
        host: "db.internal",
        port: DEFAULT_PRECONFIGURED_PORT,
        username: "default",
        password: "",
        tls: false,
        ca: undefined,
        autoConnect: true,
    });
});

test("a connection url supplies every field", () => {
    const conn = readPreconfiguredConnection({
        FALKORDB_CONNECTION_URL: "falkors://alice:s3cr3t@db.internal:6380",
    });

    assert.deepEqual(conn, {
        host: "db.internal",
        port: 6380,
        username: "alice",
        password: "s3cr3t",
        tls: true,
        ca: undefined,
        autoConnect: true,
    });
});

test("discrete vars override the url so one field can be patched in isolation", () => {
    const conn = readPreconfiguredConnection({
        FALKORDB_CONNECTION_URL: "falkor://alice:s3cr3t@db.internal:6380",
        FALKORDB_HOST: "other.internal",
        FALKORDB_PORT: "6381",
        FALKORDB_USERNAME: "bob",
        FALKORDB_PASSWORD: "hunter2",
        FALKORDB_TLS: "true",
    });

    assert.equal(conn?.host, "other.internal");
    assert.equal(conn?.port, 6381);
    assert.equal(conn?.username, "bob");
    assert.equal(conn?.password, "hunter2");
    assert.equal(conn?.tls, true);
});

test("an empty password env var is honoured rather than falling back to the url", () => {
    const conn = readPreconfiguredConnection({
        FALKORDB_CONNECTION_URL: "falkor://alice:s3cr3t@db.internal",
        FALKORDB_PASSWORD: "",
    });

    assert.equal(conn?.password, "");
});

test("auto connect is on by default and can be turned off", () => {
    assert.equal(readPreconfiguredConnection({ FALKORDB_HOST: "db" })?.autoConnect, true);
    assert.equal(
        readPreconfiguredConnection({ FALKORDB_HOST: "db", FALKORDB_AUTO_CONNECT: "false" })?.autoConnect,
        false
    );
    assert.equal(
        readPreconfiguredConnection({ FALKORDB_HOST: "db", FALKORDB_AUTO_CONNECT: "0" })?.autoConnect,
        false
    );
});

test("malformed operator input throws instead of guessing", () => {
    assert.throws(
        () => readPreconfiguredConnection({ FALKORDB_HOST: "db", FALKORDB_PORT: "0" }),
        /FALKORDB_PORT/
    );
    assert.throws(
        () => readPreconfiguredConnection({ FALKORDB_HOST: "db", FALKORDB_PORT: "not-a-port" }),
        /FALKORDB_PORT/
    );
    assert.throws(
        () => readPreconfiguredConnection({ FALKORDB_HOST: "db", FALKORDB_TLS: "maybe" }),
        /FALKORDB_TLS/
    );
    assert.throws(
        () => readPreconfiguredConnection({ FALKORDB_CONNECTION_URL: "postgres://db:5432" }),
        /falkor:\/\//
    );
    assert.throws(() => readPreconfiguredConnection({ FALKORDB_CONNECTION_URL: "falkor://" }), /missing a host/);
});

test("url parsing handles credentials, escaping and a trailing database path", () => {
    assert.deepEqual(parsePreconfiguredUrl("redis://db.internal:6379/0"), {
        host: "db.internal",
        port: 6379,
        username: undefined,
        password: undefined,
        tls: false,
    });

    // A password may contain "@" and percent-escapes.
    assert.deepEqual(parsePreconfiguredUrl("falkor://alice:p%40ss%3Aword@db.internal"), {
        host: "db.internal",
        port: undefined,
        username: "alice",
        password: "p@ss:word",
        tls: false,
    });

    // Username with no password.
    assert.equal(parsePreconfiguredUrl("falkor://alice@db.internal").password, undefined);

    // No scheme at all still parses; TLS is then left to FALKORDB_TLS.
    assert.equal(parsePreconfiguredUrl("db.internal:6380").tls, undefined);
});

test("a url without a host falls back to the default host", () => {
    const conn = readPreconfiguredConnection({ FALKORDB_HOST: DEFAULT_PRECONFIGURED_HOST });
    assert.equal(conn?.host, DEFAULT_PRECONFIGURED_HOST);
});

test("the public info shape never carries the password or ca", () => {
    const conn = readPreconfiguredConnection({
        FALKORDB_CONNECTION_URL: "falkors://alice:s3cr3t@db.internal:6380",
        FALKORDB_CA: "LS0tLS1CRUdJTg==",
    });

    const info = toPreconfiguredConnectionInfo(conn);

    assert.deepEqual(info, {
        configured: true,
        autoConnect: true,
        host: "db.internal",
        port: 6380,
        username: "alice",
        tls: true,
    });
    assert.equal(JSON.stringify(info).includes("s3cr3t"), false);
    assert.equal(JSON.stringify(info).includes("LS0tLS1CRUdJTg=="), false);
});

test("the public info shape reports nothing when unconfigured", () => {
    assert.deepEqual(toPreconfiguredConnectionInfo(null), { configured: false, autoConnect: false });
});
