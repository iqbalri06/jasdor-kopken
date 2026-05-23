import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const product_id = searchParams.get('product_id') || '';
  const bundle_code = searchParams.get('bundle_code') || '';
  const store_code = searchParams.get('store_code') || '';

  try {
    const url = `https://hollystore.my.id/jasdor/api/options?product_id=${encodeURIComponent(
      product_id
    )}&bundle_code=${encodeURIComponent(bundle_code)}&store_code=${encodeURIComponent(store_code)}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error_code: 1, msg: e.message || 'Gagal mengambil opsi produk' },
      { status: 500 }
    );
  }
}
