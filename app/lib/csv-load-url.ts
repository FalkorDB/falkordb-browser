/**
 * FalkorDB fetches the CSV file itself for `LOAD CSV FROM <uri>` and only accepts
 * `https://` or `file://` URIs — plain `http://` is rejected outright ("Unsupported
 * URI"). This guards the URL the storage provider resolves so a misconfiguration
 * (e.g. a MinIO / S3 endpoint over `http://`, or a non-HTTPS `CSV_SERVE_BASE_URL`)
 * fails fast with an actionable message instead of surfacing as a silent 0-row
 * import or an opaque database error.
 */

/** The URI schemes FalkorDB's `LOAD CSV` can actually fetch. */
export const FALKOR_FETCHABLE_SCHEMES = ["https", "file"] as const;

/** Thrown when the CSV storage resolved a URL FalkorDB cannot fetch. */
export class CsvUrlConfigError extends Error {
    readonly code = "CSV_URL_UNSUPPORTED";
    constructor(message: string) {
        super(message);
        this.name = "CsvUrlConfigError";
    }
}

/**
 * Throw a `CsvUrlConfigError` with a clear, operator-actionable message unless
 * `url` is a scheme FalkorDB can fetch (`https://` or `file://`).
 */
export function assertFalkorFetchableCsvUrl(url: string): void {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw new CsvUrlConfigError(
            "The CSV storage produced an invalid URL. Check your CSV_STORAGE configuration " +
                "(CSV_STORAGE / S3_ENDPOINT / CSV_SERVE_BASE_URL)."
        );
    }

    const scheme = parsed.protocol.replace(/:$/, "").toLowerCase();
    if ((FALKOR_FETCHABLE_SCHEMES as readonly string[]).includes(scheme)) return;

    const endpoint = parsed.host ? `${scheme}://${parsed.host}` : `${scheme}://`;
    throw new CsvUrlConfigError(
        `FalkorDB can only fetch CSV files over https:// or file:// — the configured CSV storage ` +
            `produced a ${endpoint} URL, which the database rejects. Plain http (for example a MinIO/S3 ` +
            `endpoint like http://localhost:9000, or a non-HTTPS CSV_SERVE_BASE_URL) is not supported. ` +
            `Use an HTTPS-reachable object store (real S3 / Cloudflare R2, or MinIO behind TLS), or set ` +
            `CSV_STORAGE=local with CSV_LOCAL_LOAD_URI_MODE=file and a shared IMPORT_FOLDER for local/dev.`
    );
}
