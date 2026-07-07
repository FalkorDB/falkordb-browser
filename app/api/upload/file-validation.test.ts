import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import path from "node:path";
import {
  getAllowedFileType,
  getUploadFilePath,
  getStoredUpload,
  getUploadsDirectory,
  MAX_FILE_SIZE,
} from "./file-validation.ts";

// Valid UUID v4 filename for test cases
const VALID_UUID = "a3bb189e-8bf9-4c8b-8b4c-3c2f5c5d5e5f";
const TEST_USER = "test-user-id";

function makeFile(bytes: number[], name = "test", type = "application/octet-stream"): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

function asciiBytes(s: string): number[] {
  return Array.from(s, (c) => c.charCodeAt(0));
}

// ---------------------------------------------------------------------------
// constants
// ---------------------------------------------------------------------------

describe("constants", () => {
  it("MAX_FILE_SIZE is 5 MB", () => {
    assert.equal(MAX_FILE_SIZE, 5 * 1024 * 1024);
  });
});

// ---------------------------------------------------------------------------
// getAllowedFileType
// ---------------------------------------------------------------------------

describe("getAllowedFileType", () => {
  it("returns undefined for unknown extensions", () => {
    assert.equal(getAllowedFileType(".exe"), undefined);
    assert.equal(getAllowedFileType(".zip"), undefined);
    assert.equal(getAllowedFileType(""), undefined);
    assert.equal(getAllowedFileType(".sh"), undefined);
    assert.equal(getAllowedFileType(".js"), undefined);
  });

  it("returns the correct contentType for each allowed extension", () => {
    const cases: [string, string][] = [
      [".png", "image/png"],
      [".jpg", "image/jpeg"],
      [".jpeg", "image/jpeg"],
      [".gif", "image/gif"],
      [".webp", "image/webp"],
      [".pdf", "application/pdf"],
      [".txt", "text/plain"],
      [".csv", "text/csv"],
      [".cql", "text/plain"],
      [".cypher", "text/plain"],
      [".dump", "application/octet-stream"],
    ];

    for (const [ext, expectedContentType] of cases) {
      const fileType = getAllowedFileType(ext);
      assert.ok(fileType, `expected config for ${ext}`);
      assert.equal(fileType.contentType, expectedContentType, `wrong contentType for ${ext}`);
    }
  });

  it("includes the contentType in the mimeTypes list for each extension", () => {
    for (const ext of [".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf", ".txt", ".csv", ".cql", ".cypher", ".dump"]) {
      const fileType = getAllowedFileType(ext);
      assert.ok(fileType, `expected config for ${ext}`);
      assert.ok(
        (fileType.mimeTypes as readonly string[]).includes(fileType.contentType),
        `contentType ${fileType.contentType} not in mimeTypes for ${ext}`
      );
    }
  });

  it("returns a validateContent function for every allowed extension", () => {
    for (const ext of [".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf", ".txt", ".csv", ".cql", ".cypher", ".dump"]) {
      const fileType = getAllowedFileType(ext);
      assert.ok(fileType, `expected config for ${ext}`);
      assert.equal(typeof fileType.validateContent, "function");
    }
  });
});

// ---------------------------------------------------------------------------
// getAllowedFileType — validateContent (content-sniffing)
// ---------------------------------------------------------------------------

describe("getAllowedFileType validateContent — image signatures", () => {
  it("accepts a valid PNG file", async () => {
    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    const file = makeFile([...pngSignature, 0x00, 0x00], "test.png", "image/png");
    const { validateContent } = getAllowedFileType(".png")!;
    assert.equal(await validateContent(file), true);
  });

  it("rejects a file without a PNG signature", async () => {
    const file = makeFile([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07], "test.png", "image/png");
    const { validateContent } = getAllowedFileType(".png")!;
    assert.equal(await validateContent(file), false);
  });

  it("accepts a valid JPEG file", async () => {
    const file = makeFile([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10], "test.jpg", "image/jpeg");
    const { validateContent } = getAllowedFileType(".jpg")!;
    assert.equal(await validateContent(file), true);
  });

  it("rejects a file without a JPEG signature", async () => {
    const file = makeFile([0x00, 0x01, 0x02], "test.jpg", "image/jpeg");
    const { validateContent } = getAllowedFileType(".jpg")!;
    assert.equal(await validateContent(file), false);
  });

  it("accepts a GIF87a file", async () => {
    const file = makeFile(asciiBytes("GIF87a"), "test.gif", "image/gif");
    const { validateContent } = getAllowedFileType(".gif")!;
    assert.equal(await validateContent(file), true);
  });

  it("accepts a GIF89a file", async () => {
    const file = makeFile(asciiBytes("GIF89a"), "test.gif", "image/gif");
    const { validateContent } = getAllowedFileType(".gif")!;
    assert.equal(await validateContent(file), true);
  });

  it("rejects a file without a valid GIF signature", async () => {
    // GIF88a is not a valid signature
    const file = makeFile(asciiBytes("GIF88a"), "test.gif", "image/gif");
    const { validateContent } = getAllowedFileType(".gif")!;
    assert.equal(await validateContent(file), false);
  });

  it("accepts a valid WebP file (RIFF....WEBP)", async () => {
    // WebP: "RIFF" + 4 size bytes + "WEBP"
    const bytes = [...asciiBytes("RIFF"), 0x00, 0x00, 0x00, 0x00, ...asciiBytes("WEBP")];
    const file = makeFile(bytes, "test.webp", "image/webp");
    const { validateContent } = getAllowedFileType(".webp")!;
    assert.equal(await validateContent(file), true);
  });

  it("rejects a file without a valid WebP signature", async () => {
    // Has RIFF but not WEBP at offset 8
    const bytes = [...asciiBytes("RIFF"), 0x00, 0x00, 0x00, 0x00, ...asciiBytes("JPEG")];
    const file = makeFile(bytes, "test.webp", "image/webp");
    const { validateContent } = getAllowedFileType(".webp")!;
    assert.equal(await validateContent(file), false);
  });
});

describe("getAllowedFileType validateContent — document/text signatures", () => {
  it("accepts a valid PDF file", async () => {
    const file = makeFile([...asciiBytes("%PDF-"), 0x31, 0x2e, 0x34], "test.pdf", "application/pdf");
    const { validateContent } = getAllowedFileType(".pdf")!;
    assert.equal(await validateContent(file), true);
  });

  it("rejects a file without a PDF signature", async () => {
    const file = makeFile([0x00, 0x01, 0x02, 0x03, 0x04], "test.pdf", "application/pdf");
    const { validateContent } = getAllowedFileType(".pdf")!;
    assert.equal(await validateContent(file), false);
  });

  it("accepts a valid UTF-8 text file for .txt", async () => {
    const content = new TextEncoder().encode("hello world\nline 2\n");
    const file = makeFile(Array.from(content), "test.txt", "text/plain");
    const { validateContent } = getAllowedFileType(".txt")!;
    assert.equal(await validateContent(file), true);
  });

  it("rejects a file with null bytes for .txt", async () => {
    const file = makeFile([0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x00], "test.txt", "text/plain");
    const { validateContent } = getAllowedFileType(".txt")!;
    assert.equal(await validateContent(file), false);
  });

  it("rejects non-printable control characters for .txt", async () => {
    // 0x01 is a control char that is not TAB/LF/FF/CR
    const file = makeFile([0x01, 0x02], "test.txt", "text/plain");
    const { validateContent } = getAllowedFileType(".txt")!;
    assert.equal(await validateContent(file), false);
  });

  it("accepts valid CSV text for .csv", async () => {
    const content = new TextEncoder().encode("name,age\nAlice,30\n");
    const file = makeFile(Array.from(content), "test.csv", "text/csv");
    const { validateContent } = getAllowedFileType(".csv")!;
    assert.equal(await validateContent(file), true);
  });

  it("accepts valid Cypher text for .cypher", async () => {
    const content = new TextEncoder().encode("CREATE (:Person {name: 'Alice'});\n");
    const file = makeFile(Array.from(content), "test.cypher", "text/plain");
    const { validateContent } = getAllowedFileType(".cypher")!;
    assert.equal(await validateContent(file), true);
  });

  it("accepts valid Cypher text for .cql", async () => {
    const content = new TextEncoder().encode("MATCH (n) RETURN n;\n");
    const file = makeFile(Array.from(content), "test.cql", "text/plain");
    const { validateContent } = getAllowedFileType(".cql")!;
    assert.equal(await validateContent(file), true);
  });
});

describe("getAllowedFileType validateContent — binary formats", () => {
  it("accepts a non-empty binary file for .dump", async () => {
    const file = makeFile([0x00, 0x01, 0x02], "test.dump", "application/octet-stream");
    const { validateContent } = getAllowedFileType(".dump")!;
    assert.equal(await validateContent(file), true);
  });

  it("rejects an empty file for .dump", async () => {
    const file = makeFile([], "test.dump", "application/octet-stream");
    const { validateContent } = getAllowedFileType(".dump")!;
    assert.equal(await validateContent(file), false);
  });
});

// ---------------------------------------------------------------------------
// getUploadFilePath
// ---------------------------------------------------------------------------

describe("getUploadFilePath", () => {
  it("returns an absolute path ending with the user hash and filename", () => {
    const filename = `${VALID_UUID}.csv`;
    const result = getUploadFilePath(filename, TEST_USER);
    assert.ok(result);

    const userHash = crypto.createHash("sha256").update(TEST_USER).digest("hex");
    assert.ok(result.endsWith(path.join(userHash, filename)));
    assert.ok(path.isAbsolute(result));
  });

  it("returns null for a path-traversal filename using relative segments", () => {
    assert.equal(getUploadFilePath("../secret.txt", TEST_USER), null);
    assert.equal(getUploadFilePath("../../etc/passwd", TEST_USER), null);
    assert.equal(getUploadFilePath("..%2Fsecret", TEST_USER), null);
  });

  it("returns the same path for the same filename and user", () => {
    const filename = `${VALID_UUID}.csv`;
    assert.equal(getUploadFilePath(filename, TEST_USER), getUploadFilePath(filename, TEST_USER));
  });

  it("returns different paths for different users with the same filename", () => {
    const filename = `${VALID_UUID}.csv`;
    assert.notEqual(getUploadFilePath(filename, "alice"), getUploadFilePath(filename, "bob"));
  });
});

// ---------------------------------------------------------------------------
// getStoredUpload
// ---------------------------------------------------------------------------

describe("getStoredUpload", () => {
  it("returns null for non-UUID filenames", () => {
    assert.equal(getStoredUpload("not-a-uuid.csv", TEST_USER), null);
    assert.equal(getStoredUpload("123.csv", TEST_USER), null);
    assert.equal(getStoredUpload("", TEST_USER), null);
    assert.equal(getStoredUpload("file.csv", TEST_USER), null);
    // UUID v1 (version nibble must be 4) — rejected
    assert.equal(getStoredUpload("a3bb189e-8bf9-1c8b-8b4c-3c2f5c5d5e5f.csv", TEST_USER), null);
  });

  it("returns null for a UUID filename with a disallowed extension", () => {
    assert.equal(getStoredUpload(`${VALID_UUID}.exe`, TEST_USER), null);
    assert.equal(getStoredUpload(`${VALID_UUID}.zip`, TEST_USER), null);
    assert.equal(getStoredUpload(`${VALID_UUID}.sh`, TEST_USER), null);
  });

  it("returns the stored upload for .csv", () => {
    const filename = `${VALID_UUID}.csv`;
    const result = getStoredUpload(filename, TEST_USER);
    assert.ok(result);
    assert.equal(result.extension, ".csv");
    assert.ok(result.filePath);
    assert.deepEqual(result.fileType, getAllowedFileType(".csv"));
  });

  it("returns the stored upload for .cypher", () => {
    const result = getStoredUpload(`${VALID_UUID}.cypher`, TEST_USER);
    assert.ok(result);
    assert.equal(result.extension, ".cypher");
  });

  it("returns the stored upload for .cql", () => {
    const result = getStoredUpload(`${VALID_UUID}.cql`, TEST_USER);
    assert.ok(result);
    assert.equal(result.extension, ".cql");
  });

  it("no longer allows .rdb — restore is dump-only (RESTORE needs a DUMP payload)", () => {
    assert.equal(getAllowedFileType(".rdb"), undefined);
    assert.equal(getStoredUpload(`${VALID_UUID}.rdb`, TEST_USER), null);
  });

  it("returns the stored upload for .dump", () => {
    const result = getStoredUpload(`${VALID_UUID}.dump`, TEST_USER);
    assert.ok(result);
    assert.equal(result.extension, ".dump");
  });

  it("returns the stored upload for image extensions", () => {
    for (const ext of [".png", ".jpg", ".jpeg", ".gif", ".webp"]) {
      const result = getStoredUpload(`${VALID_UUID}${ext}`, TEST_USER);
      assert.ok(result, `expected stored upload for ${ext}`);
      assert.equal(result.extension, ext);
    }
  });

  it("returns a filePath inside the user-scoped uploads directory", () => {
    const result = getStoredUpload(`${VALID_UUID}.csv`, TEST_USER);
    assert.ok(result?.filePath);
    const expectedDir = getUploadsDirectory(TEST_USER);
    assert.ok(result.filePath.startsWith(expectedDir));
  });
});

// ---------------------------------------------------------------------------
// getUploadsDirectory
// ---------------------------------------------------------------------------

describe("getUploadsDirectory", () => {
  it("returns different directories for different users", () => {
    assert.notEqual(getUploadsDirectory("alice"), getUploadsDirectory("bob"));
  });

  it("returns the same directory for repeated calls with the same user", () => {
    assert.equal(getUploadsDirectory(TEST_USER), getUploadsDirectory(TEST_USER));
  });

  it("returns an absolute path that contains 'uploads'", () => {
    const dir = getUploadsDirectory(TEST_USER);
    assert.ok(path.isAbsolute(dir));
    assert.ok(dir.includes("uploads"));
  });

  it("encodes the user ID as a SHA-256 hex digest in the path", () => {
    const expectedHash = crypto.createHash("sha256").update(TEST_USER).digest("hex");
    const dir = getUploadsDirectory(TEST_USER);
    assert.ok(dir.endsWith(expectedHash));
  });
});
