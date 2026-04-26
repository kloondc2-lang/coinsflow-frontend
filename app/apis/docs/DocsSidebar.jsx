'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const NAV = [
  { label: 'Getting Started', id: 'getting-started' },
  { label: 'Authentication',  id: 'authentication' },
  { label: 'Base URL',        id: 'base-url' },
  { label: 'Rate Limits',     id: 'rate-limits' },
  { label: 'Error Codes',     id: 'errors' },
  { label: 'Endpoints',       id: null },
  { label: 'Address Lookup',  id: 'endpoint-address' },
  { label: 'Transaction',     id: 'endpoint-tx' },
  { label: 'Block',           id: 'endpoint-block' },
  { label: 'Latest Blocks',   id: 'endpoint-blocks' },
  { label: 'Live Price',      id: 'endpoint-price' },
];

const SECTION_IDS = NAV.filter((n) => n.id !== null).map((n) => n.id);

export default function DocsSidebar() {
  const [activeId, setActiveId] = useState('getting-started');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const observers = [];
    const visibleSections = new Map();

    function updateActive() {
      let topmost = null;
      let topmostY = Infinity;
      visibleSections.forEach((rect, id) => {
        if (rect < topmostY) {
          topmostY = rect;
          topmost = id;
        }
      });
      if (topmost) setActiveId(topmost);
    }

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visibleSections.set(id, entry.boundingClientRect.top);
          } else {
            visibleSections.delete(id);
          }
          updateActive();
        },
        { rootMargin: '-10% 0px -60% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const navList = (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((n, i) =>
        n.id === null ? (
          <p key={i} className="text-[10px] font-semibold text-[#1e3050] uppercase tracking-widest mt-4 mb-1 px-3">
            {n.label}
          </p>
        ) : (
          <a
            key={n.id}
            href={`#${n.id}`}
            onClick={() => setMobileOpen(false)}
            className={`px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 ${
              activeId === n.id
                ? 'text-[#e2e8f0] bg-white/[0.06] border-l-2 border-blue-500'
                : 'text-[#4a5568] hover:text-[#94a3b8] hover:bg-white/[0.04]'
            }`}
          >
            {n.label}
          </a>
        )
      )}
    </nav>
  );

  return (
    <>
      {/* ── Mobile toggle button ────────────────────────────────── */}
      <div className="lg:hidden sticky top-[68px] z-30 bg-[#020d1c] border-b border-white/[0.06] px-4 py-2">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center gap-2 text-[13px] font-semibold text-[#64748b] hover:text-[#94a3b8] transition-colors py-2"
          aria-expanded={mobileOpen}
          aria-label="Toggle table of contents"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="15" y2="12"/>
            <line x1="3" y1="18" x2="18" y2="18"/>
          </svg>
          Contents
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: mobileOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {mobileOpen && (
          <div className="pb-3 border-t border-white/[0.06] pt-3">
            {navList}
            <div className="mt-4 px-3">
              <Link
                href="/apis/dashboard"
                className="block text-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold transition-colors"
              >
                Get API Key
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:block w-[220px] flex-shrink-0 sticky top-[68px] h-[calc(100vh-68px)] overflow-y-auto py-10 pr-4">
        <p className="text-[10.5px] font-semibold text-[#334155] uppercase tracking-widest mb-4 px-3">Documentation</p>
        {navList}
        <div className="mt-8 px-3">
          <Link
            href="/apis/dashboard"
            className="block text-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold transition-colors active:scale-[0.97]"
          >
            Get API Key
          </Link>
        </div>
      </aside>
    </>
  );
}
