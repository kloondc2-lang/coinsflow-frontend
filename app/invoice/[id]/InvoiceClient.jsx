'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.coinsflow.net';

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconCopy() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconAlertCircle() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconRefresh({ spinning }) {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ animation: spinning ? 'spin 1s linear infinite' : 'none' }}>
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label: 'Awaiting Payment', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', pulse: true },
  partial:    { label: 'Partial Payment',  color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  pulse: true },
  confirming: { label: 'Payment Detected', color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  pulse: true },
  confirmed:  { label: 'Confirmed',        color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  pulse: false },
  expired:    { label: 'Expired',          color: '#71717a', bg: 'rgba(113,113,122,0.12)', pulse: false },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatLTC(val) {
  if (val == null) return '—';
  return parseFloat(val).toFixed(8).replace(/\.?0+$/, '');
}

function formatCountdown(ms) {
  if (ms <= 0) return 'Expired';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

function truncateAddress(addr) {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = '1rem', radius = '0.375rem' }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: w,
        height: h,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #0a1628 25%, #112240 50%, #0a1628 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.3rem 0.75rem',
        borderRadius: '2rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}26`,
      }}
    >
      {cfg.pulse && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: cfg.color,
            animation: 'statusPulse 2s ease-in-out infinite',
          }}
        />
      )}
      {cfg.label}
    </span>
  );
}

// ── Progress bar for partial payments ────────────────────────────────────────
function PaymentProgress({ received, expected }) {
  if (!expected || !received) return null;
  const pct = Math.min(100, (parseFloat(received) / parseFloat(expected)) * 100);
  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.72rem', color: '#94a3b8' }}>
        <span>Received</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: '#1e3a5f', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 2,
            background: '#fbbf24',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function InvoiceClient({ invoiceId }) {
  const [invoice, setInvoice] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [qrMode, setQrMode] = useState('amount');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [polling, setPolling] = useState(false);
  const pollRef = useRef(null);
  const mountedRef = useRef(true);

  // Tick for countdown
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchQr = useCallback(async () => {
    if (!invoiceId || !invoice?.ltc_address || invoice.ltc_address === '__PENDING__') return;
    try {
      const res = await fetch(`${API}/invoices/qr/${invoiceId}?mode=${qrMode}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!mountedRef.current) return;
      setQrData(data);
    } catch {
      // Ignore QR refresh failures and keep the last good QR rendered.
    }
  }, [invoice?.ltc_address, invoiceId, qrMode]);

  const fetchInvoice = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setPolling(true);
    try {
      const res = await fetch(`${API}/invoices/${invoiceId}`);
      if (!res.ok) throw new Error(res.status === 404 ? 'Invoice not found' : 'Failed to load invoice');
      const data = await res.json();
      if (!mountedRef.current) return;
      setInvoice(data);
      setError(null);

      if (data.amount_ltc) {
        setQrMode((current) => current || 'amount');
      } else {
        setQrMode('address');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      if (!silent) setError(err.message);
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
      setPolling(false);
    }
  }, [invoiceId]);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;
    fetchInvoice(false);
    return () => { mountedRef.current = false; };
  }, [fetchInvoice]);

  useEffect(() => {
    fetchQr();
  }, [fetchQr]);

  // Live polling every 15s — only while non-terminal status
  useEffect(() => {
    const terminal = ['confirmed', 'expired'];
    if (!invoice || terminal.includes(invoice.status)) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchInvoice(true), 5_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [invoice?.status, fetchInvoice]);

  async function copyAddress() {
    if (!invoice?.ltc_address) return;
    try {
      await navigator.clipboard.writeText(invoice.ltc_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  const msLeft = invoice ? new Date(invoice.expires_at).getTime() - now : 0;
  const isTerminal = invoice && ['confirmed', 'expired'].includes(invoice.status);
  const isConfirmed = invoice?.status === 'confirmed';
  const hasDetectedPayment = (invoice?.ltc_received ?? 0) > 0 && !isConfirmed;
  const qrSupportsAmount = Boolean(invoice?.amount_ltc);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes confirmPop {
          0% { transform: scale(0.85); opacity: 0; }
          60% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .invoice-root {
          font-family: 'Outfit', system-ui, sans-serif;
          background: #020d1c;
          min-height: 100vh;
          color: #e2e8f0;
        }
        .invoice-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        .invoice-card {
          background: #0a1628;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4);
        }
        .address-box {
          background: #040c1a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.625rem;
          padding: 0.875rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: border-color 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        .address-box:hover { border-color: rgba(255,255,255,0.16); }
        .copy-btn {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          font-size: 0.75rem;
          font-family: inherit;
          font-weight: 500;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
          will-change: transform;
        }
        .copy-btn:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; transform: translateY(-1px); }
        .copy-btn:active { transform: translateY(0); }
        .copy-btn.copied { border-color: rgba(74,222,128,0.4); color: #4ade80; background: rgba(74,222,128,0.08); }
        .qr-panel {
          animation: fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        .qr-mode-btn {
          flex: 1;
          border: 1px solid rgba(255,255,255,0.08);
          background: #040c1a;
          color: #94a3b8;
          border-radius: 999px;
          padding: 0.45rem 0.75rem;
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        .qr-mode-btn:hover { color: #e2e8f0; border-color: rgba(255,255,255,0.14); }
        .qr-mode-btn:active { transform: scale(0.98); }
        .qr-mode-btn.active {
          background: #f8fafc;
          color: #0f172a;
          border-color: rgba(255,255,255,0.9);
          box-shadow: 0 6px 20px rgba(255,255,255,0.08);
        }
        .confirmed-banner {
          animation: confirmPop 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.6rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 0.82rem;
          animation: fadeSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) var(--delay,0ms) both;
        }
        .meta-row:last-child { border-bottom: none; }
        .meta-label { color: #64748b; font-weight: 400; }
        .meta-value { color: #e2e8f0; font-weight: 500; font-variant-numeric: tabular-nums; }
        @media (max-width: 767px) {
          .invoice-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="invoice-root">
        {/* ── Header ── */}
        <div style={{ padding: '1.25rem 1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <Image src="/icon.png" alt="CoinsFlow" width={28} height={28} style={{ borderRadius: 6 }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '-0.01em' }}>CoinsFlow</span>
          </Link>
          <span style={{ fontSize: '0.72rem', color: '#334155', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>
            Litecoin Payment
          </span>
        </div>

        {/* ── Main content ── */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>

          {/* Loading state */}
          {loading && (
            <div className="invoice-card" style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}><Skeleton w="40%" h="1.5rem" /></div>
              <div style={{ marginBottom: '0.75rem' }}><Skeleton w="100%" h="3rem" radius="0.625rem" /></div>
              <div style={{ marginBottom: '0.5rem' }}><Skeleton w="60%" h="1rem" /></div>
              <div><Skeleton w="45%" h="1rem" /></div>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="invoice-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ marginBottom: '1rem', color: '#f87171', display: 'flex', justifyContent: 'center' }}>
                <IconAlertCircle />
              </div>
              <p style={{ color: '#f87171', fontWeight: 600, marginBottom: '0.5rem' }}>{error}</p>
              <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                The invoice may have been removed or the link is incorrect.
              </p>
              <Link href="/" style={{ fontSize: '0.82rem', color: '#60a5fa', textDecoration: 'none' }}>
                Return to CoinsFlow
              </Link>
            </div>
          )}

          {/* Invoice loaded */}
          {!loading && invoice && (
            <div style={{ animation: 'fadeSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>

              {/* Confirmed banner */}
              {isConfirmed && (
                <div className="confirmed-banner invoice-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', borderColor: 'rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.06)' }}>
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#4ade80' }}>
                    <IconCheck />
                  </span>
                  <div>
                    <p style={{ fontWeight: 600, color: '#4ade80', fontSize: '0.95rem', marginBottom: '0.15rem' }}>Payment confirmed</p>
                    <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                      {formatLTC(invoice.ltc_received)} LTC received
                      {invoice.usd_value_received ? ` · ≈ $${parseFloat(invoice.usd_value_received).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD` : ''}
                      {invoice.tx_hash ? ` · tx ${invoice.tx_hash.slice(0, 12)}…` : ''}
                    </p>
                  </div>
                </div>
              )}

              {hasDetectedPayment && (
                <div className="confirmed-banner invoice-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', borderColor: 'rgba(251,146,60,0.22)', background: 'rgba(251,146,60,0.08)' }}>
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(251,146,60,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fb923c' }}>
                    <IconRefresh spinning />
                  </span>
                  <div>
                    <p style={{ fontWeight: 600, color: '#fdba74', fontSize: '0.95rem', marginBottom: '0.15rem' }}>Payment detected</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                      {formatLTC(invoice.ltc_received)} LTC has reached the address and this page will keep updating until it confirms on-chain.
                    </p>
                  </div>
                </div>
              )}

              {/* Main grid */}
              <div className="invoice-grid">

                {/* Left column — details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {/* Invoice header card */}
                  <div className="invoice-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem' }}>
                      <div>
                        <p style={{ fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '0.35rem' }}>
                          Invoice
                        </p>
                        <p style={{ fontSize: '0.78rem', color: '#334155', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                          {invoiceId}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        {polling && <IconRefresh spinning />}
                        <StatusBadge status={invoice.status} />
                      </div>
                    </div>

                    {/* Amount */}
                    {invoice.amount_ltc ? (
                      <div style={{ marginBottom: '1.25rem' }}>
                        <p style={{ fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '0.5rem' }}>
                          Amount Due
                        </p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                          <span style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#f1f5f9', fontVariantNumeric: 'tabular-nums' }}>
                            {formatLTC(invoice.amount_ltc)}
                          </span>
                          <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>LTC</span>
                        </div>
                        {invoice.status === 'partial' && (
                          <PaymentProgress received={invoice.ltc_received} expected={invoice.amount_ltc} />
                        )}
                      </div>
                    ) : (
                      <div style={{ marginBottom: '1.25rem' }}>
                        <p style={{ fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '0.35rem' }}>Amount</p>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Open invoice — send any amount</p>
                      </div>
                    )}

                    {/* Address */}
                    <p style={{ fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '0.5rem' }}>
                      Send to Address
                    </p>
                    <div className="address-box">
                      <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.82rem', color: '#cbd5e1', wordBreak: 'break-all', lineHeight: 1.5 }}>
                        {invoice.ltc_address}
                      </span>
                      <button
                        className={`copy-btn${copied ? ' copied' : ''}`}
                        onClick={copyAddress}
                        title="Copy address"
                        aria-label="Copy LTC address"
                      >
                        {copied ? <IconCheck /> : <IconCopy />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Details card */}
                  <div className="invoice-card" style={{ padding: '1.25rem 1.5rem' }}>
                    <p style={{ fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '0.75rem' }}>
                      Details
                    </p>

                    {invoice.description && (
                      <div className="meta-row" style={{ '--delay': '0ms' }}>
                        <span className="meta-label">Description</span>
                        <span className="meta-value" style={{ maxWidth: '55%', textAlign: 'right' }}>{invoice.description}</span>
                      </div>
                    )}

                    <div className="meta-row" style={{ '--delay': '40ms' }}>
                      <span className="meta-label">Network</span>
                      <span className="meta-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Image src="/ltc.svg" alt="LTC" width={14} height={14} />
                        Litecoin
                      </span>
                    </div>

                    {invoice.confirmations > 0 && (
                      <div className="meta-row" style={{ '--delay': '80ms' }}>
                        <span className="meta-label">Confirmations</span>
                        <span className="meta-value" style={{ color: invoice.confirmations >= 1 ? '#4ade80' : '#fbbf24' }}>
                          {invoice.confirmations}
                        </span>
                      </div>
                    )}

                    <div className="meta-row" style={{ '--delay': '120ms' }}>
                      <span className="meta-label">Created</span>
                      <span className="meta-value">
                        {new Date(invoice.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {!isTerminal && (
                      <div className="meta-row" style={{ '--delay': '160ms' }}>
                        <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <IconClock /> Expires
                        </span>
                        <span className="meta-value" style={{ color: msLeft < 300_000 ? '#f87171' : '#e2e8f0' }}>
                          {formatCountdown(msLeft)}
                        </span>
                      </div>
                    )}

                    {invoice.status === 'expired' && (
                      <div className="meta-row" style={{ '--delay': '160ms' }}>
                        <span className="meta-label">Expired at</span>
                        <span className="meta-value" style={{ color: '#71717a' }}>
                          {new Date(invoice.expires_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {invoice.tx_hash && (
                      <div className="meta-row" style={{ '--delay': '200ms' }}>
                        <span className="meta-label">Tx hash</span>
                        <Link
                          href={`/explorer/litecoin/tx/${invoice.tx_hash}`}
                          style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#60a5fa', textDecoration: 'none', ':hover': { textDecoration: 'underline' } }}
                        >
                          {truncateAddress(invoice.tx_hash)}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Instruction note */}
                  {!isTerminal && (
                    <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.6, padding: '0 0.25rem', animation: 'fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}>
                      Send exactly {invoice.amount_ltc ? `${formatLTC(invoice.amount_ltc)} LTC` : 'any amount of LTC'} to the address above.
                      This page detects incoming payment as soon as it reaches the network and keeps updating until it is confirmed.
                    </p>
                  )}
                </div>

                {/* Right column — QR + live status */}
                <div className="qr-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1.5rem' }}>

                  {/* QR code card */}
                  <div className="invoice-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    {qrData?.qr_base64 ? (
                      <>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                          <button
                            type="button"
                            className={`qr-mode-btn${qrMode === 'amount' ? ' active' : ''}`}
                            onClick={() => setQrMode('amount')}
                            disabled={!qrSupportsAmount}
                            style={!qrSupportsAmount ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                          >
                            QR with amount
                          </button>
                          <button
                            type="button"
                            className={`qr-mode-btn${qrMode === 'address' ? ' active' : ''}`}
                            onClick={() => setQrMode('address')}
                          >
                            Address only
                          </button>
                        </div>
                        <div style={{ display: 'inline-block', padding: '1rem', borderRadius: '1rem', background: '#ffffff', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 20px 50px rgba(0,0,0,0.28)', marginBottom: '1rem' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={qrData.qr_base64}
                            alt="Payment QR code"
                            width={208}
                            height={208}
                            style={{ display: 'block', borderRadius: '0.5rem', background: '#ffffff' }}
                          />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
                          {qrMode === 'amount' && qrSupportsAmount ? 'Scan to open a payment request with the amount prefilled.' : 'Scan to copy the wallet address into any Litecoin wallet.'}
                        </p>
                        <p style={{ marginTop: '0.45rem', fontSize: '0.7rem', color: '#334155', lineHeight: 1.5, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                          {qrData.uri}
                        </p>
                      </>
                    ) : (
                      <div style={{ width: 208, height: 208, margin: '0 auto 1rem', borderRadius: '1rem', overflow: 'hidden' }}>
                        <Skeleton w="100%" h="100%" radius="0.75rem" />
                      </div>
                    )}

                    {invoice.amount_ltc && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '0.625rem', background: '#040c1a', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '0.2rem' }}>Amount</p>
                        <p style={{ fontWeight: 600, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums', color: '#f1f5f9' }}>
                          {formatLTC(invoice.amount_ltc)} <span style={{ color: '#64748b', fontWeight: 400 }}>LTC</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Live status card */}
                  <div className="invoice-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <p style={{ fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Status</p>
                      {!isTerminal && (
                        <span style={{ fontSize: '0.68rem', color: '#334155' }}>
                          Refreshes every 5s
                        </span>
                      )}
                    </div>
                    <StatusBadge status={invoice.status} />

                    {invoice.ltc_received > 0 && (
                      <div style={{ marginTop: '0.875rem', padding: '0.75rem', borderRadius: '0.5rem', background: '#040c1a', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '0.2rem' }}>Received</p>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums' }}>
                          {formatLTC(invoice.ltc_received)} LTC
                        </p>
                        {invoice.usd_value_received ? (
                          <p style={{ marginTop: '0.2rem', fontSize: '0.74rem', color: '#64748b' }}>
                            ≈ ${parseFloat(invoice.usd_value_received).toFixed(2)} USD
                          </p>
                        ) : null}
                        <p style={{ marginTop: '0.3rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                          {invoice.confirmations > 0 ? `${invoice.confirmations} confirmation${invoice.confirmations === 1 ? '' : 's'}` : 'Seen on network, waiting for first confirmation'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '1.25rem 1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#1e3a5f' }}>
            Powered by{' '}
            <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>CoinsFlow</Link>
            {' '}— Litecoin payment infrastructure
          </p>
        </div>
      </div>
    </>
  );
}
