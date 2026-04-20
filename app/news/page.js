'use client';

import { useState, useEffect, useCallback } from 'react';

const PAGE_SIZE = 20;

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) === 1 ? '' : 's'} ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) === 1 ? '' : 's'} ago`;
}

function NewsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border border-gray-100 dark:border-[#0e2444] rounded-xl p-4 animate-pulse">
          <div className="h-3 w-24 bg-gray-200 dark:bg-[#0e2444] rounded mb-3" />
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-[#0e2444] rounded mb-2" />
          <div className="h-3 w-full bg-gray-100 dark:bg-[#071a30] rounded mb-1" />
          <div className="h-3 w-2/3 bg-gray-100 dark:bg-[#071a30] rounded" />
        </div>
      ))}
    </div>
  );
}

export default function NewsPage() {
  const [allArticles, setAllArticles] = useState([]);
  const [sources, setSources] = useState([]);
  const [activeSource, setActiveSource] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNews = useCallback(async (sourceId) => {
    setLoading(true);
    setError('');
    try {
      const url = sourceId ? `/api/news?source=${encodeURIComponent(sourceId)}` : '/api/news';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setAllArticles(data.articles || []);
      setSources(data.sources || []);
    } catch {
      setError('Could not load news. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews('');
  }, [fetchNews]);

  const handleSourceChange = (sourceId) => {
    setActiveSource(sourceId);
    setPage(1);
    fetchNews(sourceId);
  };

  const totalPages = Math.ceil(allArticles.length / PAGE_SIZE);
  const pageArticles = allArticles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build page numbers to display (max 7 visible)
  const buildPageNums = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, page]);
    for (let d = -2; d <= 2; d++) {
      const p = page + d;
      if (p > 1 && p < totalPages) pages.add(p);
    }
    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    let prev = 0;
    for (const n of sorted) {
      if (n - prev > 1) result.push('...');
      result.push(n);
      prev = n;
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060e1a]">
      {/* Page header */}
      <div className="bg-white dark:bg-[#020d1c] border-b border-gray-100 dark:border-[#0e2444]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Crypto News
          </h1>
          <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">
            Latest headlines from top crypto media sources
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ── */}
          <aside className="lg:w-52 flex-shrink-0">
            <div className="bg-white dark:bg-[#071a30] border border-gray-100 dark:border-[#0e2444] rounded-2xl p-5 sticky top-[84px]">
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                Sources
              </p>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <button
                    onClick={() => handleSourceChange('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                      activeSource === ''
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    All Sources
                  </button>
                </li>
                {sources.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => handleSourceChange(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                        activeSource === s.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ── Article list ── */}
          <main className="flex-1 min-w-0">
            {loading && <NewsSkeleton />}

            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-red-400 text-sm mb-4">{error}</div>
                <button
                  onClick={() => fetchNews(activeSource)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && allArticles.length === 0 && (
              <div className="text-center py-24 text-gray-400 text-sm">No articles found.</div>
            )}

            {!loading && !error && pageArticles.length > 0 && (
              <>
                <div className="flex flex-col gap-2">
                  {pageArticles.map((article) => (
                    <a
                      key={article.id}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block bg-white dark:bg-[#071a30] border border-gray-100 dark:border-[#0e2444] rounded-xl px-5 py-4 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wide">
                          {article.source}
                        </span>
                        <span className="text-gray-300 dark:text-gray-700 text-[10px]">·</span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                          {timeAgo(article.pubDate)}
                        </span>
                      </div>
                      <div className="text-[14px] font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug mb-1">
                        {article.title}
                      </div>
                      {article.description && (
                        <div className="text-[12px] text-gray-500 dark:text-gray-500 leading-relaxed line-clamp-2">
                          {article.description}
                        </div>
                      )}
                    </a>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-1 flex-wrap">
                    <button
                      onClick={() => goToPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg text-[13px] font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Previous page"
                    >
                      ‹
                    </button>

                    {buildPageNums().map((n, i) =>
                      n === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-gray-400 dark:text-gray-600 text-[13px]">
                          …
                        </span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => goToPage(n)}
                          className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-colors ${
                            n === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                          }`}
                        >
                          {n}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => goToPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg text-[13px] font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Next page"
                    >
                      ›
                    </button>
                  </div>
                )}

                <div className="mt-4 text-center text-[11px] text-gray-400 dark:text-gray-600">
                  {allArticles.length} articles · page {page} of {totalPages}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
