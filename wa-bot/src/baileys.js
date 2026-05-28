/**
 * Baileys WhatsApp socket initializer.
 * - Multi-file auth state (persist session di folder auth/)
 * - Auto-reconnect on disconnect
 * - QR code di terminal saat first login
 */
import {
  default as makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import { config } from './config.js';
import { child } from './logger.js';
import { toJid } from './utils/phone.js';
import { trackUnreachable } from './utils/idempotency.js';

const log = child('baileys');

let sock = null;
let onMessageHandler = null;

export function setMessageHandler(fn) {
  onMessageHandler = fn;
}

/**
 * Get aktif socket (atau null kalau belum connect).
 */
export function getSocket() {
  return sock;
}

/**
 * Connect ke WhatsApp. Kalau session belum ada, akan tampil QR di terminal.
 * Auto-reconnect kalau koneksi putus (kecuali user logout manual).
 */
export async function connectWA() {
  const { state, saveCreds } = await useMultiFileAuthState(config.bot.authFolder);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  log.info({ version, isLatest }, 'using Baileys version');

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false, // kita handle manual
    logger: pino({ level: 'silent' }), // baileys internal noisy
    browser: [config.bot.name, 'Chrome', '120.0.0'],
    syncFullHistory: false,
    markOnlineOnConnect: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      log.info('=== SCAN QR CODE INI DENGAN WHATSAPP ===');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const isLoggedOut = code === DisconnectReason.loggedOut;
      log.warn({ code, isLoggedOut }, 'connection closed');

      if (!isLoggedOut) {
        log.info('reconnecting in 3s...');
        setTimeout(() => connectWA(), 3000);
      } else {
        log.error(
          'Session logged out. Hapus folder auth/ dan jalankan ulang untuk scan QR baru.'
        );
        process.exit(1);
      }
    } else if (connection === 'open') {
      log.info({ user: sock.user?.id }, '✅ WA connected');
    }
  });

  // Handle incoming messages (untuk command /cek, /saldo, dst)
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      // Skip own messages, status updates, group messages
      if (msg.key.fromMe) continue;
      if (msg.key.remoteJid === 'status@broadcast') continue;
      if (msg.key.remoteJid?.endsWith('@g.us')) continue;

      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      if (!text || !onMessageHandler) continue;

      try {
        await onMessageHandler({
          from: msg.key.remoteJid,
          text: text.trim(),
          messageId: msg.key.id,
          name: msg.pushName,
        });
      } catch (e) {
        log.error({ err: e.message }, 'message handler error');
      }
    }
  });

  return sock;
}

/**
 * Send text message ke nomor (62xxx).
 * Return: { ok: boolean, error? }
 */
export async function sendText(phone, text) {
  if (!sock) {
    return { ok: false, error: 'WA not connected' };
  }
  const jid = toJid(phone);
  if (!jid) {
    return { ok: false, error: 'invalid phone' };
  }

  try {
    await sock.sendMessage(jid, { text });
    log.debug({ to: phone, len: text.length }, 'message sent');
    return { ok: true };
  } catch (e) {
    log.error({ err: e.message, to: phone }, 'send failed');
    await trackUnreachable(phone);
    return { ok: false, error: e.message };
  }
}

/**
 * Cek apakah nomor terdaftar di WhatsApp.
 */
export async function isOnWhatsApp(phone) {
  if (!sock) return false;
  try {
    const jid = toJid(phone);
    const [result] = await sock.onWhatsApp(jid);
    return !!result?.exists;
  } catch (_) {
    return false;
  }
}
