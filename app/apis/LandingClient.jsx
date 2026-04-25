'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

// â”€â”€ Inline SVG icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
function IconClock() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconCode() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
function IconKey() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="7.5" cy="15.5" r="5.5" /><path d="M21 2l-9.6 9.6M15.5 7.5l3 3" />
    </svg>
  );
}

// â”€â”€ Terminal mockup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      }, 16);
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
    <div className="relative rounded-xl border border-white/[0.09] bg-[#050e1c] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)]">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-[#071423]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[11px] text-[#334155] font-mono">~/blockchain-app</span>
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
        <div
          className="px-5 pb-4 border-t border-white/[0.04] pt-3"
          style={{ animation: 'cf-slide-up 0.4s cubic-bezier(0.16,1,0.3,1) forwards' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <div className="text-[10.5px] text-emerald-400 font-mono font-semibold">200 OK — 43ms</div>
          </div>
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

// â”€â”€ Animated grid background â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

// â”€â”€ Floating ticker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


// â”€â”€ Method badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Method({ m }) {
  return (
    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
      {m}
    </span>
  );
}

// â”€â”€ Feature card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FeatureCard({ icon, title, desc, className = '', delay = 0 }) {
  return (
    <div
      className={`cf-fade-up-item group relative p-6 rounded-xl border border-white/[0.07] bg-[#0a1628] hover:border-white/[0.12] transition-all duration-500 overflow-hidden ${className}`}
      style={{ '--cf-delay': `${delay}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(300px circle at 50% 0%, rgba(255,255,255,0.03), transparent)' }} />
      <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#94a3b8] mb-4 group-hover:border-white/[0.12] group-hover:bg-white/[0.06] transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-[#e2e8f0] mb-1.5">{title}</h3>
      <p className="text-[13.5px] text-[#64748b] leading-relaxed">{desc}</p>
    </div>
  );
}

// â”€â”€ How it works step â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StepCard({ num, icon, title, desc, delay = 0 }) {
  return (
    <div
      className="cf-fade-up-item relative flex flex-col gap-4"
      style={{ '--cf-delay': `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-[#64748b] flex-shrink-0">
          {icon}
        </div>
        <span className="text-[11px] font-bold text-[#334155] uppercase tracking-widest">Step {num}</span>
      </div>
      <h3 className="text-[17px] font-semibold text-[#e2e8f0] leading-snug">{title}</h3>
      <p className="text-[13.5px] text-[#4a5568] leading-relaxed">{desc}</p>
    </div>
  );
}

// â”€â”€ Animated counter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Counter({ to, suffix = '', prefix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 1200;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setVal(Math.floor(eased * to));
          if (progress < 1) requestAnimationFrame(step);
          else setVal(to);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  );
}

// â”€â”€ Endpoint row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ENDPOINTS = [
  { method: 'GET', path: '/v1/address/ltc/{address}', desc: 'Balance, tx history, total flow', anchor: 'endpoint-address' },
  { method: 'GET', path: '/v1/tx/ltc/{txid}', desc: 'Inputs, outputs, confirmations, fee', anchor: 'endpoint-tx' },
  { method: 'GET', path: '/v1/block/ltc/{hash}', desc: 'Block header, tx list, timestamp', anchor: 'endpoint-block' },
  { method: 'GET', path: '/v1/blocks/ltc', desc: 'Latest 10 confirmed blocks', anchor: 'endpoint-blocks' },
  { method: 'GET', path: '/v1/price/ltc', desc: 'Live USD price with 24h change', anchor: 'endpoint-price' },
];

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      { threshold: 0, rootMargin: '0px 0px 80px 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#020d1c] text-[#e2e8f0] overflow-x-hidden">

      {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative overflow-hidden pt-20 pb-6 px-6 md:px-12 max-w-[1280px] mx-auto">
        <GridBackground />

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center relative">
          {/* Left */}
          <div>
            <div
              className="cf-fade-up-item inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/8 text-blue-400 text-[12px] font-semibold mb-6"
              style={{ '--cf-delay': '0ms' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              REST API — Beta access, free
            </div>
            <h1
              className="cf-fade-up-item text-[44px] md:text-[58px] font-extrabold tracking-tight leading-[1.04] text-white mb-5"
              style={{ '--cf-delay': '80ms' }}
            >
              Blockchain data,<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #818cf8 100%)' }}>
                straight from the chain.
              </span>
            </h1>
            <p
              className="cf-fade-up-item text-[17px] text-[#64748b] leading-relaxed max-w-[500px] mb-8"
              style={{ '--cf-delay': '160ms' }}
            >
              Query Litecoin addresses, transactions, blocks, and live prices with a single HTTP call. One API key, no SDK required.
            </p>
            <div
              className="cf-fade-up-item flex flex-wrap gap-3 mb-10"
              style={{ '--cf-delay': '220ms' }}
            >
              <Link
                href="/apis/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold transition-all duration-200 active:scale-[0.97] shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_8px_24px_rgba(59,130,246,0.2)]"
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

            {/* Inline key snippet */}
            <div
              className="cf-fade-up-item flex items-center gap-3 max-w-[420px] px-4 py-3 rounded-xl border border-white/[0.06] bg-[#040c1a]"
              style={{ '--cf-delay': '280ms' }}
            >
              <span className="text-[#334155] flex-shrink-0"><IconKey /></span>
              <code className="text-[12.5px] font-mono text-[#4a5568] truncate">
                <span className="text-[#4a5568]">X-API-Key: </span>
                <span className="text-blue-400">cf_live_</span>
                <span className="text-[#334155]">••••••••••••••••</span>
              </code>
              <span className="ml-auto flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">active</span>
            </div>
          </div>

          {/* Right â€” terminal */}
          <div className="cf-fade-up-item lg:block hidden" style={{ '--cf-delay': '100ms' }}>
            <TerminalMockup />
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="cf-fade-up-item mt-14 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.05] rounded-xl overflow-hidden border border-white/[0.05]"
          style={{ '--cf-delay': '300ms' }}
        >
          {[
            { val: 5, suffix: '', label: 'Endpoints', prefix: '' },
            { val: 43, suffix: 'ms', label: 'Avg response', prefix: '' },
            { val: 100, suffix: '%', label: 'Uptime', prefix: '' },
            { val: 0, suffix: '', label: 'SDK required', prefix: '' },
          ].map(({ val, suffix, label, prefix }) => (
            <div key={label} className="flex flex-col items-center justify-center py-6 bg-[#020d1c] hover:bg-[#040f1e] transition-colors">
              <div className="text-[26px] font-extrabold text-white tracking-tight font-mono">
                {val === 0 ? 'Zero' : <Counter to={val} suffix={suffix} prefix={prefix} />}
              </div>
              <div className="text-[11.5px] text-[#4a5568] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 max-w-[1280px] mx-auto py-24">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-12 items-start mb-12">
          <div>
            <span className="cf-fade-up-item text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-3 block">Capabilities</span>
            <h2 className="cf-fade-up-item text-[30px] md:text-[36px] font-bold text-white tracking-tight leading-tight">
              Everything you need.
            </h2>
          </div>
          <p className="cf-fade-up-item text-[15.5px] text-[#4a5568] leading-relaxed self-end">
            Five endpoints covering the complete Litecoin data surface — from wallet balances to real-time block confirmations. All accessible from a single API key.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
          <FeatureCard
            className="xl:col-span-4"
            icon={<IconHash />}
            title="Address Lookup"
            desc="Query any Litecoin address for current balance, total received, total sent, and full transaction history with pagination."
            delay={0}
          />
          <FeatureCard
            className="xl:col-span-4"
            icon={<IconActivity />}
            title="Transaction Detail"
            desc="Inspect any transaction — inputs, outputs, fees, confirmations, and block inclusion time with full I/O resolution."
            delay={60}
          />
          <FeatureCard
            className="xl:col-span-4"
            icon={<IconZap />}
            title="Block Data"
            desc="Fetch block headers, transaction lists, miner info, and difficulty for any block height or hash on the Litecoin chain."
            delay={120}
          />

          {/* Wide auth card */}
          <div
            className="cf-fade-up-item xl:col-span-8 p-6 rounded-xl border border-white/[0.07] bg-[#0a1628] overflow-hidden relative group"
            style={{ '--cf-delay': '180ms' }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(400px circle at 30% 50%, rgba(59,130,246,0.05), transparent)' }} />
            <p className="text-[11px] font-semibold text-[#334155] uppercase tracking-widest mb-4">Authentication</p>
            <p className="text-[17px] font-semibold text-[#e2e8f0] mb-5">One header. Always.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 font-mono text-[12px] bg-[#040c1a] border border-white/[0.06] rounded-lg px-4 py-3 text-[#94a3b8]">
                <span className="text-[#4a5568]">curl ... </span>
                <span className="text-[#334155]">-H </span>
                <span className="text-blue-300">"X-API-Key: <span className="text-blue-400">cf_live_...</span>"</span>
              </div>
              <div className="font-mono text-[12px] bg-[#040c1a] border border-white/[0.06] rounded-lg px-4 py-3 text-[#94a3b8] whitespace-nowrap">
                <span className="text-emerald-400">✓ </span>
                <span className="text-[#4a5568]">200 OK — 43ms</span>
              </div>
            </div>
            <p className="mt-4 text-[13px] text-[#4a5568]">Pass your key in the request header. No OAuth, no tokens, no complexity.</p>
          </div>

          <FeatureCard
            className="xl:col-span-4"
            icon={<IconShield />}
            title="Live Price Feed"
            desc="Real-time LTC/USD price with 24h percentage change, cached for low latency across all requests."
            delay={240}
          />
        </div>
      </section>

      {/* â”€â”€ How it works â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-t border-white/[0.05] px-6 md:px-12 max-w-[1280px] mx-auto py-24">
        <div className="mb-14 text-center">
          <span className="cf-fade-up-item text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-3 block">Getting started</span>
          <h2 className="cf-fade-up-item text-[30px] md:text-[36px] font-bold text-white tracking-tight">
            From zero to first request in 2 minutes.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
          {/* connector line (desktop) */}
          <div className="hidden md:block absolute top-[16px] left-[calc(16.66%+16px)] right-[calc(16.66%+16px)] h-px border-t border-dashed border-white/[0.1]" />
          <StepCard
            num={1}
            icon={<IconKey />}
            title="Create a free account"
            desc="Sign up with your email. No credit card required. Instant access during beta."
            delay={0}
          />
          <StepCard
            num={2}
            icon={<IconCode />}
            title="Generate your API key"
            desc="One click in the dashboard generates your unique key with the cf_live_ prefix."
            delay={80}
          />
          <StepCard
            num={3}
            icon={<IconActivity />}
            title="Start making requests"
            desc="Pass X-API-Key in your request header and start querying Litecoin blockchain data instantly."
            delay={160}
          />
        </div>
        <div className="cf-fade-up-item mt-14 text-center" style={{ '--cf-delay': '200ms' }}>
          <Link href="/apis/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold transition-all duration-200 active:scale-[0.97] shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_8px_24px_rgba(59,130,246,0.18)]">
            Get your free API key <IconArrow />
          </Link>
        </div>
      </section>

      {/* â”€â”€ Endpoints preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-t border-white/[0.05] px-6 md:px-12 max-w-[1280px] mx-auto py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="cf-fade-up-item text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-2 block">API Reference</span>
            <h2 className="cf-fade-up-item text-[30px] md:text-[36px] font-bold text-white tracking-tight mb-2">
              5 endpoints.
            </h2>
            <p className="cf-fade-up-item text-[15px] text-[#4a5568]">Full Litecoin data surface.</p>
          </div>
          <Link href="/apis/docs" className="cf-fade-up-item flex-shrink-0 inline-flex items-center gap-2 text-[13px] text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Full documentation <IconArrow />
          </Link>
        </div>

        <div className="rounded-xl border border-white/[0.07] overflow-hidden divide-y divide-white/[0.05]">
          {ENDPOINTS.map((ep, i) => (
            <Link
              key={ep.path}
              href={`/apis/docs#${ep.anchor}`}
              className="cf-fade-up-item flex flex-wrap items-center gap-3 md:gap-6 px-5 py-4 bg-[#0a1628] hover:bg-[#0c1d38] transition-all duration-200 group cursor-pointer"
              style={{ '--cf-delay': `${i * 50}ms` }}
            >
              <Method m={ep.method} />
              <code className="text-[13px] font-mono text-[#94a3b8] group-hover:text-[#e2e8f0] transition-colors flex-1 min-w-0">
                {ep.path}
              </code>
              <span className="hidden md:block text-[12.5px] text-[#4a5568] group-hover:text-[#64748b] transition-colors text-right">
                {ep.desc}
              </span>
              <svg className="hidden md:block w-3.5 h-3.5 text-[#334155] group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          ))}
        </div>
      </section>

      {/* â”€â”€ Pricing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-t border-white/[0.05] px-6 md:px-12 max-w-[1280px] mx-auto py-24">
        <div className="text-center mb-12">
          <span className="cf-fade-up-item text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-3 block">Pricing</span>
          <h2 className="cf-fade-up-item text-[30px] md:text-[36px] font-bold text-white tracking-tight mb-3">
            Free during beta.
          </h2>
          <p className="cf-fade-up-item text-[15px] text-[#4a5568] max-w-[480px] mx-auto">
            Full API access with no limits while the platform is in beta. No credit card needed.
          </p>
        </div>
        <div className="max-w-[480px] mx-auto">
          <div className="cf-fade-up-item relative p-8 rounded-xl border border-white/[0.1] bg-[#0a1628] overflow-hidden" style={{ '--cf-delay': '80ms' }}>
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(500px circle at 50% 0%, rgba(59,130,246,0.08), transparent)' }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] font-semibold text-[#64748b] uppercase tracking-widest">Free</p>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 uppercase tracking-wider">Beta</span>
              </div>
              <p className="text-[44px] font-extrabold text-white tracking-tight mb-1">
                $0<span className="text-[18px] font-normal text-[#4a5568]">/mo</span>
              </p>
              <p className="text-[13.5px] text-[#4a5568] mb-7">No credit card required. Cancel never — it&apos;s free.</p>
              <ul className="space-y-3 text-[13.5px] text-[#64748b] mb-8">
                {[
                  'Unlimited requests during beta',
                  'All 5 Litecoin endpoints',
                  'JSON responses, no SDK needed',
                  'API key management dashboard',
                  'Usage analytics',
                  'Email support',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/apis/dashboard"
                className="relative block text-center px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-[14px] font-semibold text-white transition-all duration-200 active:scale-[0.98] shadow-[0_4px_20px_rgba(59,130,246,0.3)]"
              >
                Get started free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ CTA strip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-t border-white/[0.05] relative overflow-hidden px-6 md:px-12 py-28 text-center">
        <div className="relative">
          <h2 className="cf-fade-up-item text-[32px] md:text-[44px] font-extrabold text-white tracking-tight mb-4">
            Ready to build?
          </h2>
          <p className="cf-fade-up-item text-[16px] text-[#4a5568] mb-8 max-w-[480px] mx-auto" style={{ '--cf-delay': '60ms' }}>
            Create your free account, generate a key, and make your first blockchain request in under two minutes.
          </p>
          <div className="cf-fade-up-item flex flex-wrap gap-3 justify-center" style={{ '--cf-delay': '120ms' }}>
            <Link href="/apis/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold transition-all duration-200 active:scale-[0.97] shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_8px_24px_rgba(59,130,246,0.25)]">
              Create free account <IconArrow />
            </Link>
            <Link href="/apis/docs" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/[0.1] hover:border-white/[0.18] text-[#94a3b8] hover:text-white text-[14px] font-semibold transition-all duration-200 active:scale-[0.97]">
              Read the docs <IconArrow />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
