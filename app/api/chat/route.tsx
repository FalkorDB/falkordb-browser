import { NextRequest, NextResponse } from "next/server";
import { getClient } from "../auth/[...nextauth]/options";

const URL = "http://localhost:8080/"

export async function GET() {
    try {
        const session = await getClient()

        if (session instanceof NextResponse) {
            throw new Error(await session.text())
        }

        try {
            const response = await fetch(`${URL}list_graphs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error(await response.text())
            }

            const data = await response.json()

            return NextResponse.json(data)
        } catch (error) {
            console.error(error)
            return NextResponse.json({ error: (error as Error).message }, { status: 400 })
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
        const session = await getClient()

        if (session instanceof NextResponse) {
            throw new Error(await session.text())
        }

        const { messages, graphName } = await request.json()

        try {
            if (!graphName) throw new Error("Graph name is required")
            if (!messages) throw new Error("Messages are required")

            const response = await fetch(`${URL}text_to_cypher`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "chat_request": {
                        messages,
                    },
                    "graph_name": graphName,
                })
            });

            if (!response.ok) {
                throw new Error(`Error: ${await response.text()}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            const processStream = async () => {
                if (!reader) return;

                const { done, value } = await reader.read();
                if (done) return;

                const chunk = decoder.decode(value, { stream: true });

                const lines = chunk.split('\n').filter(line => line);
                let isResult = false

                
                lines.forEach(line => {
                    const data = JSON.parse(line.split("data:")[1])
                    const type: EventType = Object.keys(data)[0] as EventType
                    
                    isResult = type === "Result" || type === "Error"
                    
                    writer.write(encoder.encode(`event: ${type} data: ${data[type]}\n\n`))
                })

                if (!isResult) {
                    processStream();
                } else {
                    writer.close();
                }
            };

            processStream()
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