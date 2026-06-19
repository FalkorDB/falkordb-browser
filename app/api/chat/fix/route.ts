import { NextRequest, NextResponse } from "next/server";
import { buildFixMessages, parseFixResponse, getProviderModelName, getChatCompletionsUrl, resolveFixTarget } from "@/lib/aiFix";
import { getClient } from "../../auth/[...nextauth]/options";
import { fixRequest, validateBody } from "../../validate-body";
import { getCorsHeaders } from "../../utils";

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

const REQUEST_TIMEOUT_MS = 30_000;

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
    let session;
    try {
        session = await getClient(request);
    } catch {
        console.error("Fix-with-AI auth error");
        return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: getCorsHeaders(request) });
    }

    if (session instanceof NextResponse) {
        return session;
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: getCorsHeaders(request) });
    }

    const validation = validateBody(fixRequest, body);
    if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400, headers: getCorsHeaders(request) });
    }

    const { query, errorMessage, hint, key, model, modelSource, localProvider, localEndpoint } = validation.data;

    // Resolve the provider target and gate to OpenAI-compatible providers only (v1).
    const resolved = resolveFixTarget({ modelSource, model, key, localProvider, localEndpoint });
    if (!resolved.ok) {
        return NextResponse.json({ error: resolved.error }, { status: 400, headers: getCorsHeaders(request) });
    }
    const { target, authHeader } = resolved;

    try {
        const url = getChatCompletionsUrl(target);
        const messages = buildFixMessages({ query, errorMessage, hint });

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeader },
            body: JSON.stringify({
                model: getProviderModelName(model),
                messages,
                temperature: 0,
            }),
            signal: AbortSignal.any([request.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
        });

        if (!response.ok) {
            const friendly = response.status === 401
                ? "The AI provider rejected your API key. Check it in Settings."
                : "The AI provider couldn't process the request. Please try again.";
            return NextResponse.json({ error: friendly }, { status: response.status === 401 ? 401 : 422, headers: getCorsHeaders(request) });
        }

        const data = await response.json();
        const reply: string = data?.choices?.[0]?.message?.content ?? "";
        if (!reply) {
            return NextResponse.json({ error: "The AI provider returned an empty response." }, { status: 422, headers: getCorsHeaders(request) });
        }

        return NextResponse.json(parseFixResponse(reply, query), { headers: getCorsHeaders(request) });
    } catch (error) {
        // Avoid logging the query/error/prompt content.
        const isTimeout = (error as Error)?.name === "TimeoutError" || (error as Error)?.name === "AbortError";
        console.error("Fix-with-AI provider error:", (error as Error)?.name);
        return NextResponse.json(
            { error: isTimeout ? "The AI request timed out. Please try again." : "Unable to reach the AI provider. Please try again." },
            { status: 422, headers: getCorsHeaders(request) }
        );
    }
}
