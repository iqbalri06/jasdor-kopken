import { NextResponse } from 'next/server';
import { KK_HEADERS, KK_SIGNATURES } from '@/lib/kkHeaders';

export const dynamic = 'force-dynamic';

const KK_URL =
  'https://apps.kopikenangan.com/kk-api-kopikenangan/api/product/get_product_options_v2';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const store_code = searchParams.get('store_code') || '';
  const product_id = Number(searchParams.get('product_id') || 0);
  const bundle_code = searchParams.get('bundle_code') || null;

  const body = {
    store_code,
    product_id,
    version_v2: true,
    combo_bundle_code: null,
    combo_item_id: null,
    default_selected_sku: '',
    default_selected_addon_skus: [],
    default_selected_notes_map: {},
    replace_cart_item_ids: [],
    limit_to_size_code: 0,
    limit_to_temperature_code: 0,
    limit_to_skus: [],
    support_mandatory_topping: true,
    attribution_flag: null,
  };

  try {
    const res = await fetch(KK_URL, {
      method: 'POST',
      headers: { ...KK_HEADERS, clsignature: KK_SIGNATURES.options },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error_code: 1, msg: e.message || 'Gagal mengambil opsi produk' },
      { status: 500 }
    );
  }
}
