import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseStoredMessages, serializeChatHistory, CHAT_HISTORY_VERSION } from "./chatHistory.ts";
import type { Message } from "@/lib/utils";

const result = (content: string, confidence?: number): Message => ({
    role: "assistant",
    content,
    type: "Result",
    ...(confidence != null ? { confidence } : {}),
});

describe("parseStoredMessages", () => {
    it("returns [] for empty or missing input", () => {
        assert.deepEqual(parseStoredMessages(null), []);
        assert.deepEqual(parseStoredMessages(""), []);
    });

    it("returns [] for malformed JSON", () => {
        assert.deepEqual(parseStoredMessages("{not json"), []);
    });

    it("reconciles a mixed legacy bare array across both scales", () => {
        // 0.9 (fraction) -> 90, 10 (already 0-100) -> 10, 90 -> 90, 1 (ambiguous) -> omitted
        const raw = JSON.stringify([
            result("a", 0.9),
            result("b", 10),
            result("c", 90),
            result("d", 1),
        ]);
        const parsed = parseStoredMessages(raw);
        assert.equal(parsed.length, 4);
        assert.equal(parsed[0].confidence, 90);
        assert.equal(parsed[1].confidence, 10);
        assert.equal(parsed[2].confidence, 90);
        assert.equal(parsed[3].confidence, undefined);
    });

    it("leaves messages without confidence untouched in legacy arrays", () => {
        const raw = JSON.stringify([{ role: "user", content: "hi", type: "Text" }]);
        const parsed = parseStoredMessages(raw);
        assert.equal(parsed.length, 1);
        assert.equal(parsed[0].confidence, undefined);
    });

    it("filters out non-object entries so a stray null cannot crash rendering", () => {
        const raw = JSON.stringify([null, result("a", 0.8), "oops", [1, 2]]);
        const parsed = parseStoredMessages(raw);
        assert.equal(parsed.length, 1);
        assert.equal(parsed[0].confidence, 80);
    });

    it("uses versioned payloads as-is without rescaling", () => {
        const raw = serializeChatHistory([result("a", 90), result("b", 10)]);
        const parsed = parseStoredMessages(raw);
        assert.equal(parsed.length, 2);
        assert.equal(parsed[0].confidence, 90);
        assert.equal(parsed[1].confidence, 10);
    });

    it("discards payloads with an unknown version", () => {
        const raw = JSON.stringify({ version: 999, messages: [result("a", 90)] });
        assert.deepEqual(parseStoredMessages(raw), []);
    });

    it("filters null entries inside a versioned payload", () => {
        const raw = JSON.stringify({
            version: CHAT_HISTORY_VERSION,
            messages: [null, result("a", 90)],
        });
        const parsed = parseStoredMessages(raw);
        assert.equal(parsed.length, 1);
        assert.equal(parsed[0].confidence, 90);
    });

    it("returns [] for an object without a messages array", () => {
        assert.deepEqual(parseStoredMessages(JSON.stringify({ version: CHAT_HISTORY_VERSION })), []);
        assert.deepEqual(parseStoredMessages(JSON.stringify({ foo: "bar" })), []);
    });

    it("round-trips serialized history (idempotent, no re-rescale)", () => {
        const messages = [result("a", 90), result("b", 1)];
        const first = parseStoredMessages(serializeChatHistory(messages));
        const second = parseStoredMessages(serializeChatHistory(first));
        assert.deepEqual(second, first);
    });
});

describe("serializeChatHistory", () => {
    it("wraps messages with the current version marker", () => {
        const raw = serializeChatHistory([result("a", 90)]);
        const obj = JSON.parse(raw);
        assert.equal(obj.version, CHAT_HISTORY_VERSION);
        assert.equal(obj.messages.length, 1);
        assert.equal(obj.messages[0].confidence, 90);
    });
});
