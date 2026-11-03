import { NextRequest, NextResponse } from "next/server";
import { buildFixMessages, parseFixResponse, resolveFixTarget } from "@/lib/aiFix";
import { getClient } from "../../auth/[...nextauth]/options";
import { fixRequest, validateBody } from "../../validate-body";
import { getCorsHeaders, corsPreflight } from "../../utils";
import { MAX_CHAT_BODY_BYTES, OVER_LIMIT, readChatBodyWithLimit } from "../requestBody";
import { requestAiCompletion } from "../completion";

export const OPTIONS = corsPreflight;

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

    // Fast-fail on an honest Content-Length, then enforce the cap while reading so a missing
    // or inaccurate length can't bypass it.
    const contentLength = Number(request.headers.get("content-length") ?? "");
    if (Number.isFinite(contentLength) && contentLength > MAX_CHAT_BODY_BYTES) {
        return NextResponse.json({ error: "Request body too large" }, { status: 413, headers: getCorsHeaders(request) });
    }

    const raw = await readChatBodyWithLimit(request);
    if (raw === OVER_LIMIT) {
        return NextResponse.json({ error: "Request body too large" }, { status: 413, headers: getCorsHeaders(request) });
    }

    let body;
    try {
        body = JSON.parse(raw);
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
        const messages = buildFixMessages({ query, errorMessage, hint });

        const completion = await requestAiCompletion({
            target,
            authHeader,
            model,
            messages,
            signal: request.signal,
        });

        if (!completion.ok) {
            return NextResponse.json({ error: completion.error }, { status: completion.status, headers: getCorsHeaders(request) });
        }

        return NextResponse.json(parseFixResponse(completion.reply, query), { headers: getCorsHeaders(request) });
    } catch (error) {
        // Avoid logging the query/error/prompt content.
        const name = (error as Error)?.name;
        // The timeout fires a TimeoutError; a client disconnect/navigation aborts request.signal
        // as an AbortError — don't mislabel that as a timeout.
        const message = name === "TimeoutError"
            ? "The AI request timed out. Please try again."
            : name === "AbortError"
                ? "The AI request was canceled."
                : "Unable to reach the AI provider. Please try again.";
        console.error("Fix-with-AI provider error:", name);
        return NextResponse.json(
            { error: message },
            { status: 422, headers: getCorsHeaders(request) }
        );
    }
}
