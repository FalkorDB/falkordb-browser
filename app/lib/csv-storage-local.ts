import path from "path";
import fs from "fs";
import type { CsvStorageProvider } from "./csv-storage";

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRunningInDocker(): boolean {
    return fs.existsSync("/.dockerenv");
}

function normalizeCsvKey(key: string): string {
    const match = UUID_PATTERN.exec(key);
    if (!match) {
        throw new Error("Invalid CSV key.");
    }
    return match[0].toLowerCase();
}

function buildSafeCsvFilePath(key: string): string {
    // Use the normalized UUID value — not the original string — so static
    // analysis tools can confirm path segments are traversal-safe.
    const safeKey = normalizeCsvKey(key);
    return path.join(path.resolve(getCsvTempDir()), `${safeKey}.csv`);
}

export function getCsvTempDir(): string {
    const configured = process.env.CSV_LOCAL_TEMP_DIR?.trim();
    if (configured) return path.resolve(configured);

    if (isRunningInDocker()) {
        return "/var/lib/FalkorDB/import";
    }

    return path.join(process.cwd(), "uploads", "csv-temp");
}

function getLocalLoadUriMode(): "file" | "http" {
    const configured = process.env.CSV_LOCAL_LOAD_URI_MODE?.toLowerCase();
    if (configured === "file") return "file";
    if (configured === "http") return "http";
    return isRunningInDocker() ? "file" : "http";
}

/**
 * Stores CSV files on the local filesystem under `uploads/csv-temp/`.
 * Files are served publicly via GET /api/csv-temp/[id].
 *
 * Use this for local development or same-machine deployments where no
 * external object store is available (CSV_STORAGE=local or no S3 creds).
 */
export class LocalCsvStorage implements CsvStorageProvider {
    async store(key: string, bytes: Uint8Array): Promise<string> {
        const dir = getCsvTempDir();
        const safeKey = normalizeCsvKey(key);
        await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.writeFile(buildSafeCsvFilePath(key), bytes);

        if (getLocalLoadUriMode() === "file") {
            // FalkorDB resolves file://<name>.csv relative to IMPORT_FOLDER.
            return `file://${safeKey}.csv`;
        }

        const base =
            (process.env.CSV_SERVE_BASE_URL
                ?? process.env.AUTH_URL
                ?? process.env.NEXTAUTH_URL
                ?? "http://localhost:3000")
                .replace(/\/$/, "");
        return `${base}/api/csv-temp/${safeKey}`;
    }

    async delete(key: string): Promise<void> {
        const filePath = buildSafeCsvFilePath(key);
        await fs.promises.unlink(filePath).catch(() => undefined);
    }

    async cleanupExpired(olderThanMs: number): Promise<number> {
        const dir = getCsvTempDir();
        let deleted = 0;

        const entries = await fs.promises.readdir(dir, { withFileTypes: true }).catch(() => []);

        for (const entry of entries) {
            if (!entry.isFile() || !entry.name.endsWith(".csv")) continue;

            const filePath = path.join(dir, entry.name);
            try {
                const stat = await fs.promises.stat(filePath);
                if (stat.mtimeMs <= olderThanMs) {
                    await fs.promises.unlink(filePath);
                    deleted += 1;
                }
            } catch {
                // best-effort cleanup
            }
        }

        return deleted;
    }
}
