import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const raw = process.env.BROKER_TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error("BROKER_TOKEN_ENCRYPTION_KEY missing");
  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) throw new Error("Encryption key must be 32 bytes");
  return key;
}

export function encryptSecret(plaintext: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptSecret(payload: { ciphertext: string; iv: string; authTag: string }) {
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(payload.iv, "base64"));
  decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(payload.ciphertext, "base64")), decipher.final()]).toString("utf8");
}
