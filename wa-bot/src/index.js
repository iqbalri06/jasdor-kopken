/**
 * Kopken WA Bot — entry point.
 *
 * 1. Connect ke WhatsApp via Baileys (scan QR di first run)
 * 2. Subscribe Supabase Realtime untuk orders / referrals / withdrawals
 * 3. Schedule cron reminder pembayaran
 * 4. Handle incoming messages (commands)
 */
import { connectWA, setMessageHandler } from './baileys.js';
import { startRealtimeSubscriptions } from './realtime.js';
import { startReminders } from './reminders.js';
import { routeMessage } from './commands/router.js';
import { config } from './config.js';
import { logger } from './logger.js';

logger.info(
  {
    bot: config.bot.name,
    baseUrl: config.bot.baseUrl,
    admins: config.bot.adminPhones.length,
  },
  '🤖 Kopken WA Bot starting...'
);

async function main() {
  // 1. Connect WhatsApp
  await connectWA();

  // 2. Setup message handler (untuk command /cek, /saldo, dst)
  setMessageHandler(routeMessage);

  // 3. Subscribe Supabase Realtime
  startRealtimeSubscriptions();

  // 4. Start cron reminders
  startReminders();

  logger.info('✅ Bot ready & listening');
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  logger.error({ err: err?.message || err }, 'Unhandled rejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err: err?.message || err }, 'Uncaught exception');
});

main().catch((err) => {
  logger.error({ err: err.message, stack: err.stack }, 'Fatal startup error');
  process.exit(1);
});
