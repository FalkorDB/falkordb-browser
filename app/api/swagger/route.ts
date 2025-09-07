import { NextResponse } from "next/server";
import { createSwaggerSpec } from "next-swagger-doc";

// eslint-disable-next-line import/prefer-default-export
export async function GET(): Promise<NextResponse> {
  try {
    const spec = createSwaggerSpec({
      apiFolder: "app/docs", // Point to our centralized docs folder instead of scanning all api routes
      definition: {
        openapi: "3.0.0",
        info: {
          title: "FalkorDB Browser API",
          version: "1.4.6",
          description: "REST API for FalkorDB Browser - Graph Database Management Interface",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description: "JWT token obtained from the login endpoint",
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
        tags: [
          {
            name: "Authentication",
            description: "Authentication and authorization endpoints",
          },
          {
            name: "Graph",
            description: "Graph management and query endpoints",
          },
          {
            name: "Schema",
            description: "Schema management endpoints",
          },
           {
            name: "Configurations",
            description: "Database configuration management endpoints",
          },
          {
            name: "Users",
            description: "User management endpoints",
          },
          {
            name: "Status",
            description: "Health check and status endpoints",
          }
        ],
      },
    });

    return NextResponse.json(spec, { 
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching during development
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
