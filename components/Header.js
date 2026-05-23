'use client';

import Link from 'next/link';
import { useCart } from './CartContext';

export default function Header({ title, subtitle, back, showCart = true }) {
  const { totalQty } = useCart();

  return (
    <header className="sticky top-0 z-30 glass border-b border-ink-200">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {back && (
            <Link
              href={back}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-ink-100 active:scale-95 transition shrink-0"
              aria-label="Kembali"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
          )}

          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-ink-900 grid place-items-center shrink-0">
              <span className="text-white text-base">☕</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink-500 font-semibold leading-none">
                {subtitle || 'Iqbal'}
              </p>
              <h1 className="text-sm md:text-base font-semibold text-ink-900 truncate leading-tight mt-0.5">
                {title || 'Jasa Order Kopi Kenangan'}
              </h1>
            </div>
          </Link>
        </div>

        {showCart && (
          <Link
            href="/cart"
            className="relative w-11 h-11 flex items-center justify-center rounded-full bg-ink-900 text-white hover:bg-ink-800 active:scale-95 transition shrink-0"
            aria-label="Keranjang"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            {totalQty > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-400 text-ink-900 text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-bold border-2 border-ink-50">
                {totalQty}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
