/**
 * Admin commands — hanya nomor di ADMIN_PHONES yang bisa pakai.
 */
import { supabase } from '../supabase.js';
import { sendText } from '../baileys.js';
import { config } from '../config.js';
import { fromJid, normalizePhone } from '../utils/phone.js';
import { child } from '../logger.js';

const log = child('cmd:admin');

function isAdmin(jid) {
  const phone = normalizePhone(fromJid(jid));
  return config.bot.adminPhones.includes(phone);
}

async function reply(jid, text) {
  return sendText(fromJid(jid), text);
}

async function handleProses(jid, args) {
  const orderId = args[0]?.toUpperCase().trim();
  if (!orderId) return reply(jid, 'Format: /proses [Order ID]');

  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) return reply(jid, `Order ${orderId} tidak ditemukan.`);
  if (order.status === 'processing') {
    return reply(jid, `Order ${orderId} sudah dalam status processing.`);
  }

  await supabase.from('orders').update({ status: 'processing' }).eq('id', orderId);
  log.info({ orderId, by: fromJid(jid) }, 'admin set processing');
  return reply(jid, `✅ Order *${orderId}* → processing.\nNotif customer akan dikirim otomatis.`);
}

async function handleSiap(jid, args) {
  const orderId = args[0]?.toUpperCase().trim();
  const pickupNumber = args[1]?.trim();

  if (!orderId || !pickupNumber) {
    return reply(jid, 'Format: /siap [Order ID] [Nomor Antrian]\ncth: /siap KK260523-A47G 015');
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, data')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) return reply(jid, `Order ${orderId} tidak ditemukan.`);

  const newData = { ...(order.data || {}), pickup_number: pickupNumber };
  await supabase
    .from('orders')
    .update({ status: 'ready', data: newData })
    .eq('id', orderId);

  log.info({ orderId, pickupNumber, by: fromJid(jid) }, 'admin set ready');
  return reply(jid, `🎉 Order *${orderId}* → siap pickup (#${pickupNumber}).\nNotif dikirim ke customer.`);
}

async function handleSelesai(jid, args) {
  const orderId = args[0]?.toUpperCase().trim();
  if (!orderId) return reply(jid, 'Format: /selesai [Order ID]');

  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) return reply(jid, `Order ${orderId} tidak ditemukan.`);

  await supabase.from('orders').update({ status: 'done' }).eq('id', orderId);
  log.info({ orderId, by: fromJid(jid) }, 'admin set done');
  return reply(jid, `✅ Order *${orderId}* → selesai.`);
}

async function handleBatal(jid, args) {
  const orderId = args[0]?.toUpperCase().trim();
  const reason = args.slice(1).join(' ').trim();

  if (!orderId) return reply(jid, 'Format: /batal [Order ID] [alasan]');

  const { data: order } = await supabase
    .from('orders')
    .select('id, data')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) return reply(jid, `Order ${orderId} tidak ditemukan.`);

  const newData = { ...(order.data || {}) };
  if (reason) newData.cancel_reason = reason;

  await supabase
    .from('orders')
    .update({ status: 'cancelled', data: newData })
    .eq('id', orderId);

  log.info({ orderId, reason, by: fromJid(jid) }, 'admin cancelled');
  return reply(jid, `❌ Order *${orderId}* → dibatalkan.${reason ? `\nAlasan: ${reason}` : ''}`);
}

async function handleStok(jid, args) {
  const count = parseInt(args[0], 10);
  if (!Number.isFinite(count) || count < 0) {
    return reply(jid, 'Format: /stok [angka]\ncth: /stok 10');
  }

  const { data: existing } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'account_stock')
    .maybeSingle();

  const current = existing?.value || {};
  await supabase
    .from('settings')
    .upsert(
      {
        key: 'account_stock',
        value: { ...current, count },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

  log.info({ count, by: fromJid(jid) }, 'admin set stock');
  return reply(jid, `📦 Stok akun → *${count}*`);
}

async function handleService(jid, open) {
  const { data: existing } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'service_open')
    .maybeSingle();

  const current = existing?.value || {};
  await supabase
    .from('settings')
    .upsert(
      {
        key: 'service_open',
        value: { ...current, open },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

  log.info({ open, by: fromJid(jid) }, 'admin toggled service');
  return reply(jid, open ? '🟢 Layanan dibuka.' : '🔴 Layanan ditutup.');
}

function adminHelpText() {
  return [
    `🛡️ *Admin Commands*`,
    ``,
    `• /proses [Order ID]`,
    `• /siap [Order ID] [Nomor]`,
    `• /selesai [Order ID]`,
    `• /batal [Order ID] [alasan]`,
    `• /stok [angka]`,
    `• /buka — buka layanan`,
    `• /tutup — tutup layanan`,
  ].join('\n');
}

/**
 * Main admin command handler.
 * Return true kalau ditangani.
 */
export async function handleAdminMessage({ from, text }) {
  if (!isAdmin(from)) return false;

  const t = text.toLowerCase().trim();
  const parts = t.split(/\s+/);
  const cmd = parts[0];
  const args = text.split(/\s+/).slice(1); // preserve original case for IDs

  switch (cmd) {
    case '/proses':
      await handleProses(from, args);
      return true;
    case '/siap':
      await handleSiap(from, args);
      return true;
    case '/selesai':
      await handleSelesai(from, args);
      return true;
    case '/batal':
      await handleBatal(from, args);
      return true;
    case '/stok':
      await handleStok(from, args);
      return true;
    case '/buka':
      await handleService(from, true);
      return true;
    case '/tutup':
      await handleService(from, false);
      return true;
    case '/admin':
    case '/adminhelp':
      await reply(from, adminHelpText());
      return true;
    default:
      return false;
  }
}
