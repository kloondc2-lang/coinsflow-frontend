'use client';

import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.coinsflow.net';

function timeAgo(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
function inline(text) {
  const parts = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('**')) {
      parts.push(<strong key={m.index} className="font-bold">{t.slice(2, -2)}</strong>);
    } else if (t.startsWith('*')) {
      parts.push(<em key={m.index}>{t.slice(1, -1)}</em>);
    } else if (t.startsWith('`')) {
      parts.push(<code key={m.index} className="bg-gray-100 dark:bg-[#0a1628] px-1 py-0.5 rounded text-[13px] font-mono">{t.slice(1, -1)}</code>);
    } else if (t.startsWith('[')) {
      parts.push(<a key={m.index} href={m[3]} className="text-blue-600 dark:text-blue-400 underline hover:no-underline" target="_blank" rel="noopener noreferrer">{m[2]}</a>);
    }
    last = m.index + t.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderMarkdown(md) {
  if (!md) return null;
  const blocks = md.split(/\n\n+/);
  return blocks.map((block, i) => {
    if (block.startsWith('### '))
      return <h3 key={i} className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-7 mb-2">{inline(block.slice(4))}</h3>;
    if (block.startsWith('## '))
      return <h2 key={i} className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mt-8 mb-3">{inline(block.slice(3))}</h2>;
    if (block.startsWith('# '))
      return <h1 key={i} className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-8 mb-3">{inline(block.slice(2))}</h1>;
    if (block.startsWith('- ') || block.startsWith('* ')) {
      const items = block.split('\n').filter((l) => l.match(/^[-*] /));
      return (
        <ul key={i} className="list-disc list-inside my-4 space-y-1">
          {items.map((li, j) => <li key={j} className="text-[15px] text-gray-700 dark:text-gray-300">{inline(li.replace(/^[-*] /, ''))}</li>)}
        </ul>
      );
    }
    if (block.startsWith('> '))
      return (
        <blockquote key={i} className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400">
          {inline(block.replace(/^> /gm, ''))}
        </blockquote>
      );
    if (block.startsWith('```')) {
      const code = block.replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
      return (
        <pre key={i} className="bg-gray-100 dark:bg-[#0a1628] rounded-xl p-4 my-4 overflow-x-auto text-[13px] text-gray-800 dark:text-gray-200 font-mono">
          <code>{code}</code>
        </pre>
      );
    }
    return <p key={i} className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed my-4">{inline(block)}</p>;
  });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-32 bg-gray-200 dark:bg-[#0e2444] rounded mb-6" />
      <div className="h-8 w-3/4 bg-gray-200 dark:bg-[#0e2444] rounded mb-3" />
      <div className="h-8 w-1/2 bg-gray-200 dark:bg-[#0e2444] rounded mb-6" />
      <div className="h-3 w-40 bg-gray-100 dark:bg-[#071a30] rounded mb-10" />
      {[1, 2, 3, 4].map((i) => <div key={i} className="h-4 w-full bg-gray-100 dark:bg-[#071a30] rounded mb-2" />)}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ArticleClient({ slug }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${API}/blog/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then((data) => { if (data) setPost(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#060e1a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12"><Skeleton /></div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#060e1a]">
        <div className="text-center">
          <div className="text-5xl font-extrabold text-gray-200 dark:text-gray-800 mb-4">404</div>
          <div className="text-gray-500 dark:text-gray-400 mb-6">This article could not be found.</div>
          <a href="/news" className="text-[13px] font-bold text-blue-500 hover:underline">← Back to News</a>
        </div>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: { '@type': 'Organization', name: post.author || 'CoinsFlow Team' },
    publisher: { '@type': 'Organization', name: 'CoinsFlow', logo: { '@type': 'ImageObject', url: 'https://coinsflow.net/cflogo.png' } },
    url: `https://coinsflow.net/news/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060e1a]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[11px] font-bold text-blue-500 uppercase tracking-wide bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-4">
          {String(post.title ?? '').replace(/<[^>]*>/g, '')}
        </h1>

        <div className="flex items-center gap-3 text-[13px] text-gray-400 dark:text-gray-500 mb-8 pb-8 border-b border-gray-100 dark:border-[#0e2444]">
          <span>{post.author || 'CoinsFlow Team'}</span>
          <span>·</span>
          <time dateTime={post.created_at}>{timeAgo(post.created_at)}</time>
        </div>

        {post.excerpt && (
          <p className="text-[17px] text-gray-600 dark:text-gray-300 leading-relaxed font-medium mb-8 italic">
            {String(post.excerpt ?? '').replace(/<[^>]*>/g, '')}
          </p>
        )}

        <article
          className="article-body"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-[#0e2444]">
          <a href="/news" className="text-[13px] font-bold text-blue-500 dark:text-blue-400 hover:underline">
            ← Back to all articles
          </a>
        </div>
      </div>
    </div>
  );
}

