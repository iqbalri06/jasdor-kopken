'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import { decodeOrder } from '@/components/orderEncode';
import { Icon } from '@/components/Icons';
import { EWALLET_METHODS, BANK_METHODS, PaymentLogo } from '@/components/PaymentLogos';

const ADMIN_WA = '6281291544061';

function rupiah(n) {
  if (n == null || isNaN(n)) return 'Rp 0';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

export default function PaymentPage({ params }) {
  const [order, setOrder] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Coba load dari DB pakai order ID dulu
    loadOrder();
  }, [params.token]);

  async function loadOrder() {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(params.token)}`);
      const json = await res.json();
      if (json.error_code === 0 && json.data) {
        const d = json.data.data || json.data;
        const orderData = {
          ...d,
          orderId: d.orderId || json.data.id,
        };
        setOrder(orderData);
        // Pakai totalToPay (sudah include kode unik) untuk QRIS
        generateQR(orderData.totalToPay || orderData.total);
        return;
      }
    } catch (_) {}

    const decoded = decodeOrder(params.token);
    if (decoded) {
      setOrder(decoded);
      generateQR(decoded.totalToPay || decoded.total);
      return;
    }

    setError('Link pembayaran tidak valid.');
    setLoading(false);
  }

  async function generateQR(amount) {
    try {
      const res = await fetch(`/api/qris?amount=${amount}`);
      const json = await res.json();
      if (json.error_code === 0) {
        setMerchantName(json.data.merchantName || '');
        const QRCode = (await import('qrcode')).default;
        const dataUrl = await QRCode.toDataURL(json.data.qris, {
          width: 320,
          margin: 1,
          color: { dark: '#18181B', light: '#FFFFFF' },
        });
        setQrDataUrl(dataUrl);
      }
    } catch (_) {}
    setLoading(false);
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Hanya file gambar yang diperbolehkan');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5MB');
      return;
    }
    setProofFile(file);
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!proofFile || !order) return;
    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', proofFile);
      formData.append('orderId', order.orderId || 'unknown');

      const res = await fetch('/api/upload-proof', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.error_code === 0) {
        setProofUrl(json.data?.url || '');
        setUploaded(true);
      } else {
        throw new Error(json.msg || 'Gagal upload');
      }
    } catch (e) {
      setUploadError(e.message || 'Gagal upload bukti bayar');
    }
    setUploading(false);
  }

  function handleSendWA() {
    if (!order) return;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const orderUrl = `${baseUrl}/order/${order.orderId}`;
    const message = [
      `Halo Admin, saya sudah bayar.`,
      ``,
      `Nama: ${order.customer?.name || '-'}`,
      `Total: ${rupiah(order.totalToPay || order.total)}`,
      `Order: ${order.orderId || '-'}`,
      ``,
      `Lihat detail & bukti bayar:`,
      orderUrl,
    ].join('\n');
    const waUrl = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }

  if (error) {
    return (
      <main className="pb-24">
        <Header title="Pembayaran" back="/" showCart={false} />
        <div className="max-w-md mx-auto px-4 mt-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 grid place-items-center text-red-600 mb-4">
            <Icon.AlertTriangle size={28} />
          </div>
          <p className="font-semibold text-ink-900">{error}</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="pb-24">
        <Header title="Pembayaran" back="/" showCart={false} />
        <div className="max-w-md mx-auto px-4 mt-6 space-y-3">
          <div className="h-32 rounded-3xl shimmer" />
          <div className="h-72 rounded-2xl shimmer" />
          <div className="h-40 rounded-2xl shimmer" />
        </div>
      </main>
    );
  }

  // Step indicator
  const currentStep = uploaded ? 3 : proofFile ? 2 : 1;

  return (
    <main className="pb-24 bg-gradient-to-b from-ink-50 to-white">
      <Header title="Pembayaran" back="/" showCart={false} />

      <div className="max-w-md mx-auto px-4 md:px-6 mt-4 space-y-4">
        {/* Progress steps */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <div className="flex items-center justify-between">
            <ProgressStep num={1} label="Bayar" active={currentStep >= 1} done={currentStep > 1} />
            <ProgressLine done={currentStep > 1} />
            <ProgressStep num={2} label="Upload" active={currentStep >= 2} done={currentStep > 2} />
            <ProgressLine done={currentStep > 2} />
            <ProgressStep num={3} label="Konfirmasi" active={currentStep >= 3} done={false} />
          </div>
        </div>

        {/* Total bayar - hero */}
        <div className="rounded-3xl bg-gradient-to-br from-ink-900 via-ink-800 to-accent-700 text-white overflow-hidden relative">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-accent-500/20 blur-2xl" />

          <div className="relative p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">
                Total Pembayaran
              </span>
              {order?.orderId && (
                <span className="text-[10px] bg-white/15 backdrop-blur px-2.5 py-1 rounded-full font-semibold">
                  {order.orderId}
                </span>
              )}
            </div>
            <p className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {rupiah(order?.totalToPay || order?.total)}
            </p>

            {order?.uniqueCode != null && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">
                    Harga normal
                  </p>
                  <p className="text-base font-bold mt-1 line-through opacity-80">
                    {rupiah(order.total)}
                  </p>
                </div>
                <div className="bg-amber-400/20 backdrop-blur rounded-xl p-3 border border-amber-300/30">
                  <p className="text-[10px] uppercase tracking-wider text-amber-200 font-semibold">
                    Kode unik
                  </p>
                  <p className="text-base font-bold mt-1 text-amber-100">
                    + {order.uniqueCode}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-start gap-2 text-[11px] opacity-90">
              <Icon.Info size={14} className="shrink-0 mt-0.5" />
              <p>
                {order?.uniqueCode
                  ? 'Bayar tepat sesuai nominal di atas. Kode unik untuk verifikasi pembayaran.'
                  : 'Nominal sudah otomatis terisi di QRIS.'}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        {qrDataUrl ? (
          <div className="rounded-3xl bg-white border border-ink-200 overflow-hidden">
            <div className="bg-ink-900 text-white px-5 py-3 flex items-center gap-2">
              <Icon.Tag size={16} />
              <span className="text-sm font-semibold">Scan QRIS untuk Bayar</span>
            </div>
            <div className="p-6 grid place-items-center">
              <div className="relative">
                {/* Decorative corners */}
                <div className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-ink-900 rounded-tl-lg" />
                <div className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-ink-900 rounded-tr-lg" />
                <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-ink-900 rounded-bl-lg" />
                <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-ink-900 rounded-br-lg" />

                <div className="p-3 bg-white border border-ink-100 rounded-2xl">
                  <img src={qrDataUrl} alt="QRIS" className="w-56 h-56 md:w-64 md:h-64 block" />
                </div>
              </div>

              {merchantName && (
                <div className="mt-5 inline-flex items-center gap-2 bg-ink-50 px-3 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-semibold text-ink-900">{merchantName}</p>
                </div>
              )}
            </div>

            {/* Cara bayar */}
            <div className="border-t border-ink-100 px-5 py-4 bg-ink-50/50 space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-ink-700 uppercase tracking-wider mb-2">
                  E-Wallet
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {EWALLET_METHODS.map((method) => (
                    <div
                      key={method.name}
                      title={method.name}
                      className="bg-white border border-ink-200 rounded-lg h-10 flex items-center justify-center px-2 hover:border-ink-400 transition overflow-hidden"
                    >
                      <PaymentLogo name={method.name} url={method.url} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-ink-700 uppercase tracking-wider mb-2">
                  Mobile Banking
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {BANK_METHODS.map((name) => (
                    <span
                      key={name}
                      className="text-xs font-medium bg-white text-ink-700 border border-ink-200 px-3 py-1.5 rounded-full"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-ink-400 text-center pt-1">
                & semua aplikasi pembayaran QRIS lainnya
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-amber-50 border border-amber-200 p-5 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 grid place-items-center text-amber-700 shrink-0">
              <Icon.Info size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">QRIS belum tersedia</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Silakan transfer manual atau hubungi admin. Setelah bayar, upload bukti di bawah.
              </p>
            </div>
          </div>
        )}

        {/* Upload bukti bayar */}
        <div className="rounded-3xl bg-white border border-ink-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-ink-100 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 grid place-items-center text-emerald-600">
              <Icon.Check size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900">Bukti Pembayaran</p>
              <p className="text-[10px] text-ink-500">Screenshot/foto bukti transfer</p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {proofPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-ink-200 bg-ink-50">
                <img
                  src={proofPreview}
                  alt="Bukti bayar"
                  className="w-full max-h-64 object-contain"
                />
                {!uploaded && (
                  <button
                    onClick={() => {
                      setProofFile(null);
                      setProofPreview('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-ink-900/80 hover:bg-ink-900 text-white grid place-items-center transition backdrop-blur"
                  >
                    <Icon.Close size={14} />
                  </button>
                )}
                {uploaded && (
                  <div className="absolute inset-0 bg-emerald-500/10 grid place-items-center">
                    <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                      <Icon.Check size={14} />
                      Berhasil Diupload
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-ink-200 hover:border-ink-900 hover:bg-ink-50 rounded-2xl p-8 text-center transition active:scale-[.98] group"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-ink-100 grid place-items-center text-ink-500 group-hover:bg-ink-900 group-hover:text-white transition">
                  <Icon.Plus size={26} />
                </div>
                <p className="text-sm font-semibold text-ink-900 mt-3">
                  Tap untuk upload bukti
                </p>
                <p className="text-[11px] text-ink-500 mt-1">
                  JPG, PNG • Maks 5MB
                </p>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploadError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-medium flex items-center gap-2">
                <Icon.AlertTriangle size={14} />
                {uploadError}
              </div>
            )}

            {proofFile && !uploaded && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-ink-900 hover:bg-ink-800 disabled:bg-ink-300 text-white rounded-2xl px-4 py-3.5 active:scale-[.98] transition flex items-center justify-center gap-2 font-semibold text-sm"
              >
                {uploading ? (
                  <>
                    <Icon.Spinner size={14} />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Icon.Check size={16} />
                    Upload Bukti Bayar
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Setelah upload — tombol kirim WA */}
        {uploaded && (
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-200 p-5 fade-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white grid place-items-center shrink-0">
                <Icon.Check size={20} strokeWidth={3} />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900">Bukti berhasil diupload</p>
                <p className="text-xs text-emerald-700">Tinggal kirim ke admin via WhatsApp</p>
              </div>
            </div>
            <button
              onClick={handleSendWA}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl px-4 py-4 active:scale-[.98] transition flex items-center justify-center gap-2 font-semibold text-sm shadow-lg shadow-emerald-500/30"
            >
              <Icon.WhatsApp size={20} />
              Kirim Pesanan ke Admin
            </button>
          </div>
        )}

        {/* Steps card */}
        {!uploaded && (
          <div className="rounded-2xl bg-ink-50 border border-ink-200 p-4">
            <p className="text-xs font-semibold text-ink-900 mb-3 flex items-center gap-1.5">
              <Icon.Info size={14} className="text-ink-500" />
              Cara pembayaran
            </p>
            <div className="space-y-2.5">
              <Step num="1" text="Scan QRIS dengan e-wallet/m-banking kamu" />
              <Step num="2" text="Bayar — nominal sudah terisi otomatis" />
              <Step num="3" text="Screenshot bukti pembayaran" />
              <Step num="4" text="Upload bukti, lalu kirim ke admin" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ProgressStep({ num, label, active, done }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={
          'w-9 h-9 rounded-full grid place-items-center font-bold text-xs transition ' +
          (done
            ? 'bg-emerald-500 text-white'
            : active
            ? 'bg-ink-900 text-white'
            : 'bg-ink-100 text-ink-400')
        }
      >
        {done ? <Icon.Check size={14} strokeWidth={3} /> : num}
      </div>
      <span
        className={
          'text-[10px] font-semibold ' + (active || done ? 'text-ink-900' : 'text-ink-400')
        }
      >
        {label}
      </span>
    </div>
  );
}

function ProgressLine({ done }) {
  return (
    <div className="flex-1 h-0.5 mx-1 mt-[-15px]">
      <div
        className={'h-full rounded-full transition ' + (done ? 'bg-emerald-500' : 'bg-ink-200')}
      />
    </div>
  );
}

function Step({ num, text }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 h-6 rounded-full bg-ink-900 text-white text-[10px] font-bold grid place-items-center shrink-0">
        {num}
      </span>
      <p className="text-xs text-ink-700 flex-1">{text}</p>
    </div>
  );
}
