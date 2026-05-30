'use client';
export const runtime = 'edge';

import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

const PROCESS = [
  { n: '1', title: 'Needs Assessment', body: 'You complete a short, structured assessment. It reveals the primary developmental gap — the root condition beneath the presenting problem.' },
  { n: '2', title: 'Programme Confirmed', body: 'I review your assessment and confirm the recommended programme. You receive a link to book a 30-minute discovery call.' },
  { n: '3', title: 'Discovery Call', body: 'A focused conversation to confirm fit and agree the schedule. We align on dates and the people who will participate.' },
  { n: '4', title: 'Live Programme', body: 'Four live sessions over two weeks. OPEN, TEACH, REFLECT, SEND. Cohort-based, time-bound, experienced together.' },
  { n: '5', title: 'Transformation Report', body: 'The programme closes with before-and-after measures, behavioural change indicators, and a full report you can act on.' },
];

const TIERS = [
  { tier: '01', name: 'Introductory Session', duration: '90 minutes', desc: 'A single live session introducing the framework and naming the gap. Ideal for evaluating fit before committing to a full programme.' },
  { tier: '02', name: 'Core Programme', duration: '4 sessions · 2 weeks', desc: 'The standard engagement. Four live sessions following the full OPEN–TEACH–REFLECT–SEND arc, with assessment, practice assignments, and a transformation report.' },
  { tier: '03', name: 'Extended Integration', duration: '8–12 weeks', desc: 'For sustained change. The core programme followed by weekly integration sessions covering application, accountability, and consolidation.' },
];

export default function CoachingPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Hero */}
      <section className="bg-black text-white px-6 md:px-10 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-5">Coaching & Programmes</p>
          <h1 className="hero-title text-white max-w-3xl mb-8">
            Targeted development<br />that actually changes people.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl mb-12">
            Each programme addresses a specific, documented behavioural condition with a
            structured intervention. Not generic coaching — a precise developmental tool
            aimed at the root, not the symptom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/coaching/diagnostic" className="btn-gold">Take the Needs Assessment →</Link>
            <Link href="/coaching/programmes" className="btn-outline border-white text-white hover:bg-white hover:text-black">Browse the catalogue</Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-white px-6 md:px-10 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-4">How It Works</p>
          <h2 className="section-title mb-16 max-w-2xl">From first contact to measurable change.</h2>
          <div className="space-y-0">
            {PROCESS.map((p, i) => (
              <div key={p.n} className={`grid grid-cols-1 md:grid-cols-4 gap-6 py-8 ${i !== PROCESS.length - 1 ? 'border-b border-black/10' : ''}`}>
                <div className="md:col-span-1 flex items-baseline gap-4">
                  <span className="font-display text-3xl font-light text-[#C9A84C]">{p.n}</span>
                  <span className="font-display text-xl font-semibold text-black">{p.title}</span>
                </div>
                <p className="md:col-span-3 text-black/70 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-[#FAF6EF] px-6 md:px-10 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-4">Engagement Tiers</p>
          <h2 className="section-title mb-4 max-w-2xl">Three ways to work together.</h2>
          <p className="text-black/70 leading-relaxed max-w-2xl mb-12">
            Every tier is delivered live. Choose the depth that matches your situation and constraints.
          </p>
          <div className="space-y-4">
            {TIERS.map(t => (
              <div key={t.tier} className="bg-white border border-black/10 grid grid-cols-1 md:grid-cols-4">
                <div className="bg-black text-white p-7 flex flex-col justify-between">
                  <div>
                    <p className="section-label text-[#C9A84C] mb-2">Tier {t.tier}</p>
                    <p className="font-display text-xl font-semibold text-white leading-tight">{t.name}</p>
                  </div>
                  <p className="text-white/50 text-xs mt-4 eyebrow">{t.duration}</p>
                </div>
                <div className="md:col-span-3 p-7">
                  <p className="text-black/70 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white px-6 md:px-10 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="section-label mb-5">Next Step</p>
          <h2 className="font-display text-4xl font-semibold text-white mb-6">Begin with the assessment.</h2>
          <p className="text-white/70 leading-relaxed mb-10">
            Ten minutes. It identifies the root gap and recommends the right programme for your situation.
          </p>
          <Link href="/coaching/diagnostic" className="btn-gold">Take the Needs Assessment →</Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
