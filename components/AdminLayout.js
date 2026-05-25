'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from './Icons';

export default function AdminLayout({ children, title = 'Admin' }) {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const pw = sessionStorage.getItem('admin-auth');
    if (pw) {
      setAuthed(true);
    } else {
      router.replace('/admin/login');
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <main className="min-h-screen bg-ink-50 grid place-items-center">
        <Icon.Spinner size={24} className="text-ink-400" />
      </main>
    );
  }

  if (!authed) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-ink-50 to-white pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-20 glass border-b border-ink-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ink-900 grid place-items-center text-white">
              <Icon.Coffee size={14} />
            </div>
            <span className="text-sm font-bold text-ink-900">{title}</span>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('admin-auth');
              router.replace('/admin/login');
            }}
            className="text-xs text-ink-500 hover:text-ink-900 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">{children}</div>

      {/* Bottom Navigation */}
      <BottomNav pathname={pathname} />
    </main>
  );
}

function BottomNav({ pathname }) {
  const items = [
    { href: '/admin', label: 'Beranda', icon: Icon.Coffee },
    { href: '/admin/orders', label: 'Pesanan', icon: Icon.Receipt },
    { href: '/admin/settings', label: 'Settings', icon: Icon.Tag },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-ink-200 safe-area-bottom">
      <div className="max-w-lg mx-auto px-2 py-1.5">
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname?.startsWith(item.href);
            const I = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  'flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition active:scale-95 ' +
                  (active ? 'text-ink-900' : 'text-ink-400 hover:text-ink-700')
                }
              >
                <div
                  className={
                    'w-10 h-10 rounded-2xl grid place-items-center transition ' +
                    (active ? 'bg-ink-900 text-white' : 'bg-transparent')
                  }
                >
                  <I size={18} />
                </div>
                <span className={'text-[10px] font-semibold ' + (active ? '' : '')}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
