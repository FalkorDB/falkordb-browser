import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chatDraftKey, isUnchangedChatDraft, isChatConfigurationError } from "./chatDraft.ts";
import { normalizeLocalEndpoint } from "../../lib/local-llm-utils.ts";

describe("chat drafts", () => {
  it("uses a namespace separate from graph history, including suffix-like graph names", () => {
    assert.notEqual(chatDraftKey("people"), "chat-people-draft");
    assert.notEqual(chatDraftKey("people"), `chat-${chatDraftKey("people")}`);
    assert.notEqual(chatDraftKey("people"), chatDraftKey("people-draft"));
  });

  it("allows restoration or successful clearing only for the unchanged submitted draft", () => {
    const submitted = { text: "Find people", revision: 3 };
    assert.equal(isUnchangedChatDraft(submitted, "Find people", 3), true);
    assert.equal(isUnchangedChatDraft(submitted, "New draft", 4), false);
    assert.equal(isUnchangedChatDraft(submitted, "", 5), false);
    assert.equal(isUnchangedChatDraft(submitted, "Find people", 5), false);
    assert.equal(isUnchangedChatDraft(submitted, null, 3), false);
  });

  it("offers Settings for configuration failures, not parsing, transport, or generic failures", () => {
    for (const message of ["Invalid API key", "Model/API key mismatch", "Unable to reach the AI provider", "Connect to local server", "Ollama unavailable"]) {
      assert.equal(isChatConfigurationError(message), true, message);
    }
    for (const message of ["Failed to parse server response", "Failed to fetch", "Internal server error", "Syntax error", "An error occurred"]) {
      assert.equal(isChatConfigurationError(message), false, message);
    }
  });

  it("offers Settings for every local endpoint validation failure", () => {
    for (const endpoint of ["not a URL", "https://localhost:11434", "http://example.com:11434"]) {
      assert.throws(() => normalizeLocalEndpoint("ollama", endpoint), (error: unknown) =>
        error instanceof Error && isChatConfigurationError(error.message));
    }
  });
});
