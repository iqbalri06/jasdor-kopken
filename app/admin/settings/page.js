'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Icon } from '@/components/Icons';

export default function AdminSettingsPage() {
  return (
    <AdminLayout title="Settings">
      <div className="space-y-4">
        <ServiceSection />
        <QRISSection />
      </div>
    </AdminLayout>
  );
}

function ServiceSection() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    setLoading(true);
    try {
      const res = await fetch('/api/service-status');
      const json = await res.json();
      if (json.error_code === 0) {
        setStatus(json.data);
        setMessage(json.data.message || '');
      }
    } catch (_) {}
    setLoading(false);
  }

  async function save(open) {
    setSaving(true);
    try {
      const pw = sessionStorage.getItem('admin-auth') || '';
      const res = await fetch('/api/service-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pw,
        },
        body: JSON.stringify({ open, message }),
      });
      const json = await res.json();
      if (json.error_code === 0) {
        setStatus({ ...json.data, updated_at: new Date().toISOString() });
        setToast(open ? 'Layanan dibuka' : 'Layanan ditutup');
        setTimeout(() => setToast(''), 1800);
      }
    } catch (_) {}
    setSaving(false);
  }

  return (
    <div className="rounded-3xl bg-white border border-ink-200 overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 grid place-items-center text-emerald-600">
          <Icon.Check size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink-900">Status Layanan</h2>
          <p className="text-[10px] text-ink-500">Buka/tutup jasa order</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {loading ? (
          <Icon.Spinner size={20} className="mx-auto text-ink-400" />
        ) : (
          <>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-50">
              <div
                className={
                  'w-10 h-10 rounded-xl grid place-items-center shrink-0 ' +
                  (status?.open ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600')
                }
              >
                {status?.open ? <Icon.Check size={20} /> : <Icon.Close size={20} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-ink-900">
                  {status?.open ? 'Layanan Buka' : 'Layanan Tutup'}
                </p>
                <p className="text-[10px] text-ink-500">
                  {status?.updated_at
                    ? `Diubah ${new Date(status.updated_at).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}`
                    : 'Belum pernah diubah'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => save(true)}
                disabled={saving || status?.open}
                className={
                  'py-3 rounded-2xl font-semibold text-sm transition active:scale-[.98] flex items-center justify-center gap-2 ' +
                  (status?.open
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100')
                }
              >
                {saving ? <Icon.Spinner size={14} /> : <Icon.Check size={16} />}
                Buka
              </button>
              <button
                onClick={() => save(false)}
                disabled={saving || !status?.open}
                className={
                  'py-3 rounded-2xl font-semibold text-sm transition active:scale-[.98] flex items-center justify-center gap-2 ' +
                  (!status?.open
                    ? 'bg-red-500 text-white'
                    : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100')
                }
              >
                {saving ? <Icon.Spinner size={14} /> : <Icon.Close size={16} />}
                Tutup
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-900">
                Pesan saat tutup
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="cth: Buka lagi besok jam 08:00"
                rows={2}
                className="w-full mt-1.5 bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-ink-900 focus:bg-white transition resize-none"
              />
              <button
                onClick={() => save(status?.open ?? true)}
                disabled={saving}
                className="mt-2 text-xs text-ink-700 bg-ink-100 hover:bg-ink-200 px-3 py-1.5 rounded-lg transition"
              >
                Simpan pesan
              </button>
            </div>
          </>
        )}
      </div>

      {toast && (
        <div className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="bg-ink-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-card fade-up">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function QRISSection() {
  const [qrisInput, setQrisInput] = useState('');
  const [qrisData, setQrisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const pw = sessionStorage.getItem('admin-auth') || '';
      const res = await fetch('/api/qris/info', {
        headers: { 'x-admin-password': pw },
      });
      const json = await res.json();
      if (json.error_code === 0 && json.data) {
        setQrisData(json.data);
        setQrisInput(json.data.qris || '');
      }
    } catch (_) {}
    setLoading(false);
  }

  async function save() {
    if (!qrisInput.trim()) {
      setMsg('String QRIS tidak boleh kosong');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      const pw = sessionStorage.getItem('admin-auth') || '';
      const res = await fetch('/api/qris', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pw,
        },
        body: JSON.stringify({ qris: qrisInput.trim() }),
      });
      const json = await res.json();
      if (json.error_code === 0) {
        setQrisData({ ...json.data, qris: qrisInput.trim() });
        setMsg('QRIS berhasil disimpan');
      } else {
        setMsg(json.msg || 'Gagal simpan');
      }
    } catch (e) {
      setMsg(e.message || 'Gagal simpan');
    }
    setSaving(false);
  }

  return (
    <div className="rounded-3xl bg-white border border-ink-200 overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-50 grid place-items-center text-accent-600">
          <Icon.Tag size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink-900">QRIS Pembayaran</h2>
          <p className="text-[10px] text-ink-500">QRIS statis → dinamis otomatis</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {loading ? (
          <Icon.Spinner size={20} className="mx-auto text-ink-400" />
        ) : (
          <>
            {qrisData?.merchantName && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 grid place-items-center text-emerald-600">
                  <Icon.Check size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-700">QRIS Aktif</p>
                  <p className="text-sm font-bold text-ink-900">{qrisData.merchantName}</p>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-ink-900">String QRIS</label>
              <textarea
                value={qrisInput}
                onChange={(e) => setQrisInput(e.target.value)}
                placeholder="00020101021126..."
                rows={3}
                className="w-full mt-1.5 bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-ink-900 focus:bg-white transition resize-none"
              />
            </div>

            {msg && (
              <p className={`text-xs font-medium ${msg.includes('berhasil') ? 'text-emerald-600' : 'text-red-600'}`}>
                {msg}
              </p>
            )}

            <button
              onClick={save}
              disabled={saving}
              className="w-full bg-ink-900 text-white text-sm font-semibold py-3.5 rounded-2xl hover:bg-ink-800 active:scale-[.98] transition disabled:bg-ink-300 flex items-center justify-center gap-2"
            >
              {saving ? <Icon.Spinner size={14} /> : null}
              Simpan QRIS
            </button>
          </>
        )}
      </div>
    </div>
  );
}
