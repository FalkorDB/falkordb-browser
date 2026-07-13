// Persistence helpers for the Chat panel's per-graph history.
//
// History is stored in connection-scoped localStorage. Older builds persisted a
// bare `Message[]`; that shape carries no version marker and its `confidence`
// values may be on either the legacy 0-1 scale or the current 0-100 scale
// (depending on which build last wrote them). Current builds wrap the array
// with a version so future reads are unambiguous.

import type { Message } from "@/lib/utils";
import { migrateLegacyConfidence } from "./confidence.ts";

// Bump when the persisted payload shape or value scales change.
// v1 (legacy) was a bare Message[]; v2 wraps the array and stores confidence on
// the current 0-100 scale.
export const CHAT_HISTORY_VERSION = 2;

interface VersionedChatHistory {
    version: number;
    messages: Message[];
}

const CHAT_ROLES = new Set(["user", "assistant"]);
const CHAT_TYPES = new Set(["Text", "Result", "Error", "Status", "CypherQuery", "CypherResult"]);

function isOptionalNumber(value: unknown): boolean {
    return value == null || typeof value === "number";
}

function isMessageLike(value: unknown): value is Message {
    if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
    const message = value as Record<string, unknown>;
    return (
        CHAT_ROLES.has(message.role as string) &&
        typeof message.content === "string" &&
        CHAT_TYPES.has(message.type as string) &&
        isOptionalNumber(message.confidence) &&
        isOptionalNumber(message.tokenUsage)
    );
}

/**
 * Restore persisted chat history.
 *
 * - Malformed JSON, or anything that isn't a recognized shape, yields `[]`.
 * - A bare array is legacy (v1): each `confidence` is reconciled onto the
 *   0-100 scale via {@link migrateLegacyConfidence} so a cached `0.9` renders
 *   as `90%` while an already-0-100 `90` is left untouched.
 * - A `{ version, messages }` object is used as-is only when the version
 *   matches the current one; unknown versions are discarded rather than
 *   guessed at.
 * Non-conforming entries (wrong shape, non-string content, invalid role/type,
 * or non-numeric confidence/tokenUsage) are filtered out so corrupt storage
 * can't crash rendering.
 */
export function parseStoredMessages(raw: string | null): Message[] {
    if (!raw) return [];

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return [];
    }

    if (Array.isArray(parsed)) {
        return parsed.filter(isMessageLike).map(message =>
            message.confidence != null
                ? { ...message, confidence: migrateLegacyConfidence(message.confidence) }
                : message
        );
    }

    if (
        parsed != null &&
        typeof parsed === "object" &&
        (parsed as VersionedChatHistory).version === CHAT_HISTORY_VERSION &&
        Array.isArray((parsed as VersionedChatHistory).messages)
    ) {
        return (parsed as VersionedChatHistory).messages.filter(isMessageLike);
    }

    return [];
}

/** Serialize chat history with the current version marker. */
export function serializeChatHistory(messages: Message[]): string {
    return JSON.stringify({ version: CHAT_HISTORY_VERSION, messages } satisfies VersionedChatHistory);
}
