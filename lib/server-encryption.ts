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
 * Thrown when /api/encrypt refuses to decrypt. `status` distinguishes the two
 * refusals the server makes:
 *  - 400: the value predates owner binding and must be re-entered (drop it).
 *  - 403: the value belongs to a different connection (keep it — switching back
 *    to that connection restores access).
 */
export class ServerDecryptError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Decryption failed: ${status}`);
    this.name = 'ServerDecryptError';
    this.status = status;
  }
}

/**
 * Returns true if the value looks like ciphertext produced by the server.
 * Current format: v2:iv:authTag:encryptedData — owner-bound.
 * Legacy format:  iv:authTag:encryptedData — unbound, no longer decryptable,
 * but still recognised so it is never mistaken for plain text and shown to the
 * user as a hex blob.
 * Avoids sending plain-text values to the decrypt API (which would result in a 400).
 */
export function looksServerEncrypted(value: string): boolean {
  const parts = value.split(':');
  const hexParts = parts[0] === 'v2' ? parts.slice(1) : parts;
  return hexParts.length === 3 && hexParts.every(p => p.length > 0 && /^[0-9a-fA-F]+$/.test(p));
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
    throw new ServerDecryptError(res.status);
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
