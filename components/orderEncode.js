/**
 * Encode/decode order data ke string yang aman untuk URL.
 * Format: base64url dari JSON.
 */

function toBase64Url(str) {
  if (typeof window === 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(b64) {
  const pad = b64.length % 4;
  const padded = b64 + '='.repeat(pad ? 4 - pad : 0);
  const normal = padded.replace(/-/g, '+').replace(/_/g, '/');
  if (typeof window === 'undefined') {
    return Buffer.from(normal, 'base64').toString('utf-8');
  }
  const bin = atob(normal);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeOrder(order) {
  return toBase64Url(JSON.stringify(order));
}

export function decodeOrder(token) {
  try {
    return JSON.parse(fromBase64Url(token));
  } catch (e) {
    return null;
  }
}

export function generateOrderId() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KK${y}${m}${day}-${rand}`;
}
