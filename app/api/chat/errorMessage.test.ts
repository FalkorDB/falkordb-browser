import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createUserFriendlyErrorMessage } from "./errorMessage.ts";

const OPENAI_KEY = "sk-proj-placeholder";
const ANTHROPIC_KEY = "sk-ant-placeholder";

describe("createUserFriendlyErrorMessage", () => {
    it("reports a model/API key provider mismatch before anything else", () => {
        assert.equal(
            createUserFriendlyErrorMessage(new Error("401 Unauthorized"), "anthropic::claude-sonnet-4-5", OPENAI_KEY),
            "Model/API key mismatch: You selected a Anthropic model but provided a OpenAI API key. Please update your API key in Settings to match your selected model.",
        );
    });

    it("does not treat an Ollama model with any key as a mismatch", () => {
        assert.equal(createUserFriendlyErrorMessage(new Error("boom"), "ollama::llama3", OPENAI_KEY), "boom");
    });

    it("does not report a mismatch when the provider or the key is unknown", () => {
        assert.equal(createUserFriendlyErrorMessage(new Error("boom"), "mystery-model", OPENAI_KEY), "boom");
        assert.equal(createUserFriendlyErrorMessage(new Error("boom"), "gpt-4o-mini", "not-a-known-key"), "boom");
    });

    it("does not report a mismatch when the model and key providers agree", () => {
        assert.equal(createUserFriendlyErrorMessage(new Error("boom"), "anthropic::claude-sonnet-4-5", ANTHROPIC_KEY), "boom");
    });

    describe("Ollama model not found", () => {
        const notFound = new Error("404 model not found");

        it("strips the double-colon provider prefix and keeps colons inside the model name", () => {
            for (const [model, name] of [["ollama::llama3", "llama3"], ["ollama::llama3:8b", "llama3:8b"]]) {
                assert.equal(
                    createUserFriendlyErrorMessage(notFound, model, ""),
                    `Ollama model "${name}" not found. Please ensure Ollama is running locally and the model is pulled. Run: ollama pull ${name}`,
                );
            }
        });

        it("strips the legacy single-colon prefix and leaves an unprefixed name alone", () => {
            for (const model of ["ollama:llama3", "llama3"]) {
                assert.equal(
                    createUserFriendlyErrorMessage(notFound, model, ""),
                    'Ollama model "llama3" not found. Please ensure Ollama is running locally and the model is pulled. Run: ollama pull llama3',
                );
            }
        });
    });

    it("explains a hosted model that was not found", () => {
        assert.equal(
            createUserFriendlyErrorMessage(new Error("404 model not found"), "gpt-9", OPENAI_KEY),
            'Model "gpt-9" not found. Please check if this model is available for your OpenAI account or select a different model in Settings.',
        );
    });

    it("maps every authentication failure signature to an invalid-key message", () => {
        for (const message of ["401", "invalid_api_key", "Incorrect API key provided", "Authentication failed", "Unauthorized"]) {
            assert.equal(
                createUserFriendlyErrorMessage(new Error(message), "gpt-4o-mini", OPENAI_KEY),
                "Invalid OpenAI API key. Please check your API key in Settings and ensure it is correct.",
            );
        }
        // The double space is the current (cosmetic) output when the key provider is unknown.
        assert.equal(
            createUserFriendlyErrorMessage(new Error("401"), "gpt-4o-mini", ""),
            "Invalid  API key. Please check your API key in Settings and ensure it is correct.",
        );
    });

    it("maps other API key errors to a generic key message", () => {
        for (const message of ["API key is required for hosted models.", "missing api_key"]) {
            assert.equal(
                createUserFriendlyErrorMessage(new Error(message), "gpt-4o-mini", ""),
                "API key error. Please verify your API key in Settings matches your selected model provider.",
            );
        }
    });

    it("maps connection failures, naming Ollama when it is the model provider", () => {
        for (const message of ["fetch failed", "connect ECONNREFUSED", "read ECONNRESET"]) {
            assert.equal(
                createUserFriendlyErrorMessage(new Error(message), "gpt-4o-mini", OPENAI_KEY),
                "Network error. Please check your internet connection and try again.",
            );
            assert.equal(
                createUserFriendlyErrorMessage(new Error(message), "ollama::llama3", ""),
                "Cannot connect to Ollama. Please ensure Ollama is running locally on your machine.",
            );
        }
    });

    it("maps the graph state sentinels", () => {
        assert.equal(
            createUserFriendlyErrorMessage(new Error("EMPTY_GRAPH"), "gpt-4o-mini", OPENAI_KEY),
            "Your graph is empty. Add some data to your graph before using the chat.",
        );
        assert.equal(
            createUserFriendlyErrorMessage(new Error("GRAPH_NOT_FOUND"), "gpt-4o-mini", OPENAI_KEY),
            "Graph not found. Please select an existing graph.",
        );
    });

    it("maps every timeout signature", () => {
        for (const message of ["timeout", "Timeout exceeded", "connect ETIMEDOUT"]) {
            assert.equal(
                createUserFriendlyErrorMessage(new Error(message), "gpt-4o-mini", OPENAI_KEY),
                "Request timed out. Try a simpler question or check your connection.",
            );
        }
    });

    it("maps query generation failures", () => {
        for (const message of ["Query validation failed: x", "Query does not contain valid Cypher keywords"]) {
            assert.equal(
                createUserFriendlyErrorMessage(new Error(message), "gpt-4o-mini", OPENAI_KEY),
                "Could not generate a query from your question. Try asking a more specific question about your data.",
            );
        }
        for (const message of ["Text-to-Cypher failed", "Failed to generate query"]) {
            assert.equal(
                createUserFriendlyErrorMessage(new Error(message), "gpt-4o-mini", OPENAI_KEY),
                "Unable to generate a database query from your question.",
            );
        }
    });

    it("falls back to the original message, stringifying non-Error values", () => {
        assert.equal(createUserFriendlyErrorMessage(new Error("something odd"), "gpt-4o-mini", OPENAI_KEY), "something odd");
        assert.equal(createUserFriendlyErrorMessage("plain string", "gpt-4o-mini", OPENAI_KEY), "plain string");
    });
});
