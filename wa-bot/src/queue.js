/**
 * Message queue dengan rate limiting:
 * - Global: max N pesan/detik (anti-ban)
 * - Per-recipient: minimal X detik antar-pesan ke nomor yang sama
 */
import PQueue from 'p-queue';
import NodeCache from 'node-cache';
import { config } from './config.js';
import { child } from './logger.js';

const log = child('queue');

// Global queue: limit total pesan per detik
const globalQueue = new PQueue({
  concurrency: 1,
  interval: 1000,
  intervalCap: config.rateLimit.maxPerSec,
});

// Per-recipient last-sent timestamp
const recipientLastSent = new NodeCache({
  stdTTL: 300, // 5 menit
  checkperiod: 60,
});

/**
 * Enqueue task pengiriman.
 * task = async () => { ... } yang melakukan sendMessage.
 *
 * Param recipient buat throttle per nomor.
 */
export async function enqueueSend(recipient, task) {
  return globalQueue.add(async () => {
    // Throttle per recipient
    const last = recipientLastSent.get(recipient) || 0;
    const minInterval = config.rateLimit.minIntervalPerNumberSec * 1000;
    const elapsed = Date.now() - last;
    if (elapsed < minInterval) {
      const wait = minInterval - elapsed;
      log.debug({ recipient, wait }, 'throttling');
      await new Promise((r) => setTimeout(r, wait));
    }
    recipientLastSent.set(recipient, Date.now());

    return task();
  });
}

export function queueSize() {
  return globalQueue.size + globalQueue.pending;
}
