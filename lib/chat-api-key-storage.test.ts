import assert from "node:assert/strict";
import test from "node:test";
import type { ChatApiKey } from "@/app/components/provider";
import { getSelectedChatApiKey } from "./chat-api-key-storage.ts";

const keys: ChatApiKey[] = [
  { id: "first", label: "First", key: "test-first", provider: "openai", createdAt: 0 },
  { id: "second", label: "Second", key: "test-second", provider: "openai", createdAt: 0 },
];

test("an explicit empty selection never activates a saved credential", () => {
  assert.equal(getSelectedChatApiKey(keys, ""), undefined);
});

test("a missing legacy preference still selects the first saved key", () => {
  assert.equal(getSelectedChatApiKey(keys, null), keys[0]);
});

test("a stale nonempty selection retains the initialization fallback", () => {
  assert.equal(getSelectedChatApiKey(keys, "removed"), keys[0]);
});

test("a saved selection activates only its matching key", () => {
  assert.equal(getSelectedChatApiKey(keys, "second"), keys[1]);
});

test("no stored selection activates a missing key", () => {
  assert.equal(getSelectedChatApiKey([], null), undefined);
  assert.equal(getSelectedChatApiKey([], ""), undefined);
});
