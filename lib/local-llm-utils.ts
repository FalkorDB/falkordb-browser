/**
 * Shared utilities for local LLM endpoint configuration
 */

export type LocalProvider = "ollama" | "lmstudio";

export const LOCAL_PROVIDER_DEFAULT_ENDPOINTS: Record<LocalProvider, string> = {
    ollama: "http://localhost:11434",
    lmstudio: "http://localhost:1234/v1",
};

/**
 * Normalize and validate a local LLM endpoint URL
 * @param provider - The local LLM provider (ollama or lmstudio)
 * @param endpoint - Optional custom endpoint URL
 * @returns Normalized endpoint URL
 * @throws Error if the endpoint is invalid
 */
export const normalizeLocalEndpoint = (provider: LocalProvider, endpoint?: string) => {
    const rawEndpoint = endpoint?.trim() || LOCAL_PROVIDER_DEFAULT_ENDPOINTS[provider];
    const url = new URL(rawEndpoint);
    const hostname = url.hostname.toLowerCase();
    const isLoopback = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

    if (url.protocol !== "http:" || !isLoopback) {
        throw new Error("Local LLM endpoint must be an http:// localhost or 127.0.0.1 URL.");
    }

    // Only allow explicit provider ports, not empty string (which would allow http://localhost/)
    const allowedPorts = provider === "ollama" ? new Set(["11434"]) : new Set(["1234"]);
    if (!allowedPorts.has(url.port)) {
        throw new Error(`Invalid ${provider === "ollama" ? "Ollama" : "LM Studio"} endpoint port.`);
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
