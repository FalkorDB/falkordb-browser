/**
 * Shared utilities for local LLM endpoint configuration
 */

export type LocalProvider = "ollama" | "lmstudio";

export const LOCAL_PROVIDER_DEFAULT_ENDPOINTS: Record<LocalProvider, string> = {
    ollama: "http://localhost:11434",
    lmstudio: "http://localhost:1234/v1",
};

/**
 * Normalize and validate a local LLM endpoint URL.
 *
 * Accepts any loopback (localhost/127.0.0.1) http:// URL on any port and path so users
 * can point at LM Studio or Ollama wherever they actually run it. The loopback-only
 * restriction is kept as an SSRF safety guard. When no path is supplied, LM Studio
 * defaults to `/v1` (its OpenAI-compatible base) and Ollama defaults to `/`.
 *
 * @param provider - The local LLM provider (ollama or lmstudio)
 * @param endpoint - Optional custom endpoint URL
 * @returns Normalized endpoint URL (no trailing slash)
 * @throws Error if the endpoint is not a valid loopback http:// URL
 */
export const normalizeLocalEndpoint = (provider: LocalProvider, endpoint?: string) => {
    const rawEndpoint = endpoint?.trim() || LOCAL_PROVIDER_DEFAULT_ENDPOINTS[provider];

    let url: URL;
    try {
        url = new URL(rawEndpoint);
    } catch {
        throw new Error("Local LLM endpoint must be a valid http:// localhost or 127.0.0.1 URL.");
    }

    const hostname = url.hostname.toLowerCase();
    const isLoopback = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";

    if (url.protocol !== "http:" || !isLoopback) {
        throw new Error("Local LLM endpoint must be an http:// localhost or 127.0.0.1 URL.");
    }

    // Strip any trailing slashes so callers can append `/models` or `/api/tags` cleanly.
    let pathname = url.pathname.replace(/\/+$/, "");

    // Default the path only when the user did not provide one.
    if (pathname === "") {
        pathname = provider === "lmstudio" ? "/v1" : "/";
    }
    url.pathname = pathname;

    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
};
