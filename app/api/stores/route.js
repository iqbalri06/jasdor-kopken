import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';

  try {
    const res = await fetch(
      `https://hollystore.my.id/jasdor/api/stores?query=${encodeURIComponent(query)}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error_code: 1, msg: e.message || 'Gagal mengambil data outlet' },
      { status: 500 }
    );
  }
}
