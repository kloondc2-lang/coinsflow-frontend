'use client';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.coinsflow.net';

async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// ── Litecoin blocks ───────────────────────────────────────────────────────────

export function fetchBlocks(page = 1, limit = 20) {
  return apiFetch(`/explorer/litecoin/blocks?page=${page}&limit=${limit}`);
}

export function fetchBlock(hash) {
  return apiFetch(`/explorer/litecoin/blocks/${hash}`);
}

export function fetchMempool() {
  return apiFetch('/explorer/litecoin/blocks/mempool');
}

// ── Litecoin transactions ─────────────────────────────────────────────────────

export function fetchTx(txid) {
  return apiFetch(`/explorer/litecoin/tx/${txid}`);
}

// ── Litecoin addresses ────────────────────────────────────────────────────────

export function fetchAddress(address, page = 1, limit = 20) {
  return apiFetch(`/explorer/litecoin/address/${address}?page=${page}&limit=${limit}`);
}

// ── Smart search — try all 3 endpoints, return first match ────────────────────

export async function smartSearch(query) {
  // Try all three in parallel — whichever succeeds first wins
  const attempts = [
    fetchTx(query).then((d) => ({ type: 'tx', data: d })),
    fetchBlock(query).then((d) => ({ type: 'block', data: d })),
    fetchAddress(query).then((d) => ({ type: 'address', data: d })),
  ];

  const results = await Promise.allSettled(attempts);
  for (const r of results) {
    if (r.status === 'fulfilled') return r.value;
  }
  return null;
}
