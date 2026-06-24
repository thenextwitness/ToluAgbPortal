'use client';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement | string, opts: { sitekey: string; callback?: (token: string) => void; 'error-callback'?: () => void; 'expired-callback'?: () => void; theme?: 'light' | 'dark' | 'auto' }) => string;
      reset: (id?: string) => void; remove: (id: string) => void;
    };
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const SCRIPT_ID  = 'cf-turnstile-loader';
let scriptLoadPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (typeof window !== 'undefined' && window.turnstile) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    if (document.getElementById(SCRIPT_ID)) {
      const start = Date.now();
      const tick = () => { if (window.turnstile) return resolve(); if (Date.now() - start > 5000) return reject(new Error('Timeout')); setTimeout(tick, 50); };
      tick(); return;
    }
    const s = Object.assign(document.createElement('script'), { id: SCRIPT_ID, src: SCRIPT_SRC, async: true, defer: true });
    s.onload  = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Turnstile'));
    document.head.appendChild(s);
  });
  return scriptLoadPromise;
}

export default function TurnstileWidget({ onToken, theme = 'auto' }: { onToken: (t: string | null) => void; theme?: 'light' | 'dark' | 'auto' }) {
  const hostRef    = useRef<HTMLDivElement>(null);
  const widgetRef  = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Public Turnstile site key. Falls back to the shared key if the build-time
  // env var isn't set (it's public — embedded in the client bundle either way).
  const siteKey    = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '0x4AAAAAADTsDOk5hRFb0z_l';

  useEffect(() => {
    if (!siteKey) { setError('Turnstile not configured'); return; }
    let cancelled = false;
    loadTurnstile().then(() => {
      if (cancelled || !hostRef.current || !window.turnstile) return;
      widgetRef.current = window.turnstile.render(hostRef.current, {
        sitekey: siteKey, theme,
        callback: (t) => onToken(t),
        'error-callback': () => { setError('Verification error. Please refresh.'); onToken(null); },
        'expired-callback': () => onToken(null),
      });
    }).catch((e: Error) => { if (!cancelled) setError(e.message); });
    return () => {
      cancelled = true;
      if (widgetRef.current && window.turnstile) { try { window.turnstile.remove(widgetRef.current); } catch {} }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p className="text-xs text-red-600">{error}</p>;
  return <div ref={hostRef} />;
}
