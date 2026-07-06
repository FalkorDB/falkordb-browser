import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { getStoredUpload } from "@/app/api/upload/file-validation";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getCorsHeaders, resolveReadOnly } from "../../../utils";
import {
  validateUploadInput,
  executeCsvIngestion,
  executeCypherBatch,
} from "./upload-utils";

interface UploadBody {
  mode?: string;
  fileId?: string;
  query?: string;
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

    if (resolveReadOnly(request, session.user.role)) {
      return NextResponse.json(
        { message: "You do not have permission to modify this graph." },
        { status: 403, headers: getCorsHeaders(request) }
      );
    }

    const { graph: graphId } = await params;
    const body = (await request.json()) as UploadBody;
    const { mode, fileId, query } = body;

    if (!mode || !fileId) {
      return NextResponse.json(
        { message: "mode and fileId are required." },
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

    const validation = validateUploadInput({
      mode,
      fileId,
      extension: storedUpload.extension,
      query,
    });

    if (!validation.ok) {
      return NextResponse.json(
        { message: validation.message },
        { status: validation.status, headers: getCorsHeaders(request) }
      );
    }

    filePathToDelete = storedUpload.filePath;
    const graph = session.client.selectGraph(graphId);

    if (validation.mode === "rdb") {
      const buffer = await fs.promises.readFile(storedUpload.filePath);
      const connection = await session.client.connection;
      await connection.restore(graphId, 0, buffer, { REPLACE: true });

      return NextResponse.json(
        { message: "Graph restored successfully." },
        { status: 200, headers: getCorsHeaders(request) }
      );
    }

    if (validation.mode === "csv") {
      const csvText = await fs.promises.readFile(storedUpload.filePath, "utf-8");
      const count = await executeCsvIngestion(graph, csvText, query ?? "");

      return NextResponse.json(
        { message: `Processed ${count} CSV row(s).` },
        { status: 200, headers: getCorsHeaders(request) }
      );
    }

    const batchText = await fs.promises.readFile(storedUpload.filePath, "utf-8");
    const count = await executeCypherBatch(graph, batchText);

    return NextResponse.json(
      { message: `Executed ${count} Cypher statement(s).` },
      { status: 200, headers: getCorsHeaders(request) }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: (error as Error).message || "Failed to upload graph data." },
      { status: 500, headers: getCorsHeaders(request) }
    );
  } finally {
    if (filePathToDelete) {
      await fs.promises.unlink(filePathToDelete).catch(() => undefined);
    }
  }
}
