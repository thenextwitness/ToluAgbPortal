'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  isFacilitatorAuthenticated,
  getFacilitator,
  clearFacilitator,
} from '@/lib/auth';

export default function FacilitatorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/facilitator/login';

  const [ready, setReady] = useState(false);
  const [facilitatorName, setFacilitatorName] = useState('');
  const [certLevel, setCertLevel] = useState(0);

  useEffect(() => {
    if (isLoginPage) {
      setReady(true);
      return;
    }
    if (!isFacilitatorAuthenticated()) {
      router.replace('/facilitator/login');
      return;
    }
    const f = getFacilitator();
    if (f) {
      setFacilitatorName(f.name);
      setCertLevel(f.certificationLevel);
    }
    setReady(true);
  }, [isLoginPage, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
        <div className="text-black text-sm">Loading...</div>
      </div>
    );
  }

  if (isLoginPage) return <>{children}</>;

  function handleSignOut() {
    clearFacilitator();
    router.replace('/facilitator/login');
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Top Nav */}
      <nav className="bg-black text-white px-6 py-4 flex items-center justify-between">
        <Link href="/facilitator/dashboard" className="font-display text-lg font-semibold tracking-tight text-white">
          Tolu Agb <span className="text-[#C9A84C] text-xs uppercase tracking-widest font-label ml-1">Facilitator</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/70 hidden sm:inline">{facilitatorName}</span>
          {certLevel > 0 && (
            <span className="bg-[#C9A84C] text-black text-xs font-bold px-2 py-0.5 rounded-full">
              Level {certLevel}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="text-sm text-white/70 hover:text-white transition-colors border border-white/30 px-3 py-1.5"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main>{children}</main>
    </div>
  );
}
