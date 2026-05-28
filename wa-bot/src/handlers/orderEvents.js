/**
 * Handler untuk event-event di tabel `orders`.
 */
import { sendNotification, sendToAdmins } from '../sender.js';
import {
  E1_orderNewToAdmin,
  E2_orderNewToCustomer,
  E3_proofUploaded,
  E4_orderProcessing,
  E5_orderReady,
  E6_orderDone,
  E7_orderCancelled,
} from '../templates/messages.js';
import { child } from '../logger.js';
import { supabase } from '../supabase.js';

const log = child('order');

async function getReferralReward() {
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'referral_config')
      .maybeSingle();
    return data?.value?.reward ?? 2000;
  } catch (_) {
    return 2000;
  }
}

/**
 * Order baru dibuat (INSERT).
 * Kirim E1 ke admin, E2 ke customer.
 */
export async function onOrderInsert(order) {
  const d = order.data || {};
  const customerPhone = d.customer?.phone;

  // E1 → Admin
  await sendToAdmins({
    eventHash: `order:${order.id}:created`,
    templateId: 'E1',
    text: E1_orderNewToAdmin(order),
    payload: { order_id: order.id, status: order.status },
  });

  // E2 → Customer
  if (customerPhone) {
    await sendNotification({
      eventHash: `order:${order.id}:welcome`,
      recipient: customerPhone,
      templateId: 'E2',
      text: E2_orderNewToCustomer(order),
      payload: { order_id: order.id },
    });
  }

  log.info({ order_id: order.id }, 'order insert handled');
}

/**
 * Order updated (UPDATE).
 * Cek perubahan status atau munculnya proof_url, lalu kirim notif yang sesuai.
 */
export async function onOrderUpdate(newOrder, oldOrder) {
  const newD = newOrder.data || {};
  const oldD = oldOrder?.data || {};
  const customerPhone = newD.customer?.phone;

  // === Bukti bayar baru di-upload ===
  if (newD.proof_url && !oldD.proof_url) {
    await sendToAdmins({
      eventHash: `order:${newOrder.id}:proof`,
      templateId: 'E3',
      text: E3_proofUploaded(newOrder),
      payload: { order_id: newOrder.id },
    });
    log.info({ order_id: newOrder.id }, 'proof uploaded notified');
  }

  // === Status berubah ===
  if (oldOrder && newOrder.status !== oldOrder.status) {
    log.info(
      { order_id: newOrder.id, from: oldOrder.status, to: newOrder.status },
      'status changed'
    );

    if (newOrder.status === 'processing' && customerPhone) {
      await sendNotification({
        eventHash: `order:${newOrder.id}:processing`,
        recipient: customerPhone,
        templateId: 'E4',
        text: E4_orderProcessing(newOrder),
        payload: { order_id: newOrder.id, status: 'processing' },
      });
    } else if (newOrder.status === 'ready' && customerPhone) {
      // Safety: kalau pickup_number belum ada, skip — tunggu update berikutnya
      // (mencegah pesan terkirim tanpa nomor antrian)
      if (!newD.pickup_number) {
        log.info(
          { order_id: newOrder.id },
          'skip ready notif: pickup_number not set yet'
        );
      } else {
        await sendNotification({
          eventHash: `order:${newOrder.id}:ready`,
          recipient: customerPhone,
          templateId: 'E5',
          text: E5_orderReady(newOrder),
          payload: {
            order_id: newOrder.id,
            status: 'ready',
            pickup_number: newD.pickup_number,
          },
        });
      }
    } else if (newOrder.status === 'done' && customerPhone) {
      const reward = await getReferralReward();
      await sendNotification({
        eventHash: `order:${newOrder.id}:done`,
        recipient: customerPhone,
        templateId: 'E6',
        text: E6_orderDone(newOrder, reward),
        payload: { order_id: newOrder.id, status: 'done' },
      });
    } else if (newOrder.status === 'cancelled' && customerPhone) {
      await sendNotification({
        eventHash: `order:${newOrder.id}:cancelled`,
        recipient: customerPhone,
        templateId: 'E7',
        text: E7_orderCancelled(newOrder, newD.cancel_reason || ''),
        payload: { order_id: newOrder.id, status: 'cancelled' },
      });
    }
  }

  // === Status sudah ready dari sebelumnya, tapi pickup_number baru ditambah ===
  // (kasus kalau update terpisah: status dulu, lalu pickup_number)
  // Idempotency hash sama (`order:xxx:ready`), jadi aman walau ke-trigger lagi.
  if (
    oldOrder &&
    newOrder.status === 'ready' &&
    oldOrder.status === 'ready' &&
    !oldD.pickup_number &&
    newD.pickup_number &&
    customerPhone
  ) {
    await sendNotification({
      eventHash: `order:${newOrder.id}:ready`,
      recipient: customerPhone,
      templateId: 'E5',
      text: E5_orderReady(newOrder),
      payload: {
        order_id: newOrder.id,
        status: 'ready',
        pickup_number: newD.pickup_number,
      },
    });
  }
}
