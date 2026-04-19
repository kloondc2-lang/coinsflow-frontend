'use client';

import { useState, useEffect, useRef } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const STORAGE_KEY = 'cf_ts_verified';

export default function TurnstileGate({ children }) {
  const [verified, setVerified] = useState(true); // Start true to avoid flash
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    // If no site key configured, skip gate entirely
    if (!SITE_KEY) return;
    // Check sessionStorage — once verified per tab session, don't re-challenge
    if (sessionStorage.getItem(STORAGE_KEY) === '1') return;
    // Show the gate
    setVerified(false);
  }, []);

  useEffect(() => {
    if (verified || !SITE_KEY) return;
    if (!containerRef.current) return;

    const renderWidget = () => {
      if (!containerRef.current || widgetIdRef.current != null) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: handleToken,
        'expired-callback': () => { widgetIdRef.current = null; setError('Challenge expired, please try again.'); },
        'error-callback': () => { widgetIdRef.current = null; setError('Verification error, please refresh.'); },
        theme: 'dark',
        size: 'normal',
      });
    };

    if (typeof window !== 'undefined' && window.turnstile) {
      renderWidget();
    } else {
      const timer = setInterval(() => {
        if (window.turnstile) { clearInterval(timer); renderWidget(); }
      }, 50);
      return () => clearInterval(timer);
    }

    return () => {
      if (widgetIdRef.current != null) {
        try { window.turnstile?.remove(widgetIdRef.current); } catch { /* ignore */ }
        widgetIdRef.current = null;
      }
    };
  }, [verified]);

  const handleToken = async (token) => {
    setError('');
    try {
      const res = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem(STORAGE_KEY, '1');
        setVerified(true);
      } else {
        setError('Verification failed. Please try again.');
        // Reset widget for retry
        widgetIdRef.current = null;
        if (containerRef.current) containerRef.current.innerHTML = '';
        setTimeout(() => {
          if (window.turnstile && containerRef.current) {
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
              sitekey: SITE_KEY,
              callback: handleToken,
              'expired-callback': () => { widgetIdRef.current = null; },
              'error-callback': () => { widgetIdRef.current = null; },
              theme: 'dark',
              size: 'normal',
            });
          }
        }, 300);
      }
    } catch {
      setError('Network error. Please refresh and try again.');
    }
  };

  if (verified) return <>{children}</>;

  return (
    <>
      {/* Gate overlay — covers everything */}
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020d1c]">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src="/logo.png" alt="CoinsFlow" className="h-12 w-auto" />
          <div className="text-white text-xl font-bold tracking-tight">CoinsFlow</div>
          <div className="text-gray-400 text-sm">Verifying you&apos;re human before entering&hellip;</div>
        </div>

        {/* Turnstile widget */}
        <div ref={containerRef} className="mb-4" />

        {error && (
          <div className="mt-3 text-red-400 text-sm text-center max-w-xs">{error}</div>
        )}
      </div>
      {/* Keep children mounted in background (but hidden) so next.js doesn't throw on hydration */}
      <div style={{ visibility: 'hidden', pointerEvents: 'none', position: 'fixed', inset: 0, overflow: 'hidden' }} aria-hidden>
        {children}
      </div>
    </>
  );
}
