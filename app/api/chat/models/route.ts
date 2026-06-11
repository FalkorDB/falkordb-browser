import { NextRequest, NextResponse } from "next/server";
import { detectProviderFromApiKey, getProviderDisplayName, type AIProvider } from "@/lib/ai-provider-utils";
import { getClient } from "../../auth/[...nextauth]/options";
import { getCorsHeaders } from "../../utils";

type ProviderModelResponse = {
    data?: Array<{ id?: string }>;
    models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
};

type LocalProvider = "ollama" | "lmstudio";

const MODEL_FETCH_TIMEOUT_MS = 4000;
const LOCAL_PROVIDER_LABELS: Record<LocalProvider, string> = {
    ollama: "Ollama",
    lmstudio: "LM Studio",
};
const LOCAL_PROVIDER_DEFAULT_ENDPOINTS: Record<LocalProvider, string> = {
    ollama: "http://localhost:11434",
    lmstudio: "http://localhost:1234/v1",
};

class ModelFetchError extends Error {
    constructor(
        provider: AIProvider,
        upstreamStatus: number
    ) {
        const providerName = getProviderDisplayName(provider);
        const message = upstreamStatus === 401 || upstreamStatus === 403
            ? `${providerName} rejected this API key. Check the key and try again.`
            : `Could not load live ${providerName} models right now. Try again later.`;

        super(message);
        this.status = upstreamStatus === 429 ? 429 : upstreamStatus >= 500 ? 502 : 400;
    }

    status: number;
}

class ModelFetchTimeoutError extends Error {
    constructor(providerName: string) {
        super(`Timed out loading live ${providerName} models. Check the endpoint and try again.`);
    }

    status = 504;
}

class ModelFetchAbortedError extends Error {
    constructor() {
        super("Model request was cancelled.");
    }

    status = 499;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

const withProviderPrefix = (provider: AIProvider, models: string[]) =>
    provider === "openai" ? models : models.map(model => `${provider}::${model}`);

const withLocalProviderPrefix = (provider: LocalProvider, models: string[]) =>
    models.map(model => provider === "ollama" ? `ollama::${model}` : `openai::${model}`);

const normalizeLocalEndpoint = (provider: LocalProvider, endpoint?: string) => {
    const rawEndpoint = endpoint?.trim() || LOCAL_PROVIDER_DEFAULT_ENDPOINTS[provider];
    const url = new URL(rawEndpoint);
    const hostname = url.hostname.toLowerCase();
    const isLoopback = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

    if (url.protocol !== "http:" || !isLoopback) {
        throw new Error("Local LLM endpoint must be an http:// localhost or 127.0.0.1 URL.");
    }

    const allowedPorts = provider === "ollama" ? new Set(["", "11434"]) : new Set(["", "1234"]);
    if (!allowedPorts.has(url.port)) {
        throw new Error(`Invalid ${LOCAL_PROVIDER_LABELS[provider]} endpoint port.`);
    }

    if (provider === "ollama") {
        if (url.pathname !== "/" && url.pathname !== "") {
            throw new Error("Ollama endpoint path must be root (/).");
        }
        url.pathname = "/";
    } else if (url.pathname === "/" || url.pathname === "") {
        url.pathname = "/v1";
    } else if (url.pathname !== "/v1") {
        throw new Error("LM Studio endpoint path must be /v1.");
    }

    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/$/, "");
};

const normalizeLocalProvider = (provider?: string): LocalProvider => provider === "lmstudio" ? "lmstudio" : "ollama";

const ensureOk = async (response: Response, provider: AIProvider) => {
    if (!response.ok) {
        throw new ModelFetchError(provider, response.status);
    }
};

const fetchProviderModels = async (
    providerName: string,
    url: string,
    init: RequestInit,
    abortSignal: AbortSignal
) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new ModelFetchTimeoutError(providerName)), MODEL_FETCH_TIMEOUT_MS);
    const abortProviderRequest = () => controller.abort(new ModelFetchAbortedError());
    abortSignal.addEventListener("abort", abortProviderRequest, { once: true });

    try {
        return await fetch(url, {
            ...init,
            cache: "no-store",
            signal: controller.signal,
        });
    } catch (error) {
        if (error instanceof ModelFetchTimeoutError || error instanceof ModelFetchAbortedError) {
            throw error;
        }
        if (controller.signal.reason instanceof ModelFetchTimeoutError || controller.signal.reason instanceof ModelFetchAbortedError) {
            throw controller.signal.reason;
        }
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new ModelFetchAbortedError();
        }

        throw error;
    } finally {
        clearTimeout(timeout);
        abortSignal.removeEventListener("abort", abortProviderRequest);
    }
};

const fetchOpenAICompatibleModels = async (
    provider: Extract<AIProvider, "openai" | "groq" | "xai">,
    url: string,
    key: string,
    abortSignal: AbortSignal
) => {
    const response = await fetchProviderModels(getProviderDisplayName(provider), url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${key}`,
        },
    }, abortSignal);
    await ensureOk(response, provider);
    const payload = await response.json() as ProviderModelResponse;
    const models = (payload.data ?? [])
        .map(model => model.id)
        .filter((model): model is string => Boolean(model))
        .sort((a, b) => a.localeCompare(b));

    return withProviderPrefix(provider, models);
};

const fetchAnthropicModels = async (key: string, abortSignal: AbortSignal) => {
    const response = await fetchProviderModels(getProviderDisplayName("anthropic"), "https://api.anthropic.com/v1/models", {
        method: "GET",
        headers: {
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
        },
    }, abortSignal);
    await ensureOk(response, "anthropic");
    const payload = await response.json() as ProviderModelResponse;
    const models = (payload.data ?? [])
        .map(model => model.id)
        .filter((model): model is string => Boolean(model))
        .sort((a, b) => a.localeCompare(b));

    return withProviderPrefix("anthropic", models);
};

const fetchGeminiModels = async (key: string, abortSignal: AbortSignal) => {
    const response = await fetchProviderModels(getProviderDisplayName("gemini"), "https://generativelanguage.googleapis.com/v1beta/models", {
        method: "GET",
        headers: {
            "x-goog-api-key": key,
        },
    }, abortSignal);
    await ensureOk(response, "gemini");
    const payload = await response.json() as ProviderModelResponse;
    const models = (payload.models ?? [])
        .filter(model => model.supportedGenerationMethods?.includes("generateContent"))
        .map(model => model.name?.replace(/^models\//, ""))
        .filter((model): model is string => Boolean(model))
        .sort((a, b) => a.localeCompare(b));

    return withProviderPrefix("gemini", models);
};

const fetchLocalModels = async (
    provider: LocalProvider,
    endpoint: string | undefined,
    abortSignal: AbortSignal
) => {
    const baseUrl = normalizeLocalEndpoint(provider, endpoint);
    const targetUrl = new URL(provider === "ollama" ? "api/tags" : "models", `${baseUrl}/`).toString();
    const response = await fetchProviderModels(LOCAL_PROVIDER_LABELS[provider], targetUrl, {
        method: "GET",
    }, abortSignal);

    if (!response.ok) {
        throw new Error(`Could not load local ${LOCAL_PROVIDER_LABELS[provider]} models (${response.status}). Check that the local server is running.`);
    }
    const payload = await response.json() as ProviderModelResponse;
    const models = (provider === "ollama"
        ? (payload.models ?? []).map(model => model.name)
        : (payload.data ?? []).map(model => model.id))
        .filter((model): model is string => Boolean(model))
        .sort((a, b) => a.localeCompare(b));

    return withLocalProviderPrefix(provider, models);
};

const fetchLiveModelsForKey = async (key: string, abortSignal: AbortSignal) => {
    const provider = detectProviderFromApiKey(key);

    switch (provider) {
        case "openai":
            return fetchOpenAICompatibleModels("openai", "https://api.openai.com/v1/models", key, abortSignal);
        case "anthropic":
            return fetchAnthropicModels(key, abortSignal);
        case "gemini":
            return fetchGeminiModels(key, abortSignal);
        case "groq":
            return fetchOpenAICompatibleModels("groq", "https://api.groq.com/openai/v1/models", key, abortSignal);
        case "xai":
            return fetchOpenAICompatibleModels("xai", "https://api.x.ai/v1/models", key, abortSignal);
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

        const body = await request.json() as {
            key?: string;
            source?: "api-key" | "local";
            localProvider?: LocalProvider;
            endpoint?: string;
        };
        if (body.source === "local") {
            const localProvider = normalizeLocalProvider(body.localProvider);
            const models = await fetchLocalModels(localProvider, body.endpoint, request.signal);
            return NextResponse.json(
                { models, providerName: LOCAL_PROVIDER_LABELS[localProvider] },
                { status: 200, headers: getCorsHeaders(request) }
            );
        }

        const key = body.key?.trim();
        if (!key) {
            return NextResponse.json(
                { error: "API key is required to load live models" },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        const models = await fetchLiveModelsForKey(key, request.signal);
        return NextResponse.json({ models }, { status: 200, headers: getCorsHeaders(request) });
    } catch (error) {
        if (!(error instanceof ModelFetchAbortedError)) {
            console.error("Error fetching live models:", error);
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: error instanceof ModelFetchError || error instanceof ModelFetchTimeoutError || error instanceof ModelFetchAbortedError ? error.status : 500, headers: getCorsHeaders(request) }
        );
    }
}
