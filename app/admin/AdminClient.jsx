'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.coinsflow.net';
const ADMIN_EMAIL = 'mra88811@gmail.com';

function StatCard({ label, value, sub, color }) {
  return (
    <div className="p-5 rounded-xl border border-white/[0.07] bg-[#020d1c]">
      <p className="text-[10.5px] font-semibold text-[#334155] uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-[28px] font-extrabold tracking-tight leading-none ${color || 'text-white'}`}>{value ?? '—'}</p>
      {sub && <p className="text-[12px] text-[#4a5568] mt-1.5 font-medium">{sub}</p>}
    </div>
  );
}

function Badge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
      <span className="w-1 h-1 rounded-full bg-emerald-400" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/25">
      Revoked
    </span>
  );
}

export default function AdminClient() {
  const router = useRouter();
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats]     = useState(null);
  const [keys, setKeys]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError]     = useState('');

  // Withdraw state
  const [withdrawAddr, setWithdrawAddr]       = useState('');
  const [withdrawAmount, setWithdrawAmount]   = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawResult, setWithdrawResult]   = useState(null);
  const [ltcPrice, setLtcPrice] = useState(null);

  // Payouts history state
  const [payouts, setPayouts]           = useState([]);
  const [payoutsTotal, setPayoutsTotal] = useState(0);
  const [payoutsPage, setPayoutsPage]   = useState(1);
  const PAYOUTS_LIMIT = 25;

  const LIMIT = 25;

  // ── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) { router.push('/apis/auth'); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/apis/auth'); return; }
      if (session.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        router.push('/apis/dashboard');
        return;
      }
      setUser(session.user);
      setToken(session.access_token);
      setLoading(false);
    });
  }, [router]);

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const fetchStats = useCallback(async (tok) => {
    try {
      const res = await fetch(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        if (data.ltcPriceUSD) setLtcPrice(data.ltcPriceUSD);
      }
    } catch { /* ignore */ }
  }, []);

  // ── Fetch keys ────────────────────────────────────────────────────────────
  const fetchKeys = useCallback(async (tok, pg, q) => {
    try {
      const params = new URLSearchParams({ page: pg, limit: LIMIT });
      if (q) params.set('search', q);
      const res = await fetch(`${API}/admin/keys?${params}`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
        setTotal(data.total || 0);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchPayouts = useCallback(async (tok, pg) => {
    try {
      const params = new URLSearchParams({ page: pg, limit: PAYOUTS_LIMIT });
      const res = await fetch(`${API}/admin/payouts?${params}`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts || []);
        setPayoutsTotal(data.total || 0);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchStats(token);
    fetchKeys(token, page, search);
    fetchPayouts(token, payoutsPage);
  }, [token, page, search, payoutsPage, fetchStats, fetchKeys, fetchPayouts]);

  // ── Revoke / activate / delete ────────────────────────────────────────────
  async function revokeKey(id) {
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`${API}/admin/keys/${id}/revoke`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setKeys((ks) => ks.map((k) => k.id === id ? { ...k, is_active: false } : k));
        fetchStats(token);
      }
    } finally { setActionLoading((p) => ({ ...p, [id]: false })); }
  }

  async function activateKey(id) {
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`${API}/admin/keys/${id}/activate`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setKeys((ks) => ks.map((k) => k.id === id ? { ...k, is_active: true } : k));
        fetchStats(token);
      }
    } finally { setActionLoading((p) => ({ ...p, [id]: false })); }
  }

  async function deleteKey(id) {
    if (!window.confirm('Permanently delete this API key?')) return;
    setActionLoading((p) => ({ ...p, [id]: 'del' }));
    try {
      const res = await fetch(`${API}/admin/keys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setKeys((ks) => ks.filter((k) => k.id !== id));
        setTotal((t) => t - 1);
        fetchStats(token);
      }
    } finally { setActionLoading((p) => ({ ...p, [id]: false })); }
  }

  async function submitWithdraw(e) {
    e.preventDefault();
    setWithdrawResult(null);
    const amount = parseFloat(withdrawAmount);
    if (!withdrawAddr.trim() || isNaN(amount) || amount <= 0) return;
    setWithdrawLoading(true);
    try {
      const res = await fetch(`${API}/admin/withdraw`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_address: withdrawAddr.trim(), amount_ltc: amount }),
      });
      const data = await res.json();
      setWithdrawResult(data);
      if (data.ok) {
        setWithdrawAddr('');
        setWithdrawAmount('');
        fetchStats(token);
      }
    } catch { setWithdrawResult({ error: 'Network error' }); }
    finally { setWithdrawLoading(false); }
  }

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#020d1c] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-[100dvh] bg-[#020d1c] text-[#e2e8f0] px-4 py-10 md:px-10">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-extrabold text-white tracking-tight">Admin Panel</h1>
            <p className="text-[13px] text-[#4a5568] mt-0.5">Logged in as <span className="text-blue-400">{user?.email}</span></p>
          </div>
          <button
            onClick={() => { supabase?.auth.signOut(); router.push('/apis/auth'); }}
            className="px-4 py-2 text-[13px] font-semibold text-[#4a5568] hover:text-red-400 border border-white/[0.08] rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Platform key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard label="Total Keys"   value={stats?.totalKeys}   />
          <StatCard label="Active Keys"  value={stats?.activeKeys}  color="text-emerald-400" />
          <StatCard label="Revoked Keys" value={stats?.revokedKeys} color="text-red-400" />
          <StatCard label="Total Users"  value={stats?.totalUsers}  color="text-blue-400" />
        </div>

        {/* Financial stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <StatCard
            label="Total Volume Processed"
            value={stats ? `${parseFloat(stats.totalVolumeProcessed ?? 0).toFixed(8)} LTC` : '—'}
            sub={stats && ltcPrice ? `≈ $${(parseFloat(stats.totalVolumeProcessed ?? 0) * ltcPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : undefined}
            color="text-white"
          />
          <StatCard
            label="Total Service Fees Collected"
            value={stats ? `${parseFloat(stats.totalServiceFeesLTC ?? 0).toFixed(8)} LTC` : '—'}
            sub={stats && ltcPrice ? `≈ $${(parseFloat(stats.totalServiceFeesLTC ?? 0) * ltcPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : undefined}
            color="text-yellow-400"
          />
          <StatCard
            label="Available to Withdraw"
            value={stats ? `${parseFloat(stats.availableFeesLTC ?? 0).toFixed(8)} LTC` : '—'}
            sub={stats && ltcPrice ? `≈ $${(parseFloat(stats.availableFeesLTC ?? 0) * ltcPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : undefined}
            color="text-emerald-400"
          />
        </div>

        {/* Fee withdrawal panel */}
        <div className="rounded-xl border border-white/[0.07] bg-[#0a1628] p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-[15px] font-bold text-white">Withdraw Platform Fees</h2>
            <p className="text-[12px] text-[#4a5568] mt-0.5">
              Withdraw collected service fees from the platform Litecoin wallet.
              Available:{' '}
              <span className="font-mono text-emerald-400 font-semibold">
                {stats ? `${parseFloat(stats.availableFeesLTC ?? 0).toFixed(8)} LTC` : '…'}
              </span>
              {stats && ltcPrice && (
                <span className="ml-1.5 text-[#64748b]">
                  (≈ ${(parseFloat(stats.availableFeesLTC ?? 0) * ltcPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
                </span>
              )}
              {stats && (
                <span className="ml-3 text-[#334155]">
                  (wallet {parseFloat(stats.walletBalanceLTC ?? 0).toFixed(8)} LTC &minus; user balances {parseFloat(stats.totalUserBalancesLTC ?? 0).toFixed(8)} LTC)
                </span>
              )}
            </p>
          </div>
          <form onSubmit={submitWithdraw} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={withdrawAddr}
              onChange={(e) => setWithdrawAddr(e.target.value)}
              placeholder="LTC address (L…, M…, or ltc1…)"
              required
              className="flex-[2] px-3 py-2 rounded-lg border border-white/[0.08] bg-[#040c1a] text-[13px] text-[#e2e8f0] placeholder-[#334155] outline-none focus:border-blue-500/50"
            />
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount LTC"
              min="0.00001"
              step="any"
              required
              className="flex-1 px-3 py-2 rounded-lg border border-white/[0.08] bg-[#040c1a] text-[13px] text-[#e2e8f0] placeholder-[#334155] outline-none focus:border-blue-500/50"
            />
            <button
              type="button"
              onClick={() => stats && setWithdrawAmount(parseFloat(stats.availableFeesLTC ?? 0).toFixed(8))}
              className="px-3 py-2 rounded-lg border border-white/[0.08] text-[12px] text-[#4a5568] hover:text-[#94a3b8] transition-colors whitespace-nowrap"
            >
              All
            </button>
            <button
              type="submit"
              disabled={withdrawLoading || !withdrawAddr.trim() || !withdrawAmount}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {withdrawLoading ? 'Sending…' : 'Withdraw'}
            </button>
          </form>
          {withdrawResult && (
            <div className={`mt-3 px-4 py-3 rounded-lg text-[12.5px] font-mono ${
              withdrawResult.ok
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {withdrawResult.ok
                ? `✓ Sent ${withdrawResult.amount_ltc} LTC to ${withdrawResult.to_address} — tx: ${withdrawResult.tx_hash}`
                : `✗ ${withdrawResult.error}`}
            </div>
          )}
        </div>

        {/* Search + table */}
        <div className="rounded-xl border border-white/[0.07] bg-[#0a1628] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06]">
            <p className="text-[13px] font-semibold text-[#e2e8f0]">
              API Keys <span className="ml-1.5 text-[#334155]">({total})</span>
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search email or key…"
                className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-[#040c1a] text-[13px] text-[#e2e8f0] placeholder-[#334155] outline-none focus:border-blue-500/50 w-52"
              />
              <button type="submit" className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold transition-colors">
                Search
              </button>
              {search && (
                <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
                  className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-[12px] text-[#4a5568] hover:text-[#94a3b8] transition-colors">
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-[#071423]">
                  {['Owner', 'API Key', 'Requests', 'Last Used', 'Created', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[10.5px] font-semibold text-[#334155] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {keys.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[13px] text-[#334155]">
                      {search ? 'No keys match your search.' : 'No keys found.'}
                    </td>
                  </tr>
                )}
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-[13px] text-[#94a3b8] max-w-[180px] truncate" title={k.email}>{k.email}</td>
                    <td className="px-4 py-3">
                      <code className="text-[11.5px] font-mono text-[#4a5568]">{k.api_key_preview}</code>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#64748b] font-mono">{k.request_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[12px] text-[#4a5568] whitespace-nowrap">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#4a5568] whitespace-nowrap">
                      {new Date(k.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3"><Badge active={k.is_active} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {k.is_active ? (
                          <button
                            onClick={() => revokeKey(k.id)}
                            disabled={actionLoading[k.id]}
                            className="text-[11px] font-semibold text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
                          >
                            {actionLoading[k.id] === true ? '…' : 'Revoke'}
                          </button>
                        ) : (
                          <button
                            onClick={() => activateKey(k.id)}
                            disabled={actionLoading[k.id]}
                            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                          >
                            {actionLoading[k.id] === true ? '…' : 'Activate'}
                          </button>
                        )}
                        <button
                          onClick={() => deleteKey(k.id)}
                          disabled={!!actionLoading[k.id]}
                          className="text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        >
                          {actionLoading[k.id] === 'del' ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
              <p className="text-[12px] text-[#334155]">
                Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-[12px] font-semibold text-[#4a5568] border border-white/[0.08] rounded-md hover:text-[#94a3b8] disabled:opacity-30 transition-colors"
                >
                  Prev
                </button>
                <span className="px-3 py-1 text-[12px] text-[#4a5568]">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 text-[12px] font-semibold text-[#4a5568] border border-white/[0.08] rounded-md hover:text-[#94a3b8] disabled:opacity-30 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {error && <p className="mt-4 text-[13px] text-red-400">{error}</p>}

        {/* Payouts History */}
        <div className="rounded-xl border border-white/[0.07] bg-[#0a1628] overflow-hidden mt-6">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="text-[13px] font-semibold text-[#e2e8f0]">
              Payout History <span className="ml-1.5 text-[#334155]">({payoutsTotal})</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-[#071423]">
                  {['Date', 'User', 'To Address', 'Amount', 'Service Fee', 'Network Fee', 'TX Hash', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[10.5px] font-semibold text-[#334155] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[13px] text-[#334155]">No payouts found.</td>
                  </tr>
                )}
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-[12px] text-[#4a5568] whitespace-nowrap">
                      {p.created_at ? new Date(p.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#94a3b8] max-w-[150px] truncate" title={p.email}>{p.email}</td>
                    <td className="px-4 py-3">
                      <code className="text-[11px] font-mono text-[#4a5568]" title={p.to_address}>
                        {p.to_address ? `${p.to_address.slice(0, 8)}…${p.to_address.slice(-6)}` : '—'}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-[13px] font-mono text-white whitespace-nowrap">
                      {parseFloat(p.amount_ltc || 0).toFixed(8)}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-mono text-yellow-400 whitespace-nowrap">
                      {parseFloat(p.service_fee_ltc || 0).toFixed(8)}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-mono text-[#4a5568] whitespace-nowrap">
                      {parseFloat(p.fee_ltc || 0).toFixed(8)}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[11px] font-mono text-[#4a5568]" title={p.tx_hash}>
                        {p.tx_hash ? `${p.tx_hash.slice(0, 8)}…${p.tx_hash.slice(-6)}` : '—'}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold ${
                        p.status === 'sent' ? 'text-emerald-400' : 'text-yellow-400'
                      }`}>{p.status || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {Math.ceil(payoutsTotal / PAYOUTS_LIMIT) > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
              <p className="text-[12px] text-[#334155]">
                Showing {((payoutsPage - 1) * PAYOUTS_LIMIT) + 1}–{Math.min(payoutsPage * PAYOUTS_LIMIT, payoutsTotal)} of {payoutsTotal}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPayoutsPage((p) => Math.max(1, p - 1))}
                  disabled={payoutsPage === 1}
                  className="px-3 py-1 text-[12px] font-semibold text-[#4a5568] border border-white/[0.08] rounded-md hover:text-[#94a3b8] disabled:opacity-30 transition-colors"
                >Prev</button>
                <span className="px-3 py-1 text-[12px] text-[#4a5568]">{payoutsPage} / {Math.ceil(payoutsTotal / PAYOUTS_LIMIT)}</span>
                <button
                  onClick={() => setPayoutsPage((p) => Math.min(Math.ceil(payoutsTotal / PAYOUTS_LIMIT), p + 1))}
                  disabled={payoutsPage >= Math.ceil(payoutsTotal / PAYOUTS_LIMIT)}
                  className="px-3 py-1 text-[12px] font-semibold text-[#4a5568] border border-white/[0.08] rounded-md hover:text-[#94a3b8] disabled:opacity-30 transition-colors"
                >Next</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
