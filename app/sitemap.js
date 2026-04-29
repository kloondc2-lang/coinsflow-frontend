import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function sitemap() {
  const base = 'https://www.coinsflow.net';

  const staticRoutes = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/explorer/litecoin`, lastModified: new Date(), changeFrequency: 'always', priority: 0.9 },
    { url: `${base}/apis`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/apis/dashboard`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/apis/docs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/apis/auth`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ];

  let newsRoutes = [];
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (posts) {
        newsRoutes = posts.map((post) => ({
          url: `${base}/news/${post.slug}`,
          lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
      }
    } catch {
      // Silently fall back to static routes only
    }
  }

  return [...staticRoutes, ...newsRoutes];
}
