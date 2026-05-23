import { NextResponse } from 'next/server';
import { saveOrder } from '@/lib/orderStore';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error_code: 1, msg: 'Order tidak valid' },
        { status: 400 }
      );
    }
    const id = await saveOrder(body);
    return NextResponse.json({ error_code: 0, id });
  } catch (e) {
    return NextResponse.json(
      { error_code: 1, msg: e.message || 'Gagal menyimpan order' },
      { status: 500 }
    );
  }
}
