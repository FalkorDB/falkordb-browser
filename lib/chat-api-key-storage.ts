import type { ChatApiKey } from "@/app/components/provider";

export const CHAT_API_KEYS_STORAGE_KEY = "chatApiKeys";
export const SELECTED_CHAT_API_KEY_ID_STORAGE_KEY = "selectedChatApiKeyId";

export const getSelectedChatApiKey = (
  keys: ChatApiKey[],
  selectedId: string,
): ChatApiKey | undefined => keys.find(({ id }) => id === selectedId) ?? keys[0];

export const persistSelectedChatApiKeyId = (selectedId: string): void => {
  if (!selectedId) {
    localStorage.removeItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY);
    return;
  }
  // codeql[js/clear-text-storage-of-sensitive-data] - selectedId is a UUID reference, not the actual API key
  localStorage.setItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY, selectedId);
};
