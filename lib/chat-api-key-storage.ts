import { serverEncrypt } from "./server-encryption";
import type { ChatApiKey } from "@/app/components/provider";

export const CHAT_API_KEYS_STORAGE_KEY = "chatApiKeys";
export const SELECTED_CHAT_API_KEY_ID_STORAGE_KEY = "selectedChatApiKeyId";

export const getSelectedChatApiKey = (
  keys: ChatApiKey[],
  selectedId: string,
): ChatApiKey | undefined => keys.find(({ id }) => id === selectedId) ?? keys[0];

export const saveEncryptedSetting = async (key: string, value: string): Promise<boolean> => {
  try {
    const encryptedValue = await serverEncrypt(value);
    if (!encryptedValue) return false;
    localStorage.setItem(key, encryptedValue);
    return true;
  } catch (error) {
    console.error(`Failed to encrypt setting ${key}:`, error);
    return false;
  }
};

export const persistSelectedChatApiKeyId = async (selectedId: string): Promise<boolean> => {
  if (!selectedId) {
    localStorage.removeItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY);
    return true;
  }

  const encryptedSelectedId = await serverEncrypt(selectedId);
  if (!encryptedSelectedId) {
    localStorage.removeItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY);
    return false;
  }

  localStorage.setItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY, encryptedSelectedId);
  return true;
};
