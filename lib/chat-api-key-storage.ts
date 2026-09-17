import type { ChatApiKey } from "@/app/components/provider";
import { removeConnectionItem, setConnectionItem } from "./connection-storage";

export const CHAT_API_KEYS_STORAGE_KEY = "chatApiKeys";
export const SELECTED_CHAT_API_KEY_ID_STORAGE_KEY = "selectedChatApiKeyId";

export const getSelectedChatApiKey = (
  keys: ChatApiKey[],
  selectedId: string,
): ChatApiKey | undefined => keys.find(({ id }) => id === selectedId) ?? keys[0];

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
