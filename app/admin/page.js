'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { Icon } from '@/components/Icons';

function rupiah(n) {
  if (n == null || isNaN(n)) return 'Rp 0';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      <DashboardContent />
    </AdminLayout>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    done: 0,
    today: 0,
    revenue: 0,
  });
  const [recent, setRecent] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const pw = sessionStorage.getItem('admin-auth') || '';

    try {
      // Load orders
      const ordersRes = await fetch('/api/orders', {
        headers: { 'x-admin-password': pw },
      });
      const ordersJson = await ordersRes.json();
      if (ordersJson.error_code === 0) {
        const orders = ordersJson.data || [];
        const today = new Date().toDateString();

        setStats({
          pending: orders.filter((o) => o.status === 'pending').length,
          processing: orders.filter((o) => o.status === 'processing').length,
          done: orders.filter((o) => o.status === 'done').length,
          today: orders.filter(
            (o) => new Date(o.created_at).toDateString() === today
          ).length,
          revenue: orders
            .filter(
              (o) =>
                o.status !== 'cancelled' &&
                new Date(o.created_at).toDateString() === today
            )
            .reduce((sum, o) => sum + (o.data?.totalToPay || o.data?.total || 0), 0),
        });

        setRecent(orders.slice(0, 5));
      }

      // Load status
      const statusRes = await fetch('/api/service-status');
      const statusJson = await statusRes.json();
      if (statusJson.error_code === 0) {
        setStatus(statusJson.data);
      }
    } catch (_) {}

    setLoading(false);
  }

  async function toggleService() {
    const pw = sessionStorage.getItem('admin-auth') || '';
    try {
      const res = await fetch('/api/service-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pw,
        },
        body: JSON.stringify({
          open: !status?.open,
          message: status?.message || '',
        }),
      });
      const json = await res.json();
      if (json.error_code === 0) {
        setStatus({ ...json.data });
      }
    } catch (_) {}
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-32 rounded-3xl shimmer" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hero stats */}
      <div className="rounded-3xl bg-gradient-to-br from-ink-900 via-ink-800 to-accent-700 text-white p-5 md:p-6 overflow-hidden relative">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">
            Pendapatan Hari Ini
          </p>
          <p className="text-3xl md:text-4xl font-extrabold mt-1 tracking-tight">
            {rupiah(stats.revenue)}
          </p>
          <p className="text-xs opacity-80 mt-1">
            {stats.today} pesanan masuk hari ini
          </p>

          {/* Service status toggle */}
          <button
            onClick={toggleService}
            className="mt-4 w-full bg-white/15 backdrop-blur hover:bg-white/20 transition rounded-2xl px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={
                  'w-3 h-3 rounded-full ' +
                  (status?.open ? 'bg-emerald-400 animate-pulse' : 'bg-red-400')
                }
              />
              <div className="text-left">
                <p className="text-sm font-semibold">
                  {status?.open ? 'Layanan Buka' : 'Layanan Tutup'}
                </p>
                <p className="text-[10px] opacity-70">Klik untuk ubah</p>
              </div>
            </div>
            <Icon.ChevronRight size={16} className="opacity-70" />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          label="Menunggu"
          value={stats.pending}
          color="amber"
          icon={<Icon.Clock size={16} />}
        />
        <StatCard
          label="Diproses"
          value={stats.processing}
          color="blue"
          icon={<Icon.Bolt size={16} />}
        />
        <StatCard
          label="Selesai"
          value={stats.done}
          color="emerald"
          icon={<Icon.Check size={16} />}
        />
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl bg-white border border-ink-200 p-4">
        <p className="text-xs font-semibold text-ink-900 mb-3">Aksi Cepat</p>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/admin/orders"
            className="rounded-xl bg-ink-50 hover:bg-ink-100 p-3 flex items-center gap-3 transition active:scale-[.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 grid place-items-center text-blue-600">
              <Icon.Receipt size={18} />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-ink-900">Pesanan</p>
              <p className="text-[10px] text-ink-500">{stats.pending} menunggu</p>
            </div>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="rounded-xl bg-ink-50 hover:bg-ink-100 p-3 flex items-center gap-3 transition active:scale-[.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 grid place-items-center text-emerald-600">
              <Icon.ExternalLink size={18} />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-ink-900">Lihat Web</p>
              <p className="text-[10px] text-ink-500">Halaman user</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl bg-white border border-ink-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
          <p className="text-xs font-semibold text-ink-900">Pesanan Terbaru</p>
          <Link
            href="/admin/orders"
            className="text-[11px] text-ink-500 hover:text-ink-900 transition inline-flex items-center gap-1"
          >
            Lihat semua <Icon.ChevronRight size={10} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-6 text-center">
            <Icon.Receipt size={28} className="mx-auto text-ink-300 mb-2" />
            <p className="text-xs text-ink-500">Belum ada pesanan</p>
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {recent.map((order) => (
              <Link
                key={order.id}
                href={`/order/${order.id}`}
                className="flex items-center gap-3 p-3 hover:bg-ink-50 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-ink-100 overflow-hidden shrink-0">
                  {order.data?.items?.[0]?.image || order.data?.items?.[0]?.m ? (
                    <img
                      src={order.data.items[0].image || order.data.items[0].m}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-ink-400">
                      <Icon.Coffee size={16} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">
                    {order.id}
                  </p>
                  <p className="text-[11px] text-ink-500 truncate">
                    {order.data?.customer?.name || '-'} •{' '}
                    {(order.data?.items || []).reduce((a, b) => a + (b.qty || 0), 0)} item
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-ink-900">
                    {rupiah(order.data?.totalToPay || order.data?.total)}
                  </p>
                  <StatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  const colors = {
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <div className="rounded-2xl bg-white border border-ink-200 p-3">
      <div className={'w-8 h-8 rounded-lg grid place-items-center ' + (colors[color] || colors.amber)}>
        {icon}
      </div>
      <p className="text-2xl font-extrabold text-ink-900 mt-2">{value}</p>
      <p className="text-[10px] text-ink-500 font-medium">{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Menunggu', cls: 'bg-amber-100 text-amber-700' },
    processing: { label: 'Proses', cls: 'bg-blue-100 text-blue-700' },
    done: { label: 'Selesai', cls: 'bg-emerald-100 text-emerald-700' },
    cancelled: { label: 'Batal', cls: 'bg-red-100 text-red-700' },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-semibold mt-0.5 ${s.cls}`}>
      {s.label}
    </span>
  );
}
