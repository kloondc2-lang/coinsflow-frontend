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

  return (
    <aside className="hidden lg:block w-[220px] flex-shrink-0 sticky top-[68px] h-[calc(100vh-68px)] overflow-y-auto py-10 pr-4">
      <p className="text-[10.5px] font-semibold text-[#334155] uppercase tracking-widest mb-4 px-3">Documentation</p>
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
      <div className="mt-8 px-3">
        <Link
          href="/apis/dashboard"
          className="block text-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold transition-colors active:scale-[0.97]"
        >
          Get API Key
        </Link>
      </div>
    </aside>
  );
}
