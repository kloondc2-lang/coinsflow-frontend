'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchAddress } from '../../../../lib/api';

function Skeleton({ className = '' }) {
  return <span className={`inline-block rounded bg-gray-300 dark:bg-gray-700/40 animate-pulse ${className}`} />;
}

function truncateHash(hash, start = 10, end = 10) {
  if (!hash) return '';
  if (hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-2 text-[11px] text-gray-400 hover:text-blue-500 transition-colors"
    >
      {copied ? '✓ Copied' : '⧉ Copy'}
    </button>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const delta = 2;
  const left  = Math.max(2, page - delta);
  const right = Math.min(totalPages - 1, page + delta);
  pages.push(1);
  if (left > 2) pages.push('…');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push('…');
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-[13px] font-bold border border-gray-200 dark:border-[#0e2444] disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-[#0a1a30] transition-colors"
      >‹ Prev</button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`dot${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-colors ${
              p === page
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-200 dark:border-[#0e2444] hover:bg-gray-100 dark:hover:bg-[#0a1a30]'
            }`}
          >{p}</button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 rounded-lg text-[13px] font-bold border border-gray-200 dark:border-[#0e2444] disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-[#0a1a30] transition-colors"
      >Next ›</button>
    </div>
  );
}

export default function AddressDetail() {
  const { address } = useParams();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [page, setPage]           = useState(1);
  const [expandedRows, setExpanded] = useState(new Set());
  const [tab, setTab]             = useState('confirmed');
  const LIMIT = 20;

  const loadPage = useCallback((p) => {
    setLoading(true);
    setExpanded(new Set());
    fetchAddress(address, p, LIMIT)
      .then((d) => { setData(d); setError(null); setPage(p); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [address]);

  useEffect(() => { if (address) loadPage(1); }, [address]);

  const historyLimited = data?.history_limited === true;
  const totalPages = data ? Math.max(1, Math.ceil(((data.pagination?.total ?? data.tx_count) || 0) / LIMIT)) : 1;
  const txs = data?.transactions ?? [];

  const confirmedTxs   = txs.filter(tx => tx.block_height != null && tx.block_height > 0);
  const unconfirmedTxs = txs.filter(tx => tx.block_height == null || tx.block_height === 0);
  const filteredTxs    = tab === 'confirmed' ? confirmedTxs : unconfirmedTxs;

  const toggleRow = (txid) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(txid) ? next.delete(txid) : next.add(txid);
      return next;
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-gray-500 py-4 flex-wrap font-medium">
        <Link href="/explorer/litecoin" className="hover:text-blue-500 transition-colors">Litecoin</Link>
        <span>/</span>
        <Link href="/explorer/litecoin" className="hover:text-blue-500 transition-colors">Mainnet</Link>
        <span>/</span>
        <span className="text-gray-600 dark:text-gray-400">Litecoin Mainnet Address Details</span>
      </nav>

      {/* Address header */}
      <div className="rounded-xl border border-gray-200 dark:border-[#0e2444] mb-5 overflow-hidden">
        <div className="flex">
          {/* Left: address + balance stats */}
          <div className="flex-1 min-w-0">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-[#0e2444] bg-gray-50 dark:bg-[#060e1a]">
              <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Address</div>
              <div className="flex items-center flex-wrap gap-1">
                <span className="font-mono text-[14px] sm:text-[15px] font-bold text-gray-900 dark:text-white break-all">{address}</span>
                <CopyBtn text={address} />
              </div>
            </div>

            {/* Balance strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-[#0e2444]">
              <div className="px-5 py-4">
                <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Balance</div>
                {loading ? <Skeleton className="h-6 w-40" /> : (
                  <>
                    <div className="text-[18px] font-extrabold text-gray-900 dark:text-white leading-tight">
                      {data?.balance_ltc?.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })} LTC
                    </div>
                    <div className="text-[13px] text-gray-400 mt-0.5">
                      ${data?.balance_usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </div>
                  </>
                )}
              </div>
              <div className="px-5 py-4">
                <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Unconfirmed</div>
                {loading ? <Skeleton className="h-6 w-32" /> : (
                  <>
                    <div className="text-[18px] font-extrabold text-gray-900 dark:text-white leading-tight">
                      {data?.unconfirmed_ltc?.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })} LTC
                    </div>
                    <div className="text-[13px] text-gray-400 mt-0.5">
                      ${(data?.unconfirmed_ltc * (data?.ltc_price_usd ?? 0))?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </div>
                  </>
                )}
              </div>
              <div className="px-5 py-4">
                <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Transactions</div>
                {loading ? <Skeleton className="h-6 w-20" /> : (
                  <div className="text-[18px] font-extrabold text-gray-900 dark:text-white">{data?.tx_count != null ? data.tx_count.toLocaleString() : 'Many'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Right: QR code spanning full card height — hidden on mobile */}
          <div className="hidden sm:flex flex-shrink-0 flex-col items-center justify-center gap-2 border-l border-gray-100 dark:border-[#0e2444] px-6 bg-gray-50 dark:bg-[#060e1a]">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(address)}&bgcolor=transparent&color=000000&format=svg`}
              alt="QR Code"
              width={130}
              height={130}
              className="rounded-md dark:invert"
            />
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-600 tracking-wide">Scan address</span>
          </div>
        </div>
      </div>

      {error && !loading && (
        <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-5 py-4">
          <p className="text-[14px] font-bold text-red-600 dark:text-red-400">{error}</p>
          <Link href="/explorer/litecoin" className="text-[13px] text-blue-500 mt-2 inline-block">← Back</Link>
        </div>
      )}

      {historyLimited && !loading && (
        <div className="mb-5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 px-5 py-3">
          <p className="text-[13px] font-bold text-amber-700 dark:text-amber-400">
            This address has a very large transaction history. Showing recent UTXO activity only.
          </p>
        </div>
      )}

      {/* Transactions table */}
      <div className="rounded-xl border border-gray-200 dark:border-[#0e2444] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#0e2444] bg-gray-50 dark:bg-[#060e1a] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1">
            {historyLimited ? (
              <h2 className="text-[13px] font-bold text-gray-600 dark:text-gray-400">Recent UTXO Activity</h2>
            ) : (
              <>
                <button
                  onClick={() => setTab('confirmed')}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${
                    tab === 'confirmed'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0a1a30]'
                  }`}
                >
                  Confirmed{!loading ? ` (${confirmedTxs.length})` : ''}
                </button>
                <button
                  onClick={() => setTab('unconfirmed')}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${
                    tab === 'unconfirmed'
                      ? 'bg-amber-500 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0a1a30]'
                  }`}
                >
                  Unconfirmed{!loading ? ` (${unconfirmedTxs.length})` : ''}
                </button>
              </>
            )}
            {!loading && data?.tx_count != null && (
              <span className="ml-2 text-[12px] text-gray-400 font-normal">({data.tx_count.toLocaleString()} total)</span>
            )}
          </div>
          {!loading && totalPages > 1 && (
            <span className="text-[12px] text-gray-400">Page {page} / {totalPages}</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#0e2444] text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-wide">
                <th className="text-left px-4 py-3">Hash</th>
                <th className="text-left px-4 py-3">+/- Amount</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Tx Fee</th>
                <th className="w-10 px-2 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 10 }, (_, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-[#0a1a30]">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-44" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-2 py-3"><Skeleton className="h-4 w-4" /></td>
                    </tr>
                  ))
                : filteredTxs.length === 0 ?  (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-gray-400">
                        {tab === 'unconfirmed' ? 'No unconfirmed transactions' : 'No transactions found'}
                      </td>
                    </tr>
                  )
                : filteredTxs.map((tx, i) => {
                    const isIn      = tx.direction === 'in';
                    const isUnknown = tx.direction === 'unknown';
                    const isExp     = expandedRows.has(tx.txid);
                    const isLast    = i === filteredTxs.length - 1;

                    return (
                      <>
                        <tr
                          key={tx.txid + i}
                          className={`${isLast && !isExp ? '' : 'border-b border-gray-50 dark:border-[#0a1a30]'} hover:bg-gray-50 dark:hover:bg-[#071a30] transition-colors cursor-pointer`}
                          onClick={() => toggleRow(tx.txid)}
                        >
                          {/* Hash */}
                          <td className="px-4 py-3">
                            <Link
                              href={`/explorer/litecoin/tx/${tx.txid}`}
                              className="font-mono text-blue-500 hover:text-blue-400 font-bold"
                              onClick={e => e.stopPropagation()}
                            >
                              {truncateHash(tx.txid)}
                            </Link>
                          </td>

                          {/* +/- Amount */}
                          <td className="px-4 py-3">
                            {isUnknown ? (
                              <span className="text-gray-400 text-[12px]">—</span>
                            ) : (
                              <>
                                <div className={`font-bold ${isIn ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                  {isIn ? '+' : '-'}{Math.abs(tx.amount_ltc ?? 0).toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })} LTC
                                </div>
                                {(tx.amount_usd ?? 0) > 0 && (
                                  <div className="text-[11px] text-gray-400">
                                    {isIn ? '+' : '-'}${Math.abs(tx.amount_usd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                                  </div>
                                )}
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isIn ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'}`}>
                                  {isIn ? 'In' : 'Out'}
                                </span>
                              </>
                            )}
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3">
                            {tx.block_height ? (
                              <>
                                <div className="text-gray-700 dark:text-gray-300 font-medium">{tx.time_ago ?? '—'}</div>
                                {tx.time_human && <div className="text-[11px] text-gray-400">{tx.time_human}</div>}
                              </>
                            ) : (
                              <span className="text-amber-500 font-medium">Pending</span>
                            )}
                          </td>

                          {/* Fee */}
                          <td className="px-4 py-3">
                            {tx.fee_ltc == null ? (
                              <span className="text-gray-400 text-[12px]">—</span>
                            ) : tx.fee_ltc === 0 ? (
                              <span className="text-gray-400 text-[12px]">{tx.is_coinbase ? '— (coinbase)' : '0'}</span>
                            ) : (
                              <>
                                <div className="text-gray-700 dark:text-gray-300">
                                  {tx.fee_ltc.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 })} LTC
                                </div>
                                {tx.fee_usd != null && tx.fee_usd > 0 && (
                                  <div className="text-[11px] text-gray-400">
                                    ${tx.fee_usd.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} USD
                                  </div>
                                )}
                              </>
                            )}
                          </td>

                          {/* Expand toggle */}
                          <td className="px-2 py-3 text-center text-gray-400 select-none">
                            <span className="text-[18px] leading-none">{isExp ? '▴' : '▾'}</span>
                          </td>
                        </tr>

                        {/* Expanded detail row */}
                        {isExp && (
                          <tr key={`${tx.txid}-exp`} className={`bg-gray-50 dark:bg-[#060e1a] ${isLast ? '' : 'border-b border-gray-100 dark:border-[#0e2444]'}`}>
                            <td colSpan={5} className="px-6 py-4">
                              <div className="flex flex-wrap items-start gap-6 text-[13px]">
                                <div className="flex gap-6 flex-wrap">
                                  <div>
                                    <span className="text-gray-400">Block: </span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                      {tx.block_height
                                        ? `#${tx.block_height.toLocaleString()}`
                                        : <span className="text-amber-500">Pending</span>}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Confirmations: </span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">{tx.confirmations ?? 0}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Fee: </span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                      {tx.fee_ltc == null
                                        ? '—'
                                        : `${tx.fee_ltc.toLocaleString(undefined, { maximumFractionDigits: 8 })} LTC`}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-auto">
                                  <Link
                                    href={`/explorer/litecoin/tx/${tx.txid}`}
                                    className="text-blue-500 hover:text-blue-400 font-bold"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    View Full Transaction →
                                  </Link>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={loadPage} />
    </div>
  );
}
