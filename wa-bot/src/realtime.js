/**
 * Subscribe Supabase Realtime untuk tabel orders, referrals, withdrawals.
 *
 * Aktifkan replication di Supabase Dashboard → Database → Replication
 * untuk masing-masing tabel.
 */
import { supabase } from './supabase.js';
import { child } from './logger.js';
import {
  onOrderInsert,
  onOrderUpdate,
} from './handlers/orderEvents.js';
import { onReferralUpdate } from './handlers/referralEvents.js';
import {
  onWithdrawalInsert,
  onWithdrawalUpdate,
} from './handlers/withdrawalEvents.js';

const log = child('realtime');

export function startRealtimeSubscriptions() {
  // === Channel: orders ===
  const ordersChannel = supabase
    .channel('bot:orders')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      async (payload) => {
        log.debug({ id: payload.new?.id }, 'order INSERT');
        try {
          await onOrderInsert(payload.new);
        } catch (e) {
          log.error({ err: e.message }, 'onOrderInsert error');
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      async (payload) => {
        log.debug({ id: payload.new?.id }, 'order UPDATE');
        try {
          await onOrderUpdate(payload.new, payload.old);
        } catch (e) {
          log.error({ err: e.message }, 'onOrderUpdate error');
        }
      }
    )
    .subscribe((status) => {
      log.info({ status }, 'orders channel');
    });

  // === Channel: referrals ===
  const referralsChannel = supabase
    .channel('bot:referrals')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'referrals' },
      async (payload) => {
        log.debug({ id: payload.new?.id }, 'referral UPDATE');
        try {
          await onReferralUpdate(payload.new, payload.old);
        } catch (e) {
          log.error({ err: e.message }, 'onReferralUpdate error');
        }
      }
    )
    .subscribe((status) => {
      log.info({ status }, 'referrals channel');
    });

  // === Channel: withdrawals ===
  const withdrawalsChannel = supabase
    .channel('bot:withdrawals')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'withdrawals' },
      async (payload) => {
        log.debug({ id: payload.new?.id }, 'withdrawal INSERT');
        try {
          await onWithdrawalInsert(payload.new);
        } catch (e) {
          log.error({ err: e.message }, 'onWithdrawalInsert error');
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'withdrawals' },
      async (payload) => {
        log.debug({ id: payload.new?.id }, 'withdrawal UPDATE');
        try {
          await onWithdrawalUpdate(payload.new, payload.old);
        } catch (e) {
          log.error({ err: e.message }, 'onWithdrawalUpdate error');
        }
      }
    )
    .subscribe((status) => {
      log.info({ status }, 'withdrawals channel');
    });

  return { ordersChannel, referralsChannel, withdrawalsChannel };
}
