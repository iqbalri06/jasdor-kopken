'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Icon } from '@/components/Icons';

export default function AdminSettingsPage() {
  return (
    <AdminLayout title="Settings">
      <div className="space-y-4">
        <ServiceSection />
        <ServiceFeeSection />
        <DeliverySection />
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

function ServiceFeeSection() {
  const [fee, setFee] = useState('');
  const [savedFee, setSavedFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/service-fee');
      const json = await res.json();
      if (json.error_code === 0) {
        setFee(String(json.data.fee || 0));
        setSavedFee(json.data.fee);
      }
    } catch (_) {}
    setLoading(false);
  }

  async function save() {
    const val = Math.max(0, Math.floor(Number(fee) || 0));
    setSaving(true);
    setMsg('');
    try {
      const pw = sessionStorage.getItem('admin-auth') || '';
      const res = await fetch('/api/service-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pw,
        },
        body: JSON.stringify({ fee: val }),
      });
      const json = await res.json();
      if (json.error_code === 0) {
        setSavedFee(val);
        setMsg('Fee berhasil disimpan');
      } else {
        setMsg(json.msg || 'Gagal simpan');
      }
    } catch (e) {
      setMsg(e.message || 'Gagal simpan');
    }
    setSaving(false);
  }

  function rupiah(n) {
    return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  }

  return (
    <div className="rounded-3xl bg-white border border-ink-200 overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 grid place-items-center text-blue-600">
          <Icon.Receipt size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink-900">Biaya Jasa Order</h2>
          <p className="text-[10px] text-ink-500">Atur fee yang dikenakan tiap pesanan</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {loading ? (
          <Icon.Spinner size={20} className="mx-auto text-ink-400" />
        ) : (
          <>
            {/* Current fee */}
            <div className="rounded-xl bg-ink-50 border border-ink-200 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white grid place-items-center text-ink-700 shrink-0">
                <Icon.Tag size={16} />
              </div>
              <div>
                <p className="text-xs text-ink-500">Fee saat ini</p>
                <p className="text-lg font-bold text-ink-900 tracking-tight">
                  {rupiah(savedFee)}
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-900">Fee Baru</label>
              <p className="text-[10px] text-ink-500 mt-0.5">
                Nominal dalam Rupiah, tanpa titik atau koma.
              </p>
              <div className="mt-1.5 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-500">
                  Rp
                </span>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="7000"
                  inputMode="numeric"
                  className="w-full bg-ink-50 border border-ink-200 rounded-xl pl-12 pr-4 py-3 text-base font-bold outline-none focus:border-ink-900 focus:bg-white transition"
                />
              </div>

              {/* Quick presets */}
              <div className="flex gap-2 mt-2">
                {[5000, 7000, 10000, 15000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFee(String(v))}
                    className="text-xs bg-white border border-ink-200 hover:border-ink-900 text-ink-700 px-3 py-1.5 rounded-lg transition"
                  >
                    {rupiah(v)}
                  </button>
                ))}
              </div>
            </div>

            {msg && (
              <p
                className={`text-xs font-medium ${
                  msg.includes('berhasil') ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {msg}
              </p>
            )}

            <button
              onClick={save}
              disabled={saving || Number(fee) === savedFee}
              className="w-full bg-ink-900 text-white text-sm font-semibold py-3.5 rounded-2xl hover:bg-ink-800 active:scale-[.98] transition disabled:bg-ink-300 flex items-center justify-center gap-2"
            >
              {saving ? <Icon.Spinner size={14} /> : null}
              Simpan Fee
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function DeliverySection() {
  const [config, setConfig] = useState({ enabled: false, fee: 10000, outlets: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Search outlet untuk add
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery-config');
      const json = await res.json();
      if (json.error_code === 0) setConfig(json.data);
    } catch (_) {}
    setLoading(false);
  }

  async function save(newConfig) {
    setSaving(true);
    setMsg('');
    try {
      const pw = sessionStorage.getItem('admin-auth') || '';
      const res = await fetch('/api/delivery-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pw,
        },
        body: JSON.stringify(newConfig),
      });
      const json = await res.json();
      if (json.error_code === 0) {
        setConfig(json.data);
        setMsg('Konfigurasi tersimpan');
        setTimeout(() => setMsg(''), 1800);
      } else {
        setMsg(json.msg || 'Gagal simpan');
      }
    } catch (e) {
      setMsg(e.message || 'Gagal simpan');
    }
    setSaving(false);
  }

  async function searchOutlets() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/stores?query=${encodeURIComponent(searchQuery)}&page_size=10`);
      const json = await res.json();
      if (json.error_code === 0) {
        setSearchResults(json.data?.store || []);
      }
    } catch (_) {}
    setSearching(false);
  }

  function addOutlet(store) {
    if (config.outlets.includes(store.code)) return;
    const newConfig = {
      ...config,
      outlets: [...config.outlets, store.code],
      _meta: {
        ...(config._meta || {}),
        [store.code]: { name: store.name, address: store.address },
      },
    };
    save(newConfig);
    setSearchQuery('');
    setSearchResults([]);
  }

  function removeOutlet(code) {
    const newConfig = {
      ...config,
      outlets: config.outlets.filter((c) => c !== code),
    };
    save(newConfig);
  }

  function updateFee(fee) {
    save({ ...config, fee: Math.max(0, Math.floor(Number(fee) || 0)) });
  }

  function toggleEnabled() {
    save({ ...config, enabled: !config.enabled });
  }

  function rupiah(n) {
    return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  }

  const outletMeta = config._meta || {};

  return (
    <div className="rounded-3xl bg-white border border-ink-200 overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 grid place-items-center text-orange-600">
          <Icon.Pin size={18} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-ink-900">Layanan Delivery</h2>
          <p className="text-[10px] text-ink-500">Atur outlet & biaya delivery</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {loading ? (
          <Icon.Spinner size={20} className="mx-auto text-ink-400" />
        ) : (
          <>
            {/* Toggle */}
            <button
              onClick={toggleEnabled}
              disabled={saving}
              className={
                'w-full rounded-xl border-2 p-3 flex items-center gap-3 transition active:scale-[.98] ' +
                (config.enabled
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-amber-300 bg-amber-50 hover:border-amber-500')
              }
            >
              <div
                className={
                  'w-10 h-10 rounded-xl grid place-items-center shrink-0 ' +
                  (config.enabled ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white')
                }
              >
                {config.enabled ? <Icon.Check size={18} strokeWidth={3} /> : <Icon.Close size={18} strokeWidth={3} />}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-ink-900">
                  {config.enabled ? 'Delivery Aktif' : 'Delivery Nonaktif — Klik untuk aktifkan'}
                </p>
                <p className="text-[10px] text-ink-500">
                  {config.enabled
                    ? `User bisa pilih delivery di ${config.outlets.length} outlet terdaftar`
                    : 'Toggle untuk aktifkan layanan delivery'}
                </p>
              </div>
            </button>

            {/* Fee */}
            <div>
              <label className="text-xs font-semibold text-ink-900">Biaya Delivery</label>
              <p className="text-[10px] text-ink-500 mt-0.5">Berlaku flat untuk semua outlet</p>
              <div className="mt-1.5 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-500">
                  Rp
                </span>
                <input
                  type="number"
                  value={config.fee}
                  onChange={(e) =>
                    setConfig({ ...config, fee: Number(e.target.value) || 0 })
                  }
                  onBlur={() => updateFee(config.fee)}
                  placeholder="10000"
                  inputMode="numeric"
                  className="w-full bg-ink-50 border border-ink-200 rounded-xl pl-12 pr-4 py-3 text-base font-bold outline-none focus:border-ink-900 focus:bg-white transition"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[5000, 10000, 15000, 20000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => updateFee(v)}
                    className="text-xs bg-white border border-ink-200 hover:border-ink-900 text-ink-700 px-3 py-1.5 rounded-lg transition"
                  >
                    {rupiah(v)}
                  </button>
                ))}
              </div>
            </div>

            {/* Outlets */}
            <div>
              <label className="text-xs font-semibold text-ink-900">
                Outlet yang Mendukung Delivery
              </label>
              <p className="text-[10px] text-ink-500 mt-0.5">
                {config.outlets.length} outlet aktif
              </p>

              {/* List outlet aktif */}
              {config.outlets.length > 0 && (
                <div className="mt-2 space-y-2">
                  {config.outlets.map((code) => {
                    const meta = outletMeta[code];
                    return (
                      <div
                        key={code}
                        className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 grid place-items-center text-emerald-600 shrink-0">
                          <Icon.Pin size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-ink-900 truncate">
                            {meta?.name || code}
                          </p>
                          <p className="text-[10px] text-ink-500 font-mono truncate">{code}</p>
                        </div>
                        <button
                          onClick={() => removeOutlet(code)}
                          className="text-red-500 hover:text-red-700 p-1"
                          aria-label="Hapus"
                        >
                          <Icon.Trash size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add outlet */}
              <div className="mt-3 rounded-xl bg-ink-50 border border-ink-200 p-3 space-y-2">
                <p className="text-[11px] font-semibold text-ink-900">Tambah Outlet</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchOutlets()}
                    placeholder="Cari outlet..."
                    className="flex-1 bg-white border border-ink-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-ink-900"
                  />
                  <button
                    onClick={searchOutlets}
                    disabled={searching || !searchQuery.trim()}
                    className="bg-ink-900 text-white text-xs font-semibold px-4 py-2 rounded-lg disabled:bg-ink-300 transition"
                  >
                    {searching ? <Icon.Spinner size={12} /> : 'Cari'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin pt-1">
                    {searchResults.map((s) => {
                      const added = config.outlets.includes(s.code);
                      return (
                        <button
                          key={s.id}
                          onClick={() => !added && addOutlet(s)}
                          disabled={added}
                          className={
                            'w-full text-left rounded-lg border p-2.5 flex items-center gap-2 transition ' +
                            (added
                              ? 'border-emerald-300 bg-emerald-50 cursor-default'
                              : 'border-ink-200 bg-white hover:border-ink-900 active:scale-[.98]')
                          }
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-ink-900 truncate">
                              {s.name}
                            </p>
                            <p className="text-[10px] text-ink-500 truncate">{s.address}</p>
                          </div>
                          {added ? (
                            <Icon.Check size={14} className="text-emerald-600 shrink-0" />
                          ) : (
                            <Icon.Plus size={14} className="text-ink-700 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {msg && (
              <p
                className={`text-xs font-medium ${
                  msg.includes('tersimpan') ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {msg}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
