import { CSV_HEAD_INSPECT_BYTES, headLooksBinary, stripLeadingBom } from "./csv-head.ts";

export type CsvHeadValidation =
    | { status: "valid" }
    | { status: "invalid"; message: string }
    | { status: "unavailable" }
    | { status: "skipped" };

export async function validateCsvHeadFromUrl(csvUrl: string): Promise<CsvHeadValidation> {
    // Local file imports are validated during upload and read by FalkorDB, not fetch.
    if (csvUrl.startsWith("file://")) return { status: "skipped" };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
        const response = await fetch(csvUrl, {
            headers: { Range: `bytes=0-${CSV_HEAD_INSPECT_BYTES - 1}` },
            cache: "no-store",
            signal: controller.signal,
        });
        reader = response.body?.getReader();
        if (response.status === 416 && response.headers.get("content-range")?.trim() === "bytes */0") {
            return { status: "invalid", message: "The uploaded CSV is empty." };
        }
        if (!response.ok) throw new Error(`CSV storage returned HTTP ${response.status}`);

        const buffer = Buffer.alloc(CSV_HEAD_INSPECT_BYTES);
        let length = 0;
        while (reader && length < buffer.length) {
            const { done, value } = await reader.read();
            if (done) break;
            const part = value.subarray(0, buffer.length - length);
            buffer.set(part, length);
            length += part.length;
        }
        const head = stripLeadingBom(buffer.subarray(0, length));
        if (head.length === 0) return { status: "invalid", message: "The uploaded CSV is empty." };
        if (headLooksBinary(head)) {
            return { status: "invalid", message: "The uploaded file does not appear to be a valid CSV (contains binary data)." };
        }
        return { status: "valid" };
    } catch {
        console.warn("CSV header precheck unavailable; FalkorDB will perform the authoritative fetch.");
        return { status: "unavailable" };
    } finally {
        try {
            await reader?.cancel();
        } catch (error) {
            if (!controller.signal.aborted) {
                console.warn("Failed to cancel CSV header response:", error);
            }
        } finally {
            controller.abort();
            clearTimeout(timeout);
            reader?.releaseLock();
        }
    }
}
