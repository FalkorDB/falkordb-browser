import { NextRequest, NextResponse } from "next/server";
import { TextToCypher } from "@falkordb/text-to-cypher";
import { getClient } from "../../auth/[...nextauth]/options";
import { buildFalkorDBConnection, getCorsHeaders } from "../../utils";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * GET endpoint to fetch available AI models
 * Optionally filters by provider if specified in query params
 */
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const session = await getClient(request);

        if (session instanceof NextResponse) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: getCorsHeaders(request) }
            );
        }

        const { searchParams } = new URL(request.url);
        const provider = searchParams.get("provider");

        // Create a TextToCypher instance (API key can be placeholder for listing models)
        const textToCypher = new TextToCypher({
            falkordbConnection: buildFalkorDBConnection(session.user),
            model: "",
            apiKey: "",
        });

        let models: string[];

        if (provider) {
            // Fetch models for specific provider
            models = await textToCypher.listModelsByProvider(provider);
        } else {
            // Fetch all models
            models = await textToCypher.listModels();
        }

        return NextResponse.json({ models }, { status: 200, headers: getCorsHeaders(request) });
    } catch (error) {
        console.error("Error fetching models:", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500, headers: getCorsHeaders(request) }
        );
    }
}
