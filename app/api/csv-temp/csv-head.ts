import { Transform, type TransformCallback } from "stream";

/**
 * Streaming CSV head validation: strip a leading UTF-8 BOM and reject obviously
 * binary content, without buffering the whole (possibly very large) file. Only
 * the leading bytes are inspected — enough to catch a BOM and binary files — so
 * uploads stream to storage with constant memory.
 */

export class CsvValidationError extends Error {
    readonly status = 400;
    constructor(message: string) {
        super(message);
        this.name = "CsvValidationError";
    }
}

/** Number of leading bytes accumulated before the head is validated/flushed. */
export const CSV_HEAD_INSPECT_BYTES = 8 * 1024;

export function stripLeadingBom(chunk: Buffer): Buffer {
    if (chunk.length >= 3 && chunk[0] === 0xef && chunk[1] === 0xbb && chunk[2] === 0xbf) {
        return chunk.subarray(3);
    }
    return chunk;
}

/** A NUL byte in the head strongly implies a non-text/binary file. */
export function headLooksBinary(chunk: Buffer): boolean {
    return chunk.includes(0);
}

/**
 * Transform that validates + normalizes the CSV head, then passes the rest of
 * the stream through untouched. Emits a `CsvValidationError` for empty/binary
 * input so the storage pipeline rejects before persisting a bad object.
 */
export class CsvHeadTransform extends Transform {
    private headDone = false;
    private headChunks: Buffer[] = [];
    private headLen = 0;

    private flushHead(cb: TransformCallback): void {
        const head = stripLeadingBom(Buffer.concat(this.headChunks));
        this.headChunks = [];
        this.headDone = true;

        if (head.length === 0) {
            cb(new CsvValidationError("The file is empty."));
            return;
        }

        if (headLooksBinary(head)) {
            cb(new CsvValidationError("The file does not appear to be a valid CSV (contains binary data)."));
            return;
        }
        this.push(head);
        cb();
    }

    override _transform(chunk: Buffer, _enc: BufferEncoding, cb: TransformCallback): void {
        if (this.headDone) {
            cb(null, chunk);
            return;
        }
        this.headChunks.push(chunk);
        this.headLen += chunk.length;
        if (this.headLen >= CSV_HEAD_INSPECT_BYTES) {
            this.flushHead(cb);
            return;
        }
        cb();
    }

    override _flush(cb: TransformCallback): void {
        if (this.headDone) {
            cb();
            return;
        }
        if (this.headLen === 0) {
            cb(new CsvValidationError("The file is empty."));
            return;
        }
        this.flushHead(cb);
    }
}
