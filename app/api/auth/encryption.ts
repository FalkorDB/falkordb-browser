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
  
  return Buffer.from(key, "hex");
}

/**
 * Encrypt text using AES-256-GCM
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
