import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const store_code = searchParams.get('store_code') || '';

  try {
    const res = await fetch(
      `https://hollystore.my.id/jasdor/api/menu?store_code=${encodeURIComponent(store_code)}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error_code: 1, msg: e.message || 'Gagal mengambil menu' },
      { status: 500 }
    );
  }
}
