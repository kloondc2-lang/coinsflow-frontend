'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchAddress } from '../../../../lib/api';

function Skeleton({ className = '' }) {
  return <span className={`inline-block rounded bg-gray-200 dark:bg-[#0e2444] animate-pulse ${className}`} />;
}

function truncateHash(hash, start = 10, end = 10) {
  if (!hash) return '';
  if (hash.length <= start + end + 3) return hash;
  return hash.slice(0, start) + '...' + hash.slice(-end);
}

export default function AddressDetail() {
  const { address } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [page, setPage]       = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 25;

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setPage(1);
    fetchAddress(address, 1, LIMIT)
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [address]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    fetchAddress(address, nextPage, LIMIT)
      .then((d) => {
        setData((prev) => ({
          ...d,
          transactions: [...(prev?.transactions ?? []), ...(d?.transactions ?? [])],
        }));
        setPage(nextPage);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingMore(false));
  };

  const txs = data?.transactions ?? [];
  const hasMore = data?.tx_count != null && txs.length < data.tx_count;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-gray-600 font-medium py-5 flex-wrap">
        <Link href="/explorer/litecoin" className="hover:text-blue-500 transition-colors">Litecoin</Link>
        <span className="opacity-40">/</span>
        <Link href="/explorer/litecoin" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">Mainnet</Link>
        <span className="opacity-40">/</span>
        <span className="font-semibold text-gray-700 dark:text-gray-300">Address</span>
        <span className="opacity-40">/</span>
        <span className="font-mono text-gray-500 dark:text-gray-500 text-[11px]">{truncateHash(address, 8, 8)}</span>
      </nav>

      <h1 className="text-[22px] font-extrabold text-gray-900 dark:text-white mb-1">Address</h1>
      <p className="font-mono text-[13px] text-gray-500 dark:text-gray-400 mb-6 break-all">{address}</p>

      {error && !loading && (
        <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-5 py-4 flex flex-col items-center gap-3">
          <p className="text-[14px] font-bold text-red-600 dark:text-red-400">{error}</p>
          <Link href="/explorer/litecoin" className="text-[13px] font-bold text-blue-500 hover:text-blue-600 transition-colors">&larr; Back to Explorer</Link>
        </div>
      )}

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Confirmed Balance',
            value: loading ? null : `${data?.balance_ltc?.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })} LTC`,
            sub: loading ? null : `$${data?.balance_usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`,
            highlight: true,
          },
          {
            label: 'Unconfirmed Balance',
            value: loading ? null : `${data?.unconfirmed_ltc?.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })} LTC`,
            sub: loading ? null : `$${(data?.unconfirmed_ltc * (data?.ltc_price_usd ?? 0))?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`,
          },
          {
            label: 'Total Transactions',
            value: loading ? null : data?.tx_count?.toLocaleString(),
          },
        ].map((card, i) => (
          <div key={i} className={`rounded-2xl border p-5 ${card.highlight ? 'border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-900/10' : 'border-gray-100 dark:border-[#0e2444]'}`}>
            <div className="text-[11px] font-extrabold text-gray-500 dark:text-gray-400 mb-1">{card.label}</div>
            {loading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <>
                <div className="text-[18px] font-extrabold text-gray-900 dark:text-white leading-tight">{card.value}</div>
                {card.sub && <div className="text-[12px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">{card.sub}</div>}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <h2 className="text-[15px] font-extrabold text-gray-700 dark:text-gray-300 mb-3">
        Transaction History{!loading && data?.tx_count != null && <span className="text-gray-400 font-bold ml-1">({data.tx_count.toLocaleString()})</span>}
      </h2>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-[#0e2444]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-[#0e2444] text-gray-500 dark:text-gray-400 font-extrabold">
              <th className="text-left px-4 py-3">TXID</th>
              <th className="text-left px-4 py-3">Direction</th>
              <th className="text-left px-4 py-3">Amount (LTC)</th>
              <th className="text-left px-4 py-3">Block</th>
              <th className="text-right px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 10 }, (_, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-[#0a1a30]">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                  </tr>
                ))
              : txs.map((tx, i) => {
                  const isIn = tx.direction === 'in';
                  return (
                    <tr key={tx.txid + i} className={`border-b border-gray-50 dark:border-[#0a1a30] hover:bg-gray-50 dark:hover:bg-[#071a30] transition-colors ${i === txs.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="px-4 py-3">
                        <Link href={`/explorer/litecoin/tx/${tx.txid}`} className="font-mono text-blue-500 hover:text-blue-600 font-extrabold text-[14px]">
                          {truncateHash(tx.txid)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${isIn ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                          {isIn ? 'IN' : 'OUT'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-extrabold ${isIn ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        {isIn ? '+' : '-'}{Math.abs(tx.amount_ltc)?.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-bold">
                        {tx.block_height ? (
                          <Link href={`/explorer/litecoin/block/${tx.block_hash}`} className="font-extrabold text-[14px] hover:text-blue-500 transition-colors">
                            #{tx.block_height?.toLocaleString()}
                          </Link>
                        ) : <span className="text-amber-500">Unconfirmed</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 font-medium">
                        {tx.time_ago ?? '—'}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[13px] font-bold transition-colors">
            {loadingMore ? 'Loading...' : 'Load More Transactions'}
          </button>
        </div>
      )}
    </div>
  );
}
