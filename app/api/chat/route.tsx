import { NextRequest, NextResponse } from "next/server";
import { TextToCypher } from "@falkordb/text-to-cypher";
import { detectProviderFromApiKey, detectProviderFromModel, getProviderDisplayName } from "@/lib/ai-provider-utils";
import { getClient } from "../auth/[...nextauth]/options";
import { chatRequest, validateBody } from "../validate-body";
import { buildFalkorDBConnection, getCorsHeaders } from "../utils";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request: NextRequest) {
    try {
        const session = await getClient(request);

        if (session instanceof NextResponse) {
            return session;
        }

        // Return empty object to allow chat to be displayed
        // The actual model configuration is provided by the user in the frontend
        return NextResponse.json({}, { status: 200, headers: getCorsHeaders(request) });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500, headers: getCorsHeaders(request) });
    }
}

export type EventType = "Status" | "Schema" | "CypherQuery" | "CypherResult" | "ModelOutputChunk" | "Result" | "Error";

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
    if (errorMessage.includes("401") || errorMessage.includes("invalid_api_key") || errorMessage.includes("Incorrect API key")) {
        const provider = keyProvider !== "unknown" ? keyProviderName : "";
        return `Invalid ${provider} API key. Please check your API key in Settings and ensure it is correct.`;
    }

    // Check for other API key errors
    if (errorMessage.includes("API key") || errorMessage.includes("api_key")) {
        return "API key error. Please verify your API key in Settings matches your selected model provider.";
    }

    // Check for network/connection errors
    if (errorMessage.includes("fetch failed") || errorMessage.includes("ECONNREFUSED")) {
        if (modelProvider === "ollama") {
            return "Cannot connect to Ollama. Please ensure Ollama is running locally on your machine.";
        }
        return "Network error. Please check your internet connection and try again.";
    }

    // Check for text-to-cypher query generation failures
    if (errorMessage.includes("Query validation failed") || errorMessage.includes("Query does not contain valid Cypher keywords")) {
        return "Failed to convert your question to a valid database query.";
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
    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    try {
        // Verify authentication via getClient
        const session = await getClient(request);

        if (session instanceof NextResponse) {
            return session;
        }

        const body = await request.json();

        // Validate request body
        const validation = validateBody(chatRequest, body);

        if (!validation.success) {
            writer.write(encoder.encode(`event: error status: ${400} data: ${JSON.stringify(validation.error)}\n\n`));
            writer.close();

            return new Response(readable, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                    ...getCorsHeaders(request),
                },
            });
        }

        const { messages, graphName, key, model } = validation.data;

        // Validate required parameters
        if (!key) {
            writer.write(encoder.encode(`event: error status: ${400} data: "API key is required. Please configure it in Settings."\n\n`));
            writer.close();

            return new Response(readable, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                    ...getCorsHeaders(request),
                },
            });
        }

        try {
            // Build FalkorDB connection URL from user session
            const falkordbConnection = buildFalkorDBConnection(session.user);

            // Create TextToCypher client
            const textToCypher = new TextToCypher({
                falkordbConnection,
                model: model || "gpt-4o-mini",
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

            // Call textToCypher and get the result
            const result = await textToCypher.textToCypher(graphName, question);

            // Check if the result has an error status
            if (result.status === 'error') {
                throw new Error(result.error || 'Text-to-Cypher failed');
            }

            // Send result events
            if (result.schema) {
                writer.write(encoder.encode(`event: Schema data: ${JSON.stringify(result.schema)}\n\n`));
            }

            if (result.cypherQuery) {
                writer.write(encoder.encode(`event: CypherQuery data: ${result.cypherQuery}\n\n`));
            }

            if (result.cypherResult) {
                writer.write(encoder.encode(`event: CypherResult data: ${JSON.stringify(result.cypherResult)}\n\n`));
            }

            if (result.answer) {
                writer.write(encoder.encode(`event: Result data: ${JSON.stringify(result.answer)}\n\n`));
            }

            writer.close();
        } catch (error) {
            console.error('Text-to-Cypher error details:', error);

            // Create user-friendly error message
            const userFriendlyMessage = createUserFriendlyErrorMessage(error as Error, model || "gpt-4o-mini", key);

            writer.write(encoder.encode(`event: error status: ${400} data: ${JSON.stringify(userFriendlyMessage)}\n\n`));
            writer.close();
        }
    } catch (error) {
        console.error(error);
        writer.write(encoder.encode(`event: error status: ${500} data: ${JSON.stringify((error as Error).message)}\n\n`));
        writer.close();
    }

    request.signal.addEventListener("abort", () => {
        writer.close();
    });

    return new Response(readable, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            ...getCorsHeaders(request),
        },
    });
}