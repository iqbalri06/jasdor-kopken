/**
 * Pesan templates E1..E13.
 * Style: clean, ringkas, konsisten. Pakai *bold* WA secara hemat.
 */
import { rupiah } from '../utils/format.js';
import { config } from '../config.js';

const baseUrl = () => config.bot.baseUrl;
const adminWa = () => config.bot.adminWa;
const botName = () => config.bot.name;

// Footer signature konsisten untuk semua pesan customer
function footer() {
  return `\n_— ${botName()}_`;
}

function joinClean(lines) {
  return lines.filter((l) => l !== null && l !== undefined).join('\n');
}

/**
 * E1 — Notif order baru ke admin
 */
export function E1_orderNewToAdmin(order) {
  const d = order.data || order;
  const itemCount = (d.items || []).reduce((s, i) => s + (i.qty || 0), 0);
  const orderId = order.id || d.orderId;

  return joinClean([
    `🆕 *Pesanan Baru*`,
    `━━━━━━━━━━━━━━━━━`,
    `🧾 ID: *${orderId}*`,
    `👤 Nama: ${d.customer?.name || '-'}`,
    `📱 Nomor: ${d.customer?.phone || '-'}`,
    `🏪 Outlet: ${d.store?.name || '-'}`,
    `🛒 Item: ${itemCount} pcs`,
    `💰 Total: *${rupiah(d.totalToPay || d.total)}*`,
    ``,
    `⏳ Menunggu pembayaran`,
    ``,
    `🔗 Detail:`,
    `${baseUrl()}/order/${orderId}`,
  ]);
}

/**
 * E2 — Konfirmasi order ke customer
 */
export function E2_orderNewToCustomer(order) {
  const d = order.data || order;
  const orderId = order.id || d.orderId;

  return joinClean([
    `Halo *${d.customer?.name || 'Kak'}* ☕`,
    ``,
    `Pesananmu sudah masuk ke sistem kami.`,
    ``,
    `🧾 Order: *${orderId}*`,
    `🏪 Outlet: ${d.store?.name || '-'}`,
    `💰 Total: *${rupiah(d.totalToPay || d.total)}*`,
    ``,
    `*Lanjut bayar di sini:*`,
    `${baseUrl()}/payment/${orderId}`,
    ``,
    `Bayar pakai QRIS dengan e-wallet atau m-banking apa saja, lalu upload bukti di halaman pembayaran.`,
    footer(),
  ]);
}

/**
 * E3 — Bukti bayar masuk ke admin
 */
export function E3_proofUploaded(order) {
  const d = order.data || order;
  const orderId = order.id || d.orderId;

  return joinClean([
    `✅ *Bukti Bayar Masuk*`,
    `━━━━━━━━━━━━━━━━━`,
    `🧾 ID: *${orderId}*`,
    `👤 ${d.customer?.name || '-'} (${d.customer?.phone || '-'})`,
    `💰 Total: *${rupiah(d.totalToPay || d.total)}*`,
    ``,
    `Verifikasi & proses:`,
    `${baseUrl()}/admin/orders`,
  ]);
}

/**
 * E4 — Order diproses ke customer
 */
export function E4_orderProcessing(order) {
  const d = order.data || order;
  const orderId = order.id || d.orderId;

  return joinClean([
    `Halo *${d.customer?.name || 'Kak'}* ☕`,
    ``,
    `Pembayaranmu sudah kami terima.`,
    `Pesanan *${orderId}* sedang diproses.`,
    ``,
    `Tunggu sebentar ya, kami akan kirim notifikasi lagi kalau pesanan sudah siap diambil.`,
    footer(),
  ]);
}

/**
 * E5 — Pesanan siap pickup
 */
export function E5_orderReady(order) {
  const d = order.data || order;
  const orderId = order.id || d.orderId;

  return joinClean([
    `🎉 Pesananmu Sudah Siap!`,
    `━━━━━━━━━━━━━━━━━`,
    `Halo *${d.customer?.name || 'Kak'}*, pesanan kopimu sudah siap diambil di outlet.`,
    ``,
    `🧾 Order: *${orderId}*`,
    `🔢 Nomor Antrian: *${d.pickup_number || '-'}*`,
    `🏪 Outlet: ${d.store?.name || '-'}`,
    d.store?.address ? `📍 ${d.store.address}` : null,
    ``,
    `Tunjukkan nomor antrian *${d.pickup_number || '-'}* ke barista saat pickup.`,
    ``,
    `🔗 Detail:`,
    `${baseUrl()}/order/confirmed/${orderId}`,
    footer(),
  ]);
}

/**
 * E6 — Pesanan selesai
 */
export function E6_orderDone(order, refReward = 2000) {
  const d = order.data || order;
  const orderId = order.id || d.orderId;

  return joinClean([
    `Terima kasih *${d.customer?.name || 'Kak'}* ☕`,
    ``,
    `Pesanan *${orderId}* sudah selesai.`,
    `Semoga kopinya enak dan harimu lebih semangat ✨`,
    ``,
    `Mau pesan lagi?`,
    `${baseUrl()}`,
    ``,
    `━━━━━━━━━━━━━━━━━`,
    `🎁 *Ajak Teman, Dapat Saldo*`,
    `Bagikan kode referralmu, dan dapatkan ${rupiah(refReward)} setiap teman menyelesaikan pesanan.`,
    `${baseUrl()}/referral`,
    footer(),
  ]);
}

/**
 * E7 — Pesanan dibatalkan
 */
export function E7_orderCancelled(order, reason = '') {
  const d = order.data || order;
  const orderId = order.id || d.orderId;

  return joinClean([
    `Halo *${d.customer?.name || 'Kak'}*,`,
    ``,
    `Mohon maaf, pesanan *${orderId}* dibatalkan.`,
    reason ? `📝 Alasan: ${reason}` : null,
    ``,
    `Kalau kamu sudah bayar, saldo akan kami refund. Hubungi admin untuk konfirmasi:`,
    `wa.me/${adminWa()}`,
    footer(),
  ]);
}

/**
 * E8 — Reminder belum bayar
 */
export function E8_paymentReminder(order) {
  const d = order.data || order;
  const orderId = order.id || d.orderId;

  return joinClean([
    `Hai *${d.customer?.name || 'Kak'}*, masih ingat pesanan kopinya? ☕`,
    ``,
    `Order *${orderId}* (${rupiah(d.totalToPay || d.total)}) masih menunggu pembayaran.`,
    ``,
    `*Lanjut bayar:*`,
    `${baseUrl()}/payment/${orderId}`,
    ``,
    `⚠️ Pesanan otomatis dibatalkan kalau belum bayar dalam ${config.reminder.timeoutMinutes} menit.`,
    footer(),
  ]);
}

/**
 * E9 — Saldo referral masuk
 */
export function E9_referralCredited({
  referrer_name,
  referee_name,
  reward,
  balance,
}) {
  return joinClean([
    `🎁 *Saldo Masuk!*`,
    `━━━━━━━━━━━━━━━━━`,
    `Halo *${referrer_name || 'Kak'}*, selamat!`,
    ``,
    `Temanmu *${referee_name || 'Anonim'}* baru saja menyelesaikan pesanan pakai kode referralmu.`,
    ``,
    `💰 Reward: *${rupiah(reward)}*`,
    `💳 Saldo Total: *${rupiah(balance)}*`,
    ``,
    `Saldo bisa dipakai untuk potong order, atau tarik ke e-wallet:`,
    `${baseUrl()}/withdraw`,
    footer(),
  ]);
}

const METHOD_LABEL = {
  dana: 'DANA',
  shopeepay: 'ShopeePay',
  seabank: 'SeaBank',
};

/**
 * E10 — Permintaan withdraw ke admin
 */
export function E10_withdrawalNew(wd, customerName = '') {
  const method = METHOD_LABEL[wd.method] || wd.method;

  return joinClean([
    `💸 *Permintaan Penarikan*`,
    `━━━━━━━━━━━━━━━━━`,
    `👤 ${customerName || '-'}`,
    `📱 ${wd.phone}`,
    `💰 Jumlah: *${rupiah(wd.amount)}*`,
    `🏦 Metode: ${method}`,
    `🔢 Akun: ${wd.account_number}`,
    `   a.n ${wd.account_name}`,
    ``,
    `Proses di:`,
    `${baseUrl()}/admin/settings`,
  ]);
}

/**
 * E11 — Withdraw diproses
 */
export function E11_withdrawalProcessing(wd, customerName = '') {
  const method = METHOD_LABEL[wd.method] || wd.method;

  return joinClean([
    `Halo *${customerName || 'Kak'}*,`,
    ``,
    `Permintaan tarik saldo *${rupiah(wd.amount)}* ke ${method} sedang kami proses.`,
    ``,
    `🕒 Saldo akan masuk dalam 1×24 jam.`,
    footer(),
  ]);
}

/**
 * E12 — Withdraw sukses
 */
export function E12_withdrawalCompleted(wd, customerName = '', remainingBalance = 0) {
  const method = METHOD_LABEL[wd.method] || wd.method;

  return joinClean([
    `✅ *Penarikan Berhasil!*`,
    `━━━━━━━━━━━━━━━━━`,
    `Halo *${customerName || 'Kak'}*,`,
    ``,
    `Tarik saldo *${rupiah(wd.amount)}* ke ${method} berhasil.`,
    `Cek saldo di akun ${method} kamu ya.`,
    ``,
    `💳 Saldo tersisa: *${rupiah(remainingBalance)}*`,
    footer(),
  ]);
}

/**
 * E13 — Withdraw ditolak
 */
export function E13_withdrawalRejected(wd, customerName = '') {
  return joinClean([
    `Halo *${customerName || 'Kak'}*,`,
    ``,
    `Mohon maaf, permintaan tarik saldo *${rupiah(wd.amount)}* ditolak.`,
    wd.notes ? `📝 Alasan: ${wd.notes}` : null,
    ``,
    `Saldo sudah dikembalikan ke akunmu.`,
    `Hubungi admin kalau ada pertanyaan:`,
    `wa.me/${adminWa()}`,
    footer(),
  ]);
}
