export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // AI/LLM crawlers — explicitly allowed for AI SEO
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'Amazonbot', allow: '/' },
      { userAgent: 'Bytespider', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },
      { userAgent: 'FacebookBot', allow: '/' },
      { userAgent: 'Omgilibot', allow: '/' },
      { userAgent: 'YouBot', allow: '/' },
    ],
    sitemap: 'https://www.coinsflow.net/sitemap.xml',
  };
}
