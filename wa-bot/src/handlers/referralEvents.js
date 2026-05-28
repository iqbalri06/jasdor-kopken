/**
 * Handler untuk event di tabel `referrals`.
 * Trigger: status berubah pending → credited.
 */
import { supabase } from '../supabase.js';
import { sendNotification } from '../sender.js';
import { E9_referralCredited } from '../templates/messages.js';
import { child } from '../logger.js';

const log = child('referral');

export async function onReferralUpdate(newRow, oldRow) {
  // Trigger hanya saat transition pending → credited
  if (oldRow?.status === 'credited') return;
  if (newRow.status !== 'credited') return;

  const referrerPhone = newRow.referrer_phone;
  if (!referrerPhone) return;

  // Get referrer info untuk nama & saldo terbaru
  const { data: referrer } = await supabase
    .from('referral_users')
    .select('name, balance')
    .eq('phone', referrerPhone)
    .maybeSingle();

  await sendNotification({
    eventHash: `referral:${newRow.id}:credited`,
    recipient: referrerPhone,
    templateId: 'E9',
    text: E9_referralCredited({
      referrer_name: referrer?.name || 'Kak',
      referee_name: newRow.referee_name || 'Anonim',
      reward: newRow.reward,
      balance: referrer?.balance || 0,
    }),
    payload: { referral_id: newRow.id },
  });

  log.info(
    { referral_id: newRow.id, to: referrerPhone, reward: newRow.reward },
    'referral credit notified'
  );
}
