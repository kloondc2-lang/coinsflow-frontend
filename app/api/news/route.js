export const revalidate = 300; // cache 5 minutes

const SOURCES = [
  { id: 'cointelegraph', name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', category: 'crypto' },
  { id: 'coindesk',      name: 'CoinDesk',      url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'crypto' },
  { id: 'bitcoinist',    name: 'Bitcoinist',    url: 'https://bitcoinist.com/feed/', category: 'crypto' },
  { id: 'beincrypto',    name: 'BeInCrypto',    url: 'https://beincrypto.com/feed/', category: 'crypto' },
  { id: 'ambcrypto',     name: 'AMBCrypto',     url: 'https://ambcrypto.com/feed/', category: 'crypto' },
  { id: 'blockworks',    name: 'Blockworks',    url: 'https://blockworks.co/feed', category: 'crypto' },
];

// Minimal XML text extractor — avoids any npm dependency
function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
  const m = xml.match(re);
  return m ? m[1].trim() : '';
}

function extractAllItems(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRe.exec(xml)) !== null) {
    items.push(match[1]);
  }
  return items;
}

function stripHtml(str) {
  return str.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&#8230;/g, '…').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '').trim();
}

async function fetchSource(source) {
  try {
    const res = await fetch(source.url, {
      headers: { 'User-Agent': 'CoinsFlow/1.0 RSS Reader' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return extractAllItems(xml).slice(0, 30).map((item, i) => {
      const title = stripHtml(extractTag(item, 'title'));
      const link = extractTag(item, 'link').trim() || extractTag(item, 'guid');
      const pubDate = extractTag(item, 'pubDate');
      const description = stripHtml(extractTag(item, 'description')).slice(0, 200);
      if (!title || !link) return null;
      return {
        id: `${source.id}-${i}-${Date.now()}`,
        title,
        link,
        description,
        pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: source.name,
        sourceId: source.id,
        category: source.category,
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sourceFilter = searchParams.get('source') || '';

  const sourcesToFetch = sourceFilter
    ? SOURCES.filter((s) => s.id === sourceFilter)
    : SOURCES;

  const results = await Promise.allSettled(sourcesToFetch.map(fetchSource));
  const articles = results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return Response.json(
    { articles, sources: SOURCES.map(({ id, name }) => ({ id, name })) },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } },
  );
}
