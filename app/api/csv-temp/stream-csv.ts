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
 * The result is resolved only after BOTH busboy has closed AND the store has
 * settled, so a late error or an extra/delayed part can't be accepted, and the
 * caller's post-failure delete can't race a still-writing store (e.g. a local
 * `.part` rename). When the store/validator rejects mid-file, the source stream
 * is drained so busboy can still reach `close` instead of deadlocking. On any
 * non-ok result the caller should best-effort delete the (possibly partial)
 * object.
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
        let sizeLimitHit = false;
        let busboyClosed = false;
        let storeSettled = false;
        let terminalError: { status: number; error: string } | null = null;
        let sourceStream: Readable | null = null;

        const finish = (result: CsvUploadResult) => {
            if (!settled) {
                settled = true;
                resolve(result);
            }
        };

        // Record the first terminal problem; later ones don't override it.
        const recordError = (status: number, error: string) => {
            if (!terminalError) terminalError = { status, error };
        };

        // Drain a source stream so busboy can reach `close` even if the consumer
        // (transform/store) stopped reading after erroring mid-file.
        const drain = (stream: Readable | null) => {
            if (stream && !stream.destroyed) {
                stream.unpipe();
                stream.resume();
            }
        };

        // Resolve only once busboy has closed and any store has settled.
        const settleIfReady = () => {
            if (!busboyClosed || !storeSettled) return;
            if (terminalError) {
                finish({ ok: false, ...terminalError });
                return;
            }
            if (!fileSeen) {
                finish({ ok: false, error: "No file provided.", status: 400 });
                return;
            }
            if (sizeLimitHit) {
                finish({
                    ok: false,
                    error: `File exceeds the ${Math.floor(maxSize / (1024 * 1024))} MB limit.`,
                    status: 413,
                });
                return;
            }
            finish({ ok: true });
        };

        let busboy: ReturnType<typeof Busboy>;
        try {
            busboy = Busboy({
                headers: { "content-type": contentType },
                limits: { files: 1, fields: 0, parts: 10, fileSize: maxSize },
            });
        } catch (err) {
            console.error("csv busboy init error:", err);
            finish({ ok: false, error: "Failed to parse upload.", status: 400 });
            return;
        }

        busboy.on("file", (fieldname, fileStream, info) => {
            if (fieldname !== "file" || fileSeen) {
                fileStream.resume();
                return;
            }
            fileSeen = true;
            sourceStream = fileStream;

            if (!info.filename?.toLowerCase().endsWith(".csv")) {
                recordError(400, "Only .csv files are accepted.");
                fileStream.resume(); // drain so busboy can close
                storeSettled = true; // no store was started
                settleIfReady();
                return;
            }

            fileStream.on("limit", () => {
                sizeLimitHit = true;
            });

            // Defer so a synchronous throw from `store` is caught here too.
            Promise.resolve()
                .then(() => store(fileStream.pipe(new CsvHeadTransform())))
                .then(
                    () => {
                        storeSettled = true;
                        settleIfReady();
                    },
                    (err: unknown) => {
                        if (err instanceof CsvValidationError) {
                            recordError(err.status, err.message);
                        } else {
                            console.error("csv store error:", err);
                            recordError(500, "Failed to store the uploaded file.");
                        }
                        // Unblock busboy: the consumer stopped, so drain the source.
                        drain(fileStream);
                        storeSettled = true;
                        settleIfReady();
                    }
                );
        });

        busboy.on("filesLimit", () => recordError(400, "Only a single file may be uploaded."));
        busboy.on("fieldsLimit", () => recordError(400, "Unexpected form fields."));
        busboy.on("partsLimit", () => recordError(400, "Too many form parts."));

        busboy.on("close", () => {
            busboyClosed = true;
            if (!fileSeen) storeSettled = true; // nothing to store
            settleIfReady();
        });

        busboy.on("error", (err) => {
            console.error("csv busboy error:", err);
            recordError(500, "Failed to parse upload.");
            drain(sourceStream);
            storeSettled = true;
            busboyClosed = true;
            settleIfReady();
        });

        pipeline(
            Readable.fromWeb(body as NodeReadableStream<Uint8Array>),
            busboy
        ).catch((err: unknown) => {
            console.error("csv upload stream error:", err);
            recordError(500, "Failed to parse upload.");
            drain(sourceStream);
            storeSettled = true;
            busboyClosed = true;
            settleIfReady();
        });
    });
}
