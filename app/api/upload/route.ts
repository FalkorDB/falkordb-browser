import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promisify } from "util";
import { pipeline } from "stream";
import fs from "fs";
import { getCorsHeaders } from "../utils";
import { getClient } from "../auth/[...nextauth]/options";

const pump = promisify(pipeline);

const MAX_SIZE = 10 * 1024 * 1024  // 10 MB
const ALLOWED_EXTENSIONS = new Set(['.csv', '.json', '.txt', '.graphml'])

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const formData = await request.formData();

    const file = formData.get("file") as File;
    const ext = path.extname(file.name).toLowerCase()

    if (!file) {
      return NextResponse.json({ error: "No files received." }, { status: 400, headers: getCorsHeaders(request) });
    }

    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large" }, { status: 413 })

    if (!ALLOWED_EXTENSIONS.has(ext)) return NextResponse.json({ error: "File type not allowed" }, { status: 415 })


    const filename = path.basename(file.name).replaceAll(" ", "_");
    const filePath = path.join(process.cwd(), "public", "assets", filename);

    // Guard against path traversal
    const assetsDir = path.join(process.cwd(), "public", "assets");
    if (!filePath.startsWith(assetsDir)) {
      return NextResponse.json({ error: "Invalid file name." }, { status: 400, headers: getCorsHeaders(request) });
    }

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await pump(file.stream(), fs.createWriteStream(filePath));
      return NextResponse.json({ path: `/assets/${filename}`, status: 200 }, { headers: getCorsHeaders(request) });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "An error occurred while processing the request" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
