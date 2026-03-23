"use client";

/**
 * Client-only vault cryptography (Web Crypto API).
 * Import this module only from Client Components or from code that runs in `useEffect`
 * so PBKDF2 / AES never execute during SSR.
 */

export const PBKDF2_ITERATIONS = 600_000;

const AES_KEY_BITS = 256;
const GCM_IV_BYTES = 12;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function assertBrowser(): void {
  if (typeof window === "undefined") {
    throw new Error(
      "Vault crypto must run in the browser. Do not call from Server Components or during SSR.",
    );
  }
}

/** Random salt for a new vault entry (store encoded with the row). */
export function randomSaltBytes(byteLength = 16): Uint8Array {
  assertBrowser();
  const salt = new Uint8Array(byteLength);
  crypto.getRandomValues(salt);
  return salt;
}

export function toBase64(bytes: Uint8Array): string {
  assertBrowser();
  return bytesToBase64(bytes);
}

export function fromBase64(b64: string): Uint8Array {
  assertBrowser();
  return base64ToBytes(b64);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

/** Copy into a fresh `ArrayBuffer` for `SubtleCrypto` `BufferSource` typing. */
function copyBytes(bytes: Uint8Array): BufferSource {
  const buf = new ArrayBuffer(bytes.length);
  const out = new Uint8Array(buf);
  out.set(bytes);
  return out;
}

/**
 * Derives an AES-256-GCM key from the master password using PBKDF2-SHA-256.
 * @param salt Random salt (store alongside ciphertext; typically 16+ bytes).
 */
export async function deriveKey(
  masterPassword: string,
  salt: BufferSource,
): Promise<CryptoKey> {
  assertBrowser();

  const passwordBytes = textEncoder.encode(masterPassword);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  passwordBytes.fill(0);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: AES_KEY_BITS },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Derive key for a row using the salt stored as base64 in the database. */
export async function deriveKeyWithSaltBase64(
  masterPassword: string,
  saltBase64: string,
): Promise<CryptoKey> {
  assertBrowser();
  return deriveKey(masterPassword, copyBytes(base64ToBytes(saltBase64)));
}

/** Derive key when encrypting a new row (fresh random salt bytes). */
export async function deriveKeyWithSaltBytes(
  masterPassword: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  assertBrowser();
  return deriveKey(masterPassword, copyBytes(salt));
}

export type EncryptedPayload = {
  /** Base64-encoded ciphertext (includes GCM auth tag). */
  encrypted: string;
  /** Base64-encoded 12-byte IV. */
  iv: string;
};

/**
 * Encrypts UTF-8 text with AES-256-GCM. Generates a fresh random IV per call.
 */
export async function encryptData(
  text: string,
  key: CryptoKey,
): Promise<EncryptedPayload> {
  assertBrowser();

  const iv = new Uint8Array(GCM_IV_BYTES);
  crypto.getRandomValues(iv);

  const plaintext = textEncoder.encode(text);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    plaintext,
  );

  return {
    encrypted: bytesToBase64(new Uint8Array(ciphertext)),
    iv: bytesToBase64(iv),
  };
}

/**
 * Decrypts a payload produced by {@link encryptData}.
 */
export async function decryptData(
  encryptedText: string,
  iv: string,
  key: CryptoKey,
): Promise<string> {
  assertBrowser();

  const ivBytes = base64ToBytes(iv);
  const cipherBytes = base64ToBytes(encryptedText);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: copyBytes(ivBytes) },
    key,
    copyBytes(cipherBytes),
  );

  return textDecoder.decode(plaintext);
}
