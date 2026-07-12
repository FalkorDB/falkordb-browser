/**
 * Server-side encryption helpers.
 * Calls /api/encrypt to encrypt/decrypt values using the server's ENCRYPTION_KEY.
 * Includes legacy migration support for old client-side encrypted values.
 */

const LEGACY_ENCRYPTED_PREFIX = 'enc:';
const LEGACY_KEY_STORAGE_KEY = 'falkordb-key';

export async function serverEncrypt(value: string): Promise<string> {
  if (!value) return '';

  const res = await fetch('/api/encrypt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value, action: 'encrypt' }),
  });

  if (!res.ok) {
    throw new Error(`Encryption failed: ${res.status}`);
  }

  const data = await res.json();
  return data.value;
}

/**
 * Returns true if the value looks like it was produced by the server's encrypt() function.
 * Format: iv(hex):authTag(hex):encryptedData(hex) — three colon-separated hex strings.
 * Avoids sending plain-text values to the decrypt API (which would result in a 400).
 */
export function looksServerEncrypted(value: string): boolean {
  const parts = value.split(':');
  return parts.length === 3 && parts.every(p => p.length > 0 && /^[0-9a-fA-F]+$/.test(p));
}

export async function serverDecrypt(encryptedValue: string): Promise<string> {
  if (!encryptedValue) return '';

  if (!looksServerEncrypted(encryptedValue)) {
    throw new Error('Value is not in server-encrypted format');
  }

  const res = await fetch('/api/encrypt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: encryptedValue, action: 'decrypt' }),
  });

  if (!res.ok) {
    throw new Error(`Decryption failed: ${res.status}`);
  }

  const data = await res.json();
  return data.value;
}

/**
 * Check if a value uses the old client-side encryption format (prefix "enc:")
 */
export function isLegacyEncrypted(value: string): boolean {
  return value.startsWith(LEGACY_ENCRYPTED_PREFIX);
}

/**
 * Decrypt a value encrypted with the old client-side Web Crypto AES-GCM.
 * The key was stored in localStorage/sessionStorage under 'falkordb-key'.
 * Returns empty string if decryption fails (key missing or corrupted).
 */
export async function legacyDecrypt(encryptedValue: string): Promise<string> {
  if (!encryptedValue || !encryptedValue.startsWith(LEGACY_ENCRYPTED_PREFIX)) {
    return '';
  }

  try {
    const storedKey = localStorage.getItem(LEGACY_KEY_STORAGE_KEY)
      || sessionStorage.getItem(LEGACY_KEY_STORAGE_KEY);

    if (!storedKey) return '';

    // Import the old key
    const keyBuffer = base64ToArrayBuffer(storedKey);
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      true,
      ['decrypt']
    );

    // Decode the payload (after prefix)
    const base64Data = encryptedValue.substring(LEGACY_ENCRYPTED_PREFIX.length);
    const combined = new Uint8Array(base64ToArrayBuffer(base64Data));

    // First 12 bytes are IV, rest is ciphertext
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    return '';
  }
}

/**
 * Remove the old client-side encryption key from storage after migration.
 */
export function clearLegacyEncryptionKey(): void {
  localStorage.removeItem(LEGACY_KEY_STORAGE_KEY);
  sessionStorage.removeItem(LEGACY_KEY_STORAGE_KEY);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
