/**
 * Route incoming WA message ke handler yang tepat.
 * Priority: admin command → customer command → default reply
 */
import { handleAdminMessage } from './admin.js';
import { handleCustomerMessage } from './customer.js';
import { sendText } from '../baileys.js';
import { fromJid } from '../utils/phone.js';
import { config } from '../config.js';
import { child } from '../logger.js';

const log = child('router');

export async function routeMessage(msg) {
  log.debug({ from: fromJid(msg.from), text: msg.text.slice(0, 50) }, 'incoming');

  // Coba admin command dulu
  const handledByAdmin = await handleAdminMessage(msg);
  if (handledByAdmin) return;

  // Lanjut customer command
  const handledByCustomer = await handleCustomerMessage(msg);
  if (handledByCustomer) return;

  // Fallback: default reply
  await sendText(
    fromJid(msg.from),
    [
      `Halo ${msg.name || 'Kak'} 👋`,
      ``,
      `Ini bot otomatis dari ${config.bot.name}.`,
      `Ketik */bantuan* untuk lihat daftar perintah.`,
      ``,
      `Atau buka langsung websitenya:`,
      config.bot.baseUrl,
    ].join('\n')
  );
}
