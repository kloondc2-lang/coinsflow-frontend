'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function AuthClient() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!supabase) { setError('Auth not configured.'); return; }
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setMessage('Account created. Check your email to confirm, then sign in.');
        setMode('login');
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        router.push('/apis/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
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
                onClick={() => { setMode(m); setError(''); setMessage(''); }}
                className={`flex-1 py-2 rounded-md text-[13px] font-semibold transition-all duration-200 ${mode === m ? 'bg-[#0a1628] text-[#e2e8f0] shadow-sm' : 'text-[#4a5568] hover:text-[#94a3b8]'}`}
              >
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
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
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.08] bg-[#040c1a] text-[14px] text-[#e2e8f0] placeholder-[#334155] outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15 transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-[13px] text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-semibold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </>
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
