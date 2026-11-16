import { afterEach, beforeEach, describe, it, mock, test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { existsSync, promises as fs } from "node:fs";
import os, { tmpdir } from "node:os";
import path, { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { once } from "node:events";
import FileTokenStorage from "./FileTokenStorage.ts";
import type { TokenData } from "./ITokenStorage.ts";

const execute = promisify(execFile);

const FUTURE = 4102444800; // 2100-01-01
const PAST = 1;

const makeToken = (overrides: Partial<TokenData> = {}): TokenData => ({
    token_hash: "hash-default",
    token_id: "id-default",
    user_id: "user-1",
    username: "alice",
    name: "token",
    role: "Admin",
    host: "localhost",
    port: 6379,
    created_at: 1000,
    expires_at: -1,
    last_used: -1,
    is_active: true,
    encrypted_password: "enc",
    ...overrides,
});

const readFileTokens = async (filePath: string): Promise<TokenData[]> =>
    JSON.parse(await fs.readFile(filePath, "utf8")).tokens;

// Fails only token snapshot publication (temp file -> token file), not lock release renames.
const failSnapshotRename = (mocker: { method: typeof mock.method }, failing = () => true) => {
    const rename = fs.rename;
    return mocker.method(fs, "rename", async (from: Parameters<typeof fs.rename>[0], to: Parameters<typeof fs.rename>[1]) => {
        if (String(from).endsWith(".tmp") && failing()) throw new Error("rename failed");
        return rename(from, to);
    });
};

describe("FileTokenStorage", () => {
    let dir: string;
    let filePath: string;
    let storage: FileTokenStorage;

    beforeEach(async () => {
        dir = await fs.mkdtemp(join(tmpdir(), "fts-"));
        filePath = join(dir, "nested", "tokens.json");
        storage = new FileTokenStorage(filePath);
        mock.method(console, "error", () => {});
    });

    afterEach(async () => {
        mock.restoreAll();
        await fs.rm(dir, { recursive: true, force: true });
    });

    describe("constructor path resolution", () => {
        it("uses API_TOKEN_STORAGE_PATH when no path is given", async () => {
            const envPath = join(dir, "env-tokens.json");
            const previous = process.env.API_TOKEN_STORAGE_PATH;
            process.env.API_TOKEN_STORAGE_PATH = envPath;
            try {
                await new FileTokenStorage().createToken(makeToken());
            } finally {
                if (previous === undefined) delete process.env.API_TOKEN_STORAGE_PATH;
                else process.env.API_TOKEN_STORAGE_PATH = previous;
            }
            assert.equal((await readFileTokens(envPath)).length, 1);
        });

        it("falls back to .data/api_tokens.json under the cwd", async () => {
            const previous = process.env.API_TOKEN_STORAGE_PATH;
            const cwd = process.cwd();
            delete process.env.API_TOKEN_STORAGE_PATH;
            process.chdir(dir);
            try {
                await new FileTokenStorage().createToken(makeToken());
            } finally {
                process.chdir(cwd);
                if (previous !== undefined) process.env.API_TOKEN_STORAGE_PATH = previous;
            }
            const tokens = await readFileTokens(join(dir, ".data", "api_tokens.json"));
            assert.equal(tokens[0].token_id, "id-default");
        });
    });

    describe("createToken / fetchTokenById", () => {
        it("persists the token and returns it by id", async () => {
            const token = makeToken({ token_id: "a", tls: true, ca: "Y2E=" });
            await storage.createToken(token);

            assert.deepEqual(await readFileTokens(filePath), [token]);
            assert.deepEqual(await new FileTokenStorage(filePath).fetchTokenById("a"), token);
        });

        it("returns null for an unknown id", async () => {
            assert.equal(await storage.fetchTokenById("missing"), null);
        });

        it("returns inactive tokens by id", async () => {
            await storage.createToken(makeToken({ token_id: "a", is_active: false }));
            assert.equal((await storage.fetchTokenById("a"))?.is_active, false);
        });

        it("creates the file with owner-only permissions and tightens existing ones", async (t) => {
            await storage.createToken(makeToken());
            if (process.platform === "win32") {
                t.diagnostic("POSIX permission bits are not enforced on Windows");
                return;
            }
            assert.equal((await fs.stat(filePath)).mode & 0o777, 0o600);
            assert.equal((await fs.stat(join(dir, "nested"))).mode & 0o777, 0o700);

            // A read ensures the file without rewriting it, so only the chmod branch can restore 0600.
            await fs.chmod(filePath, 0o644);
            await storage.fetchTokenById("id-default");
            assert.equal((await fs.stat(filePath)).mode & 0o777, 0o600);

            await fs.chmod(filePath, 0o644);
            await storage.createToken(makeToken({ token_id: "b" }));
            assert.equal((await fs.stat(filePath)).mode & 0o777, 0o600);
        });

        it("persists all tokens from concurrent creates", async () => {
            const ids = Array.from({ length: 25 }, (_, i) => `id-${i}`);
            await Promise.all(ids.map((id) => storage.createToken(makeToken({ token_id: id }))));

            const persisted = (await readFileTokens(filePath)).map((x) => x.token_id).sort();
            assert.deepEqual(persisted, [...ids].sort());
        });
    });

    describe("fetchTokens", () => {
        const seed = async () => {
            await storage.createToken(makeToken({ token_id: "old", username: "alice", created_at: 100 }));
            await storage.createToken(makeToken({ token_id: "new", username: "alice", created_at: 300 }));
            await storage.createToken(makeToken({ token_id: "mid", username: "bob", created_at: 200 }));
            await storage.createToken(makeToken({ token_id: "inactive", username: "alice", is_active: false }));
            await storage.createToken(makeToken({ token_id: "session", username: "alice", kind: "session" }));
            await storage.createToken(makeToken({ token_id: "explicit-pat", username: "alice", kind: "pat", created_at: 50 }));
            await storage.createToken(makeToken({ token_id: "other-host", username: "alice", host: "db.example", created_at: 400 }));
            await storage.createToken(makeToken({ token_id: "other-port", username: "alice", port: 7000, created_at: 500 }));
        };

        it("returns every active PAT on the admin's endpoint, newest first", async () => {
            await seed();
            const ids = (await storage.fetchTokens({ isAdmin: true })).map((x) => x.token_id);
            assert.deepEqual(ids, ["new", "mid", "old", "explicit-pat"]);
            const remote = await storage.fetchTokens({ isAdmin: true, host: "db.example" });
            assert.deepEqual(remote.map((x) => x.token_id), ["other-host"]);
        });

        it("limits non-admins to their own user/host/port, defaulting to localhost:6379", async () => {
            await seed();
            const ids = (await storage.fetchTokens({ isAdmin: false, username: "alice" })).map((x) => x.token_id);
            assert.deepEqual(ids, ["new", "old", "explicit-pat"]);
        });

        it("honors explicit host and port for non-admins", async () => {
            await seed();
            const byHost = await storage.fetchTokens({ isAdmin: false, username: "alice", host: "db.example" });
            assert.deepEqual(byHost.map((x) => x.token_id), ["other-host"]);

            const byPort = await storage.fetchTokens({ isAdmin: false, username: "alice", port: 7000 });
            assert.deepEqual(byPort.map((x) => x.token_id), ["other-port"]);
        });

        it("returns nothing for a non-admin without a matching username", async () => {
            await seed();
            assert.deepEqual(await storage.fetchTokens({ isAdmin: false }), []);
        });
    });

    describe("revokeToken", () => {
        it("deactivates an existing token and persists it", async () => {
            await storage.createToken(makeToken({ token_id: "a" }));
            await storage.createToken(makeToken({ token_id: "b" }));

            assert.equal(await storage.revokeToken("a", "alice"), true);

            const persisted = await readFileTokens(filePath);
            assert.equal(persisted.find((x) => x.token_id === "a")?.is_active, false);
            assert.equal(persisted.find((x) => x.token_id === "b")?.is_active, true);
            assert.deepEqual((await storage.fetchTokens({ isAdmin: true })).map((x) => x.token_id), ["b"]);
        });

        it("returns false for an unknown token and leaves the file untouched", async () => {
            await storage.createToken(makeToken({ token_id: "a" }));
            const before = await fs.readFile(filePath, "utf8");

            assert.equal(await storage.revokeToken("missing", "alice"), false);
            assert.equal(await fs.readFile(filePath, "utf8"), before);
        });
    });

    describe("deleteToken", () => {
        it("removes an existing token", async () => {
            await storage.createToken(makeToken({ token_id: "a" }));
            await storage.createToken(makeToken({ token_id: "b" }));

            assert.equal(await storage.deleteToken("a"), true);
            assert.deepEqual((await readFileTokens(filePath)).map((x) => x.token_id), ["b"]);
        });

        it("returns false for an unknown token and leaves the file untouched", async () => {
            await storage.createToken(makeToken({ token_id: "a" }));
            const before = await fs.readFile(filePath, "utf8");

            assert.equal(await storage.deleteToken("missing"), false);
            assert.equal(await fs.readFile(filePath, "utf8"), before);
        });
    });

    describe("updateLastUsed", () => {
        it("stamps last_used with the current unix time", async (t) => {
            await storage.createToken(makeToken({ token_id: "a" }));
            await storage.createToken(makeToken({ token_id: "b" }));

            // Only Date is mocked so the read-retry setTimeout stays real.
            t.mock.timers.enable({ apis: ["Date"], now: 1_700_000_123_999 });
            await storage.updateLastUsed("a");

            assert.equal((await storage.fetchTokenById("a"))?.last_used, 1_700_000_123);
            assert.equal((await storage.fetchTokenById("b"))?.last_used, -1);
        });

        it("ignores an unknown token and leaves the file untouched", async () => {
            await storage.createToken(makeToken({ token_id: "a" }));
            const before = await fs.readFile(filePath, "utf8");

            await storage.updateLastUsed("missing");
            assert.equal(await fs.readFile(filePath, "utf8"), before);
        });
    });

    describe("isTokenActive", () => {
        it("is true for an active, never-expiring token", async () => {
            await storage.createToken(makeToken({ token_hash: "h", expires_at: -1 }));
            assert.equal(await storage.isTokenActive("h"), true);
        });

        it("is true for an active token that expires in the future", async () => {
            await storage.createToken(makeToken({ token_hash: "h", expires_at: FUTURE }));
            assert.equal(await storage.isTokenActive("h"), true);
        });

        it("is false for an expired token", async () => {
            await storage.createToken(makeToken({ token_hash: "h", expires_at: PAST }));
            assert.equal(await storage.isTokenActive("h"), false);
        });

        it("is false for a revoked token", async () => {
            await storage.createToken(makeToken({ token_hash: "h", token_id: "a" }));
            await storage.revokeToken("a", "alice");
            assert.equal(await storage.isTokenActive("h"), false);
        });

        it("is false for an unknown hash", async () => {
            await storage.createToken(makeToken({ token_hash: "h" }));
            assert.equal(await storage.isTokenActive("other"), false);
        });
    });

    describe("getEncryptedPassword", () => {
        it("returns the password of an active token", async () => {
            await storage.createToken(makeToken({ token_id: "a", encrypted_password: "secret" }));
            assert.equal(await storage.getEncryptedPassword("a"), "secret");
        });

        it("returns null for inactive, unknown and password-less tokens", async () => {
            await storage.createToken(makeToken({ token_id: "revoked", encrypted_password: "secret", is_active: false }));
            await storage.createToken(makeToken({ token_id: "empty", encrypted_password: "" }));

            assert.equal(await storage.getEncryptedPassword("revoked"), null);
            assert.equal(await storage.getEncryptedPassword("missing"), null);
            assert.equal(await storage.getEncryptedPassword("empty"), null);
        });
    });

    describe("fetchTokensByUserId", () => {
        const seed = async () => {
            await storage.createToken(makeToken({ token_id: "pat", user_id: "u1", created_at: 100 }));
            await storage.createToken(makeToken({ token_id: "session", user_id: "u1", kind: "session", created_at: 300 }));
            await storage.createToken(makeToken({ token_id: "legacy", user_id: "u1", created_at: 200, expires_at: FUTURE }));
            await storage.createToken(makeToken({ token_id: "expired", user_id: "u1", expires_at: PAST }));
            await storage.createToken(makeToken({ token_id: "revoked", user_id: "u1", is_active: false }));
            await storage.createToken(makeToken({ token_id: "other-user", user_id: "u2" }));
        };

        it("returns a user's active, unexpired tokens of every kind, newest first", async () => {
            await seed();
            const ids = (await storage.fetchTokensByUserId("u1")).map((x) => x.token_id);
            assert.deepEqual(ids, ["session", "legacy", "pat"]);
        });

        it("filters by kind, treating a missing kind as pat", async () => {
            await seed();
            assert.deepEqual((await storage.fetchTokensByUserId("u1", "session")).map((x) => x.token_id), ["session"]);
            assert.deepEqual((await storage.fetchTokensByUserId("u1", "pat")).map((x) => x.token_id), ["legacy", "pat"]);
        });

        it("returns nothing for an unknown user", async () => {
            await seed();
            assert.deepEqual(await storage.fetchTokensByUserId("nobody"), []);
        });
    });

    describe("cleanupExpiredTokens", () => {
        it("removes only expired tokens and reports the count", async () => {
            await storage.createToken(makeToken({ token_id: "expired-1", expires_at: PAST }));
            await storage.createToken(makeToken({ token_id: "expired-2", expires_at: PAST, is_active: false }));
            await storage.createToken(makeToken({ token_id: "never", expires_at: -1 }));
            await storage.createToken(makeToken({ token_id: "future", expires_at: FUTURE }));
            await storage.createToken(makeToken({ token_id: "revoked", expires_at: -1, is_active: false }));

            assert.equal(await storage.cleanupExpiredTokens(), 2);
            assert.deepEqual((await readFileTokens(filePath)).map((x) => x.token_id), ["never", "future", "revoked"]);
        });

        it("returns 0 and leaves the file untouched when nothing expired", async () => {
            await storage.createToken(makeToken({ token_id: "never" }));
            const before = await fs.readFile(filePath, "utf8");

            assert.equal(await storage.cleanupExpiredTokens(), 0);
            assert.equal(await fs.readFile(filePath, "utf8"), before);
        });
    });

    describe("file robustness", () => {
        it("fails reads closed and logs when the file has no tokens array or stays unparseable", async () => {
            await fs.mkdir(join(dir, "nested"));
            for (const contents of ["{}", "{not json"]) {
                await fs.writeFile(filePath, contents);

                await assert.rejects(storage.fetchTokens({ isAdmin: true }), /Failed to read token storage/);
                assert.equal(await fs.readFile(filePath, "utf8"), contents);
                const calls = (console.error as unknown as ReturnType<typeof mock.fn>).mock.calls;
                assert.equal(calls.at(-1)?.arguments[0], "Failed to read tokens from file after retries:");
            }
        });

        it("throws when the storage directory cannot be created", async () => {
            const blocker = join(dir, "blocker");
            await fs.writeFile(blocker, "");
            const broken = new FileTokenStorage(join(blocker, "tokens.json"));

            await assert.rejects(broken.createToken(makeToken()), /Failed to initialize token storage file/);
        });

        it("rejects a failed atomic replacement without a direct write, keeping the previous snapshot", async () => {
            await storage.createToken(makeToken({ token_id: "existing" }));
            const before = await fs.readFile(filePath, "utf8");
            const rename = failSnapshotRename(mock);

            await assert.rejects(storage.createToken(makeToken({ token_id: "a" })), /Failed to save tokens/);

            assert.equal(rename.mock.calls.filter((c) => String(c.arguments[0]).endsWith(".tmp")).length, 1);
            assert.equal(await fs.readFile(filePath, "utf8"), before);
            assert.deepEqual(await fs.readdir(join(dir, "nested")), ["tokens.json"]);
            rename.mock.restore();
            await storage.revokeToken("existing", "alice");
            assert.equal(await storage.isTokenActive("hash-default"), false);
        });

        it("logs a failing temp-file cleanup and still rejects the write", async () => {
            failSnapshotRename(mock);
            mock.method(fs, "unlink", async () => {
                throw new Error("unlink failed");
            });

            await assert.rejects(storage.createToken(makeToken({ token_id: "a" })), /Failed to save tokens/);
            const calls = (console.error as unknown as ReturnType<typeof mock.fn>).mock.calls;
            assert.ok(calls.some((c) => c.arguments[0] === "Failed to clean up token storage temp file:"));
        });

        it("rejects while a directory squats on the token path, and keeps serving later calls", async () => {
            await storage.createToken(makeToken({ token_id: "a" }));
            await fs.rm(filePath);
            await fs.mkdir(filePath);

            await assert.rejects(storage.createToken(makeToken({ token_id: "b" })), /Failed to read token storage/);

            await fs.rm(filePath, { recursive: true });
            await storage.createToken(makeToken({ token_id: "c" }));
            assert.deepEqual((await readFileTokens(filePath)).map((x) => x.token_id), ["c"]);
        });
    });
});

function token(id: string): TokenData {
    return {
        token_id: id, token_hash: `hash:${id}`, user_id: "fixture",
        username: "fixture", name: id, role: "Read-Only",
        host: "localhost", port: 6379, created_at: 1, expires_at: -1,
        last_used: -1, is_active: true, encrypted_password: "", kind: "pat",
    };
}

test("independent processes serialize token snapshots without losing revocations or creations", async (t) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-lock-test-"));
    t.after(async () => {
        for (const name of await fs.readdir(dir)) await fs.unlink(path.join(dir, name));
        await fs.rmdir(dir);
    });
    const file = path.join(dir, "tokens.json");
    const storage = new FileTokenStorage(file);
    await storage.createToken(token("revoked"));
    const worker = `
        import FileTokenStorage from ${JSON.stringify(new URL("./FileTokenStorage.ts", import.meta.url).href)};
        const store = new FileTokenStorage(process.argv[1]);
        const template = JSON.parse(process.argv[3]);
        for (let i = 0; i < 10; i++) {
            const id = process.argv[2] + ":" + i;
            await store.createToken({ ...template, token_id: id, token_hash: id });
            await store.updateLastUsed("revoked");
        }
    `;
    await Promise.all([
        ...["a", "b", "c"].map(id => execute(process.execPath, [
            "--input-type=module", "-e", worker, file, id, JSON.stringify(token("template")),
        ], { timeout: 20_000 })),
        storage.revokeToken("revoked", "fixture"),
    ]);
    assert.equal(await storage.isTokenActive("hash:revoked"), false);
    const data = JSON.parse(await fs.readFile(file, "utf8")) as { tokens: TokenData[] };
    assert.equal(data.tokens.length, 31);
    assert.equal(new Set(data.tokens.map(row => row.token_id)).size, 31);
    assert.equal((await fs.readdir(dir)).some(name => name.endsWith(".lock") || name.endsWith(".tmp")), false);
});

test("concurrent first use never truncates an existing token file", async (t) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-init-test-"));
    t.after(async () => {
        for (const name of await fs.readdir(dir)) await fs.unlink(path.join(dir, name));
        await fs.rmdir(dir);
    });
    const file = path.join(dir, "tokens.json");
    await Promise.all(Array.from({ length: 10 }, (_, i) =>
        new FileTokenStorage(file).createToken(token(String(i)))));
    assert.equal((JSON.parse(await fs.readFile(file, "utf8")) as { tokens: TokenData[] }).tokens.length, 10);
});

test("paused first-use initialization never exposes a partial snapshot to another process", async (t) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-paused-init-test-"));
    const file = path.join(dir, "tokens.json");
    t.after(async () => {
        for (const name of await fs.readdir(dir)) await fs.unlink(path.join(dir, name));
        await fs.rmdir(dir);
    });
    const worker = `
        import { promises as fs } from "node:fs";
        import FileTokenStorage from ${JSON.stringify(new URL("./FileTokenStorage.ts", import.meta.url).href)};
        const writeFile = fs.writeFile;
        let first = true;
        fs.writeFile = async (target, content, options) => {
            if (!first || !String(target).endsWith(".tmp")) return writeFile(target, content, options);
            first = false;
            await writeFile(target, "", options);
            process.stdout.write("initializing\\n");
            await new Promise(resolve => process.stdin.once("data", resolve));
            process.stdin.pause();
            return writeFile(target, content, { ...options, flag: "w" });
        };
        await new FileTokenStorage(process.argv[1]).createToken(JSON.parse(process.argv[2]));
    `;
    const initializer = execute(process.execPath, [
        "--input-type=module", "-e", worker, file, JSON.stringify(token("first")),
    ], { timeout: 10_000 });
    const { stdout, stdin } = initializer.child;
    assert.ok(stdout && stdin);
    const initialized = once(stdout, "data");
    const completed = initializer.then(() => undefined);
    await Promise.race([initialized, completed.then(() => { throw new Error("Initializer exited before pausing"); })]);
    let competingWrite: Promise<void> | undefined;
    let competingRead: Promise<TokenData | null> | undefined;
    try {
        const attemptedLock = Promise.withResolvers<void>();
        const rename = fs.rename;
        t.mock.method(fs, "rename", async (from: Parameters<typeof fs.rename>[0], to: Parameters<typeof fs.rename>[1]) => {
            if (to === `${file}.lock`) attemptedLock.resolve();
            return rename(from, to);
        });
        const competingStorage = new FileTokenStorage(file);
        competingWrite = competingStorage.createToken(token("second"));
        competingRead = competingStorage.fetchTokenById("first");
        await attemptedLock.promise;
        await assert.rejects(fs.readFile(file, "utf8"), { code: "ENOENT" });
    } finally {
        stdin.end("continue");
        await completed;
        await Promise.all([competingWrite, competingRead]);
    }
    const storage = new FileTokenStorage(file);
    assert.ok(await storage.fetchTokenById("first"));
    assert.ok(await storage.fetchTokenById("second"));
    assert.deepEqual(await fs.readdir(dir), ["tokens.json"]);
});

test("corrupt storage rejects writes instead of replacing all records with an empty snapshot", async (t) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-corrupt-test-"));
    const file = path.join(dir, "tokens.json");
    t.after(async () => { await fs.unlink(file); await fs.rmdir(dir); });
    t.mock.method(console, "error", () => {});
    for (const contents of ["not json", '{"other":[]}']) {
        await fs.writeFile(file, contents);
        await assert.rejects(new FileTokenStorage(file).createToken(token("new")), /Failed to read token storage/);
        assert.equal(await fs.readFile(file, "utf8"), contents);
    }
});

test("initial publication failure releases the lock and allows a later initialization", async (t) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-init-failure-test-"));
    const file = path.join(dir, "tokens.json");
    t.after(async () => {
        for (const name of await fs.readdir(dir)) await fs.unlink(path.join(dir, name));
        await fs.rmdir(dir);
    });
    t.mock.method(console, "error", () => {});
    const rename = failSnapshotRename(t.mock);
    const storage = new FileTokenStorage(file);
    await assert.rejects(storage.createToken(token("first")), /Failed to save tokens/);
    assert.deepEqual(await fs.readdir(dir), []);
    rename.mock.restore();
    assert.equal(await storage.fetchTokenById("first"), null);
    await storage.createToken(token("second"));
    assert.ok(await storage.fetchTokenById("second"));
});

test("a token file removed while the lock is held is recreated without queueing a nested lock", async (t) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-removed-test-"));
    const file = path.join(dir, "tokens.json");
    t.after(async () => { await fs.rm(dir, { recursive: true, force: true }); });
    const storage = new FileTokenStorage(file);
    await storage.createToken(token("lost"));
    const chmod = fs.chmod;
    let fileChecks = 0;
    t.mock.method(fs, "chmod", async (name: Parameters<typeof fs.chmod>[0], mode: Parameters<typeof fs.chmod>[1]) => {
        if (name === file) {
            fileChecks += 1;
            // Check 1 runs when the lock is taken; check 2 is the locked read inside createToken.
            if (fileChecks === 2) await fs.unlink(file);
        }
        return chmod(name, mode);
    });
    await storage.createToken(token("after"));
    const { tokens } = JSON.parse(await fs.readFile(file, "utf8")) as { tokens: TokenData[] };
    assert.deepEqual(tokens.map(row => row.token_id), ["after"]);
});

for (const target of ["directory", "file"] as const) {
    test(`storage ${target} permission failures are explicit and preserve records`, async (t) => {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-permission-test-"));
        const file = path.join(dir, "tokens.json");
        t.after(async () => { await fs.unlink(file); await fs.rmdir(dir); });
        const storage = new FileTokenStorage(file);
        await storage.createToken(token("existing"));
        const before = await fs.readFile(file, "utf8");
        const log = t.mock.method(console, "error", () => {});
        const chmod = fs.chmod;
        const deniedPath = target === "directory" ? dir : file;
        t.mock.method(fs, "chmod", async (name: Parameters<typeof fs.chmod>[0], mode: Parameters<typeof fs.chmod>[1]) => {
            if (name === deniedPath) throw Object.assign(new Error("permission denied"), { code: "EACCES" });
            return chmod(name, mode);
        });
        await assert.rejects(storage.fetchTokenById("existing"), /Failed to initialize token storage file/);
        assert.equal(await fs.readFile(file, "utf8"), before);
        assert.equal(log.mock.callCount(), 1);
    });
}

test("admin and non-admin listings stay scoped to the endpoint with case-insensitive hosts", async (t) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-list-test-"));
    const file = path.join(dir, "tokens.json");
    t.after(async () => { await fs.unlink(file); await fs.rmdir(dir); });
    const storage = new FileTokenStorage(file);
    for (const row of [
        { ...token("own") },
        { ...token("other-user"), username: "other" },
        { ...token("other-host"), host: "remote.example" },
        { ...token("other-port"), port: 6380 },
        { ...token("session"), kind: "session" as const },
    ]) await storage.createToken(row);
    for (const host of ["localhost", "LOCALHOST"]) {
        assert.deepEqual((await storage.fetchTokens({ isAdmin: true, host, port: 6379 }))
            .map(row => row.token_id).sort(), ["other-user", "own"]);
        assert.deepEqual((await storage.fetchTokens({ isAdmin: false, host, port: 6379, username: "fixture" }))
            .map(row => row.token_id), ["own"]);
    }
});

test("lock timeout fails without stealing another writer's lock", async (t) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-timeout-test-"));
    t.after(() => fs.rm(dir, { recursive: true, force: true }));
    const file = path.join(dir, "tokens.json");
    const lockPath = `${file}.lock`;
    const record = path.join(lockPath, "owner-live.json");
    const owner = JSON.stringify({ pid: process.pid, hostname: os.hostname(), instance: "live", acquiredAt: 0 });

    const storage = new FileTokenStorage(file);
    await storage.createToken(token("existing"));
    await fs.mkdir(lockPath);
    await fs.writeFile(record, owner);
    const before = await fs.readFile(file, "utf8");
    let now = 0;
    t.mock.method(Date, "now", () => now);
    const rename = fs.rename;
    t.mock.method(fs, "rename", async (from: Parameters<typeof fs.rename>[0], to: Parameters<typeof fs.rename>[1]) => {
        if (to === lockPath) now = 10_000;
        return rename(from, to);
    });
    await assert.rejects(storage.revokeToken("existing", "fixture"), /Timed out acquiring token storage lock/);
    assert.equal(await fs.readFile(record, "utf8"), owner);
    assert.equal(await fs.readFile(file, "utf8"), before);
    assert.deepEqual((await fs.readdir(dir)).sort(), ["tokens.json", "tokens.json.lock"]);
});

test("a failed lock release is retried before the next operation without replacing its result", async (t) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-release-test-"));
    const file = path.join(dir, "tokens.json");
    const lockPath = `${file}.lock`;
    t.after(() => fs.rm(dir, { recursive: true, force: true }));
    const log = t.mock.method(console, "error", () => {});
    let failRelease = true;
    let failWrite = false;
    const unlink = fs.unlink;
    t.mock.method(fs, "unlink", async (target: Parameters<typeof fs.unlink>[0]) => {
        if (failRelease && path.dirname(String(target)) === lockPath) throw new Error("release failed");
        return unlink(target);
    });
    failSnapshotRename(t.mock, () => failWrite);
    const storage = new FileTokenStorage(file);

    await storage.createToken(token("existing"));
    assert.ok(await storage.fetchTokenById("existing"));
    assert.equal(log.mock.callCount(), 1);
    assert.match(String(log.mock.calls[0].arguments[0]), /Failed to release token storage lock/);
    assert.equal((await fs.stat(lockPath)).isDirectory(), true);

    // While the release keeps failing the next operation fails fast and the lock is kept.
    await assert.rejects(storage.createToken(token("blocked")), /release failed/);
    assert.equal((await fs.stat(lockPath)).isDirectory(), true);

    failRelease = false;
    await storage.createToken(token("after-recovery"));
    assert.ok(await storage.fetchTokenById("after-recovery"));
    assert.equal(await storage.fetchTokenById("blocked"), null);
    await assert.rejects(fs.stat(lockPath), { code: "ENOENT" });

    failRelease = true;
    failWrite = true;
    await assert.rejects(storage.createToken(token("new")), /Failed to save tokens/);
    assert.equal(await storage.fetchTokenById("new"), null);
});

test("a writer paused before publishing its lock never removes a successor's lock", async (t) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-paused-owner-test-"));
    t.after(() => fs.rm(dir, { recursive: true, force: true }));
    const file = path.join(dir, "tokens.json");
    const lockPath = `${file}.lock`;
    await new FileTokenStorage(file).createToken(token("existing"));
    const publishing = Promise.withResolvers<void>();
    const resumePublishing = Promise.withResolvers<void>();
    const successorWriting = Promise.withResolvers<void>();
    const resumeSuccessor = Promise.withResolvers<void>();
    let records = 0;
    let snapshots = 0;
    const writeFile = fs.writeFile;
    t.mock.method(fs, "writeFile", async (...args: Parameters<typeof fs.writeFile>) => {
        const target = String(args[0]);
        if (/owner-[^/\\]+\.json$/.test(target) && ++records === 1) {
            publishing.resolve();
            await resumePublishing.promise;
            throw new Error("disk full");
        }
        if (target.endsWith(".tmp") && ++snapshots === 1) {
            successorWriting.resolve();
            await resumeSuccessor.promise;
        }
        return writeFile(...args);
    });

    const stalled = new FileTokenStorage(file).createToken(token("stalled"));
    await publishing.promise;
    const successorStorage = new FileTokenStorage(file);
    const successor = successorStorage.createToken(token("successor"));
    await successorWriting.promise;
    const held = await fs.readdir(lockPath);
    assert.equal(held.length, 1);

    resumePublishing.resolve();
    await assert.rejects(stalled, /disk full/);
    assert.deepEqual(await fs.readdir(lockPath), held);

    resumeSuccessor.resolve();
    await successor;
    assert.ok(await successorStorage.fetchTokenById("successor"));
    assert.equal(await successorStorage.fetchTokenById("stalled"), null);
    assert.deepEqual(await fs.readdir(dir), ["tokens.json"]);
});

describe("abandoned lock recovery", () => {
    // Each contended rename advances the clock to the 10 s acquisition deadline, so a lock that
    // is not reclaimed times out at once and a reclaimed one is acquired on the next attempt.
    const START = 1_000_000;
    const CONTENDED_AT = START + 10_000;
    const STALE_AT = CONTENDED_AT - 5 * 60_000;
    const RECORD = "owner-previous.json";

    async function contendedStorage(t: TestContext, entries: Record<string, string>, lockCreatedAt?: number) {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-abandoned-lock-test-"));
        t.after(() => fs.rm(dir, { recursive: true, force: true }));
        const file = path.join(dir, "tokens.json");
        const lockPath = `${file}.lock`;
        const storage = new FileTokenStorage(file);
        await storage.createToken(token("existing"));
        await fs.mkdir(lockPath);
        for (const [name, contents] of Object.entries(entries)) await fs.writeFile(path.join(lockPath, name), contents);
        if (lockCreatedAt !== undefined) await fs.utimes(lockPath, new Date(lockCreatedAt), new Date(lockCreatedAt));
        let now = START;
        t.mock.method(Date, "now", () => now);
        const rename = fs.rename;
        t.mock.method(fs, "rename", async (from: Parameters<typeof fs.rename>[0], to: Parameters<typeof fs.rename>[1]) => {
            if (to === lockPath) {
                now += 10_000;
                // As on Windows, any existing directory blocks the lock, even an empty one.
                if (existsSync(lockPath)) throw Object.assign(new Error("lock held"), { code: "EPERM" });
            }
            return rename(from, to);
        });
        return { dir, file, lockPath, storage };
    }

    const ownerJson = (overrides: Record<string, unknown> = {}) => JSON.stringify({
        pid: process.pid, hostname: os.hostname(), instance: "previous-process",
        acquiredAt: CONTENDED_AT - 30_000, ...overrides,
    });

    const killFailing = (t: TestContext, code: string) => t.mock.method(process, "kill", () => {
        throw Object.assign(new Error(code), { code });
    });

    const otherHost = `${os.hostname()}-other`;
    const none = () => {};

    type LockCase = [description: string, entries: Record<string, string>, setup: (t: TestContext) => unknown, lockCreatedAt?: number];

    const reclaimed: LockCase[] = [
        ["its owner exited in an earlier process with the same PID", { [RECORD]: ownerJson() }, none],
        ["its owner PID no longer runs on this host", { [RECORD]: ownerJson({ pid: 999_999 }) }, t => killFailing(t, "ESRCH")],
        ["its owner on another host acquired it before the stale threshold", { [RECORD]: ownerJson({ hostname: otherHost, acquiredAt: STALE_AT }) }, none],
        ["its owner record is malformed and older than the stale threshold", { [RECORD]: "{" }, none, STALE_AT],
        ["its owner record is null and older than the stale threshold", { [RECORD]: "null" }, none, STALE_AT],
        ["an interrupted release left it empty before the stale threshold", {}, none, STALE_AT],
    ];
    for (const [description, entries, setup, lockCreatedAt] of reclaimed) {
        test(`reclaims a lock when ${description}`, async (t) => {
            setup(t);
            const warning = t.mock.method(console, "warn", () => {});
            const { dir, file, storage } = await contendedStorage(t, entries, lockCreatedAt);

            await storage.createToken(token("after-recovery"));

            assert.ok(await new FileTokenStorage(file).fetchTokenById("after-recovery"));
            assert.equal(warning.mock.callCount(), 1);
            assert.equal(warning.mock.calls[0].arguments[0], "Recovered abandoned token storage lock:");
            assert.deepEqual(await fs.readdir(dir), ["tokens.json"]);
        });
    }

    const kept: LockCase[] = [
        ["is empty and younger than the stale threshold", {}, none, STALE_AT + 1],
        ["is empty and cannot be inspected", {}, t => {
            const stat = fs.stat;
            t.mock.method(fs, "stat", async (...args: Parameters<typeof fs.stat>) => {
                if (String(args[0]).endsWith(".lock")) throw new Error("stat failed");
                return stat(...args);
            });
        }, STALE_AT],
        ["holds files other than an owner record, however old", { unrelated: "" }, none, STALE_AT],
        ["has a malformed owner record younger than the stale threshold", { [RECORD]: "{" }, none],
        ["has an owner record with a non-numeric pid", { [RECORD]: ownerJson({ pid: "1" }) }, none],
        ["has an owner record without a hostname", { [RECORD]: ownerJson({ hostname: undefined }) }, none],
        ["has an owner record without an instance", { [RECORD]: ownerJson({ instance: undefined }) }, none],
        ["has an owner record without an acquisition time", { [RECORD]: ownerJson({ acquiredAt: undefined }) }, none],
        ["is younger than the abandonment threshold", { [RECORD]: ownerJson({ acquiredAt: CONTENDED_AT - 29_999 }) }, none],
        ["belongs to another host and is younger than the stale threshold", { [RECORD]: ownerJson({ hostname: otherHost, acquiredAt: STALE_AT + 1 }) }, none],
        ["belongs to a running process", { [RECORD]: ownerJson({ pid: 999_999 }) }, t => t.mock.method(process, "kill", () => true)],
        ["belongs to a process this user cannot signal", { [RECORD]: ownerJson({ pid: 999_999 }) }, t => killFailing(t, "EPERM")],
    ];
    for (const [description, entries, setup, lockCreatedAt] of kept) {
        test(`keeps a lock that ${description}`, async (t) => {
            setup(t);
            const warning = t.mock.method(console, "warn", () => {});
            const { lockPath, storage } = await contendedStorage(t, entries, lockCreatedAt);

            await assert.rejects(storage.revokeToken("existing", "fixture"), /Timed out acquiring token storage lock/);

            assert.deepEqual((await fs.readdir(lockPath)).sort(), Object.keys(entries).sort());
            for (const [name, contents] of Object.entries(entries)) {
                assert.equal(await fs.readFile(path.join(lockPath, name), "utf8"), contents);
            }
            assert.equal(warning.mock.callCount(), 0);
        });
    }

    test("keeps an old lock held by a live writer in this process", async (t) => {
        const probeDir = await fs.mkdtemp(path.join(os.tmpdir(), "token-own-lock-test-"));
        t.after(() => fs.rm(probeDir, { recursive: true, force: true }));
        const writeFile = fs.writeFile;
        let instance = "";
        const capture = t.mock.method(fs, "writeFile", async (...args: Parameters<typeof fs.writeFile>) => {
            if (/owner-[^/\\]+\.json$/.test(String(args[0]))) instance = JSON.parse(String(args[1])).instance;
            return writeFile(...args);
        });
        await new FileTokenStorage(path.join(probeDir, "tokens.json")).createToken(token("probe"));
        capture.mock.restore();
        const owner = ownerJson({ instance, acquiredAt: CONTENDED_AT - 60_000 });
        const { lockPath, storage } = await contendedStorage(t, { [RECORD]: owner });

        await assert.rejects(storage.revokeToken("existing", "fixture"), /Timed out acquiring token storage lock/);
        assert.equal(await fs.readFile(path.join(lockPath, RECORD), "utf8"), owner);
    });

    test("keeps a lock and rejects when its owner record cannot be read", async (t) => {
        const { lockPath, storage } = await contendedStorage(t, { [RECORD]: ownerJson() }, STALE_AT);
        const readFile = fs.readFile;
        t.mock.method(fs, "readFile", async (...args: Parameters<typeof fs.readFile>) => {
            if (String(args[0]).endsWith(RECORD)) throw Object.assign(new Error("denied"), { code: "EACCES" });
            return readFile(...args);
        });

        await assert.rejects(storage.revokeToken("existing", "fixture"), /denied/);
        assert.deepEqual(await fs.readdir(lockPath), [RECORD]);
    });

    test("removes only the observed lock when a replacement takes its place during recovery", async (t) => {
        const warning = t.mock.method(console, "warn", () => {});
        const { lockPath, storage } = await contendedStorage(t, { [RECORD]: ownerJson() });
        const replacement = ownerJson({ instance: "replacement", acquiredAt: CONTENDED_AT });
        const observed = path.join(lockPath, RECORD);
        const unlink = fs.unlink;
        let replaced = false;
        t.mock.method(fs, "unlink", async (target: Parameters<typeof fs.unlink>[0]) => {
            if (target === observed && !replaced) {
                // The previous holder releases and a new writer takes the lock before recovery acts.
                replaced = true;
                await fs.rm(lockPath, { recursive: true });
                await fs.mkdir(lockPath);
                await fs.writeFile(path.join(lockPath, "owner-replacement.json"), replacement);
            }
            return unlink(target);
        });

        await assert.rejects(storage.revokeToken("existing", "fixture"), /Timed out acquiring token storage lock/);
        assert.deepEqual(await fs.readdir(lockPath), ["owner-replacement.json"]);
        assert.equal(await fs.readFile(path.join(lockPath, "owner-replacement.json"), "utf8"), replacement);
        assert.equal(warning.mock.callCount(), 0);
    });

    test("recovers an abandoned lock without a reclaim lock that a crashed reclaimer could strand", async (t) => {
        t.mock.method(console, "warn", () => {});
        const { dir, file, lockPath, storage } = await contendedStorage(t, { [RECORD]: ownerJson() });
        // Left behind by a reclaimer of an earlier build that crashed; it no longer gates recovery.
        await fs.mkdir(`${lockPath}.reclaim`);

        await storage.createToken(token("after-recovery"));

        assert.ok(await new FileTokenStorage(file).fetchTokenById("after-recovery"));
        assert.deepEqual((await fs.readdir(dir)).sort(), ["tokens.json", "tokens.json.lock.reclaim"]);
    });

    test("propagates an unexpected failure while removing an abandoned lock", async (t) => {
        const { lockPath, storage } = await contendedStorage(t, { [RECORD]: ownerJson() });
        const rmdir = fs.rmdir;
        t.mock.method(fs, "rmdir", async (...args: Parameters<typeof fs.rmdir>) => {
            if (args[0] === lockPath) throw Object.assign(new Error("busy"), { code: "EBUSY" });
            return rmdir(...args);
        });

        await assert.rejects(storage.revokeToken("existing", "fixture"), /busy/);
    });

    test("retries when the contended lock is released before it can be inspected", async (t) => {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-vanished-lock-test-"));
        t.after(() => fs.rm(dir, { recursive: true, force: true }));
        const file = path.join(dir, "tokens.json");
        const rename = fs.rename;
        let contended = false;
        t.mock.method(fs, "rename", async (from: Parameters<typeof fs.rename>[0], to: Parameters<typeof fs.rename>[1]) => {
            if (to === `${file}.lock` && !contended) {
                contended = true;
                throw Object.assign(new Error("lock held"), { code: "EEXIST" });
            }
            return rename(from, to);
        });
        const storage = new FileTokenStorage(file);

        await storage.createToken(token("first"));

        assert.equal(contended, true);
        assert.ok(await storage.fetchTokenById("first"));
        assert.deepEqual(await fs.readdir(dir), ["tokens.json"]);
    });

    test("propagates an unexpected lock-acquisition failure without leaving a staged lock", async (t) => {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-lock-denied-test-"));
        t.after(() => fs.rm(dir, { recursive: true, force: true }));
        const file = path.join(dir, "tokens.json");
        const rename = fs.rename;
        t.mock.method(fs, "rename", async (from: Parameters<typeof fs.rename>[0], to: Parameters<typeof fs.rename>[1]) => {
            if (to === `${file}.lock`) throw Object.assign(new Error("denied"), { code: "EACCES" });
            return rename(from, to);
        });

        await assert.rejects(new FileTokenStorage(file).createToken(token("first")), /denied/);
        assert.deepEqual(await fs.readdir(dir), []);
    });

    test("takes no lock when its owner record cannot be written", async (t) => {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-owner-write-test-"));
        t.after(() => fs.rm(dir, { recursive: true, force: true }));
        const file = path.join(dir, "tokens.json");
        const writeFile = fs.writeFile;
        const failing = t.mock.method(fs, "writeFile", async (...args: Parameters<typeof fs.writeFile>) => {
            if (/owner-[^/\\]+\.json$/.test(String(args[0]))) throw new Error("disk full");
            return writeFile(...args);
        });
        const storage = new FileTokenStorage(file);

        await assert.rejects(storage.createToken(token("first")), /disk full/);
        assert.deepEqual(await fs.readdir(dir), []);
        failing.mock.restore();
        await storage.createToken(token("first"));
        assert.ok(await storage.fetchTokenById("first"));
    });
});
