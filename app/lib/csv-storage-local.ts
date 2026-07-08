import path from "path";
import fs from "fs";
import type { CsvStorageProvider } from "./csv-storage";

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
        await fs.promises.writeFile(path.join(dir, `${key}.csv`), bytes);

        const base =
            (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000")
                .replace(/\/$/, "");
        return `${base}/api/csv-temp/${key}`;
    }

    async delete(key: string): Promise<void> {
        const filePath = path.join(getCsvTempDir(), `${key}.csv`);
        await fs.promises.unlink(filePath).catch(() => undefined);
    }
}
