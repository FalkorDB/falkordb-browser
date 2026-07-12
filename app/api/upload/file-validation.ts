import path from "path";
import crypto from "crypto";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_MULTIPART_SIZE = MAX_FILE_SIZE + 1024 * 1024;

type AllowedFileType = {
  mimeTypes: readonly string[];
  contentType: string;
  validateContent: (file: File) => Promise<boolean>;
};

const UUID_FILE_NAME_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[a-z0-9]+$/;

function getUploadsDir() {
  return path.join(process.cwd(), "uploads");
}

function getUserUploadsDir(userId: string) {
  const userDirectory = crypto.createHash("sha256").update(userId).digest("hex");
  return path.join(getUploadsDir(), userDirectory);
}

async function readFilePrefix(file: File, length: number) {
  const buffer = await file.slice(0, length).arrayBuffer();
  return new Uint8Array(buffer);
}

function matchesBytes(bytes: Uint8Array, signature: readonly number[], offset = 0) {
  if (bytes.length < offset + signature.length) {
    return false;
  }

  return signature.every((byte, index) => bytes[offset + index] === byte);
}

function matchesAscii(bytes: Uint8Array, value: string, offset = 0) {
  return matchesBytes(
    bytes,
    Array.from(value, (character) => character.charCodeAt(0)),
    offset
  );
}

async function hasPngSignature(file: File) {
  return matchesBytes(await readFilePrefix(file, 8), [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}

async function hasJpegSignature(file: File) {
  return matchesBytes(await readFilePrefix(file, 3), [0xff, 0xd8, 0xff]);
}

async function hasGifSignature(file: File) {
  const bytes = await readFilePrefix(file, 6);

  return matchesAscii(bytes, "GIF87a") || matchesAscii(bytes, "GIF89a");
}

async function hasWebpSignature(file: File) {
  const bytes = await readFilePrefix(file, 12);

  return matchesAscii(bytes, "RIFF") && matchesAscii(bytes, "WEBP", 8);
}

async function hasPdfSignature(file: File) {
  return matchesAscii(await readFilePrefix(file, 5), "%PDF-");
}

async function isUtf8TextFile(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (bytes.includes(0)) {
    return false;
  }

  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return false;
  }

  return bytes.every((byte) => byte === 9 || byte === 10 || byte === 12 || byte === 13 || byte >= 32);
}

export const ALLOWED_FILE_TYPES: Record<string, AllowedFileType> = {
  ".png": {
    mimeTypes: ["image/png"],
    contentType: "image/png",
    validateContent: hasPngSignature,
  },
  ".jpg": {
    mimeTypes: ["image/jpeg"],
    contentType: "image/jpeg",
    validateContent: hasJpegSignature,
  },
  ".jpeg": {
    mimeTypes: ["image/jpeg"],
    contentType: "image/jpeg",
    validateContent: hasJpegSignature,
  },
  ".gif": {
    mimeTypes: ["image/gif"],
    contentType: "image/gif",
    validateContent: hasGifSignature,
  },
  ".webp": {
    mimeTypes: ["image/webp"],
    contentType: "image/webp",
    validateContent: hasWebpSignature,
  },
  ".pdf": {
    mimeTypes: ["application/pdf"],
    contentType: "application/pdf",
    validateContent: hasPdfSignature,
  },
  ".txt": {
    mimeTypes: ["text/plain"],
    contentType: "text/plain",
    validateContent: isUtf8TextFile,
  },
  ".csv": {
    mimeTypes: ["text/csv", "application/csv", "text/plain"],
    contentType: "text/csv",
    validateContent: isUtf8TextFile,
  },
};

export function getAllowedFileType(extension: string) {
  return ALLOWED_FILE_TYPES[extension];
}

export function getUploadFilePath(filename: string, userId: string) {
  const uploadsDir = getUserUploadsDir(userId);
  const filePath = path.join(uploadsDir, filename);
  const relativePath = path.relative(uploadsDir, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}

export function getStoredUpload(filename: string, userId: string) {
  if (!UUID_FILE_NAME_PATTERN.test(filename)) {
    return null;
  }

  const extension = path.extname(filename).toLowerCase();
  const fileType = getAllowedFileType(extension);

  if (!fileType) {
    return null;
  }

  return {
    extension,
    filePath: getUploadFilePath(filename, userId),
    fileType,
  };
}

export function getUploadsDirectory(userId: string) {
  return getUserUploadsDir(userId);
}
