'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

// ── Password strength rules ───────────────────────────────────────────────────
const RULES = [
  { id: 'len',     label: 'At least 8 characters',      test: (p) => p.length >= 8 },
  { id: 'upper',   label: '1 uppercase letter',          test: (p) => /[A-Z]/.test(p) },
  { id: 'number',  label: '1 number',                    test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: '1 special character (!@#$…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];
function validatePassword(p) { return RULES.map((r) => ({ ...r, pass: r.test(p) })); }

function IconGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function AuthClient() {
  const [mode, setMode]           = useState('login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]         = useState('');
  const [message, setMessage]     = useState('');
  const [pwRules, setPwRules]     = useState(validatePassword(''));
  const [showPwHints, setShowPwHints] = useState(false);
  const router = useRouter();

  useEffect(() => { setPwRules(validatePassword(password)); }, [password]);
  const pwAllPass = pwRules.every((r) => r.pass);

  // ── Rate limit helpers ──────────────────────────────────────────────────
  async function checkRateLimit() {
    try {
      const res = await fetch('/api/auth/rate-limit', { method: 'POST' });
      return await res.json();
    } catch { return { blocked: false }; }
  }
  async function recordFailedAttempt() {
    try { await fetch('/api/auth/rate-limit', { method: 'PUT' }); } catch { /* ignore */ }
  }
  async function clearRateLimit() {
    try { await fetch('/api/auth/rate-limit', { method: 'DELETE' }); } catch { /* ignore */ }
  }

  // ── Email/password submit ───────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!supabase) { setError('Auth not configured.'); return; }
    if (mode === 'signup' && !pwAllPass) {
      setError('Please meet all password requirements.');
      setShowPwHints(true);
      return;
    }
    if (mode === 'login') {
      const rl = await checkRateLimit();
      if (rl.blocked) { setError(rl.message); return; }
    }
    setLoading(true); setError(''); setMessage('');
    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/apis/dashboard` },
        });
        if (err) throw err;
        setMessage('Account created! Check your email to confirm, then sign in.');
        setMode('login');
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) { await recordFailedAttempt(); throw err; }
        await clearRateLimit();
        router.push('/apis/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  // ── Google OAuth ────────────────────────────────────────────────────────
  async function handleGoogle() {
    if (!supabase) { setError('Auth not configured.'); return; }
    setGoogleLoading(true); setError('');
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/apis/dashboard`,
          queryParams: { access_type: 'offline', prompt: 'select_account' },
        },
      });
      if (err) throw err;
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#020d1c] flex items-center justify-center px-4 py-16">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full bg-blue-600/8 blur-[120px]" />

      <div className="relative w-full max-w-[400px]">
        {/* Logo / back link */}
        <div className="mb-8 text-center">
          <Link href="/apis" className="inline-flex items-center gap-1.5 text-[13px] text-[#4a5568] hover:text-[#94a3b8] transition-colors mb-6">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to API
          </Link>
          <h1 className="text-[26px] font-bold text-white tracking-tight">
            {mode === 'login' ? 'Sign in to CoinsFlow' : 'Create your account'}
          </h1>
          <p className="text-[14px] text-[#4a5568] mt-1.5">
            {mode === 'login' ? 'Access your API dashboard.' : 'Free tier. No credit card required.'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0a1628] p-8">
          {/* Toggle */}
          <div className="flex p-1 rounded-lg bg-[#040c1a] border border-white/[0.05] mb-6">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setMessage(''); setShowPwHints(false); }}
                className={`flex-1 py-2 rounded-md text-[13px] font-semibold transition-all duration-200 ${mode === m ? 'bg-[#0a1628] text-[#e2e8f0] shadow-sm' : 'text-[#4a5568] hover:text-[#94a3b8]'}`}
              >
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 mb-5 rounded-lg border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-[14px] text-[#e2e8f0] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <IconGoogle />}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-[#334155] font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Success message */}
          {message && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[13px] text-emerald-400 leading-relaxed">
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#64748b] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.08] bg-[#040c1a] text-[14px] text-[#e2e8f0] placeholder-[#334155] outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15 transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#64748b] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => mode === 'signup' && setShowPwHints(true)}
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder={mode === 'signup' ? 'Min 8 chars, uppercase, number, special' : '••••••••'}
                className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.08] bg-[#040c1a] text-[14px] text-[#e2e8f0] placeholder-[#334155] outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15 transition-all"
              />
              {/* Password strength hints (signup only) */}
              {mode === 'signup' && showPwHints && (
                <ul className="mt-2 space-y-1">
                  {pwRules.map((r) => (
                    <li key={r.id} className={`flex items-center gap-1.5 text-[11.5px] transition-colors ${r.pass ? 'text-emerald-400' : 'text-[#4a5568]'}`}>
                      <span className="flex-shrink-0">
                        {r.pass
                          ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/></svg>
                        }
                      </span>
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[13px] text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password || (mode === 'signup' && !pwAllPass)}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-semibold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
              ) : (
                mode === 'login' ? 'Sign in' : 'Create account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-[#334155] mt-5">
          By continuing you agree to our{' '}
          <Link href="/about" className="text-[#4a5568] hover:text-[#94a3b8] underline underline-offset-2">terms</Link>.
        </p>
      </div>
    </div>
  );
}
