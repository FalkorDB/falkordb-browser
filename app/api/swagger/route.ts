import { NextResponse } from "next/server";
import swaggerSpec from "./swagger-spec";

// eslint-disable-next-line import/prefer-default-export
export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(swaggerSpec, { 
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache", 
        "Expires": "0"
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error generating Swagger spec:", error);
    return NextResponse.json(
      { error: "Failed to generate API specification" },
      { status: 500 }
    );
  }
}
