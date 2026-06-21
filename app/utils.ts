export const MEMORY_USAGE_VERSION_THRESHOLD = 41408;
export const UDF_VERSION_THRESHOLD = 41600;

// Bounds for the UDF catalog forwarded to the chat API. The client clamps to these and the
// `chatRequest` schema enforces them, so a large catalog degrades gracefully instead of 400-ing.
export const UDF_CHAT_MAX_LIBRARIES = 64;
export const UDF_CHAT_MAX_FUNCTIONS_PER_LIBRARY = 256;
export const UDF_CHAT_MAX_NAME_LENGTH = 128;
