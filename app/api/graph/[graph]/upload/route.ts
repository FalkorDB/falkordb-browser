import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { getStoredUpload } from "@/app/api/upload/file-validation";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getCorsHeaders, resolveReadOnly } from "../../../utils";
import {
  validateUploadInput,
  executeCsvIngestion,
  executeCypherBatch,
  coerceRow,
  type CsvColumnType,
} from "./upload-utils";

interface UploadBody {
  mode?: string;
  fileId?: string;
  query?: string;
  columnTypes?: Record<string, CsvColumnType>;
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

    const { mode, fileId, query, columnTypes } = body;

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

    // Resolve the file before the read-only check so the finally block cleans up
    // the already-uploaded temp file even when a read-only user is rejected.
    filePathToDelete = storedUpload.filePath;

    if (resolveReadOnly(request, session.user.role)) {
      return NextResponse.json(
        { message: "You do not have permission to modify this graph." },
        { status: 403, headers: getCorsHeaders(request) }
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

    const graph = session.client.selectGraph(graphId);

    // Read the file outside the per-mode handlers so filesystem errors fall
    // through to the generic 500 rather than leaking via a 422 message.
    if (validation.mode === "dump") {
      const buffer = await fs.promises.readFile(storedUpload.filePath);
      const connection = await session.client.connection;

      try {
        await connection.restore(graphId, 0, buffer, { REPLACE: true });
      } catch (restoreError) {
        console.error(restoreError);
        return NextResponse.json(
          { message: "Failed to restore the graph dump. Make sure the file is a FalkorDB .dump export." },
          { status: 422, headers: getCorsHeaders(request) }
        );
      }

      return NextResponse.json(
        { message: "Graph restored successfully." },
        { status: 200, headers: getCorsHeaders(request) }
      );
    }

    if (validation.mode === "csv") {
      const csvText = await fs.promises.readFile(storedUpload.filePath, "utf-8");

      try {
        const result = await executeCsvIngestion(graph, csvText, query ?? "", {
          transformRow:
            columnTypes && Object.keys(columnTypes).length > 0
              ? (row) => coerceRow(row, columnTypes)
              : undefined,
        });

        return NextResponse.json(
          {
            message: `Processed ${result.processedRows} CSV row(s) in ${result.chunks} batch(es).`,
            processedRows: result.processedRows,
            chunks: result.chunks,
          },
          { status: 200, headers: getCorsHeaders(request) }
        );
      } catch (ingestError) {
        console.error(ingestError);
        return NextResponse.json(
          { message: (ingestError as Error).message || "Failed to process the CSV file." },
          { status: 422, headers: getCorsHeaders(request) }
        );
      }
    }

    const batchText = await fs.promises.readFile(storedUpload.filePath, "utf-8");

    try {
      const count = await executeCypherBatch(graph, batchText);

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
