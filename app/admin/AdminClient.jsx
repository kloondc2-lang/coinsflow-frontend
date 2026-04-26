'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.coinsflow.net';
const ADMIN_EMAIL = 'mra88811@gmail.com';

function StatCard({ label, value, color }) {
  return (
    <div className="p-5 rounded-xl border border-white/[0.07] bg-[#020d1c]">
      <p className="text-[10.5px] font-semibold text-[#334155] uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-[30px] font-extrabold tracking-tight ${color || 'text-white'}`}>{value ?? '—'}</p>
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
      if (res.ok) setStats(await res.json());
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

  useEffect(() => {
    if (!token) return;
    fetchStats(token);
    fetchKeys(token, page, search);
  }, [token, page, search, fetchStats, fetchKeys]);

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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard label="Total Keys"   value={stats?.totalKeys}   />
          <StatCard label="Active Keys"  value={stats?.activeKeys}  color="text-emerald-400" />
          <StatCard label="Revoked Keys" value={stats?.revokedKeys} color="text-red-400" />
          <StatCard label="Total Users"  value={stats?.totalUsers}  color="text-blue-400" />
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
      </div>
    </div>
  );
}
