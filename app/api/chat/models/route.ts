import { NextRequest, NextResponse } from "next/server";
import { TextToCypher } from "@falkordb/text-to-cypher";
import { getClient } from "../../auth/[...nextauth]/options";
import { buildFalkorDBConnection, corsHeaders } from "../../utils";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

/**
 * GET endpoint to fetch available AI models
 * Optionally filters by provider if specified in query params
 */
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const session = await getClient();

        if (session instanceof NextResponse) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders() }
            );
        }

        const { searchParams } = new URL(request.url);
        const provider = searchParams.get("provider");

        // Create a TextToCypher instance (API key can be placeholder for listing models)
        const textToCypher = new TextToCypher({
            falkordbConnection: buildFalkorDBConnection(session.user),
            model: "gpt-4o-mini",
            apiKey: "placeholder-for-listing-models",
        });

        let models: string[];

        if (provider) {
            // Fetch models for specific provider
            models = await textToCypher.listModelsByProvider(provider);
        } else {
            // Fetch all models
            models = await textToCypher.listModels();
        }

        return NextResponse.json({ models }, { status: 200, headers: corsHeaders() });
    } catch (error) {
        console.error("Error fetching models:", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500, headers: corsHeaders() }
        );
    }
}
