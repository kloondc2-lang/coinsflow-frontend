'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchTx } from '../../../../lib/api';

function Skeleton({ className = '' }) {
  return <span className={`inline-block rounded bg-gray-200 dark:bg-[#0e2444] animate-pulse ${className}`} />;
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={copy}
      title="Copy"
      className="ml-1 shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-[#0e2444] hover:bg-blue-100 dark:hover:bg-[#1a3060] transition-colors"
    >
      {copied ? (
        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}

function truncateMiddle(str, keep = 10) {
  if (!str || str.length <= keep * 2 + 3) return str;
  return str.slice(0, keep) + '...' + str.slice(-keep);
}

function InfoRow({ label, children, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-gray-100 dark:border-[#0a1a30] last:border-b-0">
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 sm:w-48 shrink-0 pt-0.5">{label}</span>
      <div className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 break-all">
        {children ?? value ?? '—'}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, highlight }) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-[#0e2444] bg-white dark:bg-[#060f1e] px-5 py-4">
      <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">{label}</div>
      <div className={`text-[15px] font-extrabold break-all ${highlight ?? 'text-gray-900 dark:text-white'}`}>{value}</div>
      {sub && <div className="text-[12px] font-semibold text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

const fmt8 = (n) =>
  n != null ? n.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 }) : '—';

const fmtUsd = (n) =>
  n != null ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '';

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

  const isConfirmed = data?.confirmations > 0;
  const isCoinbase  = data?.is_coinbase;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-16">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-gray-600 font-medium py-5 flex-wrap">
        <Link href="/explorer/litecoin" className="hover:text-blue-500 transition-colors">Litecoin</Link>
        <span className="opacity-40">/</span>
        <Link href="/explorer/litecoin" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">Mainnet</Link>
        <span className="opacity-40">/</span>
        <span className="text-gray-700 dark:text-gray-300 font-semibold">Transaction</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-[22px] font-extrabold text-gray-900 dark:text-white">Transaction</h1>
          {isConfirmed ? (
            <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[11px] font-extrabold">Confirmed</span>
          ) : data && !loading ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[11px] font-extrabold">Pending</span>
          ) : null}
          {isCoinbase && (
            <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[11px] font-extrabold">Coinbase</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-2">
          <span className="font-mono text-[13px] text-gray-500 dark:text-gray-400 break-all">{txid}</span>
          <CopyBtn text={txid} />
        </div>
      </div>

      {error && !loading && (
        <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-5 py-4 flex flex-col items-center gap-3">
          <p className="text-[14px] font-bold text-red-600 dark:text-red-400">{error}</p>
          <Link href="/explorer/litecoin" className="text-[13px] font-bold text-blue-500 hover:text-blue-600 transition-colors">&larr; Back to Explorer</Link>
        </div>
      )}

      {/* Stat strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {loading ? (
          Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 dark:border-[#0e2444] px-5 py-4">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              label="Amount Transacted"
              value={`${fmt8(data?.total_output_ltc)} LTC`}
              sub={fmtUsd(data?.amount_usd)}
            />
            <StatCard
              label="Block"
              value={data?.block_height ? `#${data.block_height.toLocaleString()}` : 'Pending'}
              highlight={data?.block_height ? 'text-blue-500' : 'text-amber-500'}
            />
            <StatCard
              label="Fee"
              value={isCoinbase ? '0.00000000 LTC' : `${fmt8(data?.fee_ltc)} LTC`}
              sub={isCoinbase ? '' : fmtUsd(data?.fee_usd)}
            />
            <StatCard
              label="Confirmations"
              value={(data?.confirmations ?? 0).toLocaleString()}
              highlight={isConfirmed ? 'text-green-600 dark:text-green-400' : 'text-amber-500'}
            />
          </>
        )}
      </div>

      {/* Details table */}
      {(loading || data) && (
        <div className="rounded-2xl border border-gray-100 dark:border-[#0e2444] bg-white dark:bg-[#060f1e] px-5 mb-6">
          <div className="py-3 border-b border-gray-100 dark:border-[#0a1a30]">
            <h2 className="text-[12px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">Details</h2>
          </div>
          {loading ? (
            Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex gap-4 py-3 border-b border-gray-100 dark:border-[#0a1a30] last:border-b-0">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-56" />
              </div>
            ))
          ) : (
            <>
              <InfoRow label="Status">
                {isConfirmed ? (
                  <span className="text-green-600 dark:text-green-400 font-extrabold">Confirmed</span>
                ) : (
                  <span className="text-amber-500 font-extrabold">Pending / Unconfirmed</span>
                )}
              </InfoRow>
              <InfoRow label="TXID" value={data?.txid} />
              <InfoRow label="Block">
                {data?.block_hash ? (
                  <Link href={`/explorer/litecoin/block/${data.block_hash}`} className="text-blue-500 hover:text-blue-600 font-extrabold font-mono break-all">
                    {data.block_hash} <span className="font-sans">#{data.block_height?.toLocaleString()}</span>
                  </Link>
                ) : <span className="text-amber-500 font-semibold">—</span>}
              </InfoRow>
              <InfoRow label="Date / Time">
                {data?.time_human ? `${data.time_human} (${data.time_ago})` : '—'}
              </InfoRow>
              <InfoRow label="Confirmations" value={(data?.confirmations ?? 0).toLocaleString()} />
              <InfoRow label="Size" value={data?.size != null ? `${data.size.toLocaleString()} bytes` : '—'} />
              <InfoRow label="Total Input" value={isCoinbase ? 'Coinbase (block reward)' : `${fmt8(data?.total_input_ltc)} LTC`} />
              <InfoRow label="Total Output" value={`${fmt8(data?.total_output_ltc)} LTC`} />
              <InfoRow label="Fee">
                {isCoinbase
                  ? '0.00000000 LTC'
                  : data?.fee_ltc != null
                    ? `${fmt8(data.fee_ltc)} LTC ${fmtUsd(data.fee_usd) ? `(${fmtUsd(data.fee_usd)})` : ''}`
                    : '—'}
              </InfoRow>
              <InfoRow label="Fee per Byte">
                {isCoinbase
                  ? '—'
                  : data?.fee_per_byte != null
                    ? `${data.fee_per_byte} sat/byte`
                    : '—'}
              </InfoRow>
              <InfoRow label="Value (USD)" value={fmtUsd(data?.amount_usd) || '—'} />
              <InfoRow label="LTC Price" value={data?.ltc_price_usd ? `$${data.ltc_price_usd.toFixed(2)}` : '—'} />
              <InfoRow label="Type" value={isCoinbase ? 'Coinbase (Block Reward)' : 'Transfer'} />
            </>
          )}
        </div>
      )}

      {/* Inputs / Outputs */}
      {(loading || data) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Inputs */}
          <div className="rounded-2xl border border-gray-100 dark:border-[#0e2444] bg-white dark:bg-[#060f1e] overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-[#0a1a30] flex items-center gap-2">
              <h2 className="text-[12px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">Inputs</h2>
              {!loading && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#0e2444] text-gray-500 text-[11px] font-extrabold">
                  {data?.inputs?.length ?? 0}
                </span>
              )}
            </div>
            <div className="divide-y divide-gray-50 dark:divide-[#0a1a30]">
              {loading
                ? Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="px-5 py-4 flex flex-col gap-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))
                : (data?.inputs ?? []).map((inp, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <span className="text-[11px] font-extrabold text-gray-400 dark:text-gray-600 pt-0.5 min-w-[18px]">{i}</span>
                        <div className="min-w-0 flex-1">
                          {inp.label === 'Block Reward' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[12px] font-extrabold">
                              Block Reward
                            </span>
                          ) : (
                            <>
                              {inp.address ? (
                                <Link
                                  href={`/explorer/litecoin/address/${inp.address}`}
                                  className="font-mono text-blue-500 hover:text-blue-600 font-bold text-[12px] break-all"
                                >
                                  {inp.address}
                                </Link>
                              ) : (
                                <span className="font-mono text-gray-400 text-[12px]">Unknown</span>
                              )}
                              <div className="text-[12px] font-extrabold text-gray-700 dark:text-gray-300 mt-1">
                                {fmt8(inp.value_ltc)} LTC
                                {inp.value_usd != null && (
                                  <span className="text-gray-400 font-semibold ml-1">({fmtUsd(inp.value_usd)})</span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {/* Outputs */}
          <div className="rounded-2xl border border-gray-100 dark:border-[#0e2444] bg-white dark:bg-[#060f1e] overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-[#0a1a30] flex items-center gap-2">
              <h2 className="text-[12px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">Outputs</h2>
              {!loading && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#0e2444] text-gray-500 text-[11px] font-extrabold">
                  {data?.outputs?.length ?? 0}
                </span>
              )}
            </div>
            <div className="divide-y divide-gray-50 dark:divide-[#0a1a30]">
              {loading
                ? Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="px-5 py-4 flex flex-col gap-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))
                : (data?.outputs ?? []).map((out, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <span className="text-[11px] font-extrabold text-gray-400 dark:text-gray-600 pt-0.5 min-w-[18px]">{out.index ?? i}</span>
                        <div className="min-w-0 flex-1">
                          {out.address ? (
                            <Link
                              href={`/explorer/litecoin/address/${out.address}`}
                              className="font-mono text-blue-500 hover:text-blue-600 font-bold text-[12px] break-all"
                            >
                              {out.address}
                            </Link>
                          ) : (
                            <span className="font-mono text-gray-400 text-[12px]">{out.script_type ?? 'Non-standard'}</span>
                          )}
                          <div className="text-[12px] font-extrabold text-gray-700 dark:text-gray-300 mt-1">
                            {fmt8(out.value_ltc)} LTC
                            {out.value_usd != null && (
                              <span className="text-gray-400 font-semibold ml-1">({fmtUsd(out.value_usd)})</span>
                            )}
                          </div>
                          {out.script_type && out.script_type !== 'unknown' && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#0e2444] text-gray-500 text-[10px] font-bold uppercase tracking-wide">
                              {out.script_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
