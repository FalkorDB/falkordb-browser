import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_CHAT_BODY_BYTES, OVER_LIMIT, readChatBodyWithLimit } from "./requestBody.ts";

describe("bounded AI body reader", () => {
  it("preserves UTF-8 characters split across chunks and accepts the exact byte limit", async () => {
    const bytes = new TextEncoder().encode("a\u20ac");
    const body = new ReadableStream<Uint8Array<ArrayBuffer>>({
      start(controller) {
        controller.enqueue(bytes.slice(0, 2));
        controller.enqueue(bytes.slice(2));
        controller.close();
      },
    });
    assert.equal(await readChatBodyWithLimit({ body }, 4), "a\u20ac");
  });

  it("cancels oversized chunked responses before buffering remaining content", async () => {
    let cancelled = false;
    let pulls = 0;
    const body = new ReadableStream<Uint8Array<ArrayBuffer>>({
      pull(controller) {
        pulls += 1;
        controller.enqueue(new Uint8Array(1024));
      },
      cancel() { cancelled = true; },
    }, { highWaterMark: 0 });
    assert.equal(await readChatBodyWithLimit({ body }, 2048), OVER_LIMIT);
    assert.equal(cancelled, true);
    assert.equal(pulls, 3);
  });

  it("retains the request default cap and supports response-specific limits", async () => {
    assert.equal(await readChatBodyWithLimit(new Response("a".repeat(MAX_CHAT_BODY_BYTES + 1))), OVER_LIMIT);
    assert.equal(await readChatBodyWithLimit(new Response("abcd"), 4), "abcd");
    assert.equal(await readChatBodyWithLimit(new Response("abcde"), 4), OVER_LIMIT);
    assert.equal(await readChatBodyWithLimit({ body: null }), "");
  });
});
