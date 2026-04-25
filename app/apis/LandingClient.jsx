'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function IconHash() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />
    </svg>
  );
}
function IconZap() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconActivity() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
function IconCopy({ copied }) {
  if (copied) {
    return (
      <svg width="13" height="13" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

// ── Terminal mockup ───────────────────────────────────────────────────────────
const DEMO_CODE = `curl https://api.coinsflow.net/v1/address/ltc/\\
  LXqvJaXc9xC8UjFEDRTDjzD8bNHzMpBMQJ \\
  -H "X-API-Key: cf_live_your_key_here"`;

const DEMO_RESPONSE = `{
  "address": "LXqvJaXc9xC8...",
  "balance": 4.72819341,
  "total_received": 48.00000000,
  "total_sent": 43.27180659,
  "tx_count": 217,
  "chain": "litecoin"
}`;

function TerminalMockup() {
  const [showResponse, setShowResponse] = useState(false);
  const [copied, setCopied] = useState(false);
  const [typed, setTyped] = useState('');
  const idx = useRef(0);

  useEffect(() => {
    if (idx.current < DEMO_CODE.length) {
      const t = setTimeout(() => {
        setTyped(DEMO_CODE.slice(0, idx.current + 1));
        idx.current++;
      }, 18);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setShowResponse(true), 400);
      return () => clearTimeout(t);
    }
  }, [typed]);

  function copy() {
    navigator.clipboard.writeText(DEMO_CODE.replace(/\\\n\s+/g, ' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative rounded-xl border border-white/[0.07] bg-[#050e1c] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-[#071423]">
        <span className="w-3 h-3 rounded-full bg-[#3a3f4b]" />
        <span className="w-3 h-3 rounded-full bg-[#3a3f4b]" />
        <span className="w-3 h-3 rounded-full bg-[#3a3f4b]" />
        <span className="ml-3 text-[11px] text-[#4a5568] font-mono">terminal</span>
        <button
          onClick={copy}
          className="ml-auto flex items-center gap-1 text-[11px] text-[#4a5568] hover:text-[#94a3b8] transition-colors"
        >
          <IconCopy copied={copied} />
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      {/* Request */}
      <div className="px-5 pt-4 pb-3">
        <span className="text-[#4ade80] text-xs font-mono">$ </span>
        <span className="text-[#e2e8f0] text-xs font-mono whitespace-pre-wrap leading-relaxed">{typed}</span>
        <span className="inline-block w-[2px] h-[13px] bg-blue-400 ml-0.5 animate-[blink_1s_infinite]" style={{ verticalAlign: '-2px' }} />
      </div>
      {/* Response */}
      {showResponse && (
        <div className="px-5 pb-4 border-t border-white/[0.04] pt-3 animate-[cf-fade-up_0.4s_ease_forwards]">
          <div className="text-[11px] text-[#4a5568] font-mono mb-1.5">HTTP 200 OK</div>
          <pre className="text-[11.5px] font-mono leading-relaxed text-[#94a3b8] whitespace-pre-wrap">
            {DEMO_RESPONSE.split('\n').map((line, i) => {
              const keyMatch = line.match(/^(\s*)"([^"]+)":/);
              const numMatch = line.match(/:\s*([\d.]+),?$/);
              if (keyMatch) {
                return (
                  <span key={i} className="block">
                    <span className="text-[#94a3b8]">{line.slice(0, line.indexOf('"') + 1)}</span>
                    <span className="text-blue-400">{keyMatch[2]}</span>
                    <span className="text-[#94a3b8]">{line.slice(line.indexOf(keyMatch[2]) + keyMatch[2].length)}</span>
                  </span>
                );
              }
              if (numMatch) {
                return (
                  <span key={i} className="block">
                    <span className="text-[#94a3b8]">{line.replace(numMatch[1], '')}</span>
                    <span className="text-emerald-400">{numMatch[1]}</span>
                    {line.endsWith(',') ? <span className="text-[#94a3b8]">,</span> : null}
                  </span>
                );
              }
              return <span key={i} className="block">{line}</span>;
            })}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Endpoint pill ─────────────────────────────────────────────────────────────
function Method({ m }) {
  const colors = {
    GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${colors[m] || 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
      {m}
    </span>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, className = '' }) {
  return (
    <div className={`cf-fade-up-item group relative p-6 rounded-xl border border-white/[0.07] bg-[#0a1628] hover:border-blue-500/25 hover:bg-[#0c1d38] transition-all duration-300 ${className}`}>
      <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-400 mb-4">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-[#e2e8f0] mb-1.5">{title}</h3>
      <p className="text-[13.5px] text-[#64748b] leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Endpoint row ──────────────────────────────────────────────────────────────
const ENDPOINTS = [
  { method: 'GET', path: '/v1/address/ltc/:address', desc: 'Balance, tx history, total flow' },
  { method: 'GET', path: '/v1/tx/ltc/:txid', desc: 'Inputs, outputs, confirmations, fee' },
  { method: 'GET', path: '/v1/block/ltc/:hash', desc: 'Block header, tx list, timestamp' },
  { method: 'GET', path: '/v1/blocks/ltc', desc: 'Latest 10 confirmed blocks' },
  { method: 'GET', path: '/v1/price/ltc', desc: 'Live USD price with 24h change' },
];

// ── Stat pill ─────────────────────────────────────────────────────────────────
function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-[#e2e8f0] tracking-tight">{value}</div>
      <div className="text-[12px] text-[#4a5568] mt-0.5">{label}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LandingClient() {
  useEffect(() => {
    const els = document.querySelectorAll('.cf-fade-up-item');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('cf-visible');
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.08 }
    );
    els.forEach((el, i) => {
      el.style.setProperty('--cf-delay', `${i * 60}ms`);
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#020d1c] text-[#e2e8f0]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6 md:px-12 max-w-[1280px] mx-auto">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-[-120px] left-[20%] w-[600px] h-[500px] rounded-full bg-blue-600/8 blur-[120px]" />
        <div className="pointer-events-none absolute top-[60px] right-[5%] w-[400px] h-[400px] rounded-full bg-indigo-600/6 blur-[100px]" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="cf-fade-up-item inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/8 text-blue-400 text-[12px] font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              REST API — Free tier available
            </div>
            <h1 className="cf-fade-up-item text-[42px] md:text-[56px] font-extrabold tracking-tight leading-[1.06] text-white mb-5">
              Blockchain data,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">
                straight from the chain.
              </span>
            </h1>
            <p className="cf-fade-up-item text-[17px] text-[#64748b] leading-relaxed max-w-[520px] mb-8">
              Query Litecoin addresses, transactions, blocks, and live prices with a single HTTP call. One API key, no SDK required.
            </p>
            <div className="cf-fade-up-item flex flex-wrap gap-3">
              <Link
                href="/apis/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold transition-all duration-200 active:scale-[0.97]"
              >
                Get API Key <IconArrow />
              </Link>
              <Link
                href="/apis/docs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/[0.1] hover:border-white/[0.18] hover:bg-white/[0.04] text-[#94a3b8] hover:text-[#e2e8f0] text-[14px] font-semibold transition-all duration-200 active:scale-[0.97]"
              >
                View Docs <IconArrow />
              </Link>
            </div>
          </div>

          {/* Right — terminal */}
          <div className="cf-fade-up-item lg:block hidden">
            <TerminalMockup />
          </div>
        </div>

        {/* Stats strip */}
        <div className="cf-fade-up-item mt-16 flex flex-wrap justify-start gap-10 pt-10 border-t border-white/[0.06]">
          <Stat value="5" label="endpoints" />
          <Stat value="200ms" label="avg response" />
          <Stat value="Free" label="starter tier" />
          <Stat value="REST" label="JSON responses" />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 max-w-[1280px] mx-auto pb-24">
        <div className="mb-10">
          <h2 className="cf-fade-up-item text-[28px] md:text-[34px] font-bold text-white tracking-tight mb-3">
            Everything you need.
          </h2>
          <p className="cf-fade-up-item text-[15px] text-[#4a5568]">
            Full blockchain visibility in a few lines of code.
          </p>
        </div>

        {/* Asymmetric 2-col + 1 wide grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <FeatureCard
            icon={<IconHash />}
            title="Address Lookup"
            desc="Query any Litecoin address for current balance, total received, total sent, and full transaction history."
          />
          <FeatureCard
            icon={<IconActivity />}
            title="Transaction Detail"
            desc="Inspect any transaction — inputs, outputs, fees, confirmations, and block inclusion time."
          />
          <FeatureCard
            icon={<IconZap />}
            title="Block Data"
            desc="Fetch block headers, transaction lists, miner info, and difficulty for any block height or hash."
          />
          <FeatureCard
            className="md:col-span-2 xl:col-span-1"
            icon={<IconShield />}
            title="Live Price Feed"
            desc="Real-time LTC/USD price with 24-hour percentage change, sourced and cached for low latency."
          />
          <div className="cf-fade-up-item md:col-span-2 p-6 rounded-xl border border-white/[0.07] bg-[#0a1628]">
            <p className="text-[11px] font-semibold text-[#334155] uppercase tracking-widest mb-4">Authentication</p>
            <p className="text-[15px] font-semibold text-[#e2e8f0] mb-3">One header. Always.</p>
            <div className="font-mono text-[12.5px] bg-[#040c1a] border border-white/[0.06] rounded-lg px-4 py-3 text-[#94a3b8]">
              <span className="text-[#4a5568]">X-API-Key: </span>
              <span className="text-blue-400">cf_live_...</span>
            </div>
            <p className="mt-3 text-[13px] text-[#4a5568]">
              Pass your key in the request header. No OAuth, no tokens, no complexity.
            </p>
          </div>
        </div>
      </section>

      {/* ── Endpoints preview ─────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.05] px-6 md:px-12 max-w-[1280px] mx-auto py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="cf-fade-up-item text-[28px] md:text-[34px] font-bold text-white tracking-tight mb-2">
              API Reference
            </h2>
            <p className="cf-fade-up-item text-[15px] text-[#4a5568]">Five endpoints covering the full Litecoin data surface.</p>
          </div>
          <Link href="/apis/docs" className="cf-fade-up-item flex-shrink-0 inline-flex items-center gap-2 text-[13px] text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Full documentation <IconArrow />
          </Link>
        </div>

        <div className="rounded-xl border border-white/[0.07] overflow-hidden divide-y divide-white/[0.05]">
          {ENDPOINTS.map((ep, i) => (
            <div
              key={ep.path}
              className="cf-fade-up-item flex flex-wrap items-center gap-3 md:gap-6 px-5 py-4 bg-[#0a1628] hover:bg-[#0c1d38] transition-colors duration-200 group"
              style={{ '--cf-delay': `${i * 60}ms` }}
            >
              <Method m={ep.method} />
              <code className="text-[13px] font-mono text-[#94a3b8] group-hover:text-[#e2e8f0] transition-colors">
                {ep.path}
              </code>
              <span className="hidden md:block text-[13px] text-[#4a5568] ml-auto pr-2">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.05] px-6 md:px-12 max-w-[1280px] mx-auto py-24">
        <h2 className="cf-fade-up-item text-[28px] md:text-[34px] font-bold text-white tracking-tight mb-12 text-center">
          Start free. Scale when you need to.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[760px] mx-auto">
          {/* Free tier */}
          <div className="cf-fade-up-item p-7 rounded-xl border border-white/[0.07] bg-[#0a1628]">
            <p className="text-[12px] font-semibold text-[#334155] uppercase tracking-widest mb-4">Free</p>
            <p className="text-[38px] font-extrabold text-white tracking-tight mb-1">$0<span className="text-[16px] font-normal text-[#4a5568]">/mo</span></p>
            <p className="text-[13.5px] text-[#4a5568] mb-6">No credit card required.</p>
            <ul className="space-y-2.5 text-[13.5px] text-[#64748b]">
              {['500 requests / day', 'All 5 endpoints', 'JSON responses', 'Email support'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <svg width="8" height="8" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/apis/dashboard" className="mt-7 block text-center px-5 py-2.5 rounded-lg border border-white/[0.1] hover:border-blue-500/40 hover:bg-blue-500/5 text-[14px] font-semibold text-[#94a3b8] hover:text-blue-400 transition-all duration-200 active:scale-[0.97]">
              Get started free
            </Link>
          </div>
          {/* Pro tier */}
          <div className="cf-fade-up-item p-7 rounded-xl border border-blue-500/30 bg-[#0a1628] relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-blue-500/[0.03]" />
            <p className="text-[12px] font-semibold text-blue-400 uppercase tracking-widest mb-4">Pro</p>
            <p className="text-[38px] font-extrabold text-white tracking-tight mb-1">$9<span className="text-[16px] font-normal text-[#4a5568]">/mo</span></p>
            <p className="text-[13.5px] text-[#4a5568] mb-6">Billed monthly, cancel anytime.</p>
            <ul className="space-y-2.5 text-[13.5px] text-[#64748b]">
              {['50,000 requests / day', 'All 5 endpoints', 'Priority response time', 'Webhook support (soon)', 'Priority support'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <svg width="8" height="8" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/apis/dashboard" className="relative mt-7 block text-center px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[14px] font-semibold text-white transition-all duration-200 active:scale-[0.97]">
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.05] px-6 md:px-12 py-24 text-center">
        <h2 className="cf-fade-up-item text-[30px] md:text-[40px] font-extrabold text-white tracking-tight mb-4">
          Ready to build?
        </h2>
        <p className="cf-fade-up-item text-[16px] text-[#4a5568] mb-8 max-w-[500px] mx-auto">
          Create your free account, generate a key, and make your first request in under two minutes.
        </p>
        <div className="cf-fade-up-item flex flex-wrap gap-3 justify-center">
          <Link href="/apis/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold transition-all duration-200 active:scale-[0.97]">
            Create free account <IconArrow />
          </Link>
          <Link href="/apis/docs" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/[0.1] hover:border-white/[0.18] text-[#94a3b8] hover:text-white text-[14px] font-semibold transition-all duration-200 active:scale-[0.97]">
            Read the docs <IconArrow />
          </Link>
        </div>
      </section>
    </div>
  );
}
