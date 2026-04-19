'use client';

import { useState, useEffect, useRef } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const STORAGE_KEY = 'cf_ts_verified';

export default function TurnstileGate({ children }) {
  const [verified, setVerified] = useState(true); // true = no flash on load
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const verifyingRef = useRef(false); // ref so widget callback always sees latest value

  useEffect(() => {
    if (!SITE_KEY) return;
    if (sessionStorage.getItem(STORAGE_KEY) === '1') return;
    setVerified(false);
  }, []);

  // Render widget once gate is visible
  useEffect(() => {
    if (verified || !SITE_KEY) return;

    const doRender = () => {
      if (!containerRef.current || widgetIdRef.current != null) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: handleToken,
        'expired-callback': () => {
          widgetIdRef.current = null;
          verifyingRef.current = false;
          setVerifying(false);
        },
        'error-callback': () => {
          widgetIdRef.current = null;
          verifyingRef.current = false;
          setVerifying(false);
          setError('Widget error — please refresh the page.');
        },
        theme: 'dark',
        size: 'normal',
      });
    };

    if (window.turnstile) {
      doRender();
    } else {
      const t = setInterval(() => {
        if (window.turnstile) { clearInterval(t); doRender(); }
      }, 50);
      return () => clearInterval(t);
    }

    return () => {
      if (widgetIdRef.current != null) {
        try { window.turnstile?.remove(widgetIdRef.current); } catch { /* ignore */ }
        widgetIdRef.current = null;
      }
    };
  }, [verified]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToken = async (token) => {
    // Prevent double-fire (Turnstile can call callback multiple times)
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setVerifying(true);
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
        return; // done — don't touch widget or state
      }

      // Server rejected — show error, let user click retry manually
      setError('Verification failed. Click "Try again" to retry.');
    } catch {
      setError('Network error. Please check your connection and retry.');
    }

    verifyingRef.current = false;
    setVerifying(false);
  };

  const handleRetry = () => {
    setError('');
    setVerifying(false);
    verifyingRef.current = false;
    // Remove old widget and re-render
    if (widgetIdRef.current != null) {
      try { window.turnstile?.remove(widgetIdRef.current); } catch { /* ignore */ }
      widgetIdRef.current = null;
    }
    if (containerRef.current) containerRef.current.innerHTML = '';
    if (window.turnstile && containerRef.current) {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: handleToken,
        'expired-callback': () => { widgetIdRef.current = null; verifyingRef.current = false; setVerifying(false); },
        'error-callback': () => { widgetIdRef.current = null; verifyingRef.current = false; setVerifying(false); },
        theme: 'dark',
        size: 'normal',
      });
    }
  };

  if (verified) return <>{children}</>;

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020d1c]">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src="/logo.png" alt="CoinsFlow" className="h-24 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
          <div className="text-gray-400 text-sm">
            {verifying ? 'Verifying\u2026' : 'Please verify you\u2019re human to continue'}
          </div>
        </div>

        {/* Turnstile widget — always mounted so the DOM node stays stable */}
        <div ref={containerRef} className="mb-4" />

        {verifying && !error && (
          <div className="mb-4 text-blue-400 text-sm">Checking…</div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 mt-2">
            <div className="text-red-400 text-sm text-center max-w-xs">{error}</div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>
      <div style={{ visibility: 'hidden', pointerEvents: 'none', position: 'fixed', inset: 0, overflow: 'hidden' }} aria-hidden>
        {children}
      </div>
    </>
  );
}
