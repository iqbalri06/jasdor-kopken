/**
 * Idempotency helper untuk cegah duplicate messages.
 * Cek apakah event_hash sudah pernah di-process.
 */
import { supabase } from '../supabase.js';
import { child } from '../logger.js';

const log = child('idempotency');

/**
 * Cek apakah event sudah pernah dikirim.
 * Return true kalau SUDAH pernah (artinya skip).
 */
export async function alreadySent(eventHash) {
  try {
    const { data } = await supabase
      .from('bot_sent_messages')
      .select('id, status')
      .eq('event_hash', eventHash)
      .maybeSingle();

    return data && data.status === 'sent';
  } catch (e) {
    log.error({ err: e.message }, 'alreadySent check failed');
    return false; // fail-open
  }
}

/**
 * Tandai event sebagai berhasil terkirim.
 */
export async function markSent({
  eventHash,
  recipient,
  templateId,
  payload = {},
}) {
  try {
    await supabase.from('bot_sent_messages').insert({
      event_hash: eventHash,
      recipient,
      template_id: templateId,
      payload,
      status: 'sent',
    });
  } catch (e) {
    // Kalau duplicate (unique constraint), biarkan saja — race condition
    if (!String(e.message).includes('duplicate')) {
      log.error({ err: e.message, eventHash }, 'markSent failed');
    }
  }
}

/**
 * Tandai sebagai failed (untuk retry / debug).
 */
export async function markFailed({
  eventHash,
  recipient,
  templateId,
  error,
  payload = {},
}) {
  try {
    await supabase.from('bot_sent_messages').upsert(
      {
        event_hash: eventHash,
        recipient,
        template_id: templateId,
        payload,
        status: 'failed',
        error: String(error).slice(0, 500),
      },
      { onConflict: 'event_hash' }
    );
  } catch (e) {
    log.error({ err: e.message }, 'markFailed insert failed');
  }
}

/**
 * Track unreachable recipient (kalau gagal kirim ≥3x → mark blocked).
 */
export async function trackUnreachable(phone) {
  try {
    const { data: existing } = await supabase
      .from('bot_unreachable')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (!existing) {
      await supabase.from('bot_unreachable').insert({
        phone,
        fail_count: 1,
        last_failed_at: new Date().toISOString(),
      });
      return false;
    }

    const newCount = existing.fail_count + 1;
    await supabase
      .from('bot_unreachable')
      .update({
        fail_count: newCount,
        last_failed_at: new Date().toISOString(),
        blocked: newCount >= 3,
      })
      .eq('phone', phone);

    return newCount >= 3;
  } catch (e) {
    log.error({ err: e.message }, 'trackUnreachable failed');
    return false;
  }
}

export async function isBlocked(phone) {
  try {
    const { data } = await supabase
      .from('bot_unreachable')
      .select('blocked')
      .eq('phone', phone)
      .maybeSingle();
    return !!data?.blocked;
  } catch (_) {
    return false;
  }
}
