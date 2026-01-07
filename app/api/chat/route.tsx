import { NextRequest, NextResponse } from "next/server";
import { textToCypherService } from "@/lib/text-to-cypher";
import { getClient } from "../auth/[...nextauth]/options";
import { chatRequest, validateBody } from "../validate-body";

export async function GET() {
    try {
        const session = await getClient()

        if (session instanceof NextResponse) {
            throw new Error(await session.text())
        }

        // Return empty object to allow chat to be displayed
        // The actual model configuration is provided by the user in the frontend
        return NextResponse.json({}, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}

export type EventType = "Status" | "Schema" | "CypherQuery" | "CypherResult" | "ModelOutputChunk" | "Result" | "Error"

/**
 * Build FalkorDB connection URL from user session
 */
function buildFalkorDBConnection(user: { host: string; port: number; url?: string; username?: string; password?: string }): string {
    // Use URL if provided
    if (user.url) {
        return user.url;
    }

    // Build falkor:// URL from host and port
    const protocol = "falkor://";
    const auth = user.username && user.password ? `${user.username}:${user.password}@` : "";
    return `${protocol}${auth}${user.host}:${user.port}`;
}

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
    const encoder = new TextEncoder()
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()

    try {
        // Verify authentication via getClient
        const session = await getClient()

        if (session instanceof NextResponse) {
            throw new Error(await session.text())
        }

        const body = await request.json()

        // Validate request body
        const validation = validateBody(chatRequest, body);

        if (!validation.success) {
            writer.write(encoder.encode(`event: error status: ${400} data: ${JSON.stringify(validation.error)}\n\n`))
            writer.close()

            return new Response(readable, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                },
            })
        }

        const { messages, graphName, key, model } = validation.data

        // Validate required parameters
        if (!key) {
            writer.write(encoder.encode(`event: error status: ${400} data: "API key is required. Please configure it in Settings."\n\n`))
            writer.close()

            return new Response(readable, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                },
            })
        }

        try {
            // Build FalkorDB connection URL from user session
            const falkordbConnection = buildFalkorDBConnection(session.user);

            // Stream events from text-to-cypher service
            const eventStream = textToCypherService.textToCypherStream(
                graphName,
                messages,
                {
                    model: model || "gpt-4o-mini",
                    apiKey: key,
                    falkordbConnection,
                }
            );

            // Process and forward events to client
            // eslint-disable-next-line no-restricted-syntax
            for await (const event of eventStream) {
                writer.write(encoder.encode(`event: ${event.type} data: ${event.data}\n\n`))
            }

            writer.close()
        } catch (error) {
            console.error(error)
            writer.write(encoder.encode(`event: error status: ${400} data: ${JSON.stringify((error as Error).message)}\n\n`))
            writer.close()
        }
    } catch (error) {
        console.error(error)
        writer.write(encoder.encode(`event: error status: ${500} data: ${JSON.stringify((error as Error).message)}\n\n`))
        writer.close()
    }

    request.signal.addEventListener("abort", () => {
        writer.close()
    })

    return new Response(readable, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    })
}