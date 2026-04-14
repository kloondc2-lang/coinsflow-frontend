'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchBlock } from '../../../../lib/api';

function Skeleton({ className = '' }) {
  return <span className={`inline-block rounded bg-gray-200 dark:bg-[#0e2444] animate-pulse ${className}`} />;
}

function truncateHash(hash, start = 12, end = 12) {
  if (!hash) return '';
  if (hash.length <= start + end + 3) return hash;
  return hash.slice(0, start) + '...' + hash.slice(-end);
}

function InfoRow({ label, value, mono = false, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-gray-50 dark:border-[#0a1a30] last:border-b-0">
      <span className="text-[12px] font-extrabold text-gray-500 dark:text-gray-400 sm:w-44 shrink-0">{label}</span>
      {children ?? (
        <span className={`text-[13px] font-bold text-gray-800 dark:text-gray-200 break-all ${mono ? 'font-mono' : ''}`}>
          {value ?? '—'}
        </span>
      )}
    </div>
  );
}

export default function BlockDetail() {
  const { hash } = useParams();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [txPage, setTxPage] = useState(1);
  const TX_PER_PAGE = 25;

  useEffect(() => {
    if (!hash) return;
    setLoading(true);
    fetchBlock(hash)
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [hash]);

  const txs = data?.transactions ?? [];
  const totalPages = Math.ceil(txs.length / TX_PER_PAGE);
  const pagedTxs = txs.slice((txPage - 1) * TX_PER_PAGE, txPage * TX_PER_PAGE);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-gray-600 font-medium py-5 flex-wrap">
        <Link href="/explorer/litecoin" className="hover:text-blue-500 transition-colors">Litecoin</Link>
        <span className="opacity-40">/</span>
        <Link href="/explorer/litecoin" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">Mainnet</Link>
        <span className="opacity-40">/</span>
        <span className="font-semibold text-gray-700 dark:text-gray-300">Block</span>
        <span className="opacity-40">/</span>
        <span className="font-mono text-gray-500 dark:text-gray-500 text-[11px]">{truncateHash(hash, 8, 8)}</span>
      </nav>

      <h1 className="text-[22px] font-extrabold text-gray-900 dark:text-white mb-6">Block Detail</h1>

      {error && !loading && (
        <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-5 py-4 flex flex-col items-center gap-3">
          <p className="text-[14px] font-bold text-red-600 dark:text-red-400">{error}</p>
          <Link href="/explorer/litecoin" className="text-[13px] font-bold text-blue-500 hover:text-blue-600 transition-colors">&larr; Back to Explorer</Link>
        </div>
      )}

      {/* Block metadata */}
      {(loading || data) && (
      <div className="rounded-2xl border border-gray-100 dark:border-[#0e2444] p-5 mb-6 text-[13px]">
        <h2 className="text-[13px] font-extrabold text-gray-700 dark:text-gray-300 mb-2">Block Information</h2>
        {loading ? (
          Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="py-3 border-b border-gray-50 dark:border-[#0a1a30] last:border-b-0 flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          ))
        ) : (
          <>
            <InfoRow label="Hash"         value={data?.hash} mono />
            <InfoRow label="Height">
              <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">
                #{data?.height?.toLocaleString()}
              </span>
            </InfoRow>
            <InfoRow label="Time"         value={data?.time_human ? `${data.time_human} (${data.time_ago})` : '—'} />
            <InfoRow label="Confirmations" value={data?.confirmations?.toLocaleString()} />
            <InfoRow label="Transactions"  value={data?.tx_count?.toLocaleString()} />
            <InfoRow label="Size"         value={data?.size ? `${data.size.toLocaleString()} bytes` : '—'} />
            <InfoRow label="Block Reward"  value={data?.reward_ltc != null ? `${data.reward_ltc} LTC ($${data.reward_usd?.toLocaleString() ?? '—'} USD)` : '—'} />
            <InfoRow label="Difficulty"   value={data?.difficulty?.toLocaleString(undefined, { maximumFractionDigits: 2 })} />
            <InfoRow label="Merkle Root"  value={data?.merkle_root} mono />
            <InfoRow label="Previous Block">
              {data?.prev_hash ? (
                <Link href={`/explorer/litecoin/block/${data.prev_hash}`} className="font-mono text-blue-500 hover:text-blue-600 font-extrabold text-[14px] break-all">
                  {truncateHash(data.prev_hash)}
                </Link>
              ) : <span className="text-gray-400">—</span>}
            </InfoRow>
            <InfoRow label="Next Block">
              {data?.next_hash ? (
                <Link href={`/explorer/litecoin/block/${data.next_hash}`} className="font-mono text-blue-500 hover:text-blue-600 font-extrabold text-[14px] break-all">
                  {truncateHash(data.next_hash)}
                </Link>
              ) : <span className="text-gray-400 font-bold">Tip (latest)</span>}
            </InfoRow>
          </>
        )}
      </div>
      )}

      {/* Transactions */}
      {(loading || data) && (
      <>
      <h2 className="text-[15px] font-extrabold text-gray-700 dark:text-gray-300 mb-3">
        Transactions {!loading && <span className="text-gray-400 font-bold">({data?.tx_count?.toLocaleString()})</span>}
      </h2>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-[#0e2444]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-[#0e2444] text-gray-500 dark:text-gray-400 font-extrabold">
              <th className="text-left px-4 py-3">TXID</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Type</th>
              <th className="text-left px-4 py-3">Amount (LTC)</th>
              <th className="text-right px-4 py-3 hidden sm:table-cell">Amount (USD)</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 10 }, (_, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-[#0a1a30]">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                  </tr>
                ))
              : pagedTxs.map((tx, i) => (
                  <tr key={tx.txid} className={`border-b border-gray-50 dark:border-[#0a1a30] hover:bg-gray-50 dark:hover:bg-[#071a30] transition-colors ${i === pagedTxs.length - 1 && pagedTxs.length === txs.length ? 'border-b-0' : ''}`}>
                    <td className="px-4 py-3">
                      <Link href={`/explorer/litecoin/tx/${tx.txid}`} className="font-mono text-blue-500 hover:text-blue-600 font-extrabold text-[14px]">
                        {truncateHash(tx.txid)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {tx.is_coinbase ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold">Coinbase</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 text-[11px] font-extrabold">Transfer</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-gray-700 dark:text-gray-300">{tx.amount_ltc?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-right font-bold text-gray-500 dark:text-gray-400">${tx.amount_usd?.toLocaleString()}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setTxPage(1)}
            disabled={txPage === 1}
            className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0e2444] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            &laquo;
          </button>
          <button
            onClick={() => setTxPage((p) => Math.max(1, p - 1))}
            disabled={txPage === 1}
            className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0e2444] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            &lsaquo; Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - txPage) <= 2)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span key={`dot-${i}`} className="px-1 text-[12px] text-gray-400">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setTxPage(p)}
                  className={`min-w-[32px] px-2 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                    txPage === p
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0e2444]'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          <button
            onClick={() => setTxPage((p) => Math.min(totalPages, p + 1))}
            disabled={txPage === totalPages}
            className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0e2444] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next &rsaquo;
          </button>
          <button
            onClick={() => setTxPage(totalPages)}
            disabled={txPage === totalPages}
            className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0e2444] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            &raquo;
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
}
