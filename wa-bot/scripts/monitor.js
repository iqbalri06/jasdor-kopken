/**
 * Live monitor: subscribe Realtime ke 3 tabel & log setiap event yang masuk.
 * Jalankan: npm run monitor
 *
 * Sambil tool ini jalan, buat order dummy di web. Kalau event masuk → 
 * log akan muncul. Kalau tidak ada log → replication belum aktif.
 */
import { supabase } from '../src/supabase.js';

console.log('\n=== Live Realtime Monitor ===');
console.log('Listening event INSERT/UPDATE pada orders, referrals, withdrawals...');
console.log('Test sekarang: buat order baru dari web app.');
console.log('Tekan Ctrl+C untuk berhenti.\n');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function timestamp() {
  return new Date().toLocaleTimeString('id-ID');
}

function log(table, event, payload) {
  console.log(
    `${colors.gray}[${timestamp()}]${colors.reset} ${colors.cyan}${table}${colors.reset} ${colors.yellow}${event}${colors.reset}`
  );
  console.log('  ID:', payload.new?.id || payload.old?.id);
  if (table === 'orders') {
    const d = payload.new?.data || {};
    console.log('  Customer:', d.customer?.name, '/', d.customer?.phone);
    console.log('  Status:', payload.new?.status);
    console.log('  Total:', d.totalToPay || d.total);
  }
  if (table === 'referrals') {
    console.log('  Status:', payload.old?.status, '→', payload.new?.status);
    console.log('  Reward:', payload.new?.reward);
  }
  if (table === 'withdrawals') {
    console.log('  Phone:', payload.new?.phone);
    console.log('  Status:', payload.old?.status, '→', payload.new?.status);
    console.log('  Amount:', payload.new?.amount);
  }
  console.log('');
}

const channel = supabase
  .channel('monitor')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (p) =>
    log('orders', 'INSERT', p)
  )
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (p) =>
    log('orders', 'UPDATE', p)
  )
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'referrals' }, (p) =>
    log('referrals', 'INSERT', p)
  )
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'referrals' }, (p) =>
    log('referrals', 'UPDATE', p)
  )
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'withdrawals' }, (p) =>
    log('withdrawals', 'INSERT', p)
  )
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'withdrawals' }, (p) =>
    log('withdrawals', 'UPDATE', p)
  )
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log(`${colors.green}✅ Subscribed ke 3 tabel. Menunggu event...${colors.reset}\n`);
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      console.log(`❌ Status: ${status}`);
      process.exit(1);
    }
  });

process.on('SIGINT', async () => {
  console.log('\n\nMonitor stopped.');
  await supabase.removeChannel(channel);
  process.exit(0);
});
