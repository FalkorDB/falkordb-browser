export const chatDraftKey = (graphName: string): string => `chatDraft-${graphName}`;

export function isUnchangedChatDraft(
    submitted: { text: string; revision: number },
    storedText: string | null,
    currentRevision: number,
): boolean {
    return submitted.text === storedText && submitted.revision === currentRevision;
}

export function isChatConfigurationError(message: string): boolean {
    return /\b(?:api[ _-]?key|model(?:\/api key)? mismatch|no model selected|model "[^"]+" not found|unsupported (?:model|provider)|provider (?:rejected|error|unavailable)|(?:reach|connect to) (?:the )?(?:ai provider|local (?:server|provider))|local llm endpoint|ollama|lm studio)\b/i.test(message);
}
