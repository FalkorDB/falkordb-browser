import { NextRequest, NextResponse } from "next/server";
import { TextToCypher } from "@falkordb/text-to-cypher";
import { detectProviderFromApiKey, detectProviderFromModel, getProviderDisplayName } from "@/lib/ai-provider-utils";
import { normalizeLocalEndpoint } from "@/lib/local-llm-utils";
import { UDF_VERSION_THRESHOLD } from "@/app/utils";
import { getClient } from "../auth/[...nextauth]/options";
import { chatRequest, validateBody } from "../validate-body";
import { buildFalkorDBConnection, getCorsHeaders, corsPreflight } from "../utils";
import { createUserFriendlyErrorMessage } from "./errorMessage";

export const OPTIONS = corsPreflight;

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

    const { messages, graphName, key, model, cypherOnly, modelSource, localProvider, localEndpoint, udfs } = validation.data;

    try {
        // Fail fast on model/API key provider mismatch before making any external calls
        const modelProvider = detectProviderFromModel(model);
        const keyProvider = detectProviderFromApiKey(key);
        if (modelSource === "api-key" && !key) {
            throw new Error("API key is required for hosted models.");
        }
        if (modelSource === "api-key" && modelProvider !== "unknown" && keyProvider !== "unknown" && modelProvider !== keyProvider && modelProvider !== "ollama") {
            const modelProviderName = getProviderDisplayName(modelProvider);
            const keyProviderName = getProviderDisplayName(keyProvider);
            throw new Error(`Model/API key mismatch: You selected a ${modelProviderName} model but provided a ${keyProviderName} API key. Please update your API key in Settings to match your selected model.`);
        }

        // Build FalkorDB connection URL from user session
        const falkordbConnection = buildFalkorDBConnection(session.user);
        const llmEndpoint = modelSource === "local"
            ? normalizeLocalEndpoint(localProvider, localEndpoint)
            : undefined;

        // Only honor caller-supplied UDFs when the connected graph module actually supports them.
        // The client already gates on UDFContext, but the route must not trust a stale/tampered flag.
        // Reuse the already-authenticated session connection (no extra getClient / connection re-resolve).
        // Drop libraries with no functions: the schema permits empty `functions` arrays, but an empty
        // library is useless context, so a degenerate/tampered catalog degrades to "no UDF context"
        // instead of wasting prompt tokens.
        const nonEmptyUdfs = udfs?.filter((library) => library.functions.length > 0);
        let safeUdfs = nonEmptyUdfs && nonEmptyUdfs.length > 0 ? nonEmptyUdfs : undefined;
        if (safeUdfs) {
            try {
                const modules = await (await session.client.connection).moduleList();
                const graphModule = modules.find((module) => module.name === "graph");
                if (!graphModule || (graphModule.ver ?? 0) < UDF_VERSION_THRESHOLD) {
                    safeUdfs = undefined;
                }
            } catch {
                safeUdfs = undefined;
            }
        }

        // Create TextToCypher client
        const textToCypher = new TextToCypher({
            falkordbConnection,
            model,
            apiKey: modelSource === "local" ? localProvider : key,
            udfs: safeUdfs,
            llmEndpoint,
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
            confidence: result.confidence ?? null,
            tokenUsage: result.tokenUsage || null,
        }, { headers: getCorsHeaders(request) });

    } catch (error) {
        console.error('Text-to-Cypher error details:', error);

        const errorMessage = error instanceof Error ? error.message : String(error);
        const userFriendlyMessage = createUserFriendlyErrorMessage(error as Error, model, modelSource === "local" ? localProvider : key);

        // Return 400 for known client/state errors, 401 for auth errors, 422 for unexpected LLM/processing failures
        const authErrors = ["401", "invalid_api_key", "Incorrect API key", "Authentication failed", "Unauthorized"];
        const knownClientErrors = ["GRAPH_NOT_FOUND", "EMPTY_GRAPH", "Model/API key mismatch", "No messages provided", "No user messages found", "API key is required", "Local LLM endpoint", "endpoint port", "endpoint path"];
        const status = authErrors.some(e => errorMessage.includes(e))
            ? 401
            : knownClientErrors.some(e => errorMessage.includes(e))
                ? 400
                : 422;

        return NextResponse.json(
            { error: userFriendlyMessage },
            { status, headers: getCorsHeaders(request) }
        );
    }
}