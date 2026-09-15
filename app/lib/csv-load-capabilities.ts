import { getResolvedCsvStorageMode } from "./csv-storage.ts";
import { getLocalLoadUriMode } from "./csv-storage-local.ts";

/**
 * Whether a hand-written `LOAD CSV FROM 'file://…'` can resolve on this
 * deployment.
 *
 * FalkorDB resolves `file://` relative to its own IMPORT_FOLDER, so the answer
 * is really "does the database read files from the same place this browser
 * writes them to?" — which the browser process cannot observe. So:
 *
 *   - `LOAD_CSV_FILE_URI=true|false` states it outright, for operators who run
 *     the browser and the database on one machine (or deliberately do not) and
 *     configure no CSV storage at all.
 *   - `auto` (the default) infers it: only the local storage provider shares a
 *     filesystem with the database, and only when it hands FalkorDB `file://`
 *     URIs rather than serving the CSV over HTTPS.
 *
 * When in doubt this answers `true`, because the two errors are not
 * symmetrical: a wrong `true` just lets the query fail at the server the way it
 * does today, while a wrong `false` blocks a query that would have worked.
 */
export function isFileUriLoadSupported(): boolean {
    const configured = process.env.LOAD_CSV_FILE_URI?.trim().toLowerCase();
    if (configured === "true") return true;
    if (configured === "false") return false;

    try {
        return getResolvedCsvStorageMode() === "local" && getLocalLoadUriMode() === "file";
    } catch {
        // Storage is misconfigured (it throws on e.g. CSV_STORAGE=s3 with no
        // bucket). That says nothing about the database's import folder.
        return true;
    }
}
