import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { Readable } from "stream";
import type { ReadableStream as NodeReadableStream } from "stream/web";
import { pipeline } from "stream/promises";
import fs from "fs";
import { randomUUID } from "crypto";
import Busboy from "busboy";
import { getCorsHeaders } from "../utils";
import { getClient } from "../auth/[...nextauth]/options";
import {
  getAllowedFileType,
  getUploadFilePath,
  getUploadsDirectory,
  validateContentFromPath,
  MAX_FILE_SIZE,
} from "./file-validation";

// Binary extensions (e.g. .dump, .rdb) stream freely — no size cap beyond disk.
const BINARY_EXTENSIONS = new Set([".dump", ".rdb"]);

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

// Route segment config — disable Next.js body buffering so busboy can read the
// raw stream directly. Without this the framework buffers the whole body first.
export const config = {
  api: { bodyParser: false },
};

type StreamResult =
  | { ok: true; filename: string }
  | { ok: false; error: string; status: number };

/** Stream the multipart body through busboy directly to disk. */
async function streamToDisk(
  request: NextRequest,
  userId: string
): Promise<StreamResult> {
  const contentType = request.headers.get("content-type") ?? "";

  return new Promise((resolve) => {
    const busboy = Busboy({ headers: { "content-type": contentType } });
    let settled = false;

    const done = (result: StreamResult) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    busboy.on("file", (fieldname, fileStream, info) => {
      const { filename: originalName, mimeType } = info;
      const extension = path.extname(originalName).toLowerCase();
      const allowedFileType = getAllowedFileType(extension);

      if (!allowedFileType || !allowedFileType.mimeTypes.includes(mimeType)) {
        fileStream.resume(); // drain so busboy can finish cleanly
        done({ ok: false, error: "Invalid file type.", status: 400 });
        return;
      }

      const filename = `${randomUUID()}${extension}`;
      const uploadsDir = getUploadsDirectory(userId);
      const filePath = getUploadFilePath(filename, userId);

      if (!filePath) {
        fileStream.resume();
        done({ ok: false, error: "Invalid file name.", status: 400 });
        return;
      }

      const tempFilePath = `${filePath}.tmp`;
      fs.mkdirSync(uploadsDir, { recursive: true });
      const writeStream = fs.createWriteStream(tempFilePath);

      const isBinary = BINARY_EXTENSIONS.has(extension);
      let bytesWritten = 0;
      let sizeLimitHit = false;

      fileStream.on("data", (chunk: Buffer) => {
        bytesWritten += chunk.length;
        if (!isBinary && bytesWritten > MAX_FILE_SIZE) {
          sizeLimitHit = true;
          fileStream.destroy();
          writeStream.destroy();
          fs.unlink(tempFilePath, () => {});
          done({ ok: false, error: "File is too large.", status: 413 });
        }
      });

      pipeline(fileStream, writeStream)
        .then(async () => {
          if (sizeLimitHit) return;
          await fs.promises.rename(tempFilePath, filePath);
          done({ ok: true, filename });
        })
        .catch((err: unknown) => {
          fs.unlink(tempFilePath, () => {});
          console.error("Stream pipeline error:", err);
          done({ ok: false, error: "Failed to store uploaded file.", status: 500 });
        });
    });

    busboy.on("error", (err) => {
      console.error("Busboy error:", err);
      done({ ok: false, error: "Failed to parse upload.", status: 500 });
    });

    // Stream request.body → busboy without buffering the full body in memory.
    // Use pipeline (not a bare .pipe) so errors on the source stream — e.g. a
    // client disconnect mid-upload — are handled instead of being silently
    // dropped or surfacing as an unhandled 'error' event.
    pipeline(
      Readable.fromWeb(request.body as NodeReadableStream<Uint8Array>),
      busboy
    ).catch((err: unknown) => {
      console.error("Upload stream error:", err);
      done({ ok: false, error: "Failed to parse upload.", status: 500 });
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const corsHeaders = getCorsHeaders(request);
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const result = await streamToDisk(request, session.user.id);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status, headers: corsHeaders });
    }

    const { filename } = result;
    const extension = path.extname(filename).toLowerCase();
    const filePath = getUploadFilePath(filename, session.user.id);

    if (!filePath) {
      return NextResponse.json({ error: "Invalid file name." }, { status: 400, headers: corsHeaders });
    }

    // Post-write content validation (reads from disk — never buffers the upload).
    const valid = await validateContentFromPath(extension, filePath);
    if (!valid) {
      await fs.promises.unlink(filePath).catch(() => {});
      return NextResponse.json({ error: "Invalid file contents." }, { status: 400, headers: corsHeaders });
    }

    return NextResponse.json(
      { id: filename, path: `/api/upload/${filename}`, status: 200 },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

