/**
 * Diagnosa: cek health bot setup.
 * Jalankan: npm run diagnose
 */
import { config } from '../src/config.js';
import { supabase } from '../src/supabase.js';

console.log('\n=== Kopken WA Bot — Diagnosa ===\n');

let pass = 0;
let fail = 0;

function ok(msg) {
  console.log(`✅ ${msg}`);
  pass++;
}
function err(msg) {
  console.log(`❌ ${msg}`);
  fail++;
}
function info(msg) {
  console.log(`ℹ️  ${msg}`);
}

// 1. Env vars
console.log('--- 1. Environment Variables ---');
if (config.supabase.url?.startsWith('https://')) ok(`SUPABASE_URL: ${config.supabase.url}`);
else err('SUPABASE_URL invalid');

if (config.supabase.serviceKey?.length > 50) ok(`SUPABASE_SERVICE_ROLE_KEY: set (${config.supabase.serviceKey.length} chars)`);
else err('SUPABASE_SERVICE_ROLE_KEY missing or too short');

if (config.bot.adminPhones.length > 0) ok(`ADMIN_PHONES: ${config.bot.adminPhones.join(', ')}`);
else err('ADMIN_PHONES kosong — admin tidak akan dapat notif');

if (config.bot.baseUrl) ok(`BASE_URL: ${config.bot.baseUrl}`);

// 2. Test koneksi Supabase
console.log('\n--- 2. Koneksi Supabase ---');
try {
  const { data, error } = await supabase.from('orders').select('id').limit(1);
  if (error) {
    err(`Query orders failed: ${error.message}`);
  } else {
    ok(`Tabel orders accessible (${data?.length || 0} sample row)`);
  }
} catch (e) {
  err(`Supabase connection error: ${e.message}`);
}

// 3. Cek tabel-tabel
console.log('\n--- 3. Tabel Database ---');
const tables = [
  'orders',
  'referrals',
  'withdrawals',
  'referral_users',
  'settings',
  'bot_sent_messages',
];
for (const tbl of tables) {
  try {
    const { error } = await supabase.from(tbl).select('*', { count: 'exact', head: true });
    if (error) {
      if (tbl === 'bot_sent_messages') {
        err(`Tabel ${tbl} TIDAK ADA — jalankan supabase-migrations/005_bot_messages.sql`);
      } else {
        err(`Tabel ${tbl}: ${error.message}`);
      }
    } else {
      ok(`Tabel ${tbl} ada`);
    }
  } catch (e) {
    err(`Tabel ${tbl}: ${e.message}`);
  }
}

// 4. Cek Realtime — subscribe & coba dengar event 5 detik
console.log('\n--- 4. Supabase Realtime ---');
info('Subscribing 5 detik untuk test koneksi Realtime...');

const channel = supabase.channel('diagnose-test');
let subscribed = false;

await new Promise((resolve) => {
  const timeout = setTimeout(() => {
    if (!subscribed) {
      err('Realtime channel TIDAK ter-subscribe dalam 5 detik');
      err('CEK: Supabase Dashboard → Database → Replication → enable untuk orders/referrals/withdrawals');
    }
    resolve();
  }, 5000);

  channel
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      () => {}
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        subscribed = true;
        ok('Realtime channel SUBSCRIBED ke tabel orders');
        clearTimeout(timeout);
        resolve();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        err(`Realtime status: ${status}`);
        clearTimeout(timeout);
        resolve();
      }
    });
});

await supabase.removeChannel(channel);

// 5. Cek replication setting
console.log('\n--- 5. Replication Status ---');
info('Cek tabel di publication "supabase_realtime"...');
try {
  // Query pg_publication_tables untuk lihat tabel yang di-publish
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: "SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime'",
  });
  // Note: rpc tidak akan jalan kalau tidak ada function. Kita skip kalau gagal.
  if (error) {
    info('  (Tidak bisa cek via RPC. Cek manual di Dashboard → Database → Replication)');
  } else if (data) {
    info(`Tables publishing: ${JSON.stringify(data)}`);
  }
} catch (_) {
  info('  (Skip — cek manual di Dashboard)');
}

// 6. Cek pesan yang sudah pernah dikirim
console.log('\n--- 6. Riwayat Bot Messages ---');
try {
  const { data, count } = await supabase
    .from('bot_sent_messages')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(5);

  if (count !== null) {
    ok(`Total pesan terkirim: ${count}`);
    if (data && data.length > 0) {
      info('5 pesan terakhir:');
      for (const msg of data) {
        info(`  ${msg.created_at} | ${msg.template_id} → ${msg.recipient} | ${msg.status}`);
      }
    } else {
      info('Belum ada pesan terkirim');
    }
  }
} catch (e) {
  err(`Query bot_sent_messages: ${e.message}`);
}

// 7. Cek failed messages
try {
  const { data: failed } = await supabase
    .from('bot_sent_messages')
    .select('*')
    .eq('status', 'failed')
    .order('created_at', { ascending: false })
    .limit(5);

  if (failed && failed.length > 0) {
    err(`Ada ${failed.length} pesan failed:`);
    for (const msg of failed) {
      info(`  ${msg.template_id} → ${msg.recipient} | error: ${msg.error}`);
    }
  } else {
    ok('Tidak ada pesan failed');
  }
} catch (_) {}

// Summary
console.log(`\n=== Summary: ${pass} passed, ${fail} failed ===\n`);

if (fail > 0) {
  console.log('🔧 Langkah berikutnya:');
  console.log('  1. Pastikan tabel bot_sent_messages sudah dibuat (migration 005)');
  console.log('  2. Aktifkan Realtime di Supabase Dashboard untuk orders/referrals/withdrawals');
  console.log('  3. Pastikan bot WA sudah scan QR & terkoneksi (jalankan npm start)');
  console.log('');
}

process.exit(fail > 0 ? 1 : 0);
