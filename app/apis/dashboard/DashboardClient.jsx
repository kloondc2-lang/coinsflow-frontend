'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

// ── Inline icons ──────────────────────────────────────────────────────────────
function IconKey() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="7.5" cy="15.5" r="5.5" /><path d="M21 2l-9.6 9.6M15.5 7.5l3 3" />
    </svg>
  );
}
function IconActivity() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function IconDocs() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function IconSignOut() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
    <svg width="13" height="13" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
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

// ── Generate secure API key ───────────────────────────────────────────────────
function generateApiKey() {
  const arr = new Uint8Array(32);
  window.crypto.getRandomValues(arr);
  return 'cf_live_' + Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ── Usage SVG Area Chart ──────────────────────────────────────────────────────
function UsageChart({ data }) {
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRendered(true), 100);
    return () => clearTimeout(t);
  }, []);

  const W = 600, H = 160;
  const padL = 0, padR = 0, padT = 8, padB = 24;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxVal = Math.max(...data.map((d) => d.count), 1);

  const pts = data.map((d, i) => ({
    x: padL + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
    y: padT + chartH - (d.count / maxVal) * chartH,
    ...d,
  }));

  const smooth = (points) => {
    if (points.length < 2) return points.map((p) => `L ${p.x} ${p.y}`).join(' ');
    return points.map((p, i, arr) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = arr[i - 1];
      const cpX1 = prev.x + (p.x - prev.x) * 0.4;
      const cpX2 = p.x - (p.x - prev.x) * 0.4;
      return `C ${cpX1} ${prev.y}, ${cpX2} ${p.y}, ${p.x} ${p.y}`;
    }).join(' ');
  };

  const linePath = smooth(pts);
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const areaPath = `${linePath} L ${lastPt.x} ${padT + chartH} L ${firstPt.x} ${padT + chartH} Z`;

  const isEmpty = maxVal <= 0 || data.every((d) => d.count === 0);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: '160px' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={isEmpty ? "0.04" : "0.18"} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <clipPath id="chartClip">
            <rect
              x="0" y="0" width={W} height={H}
              style={{
                transform: rendered ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </clipPath>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={frac}
            x1={padL} y1={padT + chartH * (1 - frac)}
            x2={W - padR} y2={padT + chartH * (1 - frac)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#chartFill)" clipPath="url(#chartClip)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={isEmpty ? 'rgba(59,130,246,0.15)' : '#3b82f6'}
          strokeWidth="1.5"
          strokeLinecap="round"
          clipPath="url(#chartClip)"
        />

        {/* Data points */}
        {!isEmpty && pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y} r="3"
            fill="#020d1c" stroke="#3b82f6" strokeWidth="1.5"
            style={{ opacity: rendered ? 1 : 0, transition: `opacity 0.3s ${0.8 + i * 0.05}s` }}
          />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = padL + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
          const show = data.length <= 10 || i % Math.ceil(data.length / 8) === 0 || i === data.length - 1;
          if (!show) return null;
          return (
            <text
              key={i}
              x={x} y={H - 2}
              textAnchor="middle"
              fontSize="8"
              fill="rgba(74,85,104,0.8)"
              fontFamily="ui-monospace, monospace"
            >
              {d.label}
            </text>
          );
        })}
      </svg>

      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pb-4">
          <p className="text-[12px] text-[#334155] font-mono">no data yet — start making requests</p>
        </div>
      )}
    </div>
  );
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({ label, value, sub, accent }) {
  return (
    <div className="p-5 rounded-xl border border-white/[0.07] bg-[#020d1c] hover:border-white/[0.1] transition-all duration-300">
      <p className="text-[10.5px] font-semibold text-[#334155] uppercase tracking-widest mb-3">{label}</p>
      <p className={`text-[28px] font-extrabold tracking-tight ${accent ? 'text-blue-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-[11.5px] text-[#4a5568] mt-0.5">{sub}</p>}
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
  const [usageLogs, setUsageLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyVisible, setKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedEp, setCopiedEp] = useState(null);
  const [creating, setCreating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('7d');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
    // Try loading usage logs (table may not exist yet — handle gracefully)
    try {
      const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 365;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data: logs } = await supabase
        .from('api_usage')
        .select('date, request_count')
        .eq('user_id', uid)
        .gte('date', since.toISOString().split('T')[0])
        .order('date', { ascending: true });
      if (logs) setUsageLogs(logs);
    } catch (_) {
      // api_usage table doesn't exist yet — skip
    }
  }, [period]);

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

  // Re-fetch usage when period changes
  useEffect(() => {
    if (user) loadData(user.id);
  }, [period, user, loadData]);

  // Build chart data — fill in missing days with 0
  const chartData = useMemo(() => {
    if (period === '1d') {
      const today = new Date().toISOString().split('T')[0];
      const todayLog = usageLogs.find((l) => l.date === today);
      const currentHour = new Date().getHours();
      return Array.from({ length: 24 }, (_, i) => {
        const d = new Date();
        d.setHours(i, 0, 0, 0);
        const label = d.toLocaleString('en-US', { hour: 'numeric', hour12: true });
        return { label, count: i === currentHour ? (todayLog?.request_count ?? 0) : 0 };
      });
    }

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 12;
    const isMonths = period === '1y';

    if (isMonths) {
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const found = usageLogs.find((l) => l.date?.startsWith(key));
        return {
          label: d.toLocaleString('en-US', { month: 'short' }),
          count: found?.request_count ?? 0,
        };
      });
    }

    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split('T')[0];
      const found = usageLogs.find((l) => l.date === key);
      const label = days === 1
        ? d.toLocaleString('en-US', { hour: 'numeric', hour12: true })
        : days <= 7
        ? d.toLocaleString('en-US', { weekday: 'short' })
        : String(d.getDate());
      return { label, count: found?.request_count ?? 0 };
    });
  }, [usageLogs, period]);

  const periodTotal = useMemo(
    () => chartData.reduce((s, d) => s + d.count, 0),
    [chartData]
  );

  async function createKey() {
    if (!supabase || !user) return;
    setCreating(true);
    try {
      const newKey = generateApiKey();
      const { error } = await supabase.from('api_keys').insert({
        user_id: user.id, api_key: newKey, name: 'Default Key', is_active: true, request_count: 0,
      });
      if (error) throw error;
      setApiKey(newKey); setRequestCount(0); setLastUsed(null); setKeyVisible(true);
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
      await supabase.from('api_keys').update({ is_active: false }).eq('user_id', user.id);
      const newKey = generateApiKey();
      const { error } = await supabase.from('api_keys').insert({
        user_id: user.id, api_key: newKey, name: keyName, is_active: true, request_count: 0,
      });
      if (error) throw error;
      setApiKey(newKey); setRequestCount(0); setLastUsed(null); setKeyVisible(true);
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

  function copyExample(ep) {
    const key = apiKey || 'cf_live_your_key_here';
    const examples = {
      '/v1/price/ltc': `curl https://api.coinsflow.net/v1/price/ltc -H "X-API-Key: ${key}"`,
      '/v1/address/ltc/{address}': `curl "https://api.coinsflow.net/v1/address/ltc/LMURqs4tNveEY75pzFQpPiBR67fgqUPmgT" -H "X-API-Key: ${key}"`,
      '/v1/tx/ltc/{txid}': `curl "https://api.coinsflow.net/v1/tx/ltc/07de5fb0c9ac8a3380e2fa62cae70e89680c0b87aa4b92acfb1497ddbb6e02f4" -H "X-API-Key: ${key}"`,
      '/v1/block/ltc/{hash}': `curl "https://api.coinsflow.net/v1/block/ltc/f2cb635024c61f14257716e8ae12a376e5d811c22d81066e3003c84ea4d66af2" -H "X-API-Key: ${key}"`,
      '/v1/blocks/ltc': `curl https://api.coinsflow.net/v1/blocks/ltc -H "X-API-Key: ${key}"`,
    };
    navigator.clipboard.writeText(examples[ep] || '');
    setCopiedEp(ep);
    setTimeout(() => setCopiedEp(null), 2000);
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    router.push('/apis/auth');
  }

  const maskedKey = apiKey
    ? apiKey.slice(0, 12) + '••••••••••••••••••••••••••' + apiKey.slice(-4)
    : '';

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#020d1c] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const NAV_ITEMS = [
    { id: 'overview', icon: <IconActivity />, label: 'Overview' },
    { id: 'keys',     icon: <IconKey />,      label: 'API Keys' },
    { id: 'docs',     icon: <IconDocs />,     label: 'Docs',    href: '/apis/docs' },
  ];

  const PERIODS = [
    { id: '1d',  label: '1D' },
    { id: '7d',  label: '7D' },
    { id: '30d', label: '30D' },
    { id: '1y',  label: '1Y' },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#020d1c] text-[#e2e8f0]">

      {/* ── Mobile nav drawer ───────────────────────────────────────── */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-10 w-64 max-w-[80vw] min-h-full bg-[#0a1628] border-r border-white/[0.08] flex flex-col py-8 px-4">
            <div className="mb-8 px-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-[#334155] uppercase tracking-widest">Workspace</span>
              </div>
              <p className="text-[12.5px] font-medium text-[#4a5568] truncate">{user?.email}</p>
            </div>
            <nav className="flex flex-col gap-0.5 flex-1">
              {NAV_ITEMS.map((item) =>
                item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-[14px] text-[#4a5568] hover:text-[#94a3b8] hover:bg-white/[0.04] transition-colors"
                  >
                    {item.icon} {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileNavOpen(false); }}
                    className={`flex items-center gap-2.5 px-3 py-3 rounded-lg text-[14px] transition-all text-left w-full ${
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
              onClick={() => { setMobileNavOpen(false); signOut(); }}
              className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-[14px] text-[#334155] hover:text-red-400 hover:bg-red-500/5 transition-colors"
            >
              <IconSignOut /> Sign out
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto flex min-h-[calc(100dvh-68px)]">

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-[180px] flex-shrink-0 border-r border-white/[0.06] py-8 px-3">
          <div className="mb-8 px-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-[#334155] uppercase tracking-widest">Workspace</span>
            </div>
            <p className="text-[12.5px] font-medium text-[#4a5568] truncate">{user?.email}</p>
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all text-left w-full ${
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

          {/* Page header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[20px] font-bold text-white tracking-tight">
                {activeTab === 'overview' ? 'Overview' : 'API Keys'}
              </h1>
              <p className="text-[12.5px] text-[#4a5568] mt-0.5">
                {activeTab === 'overview'
                  ? `Welcome back, ${user?.email?.split('@')[0]}`
                  : 'Manage your API credentials'}
              </p>
            </div>
            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-[#4a5568] hover:text-[#94a3b8] hover:bg-white/[0.04] transition-colors"
              aria-label="Open navigation"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>

          {/* ── Overview ──────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-5" style={{ animation: 'cf-slide-up 0.3s cubic-bezier(0.16,1,0.3,1) forwards' }}>

              {/* Stat tiles */}
              <div className="grid grid-cols-2 gap-3">
                <StatTile
                  label="Total Requests"
                  value={requestCount.toLocaleString()}
                  sub="All time"
                  accent={false}
                />
                <StatTile
                  label="Plan"
                  value="Free"
                  sub={<span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25 uppercase tracking-wider">Beta</span>Unlimited</span>}
                  accent
                />
              </div>

              {/* Usage chart */}
              <div className="p-5 rounded-xl border border-white/[0.07] bg-[#020d1c]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[13px] font-semibold text-[#e2e8f0]">Request Volume</p>
                    <p className="text-[11.5px] text-[#4a5568] mt-0.5">
                      <span className="font-mono text-[#94a3b8] font-semibold">{periodTotal.toLocaleString()}</span>
                      {' '}requests this period
                    </p>
                  </div>
                  {/* Period selector */}
                  <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#040c1a] border border-white/[0.06]">
                    {PERIODS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPeriod(p.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                          period === p.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-[#4a5568] hover:text-[#94a3b8]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <UsageChart data={chartData} />
              </div>

              {/* API key quick view */}
              <div className="grid grid-cols-1 gap-4">
                {/* Key preview */}
                <div className="p-5 rounded-xl border border-white/[0.07] bg-[#020d1c]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px] font-semibold text-[#334155] uppercase tracking-widest">API Key</p>
                    <button onClick={() => setActiveTab('keys')} className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold transition-colors">Manage</button>
                  </div>
                  {apiKey ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#040c1a] border border-white/[0.06] font-mono text-[12px] text-[#64748b]">
                      <span className="flex-1 truncate">{maskedKey}</span>
                      <button onClick={copyKey} className="flex-shrink-0 text-[#4a5568] hover:text-[#94a3b8] transition-colors">
                        <IconCopy copied={copied} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setActiveTab('keys')} className="text-[13px] text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                      Create your first key →
                    </button>
                  )}
                </div>

              </div>

              {/* Endpoints */}
              <div className="p-5 rounded-xl border border-white/[0.07] bg-[#020d1c]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[12px] font-semibold text-[#334155] uppercase tracking-widest">Available Endpoints</p>
                  <Link href="/apis/docs" className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold transition-colors">View docs →</Link>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {[
                    '/v1/price/ltc',
                    '/v1/address/ltc/{address}',
                    '/v1/tx/ltc/{txid}',
                    '/v1/block/ltc/{hash}',
                    '/v1/blocks/ltc',
                  ].map((ep) => (
                    <div key={ep} className="flex items-center gap-3 py-2.5 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors">
                      <span className="text-[9.5px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">GET</span>
                      <code className="text-[12.5px] font-mono text-[#64748b] flex-1 min-w-0 truncate">{ep}</code>
                      <button
                        onClick={() => copyExample(ep)}
                        className="text-[10.5px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
                      >
                        {copiedEp === ep ? 'copied!' : 'copy example'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Keys tab ──────────────────────────────────────────────── */}
          {activeTab === 'keys' && (
            <div className="space-y-5" style={{ animation: 'cf-slide-up 0.3s cubic-bezier(0.16,1,0.3,1) forwards' }}>
              {!apiKey ? (
                <div className="p-10 rounded-xl border border-dashed border-white/[0.1] bg-[#020d1c] text-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-4">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="7.5" cy="15.5" r="5.5" /><path d="M21 2l-9.6 9.6M15.5 7.5l3 3" />
                    </svg>
                  </div>
                  <h3 className="text-[16px] font-semibold text-white mb-2">No API key yet</h3>
                  <p className="text-[13.5px] text-[#4a5568] mb-6 max-w-[340px] mx-auto">
                    Generate your free API key to start making requests.
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
                <div className="p-6 rounded-xl border border-white/[0.07] bg-[#020d1c]">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="text-[15px] font-semibold text-white">{keyName}</p>
                      <p className="text-[12px] text-[#4a5568] mt-0.5">
                        {requestCount.toLocaleString()} total requests
                        {lastUsed ? ` · Last used ${new Date(lastUsed).toLocaleDateString()}` : ' · Never used'}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  </div>

                  {/* Key display */}
                  <div className="flex items-center gap-2 px-3.5 py-3 rounded-lg bg-[#040c1a] border border-white/[0.06] mb-5">
                    <span className="flex-1 font-mono text-[12.5px] text-[#94a3b8] truncate">
                      {keyVisible ? apiKey : maskedKey}
                    </span>
                    <button
                      onClick={() => setKeyVisible((v) => !v)}
                      className="flex-shrink-0 text-[#4a5568] hover:text-[#94a3b8] transition-colors p-1"
                    >
                      <IconEye open={keyVisible} />
                    </button>
                    <button
                      onClick={copyKey}
                      className="flex-shrink-0 text-[#4a5568] hover:text-[#94a3b8] transition-colors p-1"
                    >
                      <IconCopy copied={copied} />
                    </button>
                  </div>

                  {/* Plan info */}
                  <div className="flex items-center justify-between py-3 border-y border-white/[0.05] mb-5">
                    <div>
                      <p className="text-[11px] font-semibold text-[#334155] uppercase tracking-widest mb-0.5">Plan</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-[#e2e8f0]">Free</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25 uppercase tracking-wider">Beta</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-[#334155] uppercase tracking-widest mb-0.5">Limit</p>
                      <p className="text-[13.5px] font-semibold text-emerald-400">Unlimited</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={regenerateKey}
                      disabled={regenerating}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.1] hover:border-white/[0.18] text-[13px] text-[#64748b] hover:text-[#e2e8f0] font-semibold transition-all active:scale-[0.97] disabled:opacity-60"
                    >
                      <IconRefresh spinning={regenerating} />
                      {regenerating ? 'Regenerating…' : 'Regenerate key'}
                    </button>
                  </div>

                  <div className="mt-5 p-3.5 rounded-lg border border-yellow-500/15 bg-yellow-500/5 text-[12.5px] text-[#64748b] leading-relaxed">
                    <span className="text-yellow-400 font-semibold">Keep this private.</span> Never commit your API key to version control or expose it in client-side code.
                  </div>
                </div>
              )}

              {/* Usage panel in keys tab */}
              <div className="p-5 rounded-xl border border-white/[0.07] bg-[#020d1c]">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[13px] font-semibold text-[#e2e8f0]">Usage</p>
                  <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#040c1a] border border-white/[0.06]">
                    {PERIODS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPeriod(p.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                          period === p.id
                            ? 'bg-blue-600 text-white'
                            : 'text-[#4a5568] hover:text-[#94a3b8]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-6 mb-4">
                  <div>
                    <p className="text-[10.5px] font-semibold text-[#334155] uppercase tracking-widest mb-0.5">This period</p>
                    <p className="text-[22px] font-extrabold text-white font-mono">{periodTotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10.5px] font-semibold text-[#334155] uppercase tracking-widest mb-0.5">All time</p>
                    <p className="text-[22px] font-extrabold text-white font-mono">{requestCount.toLocaleString()}</p>
                  </div>
                </div>
                <UsageChart data={chartData} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
