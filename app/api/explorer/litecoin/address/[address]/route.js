import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'https://api.coinsflow.net';
const INTERNAL_KEY = process.env.INTERNAL_API_SECRET;

export async function GET(request, { params }) {
  const { address } = await params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';

  const res = await fetch(
    `${BACKEND}/explorer/litecoin/address/${address}?page=${page}&limit=${limit}`,
    {
      cache: 'no-store',
      headers: { 'x-internal-key': INTERNAL_KEY },
    }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
