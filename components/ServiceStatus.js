'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from './Icons';

const ServiceContext = createContext({ open: true, message: '' });

export function ServiceStatusProvider({ children }) {
  const [status, setStatus] = useState({ open: true, message: '' });

  useEffect(() => {
    let cancel = false;
    async function check() {
      try {
        const res = await fetch('/api/service-status', { cache: 'no-store' });
        const json = await res.json();
        if (!cancel && json.error_code === 0) {
          setStatus(json.data);
        }
      } catch (_) {
        // Default buka jika gagal fetch
      }
    }
    check();
    // Re-check setiap 30 detik
    const interval = setInterval(check, 30000);
    return () => {
      cancel = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <ServiceContext.Provider value={status}>{children}</ServiceContext.Provider>
  );
}

export function useServiceStatus() {
  return useContext(ServiceContext);
}

export function ServiceClosedBanner({ children }) {
  const { open, message } = useServiceStatus();
  const pathname = usePathname();

  // Jangan block halaman admin
  const isAdmin = pathname?.startsWith('/admin');

  if (!open && !isAdmin) {
    return <ClosedPage message={message} />;
  }

  return children || null;
}

function ClosedPage({ message }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-50 to-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-accent-100/40 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full bg-ink-200/30 blur-3xl" />
      </div>

      <div className="relative max-w-sm w-full text-center">
        {/* Animated icon */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-ink-900/5 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 rounded-full bg-ink-900/10" />
          <div className="absolute inset-0 w-28 h-28 rounded-full bg-gradient-to-br from-ink-900 to-accent-700 grid place-items-center text-white shadow-xl">
            <Icon.Coffee size={44} />
          </div>
        </div>

        {/* Logo */}
        <div className="w-12 h-12 mx-auto rounded-xl bg-white border border-ink-200 overflow-hidden shadow-soft mb-4">
          <img
            src="https://cdn.kopikenangan.com/image/new_home/kopi-kenangan-v2.png"
            alt="Kopi Kenangan"
            className="w-full h-full object-contain p-1.5"
          />
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-ink-900 tracking-tight">
          Sedang Istirahat
        </h1>
        <p className="text-sm md:text-base text-ink-600 mt-3 leading-relaxed max-w-xs mx-auto">
          {message || 'Layanan jasa order sedang tutup sementara. Kami akan kembali secepatnya.'}
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-ink-200" />
          <span className="text-[10px] text-ink-400 uppercase tracking-wider font-semibold">Ada pertanyaan?</span>
          <div className="flex-1 h-px bg-ink-200" />
        </div>

        {/* CTA */}
        <a
          href="https://wa.me/6281291544061"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-7 py-4 rounded-2xl transition active:scale-[.97] shadow-lg shadow-emerald-500/20"
        >
          <Icon.WhatsApp size={20} />
          Hubungi Admin via WhatsApp
        </a>

        <p className="text-xs text-ink-500 mt-4">
          0812-9154-4061
        </p>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-ink-200">
          <p className="text-[11px] text-ink-400">
            Jasa Order Kopi Kenangan
          </p>
        </div>
      </div>
    </div>
  );
}
