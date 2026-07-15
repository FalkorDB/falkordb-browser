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
    let busboyClosed = false;
    let storePending = false;
    let storeSettled = false;
    let storedFilename: string | null = null;
    let terminalError: { error: string; status: number } | null = null;

    const done = (result: StreamResult) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    // Record the first terminal problem; later ones don't override it.
    const recordError = (status: number, error: string) => {
      if (!terminalError) terminalError = { error, status };
    };

    // Resolve only once busboy has closed AND any in-flight store has settled, so
    // a late partsLimit/filesLimit/fieldsLimit or parse error isn't missed by
    // returning success the moment the file stream ends.
    const settleIfReady = () => {
      if (!busboyClosed || (storePending && !storeSettled)) return;
      if (terminalError) {
        // A file may have been fully stored before a later part tripped a limit
        // (or a parse error occurred) — don't leave it orphaned on a failure.
        if (storedFilename) {
          const orphan = getUploadFilePath(storedFilename, userId);
          if (orphan) fs.unlink(orphan, () => {});
        }
        done({ ok: false, ...terminalError });
        return;
      }
      if (storedFilename) {
        done({ ok: true, filename: storedFilename });
        return;
      }
      done({ ok: false, error: "No file uploaded.", status: 400 });
    };

    let busboy: ReturnType<typeof Busboy>;
    try {
      const parserMaxFileSize = DUMP_RESTORE_ENABLED ? MAX_DUMP_SIZE : MAX_FILE_SIZE;
      // Conservative limits make the single-file upload contract explicit and cap
      // the DoS surface: at most one file part, no text fields, and a small ceiling
      // on total parts so a flood of parts can't tie up the parser.
      busboy = Busboy({
        headers: { "content-type": contentType },
        limits: { files: 1, fields: 0, parts: 10, fileSize: parserMaxFileSize },
      });
    } catch (err) {
      // A malformed/missing multipart content-type makes the parser throw on
      // construction — that's a bad request, not a server error.
      console.error("Busboy init error:", err);
      done({ ok: false, error: "Failed to parse upload.", status: 400 });
      return;
    }

    busboy.on("file", (fieldname, fileStream, info) => {
      // Prevent unhandled 'error' events when the stream is destroyed on limits.
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
        recordError(403, "Dump restore is temporarily disabled.");
        return;
      }

      const allowedFileType = getAllowedFileType(extension);

      if (!allowedFileType || !allowedFileType.mimeTypes.includes(mimeType)) {
        fileStream.resume(); // drain so busboy can finish cleanly
        recordError(400, "Invalid file type.");
        return;
      }

      const filename = `${randomUUID()}${extension}`;
      const uploadsDir = getUploadsDirectory(userId);
      const filePath = getUploadFilePath(filename, userId);

      if (!filePath) {
        fileStream.resume();
        recordError(400, "Invalid file name.");
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
        recordError(413, "File is too large.");
      });

      fileStream.on("data", (chunk: Buffer) => {
        bytesWritten += chunk.length;
        if (bytesWritten > sizeLimit) {
          sizeLimitHit = true;
          fileStream.destroy();
          writeStream.destroy();
          fs.unlink(tempFilePath, () => {});
          recordError(413, "File is too large.");
        }
      });

      storePending = true;
      pipeline(fileStream, writeStream)
        .then(async () => {
          if (!sizeLimitHit) {
            await fs.promises.rename(tempFilePath, filePath);
            storedFilename = filename;
          }
          storeSettled = true;
          settleIfReady();
        })
        .catch((err: unknown) => {
          fs.unlink(tempFilePath, () => {});
          console.error("Stream pipeline error:", err);
          recordError(500, "Failed to store uploaded file.");
          storeSettled = true;
          settleIfReady();
        });
    });

    // Any busboy limit tripped while draining the rest of the body is a failure,
    // even after the accepted file part finished — settleIfReady applies it on close.
    busboy.on("filesLimit", () => recordError(400, "Only a single file may be uploaded."));
    busboy.on("fieldsLimit", () => recordError(400, "Unexpected form fields."));
    busboy.on("partsLimit", () => recordError(400, "Too many form parts."));

    // Fires once the whole multipart body has been parsed. Settle success only
    // now (and only if the store finished), so a late limit/parse error wins.
    busboy.on("close", () => {
      busboyClosed = true;
      settleIfReady();
    });

    busboy.on("error", (err) => {
      console.error("Busboy error:", err);
      recordError(500, "Failed to parse upload.");
      busboyClosed = true;
      settleIfReady();
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
      recordError(500, "Failed to parse upload.");
      busboyClosed = true;
      settleIfReady();
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

