import { NextResponse } from 'next/server';
import { KK_HEADERS, KK_SIGNATURES } from '@/lib/kkHeaders';

export const dynamic = 'force-dynamic';

const KK_URL =
  'https://apps.kopikenangan.com/kk-api-kopikenangan/api/product/query_product_menu';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const store_code = searchParams.get('store_code') || '';

  const body = {
    store_code,
    voucher_code: null,
    product_without_promo: true,
    display_combo_v2: true,
    display_merchandise_product: true,
    display_mix_match_optional: true,
    support_discount_percentage: true,
  };

  try {
    const res = await fetch(KK_URL, {
      method: 'POST',
      headers: { ...KK_HEADERS, clsignature: KK_SIGNATURES.menu },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error_code: 1, msg: e.message || 'Gagal mengambil menu' },
      { status: 500 }
    );
  }
}
