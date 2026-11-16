import { getProviderModelName } from "../../../lib/aiFix.ts";
import { detectProviderFromApiKey, detectProviderFromModel, getProviderDisplayName } from "../../../lib/ai-provider-utils.ts";

/**
 * Create user-friendly error message
 */
export function createUserFriendlyErrorMessage(error: unknown, model: string, apiKey: string): string {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const modelProvider = detectProviderFromModel(model);
    const keyProvider = detectProviderFromApiKey(apiKey);

    // Get display names for providers
    const modelProviderName = getProviderDisplayName(modelProvider);
    const keyProviderName = getProviderDisplayName(keyProvider);

    // Check for provider mismatch (critical error - show first)
    if (modelProvider !== "unknown" && keyProvider !== "unknown" && modelProvider !== keyProvider) {
        // Ollama doesn't need an API key match
        if (modelProvider !== "ollama") {
            return `Model/API key mismatch: You selected a ${modelProviderName} model but provided a ${keyProviderName} API key. Please update your API key in Settings to match your selected model.`;
        }
    }

    // Check for 404 model not found errors
    if (errorMessage.includes("404") && errorMessage.includes("model") && errorMessage.includes("not found")) {
        if (modelProvider === "ollama") {
            const modelName = getProviderModelName(model);
            return `Ollama model "${modelName}" not found. Please ensure Ollama is running locally and the model is pulled. Run: ollama pull ${modelName}`;
        }
        return `Model "${model}" not found. Please check if this model is available for your ${modelProviderName} account or select a different model in Settings.`;
    }

    // Check for authentication errors
    if (errorMessage.includes("401") || errorMessage.includes("invalid_api_key") || errorMessage.includes("Incorrect API key") || errorMessage.includes("Authentication failed") || errorMessage.includes("Unauthorized")) {
        const provider = keyProvider !== "unknown" ? keyProviderName : "";
        return `Invalid ${provider} API key. Please check your API key in Settings and ensure it is correct.`;
    }

    // Check for other API key errors
    if (errorMessage.includes("API key") || errorMessage.includes("api_key")) {
        return "API key error. Please verify your API key in Settings matches your selected model provider.";
    }

    // Check for network/connection errors
    if (errorMessage.includes("fetch failed") || errorMessage.includes("ECONNREFUSED") || errorMessage.includes("ECONNRESET")) {
        if (modelProvider === "ollama") {
            return "Cannot connect to Ollama. Please ensure Ollama is running locally on your machine.";
        }
        return "Network error. Please check your internet connection and try again.";
    }

    // Check for empty or non-existent graph
    if (errorMessage === "EMPTY_GRAPH") {
        return "Your graph is empty. Add some data to your graph before using the chat.";
    }
    if (errorMessage === "GRAPH_NOT_FOUND") {
        return "Graph not found. Please select an existing graph.";
    }

    // Check for timeout errors
    if (errorMessage.includes("timeout") || errorMessage.includes("Timeout") || errorMessage.includes("ETIMEDOUT")) {
        return "Request timed out. Try a simpler question or check your connection.";
    }

    // Check for text-to-cypher query generation failures
    if (errorMessage.includes("Query validation failed") || errorMessage.includes("Query does not contain valid Cypher keywords")) {
        return "Could not generate a query from your question. Try asking a more specific question about your data.";
    }

    // Check for general text-to-cypher failures
    if (errorMessage.includes("Text-to-Cypher failed") || errorMessage.includes("Failed to generate query")) {
        return "Unable to generate a database query from your question.";
    }

    // Default: return original error message
    return errorMessage;
}
