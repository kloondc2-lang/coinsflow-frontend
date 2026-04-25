import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'https://api.coinsflow.net';
const INTERNAL_KEY = process.env.INTERNAL_API_SECRET;

export async function GET(_request, { params }) {
  const { hash } = await params;

  const res = await fetch(`${BACKEND}/explorer/litecoin/blocks/${hash}`, {
    cache: 'no-store',
    headers: { 'x-internal-key': INTERNAL_KEY },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
