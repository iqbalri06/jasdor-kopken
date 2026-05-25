'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useCart, rupiah } from '@/components/CartContext';
import { encodeOrder, generateOrderId } from '@/components/orderEncode';
import { Icon } from '@/components/Icons';
import { useServiceStatus } from '@/components/ServiceStatus';
import { saveOrderToHistory } from '@/app/orders/page';

const ADMIN_WA = '6281291544061';

function pad(n) {
  return n.toString().padStart(2, '0');
}
function nowHHMM() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m + minutes, 0, 0);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function isTimeWithin(time, open, close) {
  if (!open || !close) return true;
  const [oH, oM] = open.split(':').map(Number);
  const [cH, cM] = close.split(':').map(Number);
  const [tH, tM] = time.split(':').map(Number);
  const t = tH * 60 + tM;
  const o = oH * 60 + oM;
  const c = cH * 60 + cM;
  return t >= o && t <= c;
}

export default function CheckoutPage() {
  const {
    items,
    store,
    subtotal,
    origSubtotal,
    discount,
    discountCapped,
    serviceFee,
    total,
    clear,
    hydrated,
    pickup,
    setPickup,
  } = useCart();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const serviceStatus = useServiceStatus();

  useEffect(() => {
    if (pickup.type === 'later' && !pickup.time) {
      setPickup({ type: 'later', time: addMinutes(nowHHMM(), 30) });
    }
  }, [pickup.type]); // eslint-disable-line

  const minPickupTime = addMinutes(nowHHMM(), 15);

  const errors = {
    name: !name.trim() ? 'Nama tidak boleh kosong' : '',
    phone:
      !phone.trim()
        ? 'Nomor WA tidak boleh kosong'
        : !/^[0-9+\s-]{8,16}$/.test(phone.trim())
        ? 'Format nomor WA tidak valid'
        : '',
    pickup:
      pickup.type === 'later' && !pickup.time
        ? 'Pilih waktu ambil'
        : pickup.type === 'later' &&
          store?.open &&
          store?.close &&
          !isTimeWithin(pickup.time, store.open.slice(0, 5), store.close.slice(0, 5))
        ? `Waktu di luar jam operasional outlet (${store.open.slice(0, 5)} - ${store.close.slice(0, 5)})`
        : '',
  };
  const hasError = Object.values(errors).some(Boolean);

  const pickupLabel =
    pickup.type === 'now'
      ? 'Ambil Sekarang (secepatnya)'
      : `Ambil Nanti pukul ${pickup.time || '-'}`;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (hasError || items.length === 0 || submitting) return;

    if (!serviceStatus.open) {
      alert('Maaf, layanan sedang tutup. ' + (serviceStatus.message || 'Silakan coba lagi nanti.'));
      return;
    }

    setSubmitting(true);

    // Generate kode unik 3 digit (100-999)
    const uniqueCode = Math.floor(Math.random() * 900) + 100;

    const orderId = generateOrderId();
    const order = {
      orderId,
      createdAt: new Date().toISOString(),
      customer: { name: name.trim(), phone: phone.trim() },
      pickup,
      store: store
        ? {
            code: store.code,
            name: store.name,
            address: store.address,
          }
        : null,
      items: items.map((it) => ({
        name: it.name,
        product_code: it.product_code,
        variant: it.variant || '',
        price: Number(it.orig_price || it.price) || 0,
        qty: it.qty,
        image: it.image || '',
      })),
      subtotal,
      origSubtotal,
      discount,
      discountCapped,
      serviceFee,
      total,           // total tanpa kode unik
      uniqueCode,      // kode unik 3 digit
      totalToPay: total + uniqueCode, // total final yang harus dibayar
    };

    const token = encodeOrder(order);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    // Simpan order ke database
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
    } catch (_) {}

    // Simpan ke riwayat user
    saveOrderToHistory(orderId);

    // Kosongkan keranjang
    clear();
    setSubmitting(false);

    // Arahkan ke halaman pembayaran (bukan langsung WA)
    router.push(`/payment/${token}`);
  }

  if (hydrated && items.length === 0) {
    return (
      <main className="pb-24">
        <Header title="Checkout" back="/cart" showCart={false} />
        <div className="max-w-md mx-auto px-4 mt-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-ink-100 grid place-items-center mb-4 text-ink-400">
            <Icon.Bag size={36} />
          </div>
          <p className="font-semibold text-lg text-ink-900">Belum ada pesanan</p>
          <p className="text-sm text-ink-500 mt-1">Yuk pilih menu favoritmu dulu.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-5 bg-ink-900 text-white text-sm font-semibold px-6 py-3 rounded-2xl hover:bg-ink-800 active:scale-95 transition"
          >
            Cari Outlet →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-32">
      <Header title="Checkout" subtitle="Konfirmasi Pesanan" back="/cart" showCart={false} />

      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <form
          onSubmit={handleSubmit}
          className="mt-4 md:mt-6 md:grid md:grid-cols-[1fr_360px] md:gap-6"
        >
          <div className="space-y-3 md:space-y-4">
            <section className="rounded-2xl bg-white border border-ink-200 p-4 md:p-6 space-y-4">
              <div>
                <h2 className="text-sm md:text-base font-semibold text-ink-900">Data Pelanggan</h2>
                <p className="text-xs text-ink-500 mt-0.5">
                  Data ini dikirim ke admin untuk konfirmasi pesanan.
                </p>
              </div>

              <Field label="Nama Pelanggan" error={touched && errors.name} required>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="cth: Andi Pratama"
                  className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-ink-900 focus:bg-white transition"
                />
              </Field>

              <Field
                label="Nomor WhatsApp"
                error={touched && errors.phone}
                required
                hint="Pastikan nomor aktif untuk konfirmasi pesanan"
              >
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="cth: 08123456789"
                  inputMode="tel"
                  className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-ink-900 focus:bg-white transition"
                />
              </Field>
            </section>

            <section className="rounded-2xl bg-white border border-ink-200 p-4 md:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm md:text-base font-semibold text-ink-900">Waktu Ambil</h2>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Pilih kapan kamu mau mengambil pesanan.
                  </p>
                </div>
                {store?.open && store?.close && (
                  <span className="shrink-0 text-[11px] bg-ink-100 text-ink-700 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5">
                    <Icon.Clock size={11} />
                    {store.open.slice(0, 5)} - {store.close.slice(0, 5)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <PickupOption
                  active={pickup.type === 'now'}
                  onClick={() => setPickup({ type: 'now', time: '' })}
                  icon={<Icon.Bolt size={18} />}
                  title="Ambil Sekarang"
                  desc="Secepatnya setelah pesanan diproses"
                />
                <PickupOption
                  active={pickup.type === 'later'}
                  onClick={() =>
                    setPickup({
                      type: 'later',
                      time: pickup.time || addMinutes(nowHHMM(), 30),
                    })
                  }
                  icon={<Icon.Clock size={18} />}
                  title="Ambil Nanti"
                  desc="Atur waktu ambil sendiri"
                />
              </div>

              {pickup.type === 'later' && (
                <div className="fade-up">
                  <Field label="Jam Ambil" error={touched && errors.pickup} required>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={pickup.time}
                        min={minPickupTime}
                        onChange={(e) =>
                          setPickup({ type: 'later', time: e.target.value })
                        }
                        onBlur={() => setTouched(true)}
                        className="flex-1 bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-ink-900 focus:bg-white transition"
                      />
                      <div className="flex gap-1">
                        {[15, 30, 60].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() =>
                              setPickup({ type: 'later', time: addMinutes(nowHHMM(), m) })
                            }
                            className="text-xs bg-white border border-ink-200 hover:border-ink-900 text-ink-700 px-2.5 py-2 rounded-lg transition"
                          >
                            +{m}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </Field>
                  <p className="text-[11px] text-ink-500 mt-1.5">
                    Disarankan minimal {minPickupTime} (15 menit dari sekarang).
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-ink-900 text-white p-4 md:p-5 flex gap-3">
              <div className="w-10 h-10 rounded-full bg-white/15 grid place-items-center shrink-0 text-white">
                <Icon.Info size={18} />
              </div>
              <div className="text-xs md:text-sm">
                <p className="font-semibold">Langkah selanjutnya</p>
                <p className="opacity-80 mt-0.5 leading-relaxed">
                  Setelah klik <span className="font-semibold text-white">Lanjut ke Pembayaran</span>,
                  kamu akan diarahkan ke halaman pembayaran. Bayar lalu upload bukti transfer.
                </p>
              </div>
            </section>
          </div>

          <aside className="mt-3 md:mt-0">
            <div className="md:sticky md:top-20 space-y-3">
              <section className="rounded-2xl bg-white border border-ink-200 p-4 md:p-5">
                <h2 className="text-sm font-semibold text-ink-900 mb-3">Ringkasan Pesanan</h2>

                {store && (
                  <div className="text-xs mb-3 pb-3 border-b border-ink-200">
                    <p className="font-semibold text-ink-900">{store.name}</p>
                    <p className="text-ink-500 line-clamp-2 mt-0.5">{store.address}</p>
                  </div>
                )}

                <div className="text-xs mb-3 pb-3 border-b border-ink-200">
                  <p className="text-ink-500">Waktu Ambil</p>
                  <p className="font-semibold text-ink-900 mt-0.5">{pickupLabel}</p>
                </div>

                <ul className="space-y-2.5 max-h-72 overflow-y-auto scrollbar-thin pr-1">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-center gap-2.5 text-xs">
                      <div className="w-12 h-12 rounded-lg bg-ink-100 overflow-hidden shrink-0">
                        {it.image ? (
                          <img
                            src={it.image}
                            alt={it.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-ink-400">
                            <Icon.Coffee size={18} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-ink-900 text-white text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full grid place-items-center shrink-0">
                            {it.qty}×
                          </span>
                          <p className="font-medium text-ink-900 truncate">{it.name}</p>
                        </div>
                        {it.variant && (
                          <p className="text-[10px] text-ink-500 truncate mt-0.5">{it.variant}</p>
                        )}
                      </div>
                      <span className="font-semibold whitespace-nowrap shrink-0 text-ink-900">
                        {rupiah(Number(it.orig_price || it.price) * it.qty)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-ink-200 mt-3 pt-3 space-y-1.5 text-xs">
                  {origSubtotal > subtotal && (
                    <Row
                      label="Subtotal harga normal"
                      value={rupiah(origSubtotal)}
                      valueClass="text-ink-400 line-through"
                    />
                  )}
                  {discount > 0 && (
                    <Row
                      label={discountCapped ? `Hemat 50% (maks ${rupiah(35000)})` : 'Hemat 50%'}
                      value={`- ${rupiah(discount)}`}
                      valueClass="text-emerald-600 font-semibold"
                    />
                  )}
                  <Row label="Subtotal setelah diskon" value={rupiah(subtotal)} />
                  <Row label="Biaya jasa order" value={rupiah(serviceFee)} />
                </div>
                <div className="border-t border-ink-200 mt-2 pt-2 flex justify-between items-baseline">
                  <span className="font-semibold text-ink-900">Total</span>
                  <span className="font-bold text-xl text-ink-900">{rupiah(total)}</span>
                </div>

                <div className="hidden md:flex flex-col gap-2 mt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-ink-900 hover:bg-ink-800 disabled:bg-ink-300 text-white rounded-2xl px-4 py-3.5 active:scale-95 transition flex items-center justify-center gap-2 font-semibold text-sm"
                  >
                    {submitting ? <Icon.Spinner size={14} /> : <Icon.ArrowRight size={16} />}
                    Lanjut ke Pembayaran
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Yakin batalkan pesanan dan kosongkan keranjang?')) {
                        clear();
                        router.push('/');
                      }
                    }}
                    className="w-full bg-white border border-ink-200 hover:border-ink-900 text-ink-700 hover:text-ink-900 text-sm font-medium px-4 py-3 rounded-2xl transition"
                  >
                    Batalkan Pesanan
                  </button>
                </div>
              </section>
            </div>
          </aside>

          <div className="md:hidden fixed bottom-3 left-0 right-0 z-40">
            <div className="max-w-md mx-auto px-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Yakin batalkan pesanan dan kosongkan keranjang?')) {
                    clear();
                    router.push('/');
                  }
                }}
                className="bg-white border border-ink-200 text-ink-700 text-sm font-medium px-4 py-3.5 rounded-2xl hover:border-ink-900 active:scale-95 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-ink-900 hover:bg-ink-800 disabled:bg-ink-300 text-white rounded-2xl px-4 py-3.5 shadow-card active:scale-[.98] flex items-center justify-center gap-2 font-semibold text-sm transition"
              >
                {submitting ? <Icon.Spinner size={14} /> : <Icon.ArrowRight size={16} />}
                Lanjut Bayar
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function PickupOption({ active, onClick, icon, title, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'text-left rounded-2xl border p-3.5 transition active:scale-[.98] ' +
        (active
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-ink-200 bg-white hover:border-ink-400')
      }
    >
      <div className="flex items-center gap-2">
        <div
          className={
            'w-8 h-8 rounded-lg grid place-items-center ' +
            (active ? 'bg-white/15' : 'bg-ink-100 text-ink-700')
          }
        >
          {icon}
        </div>
        <p className={'text-sm font-semibold ' + (active ? 'text-white' : 'text-ink-900')}>
          {title}
        </p>
      </div>
      <p className={'text-[11px] mt-1.5 ' + (active ? 'text-white/70' : 'text-ink-500')}>{desc}</p>
    </button>
  );
}

function WhatsAppIcon() {
  return null;
}

function Field({ label, children, error, required, hint }) {
  return (
    <div>
      <label className="text-xs font-semibold text-ink-900 flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-[10px] text-ink-500 mt-0.5">{hint}</p>}
      <div className="mt-1.5">{children}</div>
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function Row({ label, value, valueClass = '' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className={valueClass || 'text-ink-900 font-medium'}>{value}</span>
    </div>
  );
}
