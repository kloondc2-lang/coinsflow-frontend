'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.coinsflow.net';

// ── Helpers ─────────────────────────────────────────────────────────────────
function getUserId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem('cf_chat_uid');
  if (!id) {
    id = 'u_' + crypto.randomUUID();
    localStorage.setItem('cf_chat_uid', id);
  }
  return id;
}

function fmtTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return isToday ? time : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════════════════════════════════════════════════
function AdminPanel({ onLogout }) {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const token = useRef(typeof window !== 'undefined' ? sessionStorage.getItem('cf_admin_token') : null);
  const bottomRef = useRef(null);

  const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token.current}`,
  });

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/chat/admin/conversations`, { headers: headers() });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [onLogout]);

  const loadMessages = useCallback(async (userId) => {
    try {
      const res = await fetch(`${API}/chat/admin/conversations/${userId}`, { headers: headers() });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  }, [onLogout]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (selected) loadMessages(selected);
  }, [selected, loadMessages]);

  // Real-time: listen for new messages across all users
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('admin-all-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const msg = payload.new;
        if (selected && msg.user_id === selected) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
        // Refresh conversation list
        loadConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selected, loadConversations]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    const msg = reply.trim();
    setReply('');
    try {
      const res = await fetch(`${API}/chat/admin/reply`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ user_id: selected, message: msg }),
      });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      if (data.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    } catch { /* ignore */ }
  };

  const totalUnread = conversations.filter((c) => c.unread).length;
  const totalPages = Math.ceil(conversations.length / PAGE_SIZE);
  const pageConvs = conversations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!selected) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-purple-600">
          <span className="text-white font-bold text-[13px] flex items-center gap-1.5">
            Admin — Conversations
            {totalUnread > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{totalUnread}</span>
            )}
          </span>
          <button onClick={onLogout} className="text-white/70 hover:text-white text-[11px]">Logout</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400 text-[13px]">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-[13px]">No conversations yet</div>
          ) : pageConvs.map((c) => (
            <button
              key={c.user_id}
              onClick={() => setSelected(c.user_id)}
              className={`w-full text-left px-3 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                c.unread ? 'border-l-[3px] border-l-blue-500 bg-blue-50/40 dark:bg-blue-900/10' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[11px] truncate max-w-[140px] ${c.unread ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-blue-500'}`}>{c.user_id}</span>
                <div className="flex items-center gap-1.5">
                  {c.unread ? <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" /> : null}
                  <span className="text-[10px] text-gray-400">{c.count} msgs</span>
                </div>
              </div>
              <div className="text-[12px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {c.last_sender === 'admin' && <span className="text-purple-500">You: </span>}
                {c.last_message}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">{fmtTime(c.last_at)}</div>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 dark:border-gray-700">
          {totalPages > 1 ? (
            <div className="flex items-center gap-2 text-[11px]">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 disabled:opacity-40 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >← Prev</button>
              <span className="text-gray-400">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 disabled:opacity-40 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >Next →</button>
            </div>
          ) : (
            <span className="text-[11px] text-gray-400">{conversations.length} convo{conversations.length !== 1 ? 's' : ''}</span>
          )}
          <button onClick={loadConversations} className="text-[12px] text-blue-500 hover:text-blue-600">↻ Refresh</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-purple-600">
        <button onClick={() => { setSelected(null); setMessages([]); }} className="text-white/80 hover:text-white">←</button>
        <span className="text-white font-bold text-[12px] truncate flex-1">{selected}</span>
        <button onClick={onLogout} className="text-white/70 hover:text-white text-[11px]">Logout</button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] ${
              m.sender === 'admin'
                ? 'bg-purple-600 text-white rounded-br-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
            }`}>
              <div className="break-words">{m.message}</div>
              <div className={`text-[10px] mt-1 ${m.sender === 'admin' ? 'text-purple-200' : 'text-gray-400'}`}>
                {fmtTime(m.created_at)}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200 dark:border-gray-700">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
          placeholder="Reply..."
          className="flex-1 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-[13px] outline-none border border-gray-200 dark:border-gray-700 focus:border-purple-500"
        />
        <button onClick={sendReply} disabled={!reply.trim()} className="px-3 py-2 rounded-full bg-purple-600 text-white text-[13px] font-bold disabled:opacity-40 hover:bg-purple-700 transition-colors">
          Send
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN LOGIN FORM
// ══════════════════════════════════════════════════════════════════════════════
function AdminLogin({ onLogin, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
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
      if (!res.ok) throw new Error(data.error || 'Login failed');
      sessionStorage.setItem('cf_admin_token', data.token);
      onLogin();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="text-[14px] font-bold text-gray-800 dark:text-gray-200 mb-4">Admin Login</div>
      <form onSubmit={submit} className="w-full space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-[13px] outline-none border border-gray-200 dark:border-gray-700 focus:border-blue-500"
          autoFocus
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-[13px] outline-none border border-gray-200 dark:border-gray-700 focus:border-blue-500"
        />
        {error && <div className="text-[12px] text-red-500">{error}</div>}
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full py-2 rounded-lg bg-purple-600 text-white font-bold text-[13px] disabled:opacity-40 hover:bg-purple-700 transition-colors"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <button type="button" onClick={onCancel} className="w-full text-[12px] text-gray-400 hover:text-gray-600">
          Cancel
        </button>
      </form>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN CHAT WIDGET
// ══════════════════════════════════════════════════════════════════════════════
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);

  // Admin state
  const [adminClicks, setAdminClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const bottomRef = useRef(null);
  const userId = useRef(null);
  const clickTimer = useRef(null);

  // Initialize user ID
  useEffect(() => {
    userId.current = getUserId();
    // Check if admin token exists
    if (sessionStorage.getItem('cf_admin_token')) {
      setIsAdmin(true);
    }
  }, []);

  // Load message history on open
  useEffect(() => {
    if (!open || isAdmin || !userId.current) return;
    (async () => {
      try {
        const res = await fetch(`${API}/chat/messages?user_id=${encodeURIComponent(userId.current)}`);
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
      } catch { /* ignore */ }
    })();
  }, [open, isAdmin]);

  // Real-time subscription for user messages
  useEffect(() => {
    if (!supabase || !userId.current || isAdmin) return;
    const channel = supabase
      .channel(`chat-user-${userId.current}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `user_id=eq.${userId.current}`,
      }, (payload) => {
        const msg = payload.new;
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        // Count unread admin messages when chat is closed
        if (!open && msg.sender === 'admin') {
          setUnread((n) => n + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, open]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput('');
    setSending(true);
    try {
      const res = await fetch(`${API}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId.current, message: msg }),
      });
      const data = await res.json();
      if (data.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    } catch { /* ignore */ }
    setSending(false);
  };

  // Hidden admin trigger: 5 rapid clicks on the header
  const handleHeaderClick = () => {
    setAdminClicks((n) => n + 1);
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setAdminClicks(0), 2000);
  };

  useEffect(() => {
    if (adminClicks >= 5) {
      setAdminClicks(0);
      setShowAdminLogin(true);
    }
  }, [adminClicks]);

  const handleToggle = () => {
    setOpen(!open);
    if (!open) setUnread(0);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('cf_admin_token');
    setIsAdmin(false);
    setShowAdminLogin(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat panel */}
      {open && (
        <div className="mb-3 w-[340px] sm:w-[380px] h-[480px] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a1222] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Admin views */}
          {isAdmin ? (
            <AdminPanel onLogout={handleAdminLogout} />
          ) : showAdminLogin ? (
            <AdminLogin onLogin={() => { setIsAdmin(true); setShowAdminLogin(false); }} onCancel={() => setShowAdminLogin(false)} />
          ) : (
            <>
              {/* Header */}
              <div
                onClick={handleHeaderClick}
                className="flex items-center gap-3 px-4 py-3 bg-blue-600 cursor-default select-none"
              >
                <img src="/logo.png" alt="CoinsFlow" className="w-8 h-8 rounded-full object-contain" />
                <div className="flex-1">
                  <div className="text-white font-bold text-[14px]">CoinsFlow Support</div>
                  <div className="text-blue-200 text-[11px]">We typically reply within a few hours</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setOpen(false); }} className="text-white/70 hover:text-white text-[18px]">
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 text-[13px] py-8">
                    <div className="text-[24px] mb-2">👋</div>
                    <div>Hi! How can we help you?</div>
                    <div className="text-[11px] mt-1">Send us a message and we&apos;ll get back to you.</div>
                  </div>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                    }`}>
                      <div className="break-words">{m.message}</div>
                      <div className={`text-[10px] mt-1 ${m.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {fmtTime(m.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  maxLength={2000}
                  className="flex-1 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-[13px] outline-none border border-gray-200 dark:border-gray-700 focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={handleToggle}
        className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center relative"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  );
}
