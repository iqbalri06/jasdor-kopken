/**
 * Cron jobs:
 * 1. Reminder bayar — order pending sudah X menit tapi belum upload bukti
 * 2. Auto-cancel — order pending sudah Y menit, batalkan otomatis
 *
 * Jalan tiap 5 menit.
 */
import cron from 'node-cron';
import { supabase } from './supabase.js';
import { sendNotification } from './sender.js';
import { E8_paymentReminder } from './templates/messages.js';
import { config } from './config.js';
import { child } from './logger.js';

const log = child('cron');

async function getTimeoutMinutes() {
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'payment_timeout')
      .maybeSingle();
    const v = parseInt(data?.value?.minutes, 10);
    if (Number.isFinite(v) && v > 0) return v;
  } catch (_) {}
  return config.reminder.timeoutMinutes;
}

/**
 * Job 1: Reminder bayar (E8) — kirim sekali ke order pending yang sudah X menit
 */
async function runReminderJob() {
  try {
    const reminderMs = config.reminder.paymentMinutes * 60_000;
    const cutoffMin = new Date(Date.now() - reminderMs).toISOString();
    const cutoffMax = new Date(Date.now() - reminderMs - 5 * 60_000).toISOString();

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .gte('created_at', cutoffMax)
      .lte('created_at', cutoffMin);

    if (error) {
      log.error({ err: error.message }, 'reminder query failed');
      return;
    }

    if (!orders || orders.length === 0) {
      log.debug('no orders to remind');
      return;
    }

    for (const order of orders) {
      const d = order.data || {};
      if (d.proof_url) continue; // skip yang sudah upload
      const customerPhone = d.customer?.phone;
      if (!customerPhone) continue;

      await sendNotification({
        eventHash: `order:${order.id}:reminder`,
        recipient: customerPhone,
        templateId: 'E8',
        text: E8_paymentReminder(order),
        payload: { order_id: order.id },
      });
    }

    log.info({ count: orders.length }, 'reminder job completed');
  } catch (e) {
    log.error({ err: e.message }, 'reminder job failed');
  }
}

/**
 * Job 2: Auto-cancel order pending yang sudah lewat timeout
 */
async function runAutoCancelJob() {
  try {
    const timeoutMin = await getTimeoutMinutes();
    const cutoff = new Date(Date.now() - timeoutMin * 60_000).toISOString();

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', cutoff);

    if (error) {
      log.error({ err: error.message }, 'auto-cancel query failed');
      return;
    }

    if (!orders || orders.length === 0) {
      log.debug('no orders to auto-cancel');
      return;
    }

    let cancelled = 0;
    for (const order of orders) {
      const d = order.data || {};

      // Skip kalau sudah ada bukti bayar (admin yang verify)
      if (d.proof_url) continue;

      const newData = {
        ...d,
        cancel_reason: `Pembayaran tidak diterima dalam ${timeoutMin} menit`,
        auto_cancelled_at: new Date().toISOString(),
      };

      const { error: updErr } = await supabase
        .from('orders')
        .update({ status: 'cancelled', data: newData })
        .eq('id', order.id)
        .eq('status', 'pending'); // guard race condition

      if (updErr) {
        log.error({ id: order.id, err: updErr.message }, 'auto-cancel update failed');
        continue;
      }

      // Cleanup: kembalikan stok, batalkan referral, refund saldo
      try {
        // Lazy import — referral logic ada di Next.js project, bot tidak punya akses langsung.
        // Kita panggil function lokal yang ada (sederhana cukup increment stok di sini).
        await rollbackOrderState(order.id, d);
      } catch (e) {
        log.error({ id: order.id, err: e.message }, 'rollback failed');
      }

      cancelled++;
    }

    log.info({ cancelled, total: orders.length, timeoutMin }, 'auto-cancel completed');
  } catch (e) {
    log.error({ err: e.message }, 'auto-cancel job failed');
  }
}

/**
 * Rollback state setelah auto-cancel:
 * - Increment stok akun
 * - Cancel referral (kalau ada)
 * - Refund balance ke user (kalau pakai saldo)
 */
async function rollbackOrderState(orderId, orderData) {
  // 1. Increment stok
  try {
    const { data: stockRow } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'account_stock')
      .maybeSingle();
    if (stockRow?.value) {
      const cur = stockRow.value;
      if (cur.auto_manage !== false) {
        await supabase
          .from('settings')
          .update({
            value: { ...cur, count: (cur.count || 0) + 1 },
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'account_stock');
      }
    }
  } catch (_) {}

  // 2. Cancel referral
  try {
    const { data: ref } = await supabase
      .from('referrals')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (ref && ref.status !== 'cancelled') {
      if (ref.status === 'credited') {
        const { data: user } = await supabase
          .from('referral_users')
          .select('balance, total_earned')
          .eq('phone', ref.referrer_phone)
          .maybeSingle();
        if (user) {
          await supabase
            .from('referral_users')
            .update({
              balance: Math.max(0, user.balance - ref.reward),
              total_earned: Math.max(0, user.total_earned - ref.reward),
              updated_at: new Date().toISOString(),
            })
            .eq('phone', ref.referrer_phone);
        }
      }
      await supabase
        .from('referrals')
        .update({ status: 'cancelled' })
        .eq('id', ref.id);
    }
  } catch (_) {}

  // 3. Refund balance kalau pakai saldo
  try {
    const used = Math.max(0, Math.floor(Number(orderData.balanceUsed) || 0));
    if (used > 0 && orderData.customer?.phone) {
      const phone = String(orderData.customer.phone).replace(/[^0-9]/g, '');
      const norm = phone.startsWith('62')
        ? phone
        : phone.startsWith('0')
        ? '62' + phone.slice(1)
        : phone;

      const { data: user } = await supabase
        .from('referral_users')
        .select('balance')
        .eq('phone', norm)
        .maybeSingle();
      if (user) {
        await supabase
          .from('referral_users')
          .update({
            balance: user.balance + used,
            updated_at: new Date().toISOString(),
          })
          .eq('phone', norm);
      }
    }
  } catch (_) {}
}

export function startReminders() {
  // Reminder & auto-cancel jalan setiap 5 menit
  cron.schedule('*/5 * * * *', async () => {
    await runReminderJob();
    await runAutoCancelJob();
  });
  log.info('cron scheduled: reminder + auto-cancel every 5 minutes');
}
