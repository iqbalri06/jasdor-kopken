import { NextResponse } from 'next/server';
import { getOrder } from '@/lib/orderStore';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    const order = await getOrder(params.id);
    if (!order) {
      return NextResponse.json(
        { error_code: 1, msg: 'Order tidak ditemukan' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error_code: 0, data: order });
  } catch (e) {
    return NextResponse.json(
      { error_code: 1, msg: e.message || 'Gagal mengambil order' },
      { status: 500 }
    );
  }
}
