import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { getStoredUpload } from "@/app/api/upload/file-validation";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getCorsHeaders } from "../../../utils";
import { parseCsvRows, splitCypherStatements } from "./upload-utils";

type UploadMode = "rdb" | "csv" | "cypher";

interface UploadBody {
  mode?: UploadMode;
  fileId?: string;
  query?: string;
}

// eslint-disable-next-line import/prefer-default-export
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
    const body = (await request.json()) as UploadBody;
    const mode = body.mode;
    const fileId = body.fileId;

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

    filePathToDelete = storedUpload.filePath;
    const extension = storedUpload.extension;
    const graph = session.client.selectGraph(graphId);

    if (mode === "rdb") {
      if (extension !== ".rdb" && extension !== ".dump") {
        return NextResponse.json(
          { message: "RDB upload requires a .rdb or .dump file." },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const buffer = await fs.promises.readFile(storedUpload.filePath);
      const connection = await session.client.connection;
      await connection.restore(graphId, 0, buffer, { REPLACE: true });

      return NextResponse.json(
        { message: "Graph restored successfully." },
        { status: 200, headers: getCorsHeaders(request) }
      );
    }

    if (mode === "csv") {
      if (extension !== ".csv") {
        return NextResponse.json(
          { message: "CSV upload requires a .csv file." },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      if (!body.query?.trim()) {
        return NextResponse.json(
          { message: "CSV upload requires a query." },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const csvText = await fs.promises.readFile(storedUpload.filePath, "utf-8");
      const rows = parseCsvRows(csvText);

      for (let index = 0; index < rows.length; index += 1) {
        await graph.query(body.query, { params: { row: rows[index], index } });
      }

      return NextResponse.json(
        { message: `Processed ${rows.length} CSV row(s).` },
        { status: 200, headers: getCorsHeaders(request) }
      );
    }

    if (mode === "cypher") {
      if (extension !== ".txt" && extension !== ".cypher" && extension !== ".cql") {
        return NextResponse.json(
          { message: "Cypher upload requires a .txt, .cypher, or .cql file." },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const batchText = await fs.promises.readFile(storedUpload.filePath, "utf-8");
      const statements = splitCypherStatements(batchText);

      for (const statement of statements) {
        await graph.query(statement);
      }

      return NextResponse.json(
        { message: `Executed ${statements.length} Cypher statement(s).` },
        { status: 200, headers: getCorsHeaders(request) }
      );
    }

    return NextResponse.json(
      { message: "Invalid upload mode." },
      { status: 400, headers: getCorsHeaders(request) }
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
