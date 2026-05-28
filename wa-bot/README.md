# Kopken WhatsApp Bot

Bot WhatsApp untuk **Jasa Order Kopi Kenangan** — auto notifikasi pesanan, pembayaran, status, dan referral via WhatsApp.

**Stack:** Node.js + [Baileys](https://github.com/WhiskeySockets/Baileys) + Supabase Realtime

---

## 📁 Struktur Project

```
wa-bot/
├── src/
│   ├── index.js              # Entry point
│   ├── config.js             # Config dari env vars
│   ├── logger.js             # Pino logger
│   ├── supabase.js           # Supabase client
│   ├── baileys.js            # WA connection + send/receive
│   ├── realtime.js           # Supabase Realtime subscriptions
│   ├── sender.js             # High-level send dengan idempotency
│   ├── queue.js              # p-queue rate limit
│   ├── reminders.js          # Cron job reminder bayar
│   ├── handlers/
│   │   ├── orderEvents.js
│   │   ├── referralEvents.js
│   │   └── withdrawalEvents.js
│   ├── commands/
│   │   ├── router.js         # Route incoming message
│   │   ├── customer.js       # /cek, /saldo, /menu, /bantuan
│   │   └── admin.js          # /proses, /siap, /selesai, /batal, /stok, /buka, /tutup
│   ├── templates/
│   │   └── messages.js       # E1..E13 template builder
│   └── utils/
│       ├── phone.js          # Normalize, JID conversion
│       ├── format.js         # rupiah, dateID, timeAgo
│       └── idempotency.js    # bot_sent_messages CRUD
├── scripts/
│   └── logout.js             # Hapus session WA
├── supabase-migrations/
│   └── 005_bot_messages.sql  # Tabel idempotency
├── auth/                     # Baileys session (auto-generate, .gitignore)
├── .env.example
├── .env                      # ← Copy dari .env.example, isi credentials
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### 1. Pisahkan project

Bot ini **terpisah dari Next.js web app**. Copy folder `wa-bot/` ke lokasi sendiri:

```bash
# Misalnya
cp -r d:/PROJECT\ SAYA/kopken/wa-bot d:/PROJECT\ SAYA/kopken-wa-bot
cd d:/PROJECT\ SAYA/kopken-wa-bot
```

(Atau bikin repo Git baru dari folder ini.)

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Supabase

**a. Jalankan migration tabel idempotency:**

Buka Supabase Dashboard → SQL Editor → paste isi `supabase-migrations/005_bot_messages.sql` → Run.

**b. Aktifkan Realtime replication:**

Dashboard → Database → Replication → enable untuk:
- `orders`
- `referrals`
- `withdrawals`

### 4. Setup environment

```bash
cp .env.example .env
```

Edit `.env`, isi:
- `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` (sama dengan web app)
- `ADMIN_PHONES` (nomor admin yang akan dapat notif, format `62xxx`, comma-separated)
- `ADMIN_WA` (nomor admin yang ditampilkan ke customer)
- `BASE_URL` (URL website, mis. `https://jasdoraja.com`)

### 5. First run — scan QR

```bash
npm start
```

QR code akan tampil di terminal. Scan dengan WhatsApp:
- WA → Settings → Linked Devices → Link a Device

Setelah login, session disimpan di `auth/`. Restart berikutnya tidak perlu scan ulang.

### 6. Test

Buat order dummy dari web app, atau update status order di admin panel. Notifikasi harus muncul di WA admin & customer.

---

## 🛠️ Commands

### Customer commands
- `/cek [Order ID]` — cek status pesanan
- `/saldo` — cek saldo referral berdasarkan nomor pengirim
- `/menu` — link ke website
- `/bantuan` — list perintah

### Admin commands (hanya nomor di `ADMIN_PHONES`)
- `/proses [Order ID]` — set status processing
- `/siap [Order ID] [Nomor]` — set ready dengan nomor antrian
- `/selesai [Order ID]` — set done
- `/batal [Order ID] [alasan]` — cancel order
- `/stok [angka]` — set stok akun
- `/buka` / `/tutup` — toggle service status
- `/admin` — tampilkan list admin command

---

## 📨 Event Map (otomatis via Realtime)

| Event di DB | Penerima | Template |
|---|---|---|
| `INSERT orders` | Admin + Customer | E1 + E2 |
| `orders.data.proof_url` ter-set | Admin | E3 |
| `orders.status: → processing` | Customer | E4 |
| `orders.status: → ready` | Customer | E5 |
| `orders.status: → done` | Customer | E6 |
| `orders.status: → cancelled` | Customer | E7 |
| Cron 5 menit, order `pending` 30 menit | Customer | E8 |
| `referrals.status: → credited` | Referrer | E9 |
| `INSERT withdrawals` | Admin | E10 |
| `withdrawals.status: → processing` | User | E11 |
| `withdrawals.status: → completed` | User | E12 |
| `withdrawals.status: → rejected` | User | E13 |

Template detail ada di `src/templates/messages.js`.

---

## 🔧 Scripts

```bash
npm start         # Production: jalankan bot
npm run dev       # Dev mode dengan auto-reload (Node 18+)
npm run logout    # Hapus session WA (paksa scan QR baru)
```

---

## 🛡️ Anti-Spam & Idempotency

- **Idempotency**: tabel `bot_sent_messages` cegah duplicate kirim. Setiap event punya unique hash.
- **Rate limit global**: max 2 msg/sec via p-queue.
- **Rate limit per nomor**: minimal 5 detik antar pesan ke nomor yang sama.
- **Track unreachable**: nomor yang gagal kirim 3x ditandai `blocked` di tabel `bot_unreachable`.

---

## 📦 Hosting

Bot **tidak bisa di Vercel/Netlify** (serverless) karena perlu long-running connection.

| Provider | Setup |
|---|---|
| **VPS** (Contabo/DO/Hetzner) | `pm2 start src/index.js --name bot && pm2 save && pm2 startup` |
| **Railway** | Deploy dari Git, set env vars di dashboard |
| **Fly.io** | `fly launch` dengan persistent volume untuk `auth/` |
| **Self-hosted** | Pakai PM2 atau systemd di server lokal |

---

## ⚠️ Gotchas

- **Pakai nomor WA terpisah** untuk bot. Jangan nomor pribadi (risiko ban).
- **Folder `auth/` jangan di-commit.** Sudah masuk `.gitignore`.
- **Service role key** harus rahasia — hanya di server, jangan expose ke client.
- **Bot harus selalu online** — kalau offline > 14 hari, session expired & perlu scan ulang.
- **Realtime butuh replication aktif** di Supabase Dashboard.
- **Reminder cron** butuh bot tetap jalan, tidak hanya event-driven.

---

## 🧪 Testing Locally

1. Pastikan web app (Next.js) jalan dan terhubung ke Supabase yang sama.
2. Jalankan bot: `npm start`.
3. Buat order dari web app. Cek terminal bot — log harus tampil "order INSERT".
4. Cek WA admin & customer — pesan masuk.
5. Update status di admin panel. Cek lagi pesan masuk ke customer.

---

## 🐛 Troubleshooting

**Bot tidak terima event Realtime**
- Cek replication di Supabase aktif untuk tabel `orders`/`referrals`/`withdrawals`.
- Cek log saat startup: harus muncul `orders channel SUBSCRIBED`.

**Pesan ganda terkirim**
- Cek tabel `bot_sent_messages` — apakah `event_hash` ter-record.
- Bisa jadi WA app belum confirm receipt. Naikkan `MIN_INTERVAL_PER_NUMBER_SEC` di env.

**Pesan tidak terkirim ke nomor tertentu**
- Cek `bot_unreachable` — apakah nomor tersebut `blocked = true`.
- Reset dengan: `DELETE FROM bot_unreachable WHERE phone = '62xxxx'`.

**Session ke-logout terus**
- Cek WA app pribadi tidak pakai nomor yang sama dengan bot.
- WhatsApp limit 4 device per akun, bot hitung 1 device.

**Error `Cannot find module '@whiskeysockets/baileys'`**
- Belum `npm install`. Atau Node version < 18.

---

## 📝 Notes

Bot ini **melengkapi** web app, bukan menggantikan:
- User tetap order via web
- User tetap upload bukti bayar via web
- Admin tetap kelola order via web
- Bot hanya kirim notifikasi & menerima command sederhana

Untuk full automation lebih lanjut (mis. terima foto bukti via WA langsung), bisa di-extend dengan menambahkan handler untuk `messageType: 'imageMessage'`.
