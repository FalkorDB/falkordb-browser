/**
 * Encryption utilities for secure storage of sensitive data in local storage
 * Uses Web Crypto API with AES-GCM encryption
 */

const ENCRYPTION_KEY_STORAGE_KEY = 'falkordb-key';
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const ENCRYPTED_PREFIX = 'enc:'; // Marker to identify encrypted values

/**
 * Convert ArrayBuffer to base64 string for storage
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string back to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a new encryption key using Web Crypto API
 */
async function generateEncryptionKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: ENCRYPTION_ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Export a CryptoKey to a format suitable for storage
 */
async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Import a stored key back to a CryptoKey
 */
async function importKey(keyData: string): Promise<CryptoKey> {
  const buffer = base64ToArrayBuffer(keyData);
  return window.crypto.subtle.importKey(
    'raw',
    buffer,
    {
      name: ENCRYPTION_ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Get or create the encryption key
 * If a key exists in local storage, use it. Otherwise, generate a new one.
 */
async function getOrCreateEncryptionKey(): Promise<CryptoKey> {
  try {
    const storedKey = localStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
    
    if (storedKey) {
      // Use existing key
      return await importKey(storedKey);
    }
    
    // Generate new key
    const newKey = await generateEncryptionKey();
    const exportedKey = await exportKey(newKey);
    localStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, exportedKey);
    
    return newKey;
  } catch (error) {
    console.error('Error getting or creating encryption key:', error);
    throw error;
  }
}

/**
 * Encrypt a string value
 */
export async function encryptValue(value: string): Promise<string> {
  if (!value) return '';
  
  try {
    const key = await getOrCreateEncryptionKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    
    // Generate a random IV (Initialization Vector)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv,
      },
      key,
      data
    );
    
    // Combine IV and encrypted data for storage
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    // Add prefix to identify encrypted values
    return ENCRYPTED_PREFIX + arrayBufferToBase64(combined.buffer);
  } catch (error) {
    console.error('Error encrypting value:', error);
    // Return empty string on error to avoid storing unencrypted data
    return '';
  }
}

/**
 * Decrypt a string value
 */
export async function decryptValue(encryptedValue: string): Promise<string> {
  if (!encryptedValue) return '';
  
  // Check if value has encryption prefix
  if (!encryptedValue.startsWith(ENCRYPTED_PREFIX)) {
    console.warn('Value is not encrypted, returning empty string');
    return '';
  }
  
  try {
    const key = await getOrCreateEncryptionKey();
    // Remove prefix before decoding
    const base64Data = encryptedValue.substring(ENCRYPTED_PREFIX.length);
    const combined = new Uint8Array(base64ToArrayBuffer(base64Data));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);
    
    // Decrypt the data
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv,
      },
      key,
      encryptedData
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.warn('Failed to decrypt value - possibly due to key mismatch or corrupted data. Clearing stored value.', error);
    // Clear the corrupted encrypted value from localStorage if possible
    // Return empty string on error
    return '';
  }
}

/**
 * Check if a value is encrypted (has the encryption prefix)
 */
export function isEncrypted(value: string): boolean {
  return value.startsWith(ENCRYPTED_PREFIX);
}

/**
 * Check if Web Crypto API is available
 */
export function isCryptoAvailable(): boolean {
  return typeof window !== 'undefined' && 
         window.crypto && 
         window.crypto.subtle && 
         typeof window.crypto.subtle.generateKey === 'function';
}
