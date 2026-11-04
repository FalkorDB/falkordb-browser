import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import FileTokenStorage from "./FileTokenStorage.ts";
import type { TokenData } from "./ITokenStorage.ts";

const execute = promisify(execFile);

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

test("a failed atomic replacement preserves the previous snapshot and releases the lock", async (t) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-rename-test-"));
    const file = path.join(dir, "tokens.json");
    t.after(async () => { await fs.unlink(file); await fs.rmdir(dir); });
    t.mock.method(console, "error", () => {});
    const storage = new FileTokenStorage(file);
    await storage.createToken(token("existing"));
    const before = await fs.readFile(file, "utf8");
    const rename = t.mock.method(fs, "rename", async () => { throw new Error("rename failed"); });
    await assert.rejects(storage.createToken(token("new")), /Failed to save tokens/);
    assert.equal(await fs.readFile(file, "utf8"), before);
    assert.deepEqual(await fs.readdir(dir), ["tokens.json"]);
    rename.mock.restore();
    await storage.revokeToken("existing", "fixture");
    assert.equal(await storage.isTokenActive("hash:existing"), false);
});

test("lock timeout fails without stealing another writer's lock", async (t) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "token-timeout-test-"));
    const file = path.join(dir, "tokens.json");
    const lockPath = `${file}.lock`;
    t.after(async () => {
        await fs.rmdir(lockPath);
        await fs.unlink(file);
        await fs.rmdir(dir);
    });
    const storage = new FileTokenStorage(file);
    await storage.createToken(token("existing"));
    await fs.mkdir(lockPath);
    const before = await fs.readFile(file, "utf8");
    let now = 0;
    t.mock.method(Date, "now", () => now);
    const mkdir = fs.mkdir;
    t.mock.method(fs, "mkdir", async (...args: Parameters<typeof fs.mkdir>) => {
        if (args[0] === lockPath) {
            now = 10_000;
            throw Object.assign(new Error("locked"), { code: "EEXIST" });
        }
        return mkdir(...args);
    });
    await assert.rejects(storage.revokeToken("existing", "fixture"), /Timed out acquiring token storage lock/);
    assert.equal((await fs.stat(lockPath)).isDirectory(), true);
    assert.equal(await fs.readFile(file, "utf8"), before);
});
