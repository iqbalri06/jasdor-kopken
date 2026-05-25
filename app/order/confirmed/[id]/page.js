'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Icon } from '@/components/Icons';

function rupiah(n) {
  if (n == null || isNaN(n)) return 'Rp 0';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

export default function OrderConfirmedPage({ params }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  async function loadOrder() {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(params.id)}`);
      const json = await res.json();
      if (json.error_code === 0 && json.data) {
        setOrder(json.data);
      } else {
        setError('Pesanan tidak ditemukan');
      }
    } catch (_) {
      setError('Gagal memuat pesanan');
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="pb-24">
        <Header title="Konfirmasi Pesanan" back="/" showCart={false} />
        <div className="max-w-md mx-auto px-4 mt-8 space-y-3">
          <div className="h-32 rounded-3xl shimmer" />
          <div className="h-48 rounded-2xl shimmer" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pb-24">
        <Header title="Konfirmasi Pesanan" back="/" showCart={false} />
        <div className="max-w-md mx-auto px-4 mt-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 grid place-items-center text-red-600 mb-4">
            <Icon.AlertTriangle size={28} />
          </div>
          <p className="font-semibold text-ink-900">{error}</p>
        </div>
      </main>
    );
  }

  const d = order?.data || {};
  const items = d.items || [];
  const totalQty = items.reduce((a, b) => a + (b.qty || 0), 0);

  return (
    <main className="pb-24 bg-gradient-to-b from-ink-50 to-white">
      <Header title="Pesanan Dikonfirmasi" back="/" showCart={false} />

      <div className="max-w-md mx-auto px-4 md:px-6 mt-6">
        {/* Success hero */}
        <div className="text-center mb-6">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-emerald-500 grid place-items-center text-white shadow-lg">
              <Icon.Check size={44} strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900">Pesanan Diterima!</h1>
          <p className="text-sm text-ink-600 mt-2 max-w-xs mx-auto leading-relaxed">
            Pesanan kamu sedang diproses. Silakan ambil di outlet sesuai waktu yang dipilih.
          </p>
        </div>

        {/* Order summary card */}
        <div className="rounded-2xl bg-white border border-ink-200 overflow-hidden shadow-card">
          <div className="bg-gradient-to-r from-ink-900 to-accent-700 text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">Order ID</p>
                <p className="text-lg font-bold mt-0.5">{order.id}</p>
              </div>
              <div className="bg-emerald-400 text-ink-900 text-[10px] font-bold px-2.5 py-1 rounded-full">
                DIKONFIRMASI
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Pickup info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-50">
              <div className="w-10 h-10 rounded-xl bg-white grid place-items-center text-ink-700 shrink-0">
                {d.pickup?.type === 'later' ? <Icon.Clock size={18} /> : <Icon.Bolt size={18} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {d.pickup?.type === 'later' ? `Ambil pukul ${d.pickup.time}` : 'Ambil sekarang'}
                </p>
                <p className="text-xs text-ink-500">{d.store?.name || ''}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-semibold text-ink-900 mb-2">{totalQty} item dipesan</p>
              <ul className="space-y-2">
                {items.map((it, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs">
                    {(it.image || it.m) && (
                      <img
                        src={it.image || it.m}
                        alt={it.name || it.n}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink-900 truncate">{it.name || it.n}</p>
                      {(it.variant || it.v) && (
                        <p className="text-[10px] text-ink-500 truncate">{it.variant || it.v}</p>
                      )}
                    </div>
                    <span className="text-ink-700 font-semibold shrink-0">
                      {it.qty || it.q}×
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-3 border-t border-ink-100">
              <span className="text-sm text-ink-500">Total</span>
              <span className="text-xl font-bold text-ink-900">{rupiah(d.total)}</span>
            </div>
          </div>
        </div>

        {/* Store address */}
        {d.store && (
          <div className="mt-4 rounded-2xl bg-white border border-ink-200 p-4 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink-100 grid place-items-center text-ink-700 shrink-0">
              <Icon.Pin size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">{d.store.name}</p>
              <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{d.store.address}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-ink-900 text-white text-sm font-semibold px-6 py-3 rounded-2xl hover:bg-ink-800 active:scale-95 transition"
          >
            Pesan Lagi
          </Link>
          <p className="text-[11px] text-ink-400 mt-3">
            Terima kasih sudah order di Jasa Order Kopi Kenangan
          </p>
        </div>
      </div>
    </main>
  );
}
