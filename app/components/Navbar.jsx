'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const chains = [
  { name: 'Litecoin', ticker: 'LTC', href: '/explorer/litecoin', icon: '/ltc.svg', desc: 'Scrypt PoW · 2.5 min blocks' },
];

function ChevronDown() {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      className="inline-block ml-1 opacity-60"
    >
      <path
        d="M1 1l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


export default function Navbar() {
  const [open, setOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#020d1c] border-none transition-colors duration-300">
      <div className="w-full px-5 sm:px-8 h-[68px] flex items-center relative">

        {/* Logo — far left */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.png"
            alt="CoinsFlow"
            width={180}
            height={46}
            className="h-11 w-auto object-contain dark:invert"
            priority
          />
        </Link>

        {/* Desktop Nav — centered absolute */}
        <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">

          {/* Explore dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpen('explore')}
            onMouseLeave={() => setOpen(null)}
          >
            <button className="px-3 py-2 text-[13.5px] font-bold text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg flex items-center transition-colors">
              Explore <ChevronDown />
            </button>
            {open === 'explore' && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#071a30] border border-gray-100 dark:border-[#0e2444] rounded-2xl shadow-xl p-4 z-50 w-[340px]">
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-3">Blockchain Explorers</p>
                <div className="grid grid-cols-1 gap-1">
                  {chains.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-[#0e2444] flex items-center justify-center flex-shrink-0">
                        <Image src={c.icon} alt={c.name} width={22} height={22} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-extrabold text-gray-800 dark:text-gray-200 group-hover:text-blue-500 transition-colors">
                          {c.name}
                          <span className="ml-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500">{c.ticker}</span>
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-600">{c.desc}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#0e2444]">
                  <span className="text-[11px] text-gray-400 dark:text-gray-600 font-medium">More chains coming soon...</span>
                </div>
              </div>
            )}
          </div>

          {/* Flat links */}
          {[
            { label: 'APIs', href: '/apis' },
            { label: 'About', href: '/about' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3 py-2 text-[13.5px] font-bold text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side: mobile hamburger */}
        <div className="ml-auto flex items-center gap-3">

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white dark:bg-[#020d1c] px-4 py-5 flex flex-col divide-y divide-gray-100 dark:divide-[#0e2444] transition-colors duration-300">
          <div className="pb-4">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-3">
              Explore
            </p>
            <div className="grid grid-cols-2 gap-1">
              {chains.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="flex items-center gap-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <Image
                    src={c.icon}
                    alt={c.name}
                    width={16}
                    height={16}
                    className="flex-shrink-0"
                  />
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            {['APIs', 'About'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
