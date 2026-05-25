import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST: simpan order baru
export async function POST(request) {
  try {
    const body = await request.json();
    if (!body || !body.orderId || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error_code: 1, msg: 'Data order tidak valid' },
        { status: 400 }
      );
    }

    const sb = getSupabase();
    const { error } = await sb.from('orders').insert({
      id: body.orderId,
      data: body,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ error_code: 0, id: body.orderId });
  } catch (e) {
    return NextResponse.json(
      { error_code: 1, msg: e.message || 'Gagal menyimpan order' },
      { status: 500 }
    );
  }
}

// GET: admin ambil semua orders
export async function GET(request) {
  const auth = request.headers.get('x-admin-password') || '';
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error_code: 1, msg: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ error_code: 0, data: data || [] });
  } catch (e) {
    return NextResponse.json(
      { error_code: 1, msg: e.message || 'Gagal mengambil orders' },
      { status: 500 }
    );
  }
}
