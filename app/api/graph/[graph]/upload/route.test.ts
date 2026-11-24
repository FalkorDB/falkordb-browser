import test, { after, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import * as fs from "node:fs/promises";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";
import { getUploadsDirectory } from "../../../upload/file-validation.ts";

type Fixture = {
  session: NextResponse | {
    user: { id: string; role: string };
    client: { selectGraph: (name: string) => { query: (query: string) => Promise<unknown> } };
  };
};

declare global {
  var __cypherUploadFixture: Fixture;
}

const routeUrl = import.meta.resolve("./route.ts");
const authModule = "data:text/javascript,export async function getClient() { return globalThis.__cypherUploadFixture.session; }";
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL === routeUrl) {
      if (specifier.includes("auth/[...nextauth]/options")) return { url: authModule, shortCircuit: true };
      if (specifier === "@/app/api/upload/file-validation") return nextResolve(new URL("../../../upload/file-validation.ts", import.meta.url).href, context);
      if (specifier === "next/server") return nextResolve("next/server.js", context);
      if (specifier.startsWith(".") && !specifier.endsWith(".ts")) return nextResolve(`${specifier}.ts`, context);
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

const { POST } = await import("./route.ts");
const owner = "cypher-upload-route-test-owner";
const directory = getUploadsDirectory(owner);
const params = { params: Promise.resolve({ graph: "example" }) };
const request = (body: string, query = "") => new NextRequest(`http://localhost/api/graph/example/upload${query}`, {
  method: "POST", body, headers: { origin: "http://localhost", "content-type": "application/json" },
});

function configure(t: TestContext) {
  const queries: string[] = [];
  const fixture: Fixture = {
    session: {
      user: { id: owner, role: "Admin" },
      client: { selectGraph: name => {
        assert.equal(name, "example");
        return { query: async query => { queries.push(query); } };
      } },
    },
  };
  globalThis.__cypherUploadFixture = fixture;
  t.mock.method(console, "error", () => {});
  return { fixture, queries };
}

async function createUpload(t: TestContext, extension: string, content: string) {
  await fs.mkdir(directory, { recursive: true });
  const id = `${randomUUID()}${extension}`;
  const file = path.join(directory, id);
  await fs.writeFile(file, content);
  t.after(() => fs.rm(file, { force: true }));
  return { id, file };
}

after(async () => {
  Reflect.deleteProperty(globalThis, "__cypherUploadFixture");
  await fs.rmdir(directory).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
});

test("passes through authentication failures and rejects invalid requests", async t => {
  const { fixture, queries } = configure(t);
  const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const session = fixture.session;
  fixture.session = denied;
  assert.strictEqual(await POST(request("{}"), params), denied);
  fixture.session = session;
  for (const [body, status, message] of [
    ["{", 400, "Invalid request body."],
    ["{}", 400, "fileId is required."],
    ['{"fileId":"invalid"}', 404, "Uploaded file not found."],
  ] as const) {
    const response = await POST(request(body), params);
    assert.equal(response.status, status);
    assert.equal((await response.json()).message, message);
    assert.equal(response.headers.get("vary"), "Origin");
  }
  assert.deepEqual(queries, []);
});

test("rejects read-only uploads and deletes the temporary file", async t => {
  const { fixture, queries } = configure(t);
  assert.ok(!(fixture.session instanceof NextResponse));
  fixture.session.user.role = "Read-Only";
  for (const query of ["", "?readOnly=true"]) {
    const { id, file } = await createUpload(t, ".cypher", "RETURN 1;");
    const response = await POST(request(JSON.stringify({ fileId: id }), query), params);
    assert.equal(response.status, 403);
    assert.match((await response.json()).message, /do not have permission/);
    await assert.rejects(fs.access(file), { code: "ENOENT" });
    fixture.session.user.role = "Admin";
  }
  assert.deepEqual(queries, []);
});

test("rejects non-Cypher files and deletes the temporary file", async t => {
  const { queries } = configure(t);
  const { id, file } = await createUpload(t, ".csv", "name\nAlice");
  const response = await POST(request(JSON.stringify({ fileId: id })), params);
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /Only \.txt or \.cypher/);
  assert.deepEqual(queries, []);
  await assert.rejects(fs.access(file), { code: "ENOENT" });
});

test("executes a Cypher batch in order and removes its file", async t => {
  const { queries } = configure(t);
  const { id, file } = await createUpload(t, ".cypher", "RETURN 1; RETURN 2;");
  const response = await POST(request(JSON.stringify({ fileId: id })), params);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { message: "Executed 2 Cypher statement(s)." });
  assert.deepEqual(queries, ["RETURN 1", "RETURN 2"]);
  await assert.rejects(fs.access(file), { code: "ENOENT" });
});

test("rejects LOAD CSV in a batch before executing any statements", async t => {
  const { queries } = configure(t);
  const { id, file } = await createUpload(t, ".txt", "RETURN 1;\nLOAD CSV FROM 'https://example.test/a' AS row RETURN row;");
  const response = await POST(request(JSON.stringify({ fileId: id })), params);
  assert.equal(response.status, 422);
  assert.match((await response.json()).message, /must not contain a LOAD CSV clause/);
  assert.deepEqual(queries, []);
  await assert.rejects(fs.access(file), { code: "ENOENT" });
});

test("reports a failing statement and does not execute later statements", async t => {
  const { fixture, queries } = configure(t);
  assert.ok(!(fixture.session instanceof NextResponse));
  fixture.session.client.selectGraph = () => ({
    query: async query => {
      queries.push(query);
      if (query === "RETURN 2") throw new Error("database rejected statement");
    },
  });
  const { id, file } = await createUpload(t, ".cypher", "RETURN 1; RETURN 2; RETURN 3;");
  const response = await POST(request(JSON.stringify({ fileId: id })), params);
  assert.equal(response.status, 422);
  assert.match((await response.json()).message, /statement 2: database rejected statement/);
  assert.deepEqual(queries, ["RETURN 1", "RETURN 2"]);
  await assert.rejects(fs.access(file), { code: "ENOENT" });
});

test("reports a missing stored file without executing queries", async t => {
  const { queries } = configure(t);
  const response = await POST(request(JSON.stringify({ fileId: `${randomUUID()}.cypher` })), params);
  assert.equal(response.status, 500);
  assert.equal((await response.json()).message, "Failed to upload graph data.");
  assert.deepEqual(queries, []);
});
