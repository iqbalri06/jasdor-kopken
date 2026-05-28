/**
 * High-level sender. Wraps:
 * - Idempotency check (skip kalau event sudah pernah dikirim)
 * - Queue throttling
 * - Track unreachable
 */
import { sendText } from './baileys.js';
import { enqueueSend } from './queue.js';
import {
  alreadySent,
  markSent,
  markFailed,
  isBlocked,
} from './utils/idempotency.js';
import { normalizePhone } from './utils/phone.js';
import { child } from './logger.js';
import { config } from './config.js';

const log = child('sender');

/**
 * Send message dengan idempotency.
 *
 * @param {object} opts
 * @param {string} opts.eventHash    Unique hash untuk event (cegah duplicate)
 * @param {string} opts.recipient    Nomor WA target (62xxx)
 * @param {string} opts.templateId   E1, E2, dst (untuk audit)
 * @param {string} opts.text         Pesan yang akan dikirim
 * @param {object} opts.payload      Data snapshot untuk audit
 * @returns {Promise<{ok:boolean, skipped?:boolean, error?:string}>}
 */
export async function sendNotification({
  eventHash,
  recipient,
  templateId,
  text,
  payload = {},
}) {
  const phone = normalizePhone(recipient);
  if (!phone) {
    return { ok: false, error: 'invalid recipient' };
  }

  // Cek idempotency
  if (await alreadySent(eventHash)) {
    log.debug({ eventHash }, 'skipped: already sent');
    return { ok: true, skipped: true };
  }

  // Cek blocked
  if (await isBlocked(phone)) {
    log.warn({ phone }, 'skipped: recipient blocked');
    return { ok: false, error: 'blocked' };
  }

  // Enqueue & send
  return enqueueSend(phone, async () => {
    const result = await sendText(phone, text);
    if (result.ok) {
      await markSent({ eventHash, recipient: phone, templateId, payload });
      log.info({ to: phone, templateId, eventHash }, 'sent');
    } else {
      await markFailed({
        eventHash,
        recipient: phone,
        templateId,
        error: result.error,
        payload,
      });
      log.warn({ to: phone, templateId, err: result.error }, 'failed');
    }
    return result;
  });
}

/**
 * Broadcast ke semua admin.
 */
export async function sendToAdmins({
  eventHash,
  templateId,
  text,
  payload = {},
}) {
  const results = [];
  for (let i = 0; i < config.bot.adminPhones.length; i++) {
    const admin = config.bot.adminPhones[i];
    const r = await sendNotification({
      eventHash: `${eventHash}:admin:${i}`,
      recipient: admin,
      templateId,
      text,
      payload,
    });
    results.push(r);
  }
  return results;
}
