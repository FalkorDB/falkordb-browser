const MAX_CHAT_BODY_BYTES = 64 * 1024;
const OVER_LIMIT = Symbol("over-limit");

export { MAX_CHAT_BODY_BYTES, OVER_LIMIT };

// Enforce a byte cap while streaming so chunked bodies cannot bypass Content-Length checks.
export async function readChatBodyWithLimit(
  request: Pick<Request, "body">,
  maxBytes = MAX_CHAT_BODY_BYTES,
): Promise<string | typeof OVER_LIMIT> {
  const reader = request.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let text = "";
  let received = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        received += value.byteLength;
        if (received > maxBytes) {
          await reader.cancel();
          return OVER_LIMIT;
        }
        text += decoder.decode(value, { stream: true });
      }
    }
  } finally {
    reader.releaseLock();
  }

  return text + decoder.decode();
}
