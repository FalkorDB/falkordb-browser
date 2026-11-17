import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { endStream } from "./sse.ts";

const chunk = new TextEncoder().encode("event: result\ndata: {}\n\n");
const settle = () => new Promise((resolve) => { setTimeout(resolve, 20); });

describe("endStream", () => {
    const unhandled: unknown[] = [];
    const record = (reason: unknown) => { unhandled.push(reason); };
    beforeEach(() => { unhandled.length = 0; process.on("unhandledRejection", record); });
    afterEach(() => { process.off("unhandledRejection", record); });

    it("delivers the chunk and closes the stream", async () => {
        const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
        endStream(writable.getWriter(), chunk);
        const received: Uint8Array[] = [];
        for await (const part of readable) received.push(part);
        assert.deepEqual(received, [chunk]);
        await settle();
        assert.deepEqual(unhandled, []);
    });

    for (const reason of [undefined, new Error("aborted")]) {
        it(`leaves no unhandled rejection when the client cancels (${reason ? "with" : "without"} a reason)`, async () => {
            const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
            endStream(writable.getWriter(), chunk);
            await readable.cancel(reason);
            await settle();
            assert.deepEqual(unhandled, []);
        });
    }
});
