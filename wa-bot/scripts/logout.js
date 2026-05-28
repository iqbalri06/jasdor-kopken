/**
 * Logout / clear Baileys session.
 * Hapus folder auth/ supaya next run minta scan QR lagi.
 */
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../src/config.js';

const folder = path.resolve(config.bot.authFolder);

if (!fs.existsSync(folder)) {
  console.log(`Auth folder ${folder} sudah tidak ada.`);
  process.exit(0);
}

console.log(`Menghapus session: ${folder}`);
fs.rmSync(folder, { recursive: true, force: true });
console.log('✅ Session terhapus. Jalankan `npm start` untuk scan QR baru.');
