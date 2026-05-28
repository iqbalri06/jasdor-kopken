'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Icon } from '@/components/Icons';

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <AdminLayout title="Settings">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Settings</h1>
          <p className="text-xs text-ink-500 mt-0.5">Atur layanan, pembayaran, dan pengaturan lain</p>
        </div>

        <SettingItem
          icon={<Icon.Check size={20} />}
          iconBg="bg-emerald-50 text-emerald-600"
          title="Status Layanan"
          desc="Buka atau tutup jasa order"
          onClick={() => setActiveSection('service')}
        />

        <SettingItem
          icon={<Icon.Receipt size={20} />}
          iconBg="bg-blue-50 text-blue-600"
          title="Biaya Jasa Order"
          desc="Atur fee tiap pesanan"
          onClick={() => setActiveSection('fee')}
        />

        <SettingItem
          icon={<Icon.Pin size={20} />}
          iconBg="bg-orange-50 text-orange-600"
          title="Layanan Delivery"
          desc="Outlet & biaya delivery"
          onClick={() => setActiveSection('delivery')}
        />

        <SettingItem
          icon={<Icon.Tag size={20} />}
          iconBg="bg-accent-50 text-accent-600"
          title="QRIS Pembayaran"
          desc="Upload QRIS statis"
          onClick={() => setActiveSection('qris')}
        />

        <SettingItem
          icon={<Icon.Coffee size={20} />}
          iconBg="bg-emerald-50 text-emerald-600"
          title="Testimoni"
          desc="Upload foto testimoni pelanggan"
          onClick={() => setActiveSection('testimonials')}
        />

        <SettingItem
          icon={<Icon.Gift size={20} />}
          iconBg="bg-accent-50 text-accent-600"
          title="Program Referral"
          desc="Atur reward & minimum penarikan"
          onClick={() => setActiveSection('referral')}
        />

        <SettingItem
          icon={<Icon.ArrowRight size={20} />}
          iconBg="bg-amber-50 text-amber-700"
          title="Penarikan Saldo"
          desc="Kelola request withdrawal"
          onClick={() => setActiveSection('withdrawals')}
        />

        <SettingItem
          icon={<Icon.AlertTriangle size={20} />}
          iconBg="bg-red-50 text-red-600"
          title="Review Anti-Fraud"
          desc="Referral mencurigakan butuh review"
          onClick={() => setActiveSection('flagged')}
        />
      </div>

      {/* Modal sections */}
      {activeSection === 'service' && (
        <SectionModal title="Status Layanan" onClose={() => setActiveSection(null)}>
          <ServiceSection />
        </SectionModal>
      )}
      {activeSection === 'fee' && (
        <SectionModal title="Biaya Jasa Order" onClose={() => setActiveSection(null)}>
          <ServiceFeeSection />
        </SectionModal>
      )}
      {activeSection === 'delivery' && (
        <SectionModal title="Layanan Delivery" onClose={() => setActiveSection(null)}>
          <DeliverySection />
        </SectionModal>
      )}
      {activeSection === 'qris' && (
        <SectionModal title="QRIS Pembayaran" onClose={() => setActiveSection(null)}>
          <QRISSection />
        </SectionModal>
      )}
      {activeSection === 'testimonials' && (
        <SectionModal title="Testimoni" onClose={() => setActiveSection(null)}>
          <TestimonialsSection />
        </SectionModal>
      )}
      {activeSection === 'referral' && (
        <SectionModal title="Program Referral" onClose={() => setActiveSection(null)}>
          <ReferralConfigSection />
        </SectionModal>
      )}
      {activeSection === 'withdrawals' && (
        <SectionModal title="Penarikan Saldo" onClose={() => setActiveSection(null)}>
          <WithdrawalsSection />
        </SectionModal>
      )}
      {activeSection === 'flagged' && (
        <SectionModal title="Review Anti-Fraud" onClose={() => setActiveSection(null)}>
          <FlaggedReferralsSection />
        </SectionModal>
      )}
    </AdminLayout>
  );
}

function SettingItem({ icon, iconBg, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl bg-white border border-ink-200 p-3 flex items-center gap-3 hover:border-ink-900 hover:shadow-card transition active:scale-[.99] text-left"
    >
      <div className={'w-11 h-11 rounded-xl grid place-items-center shrink-0 ' + iconBg}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ink-900">{title}</p>
        <p className="text-[11px] text-ink-500 mt-0.5">{desc}</p>
      </div>
      <Icon.ChevronRight size={16} className="text-ink-400 shrink-0" />
    </button>
  );
}

function SectionModal({ title, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-lg max-h-[92vh] bg-ink-50 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col fade-up overflow-hidden">
        <div className="bg-white border-b border-ink-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-ink-100 grid place-items-center"
            aria-label="Tutup"
          >
            <Icon.ChevronLeft size={20} />
          </button>
          <h2 className="flex-1 text-base font-bold text-ink-900">{title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

/* ============== SECTIONS ============== */

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
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
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

  if (loading) return <Icon.Spinner size={20} className="mx-auto mt-8 text-ink-400" />;

  return (
    <div className="space-y-4">
      <div
        className={
          'rounded-2xl p-5 text-center text-white relative overflow-hidden ' +
          (status?.open
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : 'bg-gradient-to-br from-red-500 to-red-600')
        }
      >
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/15 blur-2xl" />
        <div className="relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur grid place-items-center mb-3">
            {status?.open ? <Icon.Check size={28} strokeWidth={3} /> : <Icon.Close size={28} strokeWidth={3} />}
          </div>
          <p className="text-2xl font-extrabold">{status?.open ? 'Layanan Buka' : 'Layanan Tutup'}</p>
          <p className="text-xs opacity-90 mt-1">
            {status?.open ? 'Pelanggan bisa memesan' : 'Pelanggan tidak bisa memesan'}
          </p>
          {status?.updated_at && (
            <p className="text-[10px] opacity-70 mt-2">
              Diubah {new Date(status.updated_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => save(true)}
            disabled={saving || status?.open}
            className={
              'py-3.5 rounded-xl font-bold text-sm transition active:scale-95 flex items-center justify-center gap-2 ' +
              (status?.open
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100')
            }
          >
            {saving ? <Icon.Spinner size={14} /> : <Icon.Check size={14} strokeWidth={3} />}
            Buka
          </button>
          <button
            onClick={() => save(false)}
            disabled={saving || !status?.open}
            className={
              'py-3.5 rounded-xl font-bold text-sm transition active:scale-95 flex items-center justify-center gap-2 ' +
              (!status?.open
                ? 'bg-red-500 text-white'
                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100')
            }
          >
            {saving ? <Icon.Spinner size={14} /> : <Icon.Close size={14} strokeWidth={3} />}
            Tutup
          </button>
        </div>

        <div>
          <label className="text-xs font-bold text-ink-900">Pesan Saat Tutup</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="cth: Buka lagi besok jam 08:00"
            rows={2}
            className="w-full mt-1.5 bg-ink-50 border border-ink-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-ink-900 focus:bg-white transition resize-none"
          />
          <button
            onClick={() => save(status?.open ?? true)}
            disabled={saving}
            className="mt-2 text-xs font-semibold text-ink-700 bg-ink-100 hover:bg-ink-200 px-3 py-1.5 rounded-lg transition"
          >
            Simpan pesan
          </button>
        </div>
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
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify({ fee: val }),
      });
      const json = await res.json();
      if (json.error_code === 0) {
        setSavedFee(val);
        setMsg('Fee berhasil disimpan');
      }
    } catch (_) {
      setMsg('Gagal simpan');
    }
    setSaving(false);
  }

  if (loading) return <Icon.Spinner size={20} className="mx-auto mt-8 text-ink-400" />;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-5 text-white text-center">
        <p className="text-xs uppercase tracking-wider opacity-80 font-bold">Fee Saat Ini</p>
        <p className="text-3xl font-extrabold mt-1">{rupiah(savedFee)}</p>
      </div>

      <div className="rounded-2xl bg-white p-4 space-y-3">
        <div>
          <label className="text-xs font-bold text-ink-900">Fee Baru</label>
          <div className="mt-1.5 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-500">Rp</span>
            <input
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="7000"
              inputMode="numeric"
              className="w-full bg-ink-50 border border-ink-200 rounded-xl pl-12 pr-4 py-3 text-base font-bold outline-none focus:border-ink-900 focus:bg-white transition"
            />
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {[5000, 7000, 10000, 15000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setFee(String(v))}
                className="text-xs font-semibold bg-ink-100 hover:bg-ink-200 text-ink-700 px-3 py-1.5 rounded-lg transition"
              >
                {rupiah(v)}
              </button>
            ))}
          </div>
        </div>

        {msg && (
          <p className={`text-xs font-semibold ${msg.includes('berhasil') ? 'text-emerald-600' : 'text-red-600'}`}>
            {msg}
          </p>
        )}

        <button
          onClick={save}
          disabled={saving || Number(fee) === savedFee}
          className="w-full bg-ink-900 text-white text-sm font-bold py-3.5 rounded-xl hover:bg-ink-800 active:scale-[.98] transition disabled:bg-ink-300 flex items-center justify-center gap-2"
        >
          {saving ? <Icon.Spinner size={14} /> : null}
          Simpan Fee
        </button>
      </div>
    </div>
  );
}

function DeliverySection() {
  const [config, setConfig] = useState({ enabled: false, fee: 10000, outlets: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch('/api/delivery-config');
      const json = await res.json();
      if (json.error_code === 0) setConfig(json.data);
    } catch (_) {}
    setLoading(false);
  }

  async function save(newConfig) {
    setSaving(true);
    try {
      const pw = sessionStorage.getItem('admin-auth') || '';
      const res = await fetch('/api/delivery-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify(newConfig),
      });
      const json = await res.json();
      if (json.error_code === 0) {
        setConfig(json.data);
        setMsg('Tersimpan');
        setTimeout(() => setMsg(''), 1500);
      }
    } catch (_) {}
    setSaving(false);
  }

  async function searchOutlets() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/stores?query=${encodeURIComponent(searchQuery)}&page_size=10`);
      const json = await res.json();
      if (json.error_code === 0) setSearchResults(json.data?.store || []);
    } catch (_) {}
    setSearching(false);
  }

  function addOutlet(store) {
    if (config.outlets.includes(store.code)) return;
    save({
      ...config,
      outlets: [...config.outlets, store.code],
      _meta: {
        ...(config._meta || {}),
        [store.code]: { name: store.name, address: store.address },
      },
    });
    setSearchQuery('');
    setSearchResults([]);
  }

  function removeOutlet(code) {
    save({ ...config, outlets: config.outlets.filter((c) => c !== code) });
  }

  if (loading) return <Icon.Spinner size={20} className="mx-auto mt-8 text-ink-400" />;

  const outletMeta = config._meta || {};

  return (
    <div className="space-y-4">
      {/* Status hero */}
      <div
        className={
          'rounded-2xl p-5 text-center text-white relative overflow-hidden ' +
          (config.enabled
            ? 'bg-gradient-to-br from-orange-500 to-orange-700'
            : 'bg-gradient-to-br from-ink-700 to-ink-900')
        }
      >
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/15 blur-2xl" />
        <div className="relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur grid place-items-center mb-2">
            <Icon.Pin size={26} />
          </div>
          <p className="text-xl font-extrabold">
            {config.enabled ? 'Delivery Aktif' : 'Delivery Nonaktif'}
          </p>
          <p className="text-xs opacity-90 mt-1">
            {config.outlets.length} outlet • {rupiah(config.fee)}/order
          </p>

          <button
            onClick={() => save({ ...config, enabled: !config.enabled })}
            disabled={saving}
            className="mt-3 w-full bg-white/20 backdrop-blur hover:bg-white/30 transition rounded-xl py-2.5 text-sm font-bold inline-flex items-center justify-center gap-2"
          >
            {config.enabled ? 'Nonaktifkan' : 'Aktifkan Layanan'}
          </button>
        </div>
      </div>

      {/* Fee */}
      <div className="rounded-2xl bg-white p-4">
        <label className="text-xs font-bold text-ink-900">Biaya Delivery (per order)</label>
        <div className="mt-1.5 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-500">Rp</span>
          <input
            type="number"
            value={config.fee}
            onChange={(e) => setConfig({ ...config, fee: Number(e.target.value) || 0 })}
            onBlur={() => save({ ...config, fee: Math.max(0, Math.floor(config.fee)) })}
            placeholder="10000"
            inputMode="numeric"
            className="w-full bg-ink-50 border border-ink-200 rounded-xl pl-12 pr-4 py-3 text-base font-bold outline-none focus:border-ink-900 focus:bg-white transition"
          />
        </div>
        <div className="flex gap-2 mt-2">
          {[5000, 10000, 15000, 20000].map((v) => (
            <button
              key={v}
              onClick={() => save({ ...config, fee: v })}
              className="text-xs font-semibold bg-ink-100 hover:bg-ink-200 text-ink-700 px-3 py-1.5 rounded-lg transition"
            >
              {rupiah(v)}
            </button>
          ))}
        </div>
      </div>

      {/* Outlets */}
      <div className="rounded-2xl bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-ink-900">
            Outlet ({config.outlets.length})
          </label>
        </div>

        {config.outlets.length === 0 ? (
          <p className="text-xs text-ink-500 text-center py-3">Belum ada outlet terdaftar</p>
        ) : (
          <div className="space-y-2">
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
                    <p className="text-xs font-bold text-ink-900 truncate">{meta?.name || code}</p>
                    <p className="text-[10px] text-ink-500 font-mono truncate">{code}</p>
                  </div>
                  <button onClick={() => removeOutlet(code)} className="text-red-500 p-1">
                    <Icon.Trash size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-xl bg-ink-50 border border-ink-200 p-3 space-y-2">
          <p className="text-xs font-bold text-ink-900">Tambah Outlet</p>
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
              className="bg-ink-900 text-white text-xs font-bold px-4 py-2 rounded-lg disabled:bg-ink-300"
            >
              {searching ? <Icon.Spinner size={12} /> : 'Cari'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
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
                        : 'border-ink-200 bg-white hover:border-ink-900')
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-ink-900 truncate">{s.name}</p>
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

        {msg && <p className="text-[11px] text-emerald-600 font-semibold text-center">{msg}</p>}
      </div>
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
    try {
      const pw = sessionStorage.getItem('admin-auth') || '';
      const res = await fetch('/api/qris/info', { headers: { 'x-admin-password': pw } });
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
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
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

  if (loading) return <Icon.Spinner size={20} className="mx-auto mt-8 text-ink-400" />;

  return (
    <div className="space-y-4">
      {qrisData?.merchantName && (
        <div className="rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur grid place-items-center">
              <Icon.Check size={20} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-80 font-bold">QRIS Aktif</p>
              <p className="text-base font-extrabold mt-0.5">{qrisData.merchantName}</p>
              <p className="text-[10px] opacity-80">{qrisData.merchantCity}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 space-y-3">
        <div>
          <label className="text-xs font-bold text-ink-900">String QRIS Statis</label>
          <p className="text-[10px] text-ink-500 mt-0.5">
            Paste hasil scan QRIS statis (mulai dengan 000201...)
          </p>
          <textarea
            value={qrisInput}
            onChange={(e) => setQrisInput(e.target.value)}
            placeholder="00020101021126..."
            rows={4}
            className="w-full mt-1.5 bg-ink-50 border border-ink-200 rounded-xl px-3 py-2.5 text-xs font-mono outline-none focus:border-ink-900 focus:bg-white transition resize-none"
          />
        </div>

        {msg && (
          <p className={`text-xs font-semibold ${msg.includes('berhasil') ? 'text-emerald-600' : 'text-red-600'}`}>
            {msg}
          </p>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-ink-900 text-white text-sm font-bold py-3.5 rounded-xl hover:bg-ink-800 active:scale-[.98] transition disabled:bg-ink-300 flex items-center justify-center gap-2"
        >
          {saving ? <Icon.Spinner size={14} /> : null}
          Simpan QRIS
        </button>
      </div>
    </div>
  );
}

function rupiah(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}

function TestimonialsSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch('/api/testimonials');
      const json = await res.json();
      if (json.error_code === 0) setItems(json.data || []);
    } catch (_) {}
    setLoading(false);
  }

  async function uploadFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type?.startsWith('image/'));
    if (files.length === 0) {
      setMsg('Pilih file gambar terlebih dahulu');
      setTimeout(() => setMsg(''), 2000);
      return;
    }

    setUploading(true);
    setProgress({ done: 0, total: files.length });
    setMsg('');
    const pw = sessionStorage.getItem('admin-auth') || '';
    let success = 0;
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append('file', files[i]);
      try {
        const res = await fetch('/api/testimonials', {
          method: 'POST',
          headers: { 'x-admin-password': pw },
          body: fd,
        });
        const json = await res.json();
        if (json.error_code === 0) success++;
        else failed++;
      } catch (_) {
        failed++;
      }
      setProgress({ done: i + 1, total: files.length });
    }

    setUploading(false);
    setMsg(
      failed === 0
        ? `${success} foto berhasil diupload`
        : `${success} berhasil, ${failed} gagal`
    );
    setTimeout(() => setMsg(''), 2500);
    await load();
  }

  async function remove(id) {
    if (!confirm('Hapus foto testimoni ini?')) return;
    const pw = sessionStorage.getItem('admin-auth') || '';
    try {
      const res = await fetch(`/api/testimonials?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': pw },
      });
      const json = await res.json();
      if (json.error_code === 0) {
        setItems((prev) => prev.filter((it) => it.id !== id));
        setMsg('Foto dihapus');
        setTimeout(() => setMsg(''), 1800);
      } else {
        setMsg(json.msg || 'Gagal hapus');
      }
    } catch (e) {
      setMsg(e.message || 'Gagal hapus');
    }
  }

  if (loading) return <Icon.Spinner size={20} className="mx-auto mt-8 text-ink-400" />;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur grid place-items-center">
            <Icon.Coffee size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-80 font-bold">
              Testimoni Aktif
            </p>
            <p className="text-2xl font-extrabold mt-0.5 leading-none">{items.length} foto</p>
            <p className="text-[10px] opacity-80 mt-0.5">Tampil di halaman testimoni</p>
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="rounded-2xl bg-white p-4 space-y-3">
        <div>
          <p className="text-xs font-bold text-ink-900">Upload Foto</p>
          <p className="text-[10px] text-ink-500 mt-0.5">
            Hanya foto, maks 5 MB per file. Bisa pilih banyak sekaligus.
          </p>
        </div>

        <label
          className={
            'block w-full rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ' +
            (uploading
              ? 'border-ink-200 bg-ink-50 cursor-wait'
              : 'border-ink-300 bg-ink-50 hover:border-ink-900 hover:bg-white')
          }
        >
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => {
              uploadFiles(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-ink-700">
              <Icon.Spinner size={22} />
              <p className="text-xs font-semibold">
                Mengupload {progress.done}/{progress.total}...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-ink-700">
              <div className="w-11 h-11 rounded-full bg-white grid place-items-center text-ink-500 shadow-soft">
                <Icon.Plus size={22} />
              </div>
              <p className="text-sm font-bold text-ink-900">Pilih foto</p>
              <p className="text-[10px] text-ink-500">JPG, PNG, atau WebP</p>
            </div>
          )}
        </label>

        {msg && (
          <p
            className={
              'text-xs font-semibold text-center ' +
              (msg.includes('berhasil') || msg.includes('dihapus')
                ? 'text-emerald-600'
                : 'text-red-600')
            }
          >
            {msg}
          </p>
        )}
      </div>

      {/* Gallery */}
      <div className="rounded-2xl bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-ink-900">Galeri Foto ({items.length})</p>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-ink-500 text-center py-6">
            Belum ada foto testimoni
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="relative aspect-square rounded-xl overflow-hidden bg-ink-100 group"
              >
                <img
                  src={it.url}
                  alt="Testimoni"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <button
                  onClick={() => remove(it.id)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-500 text-white grid place-items-center shadow-md hover:bg-red-600 active:scale-90 transition"
                  aria-label="Hapus"
                  title="Hapus"
                >
                  <Icon.Trash size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function ReferralConfigSection() {
  const [config, setConfig] = useState({ reward: 2000, min_withdraw: 10000, enabled: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch('/api/referral/config');
      const json = await res.json();
      if (json.error_code === 0) setConfig(json.data);
    } catch (_) {}
    setLoading(false);
  }

  async function save(next) {
    setSaving(true);
    setMsg('');
    try {
      const pw = sessionStorage.getItem('admin-auth') || '';
      const res = await fetch('/api/referral/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify(next),
      });
      const json = await res.json();
      if (json.error_code === 0) {
        setConfig(json.data);
        setMsg('Tersimpan');
        setTimeout(() => setMsg(''), 1500);
      } else {
        setMsg(json.msg || 'Gagal simpan');
      }
    } catch (e) {
      setMsg(e.message || 'Gagal simpan');
    }
    setSaving(false);
  }

  if (loading) return <Icon.Spinner size={20} className="mx-auto mt-8 text-ink-400" />;

  return (
    <div className="space-y-4">
      <div
        className={
          'rounded-2xl p-5 text-white relative overflow-hidden ' +
          (config.enabled
            ? 'bg-gradient-to-br from-ink-900 via-ink-800 to-accent-700'
            : 'bg-gradient-to-br from-ink-700 to-ink-900')
        }
      >
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur grid place-items-center">
            <Icon.Gift size={20} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider opacity-80 font-bold">
              Program Referral
            </p>
            <p className="text-base font-extrabold mt-0.5">
              {config.enabled ? 'Aktif' : 'Nonaktif'}
            </p>
            <p className="text-[10px] opacity-80 mt-0.5">
              Reward {rupiah(config.reward)} / referral
            </p>
          </div>
          <button
            onClick={() => save({ ...config, enabled: !config.enabled })}
            disabled={saving}
            className="text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-2 rounded-lg transition"
          >
            {config.enabled ? 'Matikan' : 'Aktifkan'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 space-y-3">
        <div>
          <label className="text-xs font-bold text-ink-900">Reward per Referral</label>
          <p className="text-[10px] text-ink-500 mt-0.5">
            Saldo yang diberikan ke referrer saat order selesai
          </p>
          <div className="mt-1.5 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-500">
              Rp
            </span>
            <input
              type="number"
              value={config.reward}
              onChange={(e) =>
                setConfig({ ...config, reward: Number(e.target.value) || 0 })
              }
              className="w-full bg-ink-50 border border-ink-200 rounded-xl pl-12 pr-4 py-3 text-base font-bold outline-none focus:border-ink-900 focus:bg-white transition"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {[1000, 2000, 3000, 5000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setConfig({ ...config, reward: v })}
                className="text-xs font-semibold bg-ink-100 hover:bg-ink-200 text-ink-700 px-3 py-1.5 rounded-lg transition"
              >
                {rupiah(v)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-ink-900">Minimum Penarikan</label>
          <p className="text-[10px] text-ink-500 mt-0.5">Saldo minimum untuk withdraw</p>
          <div className="mt-1.5 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-500">
              Rp
            </span>
            <input
              type="number"
              value={config.min_withdraw}
              onChange={(e) =>
                setConfig({ ...config, min_withdraw: Number(e.target.value) || 0 })
              }
              className="w-full bg-ink-50 border border-ink-200 rounded-xl pl-12 pr-4 py-3 text-base font-bold outline-none focus:border-ink-900 focus:bg-white transition"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {[5000, 10000, 25000, 50000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setConfig({ ...config, min_withdraw: v })}
                className="text-xs font-semibold bg-ink-100 hover:bg-ink-200 text-ink-700 px-3 py-1.5 rounded-lg transition"
              >
                {rupiah(v)}
              </button>
            ))}
          </div>
        </div>

        {msg && (
          <p
            className={
              'text-xs font-semibold ' +
              (msg === 'Tersimpan' ? 'text-emerald-600' : 'text-red-600')
            }
          >
            {msg}
          </p>
        )}

        <button
          onClick={() => save(config)}
          disabled={saving}
          className="w-full bg-ink-900 text-white text-sm font-bold py-3.5 rounded-xl hover:bg-ink-800 active:scale-[.98] transition disabled:bg-ink-300 flex items-center justify-center gap-2"
        >
          {saving ? <Icon.Spinner size={14} /> : null}
          Simpan Konfigurasi
        </button>
      </div>
    </div>
  );
}

function WithdrawalsSection() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const pw = sessionStorage.getItem('admin-auth') || '';
      const res = await fetch('/api/referral/withdraw', {
        headers: { 'x-admin-password': pw },
      });
      const json = await res.json();
      if (json.error_code === 0) setList(json.data || []);
    } catch (_) {}
    setLoading(false);
  }

  async function updateStatus(id, status, notes = '') {
    const pw = sessionStorage.getItem('admin-auth') || '';
    try {
      const res = await fetch(`/api/referral/withdraw/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify({ status, notes }),
      });
      const json = await res.json();
      if (json.error_code === 0) {
        setMsg('Tersimpan');
        setTimeout(() => setMsg(''), 1500);
        await load();
      } else {
        setMsg(json.msg || 'Gagal');
      }
    } catch (e) {
      setMsg(e.message || 'Gagal');
    }
  }

  const filtered = list.filter((w) =>
    filter === 'all' ? true : w.status === filter
  );

  const counts = {
    all: list.length,
    pending: list.filter((w) => w.status === 'pending').length,
    processing: list.filter((w) => w.status === 'processing').length,
    completed: list.filter((w) => w.status === 'completed').length,
    rejected: list.filter((w) => w.status === 'rejected').length,
  };

  if (loading) return <Icon.Spinner size={20} className="mx-auto mt-8 text-ink-400" />;

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: 'pending', label: 'Pending' },
          { key: 'processing', label: 'Diproses' },
          { key: 'completed', label: 'Selesai' },
          { key: 'rejected', label: 'Ditolak' },
          { key: 'all', label: 'Semua' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={
              'shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition inline-flex items-center gap-1.5 ' +
              (filter === s.key
                ? 'bg-ink-900 text-white'
                : 'bg-white text-ink-700 border border-ink-200')
            }
          >
            {s.label}
            <span
              className={
                'text-[10px] px-1.5 rounded-full ' +
                (filter === s.key ? 'bg-white/20' : 'bg-ink-100')
              }
            >
              {counts[s.key]}
            </span>
          </button>
        ))}
      </div>

      {msg && (
        <p className="text-xs text-emerald-600 font-semibold text-center">{msg}</p>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-ink-200 p-8 text-center">
          <p className="text-xs text-ink-500">Tidak ada penarikan</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((w) => (
            <WithdrawalCard key={w.id} w={w} onUpdate={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function WithdrawalCard({ w, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = {
    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    processing: { label: 'Diproses', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    completed: { label: 'Selesai', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Ditolak', cls: 'bg-red-100 text-red-700 border-red-200' },
  }[w.status] || { label: w.status, cls: 'bg-ink-100 text-ink-700' };

  const methodLabel = {
    dana: 'DANA',
    shopeepay: 'ShopeePay',
    seabank: 'SeaBank',
  }[w.method] || w.method;

  const phoneDisplay = w.phone.startsWith('62')
    ? '0' + w.phone.slice(2)
    : w.phone;

  return (
    <div className="rounded-2xl bg-white border border-ink-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center gap-2.5 text-left hover:bg-ink-50 transition"
      >
        <div className="w-10 h-10 rounded-xl bg-ink-100 grid place-items-center text-ink-700 shrink-0">
          <Icon.ArrowRight size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-ink-900">{rupiah(w.amount)}</span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.cls}`}
            >
              {statusInfo.label}
            </span>
          </div>
          <p className="text-[11px] text-ink-500 mt-0.5 truncate">
            {methodLabel} • {w.account_name}
          </p>
        </div>
        <Icon.ChevronRight
          size={14}
          className={'text-ink-400 transition ' + (expanded ? 'rotate-90' : '')}
        />
      </button>

      {expanded && (
        <div className="border-t border-ink-100 p-3 space-y-2 fade-up bg-ink-50/50">
          <Detail label="Pemohon" value={phoneDisplay} mono />
          <Detail label="Metode" value={methodLabel} />
          <Detail label={`Nomor ${methodLabel}`} value={w.account_number} mono />
          <Detail label="Atas Nama" value={w.account_name} />
          <Detail
            label="Tanggal"
            value={new Date(w.created_at).toLocaleString('id-ID', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          />
          {w.notes && <Detail label="Catatan" value={w.notes} />}

          {w.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onUpdate(w.id, 'processing')}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 rounded-lg transition"
              >
                Proses
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Alasan penolakan?');
                  if (reason !== null) onUpdate(w.id, 'rejected', reason);
                }}
                className="flex-1 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold py-2 rounded-lg transition"
              >
                Tolak
              </button>
            </div>
          )}
          {w.status === 'processing' && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onUpdate(w.id, 'completed')}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg transition inline-flex items-center justify-center gap-1"
              >
                <Icon.Check size={12} strokeWidth={3} />
                Tandai Selesai
              </button>
              <a
                href={`https://wa.me/${w.phone}?text=${encodeURIComponent(`Halo, penarikan saldo Rp ${w.amount.toLocaleString('id-ID')} ke ${methodLabel} (${w.account_number}) sudah saya proses. Mohon dicek ya, terima kasih.`)}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold py-2 px-3 rounded-lg transition inline-flex items-center gap-1"
              >
                <Icon.WhatsApp size={12} />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-ink-500">{label}</span>
      <span className={'font-semibold text-ink-900 ' + (mono ? 'font-mono' : '')}>
        {value}
      </span>
    </div>
  );
}


function FlaggedReferralsSection() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const pw = sessionStorage.getItem('admin-auth') || '';
      const res = await fetch('/api/admin/referral/flagged', {
        headers: { 'x-admin-password': pw },
      });
      const json = await res.json();
      if (json.error_code === 0) setList(json.data || []);
    } catch (_) {}
    setLoading(false);
  }

  async function handleAction(id, action) {
    setBusy(id);
    try {
      const pw = sessionStorage.getItem('admin-auth') || '';
      const res = await fetch(`/api/admin/referral/flagged/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.error_code === 0) {
        setList((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (_) {}
    setBusy(null);
  }

  if (loading) return <Icon.Spinner size={20} className="mx-auto mt-8 text-ink-400" />;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 grid place-items-center">
            <Icon.AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-sm font-bold">{list.length} Referral Mencurigakan</p>
            <p className="text-[10px] opacity-80 mt-0.5">
              Review manual dibutuhkan sebelum credit
            </p>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl bg-white border border-ink-200 p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 grid place-items-center text-emerald-600 mb-2">
            <Icon.Check size={20} strokeWidth={3} />
          </div>
          <p className="text-xs text-ink-500">Tidak ada referral yang perlu di-review</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((r) => (
            <FlaggedCard
              key={r.id}
              ref_={r}
              busy={busy === r.id}
              onAction={(action) => handleAction(r.id, action)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FlaggedCard({ ref_, busy, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const signals = ref_.fraud_signals || [];

  return (
    <div className="rounded-2xl bg-white border border-red-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center gap-2.5 text-left hover:bg-red-50 transition"
      >
        <div className="w-10 h-10 rounded-xl bg-red-50 grid place-items-center text-red-600 shrink-0">
          <Icon.AlertTriangle size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-ink-900 truncate">
              {ref_.referee_name || 'Anonim'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              Score {ref_.fraud_score}
            </span>
          </div>
          <p className="text-[11px] text-ink-500 mt-0.5 truncate">
            {ref_.referrer_code} → Order {ref_.order_id}
          </p>
        </div>
        <Icon.ChevronRight
          size={14}
          className={'text-ink-400 transition ' + (expanded ? 'rotate-90' : '')}
        />
      </button>

      {expanded && (
        <div className="border-t border-red-100 p-3 space-y-2 bg-red-50/40">
          <div className="text-[11px] space-y-1">
            <Detail label="Referee" value={ref_.referee_phone} mono />
            <Detail label="Referrer" value={ref_.referrer_phone} mono />
            <Detail label="Reward" value={'Rp ' + ref_.reward.toLocaleString('id-ID')} />
            <Detail
              label="Tanggal"
              value={new Date(ref_.created_at).toLocaleString('id-ID', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            />
          </div>

          {signals.length > 0 && (
            <div className="rounded-lg bg-white border border-red-200 p-2 space-y-1">
              <p className="text-[10px] font-bold text-ink-700 uppercase tracking-wider">
                Sinyal Fraud
              </p>
              {signals.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span className="text-ink-700">{translateSignal(s.type)}</span>
                  <span
                    className={
                      'font-bold uppercase ' +
                      (s.severity === 'critical'
                        ? 'text-red-700'
                        : s.severity === 'high'
                        ? 'text-red-600'
                        : s.severity === 'medium'
                        ? 'text-amber-600'
                        : 'text-ink-500')
                    }
                  >
                    {s.severity}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onAction('approve')}
              disabled={busy}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-ink-300 text-white text-xs font-bold py-2 rounded-lg transition inline-flex items-center justify-center gap-1"
            >
              {busy ? <Icon.Spinner size={12} /> : <Icon.Check size={12} strokeWidth={3} />}
              Approve
            </button>
            <button
              onClick={() => onAction('reject')}
              disabled={busy}
              className="flex-1 bg-white border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 text-xs font-bold py-2 rounded-lg transition inline-flex items-center justify-center gap-1"
            >
              <Icon.Close size={12} />
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function translateSignal(type) {
  const map = {
    same_fingerprint: 'Same device dengan referrer',
    same_ip: 'Same IP dengan referrer',
    fresh_referrer: 'Referrer baru daftar (< 1 jam)',
    young_referrer: 'Referrer baru (< 24 jam)',
    burst_high: 'Banyak referral dalam 1 jam',
    burst_medium: 'Beberapa referral dalam 1 jam',
    fake_phone_pattern: 'Pola nomor mencurigakan',
    repeated_same_pair: 'Pair referrer-referee sama berulang',
    repeat_referee: 'Referee sudah pernah dipakai',
    same_name: 'Nama customer = referrer',
    referrer_banned: 'Referrer di-banned',
    past_blocked: 'Pernah di-block sebelumnya',
  };
  return map[type] || type;
}
