/**
 * Sends the last event of a Server-Sent Events stream and closes it. Neither
 * call is awaited, since the reader only drains once the response is returned;
 * when the client leaves before reading, both reject, and that is not an error.
 */
export function endStream(writer: WritableStreamDefaultWriter<Uint8Array>, chunk: Uint8Array): void {
    const clientLeft = () => {};
    writer.write(chunk).catch(clientLeft);
    writer.close().catch(clientLeft);
}
