'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchTx } from '../../../../lib/api';

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

export default function TxDetail() {
  const { txid } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!txid) return;
    setLoading(true);
    fetchTx(txid)
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [txid]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-gray-600 font-medium py-5 flex-wrap">
        <Link href="/explorer/litecoin" className="hover:text-blue-500 transition-colors">Litecoin</Link>
        <span className="opacity-40">/</span>
        <Link href="/explorer/litecoin" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">Mainnet</Link>
        <span className="opacity-40">/</span>
        <span className="font-semibold text-gray-700 dark:text-gray-300">Transaction</span>
        <span className="opacity-40">/</span>
        <span className="font-mono text-gray-500 dark:text-gray-500 text-[11px]">{truncateHash(txid, 8, 8)}</span>
      </nav>

      <h1 className="text-[22px] font-extrabold text-gray-900 dark:text-white mb-6">Transaction Detail</h1>

      {error && !loading && (
        <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-5 py-4 flex flex-col items-center gap-3">
          <p className="text-[14px] font-bold text-red-600 dark:text-red-400">{error}</p>
          <Link href="/explorer/litecoin" className="text-[13px] font-bold text-blue-500 hover:text-blue-600 transition-colors">&larr; Back to Explorer</Link>
        </div>
      )}

      {/* Summary */}
      {(loading || data) && (
      <>
      <div className="rounded-2xl border border-gray-100 dark:border-[#0e2444] p-5 mb-6">
        <h2 className="text-[13px] font-extrabold text-gray-700 dark:text-gray-300 mb-2">Summary</h2>
        {loading ? (
          Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="py-3 border-b border-gray-50 dark:border-[#0a1a30] last:border-b-0 flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          ))
        ) : (
          <>
            <InfoRow label="TXID"          value={data?.txid} mono />
            <InfoRow label="Block">
              {data?.block_hash ? (
                <Link href={`/explorer/litecoin/block/${data.block_hash}`} className="font-mono text-blue-500 hover:text-blue-600 font-extrabold text-[14px] break-all">
                  {truncateHash(data.block_hash)} (#{data.block_height?.toLocaleString()})
                </Link>
              ) : <span className="text-amber-500 font-bold text-[13px]">Unconfirmed</span>}
            </InfoRow>
            <InfoRow label="Time"          value={data?.time_human ? `${data.time_human} (${data.time_ago})` : 'Unconfirmed'} />
            <InfoRow label="Confirmations"  value={data?.confirmations?.toLocaleString() ?? '0'} />
            <InfoRow label="Size"          value={`${data?.size?.toLocaleString()} bytes`} />
            <InfoRow label="Type"          value={data?.is_coinbase ? 'Coinbase (Block Reward)' : 'Transfer'} />
            <InfoRow label="Fee"           value={data?.fee != null ? `${data.fee.toFixed(8)} LTC ($${data.fee_usd?.toFixed(2)} USD)` : '—'} />
            <InfoRow label="Fee / Byte"    value={data?.fee_per_byte != null ? `${data.fee_per_byte.toFixed(4)} LTC/byte` : '—'} />
          </>
        )}
      </div>

      {/* Inputs / Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#0e2444] overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-[#0e2444]">
            <h2 className="text-[13px] font-extrabold text-gray-700 dark:text-gray-300">
              Inputs {!loading && <span className="text-gray-400">({data?.inputs?.length})</span>}
            </h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-[#0a1a30]">
            {loading
              ? Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="px-5 py-3 flex flex-col gap-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))
              : (data?.inputs ?? []).map((inp, i) => (
                  <div key={i} className="px-5 py-3">
                    {inp.is_coinbase ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[12px] font-extrabold">Block Reward</span>
                    ) : (
                      <>
                        {inp.address ? (
                          <Link href={`/explorer/litecoin/address/${inp.address}`} className="font-mono text-blue-500 hover:text-blue-600 font-extrabold text-[14px] break-all">
                            {inp.address}
                          </Link>
                        ) : <span className="font-mono text-gray-400 text-[12px]">Unknown</span>}
                        <div className="text-[12px] font-extrabold text-gray-600 dark:text-gray-300 mt-0.5">
                          {inp.value?.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })} LTC
                        </div>
                      </>
                    )}
                  </div>
                ))}
          </div>
        </div>

        {/* Outputs */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#0e2444] overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-[#0e2444]">
            <h2 className="text-[13px] font-extrabold text-gray-700 dark:text-gray-300">
              Outputs {!loading && <span className="text-gray-400">({data?.outputs?.length})</span>}
            </h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-[#0a1a30]">
            {loading
              ? Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="px-5 py-3 flex flex-col gap-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))
              : (data?.outputs ?? []).map((out, i) => (
                  <div key={i} className="px-5 py-3">
                    {out.address ? (
                      <Link href={`/explorer/litecoin/address/${out.address}`} className="font-mono text-blue-500 hover:text-blue-600 font-extrabold text-[14px] break-all">
                        {out.address}
                      </Link>
                    ) : (
                      <span className="font-mono text-gray-400 text-[12px]">{out.script_type ?? 'Non-standard'}</span>
                    )}
                    <div className="text-[12px] font-extrabold text-gray-600 dark:text-gray-300 mt-0.5">
                      {out.value?.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })} LTC
                    </div>
                    {out.script_type && (
                      <div className="text-[11px] text-gray-400 font-medium mt-0.5">{out.script_type}</div>
                    )}
                  </div>
                ))}
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
