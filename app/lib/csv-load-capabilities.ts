import { getResolvedCsvStorageMode } from "./csv-storage.ts";
import { getLocalLoadUriScheme } from "./csv-storage-local.ts";

/**
 * Whether a hand-written `LOAD CSV FROM 'file://…'` can resolve on this
 * deployment.
 *
 * FalkorDB resolves `file://` relative to its own IMPORT_FOLDER, so the answer
 * is really "does the database read files from the same place this browser
 * writes them to?" — which the browser process cannot observe, and which the
 * CSV storage configuration cannot settle either: an instance can upload to S3
 * and still have a mounted IMPORT_FOLDER full of files a query may legitimately
 * name. Only an operator knows, so only `LOAD_CSV_FILE_URI=false` says no.
 *
 * The two mistakes are not symmetrical. A wrong `true` lets the query fail at
 * the server the way it does today; a wrong `false` blocks a query that would
 * have worked. Anything short of a deliberate statement therefore answers
 * `true`, and the pre-flight check stays quiet.
 */
export function isFileUriLoadSupported(): boolean {
    return process.env.LOAD_CSV_FILE_URI?.trim().toLowerCase() !== "false";
}

/**
 * Whether uploading a CSV through this deployment yields a source the database
 * can actually read — i.e. whether offering the upload is a fix at all.
 *
 * Local storage is the only target whose scheme is configurable, so it is the
 * only one asked: `file://` needs `file://` to be readable, and the HTTP serve
 * route needs an HTTPS base, since FalkorDB refuses plain `http://`. S3 and
 * Blob presign over HTTPS; an operator who forces `S3_READ_URL_PROTOCOL=http`
 * gets a 422 from the upload route naming the URL, which is a better answer
 * than a missing button — and re-deriving that endpoint here would be a second
 * copy of the SigV4 rewrite rules to keep in step.
 *
 * A storage configuration broken badly enough to throw is not evidence that the
 * upload is futile, so it answers `true` and fails loudly in the upload flow.
 */
export function uploadProducesLoadableSource(): boolean {
    try {
        if (getResolvedCsvStorageMode() !== "local") return true;

        const scheme = getLocalLoadUriScheme();
        return scheme === "file" ? isFileUriLoadSupported() : scheme === "https";
    } catch {
        return true;
    }
}
