'use client';
export const runtime = 'edge';

import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

const PILLARS = [
  {
    n: '01',
    title: 'Coaching & Programmes',
    body: 'Structured, evidence-based development programmes for individuals, teams, and organisations. Each one addresses a specific behavioural gap and produces a measurable outcome.',
    href: '/coaching',
    cta: 'Explore coaching',
  },
  {
    n: '02',
    title: 'Books',
    body: 'Writing on character, leadership, identity, and the inner architecture that determines what a person becomes. Practical, rooted, and honest.',
    href: '/books',
    cta: 'Browse the books',
  },
  {
    n: '03',
    title: 'Writing & Ideas',
    body: 'Essays and reflections on formation, purpose, and the work of becoming. New thinking, published regularly.',
    href: '/blog',
    cta: 'Read the blog',
  },
];

const APPROACH = [
  { title: 'Diagnose the root', body: 'Most problems people try to fix are symptoms. We start by identifying the actual root condition — the thing underneath the behaviour.' },
  { title: 'Address it directly', body: 'A structured programme built around the specific gap. Not generic advice — a targeted intervention with a clear arc.' },
  { title: 'Produce real change', body: 'Outcomes you can observe and measure. Formation is not information transfer — it is the re-patterning of a person.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="bg-black text-white px-6 md:px-10 py-24 md:py-36">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-6">Tolu Agb</p>
          <h1 className="hero-title text-white max-w-4xl mb-8">
            Developing the people who<br />transform organisations.
          </h1>
          <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-2xl mb-12">
            Coaching, structured development programmes, and writing — built on the
            conviction that real change begins with the inner architecture of a person,
            not their circumstances.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/coaching/diagnostic" className="btn-gold">
              Take the Needs Assessment →
            </Link>
            <Link href="/coaching" className="btn-outline border-white text-white hover:bg-white hover:text-black">
              How coaching works
            </Link>
          </div>
        </div>
      </section>

      {/* ── Three pillars ──────────────────────────────────── */}
      <section className="bg-white px-6 md:px-10 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map(p => (
              <Link key={p.n} href={p.href} className="group card flex flex-col hover:border-[#C9A84C]">
                <p className="font-display text-4xl font-light text-[#C9A84C] mb-5">{p.n}</p>
                <h3 className="font-display text-2xl font-semibold text-black mb-3">{p.title}</h3>
                <p className="text-sm text-black/70 leading-relaxed mb-6 flex-1">{p.body}</p>
                <span className="text-sm font-semibold text-black group-hover:text-[#C9A84C] transition-colors">
                  {p.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Approach ───────────────────────────────────────── */}
      <section className="bg-[#FAF6EF] px-6 md:px-10 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-4">The Approach</p>
          <h2 className="section-title mb-16 max-w-2xl">
            Three moves that make change actually hold.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {APPROACH.map((a, i) => (
              <div key={a.title}>
                <div className="border-t-2 border-black pt-5">
                  <p className="font-display text-2xl font-semibold text-black mb-3">{a.title}</p>
                  <p className="text-sm text-black/70 leading-relaxed">{a.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="bg-black text-white px-6 md:px-10 py-20 md:py-28 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="section-label mb-5">Start Here</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mb-6">
            Not sure where to begin?
          </h2>
          <p className="text-white/70 leading-relaxed mb-10">
            Take the 10-minute needs assessment. It identifies the primary gap and
            recommends the programme best suited to your situation — for you, your team,
            or your organisation.
          </p>
          <Link href="/coaching/diagnostic" className="btn-gold">
            Take the Needs Assessment →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
