import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    KNOWN_PROVIDERS,
    createModelDisplayMapping,
    detectProviderFromApiKey,
    detectProviderFromModel,
    formatModelDisplayName,
    getProviderApiKeyInfo,
    getProviderDisplayName,
    prefixProviderModels,
    providerRequiresApiKey,
    type AIProvider,
} from "./ai-provider-utils.ts";

describe("detectProviderFromApiKey", () => {
    const cases: [string, string | undefined, AIProvider][] = [
        ["undefined", undefined, "unknown"],
        ["empty", "", "unknown"],
        ["whitespace only", "   ", "unknown"],
        ["sk-proj- (new OpenAI)", "sk-proj-abc123", "openai"],
        ["sk- (legacy OpenAI)", "sk-abc123", "openai"],
        ["sk-ant- (Anthropic)", "sk-ant-api03-xyz", "anthropic"],
        ["AIza (Gemini)", "AIzaSyABC123", "gemini"],
        ["gsk_ (Groq)", "gsk_abc123", "groq"],
        ["xai- (xAI)", "xai-abc123", "xai"],
        ["surrounding whitespace is trimmed", "  sk-ant-api03-xyz\n", "anthropic"],
        ["unrecognized prefix", "abc123", "unknown"],
        ["prefix is case-sensitive", "SK-abc123", "unknown"],
    ];

    for (const [name, key, expected] of cases) {
        it(`${name} -> ${expected}`, () => {
            assert.equal(detectProviderFromApiKey(key), expected);
        });
    }
});

describe("provider metadata", () => {
    const metadata: [AIProvider, string, boolean, { url: string; description: string } | null][] = [
        ["openai", "OpenAI", true, {
            url: "https://platform.openai.com/api-keys",
            description: "Get your OpenAI API key from the OpenAI Platform",
        }],
        ["anthropic", "Anthropic", true, {
            url: "https://console.anthropic.com/settings/keys",
            description: "Get your Anthropic API key from the Anthropic Console",
        }],
        ["gemini", "Google Gemini", true, {
            url: "https://ai.google.dev/gemini-api/docs/api-key",
            description: "Get your Google Gemini API key from Google AI Studio",
        }],
        ["ollama", "Ollama", false, {
            url: "https://ollama.ai/",
            description: "Ollama runs locally and doesn't require an API key",
        }],
        ["groq", "Groq", true, {
            url: "https://console.groq.com/keys",
            description: "Get your Groq API key from the Groq Console",
        }],
        ["cohere", "Cohere", true, {
            url: "https://dashboard.cohere.com/api-keys",
            description: "Get your Cohere API key from the Cohere Dashboard",
        }],
        ["xai", "xAI", true, {
            url: "https://console.x.ai/",
            description: "Get your xAI API key from the xAI Console",
        }],
        ["unknown", "Unknown", true, null],
    ];

    for (const [provider, displayName, requiresKey, info] of metadata) {
        it(`${provider}: display name, API-key requirement and key info`, () => {
            assert.equal(getProviderDisplayName(provider), displayName);
            assert.equal(providerRequiresApiKey(provider), requiresKey);
            assert.deepEqual(getProviderApiKeyInfo(provider), info);
        });
    }

    it("has metadata for every known provider", () => {
        assert.deepEqual(
            metadata.map(([provider]) => provider).filter(provider => provider !== "unknown"),
            KNOWN_PROVIDERS,
        );
    });
});

describe("detectProviderFromModel", () => {
    const cases: [string, string, AIProvider][] = [
        ["new format prefix", "anthropic::claude-sonnet-4-5", "anthropic"],
        ["new format prefix wins over name heuristics", "ollama::gpt-oss", "ollama"],
        ["legacy single-colon prefix", "gemini:gemini-1.5-flash", "gemini"],
        ["legacy prefix wins over name heuristics", "groq:llama-3.1-8b", "groq"],
        ["unknown :: prefix falls back to heuristics", "foo::claude-3", "anthropic"],
        ["unknown : prefix falls back to heuristics", "foo:claude-3", "anthropic"],
        ["unknown prefix and unknown name", "foo::bar", "unknown"],
        ["gpt", "gpt-4o-mini", "openai"],
        ["chatgpt-", "chatgpt-4o-latest", "openai"],
        ["codex-", "codex-mini-latest", "openai"],
        ["o-series", "o3-mini", "openai"],
        ["claude", "claude-3-5-sonnet-20241022", "anthropic"],
        ["gemini", "gemini-2.0-flash", "gemini"],
        ["llama", "llama3.2", "ollama"],
        ["mixtral", "mixtral-8x7b", "ollama"],
        ["phi", "phi3", "ollama"],
        ["deepseek", "deepseek-r1", "ollama"],
        ["groq", "groq-compound", "groq"],
        ["command", "command-r-plus", "cohere"],
        ["cohere", "cohere-embed", "cohere"],
        ["grok", "grok-3", "xai"],
        ["gpt must be a prefix", "my-gpt-model", "unknown"],
        ["empty string", "", "unknown"],
    ];

    for (const [name, model, expected] of cases) {
        it(`${name}: ${JSON.stringify(model)} -> ${expected}`, () => {
            assert.equal(detectProviderFromModel(model), expected);
        });
    }
});

describe("formatModelDisplayName", () => {
    const cases: [string, string, string][] = [
        ["unprefixed name is unchanged", "gpt-4o-mini", "gpt-4o-mini"],
        ["new format prefix is stripped", "openai::gpt-4o", "gpt-4o"],
        ["legacy known prefix is stripped", "gemini:gemini-1.5-flash", "gemini-1.5-flash"],
        ["legacy unknown prefix is kept (e.g. ollama tag)", "llama3:8b", "llama3:8b"],
        ["trailing date suffix is removed", "anthropic::claude-3-5-sonnet-20241022", "claude-3-5-sonnet"],
        ["legacy prefix and date suffix", "anthropic:claude-3-opus-20240229", "claude-3-opus"],
        ["only an 8-digit trailing date is removed", "model-2024", "model-2024"],
        ["a date that is not trailing is kept", "model-20241022-beta", "model-20241022-beta"],
        ["only the first :: separator is stripped", "ollama::llama3::8b", "llama3::8b"],
        ["empty string", "", ""],
    ];

    for (const [name, input, expected] of cases) {
        it(`${name}`, () => {
            assert.equal(formatModelDisplayName(input), expected);
        });
    }
});

describe("createModelDisplayMapping", () => {
    it("maps display names to the original model values", () => {
        assert.deepEqual(
            createModelDisplayMapping([
                "anthropic::claude-3-5-sonnet-20241022",
                "openai::gpt-4o",
                "gemini:gemini-1.5-flash",
            ]),
            {
                "claude-3-5-sonnet": "anthropic::claude-3-5-sonnet-20241022",
                "gpt-4o": "openai::gpt-4o",
                "gemini-1.5-flash": "gemini:gemini-1.5-flash",
            },
        );
    });

    it("keeps the last model when display names collide", () => {
        assert.deepEqual(
            createModelDisplayMapping(["openai::gpt-4o", "gpt-4o"]),
            { "gpt-4o": "gpt-4o" },
        );
    });

    it("returns an empty mapping for no models", () => {
        assert.deepEqual(createModelDisplayMapping([]), {});
    });
});

describe("prefixProviderModels", () => {
    it("prefixes every model with the provider and ::", () => {
        assert.deepEqual(
            prefixProviderModels("anthropic", ["claude-3", "claude-4"]),
            ["anthropic::claude-3", "anthropic::claude-4"],
        );
    });

    it("returns an empty list for no models", () => {
        assert.deepEqual(prefixProviderModels("openai", []), []);
    });

    it("produces values that round-trip through detect and format", () => {
        for (const provider of KNOWN_PROVIDERS) {
            const [value] = prefixProviderModels(provider as Exclude<AIProvider, "unknown">, ["some-model"]);
            assert.equal(detectProviderFromModel(value), provider);
            assert.equal(formatModelDisplayName(value), "some-model");
        }
    });
});
