import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { Readable } from "stream";
import type { ReadableStream as NodeReadableStream } from "stream/web";
import { pipeline } from "stream/promises";
import fs from "fs";
import { randomUUID } from "crypto";
import { getCorsHeaders } from "../utils";
import { getClient } from "../auth/[...nextauth]/options";
import {
  getAllowedFileType,
  getUploadFilePath,
  getUploadsDirectory,
  MAX_FILE_SIZE,
  MAX_MULTIPART_SIZE,
} from "./file-validation";

class PayloadTooLargeError extends Error {
  constructor() {
    super("Payload too large.");
    this.name = "PayloadTooLargeError";
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

function createSizeLimitedStream(body: ReadableStream<Uint8Array>, maxBytes: number) {
  const reader = body.getReader();
  let bytesRead = 0;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();

      if (done) {
        controller.close();
        return;
      }

      bytesRead += value.byteLength;

      if (bytesRead > maxBytes) {
        const error = new PayloadTooLargeError();
        await reader.cancel(error);
        throw error;
      }

      controller.enqueue(value);
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}

async function getSizeLimitedFormData(request: NextRequest) {
  if (!request.body) {
    return request.formData();
  }

  const headers = new Headers(request.headers);
  headers.delete("content-length");

  const requestInit: RequestInit & { duplex: "half" } = {
    body: createSizeLimitedStream(request.body, MAX_MULTIPART_SIZE),
    duplex: "half",
    headers,
    method: request.method,
  };

  return new Request(request.url, requestInit).formData();
}

export async function POST(request: NextRequest) {
  try {
    const corsHeaders = getCorsHeaders(request);
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);

    if (contentLength > MAX_MULTIPART_SIZE) {
      return NextResponse.json({ error: "Payload too large." }, { status: 413, headers: corsHeaders });
    }

    let formData;

    try {
      formData = await getSizeLimitedFormData(request);
    } catch (error) {
      if (error instanceof PayloadTooLargeError) {
        return NextResponse.json({ error: "Payload too large." }, { status: 413, headers: corsHeaders });
      }

      throw error;
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No files received." }, { status: 400, headers: corsHeaders });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File is too large." }, { status: 413, headers: corsHeaders });
    }

    const extension = path.extname(file.name).toLowerCase();
    const allowedFileType = getAllowedFileType(extension);

    if (!allowedFileType || !allowedFileType.mimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type." }, { status: 400, headers: corsHeaders });
    }

    if (!(await allowedFileType.validateContent(file))) {
      return NextResponse.json({ error: "Invalid file contents." }, { status: 400, headers: corsHeaders });
    }

    const filename = `${randomUUID()}${extension}`;
    const uploadsDir = getUploadsDirectory();
    const filePath = getUploadFilePath(filename);

    if (!filePath) {
      return NextResponse.json({ error: "Invalid file name." }, { status: 400, headers: corsHeaders });
    }

    try {
      await fs.promises.mkdir(uploadsDir, { recursive: true });
      await pipeline(
        Readable.fromWeb(file.stream() as NodeReadableStream<Uint8Array>),
        fs.createWriteStream(filePath)
      );
      return NextResponse.json({ id: filename, path: `/api/upload/${filename}`, status: 200 }, { headers: corsHeaders });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: corsHeaders }
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
