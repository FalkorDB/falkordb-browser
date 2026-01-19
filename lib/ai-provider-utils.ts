/**
 * Utility functions for AI provider detection and model management
 */

export type AIProvider = "openai" | "anthropic" | "gemini" | "ollama" | "unknown";

/**
 * Detects the AI provider based on the API key format
 *
 * @param apiKey - The API key to analyze
 * @returns The detected provider
 *
 * @example
 * detectProviderFromApiKey("sk-proj-abc123") // returns "openai"
 * detectProviderFromApiKey("sk-ant-api03-xyz") // returns "anthropic"
 * detectProviderFromApiKey("AIzaSyABC123") // returns "gemini"
 */
export function detectProviderFromApiKey(apiKey: string | undefined): AIProvider {
    if (!apiKey || apiKey.trim() === "") {
        return "unknown";
    }

    const trimmedKey = apiKey.trim();

    // OpenAI: starts with "sk-proj-" (new format) or "sk-" (legacy)
    // Exclude Anthropic keys which also start with "sk-"
    if (trimmedKey.startsWith("sk-proj-") ||
        (trimmedKey.startsWith("sk-") && !trimmedKey.startsWith("sk-ant-"))) {
        return "openai";
    }

    // Anthropic: starts with "sk-ant-api03-"
    if (trimmedKey.startsWith("sk-ant-")) {
        return "anthropic";
    }

    // Google Gemini: typically starts with "AIza"
    if (trimmedKey.startsWith("AIza")) {
        return "gemini";
    }

    // Ollama doesn't require an API key
    // This is handled separately in the UI

    return "unknown";
}

/**
 * Gets the display name for a provider
 */
export function getProviderDisplayName(provider: AIProvider): string {
    switch (provider) {
        case "openai":
            return "OpenAI";
        case "anthropic":
            return "Anthropic";
        case "gemini":
            return "Google Gemini";
        case "ollama":
            return "Ollama";
        default:
            return "Unknown";
    }
}

/**
 * Checks if a provider requires an API key
 */
export function providerRequiresApiKey(provider: AIProvider): boolean {
    return provider !== "ollama";
}

/**
 * Gets helpful information about obtaining an API key for a provider
 */
export function getProviderApiKeyInfo(provider: AIProvider): {
    url: string;
    description: string;
} | null {
    switch (provider) {
        case "openai":
            return {
                url: "https://platform.openai.com/api-keys",
                description: "Get your OpenAI API key from the OpenAI Platform",
            };
        case "anthropic":
            return {
                url: "https://console.anthropic.com/settings/keys",
                description: "Get your Anthropic API key from the Anthropic Console",
            };
        case "gemini":
            return {
                url: "https://ai.google.dev/gemini-api/docs/api-key",
                description: "Get your Google Gemini API key from Google AI Studio",
            };
        case "ollama":
            return {
                url: "https://ollama.ai/",
                description: "Ollama runs locally and doesn't require an API key",
            };
        default:
            return null;
    }
}

/**
 * Detects the provider from a model name
 *
 * @param model - The model name (e.g., "gpt-4o-mini", "anthropic:claude-3-5-sonnet-20241022")
 * @returns The provider type
 *
 * @example
 * detectProviderFromModel("gpt-4o-mini") // returns "openai"
 * detectProviderFromModel("anthropic:claude-3-5-sonnet-20241022") // returns "anthropic"
 */
export function detectProviderFromModel(model: string): AIProvider {
    if (model.startsWith("gpt")) return "openai";
    if (model.includes("claude") || model.startsWith("anthropic:")) return "anthropic";
    if (model.includes("gemini") || model.startsWith("gemini:")) return "gemini";
    if (model.includes("llama") || model.includes("mixtral") || model.includes("phi") || model.startsWith("ollama:")) return "ollama";
    return "unknown";
}

/**
 * Formats model names for better display in the UI
 *
 * @param modelValue - The internal model value (e.g., "anthropic:claude-3-5-sonnet-20241022")
 * @returns Formatted display name (e.g., "claude-3-5-sonnet")
 *
 * @example
 * formatModelDisplayName("anthropic:claude-3-5-sonnet-20241022") // "claude-3-5-sonnet"
 * formatModelDisplayName("gemini:gemini-1.5-flash") // "gemini-1.5-flash"
 * formatModelDisplayName("gpt-4o-mini") // "gpt-4o-mini"
 */
export function formatModelDisplayName(modelValue: string): string {
    // Remove provider prefix (e.g., "anthropic:", "gemini:", "ollama:")
    let withoutPrefix = modelValue;
    if (modelValue.includes(':')) {
        const parts = modelValue.split(':');
        // Handle edge case where model ends with colon or has multiple colons
        withoutPrefix = parts.slice(1).join(':') || modelValue;
    }

    // Remove date suffixes (e.g., "-20241022", "-20240229")
    const withoutDate = withoutPrefix.replace(/-\d{8}$/, '');

    return withoutDate;
}

/**
 * Creates a mapping of display names to actual model values
 * Used for the combobox to show clean names but submit actual values
 *
 * @param models - Array of model values
 * @returns Object mapping display names to actual values
 */
export function createModelDisplayMapping(models: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};

    models.forEach(model => {
        const displayName = formatModelDisplayName(model);
        mapping[displayName] = model;
    });

    return mapping;
}
