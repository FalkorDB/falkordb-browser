import { test } from "node:test";
import assert from "node:assert/strict";
import { queryStream, queryStreamError } from "./query-stream.ts";

test("query stream emits a result and closes once even after a later abort", async () => {
  const controller = new AbortController();
  const response = queryStream(controller.signal, async () => ({ data: [{ n: 1 }] }), {});
  assert.equal(await response.text(), 'event: result\ndata: {"data":[{"n":1}]}\n\n');
  controller.abort();
});

test("abort stops output while an in-flight database promise settles safely", async () => {
  const controller = new AbortController();
  const pending = Promise.withResolvers<unknown>();
  const response = queryStream(controller.signal, () => pending.promise, {});
  controller.abort();
  assert.equal(await response.text(), "");
  pending.reject(new Error("late backend failure"));
  await new Promise(resolve => setImmediate(resolve));
});

test("consumer cancellation does not enqueue to a cancelled controller", async () => {
  const controller = new AbortController();
  const pending = Promise.withResolvers<unknown>();
  const response = queryStream(controller.signal, () => pending.promise, {});
  await response.body!.cancel();
  pending.resolve({ data: [] });
  controller.abort();
  await new Promise(resolve => setImmediate(resolve));
});

test("already aborted queries never start", async () => {
  const controller = new AbortController();
  controller.abort();
  let called = false;
  const response = queryStream(controller.signal, async () => { called = true; }, {});
  assert.equal(await response.text(), "");
  assert.equal(called, false);
});

test("query rejection emits one error event", async (t) => {
  t.mock.method(console, "error", () => {});
  const response = queryStream(new AbortController().signal, async () => { throw new Error("syntax error"); }, {});
  assert.equal(await response.text(), 'event: error\ndata: {"message":"syntax error","status":400}\n\n');
});

test("authentication errors preserve status and connection error code in SSE", async () => {
  const response = await queryStreamError(Response.json(
    { message: "Connection expired", code: "CONNECTION_EXPIRED" }, { status: 401 },
  ), { "Content-Type": "text/event-stream" });
  assert.equal(response.headers.get("content-type"), "text/event-stream");
  assert.deepEqual(JSON.parse((await response.text()).split("data: ")[1]), {
    message: "Connection expired", code: "CONNECTION_EXPIRED", status: 401,
  });
});
