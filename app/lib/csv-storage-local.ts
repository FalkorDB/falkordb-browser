import path from "path";
import fs from "fs";
import { pipeline } from "stream/promises";
import type { Readable } from "stream";
import type { CsvStorageProvider } from "./csv-storage";
import { isValidOwner, normalizeCsvKey, signCsvCapability } from "./csv-key.ts";

/**
 * Stores CSV files on the local filesystem under a dedicated, feature-owned
 * subdirectory of the import root: `<importRoot>/<CSV_TEMP_SUBDIR>/<owner>/<key>.csv`.
 *
 * The dedicated subdirectory means `cleanupExpired` never touches user-managed
 * CSVs placed directly in FalkorDB's shared IMPORT_FOLDER.
 *
 * FalkorDB reads the file either via `file://<relative-to-import-root>` (Docker /
 * same-volume deployments) or over HTTP through GET /api/csv-temp/[id], which is
 * guarded by a short-lived signed capability token.
 */

const CSV_TEMP_SUBDIR = "falkordb-browser-csv-temp";
const SERVE_CAPABILITY_TTL_MS = 15 * 60 * 1000; // 15 minutes

const TEMP_CSV_FILENAME =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.csv$/;

function isRunningInDocker(): boolean {
    return fs.existsSync("/.dockerenv");
}

/** The import root FalkorDB reads from (IMPORT_FOLDER in Docker). */
export function getCsvImportRoot(): string {
    const configured = process.env.CSV_LOCAL_TEMP_DIR?.trim();
    if (configured) return path.resolve(configured);
    if (isRunningInDocker()) return "/var/lib/FalkorDB/import";
    return path.join(process.cwd(), "uploads", "csv-temp");
}

/** Dedicated directory owned exclusively by this feature (safe to clean up). */
export function getCsvTempBaseDir(): string {
    return path.join(getCsvImportRoot(), CSV_TEMP_SUBDIR);
}

function requireOwner(owner: string): string {
    if (!isValidOwner(owner)) throw new Error("Invalid CSV owner.");
    return owner;
}

function safeFilePath(owner: string, key: string): string {
    const safeOwner = requireOwner(owner);
    const safeKey = normalizeCsvKey(key);
    const base = path.resolve(getCsvTempBaseDir());
    const filePath = path.resolve(path.join(base, safeOwner, `${safeKey}.csv`));
    if (filePath !== path.join(base, safeOwner, `${safeKey}.csv`)) {
        throw new Error("Resolved CSV path escapes the temp directory.");
    }
    return filePath;
}

/** Path relative to the import root, for `file://` LOAD CSV URIs. */
function relativeImportPath(owner: string, key: string): string {
    return `${CSV_TEMP_SUBDIR}/${requireOwner(owner)}/${normalizeCsvKey(key)}.csv`;
}

function getLocalLoadUriMode(): "file" | "http" {
    const configured = process.env.CSV_LOCAL_LOAD_URI_MODE?.toLowerCase();
    if (configured === "file") return "file";
    if (configured === "http") return "http";
    return isRunningInDocker() ? "file" : "http";
}

function serveBaseUrl(): string {
    return (
        process.env.CSV_SERVE_BASE_URL ??
        process.env.AUTH_URL ??
        process.env.NEXTAUTH_URL ??
        "http://localhost:3000"
    ).replace(/\/$/, "");
}

/** Read a stored temp CSV for the HTTP serve endpoint. Returns null if missing. */
export async function readLocalCsv(owner: string, key: string): Promise<Buffer | null> {
    try {
        return await fs.promises.readFile(safeFilePath(owner, key));
    } catch {
        return null;
    }
}

export class LocalCsvStorage implements CsvStorageProvider {
    async store(owner: string, key: string, body: Readable): Promise<void> {
        const filePath = safeFilePath(owner, key);
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        // Stream to a temp file then atomically rename, so a failed/aborted upload
        // never leaves a half-written file at the final path.
        const tempPath = `${filePath}.part`;
        try {
            await pipeline(body, fs.createWriteStream(tempPath));
            await fs.promises.rename(tempPath, filePath);
        } catch (err) {
            await fs.promises.unlink(tempPath).catch(() => undefined);
            throw err;
        }
    }

    async resolveReadUrl(owner: string, key: string): Promise<string> {
        const safeOwner = requireOwner(owner);
        const safeKey = normalizeCsvKey(key);

        if (getLocalLoadUriMode() === "file") {
            return `file://${relativeImportPath(safeOwner, safeKey)}`;
        }

        const { token } = signCsvCapability(safeOwner, safeKey, SERVE_CAPABILITY_TTL_MS);
        const query = new URLSearchParams({ o: safeOwner, t: token });
        return `${serveBaseUrl()}/api/csv-temp/${safeKey}?${query.toString()}`;
    }

    async delete(owner: string, key: string): Promise<void> {
        await fs.promises.unlink(safeFilePath(owner, key)).catch(() => undefined);
    }

    async cleanupExpired(olderThanMs: number): Promise<number> {
        const base = getCsvTempBaseDir();
        let deleted = 0;

        const ownerDirs = await fs.promises
            .readdir(base, { withFileTypes: true })
            .catch(() => [] as fs.Dirent[]);

        for (const ownerEntry of ownerDirs) {
            if (!ownerEntry.isDirectory() || !isValidOwner(ownerEntry.name)) continue;
            const ownerPath = path.join(base, ownerEntry.name);

            // eslint-disable-next-line no-await-in-loop
            const files = await fs.promises
                .readdir(ownerPath, { withFileTypes: true })
                .catch(() => [] as fs.Dirent[]);

            for (const file of files) {
                if (!file.isFile() || !TEMP_CSV_FILENAME.test(file.name)) continue;
                const filePath = path.join(ownerPath, file.name);
                try {
                    // eslint-disable-next-line no-await-in-loop
                    const stat = await fs.promises.stat(filePath);
                    if (stat.mtimeMs <= olderThanMs) {
                        // eslint-disable-next-line no-await-in-loop
                        await fs.promises.unlink(filePath);
                        deleted += 1;
                    }
                } catch {
                    // best-effort cleanup
                }
            }
        }

        return deleted;
    }
}
