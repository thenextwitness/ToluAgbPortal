'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isParticipantAuthenticated, getParticipant, clearParticipant } from '@/lib/auth';

export default function ParticipantPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/portal/login';

  const [ready, setReady] = useState(false);
  const [participantName, setParticipantName] = useState('');

  useEffect(() => {
    if (isLoginPage) { setReady(true); return; }
    if (!isParticipantAuthenticated()) { router.replace('/portal/login'); return; }
    const p = getParticipant();
    if (p) setParticipantName(p.fullName);
    setReady(true);
  }, [isLoginPage, router]);

  if (!ready) {
    return <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center"><div className="text-black text-sm">Loading…</div></div>;
  }

  if (isLoginPage) return <>{children}</>;

  function handleSignOut() { clearParticipant(); router.replace('/portal/login'); }

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      <nav className="bg-black text-white px-6 py-4 flex items-center justify-between">
        <Link href="/portal/dashboard" className="font-display text-lg font-semibold tracking-tight text-white">
          Tolu Agb <span className="text-[#C9A84C] text-xs uppercase tracking-widest font-label ml-1">Portal</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/70 hidden sm:inline">{participantName}</span>
          <button onClick={handleSignOut} className="text-sm text-white/70 hover:text-white transition-colors border border-white/30 px-3 py-1.5">Sign out</button>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
