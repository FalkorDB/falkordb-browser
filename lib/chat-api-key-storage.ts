import type { ChatApiKey } from "@/app/components/provider";
import { removeConnectionItem, setConnectionItem } from "./connection-storage.ts";

export const CHAT_API_KEYS_STORAGE_KEY = "chatApiKeys";
export const SELECTED_CHAT_API_KEY_ID_STORAGE_KEY = "selectedChatApiKeyId";

export type ChatKeyState = { keys: ChatApiKey[]; selectedId: string };

export const getSelectedChatApiKey = (
  keys: ChatApiKey[],
  selectedId: string,
): ChatApiKey | undefined => keys.find(({ id }) => id === selectedId) ?? keys[0];

// Picks the key a key-list save commits. `next` is `update(snapshot)`; when the
// selection moved while encryption ran (`latest` differs from `snapshot` with
// the same key list), a later user pick wins unless the save removed that key.
export const pickCommittedChatApiKey = (
  next: ChatKeyState,
  snapshot: ChatKeyState,
  latest: ChatKeyState,
  update: (current: ChatKeyState) => ChatKeyState,
  selectionChanged: boolean,
): ChatApiKey | undefined => {
  const updatedSelection = latest === snapshot ? next.selectedId : update(latest).selectedId;
  const keepLaterSelection = selectionChanged && next.keys.some(({ id }) => id === latest.selectedId);
  return getSelectedChatApiKey(next.keys, keepLaterSelection ? latest.selectedId : updatedSelection);
};

// Scoped like the key list itself: the id names a key that only one connection
// can decrypt, so a global entry let connection B's fallback overwrite
// connection A's pick and lose it on the way back.
export const persistSelectedChatApiKeyId = (selectedId: string): void => {
  if (!selectedId) {
    removeConnectionItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY);
    localStorage.removeItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY);
    return;
  }
  // selectedId is a UUID (e.g. "550e8400-e29b-41d4-a716-446655440000"), not the API key value
  setConnectionItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY, String(selectedId));
  localStorage.removeItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY);
};
