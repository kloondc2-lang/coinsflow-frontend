import { notFound } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.coinsflow.net';

async function getPost(slug) {
  try {
    const res = await fetch(`${API}/blog/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Article Not Found | CoinsFlow' };
  return {
    title: `${post.title} | CoinsFlow`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: `https://coinsflow.net/news/${post.slug}`,
      siteName: 'CoinsFlow',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: post.excerpt || post.title,
    },
  };
}

// Simple markdown-to-JSX renderer (no external deps)
function renderMarkdown(md) {
  if (!md) return null;
  const blocks = md.split(/\n\n+/);
  return blocks.map((block, i) => {
    // Headings
    if (block.startsWith('### ')) {
      return <h3 key={i} className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-7 mb-2">{inline(block.slice(4))}</h3>;
    }
    if (block.startsWith('## ')) {
      return <h2 key={i} className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mt-8 mb-3">{inline(block.slice(3))}</h2>;
    }
    if (block.startsWith('# ')) {
      return <h1 key={i} className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-8 mb-3">{inline(block.slice(2))}</h1>;
    }
    // Unordered list
    if (block.startsWith('- ') || block.startsWith('* ')) {
      const items = block.split('\n').filter((l) => l.match(/^[-*] /));
      return (
        <ul key={i} className="list-disc list-inside my-4 space-y-1">
          {items.map((li, j) => (
            <li key={j} className="text-[15px] text-gray-700 dark:text-gray-300">{inline(li.replace(/^[-*] /, ''))}</li>
          ))}
        </ul>
      );
    }
    // Blockquote
    if (block.startsWith('> ')) {
      const text = block.replace(/^> /gm, '');
      return (
        <blockquote key={i} className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400">
          {inline(text)}
        </blockquote>
      );
    }
    // Code block
    if (block.startsWith('```')) {
      const code = block.replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
      return (
        <pre key={i} className="bg-gray-100 dark:bg-[#0a1628] rounded-xl p-4 my-4 overflow-x-auto text-[13px] text-gray-800 dark:text-gray-200 font-mono">
          <code>{code}</code>
        </pre>
      );
    }
    // Paragraph
    return (
      <p key={i} className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed my-4">
        {inline(block)}
      </p>
    );
  });
}

function inline(text) {
  // Split on bold/italic/code/links and render inline
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

export default async function ArticlePage({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const publishedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
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
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[11px] font-bold text-blue-500 uppercase tracking-wide bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[13px] text-gray-400 dark:text-gray-500 mb-8 pb-8 border-b border-gray-100 dark:border-[#0e2444]">
          <span>{post.author || 'CoinsFlow Team'}</span>
          <span>·</span>
          <time dateTime={post.created_at}>{publishedDate}</time>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-[17px] text-gray-600 dark:text-gray-300 leading-relaxed font-medium mb-8 italic">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <article className="prose-none">
          {renderMarkdown(post.content)}
        </article>

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-[#0e2444]">
          <a href="/news" className="text-[13px] font-bold text-blue-500 dark:text-blue-400 hover:underline">
            ← Back to all articles
          </a>
        </div>
      </div>
    </div>
  );
}
