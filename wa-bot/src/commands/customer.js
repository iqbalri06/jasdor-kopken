/**
 * Customer commands — /cek, /saldo, /menu, /bantuan.
 */
import { supabase } from '../supabase.js';
import { sendText } from '../baileys.js';
import { config } from '../config.js';
import { rupiah, dateID } from '../utils/format.js';
import { fromJid, normalizePhone } from '../utils/phone.js';
import { child } from '../logger.js';

const log = child('cmd:customer');

const STATUS_LABEL = {
  pending: '⏳ Menunggu pembayaran',
  processing: '⚙️ Sedang diproses',
  ready: '🎉 Siap pickup',
  done: '✅ Selesai',
  cancelled: '❌ Dibatalkan',
};

function normalize(text) {
  return text.toLowerCase().trim();
}

function helpText() {
  return [
    `📋 *Daftar Perintah*`,
    ``,
    `• */cek [Order ID]* — cek status pesanan`,
    `   cth: /cek KK260523-A47G`,
    ``,
    `• */saldo* — cek saldo referral`,
    ``,
    `• */menu* — lihat menu & pesan`,
    ``,
    `• */bantuan* — tampilkan menu ini`,
    ``,
    `Kalau perlu bantuan langsung, hubungi admin di wa.me/${config.bot.adminWa}`,
  ].join('\n');
}

async function handleCek(jid, args) {
  const orderId = args[0]?.toUpperCase().trim();
  if (!orderId) {
    return sendText(fromJid(jid), 'Format: /cek [Order ID]\ncth: /cek KK260523-A47G');
  }

  try {
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (!order) {
      return sendText(
        fromJid(jid),
        `Order *${orderId}* tidak ditemukan. Periksa ID-nya ya.`
      );
    }

    const d = order.data || {};
    const lines = [
      `📦 *Status Pesanan*`,
      ``,
      `Order: *${order.id}*`,
      `Status: ${STATUS_LABEL[order.status] || order.status}`,
      `Total: ${rupiah(d.totalToPay || d.total)}`,
      `Outlet: ${d.store?.name || '-'}`,
      `Dibuat: ${dateID(order.created_at)}`,
    ];

    if (order.status === 'pending' && !d.proof_url) {
      lines.push('', `Lanjut bayar:`, `${config.bot.baseUrl}/payment/${order.id}`);
    }
    if (order.status === 'ready' && d.pickup_number) {
      lines.push('', `Nomor antrian: *${d.pickup_number}*`);
    }

    return sendText(fromJid(jid), lines.join('\n'));
  } catch (e) {
    log.error({ err: e.message }, '/cek failed');
    return sendText(fromJid(jid), 'Maaf, terjadi kesalahan. Coba lagi nanti.');
  }
}

async function handleSaldo(jid) {
  const phone = fromJid(jid);
  try {
    const { data: user } = await supabase
      .from('referral_users')
      .select('name, balance, referral_code, total_earned')
      .eq('phone', phone)
      .maybeSingle();

    if (!user) {
      return sendText(
        phone,
        [
          `Nomor ini belum terdaftar di program referral.`,
          ``,
          `Daftar dulu di:`,
          `${config.bot.baseUrl}/referral`,
        ].join('\n')
      );
    }

    return sendText(
      phone,
      [
        `🎁 *Saldo Referral*`,
        ``,
        `Nama: ${user.name || '-'}`,
        `Kode: *${user.referral_code}*`,
        `Saldo: *${rupiah(user.balance)}*`,
        `Total earned: ${rupiah(user.total_earned)}`,
        ``,
        `Tarik saldo: ${config.bot.baseUrl}/withdraw`,
        `Bagikan kode: ${config.bot.baseUrl}/?ref=${user.referral_code}`,
      ].join('\n')
    );
  } catch (e) {
    log.error({ err: e.message }, '/saldo failed');
    return sendText(phone, 'Maaf, terjadi kesalahan. Coba lagi nanti.');
  }
}

async function handleMenu(jid) {
  return sendText(
    fromJid(jid),
    [
      `☕ *Jasa Order Kopi Kenangan*`,
      ``,
      `Pesan kopi favoritmu dengan diskon 50% (maks Rp 35.000).`,
      ``,
      `Buka link berikut untuk lihat menu & pesan:`,
      config.bot.baseUrl,
    ].join('\n')
  );
}

/**
 * Main customer command handler.
 * Returns true kalau pesan adalah command yang dikenali.
 */
export async function handleCustomerMessage({ from, text }) {
  const t = normalize(text);
  const parts = t.split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  if (cmd === '/cek' || cmd === 'cek') {
    await handleCek(from, args);
    return true;
  }

  if (cmd === '/saldo' || cmd === 'saldo') {
    await handleSaldo(from);
    return true;
  }

  if (cmd === '/menu' || cmd === 'menu') {
    await handleMenu(from);
    return true;
  }

  if (cmd === '/bantuan' || cmd === 'bantuan' || cmd === '/help' || cmd === 'help') {
    await sendText(fromJid(from), helpText());
    return true;
  }

  return false;
}
