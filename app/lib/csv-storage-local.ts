import path from "path";
import fs from "fs";
import type { CsvStorageProvider } from "./csv-storage";

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function buildSafeCsvFilePath(key: string): string {
    // Use the regex match result — not the original string — so static analysis
    // tools can confirm the value that reaches path.join cannot contain
    // path-traversal sequences.  UUID v4 chars are [0-9a-f-] only.
    const match = UUID_PATTERN.exec(key);
    if (!match) {
        throw new Error("Invalid CSV key.");
    }
    const safeKey = match[0].toLowerCase();
    return path.join(path.resolve(getCsvTempDir()), `${safeKey}.csv`);
}

export function getCsvTempDir(): string {
    return path.join(process.cwd(), "uploads", "csv-temp");
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
        await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.writeFile(buildSafeCsvFilePath(key), bytes);

        const base =
            (process.env.CSV_SERVE_BASE_URL
                ?? process.env.AUTH_URL
                ?? process.env.NEXTAUTH_URL
                ?? "http://localhost:3000")
                .replace(/\/$/, "");
        return `${base}/api/csv-temp/${key}`;
    }

    async delete(key: string): Promise<void> {
        const filePath = buildSafeCsvFilePath(key);
        await fs.promises.unlink(filePath).catch(() => undefined);
    }
}
