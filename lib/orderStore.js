/**
 * Order store - simpan order ke file JSON dengan ID pendek.
 * Untuk dev lokal: file-based. Untuk produksi: ganti dengan KV/DB.
 */
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'orders.json');

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (_) {}
}

async function readAll() {
  try {
    await ensureDir();
    const raw = await fs.readFile(FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

async function writeAll(data) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(data), 'utf-8');
}

function shortId() {
  // 8 karakter alfanumerik (case-sensitive). 62^8 ~ 218 triliun kombinasi.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 8; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return s;
}

export async function saveOrder(order) {
  const all = await readAll();
  let id;
  do {
    id = shortId();
  } while (all[id]);
  all[id] = { ...order, _savedAt: Date.now() };
  await writeAll(all);
  return id;
}

export async function getOrder(id) {
  const all = await readAll();
  return all[id] || null;
}
