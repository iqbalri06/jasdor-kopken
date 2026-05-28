/**
 * Phone number utilities.
 * Konversi 0xxx ↔ 62xxx ↔ JID Baileys (xxx@s.whatsapp.net).
 */

export function normalizePhone(input) {
  if (!input) return '';
  let p = String(input).replace(/[^0-9]/g, '');
  if (!p) return '';
  if (p.startsWith('62')) return p;
  if (p.startsWith('0')) return '62' + p.slice(1);
  if (p.startsWith('8')) return '62' + p;
  return p;
}

export function isValidPhone(input) {
  const p = normalizePhone(input);
  return /^62[0-9]{8,13}$/.test(p);
}

export function formatPhone(input) {
  const p = normalizePhone(input);
  if (!p) return '';
  const local = '0' + p.slice(2);
  return local.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
}

/**
 * Convert nomor WA ke JID format Baileys.
 * 6281234567890 → 6281234567890@s.whatsapp.net
 */
export function toJid(phone) {
  const p = normalizePhone(phone);
  if (!p) return null;
  return `${p}@s.whatsapp.net`;
}

/**
 * Parse JID balik ke nomor.
 * 6281234567890@s.whatsapp.net → 6281234567890
 */
export function fromJid(jid) {
  if (!jid) return '';
  return jid.split('@')[0].split(':')[0];
}
