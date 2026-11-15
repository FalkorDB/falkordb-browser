import { afterEach, beforeEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import FileTokenStorage from "./FileTokenStorage.ts";
import type { TokenData } from "./ITokenStorage.ts";

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

        it("returns every active PAT to admins, newest first", async () => {
            await seed();
            const ids = (await storage.fetchTokens({ isAdmin: true })).map((x) => x.token_id);
            assert.deepEqual(ids, ["other-port", "other-host", "new", "mid", "old", "explicit-pat"]);
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
        it("stamps last_used with the current unix time", async () => {
            await storage.createToken(makeToken({ token_id: "a" }));
            await storage.createToken(makeToken({ token_id: "b" }));

            const before = Math.floor(Date.now() / 1000);
            await storage.updateLastUsed("a");
            const after = Math.floor(Date.now() / 1000);

            const a = await storage.fetchTokenById("a");
            assert.ok(a && a.last_used >= before && a.last_used <= after);
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
        it("treats a file without a tokens key as empty", async () => {
            await fs.mkdir(join(dir, "nested"));
            await fs.writeFile(filePath, "{}");

            assert.deepEqual(await storage.fetchTokens({ isAdmin: true }), []);
            await storage.createToken(makeToken({ token_id: "a" }));
            assert.deepEqual((await readFileTokens(filePath)).map((x) => x.token_id), ["a"]);
        });

        it("returns no tokens and logs when the file stays unparseable", async () => {
            await fs.mkdir(join(dir, "nested"));
            await fs.writeFile(filePath, "{not json");

            assert.deepEqual(await storage.fetchTokens({ isAdmin: true }), []);
            const calls = (console.error as unknown as ReturnType<typeof mock.fn>).mock.calls;
            assert.equal(calls.at(-1)?.arguments[0], "Failed to read tokens from file after retries:");
        });

        it("throws when the storage directory cannot be created", async () => {
            const blocker = join(dir, "blocker");
            await fs.writeFile(blocker, "");
            const broken = new FileTokenStorage(join(blocker, "tokens.json"));

            await assert.rejects(broken.createToken(makeToken()), /Failed to initialize token storage file/);
        });

        it("falls back to a direct write when the atomic rename fails", async () => {
            const rename = mock.method(fs, "rename", async () => {
                throw new Error("rename failed");
            });
            await storage.createToken(makeToken({ token_id: "a" }));

            assert.equal(rename.mock.callCount(), 1);
            assert.deepEqual((await readFileTokens(filePath)).map((x) => x.token_id), ["a"]);
            const leftovers = (await fs.readdir(join(dir, "nested"))).filter((f) => f.endsWith(".tmp"));
            assert.deepEqual(leftovers, []);
        });

        it("logs but tolerates a failing temp-file cleanup during the fallback", async () => {
            mock.method(fs, "rename", async () => {
                throw new Error("rename failed");
            });
            mock.method(fs, "unlink", async () => {
                throw new Error("unlink failed");
            });
            await storage.createToken(makeToken({ token_id: "a" }));

            assert.deepEqual((await readFileTokens(filePath)).map((x) => x.token_id), ["a"]);
            const calls = (console.error as unknown as ReturnType<typeof mock.fn>).mock.calls;
            assert.ok(calls.some((c) => c.arguments[0] === "Failed to clean up token storage temp file:"));
        });

        it("rejects when both the rename and the direct write fail, and keeps serving later calls", async () => {
            await storage.createToken(makeToken({ token_id: "a" }));
            // A directory squatting on the token path defeats both rename and write.
            await fs.rm(filePath);
            await fs.mkdir(filePath);

            await assert.rejects(storage.createToken(makeToken({ token_id: "b" })), /Failed to save tokens/);

            await fs.rm(filePath, { recursive: true });
            await storage.createToken(makeToken({ token_id: "c" }));
            assert.deepEqual((await readFileTokens(filePath)).map((x) => x.token_id), ["c"]);
        });
    });
});
