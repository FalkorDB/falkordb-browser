import crypto from "crypto";

/**
 * Get encryption key from environment variable
 * Key must be 32 bytes (64 hex characters)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
  }
  
  if (key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes)");
  }
  
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error("ENCRYPTION_KEY must contain only hexadecimal characters (0-9, a-f, A-F)");
  }
  
  return Buffer.from(key, "hex");
}

/**
 * Marks ciphertext that is bound to an owner.
 */
const BOUND_VERSION = "v2";

/** Thrown when the input is not owner-bound ciphertext. */
export class UnboundCiphertextError extends Error {
  constructor() {
    super("Ciphertext is not bound to an owner");
    this.name = "UnboundCiphertextError";
  }
}

/**
 * Encrypt text using AES-256-GCM.
 *
 * Server-internal use only (credentials in the token DB, looked up by token
 * hash). Anything that a client can hand back for decryption must use
 * encryptForOwner() instead, or the decrypt path becomes an oracle.
 *
 * Returns encrypted data in format: iv:authTag:encryptedData (all hex encoded)
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 12 bytes for GCM

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Return format: iv:authTag:encryptedData (all in hex)
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt text that was encrypted with encrypt()
 * Expects format: iv:authTag:encryptedData (all hex encoded)
 */
export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();

  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Encrypt text using AES-256-GCM, bound to `owner`.
 *
 * The owner id is authenticated (GCM additional data) rather than encrypted, so
 * the ciphertext can only be reopened by presenting the same owner id. That is
 * what stops the decrypt endpoint from acting as an oracle for ciphertext
 * lifted out of somebody else's browser storage.
 *
 * Returns: v2:iv:authTag:encryptedData (all hex encoded)
 */
export function encryptForOwner(text: string, owner: string): string {
  if (!owner) {
    throw new Error("An owner is required to encrypt");
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 12 bytes for GCM

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(owner, "utf8"));

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${BOUND_VERSION}:${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt text that was encrypted with encryptForOwner() for the same owner.
 *
 * Throws `UnboundCiphertextError` for legacy unbound ciphertext — it is
 * deliberately not readable here, because there is no way to tell whose it was.
 * Throws a plain error for a wrong owner or tampered input, which GCM cannot
 * tell apart.
 */
export function decryptForOwner(encryptedText: string, owner: string): string {
  if (!owner) {
    throw new Error("An owner is required to decrypt");
  }

  const key = getEncryptionKey();

  const parts = encryptedText.split(":");
  if (parts.length !== 4 || parts[0] !== BOUND_VERSION) {
    throw new UnboundCiphertextError();
  }

  const iv = Buffer.from(parts[1], "hex");
  const authTag = Buffer.from(parts[2], "hex");
  const encrypted = parts[3];

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAAD(Buffer.from(owner, "utf8"));
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
