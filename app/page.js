'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { smartSearch } from './lib/api';

const chains = [
  { name: 'Litecoin', href: '/explorer/litecoin', icon: '/ltc.svg' },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const router = useRouter();

  const WORDS = ['transactions', 'addresses', 'blocks'];
  const [typeState, setTypeState] = useState({ text: '', wordIdx: 0, isDeleting: false });

  useEffect(() => {
    const current = WORDS[typeState.wordIdx];
    const { text, isDeleting, wordIdx } = typeState;
    let delay = isDeleting ? 55 : 95;
    if (!isDeleting && text === current) delay = 1800;
    const t = setTimeout(() => {
      if (!isDeleting && text === current) {
        setTypeState(s => ({ ...s, isDeleting: true }));
      } else if (isDeleting && text === '') {
        setTypeState({ text: '', wordIdx: (wordIdx + 1) % WORDS.length, isDeleting: false });
      } else if (isDeleting) {
        setTypeState(s => ({ ...s, text: current.slice(0, text.length - 1) }));
      } else {
        setTypeState(s => ({ ...s, text: current.slice(0, text.length + 1) }));
      }
    }, delay);
    return () => clearTimeout(t);
  }, [typeState]);

  async function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError('');
    try {
      const result = await smartSearch(q);
      if (!result) {
        setSearchError('Nothing found — check your input and try again.');
        return;
      }
      const routes = { tx: 'tx', block: 'block', address: 'address' };
      router.push(`/explorer/litecoin/${routes[result.type]}/${q}`);
    } catch {
      setSearchError('Search failed — backend may be offline.');
    } finally {
      setSearching(false);
    }
  }
  return (
    <div className="flex flex-col items-center px-6 sm:px-12">

      {/* ── Hero / Search ── */}
      <section className="w-full max-w-4xl pt-16 pb-10 flex flex-col items-center text-center">
        <h1 className="text-[34px] sm:text-[48px] font-extrabold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
          Explore the blockchain!
          <span className="block">
            Search for{' '}
            <span className="text-blue-500 dark:text-blue-400 whitespace-nowrap">
              {typeState.text}
              <span className="inline-block w-[3px] h-[0.85em] bg-blue-500 dark:bg-blue-400 align-middle ml-[2px] rounded-sm" style={{ animation: 'blink 0.85s step-end infinite' }} />
              <span className="text-gray-400 dark:text-gray-600">...</span>
            </span>
          </span>
        </h1>
        <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed mb-14 max-w-2xl">
          We only provide limited cryptocurrency explorers, APIs and payment gateways
          as the early stage of CoinsFlow — more cryptocurrencies to come soon.
        </p>

        <form onSubmit={handleSearch} className="w-full relative">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchError(''); }}
            placeholder="Block hash, transaction hash, address..."
            disabled={searching}
            className="w-full pl-5 pr-14 py-[14px] rounded-full border-2 border-gray-300 dark:border-[#1a3a60] text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200 shadow-sm bg-transparent disabled:opacity-60"
          />
          <button
            type="submit"
            aria-label="Search"
            disabled={searching}
            className="absolute right-[6px] top-1/2 -translate-y-1/2 w-[42px] h-[42px] rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center transition-colors"
          >
            {searching ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
              width="16"
              height="16"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            )}
          </button>
        </form>
        {searchError && (
          <p className="mt-3 text-[13px] font-bold text-red-500 dark:text-red-400">{searchError}</p>
        )}
      </section>

      {/* ── Chain Icons ── */}
      <section className="flex flex-wrap justify-center gap-3 pb-16">
        {chains.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            aria-label={c.name}
            className="w-16 h-16 rounded-2xl border-2 border-gray-200 dark:border-[#1a3a60] hover:border-blue-400 hover:shadow-md hover:scale-105 transition-all duration-200 bg-transparent flex items-center justify-center"
          >
            <Image
              src={c.icon}
              alt={c.name}
              width={38}
              height={38}
              className="object-contain"
            />
          </Link>
        ))}
      </section>

    </div>
  );
}
