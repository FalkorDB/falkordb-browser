import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { Readable, pipeline } from "stream";
import { promisify } from "util";
import fs from "fs";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

const pump = promisify(pipeline);

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file extensions for upload
const ALLOWED_EXTENSIONS = ['.csv', '.json', '.txt', '.cypher', '.cql'];

/**
 * Sanitizes filename to prevent path traversal attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  const sanitized = path.basename(filename).replace(/[/\\:*?"<>|]/g, '_');
  
  // Ensure filename is not empty after sanitization
  if (!sanitized || sanitized === '.' || sanitized === '..') {
    return `file_${Date.now()}`;
  }
  
  return sanitized;
}

/**
 * Validates file extension against whitelist
 */
function isAllowedFileType(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getClient();
    
    if (session instanceof NextResponse) {
      return session;
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Sanitize and validate filename
    const sanitizedFilename = sanitizeFilename(file.name.replaceAll(" ", "_"));
    
    if (!isAllowedFileType(sanitizedFilename)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Use a safe directory path
    const uploadDir = path.join(process.cwd(), 'public', 'assets');
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create final file path
    const filePath = path.join(uploadDir, sanitizedFilename);
    
    // Verify the resolved path is still within the upload directory (extra safety)
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(uploadDir);
    
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 }
      );
    }

    // Convert Web Stream to Node.js Stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const readableStream = Readable.from(buffer);
    
    await pump(readableStream, fs.createWriteStream(filePath));
    
    return NextResponse.json({ 
      path: `/assets/${sanitizedFilename}`,
      filename: sanitizedFilename,
      status: 200 
    });
  } catch (error) {
    // Don't expose internal error details
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
