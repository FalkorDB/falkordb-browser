import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line import/no-extraneous-dependencies
import { SignJWT } from "jose";
import { newClient, generateTimeUUID } from "../[...nextauth]/options";

// JWT secret key
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET environment variable is required");
}
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    try {
      // Generate unique user ID
      const id = generateTimeUUID();

      // Attempt to connect to FalkorDB using existing logic
      const { role } = await newClient(
        {
          host,
          port: port.toString(),
          username,
          password,
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
        password,
        tls: tls === "true" || tls === true,
        ca,
        role,
      };

      // Create JWT token with user information (excluding password for security)
      const tokenPayload = {
        user: {
          id: user.id,
          host: user.host,
          port: user.port,
          username: user.username,
          tls: user.tls,
          ca: user.ca,
          role: user.role,
        },
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      };

      const token = await new SignJWT(tokenPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
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
