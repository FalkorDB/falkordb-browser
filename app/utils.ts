export const MEMORY_USAGE_VERSION_THRESHOLD = 41408;
export const UDF_VERSION_THRESHOLD = 41600;

// Bounds for the UDF catalog forwarded to the chat API. The `chatRequest` schema enforces these
// limits for untrusted callers (an oversized payload is rejected with 400). The client clamps to the
// same limits before sending, so a legitimately large catalog degrades to a bounded subset instead
// of being rejected.
export const UDF_CHAT_MAX_LIBRARIES = 64;
export const UDF_CHAT_MAX_FUNCTIONS_PER_LIBRARY = 256;
export const UDF_CHAT_MAX_NAME_LENGTH = 128;
