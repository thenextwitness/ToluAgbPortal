'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/',         label: 'Home'     },
  { href: '/coaching', label: 'Coaching' },
  { href: '/blog',     label: 'Blog'     },
  { href: '/books',    label: 'Books'    },
  { href: '/contact',  label: 'Contact'  },
];

interface Props {
  /** Optional override for the CTA button */
  cta?: { label: string; href: string };
  /** Dark variant — white text on black background */
  dark?: boolean;
}

export default function SiteNav({ cta, dark = false }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const defaultCta = { label: 'Book a Session', href: '/coaching/diagnostic' };
  const ctaBtn = cta ?? defaultCta;

  const base     = dark ? 'bg-black text-white border-b border-white/10' : 'bg-white text-black border-b border-black/8';
  const linkBase = dark ? 'text-white/70 hover:text-white' : 'text-black/60 hover:text-black';
  const linkActive = dark ? 'text-white font-semibold' : 'text-black font-semibold';

  return (
    <header className={`${base} sticky top-0 z-30`}>
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-8">

        {/* Wordmark */}
        <Link href="/" className={`font-display text-xl font-semibold tracking-wide flex-shrink-0 ${dark ? 'text-white' : 'text-black'}`}>
          Tolu Agb
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                  ? linkActive
                  : linkBase
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-4">
          <Link href={ctaBtn.href} className="hidden sm:inline-flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-2 text-sm font-semibold hover:bg-[#9E7F2E] transition-colors">
            {ctaBtn.label}
          </Link>
          <button
            className={`md:hidden p-1.5 ${dark ? 'text-white' : 'text-black'}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              {menuOpen
                ? <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                : <path fillRule="evenodd" clipRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={`md:hidden border-t ${dark ? 'border-white/10 bg-black' : 'border-black/8 bg-white'} px-6 py-4 flex flex-col gap-4`}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium py-1 ${
                pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                  ? (dark ? 'text-white' : 'text-black')
                  : linkBase
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link href={ctaBtn.href} onClick={() => setMenuOpen(false)} className="btn-gold w-full justify-center mt-2">
            {ctaBtn.label}
          </Link>
        </div>
      )}
    </header>
  );
}
