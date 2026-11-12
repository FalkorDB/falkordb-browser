import type { ChatApiKey } from "@/app/components/provider";
import { setConnectionItem } from "./connection-storage.ts";

export const CHAT_API_KEYS_STORAGE_KEY = "chatApiKeys";
export const SELECTED_CHAT_API_KEY_ID_STORAGE_KEY = "selectedChatApiKeyId";

export const getSelectedChatApiKey = (
  keys: ChatApiKey[],
  selectedId: string | null,
): ChatApiKey | undefined => selectedId === "" ? undefined : keys.find(({ id }) => id === selectedId) ?? keys[0];

// Scoped like the key list itself: the id names a key that only one connection
// can decrypt, so a global entry let connection B's fallback overwrite
// connection A's pick and lose it on the way back.
export const persistSelectedChatApiKeyId = (selectedId: string): void => {
  // An empty ID persists explicit deselection; only a missing preference falls back.
  setConnectionItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY, String(selectedId));
  localStorage.removeItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY);
};
