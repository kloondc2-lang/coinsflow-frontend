'use client';

import { useState } from 'react';

const LANG_META = {
  curl:   { label: 'cURL',    lang: 'bash' },
  python: { label: 'Python',  lang: 'python' },
  node:   { label: 'Node.js', lang: 'js' },
};

export default function CodeTabs({ examples }) {
  const langs = Object.keys(examples).filter((k) => examples[k]);
  const [active, setActive] = useState(langs[0]);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(examples[active]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-white/[0.06] overflow-hidden my-4">
      {/* Tab bar */}
      <div className="flex items-center border-b border-white/[0.06] bg-[#071423]">
        <div className="flex">
          {langs.map((lang) => (
            <button
              key={lang}
              onClick={() => setActive(lang)}
              className={`px-4 py-2.5 text-[12px] font-semibold transition-colors border-b-2 -mb-px ${
                active === lang
                  ? 'border-blue-500 text-blue-400 bg-transparent'
                  : 'border-transparent text-[#4a5568] hover:text-[#94a3b8]'
              }`}
            >
              {LANG_META[lang]?.label ?? lang}
            </button>
          ))}
        </div>
        <button
          onClick={copy}
          className="ml-auto mr-3 flex items-center gap-1.5 text-[11px] text-[#4a5568] hover:text-[#94a3b8] transition-colors"
        >
          {copied ? (
            <>
              <svg width="11" height="11" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-emerald-400">copied</span>
            </>
          ) : (
            <>
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              copy
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <pre className="px-5 py-4 bg-[#040c1a] text-[12.5px] font-mono text-[#94a3b8] leading-relaxed overflow-x-auto whitespace-pre">
        <code>{examples[active]}</code>
      </pre>
    </div>
  );
}
