import { NextRequest, NextResponse } from "next/server";
import { TextToCypher } from "@falkordb/text-to-cypher";
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

            // Create TextToCypher client
            const textToCypher = new TextToCypher({
                falkordbConnection,
                model: model || "gpt-4o-mini",
                apiKey: key,
            });

            // Get the last user message
            const lastMessage = messages[messages.length - 1];
            const question = lastMessage.content;

            // Call textToCypher and get the result
            const result = await textToCypher.textToCypher(graphName, question);

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
                writer.write(encoder.encode(`event: Result data: ${result.answer}\n\n`));
            }

            writer.close()
        } catch (error) {
            console.error(error)
            const errorMessage = (error as Error).message;

            // Check if it's an API key error
            let userFriendlyMessage = errorMessage;
            if (errorMessage.includes('401 Unauthorized') || errorMessage.includes('invalid_api_key') || errorMessage.includes('Incorrect API key')) {
                userFriendlyMessage = 'Invalid API key. Please check your API key in Settings and ensure it is correct.';
            } else if (errorMessage.includes('API key')) {
                userFriendlyMessage = 'API key error. Please verify your API key in Settings.';
            }

            writer.write(encoder.encode(`event: error status: ${400} data: ${JSON.stringify(userFriendlyMessage)}\n\n`))
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