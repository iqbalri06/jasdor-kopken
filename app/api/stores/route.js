import { NextResponse } from 'next/server';
import { KK_HEADERS, KK_SIGNATURES } from '@/lib/kkHeaders';

export const dynamic = 'force-dynamic';

const KK_URL =
  'https://apps.kopikenangan.com/kk-api-kopikenangan/api/store/query_pageable_store';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const pageIndex = Number(searchParams.get('page_index') || 1);
  const pageSize = Number(searchParams.get('page_size') || 20);

  const body = {
    fuzzy_name: query,
    lat: 0,
    lng: 0,
    deliverable: 0,
    order_type: [],
    page: {
      page_index: pageIndex,
      page_size: pageSize,
    },
    brand_codes: [],
    disable_delivery_distance_limit: true,
  };

  try {
    const res = await fetch(KK_URL, {
      method: 'POST',
      headers: { ...KK_HEADERS, clsignature: KK_SIGNATURES.stores },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error_code: 1, msg: e.message || 'Gagal mengambil data outlet' },
      { status: 500 }
    );
  }
}
