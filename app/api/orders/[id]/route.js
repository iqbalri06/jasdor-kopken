import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import {
  creditReferralReward,
  cancelReferralReward,
  refundBalanceOnCancel,
} from '@/lib/referral';
import { incrementStock } from '@/lib/accountStock';

export const dynamic = 'force-dynamic';

// GET: ambil order by ID (public — untuk halaman detail)
export async function GET(_request, { params }) {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error_code: 1, msg: 'Order tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ error_code: 0, data });
  } catch (e) {
    return NextResponse.json(
      { error_code: 1, msg: e.message || 'Gagal mengambil order' },
      { status: 500 }
    );
  }
}

// PATCH: update status order (admin only)
export async function PATCH(request, { params }) {
  const auth = request.headers.get('x-admin-password') || '';
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error_code: 1, msg: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const sb = getSupabase();

    // Get current order untuk akses data customer & referral
    const { data: row } = await sb
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    // Update status
    const update = { status: body.status };
    await sb.from('orders').update(update).eq('id', params.id);

    // Optional: update pickup_number di field data
    if (body.pickup_number != null && row) {
      const newData = { ...row.data, pickup_number: body.pickup_number };
      await sb.from('orders').update({ data: newData }).eq('id', params.id);
    }

    // Trigger referral logic berdasarkan transisi status
    if (row && body.status && row.status !== body.status) {
      if (body.status === 'done') {
        await creditReferralReward(sb, params.id);
      } else if (body.status === 'cancelled') {
        await cancelReferralReward(sb, params.id);
        await refundBalanceOnCancel(sb, row.data || {});
        // Kembalikan stok akun
        await incrementStock(sb, 1);
      }
    }

    return NextResponse.json({ error_code: 0 });
  } catch (e) {
    return NextResponse.json(
      { error_code: 1, msg: e.message || 'Gagal update' },
      { status: 500 }
    );
  }
}
