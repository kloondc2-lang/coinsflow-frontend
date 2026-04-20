'use client';

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.coinsflow.net';

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ─── Auth gate ────────────────────────────────────────────────────────────────
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/chat/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.error || 'Login failed');
      sessionStorage.setItem('cf_admin_token', data.token);
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#060e1a] px-4">
      <div className="w-full max-w-sm bg-white dark:bg-[#071a30] border border-gray-100 dark:border-[#0e2444] rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">Admin Login</div>
          <div className="text-[13px] text-gray-400 mt-1">CoinsFlow Blog CMS</div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#0e2444] bg-gray-50 dark:bg-[#060e1a] text-gray-900 dark:text-white text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#0e2444] bg-gray-50 dark:bg-[#060e1a] text-gray-900 dark:text-white text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <div className="text-red-400 text-[13px] text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl text-[14px] transition-colors"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────
const EMPTY_FORM = { title: '', slug: '', excerpt: '', content: '', author: 'CoinsFlow Team', tags: '', published: false };

function Editor({ token, onSave, initialData, onCancel }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!initialData;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleTitleChange = (v) => {
    set('title', v);
    if (!isEdit) set('slug', slugify(v));
  };

  const submit = async (published) => {
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      published,
    };
    try {
      const url = isEdit ? `${API}/blog/${initialData.slug}` : `${API}/blog`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#0e2444] bg-gray-50 dark:bg-[#060e1a] text-gray-900 dark:text-white text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400';

  return (
    <div className="bg-white dark:bg-[#071a30] border border-gray-100 dark:border-[#0e2444] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">{isEdit ? 'Edit Article' : 'New Article'}</h2>
        {onCancel && (
          <button onClick={onCancel} className="text-[13px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">Cancel</button>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Title</label>
          <input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Article title…" className={inputCls} />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Slug (URL)</label>
          <input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="my-article-slug" className={inputCls} />
          {form.slug && <div className="mt-1 text-[11px] text-gray-400">coinsflow.net/news/<strong>{form.slug}</strong></div>}
        </div>
        <div>
          <label className="block text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Excerpt (shown in list)</label>
          <textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={2} placeholder="Short description…" className={inputCls + ' resize-none'} />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Content (Markdown)</label>
          <textarea value={form.content} onChange={(e) => set('content', e.target.value)} rows={18} placeholder={'## Heading\n\nWrite your article here in **Markdown**...'} className={inputCls + ' resize-y font-mono text-[13px]'} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Author</label>
            <input value={form.author} onChange={(e) => set('author', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Tags (comma-separated)</label>
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="bitcoin, defi, news" className={inputCls} />
          </div>
        </div>
        {error && <div className="text-red-400 text-[13px]">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button onClick={() => submit(false)} disabled={saving || !form.title || !form.slug}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-[#0e2444] text-[13px] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 transition-colors">
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button onClick={() => submit(true)} disabled={saving || !form.title || !form.slug}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-[13px] font-bold text-white disabled:opacity-40 transition-colors">
            {saving ? 'Publishing…' : 'Publish Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main CMS ─────────────────────────────────────────────────────────────────
function CMS({ token, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'new' | 'edit'
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/blog/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleSave = () => { setView('list'); setEditing(null); loadPosts(); };

  const togglePublish = async (post) => {
    await fetch(`${API}/blog/${post.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ published: !post.published }),
    });
    loadPosts();
  };

  const deletePost = async (slug) => {
    setDeleting(slug);
    try {
      await fetch(`${API}/blog/${slug}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      loadPosts();
    } finally {
      setDeleting(null);
    }
  };

  if (view === 'new') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        <Editor token={token} onSave={handleSave} onCancel={() => setView('list')} />
      </div>
    );
  }

  if (view === 'edit' && editing) {
    const editData = { ...editing, tags: (editing.tags || []).join(', ') };
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        <Editor token={token} onSave={handleSave} initialData={editData} onCancel={() => { setView('list'); setEditing(null); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060e1a]">
      {/* Header */}
      <div className="bg-white dark:bg-[#020d1c] border-b border-gray-100 dark:border-[#0e2444]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
          <div>
            <div className="text-xl font-extrabold text-gray-900 dark:text-white">Blog CMS</div>
            <div className="text-[12px] text-gray-400 mt-0.5">{posts.length} articles</div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setView('new')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold rounded-xl transition-colors"
            >
              + New Article
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 border border-gray-200 dark:border-[#0e2444] text-gray-600 dark:text-gray-400 text-[13px] font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-100 dark:border-[#0e2444] rounded-xl p-5 animate-pulse h-20 bg-white dark:bg-[#071a30]" />
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-24">
            <div className="text-4xl mb-4">✍️</div>
            <div className="text-gray-400 text-sm mb-4">No articles yet.</div>
            <button onClick={() => setView('new')} className="px-4 py-2 bg-blue-600 text-white text-[13px] font-bold rounded-xl hover:bg-blue-700 transition-colors">
              Write your first article
            </button>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="flex flex-col gap-2">
            {posts.map((post) => (
              <div key={post.slug} className="bg-white dark:bg-[#071a30] border border-gray-100 dark:border-[#0e2444] rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-bold text-gray-900 dark:text-gray-100 truncate">{post.title}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${post.published ? 'bg-green-50 dark:bg-green-950/30 text-green-600' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-[11px] text-gray-400">/news/{post.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePublish(post)}
                    className="px-3 py-1.5 text-[12px] font-bold rounded-lg border border-gray-200 dark:border-[#0e2444] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    {post.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => { setEditing(post); setView('edit'); }}
                    className="px-3 py-1.5 text-[12px] font-bold rounded-lg border border-gray-200 dark:border-[#0e2444] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete "${post.title}"?`)) deletePost(post.slug); }}
                    disabled={deleting === post.slug}
                    className="px-3 py-1.5 text-[12px] font-bold rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-40 transition-colors"
                  >
                    {deleting === post.slug ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminWritePage() {
  const [token, setToken] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('cf_admin_token');
    if (stored) setToken(stored);
    setChecked(true);
  }, []);

  const handleLogin = (t) => setToken(t);
  const handleLogout = () => { sessionStorage.removeItem('cf_admin_token'); setToken(null); };

  if (!checked) return null;
  if (!token) return <LoginForm onLogin={handleLogin} />;
  return <CMS token={token} onLogout={handleLogout} />;
}
