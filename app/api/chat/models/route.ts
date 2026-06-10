import { NextRequest, NextResponse } from "next/server";
import { detectProviderFromApiKey, getProviderDisplayName, type AIProvider } from "@/lib/ai-provider-utils";
import { getClient } from "../../auth/[...nextauth]/options";
import { getCorsHeaders } from "../../utils";

type ProviderModelResponse = {
    data?: Array<{ id?: string }>;
    models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
};

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

const withProviderPrefix = (provider: AIProvider, models: string[]) =>
    provider === "openai" ? models : models.map(model => `${provider}::${model}`);

const ensureOk = async (response: Response, provider: AIProvider) => {
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`${getProviderDisplayName(provider)} model request failed (${response.status}): ${text}`);
    }
};

const fetchOpenAICompatibleModels = async (
    provider: Extract<AIProvider, "openai" | "groq" | "xai">,
    url: string,
    key: string
) => {
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
    });
    await ensureOk(response, provider);
    const payload = await response.json() as ProviderModelResponse;
    const models = (payload.data ?? [])
        .map(model => model.id)
        .filter((model): model is string => Boolean(model))
        .sort((a, b) => a.localeCompare(b));

    return withProviderPrefix(provider, models);
};

const fetchAnthropicModels = async (key: string) => {
    const response = await fetch("https://api.anthropic.com/v1/models", {
        method: "GET",
        headers: {
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
        },
        cache: "no-store",
    });
    await ensureOk(response, "anthropic");
    const payload = await response.json() as ProviderModelResponse;
    const models = (payload.data ?? [])
        .map(model => model.id)
        .filter((model): model is string => Boolean(model))
        .sort((a, b) => a.localeCompare(b));

    return withProviderPrefix("anthropic", models);
};

const fetchGeminiModels = async (key: string) => {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
        method: "GET",
        headers: {
            "x-goog-api-key": key,
        },
        cache: "no-store",
    });
    await ensureOk(response, "gemini");
    const payload = await response.json() as ProviderModelResponse;
    const models = (payload.models ?? [])
        .filter(model => model.supportedGenerationMethods?.includes("generateContent"))
        .map(model => model.name?.replace(/^models\//, ""))
        .filter((model): model is string => Boolean(model))
        .sort((a, b) => a.localeCompare(b));

    return withProviderPrefix("gemini", models);
};

const fetchLiveModelsForKey = async (key: string) => {
    const provider = detectProviderFromApiKey(key);

    switch (provider) {
        case "openai":
            return fetchOpenAICompatibleModels("openai", "https://api.openai.com/v1/models", key);
        case "anthropic":
            return fetchAnthropicModels(key);
        case "gemini":
            return fetchGeminiModels(key);
        case "groq":
            return fetchOpenAICompatibleModels("groq", "https://api.groq.com/openai/v1/models", key);
        case "xai":
            return fetchOpenAICompatibleModels("xai", "https://api.x.ai/v1/models", key);
        default:
            throw new Error("Could not detect the provider for this key. Add a supported OpenAI, Anthropic, Gemini, Groq, or xAI key.");
    }
};

/**
 * POST endpoint to fetch live AI models for a selected user-provided key.
 * This intentionally bypasses text-to-cypher's static fallback catalog.
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getClient(request);

        if (session instanceof NextResponse) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: getCorsHeaders(request) }
            );
        }

        const body = await request.json() as { key?: string };
        const key = body.key?.trim();
        if (!key) {
            return NextResponse.json(
                { error: "API key is required to load live models" },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        const models = await fetchLiveModelsForKey(key);
        return NextResponse.json({ models }, { status: 200, headers: getCorsHeaders(request) });
    } catch (error) {
        console.error("Error fetching live models:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500, headers: getCorsHeaders(request) }
        );
    }
}
