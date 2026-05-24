'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCart } from '@/components/CartContext';

const POPULAR = ['Rancamaya', 'Bogor', 'Jakarta', 'Bandung', 'Depok', 'Bekasi'];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [stores, setStores] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);

  const { setStore } = useCart();

  async function search(q, pageIndex = 1, append = false) {
    if (!q.trim()) return;
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await fetch(
        `/api/stores?query=${encodeURIComponent(q)}&page_index=${pageIndex}&page_size=20`
      );
      const json = await res.json();
      if (json.error_code !== 0) throw new Error(json.msg || 'Gagal memuat data');
      const newStores = json.data?.store || [];
      setStores((prev) => (append ? [...prev, ...newStores] : newStores));
      setBrands(json.data?.all_brand_and_image || []);
      setPage(json.data?.page_index || pageIndex);
      setTotalPages(json.data?.pages || 1);
      setTotalStores(json.data?.total || newStores.length);
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan');
      if (!append) setStores([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    search(query, 1, false);
  }

  function loadMore() {
    if (page < totalPages && !loadingMore) {
      search(query, page + 1, true);
    }
  }

  return (
    <main className="pb-24">
      <Header title="Jasa Order Kopi Kenangan" subtitle="Iqbal Roudatul" />

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* HERO */}
        <section className="pt-6 md:pt-12">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-ink-700 bg-ink-100 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Diskon 50% • Maks Rp 35.000
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-ink-900 leading-[1.1] mt-4">
                Pesan kopi
                <br />
                <span className="text-accent-500">tanpa ribet.</span>
              </h2>
              <p className="text-sm md:text-base text-ink-600 mt-4 max-w-md leading-relaxed">
                Cari outlet Kopi Kenangan terdekat, pilih menu favoritmu, dan kirim pesanan langsung ke admin lewat WhatsApp.
              </p>

              <form
                onSubmit={onSubmit}
                className="mt-6 flex items-center gap-2 bg-white border border-ink-200 rounded-2xl p-1.5 pl-4 shadow-soft hover:border-ink-400 focus-within:border-ink-900 transition max-w-md"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari outlet, contoh: rancamaya"
                  className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none py-2"
                />
                <button
                  type="submit"
                  className="bg-ink-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-ink-800 active:scale-95 transition"
                >
                  Cari
                </button>
              </form>

              {/* Quick chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-ink-500 self-center mr-1">Populer:</span>
                {POPULAR.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setQuery(p);
                      search(p, 1, false);
                    }}
                    className="text-xs bg-white border border-ink-200 px-3 py-1.5 rounded-full hover:border-ink-900 hover:bg-ink-900 hover:text-white text-ink-700 transition"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="order-first md:order-last hidden md:block">
              <div className="relative aspect-[4/3] md:aspect-square rounded-3xl bg-gradient-to-br from-ink-900 via-ink-800 to-accent-700 overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-[10rem] md:text-[14rem] leading-none drop-shadow-2xl">☕</div>
                </div>
                {/* Floating cards */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-card hidden sm:block">
                  <p className="text-[10px] text-ink-500 font-medium">Hemat hingga</p>
                  <p className="text-base font-bold text-ink-900">Rp 35.000</p>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-card flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 grid place-items-center text-white text-sm">
                    ⚡
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-500 font-medium leading-none">Cepat & Mudah</p>
                    <p className="text-xs font-semibold text-ink-900 mt-0.5">via WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        {!searched && (
          <section className="mt-10 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <Benefit
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12" />
                  <rect x="2" y="7" width="20" height="5" />
                  <line x1="12" y1="22" x2="12" y2="7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
              }
              title="Diskon 50%"
              desc="Maksimal potongan Rp 35.000 setiap pesanan."
            />
            <Benefit
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              }
              title="Cepat & Mudah"
              desc="Pesan dalam beberapa klik, kirim langsung via WhatsApp."
            />
            <Benefit
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              }
              title="Banyak Outlet"
              desc="Tersedia di berbagai kota di Indonesia."
            />
          </section>
        )}

        {/* BRANDS */}
        {brands.length > 0 && (
          <section className="mt-10">
            <p className="text-xs font-semibold text-ink-500 mb-3 uppercase tracking-wider">
              Brand tersedia
            </p>
            <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-1">
              {brands.map((b) => (
                <div
                  key={b.brand_code}
                  className="shrink-0 w-20 md:w-24 flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border border-ink-200 flex items-center justify-center overflow-hidden hover:border-ink-400 transition">
                    <img
                      src={b.url}
                      alt={b.brand_name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <span className="text-[10px] md:text-xs text-center text-ink-700 line-clamp-2 leading-tight">
                    {b.brand_name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RESULTS */}
        <section className="mt-10">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-ink-900">
              {searched ? `Hasil untuk "${query}"` : 'Mulai dengan mencari outlet'}
            </h3>
            {!loading && stores.length > 0 && (
              <span className="text-xs text-ink-500">
                {stores.length} dari {totalStores} outlet
              </span>
            )}
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-2xl shimmer" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && searched && stores.length === 0 && (
            <div className="rounded-2xl bg-white border border-ink-200 p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-ink-100 grid place-items-center mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-ink-900">Outlet tidak ditemukan</p>
              <p className="text-xs text-ink-500 mt-1">
                Coba kata kunci lain seperti nama daerah atau kota.
              </p>
            </div>
          )}

          {!loading && stores.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {stores.map((s) => (
                  <StoreCard key={s.id} store={s} onSelect={() => setStore(s)} />
                ))}
              </div>

              {page < totalPages && (
                <div className="mt-5 flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-white border border-ink-200 hover:border-ink-900 text-ink-900 text-sm font-semibold px-6 py-3 rounded-2xl transition disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Memuat...
                      </>
                    ) : (
                      <>
                        Muat {Math.min(20, totalStores - stores.length)} outlet lagi
                        <span className="text-ink-500 text-xs">
                          ({stores.length}/{totalStores})
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function Benefit({ icon, title, desc }) {
  return (
    <div className="rounded-2xl bg-white border border-ink-200 p-5 hover:border-ink-400 transition group">
      <div className="w-10 h-10 rounded-xl bg-ink-900 text-white grid place-items-center group-hover:bg-accent-500 transition">
        {icon}
      </div>
      <p className="text-sm font-semibold text-ink-900 mt-3">{title}</p>
      <p className="text-xs text-ink-500 mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}

function StoreCard({ store, onSelect }) {
  return (
    <Link
      href={`/menu/${store.code}`}
      onClick={onSelect}
      className="group block rounded-2xl bg-white border border-ink-200 overflow-hidden hover:border-ink-900 hover:shadow-card transition fade-up"
    >
      <div className="flex gap-3 p-3">
        <div className="w-24 h-24 rounded-xl bg-ink-100 overflow-hidden shrink-0">
          {store.image_url ? (
            <img
              src={store.image_url}
              alt={store.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">☕</div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm md:text-base text-ink-900 truncate">
              {store.name}
            </h3>
            {store.is_open ? (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                Buka
              </span>
            ) : (
              <span className="text-[10px] bg-ink-100 text-ink-600 px-2 py-0.5 rounded-full font-medium">
                Tutup
              </span>
            )}
          </div>
          <p className="text-[11px] md:text-xs text-ink-500 mt-1 line-clamp-2">{store.address}</p>
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="text-[11px] text-ink-500 inline-flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {store.open?.slice(0, 5)} - {store.close?.slice(0, 5)}
            </span>
            <span className="text-xs font-semibold text-ink-900 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Pesan <span>→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
