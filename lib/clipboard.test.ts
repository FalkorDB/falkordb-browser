import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { copyText } from "./clipboard.ts";

describe("copyText", () => {
  it("returns false when no writer is available", async () => {
    assert.equal(await copyText(undefined, "hello"), false);
  });

  it("writes the text and returns true on success", async () => {
    let received: string | undefined;
    const writer = async (t: string) => {
      received = t;
    };
    assert.equal(await copyText(writer, "hello"), true);
    assert.equal(received, "hello");
  });

  it("returns false when the writer rejects", async () => {
    const writer = async () => {
      throw new Error("denied");
    };
    assert.equal(await copyText(writer, "hello"), false);
  });
});
