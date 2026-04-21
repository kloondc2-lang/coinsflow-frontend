import ArticleClient from './ArticleClient';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.coinsflow.net';

// Server-side metadata fetch — gracefully falls back if unreachable
async function getPostMeta(slug) {
  try {
    const res = await fetch(`${API}/blog/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const post = await getPostMeta(params.slug);
  if (!post) return { title: 'Article | CoinsFlow' };
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

// Content is rendered client-side so the fetch always goes through the browser
export default function ArticlePage({ params }) {
  return <ArticleClient slug={params.slug} />;
}