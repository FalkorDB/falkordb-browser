import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line import/no-extraneous-dependencies
import { SignJWT } from "jose";
import { newClient, generateTimeUUID } from "../[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
  try {
    // Check JWT secret at runtime
    if (!process.env.NEXTAUTH_SECRET) {
      // eslint-disable-next-line no-console
      console.error("NEXTAUTH_SECRET environment variable is required");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }
    
    const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

    // Handle JSON parsing errors properly
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { username, password, host = "localhost", port = "6379", tls = "false", ca } = body;

    // Note: username and password are optional - same as NextAuth session behavior
    // The newClient function handles empty credentials by using "default" user

    try {
      // Generate unique user ID
      const id = generateTimeUUID();

      // Attempt to connect to FalkorDB using existing logic
      const { role } = await newClient(
        {
          host,
          port: port.toString(),
          username: username || "", // Handle undefined username like NextAuth does
          password: password || "", // Handle undefined password like NextAuth does
          tls: tls.toString(),
          ca: ca || "undefined",
        },
        id
      );

      // If connection is successful, create user object
      const user = {
        id,
        host,
        port: parseInt(port, 10),
        username,
        tls: tls === "true" || tls === true,
        ca,
        role,
      };

      // Create JWT token with all necessary connection information
      const tokenPayload = {
        sub: user.id,           // Standard JWT claim for user ID
        username: username || undefined,
        password: password || undefined,
        role: user.role,
        host: user.host,
        port: user.port,
        tls: user.tls,
        ca: user.ca || undefined,
      };

      const token = await new SignJWT(tokenPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("2h")
        .sign(JWT_SECRET);

      return NextResponse.json(
        {
          message: "Authentication successful",
          token
        },
        { status: 200 }
      );
    } catch (connectionError) {
      // eslint-disable-next-line no-console
      console.error("FalkorDB connection error:", connectionError);
      return NextResponse.json(
        { message: "Invalid credentials or connection failed" },
        { status: 401 }
      );
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Login API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
