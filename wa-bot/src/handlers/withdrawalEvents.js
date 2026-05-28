/**
 * Handler untuk event di tabel `withdrawals`.
 */
import { supabase } from '../supabase.js';
import { sendNotification, sendToAdmins } from '../sender.js';
import {
  E10_withdrawalNew,
  E11_withdrawalProcessing,
  E12_withdrawalCompleted,
  E13_withdrawalRejected,
} from '../templates/messages.js';
import { child } from '../logger.js';

const log = child('withdrawal');

async function getCustomerName(phone) {
  try {
    const { data } = await supabase
      .from('referral_users')
      .select('name, balance')
      .eq('phone', phone)
      .maybeSingle();
    return { name: data?.name || '', balance: data?.balance || 0 };
  } catch (_) {
    return { name: '', balance: 0 };
  }
}

/**
 * Withdrawal baru → notif admin (E10).
 */
export async function onWithdrawalInsert(wd) {
  const { name } = await getCustomerName(wd.phone);

  await sendToAdmins({
    eventHash: `withdraw:${wd.id}:new`,
    templateId: 'E10',
    text: E10_withdrawalNew(wd, name),
    payload: { withdrawal_id: wd.id, amount: wd.amount },
  });

  log.info({ withdrawal_id: wd.id }, 'withdrawal new notified to admin');
}

/**
 * Withdrawal status berubah.
 */
export async function onWithdrawalUpdate(newRow, oldRow) {
  if (oldRow?.status === newRow.status) return;

  const { name, balance } = await getCustomerName(newRow.phone);

  if (newRow.status === 'processing') {
    await sendNotification({
      eventHash: `withdraw:${newRow.id}:processing`,
      recipient: newRow.phone,
      templateId: 'E11',
      text: E11_withdrawalProcessing(newRow, name),
      payload: { withdrawal_id: newRow.id },
    });
  } else if (newRow.status === 'completed') {
    await sendNotification({
      eventHash: `withdraw:${newRow.id}:completed`,
      recipient: newRow.phone,
      templateId: 'E12',
      text: E12_withdrawalCompleted(newRow, name, balance),
      payload: { withdrawal_id: newRow.id },
    });
  } else if (newRow.status === 'rejected') {
    await sendNotification({
      eventHash: `withdraw:${newRow.id}:rejected`,
      recipient: newRow.phone,
      templateId: 'E13',
      text: E13_withdrawalRejected(newRow, name),
      payload: { withdrawal_id: newRow.id },
    });
  }

  log.info(
    { withdrawal_id: newRow.id, status: newRow.status },
    'withdrawal status notified'
  );
}
