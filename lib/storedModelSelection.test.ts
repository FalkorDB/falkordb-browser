import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { selectStoredModel } from "./storedModelSelection.ts";

const models = ["openai::gpt-5", "openai::gpt-4o-mini", "openai::o5-mini", "openai::chatgpt-4o-latest"];

describe("selectStoredModel", () => {
    it("keeps a stored model the list still offers", () => {
        assert.equal(selectStoredModel("openai::gpt-4o-mini", models), "openai::gpt-4o-mini");
    });

    it("migrates legacy unprefixed OpenAI IDs to their prefixed entry", () => {
        for (const legacy of ["gpt-4o-mini", "o5-mini", "chatgpt-4o-latest"]) {
            assert.equal(selectStoredModel(legacy, models), `openai::${legacy}`);
        }
    });

    it("falls back to the first model when the stored one is missing, empty or from another provider", () => {
        assert.equal(selectStoredModel("gpt-3.5-turbo", models), "openai::gpt-5");
        assert.equal(selectStoredModel("", models), "openai::gpt-5");
        assert.equal(selectStoredModel("anthropic::gpt-4o-mini", models), "openai::gpt-5");
    });
});
