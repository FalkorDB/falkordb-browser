/**
 * Server-side encryption helpers.
 * Calls /api/encrypt to encrypt/decrypt values using the server's ENCRYPTION_KEY.
 * Includes legacy migration support for old client-side encrypted values.
 */

import { getActiveConnectionIdGlobal } from './active-connection.ts';

const LEGACY_ENCRYPTED_PREFIX = 'enc:';
const LEGACY_KEY_STORAGE_KEY = 'falkordb-key';

/**
 * Owner binding is derived from the connection behind the request, and the
 * storage key these values are filed under is derived from the connection this
 * tab is showing. Pin the request to the latter so the two cannot disagree:
 * without the header the server falls back to the session's active connection,
 * which another tab can switch out from under this one.
 */
function encryptionHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const connId = getActiveConnectionIdGlobal();
  if (connId) headers['X-Connection-Id'] = connId;
  return headers;
}

export async function serverEncrypt(value: string): Promise<string> {
  if (!value) return '';

  const res = await fetch('/api/encrypt', {
    method: 'POST',
    headers: encryptionHeaders(),
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
 *
 * The AES-256-GCM lengths are part of the check, not decoration: the server has
 * always used a 12-byte IV (24 hex chars) and GCM's 16-byte tag (32 hex chars),
 * in every version of the format. Matching three hex runs of any length instead
 * would claim a colon-separated plain-text credential such as `dead:beef:cafe`,
 * which then gets posted to the decrypt API, refused as legacy ciphertext and
 * cleared out from under the user.
 */
const IV_HEX_LENGTH = 24;
const AUTH_TAG_HEX_LENGTH = 32;
const HEX = /^[0-9a-fA-F]+$/;

export function looksServerEncrypted(value: string): boolean {
  const parts = value.split(':');
  const hexParts = parts[0] === 'v2' ? parts.slice(1) : parts;
  if (hexParts.length !== 3) return false;
  const [iv, authTag, data] = hexParts;
  return iv.length === IV_HEX_LENGTH
    && authTag.length === AUTH_TAG_HEX_LENGTH
    && data.length > 0
    && HEX.test(iv) && HEX.test(authTag) && HEX.test(data);
}

export async function serverDecrypt(encryptedValue: string): Promise<string> {
  if (!encryptedValue) return '';

  if (!looksServerEncrypted(encryptedValue)) {
    throw new Error('Value is not in server-encrypted format');
  }

  const res = await fetch('/api/encrypt', {
    method: 'POST',
    headers: encryptionHeaders(),
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
