import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import os from "os";
import path from "path";
import { Readable } from "stream";

process.env.CSV_TEMP_SIGNING_SECRET = "unit-test-signing-secret";
process.env.CSV_LOCAL_LOAD_URI_MODE = "file";

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "csv-local-test-"));
process.env.CSV_LOCAL_TEMP_DIR = tempRoot;

const { LocalCsvStorage, getCsvTempBaseDir, openLocalCsvReadStream } = await import("./csv-storage-local.ts");

const OWNER_A = "a".repeat(32);
const OWNER_B = "b".repeat(32);
const KEY_1 = "11111111-1111-4111-8111-111111111111";

function streamOf(text: string): Readable {
    return Readable.from(Buffer.from(text, "utf-8"));
}

test("store streams under <base>/<owner>/<key>.csv and it can be read back", async () => {
    const storage = new LocalCsvStorage();
    await storage.store(OWNER_A, KEY_1, streamOf("name,age\nAlice,30\n"));
    const expected = path.join(getCsvTempBaseDir(), OWNER_A, `${KEY_1}.csv`);
    assert.ok(fs.existsSync(expected));
    assert.equal(fs.readFileSync(expected, "utf-8"), "name,age\nAlice,30\n");
});

test("openLocalCsvReadStream is owner-scoped (a different owner cannot read the file)", async () => {
    const storage = new LocalCsvStorage();
    await storage.store(OWNER_A, KEY_1, streamOf("secret\n"));
    assert.equal(openLocalCsvReadStream(OWNER_B, KEY_1), null);
    const stream = openLocalCsvReadStream(OWNER_A, KEY_1);
    assert.ok(stream);
    stream?.destroy();
});

test("resolveReadUrl (file mode) returns a nested owner-scoped file:// URI", async () => {
    const storage = new LocalCsvStorage();
    await storage.store(OWNER_A, KEY_1, streamOf("name,age\n"));
    const url = await storage.resolveReadUrl(OWNER_A, KEY_1);
    assert.equal(url, `file://falkordb-browser-csv-temp/${OWNER_A}/${KEY_1}.csv`);
});

test("resolveReadUrl throws for a missing object (surfaces as a 404)", async () => {
    const storage = new LocalCsvStorage();
    await assert.rejects(
        () => storage.resolveReadUrl(OWNER_B, "99999999-9999-4999-8999-999999999999"),
        /not found/i
    );
});

test("store rejects an invalid owner or key (path-traversal safe)", async () => {
    const storage = new LocalCsvStorage();
    await assert.rejects(() => storage.store("../evil", KEY_1, streamOf("x")), /Invalid CSV owner/);
    await assert.rejects(() => storage.store(OWNER_A, "../../etc/passwd", streamOf("x")), /Invalid CSV key/);
});

test("store leaves no .part file behind on success", async () => {
    const storage = new LocalCsvStorage();
    await storage.store(OWNER_A, KEY_1, streamOf("x\n"));
    const dir = path.join(getCsvTempBaseDir(), OWNER_A);
    assert.equal(fs.readdirSync(dir).filter((f) => f.endsWith(".part")).length, 0);
});

test("delete removes only the owner's file", async () => {
    const storage = new LocalCsvStorage();
    await storage.store(OWNER_A, KEY_1, streamOf("x"));
    await storage.delete(OWNER_A, KEY_1);
    assert.ok(!fs.existsSync(path.join(getCsvTempBaseDir(), OWNER_A, `${KEY_1}.csv`)));
});

test("cleanupExpired deletes stale temp files but never user files in the import root", async () => {
    const storage = new LocalCsvStorage();
    const base = getCsvTempBaseDir();

    const userFile = path.join(tempRoot, "user-managed.csv");
    fs.writeFileSync(userFile, "keep me\n");

    fs.mkdirSync(path.join(base, OWNER_A), { recursive: true });
    const foreignInOwner = path.join(base, OWNER_A, "notes.csv");
    fs.writeFileSync(foreignInOwner, "keep me too\n");

    await storage.store(OWNER_A, KEY_1, streamOf("delete me\n"));
    const tempFile = path.join(base, OWNER_A, `${KEY_1}.csv`);

    const old = Date.now() / 1000 - 3600;
    fs.utimesSync(userFile, old, old);
    fs.utimesSync(foreignInOwner, old, old);
    fs.utimesSync(tempFile, old, old);

    const deleted = await storage.cleanupExpired(Date.now());

    assert.equal(deleted, 1);
    assert.ok(!fs.existsSync(tempFile), "our stale temp file is deleted");
    assert.ok(fs.existsSync(userFile), "user file in import root is preserved");
    assert.ok(fs.existsSync(foreignInOwner), "non-UUID file in owner dir is preserved");
});

test("cleanupExpired keeps temp files newer than the cutoff", async () => {
    const storage = new LocalCsvStorage();
    const key = "22222222-2222-4222-8222-222222222222";
    await storage.store(OWNER_B, key, streamOf("fresh\n"));
    assert.equal(await storage.cleanupExpired(Date.now() - 3600_000), 0);
    assert.ok(fs.existsSync(path.join(getCsvTempBaseDir(), OWNER_B, `${key}.csv`)));
});

test.after(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
});
