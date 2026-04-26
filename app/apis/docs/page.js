import Link from 'next/link';
import CodeTabs from './CodeTabs';
import DocsSidebar from './DocsSidebar';

export const metadata = {
  title: 'CoinsFlow API Docs — Reference',
  description: 'Complete reference for the CoinsFlow Blockchain API. Endpoints, authentication, multi-language examples, and error codes.',
  other: {
    'ai-description': 'CoinsFlow REST API for Litecoin blockchain data and payment gateway workflows. Base URL: https://api.coinsflow.net. Auth via X-API-Key header. JSON responses. Endpoints: address lookup, transactions, blocks, live price, invoice creation, balance, payout.',
  },
};

// ── Shared components ─────────────────────────────────────────────────────────
function Method({ m }) {
  return (
    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      {m}
    </span>
  );
}

function CodeBlock({ lang = 'bash', children }) {
  return (
    <div className="rounded-lg border border-white/[0.06] overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-[#071423] border-b border-white/[0.06]">
        <span className="text-[10px] font-mono text-[#334155] uppercase tracking-wider">{lang}</span>
      </div>
      <pre className="px-5 py-4 bg-[#040c1a] text-[12.5px] font-mono text-[#94a3b8] leading-relaxed overflow-x-auto whitespace-pre">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function EndpointSection({ id, method, path, title, desc, params, requestExamples, responseExample }) {
  return (
    <section id={id} className="pt-16 border-t border-white/[0.06]">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <Method m={method} />
        <code className="text-[14px] font-mono text-[#e2e8f0]">{path}</code>
      </div>
      <h2 className="text-[22px] font-bold text-white mb-2">{title}</h2>
      <p className="text-[14.5px] text-[#64748b] leading-relaxed mb-6 max-w-[600px]">{desc}</p>

      {params && params.length > 0 && (
        <div className="mb-6">
          <h4 className="text-[12px] font-semibold text-[#334155] uppercase tracking-widest mb-3">Parameters</h4>
          <div className="rounded-lg border border-white/[0.06] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#071423]">
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-[#4a5568] uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-[#4a5568] uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-[#4a5568] uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] bg-[#040c1a]">
                {params.map((p) => (
                  <tr key={p.name}>
                    <td className="px-4 py-3 align-top">
                      <code className="text-[12.5px] font-mono text-blue-400">{p.name}</code>
                      {p.required && (
                        <span className="ml-1.5 text-[9px] font-bold uppercase text-red-400/70 tracking-wider">req</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="text-[11px] font-mono text-[#334155] bg-white/[0.04] px-1.5 py-0.5 rounded">{p.type}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#64748b]">{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h4 className="text-[12px] font-semibold text-[#334155] uppercase tracking-widest mb-1">Request</h4>
      <CodeTabs examples={requestExamples} />

      <h4 className="text-[12px] font-semibold text-[#334155] uppercase tracking-widest mb-1 mt-4">Response</h4>
      <CodeBlock lang="json">{responseExample}</CodeBlock>
    </section>
  );
}

// ── Multi-language examples ───────────────────────────────────────────────────
const EXAMPLES = {
  address: {
    curl: `curl https://api.coinsflow.net/v1/address/ltc/LXqvJaXc9xC8UjFEDRTDjzD8bNHzMpBMQJ \\
  -H "X-API-Key: cf_live_your_key_here"`,
    python: `import requests

url = "https://api.coinsflow.net/v1/address/ltc/LXqvJaXc9xC8UjFEDRTDjzD8bNHzMpBMQJ"
headers = {"X-API-Key": "cf_live_your_key_here"}

response = requests.get(url, headers=headers)
data = response.json()

print(f"Balance: {data['balance']} LTC")
print(f"Transactions: {data['tx_count']}")`,
    node: `const address = "LXqvJaXc9xC8UjFEDRTDjzD8bNHzMpBMQJ";

const response = await fetch(
  \`https://api.coinsflow.net/v1/address/ltc/\${address}\`,
  { headers: { "X-API-Key": "cf_live_your_key_here" } }
);

const data = await response.json();
console.log(\`Balance: \${data.balance} LTC\`);
console.log(\`Transactions: \${data.tx_count}\`);`,
  },
  tx: {
    curl: `curl https://api.coinsflow.net/v1/tx/ltc/a3f9c12b4e7d8291f6e05b3a7d4c9182 \\
  -H "X-API-Key: cf_live_your_key_here"`,
    python: `import requests

txid = "a3f9c12b4e7d8291f6e05b3a7d4c9182"
url = f"https://api.coinsflow.net/v1/tx/ltc/{txid}"
headers = {"X-API-Key": "cf_live_your_key_here"}

response = requests.get(url, headers=headers)
data = response.json()

print(f"Confirmations: {data['confirmations']}")
print(f"Fee: {data['fee']} LTC")`,
    node: `const txid = "a3f9c12b4e7d8291f6e05b3a7d4c9182";

const response = await fetch(
  \`https://api.coinsflow.net/v1/tx/ltc/\${txid}\`,
  { headers: { "X-API-Key": "cf_live_your_key_here" } }
);

const data = await response.json();
console.log(\`Confirmations: \${data.confirmations}\`);
console.log(\`Fee: \${data.fee} LTC\`);`,
  },
  block: {
    curl: `curl https://api.coinsflow.net/v1/block/ltc/2831047 \\
  -H "X-API-Key: cf_live_your_key_here"`,
    python: `import requests

block = "2831047"  # height or hash
url = f"https://api.coinsflow.net/v1/block/ltc/{block}"
headers = {"X-API-Key": "cf_live_your_key_here"}

response = requests.get(url, headers=headers)
data = response.json()

print(f"Hash: {data['hash']}")
print(f"Transactions: {data['tx_count']}")`,
    node: `const block = "2831047"; // height or hash

const response = await fetch(
  \`https://api.coinsflow.net/v1/block/ltc/\${block}\`,
  { headers: { "X-API-Key": "cf_live_your_key_here" } }
);

const data = await response.json();
console.log(\`Hash: \${data.hash}\`);
console.log(\`Transactions: \${data.tx_count}\`);`,
  },
  blocks: {
    curl: `curl https://api.coinsflow.net/v1/blocks/ltc \\
  -H "X-API-Key: cf_live_your_key_here"`,
    python: `import requests

url = "https://api.coinsflow.net/v1/blocks/ltc"
headers = {"X-API-Key": "cf_live_your_key_here"}

response = requests.get(url, headers=headers)
blocks = response.json()["blocks"]

for block in blocks:
    print(f"Height {block['height']}: {block['tx_count']} txs")`,
    node: `const response = await fetch(
  "https://api.coinsflow.net/v1/blocks/ltc",
  { headers: { "X-API-Key": "cf_live_your_key_here" } }
);

const { blocks } = await response.json();
blocks.forEach((b) => {
  console.log(\`Height \${b.height}: \${b.tx_count} txs\`);
});`,
  },
  invoiceCreate: {
    curl: `curl -X POST https://api.coinsflow.net/invoices/create \\
  -H "X-API-Key: cf_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"amount_ltc":0.01,"expires_in_minutes":60,"description":"Order #1234"}'`,
    python: `import requests

url = "https://api.coinsflow.net/invoices/create"
headers = {
    "X-API-Key": "cf_live_your_key_here",
    "Content-Type": "application/json",
}
payload = {
    "amount_ltc": 0.01,
    "expires_in_minutes": 60,
    "description": "Order #1234",
}

res = requests.post(url, json=payload, headers=headers)
data = res.json()

print(f"Invoice ID: {data['invoice_id']}")
print(f"Pay to: {data['ltc_address']}")
print(f"Invoice URL: {data['invoice_url']}")`,
    node: `const res = await fetch("https://api.coinsflow.net/invoices/create", {
  method: "POST",
  headers: {
    "X-API-Key": "cf_live_your_key_here",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount_ltc: 0.01,
    expires_in_minutes: 60,
    description: "Order #1234",
  }),
});

const data = await res.json();
console.log(\`Invoice ID: \${data.invoice_id}\`);
console.log(\`Pay to: \${data.ltc_address}\`);
console.log(\`Invoice URL: \${data.invoice_url}\`);`,
  },
  balance: {
    curl: `curl https://api.coinsflow.net/balance \\
  -H "X-API-Key: cf_live_your_key_here"`,
    python: `import requests

url = "https://api.coinsflow.net/balance"
headers = {"X-API-Key": "cf_live_your_key_here"}

res = requests.get(url, headers=headers)
data = res.json()

print(f"Balance: {data['balance_ltc']} LTC")
print(f"USD value: \${data['balance_usd']:.2f}")`,
    node: `const res = await fetch("https://api.coinsflow.net/balance", {
  headers: { "X-API-Key": "cf_live_your_key_here" },
});

const data = await res.json();
console.log(\`Balance: \${data.balance_ltc} LTC\`);
console.log(\`USD value: $\${data.balance_usd.toFixed(2)}\`);`,
  },
  payout: {
    curl: `curl -X POST https://api.coinsflow.net/payout \\
  -H "X-API-Key: cf_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"to_address":"LXqvJaXc9xC8UjFEDRTDjzD8bNHzMpBMQJ","amount_ltc":0.005}'`,
    python: `import requests

url = "https://api.coinsflow.net/payout"
headers = {
    "X-API-Key": "cf_live_your_key_here",
    "Content-Type": "application/json",
}
payload = {
    "to_address": "LXqvJaXc9xC8UjFEDRTDjzD8bNHzMpBMQJ",
    "amount_ltc": 0.005,
}

res = requests.post(url, json=payload, headers=headers)
data = res.json()

print(f"TX Hash: {data['tx_hash']}")`,
    node: `const res = await fetch("https://api.coinsflow.net/payout", {
  method: "POST",
  headers: {
    "X-API-Key": "cf_live_your_key_here",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    to_address: "LXqvJaXc9xC8UjFEDRTDjzD8bNHzMpBMQJ",
    amount_ltc: 0.005,
  }),
});

const data = await res.json();
console.log(\`TX Hash: \${data.tx_hash}\`);`,
  },
  price: {
    curl: `curl https://api.coinsflow.net/v1/price/ltc \\
  -H "X-API-Key: cf_live_your_key_here"`,
    python: `import requests

url = "https://api.coinsflow.net/v1/price/ltc"
headers = {"X-API-Key": "cf_live_your_key_here"}

response = requests.get(url, headers=headers)
data = response.json()

print(f"LTC price: \${data['price_usd']}")
print(f"24h change: {data['change_24h']}%")`,
    node: `const response = await fetch(
  "https://api.coinsflow.net/v1/price/ltc",
  { headers: { "X-API-Key": "cf_live_your_key_here" } }
);

const data = await response.json();
console.log(\`LTC price: $\${data.price_usd}\`);
console.log(\`24h change: \${data.change_24h}%\`);`,
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DocsPage() {
  return (
    <div className="min-h-[100dvh] bg-[#020d1c] text-[#e2e8f0]">
      <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row">

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <DocsSidebar />

        {/* ── Content ──────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 md:px-12 lg:px-10 xl:px-16 py-12">

          {/* Header */}
          <div className="mb-2 flex items-center gap-3">
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest">API Reference</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25 uppercase tracking-wider">Beta</span>
          </div>
          <h1 className="text-[38px] md:text-[46px] font-extrabold text-white tracking-tight leading-tight mb-4">
            CoinsFlow API
          </h1>
          <p className="text-[16px] text-[#64748b] leading-relaxed max-w-[600px] mb-2">
            REST API for querying Litecoin blockchain data. Returns JSON. No SDK required.
          </p>
          <div className="flex flex-wrap gap-2 mt-4 mb-12">
            {['REST', 'JSON', 'API Key Auth', 'Litecoin', 'Payments', 'Free'].map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/[0.04] border border-white/[0.08] text-[#4a5568]">{t}</span>
            ))}
          </div>

          {/* ── For AI Agents ─────────────────────────────────────────── */}
          <details className="mb-8 rounded-lg border border-blue-500/20 bg-blue-500/5 overflow-hidden" data-section="ai-agents">
            <summary className="px-4 py-3 text-[13px] font-semibold text-blue-400 cursor-pointer select-none flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
              For AI Agents &amp; LLM Integrations
            </summary>
            <div className="px-4 pb-4 pt-1 text-[13px] text-[#64748b] leading-relaxed space-y-2">
              <p><strong className="text-[#94a3b8]">Base URL:</strong> <code className="text-blue-400 font-mono bg-white/[0.04] px-1 rounded">https://api.coinsflow.net</code></p>
              <p><strong className="text-[#94a3b8]">Auth:</strong> Header <code className="text-blue-400 font-mono bg-white/[0.04] px-1 rounded">X-API-Key: cf_live_...</code> — get a key at <code className="text-blue-400 font-mono bg-white/[0.04] px-1 rounded">https://coinsflow.net/apis/dashboard</code></p>
              <p><strong className="text-[#94a3b8]">Rate limits:</strong> Unlimited (beta). Returns <code className="text-blue-400 font-mono bg-white/[0.04] px-1 rounded">429</code> if exceeded.</p>
              <p><strong className="text-[#94a3b8]">Endpoints:</strong> GET /v1/address/ltc/{'{address}'} · GET /v1/tx/ltc/{'{txid}'} · GET /v1/block/ltc/{'{hash}'} · GET /v1/blocks/ltc · GET /v1/price/ltc · POST /invoices/create · GET /balance · POST /payout</p>
              <p><strong className="text-[#94a3b8]">Machine-readable spec:</strong> <a href="/openapi.json" className="text-blue-400 hover:underline">/openapi.json</a> (OpenAPI 3.1) · <a href="/llms.txt" className="text-blue-400 hover:underline">/llms.txt</a></p>
            </div>
          </details>

          {/* ── Getting Started ───────────────────────────────────────── */}
          <section id="getting-started" className="border-t border-white/[0.06] pt-12">
            <h2 className="text-[22px] font-bold text-white mb-3">Getting Started</h2>
            <p className="text-[14.5px] text-[#64748b] leading-relaxed mb-4">
              The CoinsFlow API gives you programmatic access to Litecoin blockchain data including addresses, transactions, blocks, and live price. All responses are JSON.
            </p>
            <ol className="space-y-3 text-[14px] text-[#64748b] mb-6">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-bold flex items-center justify-center">1</span>
                <span><Link href="/apis/dashboard" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">Create a free account</Link> and generate your API key from the dashboard.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-bold flex items-center justify-center">2</span>
                <span>Include your key in the <code className="text-blue-400 font-mono text-[13px] bg-white/[0.04] px-1 rounded">X-API-Key</code> request header.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-bold flex items-center justify-center">3</span>
                <span>Make a request to any endpoint. All responses are JSON with consistent error shapes.</span>
              </li>
            </ol>
            <CodeTabs examples={EXAMPLES.price} />
          </section>

          {/* ── Authentication ────────────────────────────────────────── */}
          <section id="authentication" className="pt-12 border-t border-white/[0.06] mt-12">
            <h2 className="text-[22px] font-bold text-white mb-3">Authentication</h2>
            <p className="text-[14.5px] text-[#64748b] leading-relaxed mb-4">
              Every request must include your API key in the <code className="text-blue-400 font-mono text-[13px] bg-white/[0.04] px-1 rounded">X-API-Key</code> HTTP header. Keys begin with the prefix <code className="text-blue-400 font-mono text-[13px] bg-white/[0.04] px-1 rounded">cf_live_</code>.
            </p>
            <CodeBlock lang="bash">{`# Pass your key in the request header
curl https://api.coinsflow.net/v1/address/ltc/LXqvJaXc9xC8... \
  -H "X-API-Key: cf_live_a1b2c3d4e5f6..."`}</CodeBlock>
            <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-[13px] text-[#94a3b8] leading-relaxed">
              <span className="font-semibold text-yellow-400">Security note:</span> Never expose your API key in client-side code, public repositories, or frontend JavaScript. Always make API calls from a server or backend environment.
            </div>
          </section>

          {/* ── Base URL ──────────────────────────────────────────────── */}
          <section id="base-url" className="pt-12 border-t border-white/[0.06] mt-12">
            <h2 className="text-[22px] font-bold text-white mb-3">Base URL</h2>
            <p className="text-[14.5px] text-[#64748b] mb-4">All endpoints are served from:</p>
            <CodeBlock lang="text">{`https://api.coinsflow.net`}</CodeBlock>
            <p className="text-[14px] text-[#64748b]">All API responses include a <code className="text-blue-400 font-mono text-[13px] bg-white/[0.04] px-1 rounded">Content-Type: application/json</code> header.</p>
          </section>

          {/* ── Rate Limits ───────────────────────────────────────────── */}
          <section id="rate-limits" className="pt-12 border-t border-white/[0.06] mt-12">
            <h2 className="text-[22px] font-bold text-white mb-3">Rate Limits</h2>
            <div className="flex items-start gap-3 mb-5 p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0 animate-pulse" />
              <p className="text-[13.5px] text-[#94a3b8] leading-relaxed">
                <span className="font-semibold text-blue-400">Beta access:</span> Unlimited requests while the platform is in beta. Fair-use policy applies — avoid excessive automated scraping.
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] overflow-hidden mb-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#071423]">
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-[#4a5568] uppercase tracking-wider">Plan</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-[#4a5568] uppercase tracking-wider">Requests / Day</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-[#4a5568] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] bg-[#040c1a]">
                  <tr>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-[#64748b]">Free</span>
                      <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25 uppercase tracking-wider">Beta</span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-emerald-400 font-mono font-semibold">Unlimited</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-[12px] text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[13.5px] text-[#64748b]">
              When a rate limit is exceeded, the API returns <code className="text-blue-400 font-mono text-[13px] bg-white/[0.04] px-1 rounded">429 Too Many Requests</code>.
            </p>
          </section>

          {/* ── Errors ────────────────────────────────────────────────── */}
          <section id="errors" className="pt-12 border-t border-white/[0.06] mt-12">
            <h2 className="text-[22px] font-bold text-white mb-3">Error Codes</h2>
            <p className="text-[14.5px] text-[#64748b] mb-4">
              All errors return a JSON body with an <code className="text-blue-400 font-mono text-[13px] bg-white/[0.04] px-1 rounded">error</code> field describing what went wrong.
            </p>
            <CodeBlock lang="json">{`{
  "error": "Invalid or missing API key"
}`}</CodeBlock>
            <div className="rounded-lg border border-white/[0.06] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#071423]">
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-[#4a5568] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-[#4a5568] uppercase tracking-wider">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] bg-[#040c1a]">
                  {[
                    ['200', 'OK — request succeeded'],
                    ['400', 'Bad Request — invalid parameters'],
                    ['401', 'Unauthorized — missing or invalid API key'],
                    ['404', 'Not Found — resource does not exist on chain'],
                    ['429', 'Too Many Requests — rate limit exceeded'],
                    ['500', 'Internal Server Error — contact support'],
                  ].map(([code, meaning]) => (
                    <tr key={code}>
                      <td className="px-4 py-3">
                        <code className={`text-[12.5px] font-mono font-bold ${code.startsWith('2') ? 'text-emerald-400' : code.startsWith('4') ? 'text-yellow-400' : 'text-red-400'}`}>{code}</code>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748b]">{meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Endpoint: Address ─────────────────────────────────────── */}
          <EndpointSection
            id="endpoint-address"
            method="GET"
            path="/v1/address/ltc/{address}"
            title="Address Lookup"
            desc="Returns balance, transaction count, total received, and total sent for any Litecoin address."
            params={[
              { name: 'address', type: 'string',  required: true,  desc: 'A valid Litecoin address (L/M/ltc1 format).' },
              { name: 'page',     type: 'integer', required: false, desc: 'Page number for transaction history. Default: 1.' },
              { name: 'limit',    type: 'integer', required: false, desc: 'Transactions per page (max 50). Default: 25.' },
            ]}
            requestExamples={EXAMPLES.address}
            responseExample={`{
  "address": "LXqvJaXc9xC8UjFEDRTDjzD8bNHzMpBMQJ",
  "balance": 4.72819341,
  "total_received": 48.00000000,
  "total_sent": 43.27180659,
  "tx_count": 217,
  "chain": "litecoin",
  "transactions": [
    {
      "txid": "a3f9c12b...",
      "amount": 1.50000000,
      "confirmations": 4812,
      "timestamp": 1714003201
    }
  ]
}`}
          />

          {/* ── Endpoint: Transaction ─────────────────────────────────── */}
          <EndpointSection
            id="endpoint-tx"
            method="GET"
            path="/v1/tx/ltc/{txid}"
            title="Transaction Detail"
            desc="Returns full transaction detail including inputs, outputs, fees, block height, and confirmation count."
            params={[
              { name: 'txid', type: 'string', required: true, desc: 'The 64-character hexadecimal transaction ID.' },
            ]}
            requestExamples={EXAMPLES.tx}
            responseExample={`{
  "txid": "a3f9c12b4e7d...",
  "block_height": 2831047,
  "confirmations": 4812,
  "fee": 0.00004200,
  "size": 226,
  "timestamp": 1714003201,
  "inputs": [
    { "address": "LXqvJaXc9x...", "value": 2.00000000 }
  ],
  "outputs": [
    { "address": "LRk7fBWt3q...", "value": 1.50000000 },
    { "address": "LXqvJaXc9x...", "value": 0.49995800 }
  ]
}`}
          />

          {/* ── Endpoint: Block ───────────────────────────────────────── */}
          <EndpointSection
            id="endpoint-block"
            method="GET"
            path="/v1/block/ltc/{hash}"
            title="Block Detail"
            desc="Returns block header data, transaction IDs, miner coinbase, and difficulty for a given block hash or height."
            params={[
              { name: 'hash', type: 'string', required: true, desc: 'Block hash (64-char hex) or block height (integer).' },
            ]}
            requestExamples={EXAMPLES.block}
            responseExample={`{
  "hash": "0000000000000...",
  "height": 2831047,
  "timestamp": 1714003201,
  "tx_count": 83,
  "size": 48291,
  "difficulty": 18273648.394,
  "miner": "LPool",
  "transactions": ["a3f9c12b...", "7b2d4f1a..."]
}`}
          />

          {/* ── Endpoint: Latest Blocks ───────────────────────────────── */}
          <EndpointSection
            id="endpoint-blocks"
            method="GET"
            path="/v1/blocks/ltc"
            title="Latest Blocks"
            desc="Returns the 10 most recently confirmed blocks on the Litecoin chain."
            params={[]}
            requestExamples={EXAMPLES.blocks}
            responseExample={`{
  "blocks": [
    {
      "hash": "0000000000000...",
      "height": 2831047,
      "timestamp": 1714003201,
      "tx_count": 83,
      "size": 48291
    }
  ]
}`}
          />

          {/* ── Endpoint: Price ───────────────────────────────────────── */}
          <EndpointSection
            id="endpoint-price"
            method="GET"
            path="/v1/price/ltc"
            title="Live Price"
            desc="Returns the current LTC/USD price with 24-hour percentage change. Cached for up to 60 seconds."
            params={[]}
            requestExamples={EXAMPLES.price}
            responseExample={`{
  "coin": "litecoin",
  "symbol": "LTC",
  "price_usd": 87.43,
  "change_24h": -2.14,
  "updated_at": 1714003260
}`}
          />

          {/* ── Payments Section Header ─────────────────────── */}
          <section id="payments" className="pt-16 border-t border-white/[0.06] mt-16">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Payment Gateway</span>
            </div>
            <h2 className="text-[22px] font-bold text-white mb-3">Payment Gateway</h2>
            <p className="text-[14.5px] text-[#64748b] leading-relaxed max-w-[600px]">
              Accept Litecoin payments directly into your balance. Create invoices, track payment status in real time, and withdraw to any LTC address.
            </p>
          </section>

          {/* ── Endpoint: Create Invoice ──────────────────────────── */}
          <EndpointSection
            id="endpoint-invoice-create"
            method="POST"
            path="/invoices/create"
            title="Create Invoice"
            desc="Generate a new Litecoin payment invoice with a unique deposit address. The invoice automatically tracks incoming payments and updates status to confirmed once received."
            params={[
              { name: 'amount_ltc',          type: 'number',  required: true,  desc: 'Amount in LTC to request. Must be greater than 0.' },
              { name: 'expires_in_minutes',  type: 'integer', required: false, desc: 'Minutes until invoice expires. Default: 60.' },
              { name: 'description',         type: 'string',  required: false, desc: 'Optional description shown on the hosted invoice page.' },
              { name: 'tolerance_percent',   type: 'number',  required: false, desc: 'Underpayment tolerance %. Default: 2.' },
            ]}
            requestExamples={EXAMPLES.invoiceCreate}
            responseExample={`{
  "invoice_id": "1cd4fbb8-9468-4685-b03e-ae22975e771e",
  "ltc_address": "LSngLEpvKjCiKkggXrtEJrrddWgiDhHxLB",
  "amount_ltc": 0.01,
  "tolerance_percent": 2,
  "status": "pending",
  "expires_at": "2024-04-26T17:50:52.82+00:00",
  "created_at": "2024-04-26T16:50:52.95+00:00",
  "invoice_url": "https://www.coinsflow.net/invoice/1cd4fbb8-..."
}`}
          />

          {/* ── Endpoint: Balance ─────────────────────────────────── */}
          <EndpointSection
            id="endpoint-balance"
            method="GET"
            path="/balance"
            title="Get Balance"
            desc="Returns your current confirmed LTC balance and its USD equivalent. Balance is credited automatically when invoices reach confirmed status."
            params={[]}
            requestExamples={EXAMPLES.balance}
            responseExample={`{
  "balance_ltc": 0.05241800,
  "balance_usd": 4.58,
  "updated_at": "2024-04-26T18:03:14+00:00"
}`}
          />

          {/* ── Endpoint: Payout ──────────────────────────────────── */}
          <EndpointSection
            id="endpoint-payout"
            method="POST"
            path="/payout"
            title="Send Payout"
            desc="Withdraw LTC from your balance to any Litecoin address. The amount is deducted from your balance and broadcast to the network."
            params={[
              { name: 'to_address',  type: 'string', required: true, desc: 'Destination Litecoin address (L/M/ltc1 format).' },
              { name: 'amount_ltc', type: 'number', required: true, desc: 'Amount in LTC to send. Must not exceed your balance.' },
            ]}
            requestExamples={EXAMPLES.payout}
            responseExample={`{
  "payout_id": "a7f3c9e2-1b4d-4c8a-9d2f-3e7b1a5f8c4d",
  "tx_hash": "4a2d9f1e3c8b7a6d...",
  "to_address": "LXqvJaXc9xC8UjFEDRTDjzD8bNHzMpBMQJ",
  "amount_ltc": 0.005,
  "status": "sent"
}`}
          />

          {/* Footer spacer */}
          <div className="pt-24 pb-8 border-t border-white/[0.06] mt-16">
            <p className="text-[13px] text-[#334155]">
              Missing something?{' '}
              <a href="mailto:support@coinsflow.net" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                Contact support
              </a>
              {' '}or visit{' '}
              <Link href="/apis/dashboard" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                your dashboard
              </Link>
              .
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
