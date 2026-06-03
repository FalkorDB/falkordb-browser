import { NextRequest, NextResponse } from "next/server";
import { TextToCypher } from "@falkordb/text-to-cypher";
import { detectProviderFromApiKey, detectProviderFromModel, getProviderDisplayName } from "@/lib/ai-provider-utils";
import { getClient } from "../auth/[...nextauth]/options";
import { chatRequest, validateBody } from "../validate-body";
import { buildFalkorDBConnection, getCorsHeaders } from "../utils";

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * Create user-friendly error message
 */
function createUserFriendlyErrorMessage(error: unknown, model: string, apiKey: string): string {
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
            const modelName = model.replace("ollama:", "");
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

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {

    let session;
    try {
        // Verify authentication via getClient
        session = await getClient(request);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: getCorsHeaders(request) });
    }

    if (session instanceof NextResponse) {
        return session;
    }

    let body;
    try {
        body = await request.json();
    } catch (error) {
        console.error(error);
        return new Response("Invalid JSON body", { status: 400, headers: getCorsHeaders(request) });
    }

    // Validate request body
    const validation = validateBody(chatRequest, body);

    if (!validation.success) {
        return NextResponse.json(
            { error: validation.error },
            { status: 400, headers: getCorsHeaders(request) }
        );
    }

    const { messages, graphName, key, model, cypherOnly } = validation.data;

    try {
        // Fail fast on model/API key provider mismatch before making any external calls
        const modelProvider = detectProviderFromModel(model);
        const keyProvider = detectProviderFromApiKey(key);
        if (modelProvider !== "unknown" && keyProvider !== "unknown" && modelProvider !== keyProvider && modelProvider !== "ollama") {
            const modelProviderName = getProviderDisplayName(modelProvider);
            const keyProviderName = getProviderDisplayName(keyProvider);
            throw new Error(`Model/API key mismatch: You selected a ${modelProviderName} model but provided a ${keyProviderName} API key. Please update your API key in Settings to match your selected model.`);
        }

        // Build FalkorDB connection URL from user session
        const falkordbConnection = buildFalkorDBConnection(session.user);

        // Create TextToCypher client
        const textToCypher = new TextToCypher({
            falkordbConnection,
            model,
            apiKey: key,
        });

        // Get the last user message
        if (messages.length === 0) {
            throw new Error('No messages provided');
        }
        const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
        if (!lastUserMessage) {
            throw new Error('No user messages found');
        }
        const question = lastUserMessage.content;

        // Check if graph exists and has data before calling text-to-cypher
        const graphs = await session.client.list();
        if (!graphs.includes(graphName)) {
            throw new Error("GRAPH_NOT_FOUND");
        }
        const graph = session.client.selectGraph(graphName);
        const existsResult = await graph.roQuery("MATCH (n) RETURN 1 LIMIT 1");
        if (!existsResult?.data?.length) {
            throw new Error("EMPTY_GRAPH");
        }

        // Call textToCypher and get the result
        const result = cypherOnly
            ? await textToCypher.cypherOnly(graphName, question)
            : await textToCypher.textToCypher(graphName, question);

        // Check if the result has an error status
        if (result.status === 'error') {
            throw new Error(result.error || 'Text-to-Cypher failed');
        }

        return NextResponse.json({
            cypherQuery: result.cypherQuery || null,
            cypherResult: result.cypherResult || null,
            answer: result.answer || null,
            confidence: (result as { confidence?: number }).confidence ?? null,
            tokenUsage: result.tokenUsage || null,
        }, { headers: getCorsHeaders(request) });

    } catch (error) {
        console.error('Text-to-Cypher error details:', error);

        const userFriendlyMessage = createUserFriendlyErrorMessage(error as Error, model, key);

        return NextResponse.json(
            { error: userFriendlyMessage },
            { status: 500, headers: getCorsHeaders(request) }
        );
    }
}