/**
 * Centralized config dari env vars.
 */
import 'dotenv/config';

function required(key) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env: ${key}`);
  return v;
}

function int(key, fallback) {
  const v = process.env[key];
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function list(key, fallback = []) {
  const v = process.env[key];
  if (!v) return fallback;
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export const config = {
  supabase: {
    url: required('SUPABASE_URL'),
    serviceKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  },
  bot: {
    name: process.env.BOT_NAME || 'Jasdor Bot',
    baseUrl: process.env.BASE_URL || 'https://jasdoraja.app',
    adminPhones: list('ADMIN_PHONES'),
    adminWa: process.env.ADMIN_WA || '',
    authFolder: process.env.AUTH_FOLDER || 'auth',
  },
  reminder: {
    paymentMinutes: int('PAYMENT_REMINDER_MINUTES', 30),
    timeoutMinutes: int('PAYMENT_TIMEOUT_MINUTES', 60),
  },
  rateLimit: {
    maxPerSec: int('MAX_MSG_PER_SEC', 2),
    minIntervalPerNumberSec: int('MIN_INTERVAL_PER_NUMBER_SEC', 5),
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'pretty',
  },
};

if (config.bot.adminPhones.length === 0) {
  console.warn('[CONFIG] ADMIN_PHONES kosong — admin tidak akan dapat notifikasi');
}
