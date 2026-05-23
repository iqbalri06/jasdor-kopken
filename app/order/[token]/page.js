'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

function rupiah(n) {
  if (n == null || isNaN(n)) return 'Rp 0';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function formatDateTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
}

export default function OrderDetailPage({ params }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(params.token)}`);
        const json = await res.json();
        if (cancel) return;
        if (json.error_code !== 0 || !json.data) {
          throw new Error(json.msg || 'Order tidak ditemukan');
        }
        setOrder(json.data);
      } catch (e) {
        if (!cancel) setError(e.message || 'Order tidak ditemukan');
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, [params.token]);

  function copyLink() {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  if (error) {
    return (
      <main className="pb-24">
        <Header title="Detail Pesanan" back="/" showCart={false} />
        <div className="max-w-md mx-auto px-4 mt-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-100 grid place-items-center text-3xl mb-4">
            ⚠️
          </div>
          <p className="font-semibold text-lg text-ink-900">{error}</p>
          <Link
            href="/"
            className="inline-flex mt-5 bg-ink-900 text-white text-sm font-semibold px-6 py-3 rounded-2xl hover:bg-ink-800 transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="pb-24">
        <Header title="Detail Pesanan" back="/" showCart={false} />
        <div className="max-w-3xl mx-auto px-4 md:px-6 mt-6 space-y-3">
          <div className="h-32 rounded-3xl shimmer" />
          <div className="grid md:grid-cols-2 gap-3">
            <div className="h-28 rounded-2xl shimmer" />
            <div className="h-28 rounded-2xl shimmer" />
          </div>
          <div className="h-48 rounded-2xl shimmer" />
        </div>
      </main>
    );
  }

  const {
    orderId,
    customer,
    pickup,
    store,
    items = [],
    subtotal,
    origSubtotal,
    discount,
    discountCapped,
    serviceFee,
    total,
    createdAt,
  } = order;

  const customerWa = customer?.phone ? customer.phone.replace(/[^0-9]/g, '').replace(/^0/, '62') : '';
  const dateStr = formatDateTime(createdAt);

  return (
    <main className="pb-32 bg-ink-50/50">
      <Header title="Detail Pesanan" subtitle={orderId} back="/" showCart={false} />

      <div className="max-w-3xl mx-auto px-4 md:px-6">
        {/* Hero status */}
        <section className="mt-4 md:mt-6">
          <div className="relative rounded-3xl bg-gradient-to-br from-ink-900 via-ink-800 to-accent-700 text-white p-6 md:p-8 overflow-hidden">
            {/* Decorative */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-accent-500/20 blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/15 backdrop-blur px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Pesanan Baru Masuk
                  </span>
                  <p className="text-[11px] uppercase tracking-[0.18em] opacity-70 font-semibold mt-3">
                    Order ID
                  </p>
                  <p className="text-2xl md:text-3xl font-extrabold mt-0.5 tracking-tight">
                    {orderId}
                  </p>
                  {dateStr && (
                    <p className="text-xs md:text-sm opacity-80 mt-1">{dateStr}</p>
                  )}
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/15 backdrop-blur grid place-items-center text-3xl md:text-4xl shrink-0">
                  ☕
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-white/15">
                <Stat label="Items" value={items.reduce((a, b) => a + b.qty, 0)} />
                <Stat
                  label="Pengambilan"
                  value={pickup?.type === 'later' ? pickup.time || '-' : 'Segera'}
                />
                <Stat label="Total" value={rupiah(total)} highlight />
              </div>
            </div>
          </div>
        </section>

        {/* Action bar */}
        <section className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={copyLink}
            className="bg-white border border-ink-200 hover:border-ink-900 text-ink-900 text-xs md:text-sm font-medium py-3 rounded-2xl transition flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Link tersalin
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Salin Link
              </>
            )}
          </button>
          <button
            onClick={() => window.print()}
            className="bg-white border border-ink-200 hover:border-ink-900 text-ink-900 text-xs md:text-sm font-medium py-3 rounded-2xl transition flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Cetak
          </button>
        </section>

        {/* Customer + Pickup */}
        <section className="mt-3 grid md:grid-cols-2 gap-3">
          <Card title="Pelanggan" icon={<UserIcon />}>
            <Info label="Nama" value={customer?.name || '-'} />
            <Info
              label="WhatsApp"
              value={
                customer?.phone ? (
                  <a
                    href={`https://wa.me/${customerWa}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    {customer.phone}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17 17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </a>
                ) : (
                  '-'
                )
              }
            />
          </Card>

          <Card
            title="Waktu Ambil"
            icon={<ClockIcon />}
            accent={pickup?.type === 'later' ? 'amber' : 'emerald'}
          >
            <div className="flex items-center gap-3">
              <div
                className={
                  'w-12 h-12 rounded-2xl grid place-items-center text-2xl shrink-0 ' +
                  (pickup?.type === 'later' ? 'bg-accent-100' : 'bg-emerald-100')
                }
              >
                {pickup?.type === 'later' ? '🕐' : '⚡'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">
                  {pickup?.type === 'later' ? 'Ambil Nanti' : 'Ambil Sekarang'}
                </p>
                <p className="text-xs text-ink-500 mt-0.5">
                  {pickup?.type === 'later'
                    ? `Pukul ${pickup.time || '-'}`
                    : 'Secepatnya setelah konfirmasi'}
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Outlet */}
        {store && (
          <section className="mt-3">
            <Card title="Outlet Pengambilan" icon={<PinIcon />}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-ink-100 grid place-items-center text-xl shrink-0">
                  🏪
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900">{store.name}</p>
                  <p className="text-xs text-ink-500 mt-1 leading-relaxed">{store.address}</p>
                  {store.code && (
                    <span className="inline-block mt-2 text-[10px] text-ink-700 bg-ink-100 font-mono px-2 py-1 rounded-md">
                      {store.code}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Items */}
        <section className="mt-3">
          <Card
            title={`Daftar Pesanan`}
            icon={<ListIcon />}
            badge={`${items.length} produk`}
          >
            <ul className="divide-y divide-ink-100">
              {items.map((it, i) => (
                <li key={i} className="py-3 first:pt-0 last:pb-0 flex gap-3">
                  <div className="relative w-16 h-16 rounded-xl bg-ink-100 overflow-hidden shrink-0">
                    {it.image ? (
                      <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-2xl">☕</div>
                    )}
                    <span className="absolute top-1 right-1 bg-ink-900 text-white text-[10px] font-bold w-5 h-5 rounded-full grid place-items-center">
                      {it.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-ink-900 leading-snug">{it.name}</p>
                    {it.variant && (
                      <p className="text-[11px] text-ink-500 mt-1 leading-relaxed">{it.variant}</p>
                    )}
                    {it.product_code && (
                      <span className="inline-block mt-1.5 text-[10px] text-ink-600 bg-ink-100 font-mono px-1.5 py-0.5 rounded">
                        {it.product_code}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-ink-500">
                      {rupiah(Number(it.price))} × {it.qty}
                    </p>
                    <p className="text-sm font-bold text-ink-900 mt-0.5">
                      {rupiah(Number(it.price) * it.qty)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Bill */}
        <section className="mt-3">
          <div className="rounded-2xl bg-white border border-ink-200 overflow-hidden">
            <div className="px-4 md:px-5 py-4 border-b border-ink-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-ink-100 grid place-items-center">
                  <BillIcon />
                </span>
                <h3 className="text-sm font-semibold text-ink-900">Ringkasan Tagihan</h3>
              </div>
            </div>
            <div className="px-4 md:px-5 py-4 space-y-2 text-sm">
              {origSubtotal > subtotal && (
                <Row
                  label="Subtotal harga normal"
                  value={rupiah(origSubtotal)}
                  valueClass="text-ink-400 line-through"
                />
              )}
              {discount > 0 && (
                <Row
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      Hemat 50%
                      {discountCapped && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                          MAX
                        </span>
                      )}
                    </span>
                  }
                  value={`- ${rupiah(discount)}`}
                  valueClass="text-emerald-600 font-semibold"
                />
              )}
              <Row label="Subtotal setelah diskon" value={rupiah(subtotal)} />
              <Row label="Biaya jasa order" value={rupiah(serviceFee)} />
            </div>
            <div className="px-4 md:px-5 py-4 bg-ink-900 text-white flex justify-between items-baseline">
              <span className="font-semibold">Total Bayar</span>
              <span className="font-extrabold text-2xl tracking-tight">{rupiah(total)}</span>
            </div>
          </div>
        </section>

        {/* Admin actions */}
        {customer?.phone && (
          <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={`https://wa.me/${customerWa}?text=${encodeURIComponent(
                `Halo ${customer.name || 'Kak'}, terima kasih sudah order di Jasa Order Kopi Kenangan. Pesanan ${orderId} sedang kami proses ☕`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl px-4 py-3.5 active:scale-[.98] transition flex items-center justify-center gap-2 font-semibold text-sm"
            >
              <WhatsAppIcon />
              Hubungi Pelanggan
            </a>
            <a
              href={`tel:${customer.phone.replace(/[^0-9]/g, '')}`}
              className="bg-white border border-ink-200 hover:border-ink-900 text-ink-900 rounded-2xl px-4 py-3.5 active:scale-[.98] transition flex items-center justify-center gap-2 font-semibold text-sm"
            >
              <PhoneIcon />
              Telepon
            </a>
          </section>
        )}

        {/* Footer note */}
        <p className="text-center text-[10px] text-ink-400 mt-6">
          Dokumen ini dibuat otomatis oleh Jasa Order Kopi Kenangan
        </p>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          header,
          .no-print {
            display: none !important;
          }
          main {
            background: white !important;
          }
          .shadow-card,
          [class*='shadow'] {
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">{label}</p>
      <p
        className={
          'mt-1 ' +
          (highlight
            ? 'text-base md:text-lg font-extrabold text-accent-200'
            : 'text-base md:text-lg font-bold')
        }
      >
        {value}
      </p>
    </div>
  );
}

function Card({ title, icon, badge, children }) {
  return (
    <div className="rounded-2xl bg-white border border-ink-200 overflow-hidden">
      <div className="px-4 md:px-5 py-3.5 border-b border-ink-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-ink-100 grid place-items-center text-ink-700 shrink-0">
            {icon}
          </span>
          <h3 className="text-sm font-semibold text-ink-900 truncate">{title}</h3>
        </div>
        {badge && (
          <span className="text-[10px] bg-ink-100 text-ink-700 px-2 py-1 rounded-full font-semibold shrink-0">
            {badge}
          </span>
        )}
      </div>
      <div className="px-4 md:px-5 py-4">{children}</div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b border-ink-100 last:border-0 text-sm">
      <span className="text-ink-500 shrink-0">{label}</span>
      <span className="text-ink-900 font-medium text-right min-w-0">{value}</span>
    </div>
  );
}

function Row({ label, value, valueClass = '' }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-ink-500">{label}</span>
      <span className={valueClass || 'text-ink-900 font-medium'}>{value}</span>
    </div>
  );
}

/* Icons */
function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function BillIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
