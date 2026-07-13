import Busboy from "busboy";
import { Readable } from "stream";
import type { ReadableStream as NodeReadableStream } from "stream/web";
import { pipeline } from "stream/promises";
import type { NextRequest } from "next/server";
import { getCsvMaxUploadBytes } from "../../lib/csv-temp-config.ts";
import { CsvHeadTransform, CsvValidationError } from "./csv-head.ts";

export type CsvUploadResult = { ok: true } | { ok: false; error: string; status: number };

/**
 * Stream a multipart request's single `file` part to storage via the `store`
 * callback, without ever buffering the whole file in memory. The upload is:
 *   - bounded (`files:1, fields:0, parts:10`) and size-capped (`getCsvMaxUploadBytes`,
 *     rejected with 413), with all busboy limit events rejected, and
 *   - piped through `CsvHeadTransform`, which strips a BOM and rejects binary
 *     input (400) before anything is persisted.
 *
 * The result is only resolved after BOTH the store and the full source→busboy
 * pipeline finish, so a late error or an extra/delayed part can't be accepted.
 * On any non-ok result the caller should best-effort delete the (possibly
 * partial) object.
 */
export async function streamCsvUpload(
    request: NextRequest,
    store: (body: Readable) => Promise<void>
): Promise<CsvUploadResult> {
    const { body } = request;
    if (!body) {
        return { ok: false, error: "Request body is missing.", status: 400 };
    }

    const contentType = request.headers.get("content-type") ?? "";
    const maxSize = getCsvMaxUploadBytes();

    return new Promise<CsvUploadResult>((resolve) => {
        let settled = false;
        let fileSeen = false;
        let limitHit = false;
        let storePromise: Promise<void> | null = null;

        const done = (result: CsvUploadResult) => {
            if (!settled) {
                settled = true;
                resolve(result);
            }
        };

        let busboy: ReturnType<typeof Busboy>;
        try {
            busboy = Busboy({
                headers: { "content-type": contentType },
                limits: { files: 1, fields: 0, parts: 10, fileSize: maxSize },
            });
        } catch (err) {
            console.error("csv busboy init error:", err);
            done({ ok: false, error: "Failed to parse upload.", status: 400 });
            return;
        }

        busboy.on("file", (fieldname, fileStream, info) => {
            if (fieldname !== "file" || fileSeen) {
                fileStream.resume();
                return;
            }
            fileSeen = true;

            if (!info.filename?.toLowerCase().endsWith(".csv")) {
                fileStream.resume();
                done({ ok: false, error: "Only .csv files are accepted.", status: 400 });
                return;
            }

            fileStream.on("limit", () => {
                limitHit = true;
            });

            // Kick off the streaming store; completion is awaited on "close".
            storePromise = store(fileStream.pipe(new CsvHeadTransform()));
            // Avoid an unhandled rejection if "close" is skipped due to an abort.
            storePromise.catch(() => undefined);
        });

        busboy.on("filesLimit", () =>
            done({ ok: false, error: "Only a single file may be uploaded.", status: 400 })
        );
        busboy.on("fieldsLimit", () =>
            done({ ok: false, error: "Unexpected form fields.", status: 400 })
        );
        busboy.on("partsLimit", () =>
            done({ ok: false, error: "Too many form parts.", status: 400 })
        );

        busboy.on("close", () => {
            void (async () => {
                if (!fileSeen) {
                    done({ ok: false, error: "No file provided.", status: 400 });
                    return;
                }
                try {
                    await storePromise;
                } catch (err: unknown) {
                    if (err instanceof CsvValidationError) {
                        done({ ok: false, error: err.message, status: err.status });
                        return;
                    }
                    console.error("csv store error:", err);
                    done({ ok: false, error: "Failed to store the uploaded file.", status: 500 });
                    return;
                }
                if (limitHit) {
                    done({
                        ok: false,
                        error: `File exceeds the ${Math.floor(maxSize / (1024 * 1024))} MB limit.`,
                        status: 413,
                    });
                    return;
                }
                done({ ok: true });
            })();
        });

        busboy.on("error", (err) => {
            console.error("csv busboy error:", err);
            done({ ok: false, error: "Failed to parse upload.", status: 500 });
        });

        pipeline(
            Readable.fromWeb(body as NodeReadableStream<Uint8Array>),
            busboy
        ).catch((err: unknown) => {
            console.error("csv upload stream error:", err);
            done({ ok: false, error: "Failed to parse upload.", status: 500 });
        });
    });
}
