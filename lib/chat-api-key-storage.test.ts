import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ChatApiKey } from "@/app/components/provider";
import { type ChatKeyState, getSelectedChatApiKey, pickCommittedChatApiKey } from "./chat-api-key-storage.ts";

const keys: ChatApiKey[] = [
  { id: "first", label: "First", key: "test-first", provider: "openai", createdAt: 0 },
  { id: "second", label: "Second", key: "test-second", provider: "openai", createdAt: 0 },
  { id: "third", label: "Third", key: "test-third", provider: "openai", createdAt: 0 },
];

describe("getSelectedChatApiKey", () => {
  it("returns the matching key", () => {
    assert.equal(getSelectedChatApiKey(keys, "second"), keys[1]);
  });

  it("falls back to the first key for an empty or stale id", () => {
    assert.equal(getSelectedChatApiKey(keys, ""), keys[0]);
    assert.equal(getSelectedChatApiKey(keys, "removed"), keys[0]);
  });

  it("returns undefined when no keys are saved", () => {
    assert.equal(getSelectedChatApiKey([], "first"), undefined);
  });
});

describe("pickCommittedChatApiKey", () => {
  const deleteSecond = ({ keys: current, selectedId }: ChatKeyState): ChatKeyState => {
    const remaining = current.filter(({ id }) => id !== "second");
    return { keys: remaining, selectedId: selectedId === "second" ? remaining[0]?.id ?? "" : selectedId };
  };

  it("commits the update's selection when nothing changed meanwhile", () => {
    const snapshot = { keys, selectedId: "second" };
    const next = deleteSecond(snapshot);
    assert.equal(pickCommittedChatApiKey(next, snapshot, snapshot, deleteSecond, false), keys[0]);
  });

  it("keeps a selection made while encrypting when the save kept that key", () => {
    const snapshot = { keys, selectedId: "first" };
    const latest = { keys, selectedId: "third" };
    const next = deleteSecond(snapshot);
    assert.equal(pickCommittedChatApiKey(next, snapshot, latest, deleteSecond, true), keys[2]);
  });

  it("re-applies the update when the later selection is the removed key", () => {
    const snapshot = { keys, selectedId: "first" };
    const latest = { keys, selectedId: "second" };
    const next = deleteSecond(snapshot);
    assert.equal(pickCommittedChatApiKey(next, snapshot, latest, deleteSecond, true), keys[0]);
  });

  it("re-applies the update to a changed state without a newer user pick", () => {
    const select = (id: string) => (current: ChatKeyState): ChatKeyState => ({ ...current, selectedId: id });
    const snapshot = { keys, selectedId: "first" };
    const latest = { keys, selectedId: "second" };
    const next = select("third")(snapshot);
    assert.equal(pickCommittedChatApiKey(next, snapshot, latest, select("third"), false), keys[2]);
  });
});
