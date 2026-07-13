import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { Readable } from "stream";
import type { ReadableStream as NodeReadableStream } from "stream/web";
import { pipeline } from "stream/promises";
import fs from "fs";
import { randomUUID } from "crypto";
import Busboy from "busboy";
import { getCorsHeaders, resolveReadOnly } from "../utils";
import { getClient } from "../auth/[...nextauth]/options";
import {
  getAllowedFileType,
  getUploadFilePath,
  getUploadsDirectory,
  validateContentFromPath,
  MAX_FILE_SIZE,
} from "./file-validation";
import { DUMP_RESTORE_ENABLED } from "@/lib/graphUpload";

// Small text/CSV/Cypher uploads are capped tightly (MAX_FILE_SIZE). A .dump is a
// binary blob that streams straight to disk and can legitimately be large, so it
// gets a separate, larger cap instead of being uncapped — an uncapped stream
// would let an authenticated user fill the disk.
const BINARY_EXTENSIONS = new Set([".dump"]);
const MAX_DUMP_SIZE = 1024 * 1024 * 1024; // 1 GiB

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

type StreamResult =
  | { ok: true; filename: string }
  | { ok: false; error: string; status: number };

/** Stream the multipart body through busboy directly to disk. */
async function streamToDisk(
  request: NextRequest,
  userId: string
): Promise<StreamResult> {
  const { body } = request;
  if (!body) {
    return { ok: false, error: "Request body is missing.", status: 400 };
  }

  const contentType = request.headers.get("content-type") ?? "";

  return new Promise((resolve) => {
    let settled = false;
    let fileSeen = false;

    const done = (result: StreamResult) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    let busboy: ReturnType<typeof Busboy>;
    try {
      // Conservative limits make the single-file upload contract explicit and cap
      // the DoS surface: at most one file part, no text fields, and a small ceiling
      // on total parts so a flood of parts can't tie up the parser.
      busboy = Busboy({
        headers: { "content-type": contentType },
        // A busboy-level fileSize cap cuts oversized bodies off at the parser,
        // bounding the DoS surface even for rejected file types that are only
        // drained (resumed) without the per-type write check below. Use the
        // largest currently-acceptable size as the hard ceiling.
        limits: {
          files: 1,
          fields: 0,
          parts: 10,
          fileSize: DUMP_RESTORE_ENABLED ? MAX_DUMP_SIZE : MAX_FILE_SIZE,
        },
      });
    } catch (err) {
      // A malformed/missing multipart content-type makes the parser throw on
      // construction — that's a bad request, not a server error.
      console.error("Busboy init error:", err);
      done({ ok: false, error: "Failed to parse upload.", status: 400 });
      return;
    }

    busboy.on("file", (fieldname, fileStream, info) => {
      // Handle the file stream's error up front so a parser-driven destroy (e.g.
      // on the size-cap path below, or a client abort) can't emit an unhandled
      // "error" event and crash the process.
      fileStream.on("error", () => undefined);

      // Ignore unexpected field names and any file after the first, so a crafted
      // multipart body can't write extra files or stall the parser. Draining the
      // stream lets busboy finish parsing cleanly.
      if (fieldname !== "file" || fileSeen) {
        fileStream.resume();
        return;
      }
      fileSeen = true;

      const { filename: originalName, mimeType } = info;
      const extension = path.extname(originalName).toLowerCase();

      // Don't even stage a .dump while dump restore is disabled — there is no
      // consumer for it and it would otherwise allow large files onto disk.
      if (extension === ".dump" && !DUMP_RESTORE_ENABLED) {
        fileStream.resume();
        done({ ok: false, error: "Dump restore is temporarily disabled.", status: 403 });
        return;
      }

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

      const sizeLimit = BINARY_EXTENSIONS.has(extension) ? MAX_DUMP_SIZE : MAX_FILE_SIZE;
      let bytesWritten = 0;
      let sizeLimitHit = false;

      // If the busboy fileSize ceiling truncates the stream (an oversized upload
      // right at the ceiling that the strict `>` check below can miss), reject it
      // rather than silently accepting a truncated file.
      fileStream.on("limit", () => {
        if (sizeLimitHit) return;
        sizeLimitHit = true;
        writeStream.destroy();
        fs.unlink(tempFilePath, () => {});
        done({ ok: false, error: "File is too large.", status: 413 });
      });

      fileStream.on("data", (chunk: Buffer) => {
        bytesWritten += chunk.length;
        if (bytesWritten > sizeLimit) {
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

    // Fires once the whole multipart body has been parsed. If no acceptable file
    // part was received, resolve with a 400 instead of leaving the request to
    // hang forever.
    busboy.on("close", () => {
      if (!fileSeen) {
        done({ ok: false, error: "No file uploaded.", status: 400 });
      }
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
      Readable.fromWeb(body as NodeReadableStream<Uint8Array>),
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

    // Uploads only feed graph-mutating flows (Cypher batch / dump restore), so
    // reject Read-Only users before staging anything to disk — matching every
    // other mutating graph route (resolveReadOnly).
    if (resolveReadOnly(request, session.user.role)) {
      return NextResponse.json(
        { error: "You do not have permission to upload files." },
        { status: 403, headers: corsHeaders }
      );
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
    let valid: boolean;
    try {
      valid = await validateContentFromPath(extension, filePath);
    } catch (error) {
      // Don't leave the finalized (potentially sensitive) file on disk if the
      // validator itself throws — the outer catch would otherwise 500 and orphan it.
      await fs.promises.unlink(filePath).catch(() => {});
      throw error;
    }
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

