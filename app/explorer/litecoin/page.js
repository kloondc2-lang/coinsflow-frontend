'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchBlocks, fetchMempool } from '../../lib/api';

function Skeleton({ className = '' }) {
  return (
    <span className={`inline-block rounded bg-gray-200 dark:bg-[#0e2444] animate-pulse ${className}`} />
  );
}

function truncateHash(hash) {
  if (!hash) return '';
  return hash.slice(0, 10) + '...' + hash.slice(-10);
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };
  return (
    <button onClick={copy} title="Copy hash" className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-[#0e2444] transition-colors ml-1.5 shrink-0 group">
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M20 6L9 17l-5-5" /></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
      )}
    </button>
  );
}

const BLOCKS_PER_PAGE = 20;
const STRIP_BLOCKS = 100;

/* ─── Full-width drag-scrollable 3D blockchain strip ─── */
function BlockchainStrip({ blocks, loading, mempoolData }) {
  const router = useRouter();
  const containerRef = useRef(null);
  const dragRef = useRef({ isDragging: false, startX: 0, scrollLeft: 0, hasMoved: false, velX: 0, lastX: 0, lastTime: 0, animId: 0 });

  const onPointerDown = (e) => {
    const el = containerRef.current;
    if (!el) return;
    cancelAnimationFrame(dragRef.current.animId);
    const d = dragRef.current;
    d.isDragging = true;
    d.hasMoved = false;
    d.startX = e.clientX;
    d.scrollLeft = el.scrollLeft;
    d.velX = 0;
    d.lastX = e.clientX;
    d.lastTime = Date.now();
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.isDragging) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 3) d.hasMoved = true;
    const now = Date.now();
    const dt = now - d.lastTime || 1;
    d.velX = (e.clientX - d.lastX) / dt;
    d.lastX = e.clientX;
    d.lastTime = now;
    containerRef.current.scrollLeft = d.scrollLeft - dx;
  };

  const onPointerUp = (e) => {
    const d = dragRef.current;
    d.isDragging = false;
    containerRef.current?.releasePointerCapture(e.pointerId);
    let vel = -d.velX * 18;
    const friction = 0.94;
    const tick = () => {
      if (Math.abs(vel) < 0.5) return;
      containerRef.current.scrollLeft += vel;
      vel *= friction;
      d.animId = requestAnimationFrame(tick);
    };
    d.animId = requestAnimationFrame(tick);
  };

  const makeClickHandler = (hash) => (e) => {
    if (dragRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    router.push(`/explorer/litecoin/block/${hash}`);
  };

  const maxTx = Math.max(...(blocks.map(b => b.tx_count) || [1]), 1);
  const lastBlockTimestamp = blocks[0]?.time ?? 0;
  const elapsedSec = lastBlockTimestamp ? Math.max(0, Date.now() / 1000 - lastBlockTimestamp) : 0;
  const remainMin = Math.max(0, 2.5 - elapsedSec / 60);
  const estLabel = remainMin < 0.5 ? 'In < 1 min' : `In ~${Math.ceil(remainMin)} min`;
  const mempoolFillPct = mempoolData ? Math.min(95, Math.max(5, Math.round((mempoolData.count / maxTx) * 100))) : 20;
  const SIDE_W = 20;
  const TOP_H = 20;
  const FACE_W = 140;
  const FACE_H = 160;

  return (
    <div
      className="relative w-screen left-1/2 -translate-x-1/2 mb-6 bg-gray-100 dark:bg-transparent"
      style={{ maxWidth: '100vw' }}
    >
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex overflow-x-hidden pl-8 md:pl-12 pr-4 md:pr-8 pt-8 pb-3 select-none cursor-grab active:cursor-grabbing touch-pan-y"
        style={{ gap: '28px' }}
      >
        {loading ? (
          Array.from({ length: 16 }, (_, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center">
              <div className="h-4 w-14 mb-3 rounded bg-gray-300 dark:bg-gray-700/40 animate-pulse" />
              <div className="rounded animate-pulse bg-gray-300 dark:bg-gray-700/40" style={{ width: FACE_W, height: FACE_H }} />
            </div>
          ))
        ) : (
          <>
            {/* Mempool pending block */}
            {mempoolData && (
              <>
                <div className="flex-shrink-0 flex flex-col items-center cursor-default">
                  <span className="text-[13px] font-bold text-green-400 mb-3">Next Block</span>
                  <div className="relative" style={{ width: FACE_W + SIDE_W, height: FACE_H + TOP_H + TOP_H }}>
                    {/* Top face */}
                    <div className="absolute" style={{ top: 0, left: 0, width: FACE_W, height: TOP_H, background: '#0F1B2D', transform: 'skewX(-45deg)', transformOrigin: 'bottom right' }} />
                    {/* Left side face */}
                    <div className="absolute" style={{ top: 0, left: 0, width: SIDE_W, height: FACE_H, background: '#091525', transform: 'skewY(-45deg)', transformOrigin: 'bottom right' }} />
                    {/* Front face — pulsing glow */}
                    <div
                      className="absolute flex flex-col items-center justify-center text-center"
                      style={{
                        top: 0, left: SIDE_W, width: FACE_W, height: FACE_H,
                        background: `linear-gradient(to top, #1d80e2 ${mempoolFillPct}%, #13243A ${mempoolFillPct}%)`,
                        animation: 'mempoolPulse 2s ease-in-out infinite',
                      }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-green-500" />
                      <span className="text-[11px] text-green-300/80">Unconfirmed</span>
                      <span className="text-[18px] font-extrabold text-white leading-tight mt-2">
                        {mempoolData.size_kb.toFixed(2)} <span className="text-[11px] font-bold text-gray-300">kB</span>
                      </span>
                      <span className="text-[10px] text-gray-300/80 mt-2">
                        {mempoolData.count.toLocaleString()} txs
                      </span>
                      <span className="text-[11px] font-bold mt-1 text-green-400">{estLabel}</span>
                    </div>
                    {/* Bottom face */}
                    <div className="absolute" style={{ top: FACE_H, left: SIDE_W, width: FACE_W, height: TOP_H, background: '#091525', transform: 'skewX(-45deg)', transformOrigin: 'top right' }} />
                  </div>
                </div>
                {/* Green separator line */}
                <div className="flex-shrink-0 flex items-center" style={{ paddingTop: TOP_H, height: FACE_H + TOP_H * 2 }}>
                  <div style={{ width: 1, height: FACE_H * 0.8, background: 'linear-gradient(to bottom, transparent, #22c55e 30%, #22c55e 70%, transparent)' }} />
                </div>
              </>
            )}
            {/* Confirmed blocks */}
            {blocks.map((block, i) => {
              const isLatest = i === 0;
              const fillPct = Math.max(12, Math.round((block.tx_count / maxTx) * 100));

              return (
                <a
                  key={block.hash}
                  href={`/explorer/litecoin/block/${block.hash}`}
                  onClick={makeClickHandler(block.hash)}
                  draggable={false}
                  className="flex-shrink-0 flex flex-col items-center group"
                >
                  {/* Block height */}
                  <span className="text-[13px] font-bold text-blue-600 dark:text-[#4da6ff] mb-3 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
                    {block.height?.toLocaleString()}
                  </span>

                  {/* 3D block — skew-based */}
                  <div className="relative transition-transform duration-150 group-hover:scale-[1.03]" style={{ width: FACE_W + SIDE_W, height: FACE_H + TOP_H + TOP_H }}>
                    {/* Top face */}
                    <div
                      className="absolute"
                      style={{
                        top: 0, left: 0, width: FACE_W, height: TOP_H,
                        background: '#0F1B2D',
                        transform: 'skewX(-45deg)',
                        transformOrigin: 'bottom right',
                      }}
                    />
                    {/* Left side face */}
                    <div
                      className="absolute"
                      style={{
                        top: 0, left: 0, width: SIDE_W, height: FACE_H,
                        background: '#091525',
                        transform: 'skewY(-45deg)',
                        transformOrigin: 'bottom right',
                      }}
                    />
                    {/* Front face */}
                    <div
                      className="absolute flex flex-col items-center justify-center text-center"
                      style={{
                        top: 0, left: SIDE_W, width: FACE_W, height: FACE_H,
                        background: `linear-gradient(to top, #1d80e2 ${fillPct}%, #13243A ${fillPct}%)`,
                      }}
                    >
                      {/* Green accent for latest confirmed */}
                      {isLatest && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-green-500" />
                      )}

                      <span className="text-[11px] text-white/80">~0 lit/vB</span>
                      <span className="text-[11px] font-bold text-yellow-400 mt-0.5">
                        0 - {block.tx_count?.toLocaleString()} lit/vB
                      </span>
                      <span className="text-[18px] font-extrabold text-white leading-tight mt-2">
                        {(block.size / 1024).toFixed(2)} <span className="text-[11px] font-bold text-gray-300">kB</span>
                      </span>
                      <span className="text-[10px] text-gray-300/80 mt-2">
                        {block.tx_count?.toLocaleString()} transactions
                      </span>
                      <span className={`text-[11px] font-bold mt-1 ${isLatest ? 'text-green-400' : 'text-gray-300/70'}`}>
                        {block.time_ago}
                      </span>
                    </div>
                    {/* Bottom face */}
                    <div
                      className="absolute"
                      style={{
                        top: FACE_H, left: SIDE_W, width: FACE_W, height: TOP_H,
                        background: '#091525',
                        transform: 'skewX(-45deg)',
                        transformOrigin: 'top right',
                      }}
                    />
                  </div>
                </a>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export default function LitecoinExplorer() {
  const [activeTab, setActiveTab]     = useState('blocks');
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [page, setPage]               = useState(1);
  const [stripBlocks, setStripBlocks] = useState([]);
  const [stripLoading, setStripLoading] = useState(true);
  const [mempoolData, setMempoolData] = useState(null);

  const loadBlocks = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const res = await fetchBlocks(p, BLOCKS_PER_PAGE);
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load strip blocks (more blocks for the 3D visualization)
  const loadStripBlocks = useCallback(async () => {
    try {
      setStripLoading(true);
      const [res, mempool] = await Promise.all([
        fetchBlocks(1, STRIP_BLOCKS),
        fetchMempool().catch(() => null),
      ]);
      setStripBlocks(res?.blocks ?? []);
      setMempoolData(mempool);
    } catch {
    } finally {
      setStripLoading(false);
    }
  }, []);

  useEffect(() => { loadBlocks(page); }, [page, loadBlocks]);
  useEffect(() => { loadStripBlocks(); }, [loadStripBlocks]);

  // auto-refresh every 30s (only page 1)
  useEffect(() => {
    if (page !== 1) return;
    const id = setInterval(() => { loadBlocks(1); loadStripBlocks(); }, 30_000);
    return () => clearInterval(id);
  }, [page, loadBlocks, loadStripBlocks]);

  const totalBlocks = data?.pagination?.total_available ?? 0;
  const totalPages = Math.ceil(totalBlocks / BLOCKS_PER_PAGE);

  const chartBlocks = data?.blocks?.slice(0, 15) ?? [];
  const maxTxCount  = Math.max(...chartBlocks.map((b) => b.tx_count), 1);

  // Computed stats from loaded blocks
  const loadedBlocks = data?.blocks ?? [];
  const avgTxCount = loadedBlocks.length > 0 ? Math.round(loadedBlocks.reduce((s, b) => s + b.tx_count, 0) / loadedBlocks.length) : 0;
  const avgBlockSize = loadedBlocks.length > 0 ? Math.round(loadedBlocks.reduce((s, b) => s + b.size, 0) / loadedBlocks.length) : 0;
  const totalTxs = loadedBlocks.reduce((s, b) => s + b.tx_count, 0);
  const avgBlockTime = loadedBlocks.length > 1
    ? Math.round((loadedBlocks[0].time - loadedBlocks[loadedBlocks.length - 1].time) / (loadedBlocks.length - 1))
    : 0;
  const formatSeconds = (s) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  // Collect recent txs from first few blocks for "Latest Mined Transactions" tab
  const recentTxs = (data?.blocks ?? []).flatMap((block) =>
    (block.recent_txs ?? []).map((tx) => ({ ...tx, block_height: block.height, block_hash: block.hash, block_time_human: block.time_human, block_time_ago: block.time_ago }))
  ).slice(0, 20);

  // Halving info
  const HALVING_INTERVAL = 840_000;
  const currentHeight = data?.chain_height ?? 0;
  const nextHalving = currentHeight > 0 ? Math.ceil(currentHeight / HALVING_INTERVAL) * HALVING_INTERVAL : 0;
  const blocksUntilHalving = nextHalving - currentHeight;
  const halvingProgress = currentHeight > 0 ? ((currentHeight % HALVING_INTERVAL) / HALVING_INTERVAL * 100).toFixed(1) : 0;

  // Pagination helpers
  const getPageNumbers = () => {
    const pages = [];
    const shown = new Set();
    [1, totalPages, page - 2, page - 1, page, page + 1, page + 2].forEach((p) => {
      if (p >= 1 && p <= totalPages) shown.add(p);
    });
    const sorted = [...shown].sort((a, b) => a - b);
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) pages.push('...');
      pages.push(p);
    });
    return pages;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-16">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-gray-600 font-medium py-5 flex-wrap">
        <Link href="/" className="hover:text-blue-500 transition-colors">Blockchains</Link>
        <span className="opacity-40">/</span>
        <Link href="/explorer/litecoin" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-semibold hover:text-blue-500 transition-colors">
          <Image src="/ltc.svg" alt="LTC" width={16} height={16} className="object-contain" />
          Litecoin
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-blue-500 font-semibold">Mainnet</span>
      </nav>

      {/* Network tabs */}
      <div className="flex gap-2 mb-6">
        <button className="px-4 py-1.5 rounded-full text-[12px] font-bold bg-blue-600 text-white">Mainnet</button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-[13px] font-bold text-red-600 dark:text-red-400 flex items-center justify-between">
          <span>Could not reach backend: {error}</span>
          <button onClick={() => loadBlocks(page)} className="underline ml-4">Retry</button>
        </div>
      )}

      {/* Blockchain visualization — drag-scrollable 3D block cubes */}
      <BlockchainStrip blocks={stripBlocks} loading={stripLoading} mempoolData={mempoolData} />

      {/* Info panels */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1 rounded-2xl border border-gray-100 dark:border-[#0e2444] p-5 flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="flex items-center gap-3">
              <Image src="/ltc.svg" alt="Litecoin" width={40} height={40} className="object-contain" />
              <div>
                <h1 className="text-[18px] font-extrabold text-gray-900 dark:text-white leading-tight">
                  Litecoin
                  <span className="ml-2 text-[11px] font-bold bg-gray-100 dark:bg-[#0e2444] text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full align-middle">LTC</span>
                </h1>
                {loading ? <Skeleton className="h-5 w-24 mt-1" /> : (
                  <span className="text-[15px] font-extrabold text-gray-700 dark:text-gray-200">
                    ${data?.ltc_price_usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'} USD
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-500 dark:text-gray-400">Difficulty</span>
                {loading ? <Skeleton className="h-4 w-24" /> : (
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {data?.difficulty ? Number(data.difficulty).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-500 dark:text-gray-400">Block Height</span>
                {loading ? <Skeleton className="h-4 w-16" /> : (
                  <span className="font-bold text-gray-700 dark:text-gray-300">{data?.chain_height?.toLocaleString() ?? '—'}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-500 dark:text-gray-400">Block Reward</span>
                {loading ? <Skeleton className="h-4 w-16" /> : (
                  <span className="font-bold text-gray-700 dark:text-gray-300">6.25 LTC</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-500 dark:text-gray-400">Halving</span>
                {loading ? <Skeleton className="h-4 w-24" /> : (
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {blocksUntilHalving.toLocaleString()} blocks away
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Live stats from loaded blocks */}
          <div className="flex flex-col gap-2 text-[13px] min-w-[140px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500 dark:text-gray-400">Avg Txs/Block</span>
              {loading ? <Skeleton className="h-4 w-12" /> : (
                <span className="font-bold text-gray-700 dark:text-gray-300">{avgTxCount.toLocaleString()}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500 dark:text-gray-400">Avg Block Size</span>
              {loading ? <Skeleton className="h-4 w-16" /> : (
                <span className="font-bold text-gray-700 dark:text-gray-300">{(avgBlockSize / 1024).toFixed(1)} KB</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500 dark:text-gray-400">Txs (Last {loadedBlocks.length})</span>
              {loading ? <Skeleton className="h-4 w-12" /> : (
                <span className="font-bold text-gray-700 dark:text-gray-300">{totalTxs.toLocaleString()}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500 dark:text-gray-400">Avg Interval</span>
              {loading ? <Skeleton className="h-4 w-16" /> : (
                <span className="font-bold text-gray-700 dark:text-gray-300">{formatSeconds(avgBlockTime)}</span>
              )}
            </div>
          </div>

          {/* Live tx chart */}
          <div className="flex items-end gap-1 flex-1 h-20">
            {loading
              ? Array.from({ length: 15 }, (_, i) => (
                  <div key={i} className="flex-1 flex items-end">
                    <div className="w-full rounded-sm bg-gray-200 dark:bg-[#0e2444] animate-pulse" style={{ height: `${30 + i * 5}%` }} />
                  </div>
                ))
              : chartBlocks.map((b) => {
                  const h = Math.max(5, Math.round((b.tx_count / maxTxCount) * 100));
                  return (
                    <div key={b.hash} className="flex-1 flex items-end group relative">
                      <div className="w-full rounded-sm bg-blue-200 dark:bg-[#0e2444] hover:bg-blue-500 dark:hover:bg-blue-700 transition-colors cursor-pointer" style={{ height: `${h}%` }} />
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                        <div className="bg-gray-900 text-white text-[10px] font-bold rounded px-2 py-1 whitespace-nowrap">
                          #{b.height?.toLocaleString()} · {b.tx_count} txs
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Right panel — Network Stats */}
        <div className="lg:w-64 rounded-2xl border border-gray-100 dark:border-[#0e2444] p-5">
          <h2 className="text-[13px] font-extrabold text-gray-700 dark:text-gray-300 mb-4">Network Stats</h2>
          <div className="flex flex-col gap-3 text-[13px]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-500 dark:text-gray-400">Algorithm</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">Scrypt</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-500 dark:text-gray-400">Block Time</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">~2.5 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-500 dark:text-gray-400">Max Supply</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">84M LTC</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-500 dark:text-gray-400">Next Halving</span>
              {loading ? <Skeleton className="h-4 w-16" /> : (
                <span className="font-bold text-gray-700 dark:text-gray-300">#{nextHalving.toLocaleString()}</span>
              )}
            </div>
            {/* Halving progress bar */}
            {!loading && currentHeight > 0 && (
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-gray-400 dark:text-gray-500">Halving Progress</span>
                  <span className="font-bold text-blue-500">{halvingProgress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-[#0e2444] overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${halvingProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-100 dark:border-[#0e2444]">
        {[{ key: 'blocks', label: 'Latest Blocks' }, { key: 'txs', label: 'Latest Mined Transactions' }].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-[13px] font-bold border-b-2 transition-colors -mb-px ${activeTab === tab.key ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Blocks table */}
      {activeTab === 'blocks' && (
        <>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-[#0e2444]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#0e2444] text-gray-500 dark:text-gray-400 font-extrabold">
                <th className="text-left px-4 py-3">Hash</th>
                <th className="text-left px-4 py-3">Block Height</th>
                <th className="text-left px-4 py-3">Size (bytes)</th>
                <th className="text-left px-4 py-3">Transactions</th>
                <th className="text-left px-4 py-3">Block Reward</th>
                <th className="text-right px-4 py-3">Mined Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 20 }, (_, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-[#0a1a30]">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-10" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-36 ml-auto" /></td>
                    </tr>
                  ))
                : (data?.blocks ?? []).map((block, i) => (
                    <tr key={block.hash}
                      className={`border-b border-gray-50 dark:border-[#0a1a30] hover:bg-gray-50 dark:hover:bg-[#071a30] transition-colors ${i === (data.blocks.length - 1) ? 'border-b-0' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Link href={`/explorer/litecoin/block/${block.hash}`} className="font-mono text-blue-500 hover:text-blue-600 font-extrabold text-[14px]">
                            {truncateHash(block.hash)}
                          </Link>
                          <CopyButton text={block.hash} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/explorer/litecoin/block/${block.hash}`} className="font-extrabold text-[14px] text-gray-700 dark:text-gray-300 hover:text-blue-500">
                          #{block.height?.toLocaleString()}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-600 dark:text-gray-400">{block.size?.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-gray-600 dark:text-gray-400">{block.tx_count?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="font-extrabold text-gray-700 dark:text-gray-300">{block.reward_ltc} LTC</span>
                        <br />
                        <span className="text-gray-400 dark:text-gray-600 text-[11px] font-bold">${block.reward_usd?.toLocaleString()} USD</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-bold text-gray-600 dark:text-gray-400">{block.time_human}</div>
                        <div className="text-gray-400 dark:text-gray-600 text-[11px] font-bold">{block.time_ago}</div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0e2444] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">&laquo;</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0e2444] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">&lsaquo; Prev</button>
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`dot-${i}`} className="px-1 text-[12px] text-gray-400">...</span>
              ) : (
                <button key={p} onClick={() => setPage(p)}
                  className={`min-w-[32px] px-2 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${page === p ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0e2444]'}`}>{p}</button>
              )
            )}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0e2444] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Next &rsaquo;</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0e2444] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">&raquo;</button>
          </div>
        )}
        </>
      )}

      {/* Latest Mined Transactions table */}
      {activeTab === 'txs' && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-[#0e2444]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#0e2444] text-gray-500 dark:text-gray-400 font-extrabold">
                <th className="text-left px-4 py-3">TXID</th>
                <th className="text-left px-4 py-3">Block</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Amount (LTC)</th>
                <th className="text-right px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 20 }, (_, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-[#0a1a30]">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                    </tr>
                  ))
                : recentTxs.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-gray-600 font-bold">No transaction data available — backend needs txindex=1</td></tr>
                  ) : recentTxs.map((tx, i) => (
                    <tr key={tx.txid + i}
                      className={`border-b border-gray-50 dark:border-[#0a1a30] hover:bg-gray-50 dark:hover:bg-[#071a30] transition-colors ${i === recentTxs.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Link href={`/explorer/litecoin/tx/${tx.txid}`} className="font-mono text-blue-500 hover:text-blue-600 font-extrabold text-[14px]">
                            {truncateHash(tx.txid)}
                          </Link>
                          <CopyButton text={tx.txid} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/explorer/litecoin/block/${tx.block_hash}`} className="font-extrabold text-[14px] text-gray-700 dark:text-gray-300 hover:text-blue-500">
                          #{tx.block_height?.toLocaleString()}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {tx.is_coinbase ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold">Coinbase</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 text-[11px] font-extrabold">Transfer</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-extrabold text-gray-700 dark:text-gray-300">
                        {tx.amount_ltc?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-bold text-gray-600 dark:text-gray-400">{tx.block_time_human}</div>
                        <div className="text-gray-400 dark:text-gray-600 text-[11px] font-bold">{tx.block_time_ago}</div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
