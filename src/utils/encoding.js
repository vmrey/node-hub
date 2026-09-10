/* src/utils/encoding.js */
// Common encoding/decoding helpers used across the project

/**
 * Encode a UTF-8 string to a URL‑safe Base64 string.
 */
export function safeBase64Encode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decode a Base64 (or URL‑safe Base64) string back to UTF‑8.
 */
export function safeBase64Decode(str) {
  if (!str || typeof str !== 'string') return '';
  try {
    // Remove whitespace and convert URL‑safe characters
    let clean = str.trim().replace(/\s+/g, '');
    clean = clean.replace(/-/g, '+').replace(/_/g, '/');
    // Pad to multiple of 4
    while (clean.length % 4) clean += '=';
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

/**
 * Safe encodeURIComponent wrapper that never throws.
 */
export function safeEncodeURIComponent(str) {
  if (!str || typeof str !== 'string') return '';
  try {
    return encodeURIComponent(str);
  } catch {
    return str;
  }
}

/**
 * Safe decodeURIComponent wrapper that never throws.
 */
export function safeDecodeURIComponent(str) {
  if (!str || typeof str !== 'string') return '';
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}
