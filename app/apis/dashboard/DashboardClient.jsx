'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

// ── Inline icons ──────────────────────────────────────────────────────────────
function IconKey() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="7.5" cy="15.5" r="5.5" /><path d="M21 2l-9.6 9.6M15.5 7.5l3 3" />
    </svg>
  );
}
function IconActivity() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function IconDocs() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function IconSignOut() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
function IconRefresh({ spinning }) {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className={spinning ? 'animate-spin' : ''}>
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}
function IconCopy({ copied }) {
  if (copied) return (
    <svg width="13" height="13" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
  );
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}
function IconEye({ open }) {
  if (open) return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" />
    </svg>
  );
}

// ── Generate a cryptographically secure API key ───────────────────────────────
function generateApiKey() {
  const arr = new Uint8Array(32);
  window.crypto.getRandomValues(arr);
  return 'cf_live_' + Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }) {
  return (
    <div className="p-5 rounded-xl border border-white/[0.07] bg-[#0a1628]">
      <p className="text-[11px] font-semibold text-[#334155] uppercase tracking-widest mb-2">{label}</p>
      <p className="text-[28px] font-extrabold text-white tracking-tight">{value}</p>
      {sub && <p className="text-[12px] text-[#4a5568] mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [keyName, setKeyName] = useState('Default Key');
  const [requestCount, setRequestCount] = useState(0);
  const [lastUsed, setLastUsed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyVisible, setKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = useCallback(async (uid) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', uid)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (data) {
      setApiKey(data.api_key);
      setKeyName(data.name);
      setRequestCount(data.request_count ?? 0);
      setLastUsed(data.last_used_at);
    }
  }, []);

  useEffect(() => {
    if (!supabase) { router.push('/apis/auth'); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/apis/auth'); return; }
      setUser(session.user);
      loadData(session.user.id).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { router.push('/apis/auth'); }
    });
    return () => subscription.unsubscribe();
  }, [router, loadData]);

  async function createKey() {
    if (!supabase || !user) return;
    setCreating(true);
    try {
      const newKey = generateApiKey();
      const { error } = await supabase.from('api_keys').insert({
        user_id: user.id,
        api_key: newKey,
        name: 'Default Key',
        is_active: true,
        request_count: 0,
      });
      if (error) throw error;
      setApiKey(newKey);
      setRequestCount(0);
      setLastUsed(null);
      setKeyVisible(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  async function regenerateKey() {
    if (!supabase || !user) return;
    const confirmed = window.confirm('Regenerate your API key? The old key will stop working immediately.');
    if (!confirmed) return;
    setRegenerating(true);
    try {
      // Deactivate all existing keys
      await supabase.from('api_keys').update({ is_active: false }).eq('user_id', user.id);
      // Create new key
      const newKey = generateApiKey();
      const { error } = await supabase.from('api_keys').insert({
        user_id: user.id,
        api_key: newKey,
        name: keyName,
        is_active: true,
        request_count: 0,
      });
      if (error) throw error;
      setApiKey(newKey);
      setRequestCount(0);
      setLastUsed(null);
      setKeyVisible(true);
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  }

  function copyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    router.push('/apis/auth');
  }

  const maskedKey = apiKey
    ? apiKey.slice(0, 12) + '••••••••••••••••••••••••••••••••' + apiKey.slice(-4)
    : '';

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#020d1c] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const NAV_ITEMS = [
    { id: 'overview', icon: <IconActivity />, label: 'Overview' },
    { id: 'keys', icon: <IconKey />, label: 'API Keys' },
    { id: 'docs', icon: <IconDocs />, label: 'Docs', href: '/apis/docs' },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#020d1c] text-[#e2e8f0]">
      <div className="max-w-[1280px] mx-auto flex min-h-[calc(100dvh-68px)]">

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-[220px] flex-shrink-0 border-r border-white/[0.06] py-8 px-4">
          <div className="mb-8">
            <p className="text-[10px] font-semibold text-[#334155] uppercase tracking-widest px-3 mb-1">Workspace</p>
            <p className="text-[13px] font-semibold text-[#64748b] px-3 truncate">{user?.email}</p>
          </div>
          <nav className="flex flex-col gap-0.5 flex-1">
            {NAV_ITEMS.map((item) =>
              item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#4a5568] hover:text-[#94a3b8] hover:bg-white/[0.04] transition-colors"
                >
                  {item.icon} {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors text-left w-full ${
                    activeTab === item.id
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-[#4a5568] hover:text-[#94a3b8] hover:bg-white/[0.04]'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              )
            )}
          </nav>
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#334155] hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <IconSignOut /> Sign out
          </button>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 md:px-8 xl:px-12 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[22px] font-bold text-white tracking-tight">
                {activeTab === 'overview' ? 'Overview' : 'API Keys'}
              </h1>
              <p className="text-[13px] text-[#4a5568] mt-0.5">
                {activeTab === 'overview' ? 'Your API usage at a glance.' : 'Manage your API credentials.'}
              </p>
            </div>
            {/* Mobile sign out */}
            <button onClick={signOut} className="md:hidden flex items-center gap-1.5 text-[12px] text-[#334155] hover:text-red-400 transition-colors">
              <IconSignOut /> Sign out
            </button>
          </div>

          {/* ── Overview tab ──────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard
                  label="Total Requests"
                  value={requestCount.toLocaleString()}
                  sub="All time"
                />
                <StatCard
                  label="Plan"
                  value="Free"
                  sub="500 req / day"
                />
                <StatCard
                  label="Last Used"
                  value={lastUsed ? new Date(lastUsed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  sub={lastUsed ? new Date(lastUsed).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                />
              </div>

              {/* API Key preview */}
              <div className="p-6 rounded-xl border border-white/[0.07] bg-[#0a1628]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[11px] font-semibold text-[#334155] uppercase tracking-widest mb-0.5">Your API Key</p>
                    <p className="text-[13px] text-[#4a5568]">{keyName}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('keys')}
                    className="text-[12px] text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    Manage
                  </button>
                </div>
                {apiKey ? (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#040c1a] border border-white/[0.06] font-mono text-[12.5px] text-[#94a3b8]">
                    <span className="flex-1 truncate">{maskedKey}</span>
                    <button onClick={copyKey} className="flex-shrink-0 text-[#4a5568] hover:text-[#94a3b8] transition-colors">
                      <IconCopy copied={copied} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveTab('keys')}
                    className="text-[13px] text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    Create your first key →
                  </button>
                )}
              </div>

              {/* Quick endpoints */}
              <div className="p-6 rounded-xl border border-white/[0.07] bg-[#0a1628]">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[14px] font-semibold text-[#e2e8f0]">Available endpoints</p>
                  <Link href="/apis/docs" className="text-[12px] text-blue-400 hover:text-blue-300 font-semibold">View docs →</Link>
                </div>
                <div className="space-y-2">
                  {[
                    '/v1/address/ltc/:address',
                    '/v1/tx/ltc/:txid',
                    '/v1/block/ltc/:hash',
                    '/v1/blocks/ltc',
                    '/v1/price/ltc',
                  ].map((ep) => (
                    <div key={ep} className="flex items-center gap-3 py-2 border-t border-white/[0.04]">
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">GET</span>
                      <code className="text-[12.5px] font-mono text-[#64748b]">{ep}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick start */}
              <div className="p-6 rounded-xl border border-white/[0.07] bg-[#0a1628]">
                <p className="text-[14px] font-semibold text-[#e2e8f0] mb-3">Quick start</p>
                <div className="rounded-lg border border-white/[0.06] overflow-hidden">
                  <div className="px-4 py-2 bg-[#040c1a] border-b border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#334155] uppercase tracking-wider">bash</span>
                  </div>
                  <pre className="px-4 py-3 bg-[#030b17] text-[11.5px] font-mono text-[#64748b] leading-relaxed overflow-x-auto whitespace-pre">
                    {`curl https://api.coinsflow.net/v1/price/ltc \\
  -H "X-API-Key: ${apiKey ? maskedKey : 'cf_live_your_key_here'}"`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ── Keys tab ──────────────────────────────────────────────── */}
          {activeTab === 'keys' && (
            <div className="space-y-6">
              {!apiKey ? (
                // No key yet — create
                <div className="p-8 rounded-xl border border-dashed border-white/[0.1] bg-[#0a1628] text-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-4">
                    <IconKey />
                  </div>
                  <h3 className="text-[16px] font-semibold text-white mb-2">No API key yet</h3>
                  <p className="text-[13.5px] text-[#4a5568] mb-6 max-w-[340px] mx-auto">
                    Generate your free API key to start making requests to the CoinsFlow blockchain API.
                  </p>
                  <button
                    onClick={createKey}
                    disabled={creating}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-[14px] font-semibold transition-all active:scale-[0.97]"
                  >
                    {creating ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>
                    ) : (
                      <><IconKey /> Generate API Key</>
                    )}
                  </button>
                </div>
              ) : (
                // Has key — show + manage
                <div className="p-6 rounded-xl border border-white/[0.07] bg-[#0a1628]">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="text-[16px] font-semibold text-white">{keyName}</p>
                      <p className="text-[12px] text-[#4a5568] mt-0.5">
                        {requestCount.toLocaleString()} total requests
                        {lastUsed ? ` · Last used ${new Date(lastUsed).toLocaleDateString()}` : ' · Never used'}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                  </div>

                  {/* Key display */}
                  <div className="flex items-center gap-2 px-3.5 py-3 rounded-lg bg-[#040c1a] border border-white/[0.06] mb-4">
                    <span className="flex-1 font-mono text-[12.5px] text-[#94a3b8] truncate">
                      {keyVisible ? apiKey : maskedKey}
                    </span>
                    <button
                      onClick={() => setKeyVisible((v) => !v)}
                      className="flex-shrink-0 text-[#4a5568] hover:text-[#94a3b8] transition-colors p-1"
                      title={keyVisible ? 'Hide key' : 'Reveal key'}
                    >
                      <IconEye open={keyVisible} />
                    </button>
                    <button
                      onClick={copyKey}
                      className="flex-shrink-0 text-[#4a5568] hover:text-[#94a3b8] transition-colors p-1"
                      title="Copy key"
                    >
                      <IconCopy copied={copied} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t border-white/[0.05]">
                    <button
                      onClick={regenerateKey}
                      disabled={regenerating}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.1] hover:border-white/[0.18] text-[13px] text-[#64748b] hover:text-[#e2e8f0] font-semibold transition-all active:scale-[0.97] disabled:opacity-60"
                    >
                      <IconRefresh spinning={regenerating} />
                      {regenerating ? 'Regenerating…' : 'Regenerate key'}
                    </button>
                  </div>

                  <div className="mt-4 p-3.5 rounded-lg border border-yellow-500/15 bg-yellow-500/5 text-[12.5px] text-[#64748b] leading-relaxed">
                    <span className="text-yellow-400 font-semibold">Keep this private.</span> Never commit your API key to version control or expose it in client-side code.
                  </div>
                </div>
              )}

              {/* Usage section */}
              <div className="p-6 rounded-xl border border-white/[0.07] bg-[#0a1628]">
                <p className="text-[14px] font-semibold text-white mb-4">Usage</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold text-[#334155] uppercase tracking-widest mb-1">Total requests</p>
                    <p className="text-[24px] font-extrabold text-white">{requestCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#334155] uppercase tracking-widest mb-1">Plan limit</p>
                    <p className="text-[24px] font-extrabold text-white">500<span className="text-[14px] font-normal text-[#4a5568]">/day</span></p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-[11px] text-[#4a5568] mb-1.5">
                    <span>Daily usage</span>
                    <span>0 / 500</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: '0%' }} />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.05]">
                  <p className="text-[12.5px] text-[#4a5568]">
                    Need more requests?{' '}
                    <Link href="/apis" className="text-blue-400 hover:text-blue-300 font-semibold">
                      Upgrade to Pro →
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
