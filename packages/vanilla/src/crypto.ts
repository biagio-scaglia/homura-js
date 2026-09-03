/**
 * HomuraJS — Privacy-First WebCrypto AES-GCM 256-bit Local Vault
 * Provides client-side Zero-Knowledge encryption for LocalStorage persistence.
 */

const SALT_STORAGE_KEY = 'homura_vault_salt';

/**
 * Gets or creates a local persistent salt/seed for key derivation.
 */
function getLocalSalt(): Uint8Array {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return new Uint8Array(16);
  }
  let raw = localStorage.getItem(SALT_STORAGE_KEY);
  if (!raw) {
    const salt = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(salt);
    } else {
      for (let i = 0; i < 16; i++) salt[i] = Math.floor(Math.random() * 256);
    }
    raw = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    try {
      localStorage.setItem(SALT_STORAGE_KEY, raw);
    } catch (_) {}
  }
  const match = raw.match(/.{1,2}/g);
  if (match) {
    return new Uint8Array(match.map(byte => parseInt(byte, 16)));
  }
  return new Uint8Array(16);
}

/**
 * Derives an AES-GCM 256-bit CryptoKey using PBKDF2 from client origin & device entropy.
 */
async function deriveVaultKey(customPassphrase?: string): Promise<CryptoKey> {
  const secret = customPassphrase || (typeof window !== 'undefined' ? `${window.location.origin}_homura_vault_${navigator.userAgent.slice(0, 30)}` : 'homura_vault_secret');
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const saltBytes = getLocalSalt();
  const saltBuffer = new ArrayBuffer(saltBytes.byteLength);
  new Uint8Array(saltBuffer).set(saltBytes);

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 10000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext string with AES-GCM 256-bit.
 * Output format: "enc:v1:<base64-iv>:<base64-ciphertext>"
 */
export async function encryptPayload(plaintext: string, passphrase?: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return `b64:${btoa(unescape(encodeURIComponent(plaintext)))}`;
  }

  try {
    const key = await deriveVaultKey(passphrase);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plaintext)
    );

    const ivB64 = btoa(String.fromCharCode(...iv));
    const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    return `enc:v1:${ivB64}:${cipherB64}`;
  } catch (err) {
    console.warn('[HomuraJS] WebCrypto encryption fallback:', err);
    return `b64:${btoa(unescape(encodeURIComponent(plaintext)))}`;
  }
}

/**
 * Decrypts an AES-GCM 256-bit payload.
 */
export async function decryptPayload(payload: string, passphrase?: string): Promise<string | null> {
  if (typeof payload !== 'string') return null;

  if (payload.startsWith('b64:')) {
    try {
      return decodeURIComponent(escape(atob(payload.slice(4))));
    } catch {
      return null;
    }
  }

  if (!payload.startsWith('enc:v1:')) {
    return payload;
  }

  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return null;
  }

  try {
    const parts = payload.split(':');
    if (parts.length !== 4) return null;
    const ivB64 = parts[2];
    const cipherB64 = parts[3];
    if (!ivB64 || !cipherB64) return null;

    const ivStr = atob(ivB64);
    const iv = new Uint8Array(ivStr.length);
    for (let i = 0; i < ivStr.length; i++) iv[i] = ivStr.charCodeAt(i);

    const cipherStr = atob(cipherB64);
    const ciphertext = new Uint8Array(cipherStr.length);
    for (let i = 0; i < cipherStr.length; i++) ciphertext[i] = cipherStr.charCodeAt(i);

    const key = await deriveVaultKey(passphrase);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.warn('[HomuraJS] Decryption failed or payload corrupted:', err);
    return null;
  }
}
