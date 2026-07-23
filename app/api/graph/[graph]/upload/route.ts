import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { getStoredUpload } from "@/app/api/upload/file-validation";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getCorsHeaders, resolveReadOnly } from "../../../utils";
import { executeCypherBatch } from "./upload-utils";

const CYPHER_BATCH_EXTENSIONS = [".txt", ".cypher"] as const;
type CypherBatchExtension = (typeof CYPHER_BATCH_EXTENSIONS)[number];

function isCypherBatchExtension(extension: string): extension is CypherBatchExtension {
  return (CYPHER_BATCH_EXTENSIONS as readonly string[]).includes(extension);
}

interface UploadBody {
  fileId?: string;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  let filePathToDelete: string | null = null;

  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { graph: graphId } = await params;

    let body: UploadBody;

    try {
      body = (await request.json()) as UploadBody;
    } catch {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { message: "fileId is required." },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    const storedUpload = getStoredUpload(fileId, session.user.id);

    if (!storedUpload?.filePath) {
      return NextResponse.json(
        { message: "Uploaded file not found." },
        { status: 404, headers: getCorsHeaders(request) }
      );
    }

    // Resolve the file before the read-only check so the finally block cleans up
    // the already-uploaded temp file even when a read-only user is rejected.
    filePathToDelete = storedUpload.filePath;

    if (resolveReadOnly(request, session.user.role)) {
      return NextResponse.json(
        { message: "You do not have permission to modify this graph." },
        { status: 403, headers: getCorsHeaders(request) }
      );
    }

    // Only Cypher batch files are executable here. Reject anything else (e.g. a
    // stale .dump) so a non-Cypher file is never decoded and run as a batch.
    const extension = path.extname(storedUpload.filePath).toLowerCase();
    if (!isCypherBatchExtension(extension)) {
      return NextResponse.json(
        { message: "Only .txt or .cypher batch files can be executed." },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    const graph = session.client.selectGraph(graphId);
    const batchText = await fs.promises.readFile(storedUpload.filePath, "utf-8");

    try {
      const count = await executeCypherBatch(graph, batchText, {
        sourceExtension: extension,
      });

      return NextResponse.json(
        { message: `Executed ${count} Cypher statement(s).` },
        { status: 200, headers: getCorsHeaders(request) }
      );
    } catch (batchError) {
      console.error(batchError);
      return NextResponse.json(
        { message: (batchError as Error).message || "Failed to execute the Cypher batch." },
        { status: 422, headers: getCorsHeaders(request) }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to upload graph data." },
      { status: 500, headers: getCorsHeaders(request) }
    );
  } finally {
    if (filePathToDelete) {
      await fs.promises.unlink(filePathToDelete).catch(() => undefined);
    }
  }
}
