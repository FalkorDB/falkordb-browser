import { getClient } from "@/app/api/auth/[...nextauth]/options";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "../../utils";
import { getStoredUpload, MAX_FILE_SIZE } from "../file-validation";

function hasErrorCode(error: unknown, code: string) {
  return error instanceof Error && "code" in error && error.code === code;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const corsHeaders = getCorsHeaders(request);
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { filename } = await params;
    const upload = getStoredUpload(filename);

    if (!upload?.filePath) {
      return NextResponse.json({ message: "File not found." }, { status: 404, headers: corsHeaders });
    }

    try {
      const stats = await fs.promises.stat(upload.filePath);

      if (!stats.isFile()) {
        return NextResponse.json({ message: "File not found." }, { status: 404, headers: corsHeaders });
      }

      if (stats.size > MAX_FILE_SIZE) {
        return NextResponse.json({ message: "File is too large." }, { status: 413, headers: corsHeaders });
      }

      const fileBuffer = await fs.promises.readFile(upload.filePath);

      return new NextResponse(new Blob([new Uint8Array(fileBuffer)], { type: upload.fileType.contentType }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": upload.fileType.contentType,
          "Content-Disposition": `attachment; filename="${filename}"`,
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "private, no-store",
        },
      });
    } catch (error) {
      if (hasErrorCode(error, "ENOENT")) {
        return NextResponse.json({ message: "File not found." }, { status: 404, headers: corsHeaders });
      }

      throw error;
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
