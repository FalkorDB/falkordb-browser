import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { updateGraphConfig, validateBody } from "../../../validate-body";
import { getCorsHeaders } from "../../../utils";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ config: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    const { config: configName } = await params;
    try {
      const config = await client.configGet(configName);
      return NextResponse.json({ config }, { status: 200, headers: getCorsHeaders(request) });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ config: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    const { config: configName } = await params;

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(updateGraphConfig, body);
      
      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const { value } = validation.data;
      const parsedValue =
        configName === "CMD_INFO" ? value : parseInt(value, 10);

      if (configName !== "CMD_INFO" && Number.isNaN(parsedValue))
        throw new Error("Invalid value");

      const config = await client.configSet(configName, parsedValue);
      return NextResponse.json({ config }, { status: 200, headers: getCorsHeaders(request) });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
