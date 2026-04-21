'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.coinsflow.net';
const PAGE_SIZE = 15;

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-gray-100 dark:border-[#0e2444] rounded-2xl p-5 animate-pulse">
          <div className="h-3 w-20 bg-gray-200 dark:bg-[#0e2444] rounded mb-3" />
          <div className="h-5 w-2/3 bg-gray-200 dark:bg-[#0e2444] rounded mb-2" />
          <div className="h-3 w-full bg-gray-100 dark:bg-[#071a30] rounded mb-1" />
          <div className="h-3 w-3/4 bg-gray-100 dark:bg-[#071a30] rounded" />
        </div>
      ))}
    </div>
  );
}

export default function NewsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`${API}/blog`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPosts(data); })
      .catch(() => setError('Could not load articles.'))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  const visible = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goTo = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060e1a]">
      {/* Header */}
      <div className="bg-white dark:bg-[#020d1c] border-b border-gray-100 dark:border-[#0e2444]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Crypto News &amp; Blog
          </h1>
          <p className="mt-2 text-[14px] text-gray-500 dark:text-gray-400">
            Insights, analysis, and updates from the CoinsFlow team.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        {loading && <Skeleton />}

        {!loading && error && (
          <div className="text-center py-20 text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📰</div>
            <div className="text-gray-400 text-sm">No articles published yet. Check back soon.</div>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <>
            <div className="flex flex-col gap-3">
              {visible.map((post) => (
                <Link
                  key={post.slug}
                  href={`/news/${post.slug}`}
                  className="group block bg-white dark:bg-[#071a30] border border-gray-100 dark:border-[#0e2444] rounded-2xl px-6 py-5 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {post.tags?.length > 0 && (
                      <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wide bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                        {post.tags[0]}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {timeAgo(post.created_at)}
                    </span>
                  </div>
                  <h2 className="text-[16px] font-extrabold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug mb-1.5">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-[13px] text-gray-500 dark:text-gray-500 leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-3 text-[12px] font-bold text-blue-500 dark:text-blue-400 group-hover:underline">
                    Read more &rarr;
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1.5 flex-wrap">
                <button
                  onClick={() => goTo(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-[13px] font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  &lsaquo; Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => goTo(n)}
                    className={`w-9 h-9 rounded-lg text-[13px] font-bold transition-colors ${
                      n === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => goTo(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-[13px] font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next &rsaquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

