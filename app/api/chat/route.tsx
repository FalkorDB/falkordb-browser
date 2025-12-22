import { NextRequest, NextResponse } from "next/server";
import { User } from "next-auth";
import { getClient } from "../auth/[...nextauth]/options";
import { chatRequest, validateBody } from "../validate-body";

const CHAT_URL = process.env.CHAT_URL || "http://localhost:8000/"

export async function GET() {
    try {
        const session = await getClient()

        if (session instanceof NextResponse) {
            throw new Error(await session.text())
        }

        try {
            const response = await fetch(`${CHAT_URL}api/configured-model`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                // If endpoint doesn't exist (404), still allow chat but without model info
                if (response.status === 404) {
                    return NextResponse.json({}, { status: 200 })
                }

                throw new Error(await response.text())
            }

            const data = await response.json()

            return NextResponse.json(data)
        } catch (error) {
            const { message } = (error as Error)

            // Gracefully handle missing endpoint or server unavailability
            // Return empty object to allow chat to be displayed
            if (message.includes("fetch failed") || message.includes("Not Found") || message.includes("NOT_FOUND") || message.includes("could not be found")) {
                return NextResponse.json({ message }, { status: 200 })
            }

            console.error(error)
            return NextResponse.json({ error: message }, { status: 400 })
        }
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}

export type EventType = "Status" | "Schema" | "CypherQuery" | "CypherResult" | "ModelOutputChunk" | "Result" | "Error"

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

        try {
            // Build database connection string
            // falkor[s]://[[username][:password]@][host][:port][/db-number]
            let dbConnection: string;

            if (session.user.url) {
                // URL-based login - use directly
                dbConnection = session.user.url;
            } else {
                // Manual login or JWT - construct from parts
                const { tls, username: sessionUsername, password, host, port } = session.user as User;
                const protocol = tls ? 'falkors' : 'falkor';
                const username = sessionUsername || 'default';

                if (!password) {
                    throw new Error('Password not available. Chat API is currently only supported for session-based authentication, not JWT tokens.');
                }

                const credentials = `${username}:${password}@`;
                dbConnection = `${protocol}://${credentials}${host}:${port}`;
            }

            const requestBody: Record<string, unknown> = {
                "chat_request": {
                    messages,
                },
                "graph_name": graphName,
                "model": model || "gpt-4o-mini", // Default model if not provided
                "falkordb_connection": dbConnection, // Send database connection for full execution
                "stream": true // Enable streaming for real-time progress updates
            }

            // Only add key if provided
            if (key) {
                requestBody.key = key
            }

            const response = await fetch(`${CHAT_URL}api/text_to_cypher`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Error: ${await response.text()}`);
            }

            // Handle streaming SSE response from text-to-cypher
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            const processStream = async () => {
                if (!reader) return;

                const { done, value } = await reader.read();
                if (done) {
                    writer.close();
                    return;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line);
                let isResult = false;

                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
                            const type: EventType = Object.keys(data)[0] as EventType

                            isResult = type === "Result" || type === "Error"

                            writer.write(encoder.encode(`event: ${type} data: ${data[type]}\n\n`))
                        } catch (parseError) {
                            console.error("Failed to parse SSE data:", line, parseError)
                        }
                    }
                });

                // Continue processing the stream unless we received Result or Error
                if (!isResult) {
                    await processStream();
                } else {
                    writer.close();
                }
            };

            await processStream();
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