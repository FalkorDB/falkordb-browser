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
