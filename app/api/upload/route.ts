import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promisify } from "util";
import { pipeline } from "stream";
import fs from "fs";
import { randomUUID } from "crypto";
import { getCorsHeaders } from "../utils";
import { getClient } from "../auth/[...nextauth]/options";

const pump = promisify(pipeline);
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  ".png": ["image/png"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".gif": ["image/gif"],
  ".webp": ["image/webp"],
  ".pdf": ["application/pdf"],
  ".txt": ["text/plain"],
  ".csv": ["text/csv", "application/csv", "text/plain"],
};

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No files received." }, { status: 400, headers: getCorsHeaders(request) });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File is too large." }, { status: 400, headers: getCorsHeaders(request) });
    }

    const extension = path.extname(file.name).toLowerCase();
    const allowedMimeTypes = ALLOWED_FILE_TYPES[extension];

    if (!allowedMimeTypes || !allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type." }, { status: 400, headers: getCorsHeaders(request) });
    }

    const filename = `${randomUUID()}${extension}`;
    const assetsDir = path.join(process.cwd(), "public", "assets");
    const filePath = path.join(assetsDir, filename);

    if (!filePath.startsWith(assetsDir)) {
      return NextResponse.json({ error: "Invalid file name." }, { status: 400, headers: getCorsHeaders(request) });
    }

    try {
      await fs.promises.mkdir(assetsDir, { recursive: true });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await pump(file.stream(), fs.createWriteStream(filePath));
      return NextResponse.json({ path: `/assets/${filename}`, status: 200 }, { headers: getCorsHeaders(request) });
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
