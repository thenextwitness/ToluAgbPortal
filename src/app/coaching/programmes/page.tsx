'use client';
export const runtime = 'edge';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { coachingApi } from '@/lib/api';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

const DOMAIN_TABS = [
  { code: 'ALL',                     label: 'All Programmes'         },
  { code: 'CORPORATE',               label: 'Organisations'          },
  { code: 'REHABILITATION_RECOVERY', label: 'Recovery'               },
  { code: 'PREVENTIVE_FORMATION',    label: 'Youth & Community'      },
];

const DOMAIN_LABELS: Record<string, string> = {
  LEADERSHIP_INTEGRITY:    'Leadership Integrity',
  ORGANISATIONAL_CULTURE:  'Culture & Cohesion',
  PRODUCTIVITY_EXECUTION:  'Productivity & Execution',
  EMOTIONAL_RESILIENCE:    'Emotional Resilience',
  IDENTITY_SELF_CONCEPT:   'Identity & Self-Concept',
  CHARACTER_INTEGRITY:     'Character & Integrity',
  DECISION_MAKING:         'Decision-Making',
  STEWARDSHIP_RESOURCES:   'Stewardship & Resources',
  EQUITY_JUSTICE:          'Fairness & Accountability',
  PURPOSE_DIRECTION:       'Purpose & Direction',
  REHABILITATION_RECOVERY: 'Recovery & Restoration',
  PREVENTIVE_FORMATION:    'Youth Development',
};

const DOMAIN_GROUP: Record<string, string> = {
  LEADERSHIP_INTEGRITY: 'CORPORATE', ORGANISATIONAL_CULTURE: 'CORPORATE',
  PRODUCTIVITY_EXECUTION: 'CORPORATE', EMOTIONAL_RESILIENCE: 'CORPORATE',
  IDENTITY_SELF_CONCEPT: 'CORPORATE', CHARACTER_INTEGRITY: 'CORPORATE',
  DECISION_MAKING: 'CORPORATE', STEWARDSHIP_RESOURCES: 'CORPORATE',
  EQUITY_JUSTICE: 'CORPORATE', PURPOSE_DIRECTION: 'CORPORATE',
  REHABILITATION_RECOVERY: 'REHABILITATION', PREVENTIVE_FORMATION: 'PREVENTION',
};

const FRUIT_LABEL: Record<string, string> = {
  LOVE: 'Relational integrity and team cohesion',
  JOY: 'Purposeful engagement and intrinsic motivation',
  PEACE: 'Emotional stability and capacity under pressure',
  PATIENCE: 'Sustained commitment and long-term thinking',
  KINDNESS: 'Service orientation and empathy in practice',
  GOODNESS: 'Moral consistency and ethical conduct',
  FAITHFULNESS: 'Reliability and consistent follow-through',
  GENTLENESS: 'Measured authority and composed leadership',
  SELF_CONTROL: 'Disciplined execution and impulse governance',
};

function ProgrammeCard({ programme }: { programme: any }) {
  const fruits = programme.fruitOutcomes?.split(',').map((f: string) => f.trim()).filter(Boolean) ?? [];
  return (
    <Link href={`/coaching/programmes/${programme.signalCode}`} className="group flex bg-white border border-black/10 hover:border-black transition-all duration-200 hover:shadow-md">
      <div className="w-1 bg-[#C9A84C] flex-shrink-0 group-hover:w-1.5 transition-all duration-200" />
      <div className="flex flex-col p-7 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-5">
          <span className="section-label">{programme.signalCode}</span>
          <span className="eyebrow text-black/50 text-right leading-tight border border-black/15 px-2.5 py-1">
            {DOMAIN_LABELS[programme.primaryDomain] ?? programme.primaryDomain}
          </span>
        </div>
        <h3 className="font-display text-xl md:text-2xl font-semibold text-black leading-snug mb-2">{programme.worldTitle}</h3>
        {programme.worldSubtitle && <p className="text-sm italic text-black/60 mb-4">{programme.worldSubtitle}</p>}
        <p className="text-sm text-black/80 leading-relaxed mb-6 flex-1">{programme.problemHook}</p>
        {fruits.length > 0 && (
          <div className="border-t border-black/8 pt-5">
            <p className="section-label mb-3">Outcomes</p>
            <ul className="space-y-1.5">
              {fruits.slice(0, 3).map((f: string) => (
                <li key={f} className="flex items-start gap-2 text-xs text-black/80">
                  <span className="w-1 h-1 bg-[#C9A84C] rounded-full mt-1.5 flex-shrink-0" />
                  {FRUIT_LABEL[f] ?? f.replace(/_/g, ' ').toLowerCase()}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6 pt-5 border-t border-black/8 flex items-center justify-between">
          <span className="text-xs font-semibold text-black group-hover:text-[#C9A84C] transition-colors tracking-wide uppercase">View Programme</span>
          <span className="text-[#C9A84C] font-bold text-sm group-hover:translate-x-1 transition-transform inline-block">→</span>
        </div>
      </div>
    </Link>
  );
}

function DomainNavigator({ domains }: { domains: string[] }) {
  if (domains.length === 0) return null;
  return (
    <div className="bg-[#FAF6EF] border-b border-black/8 px-6 py-5">
      <div className="max-w-6xl mx-auto">
        <p className="section-label mb-3">Browse by Area</p>
        <div className="flex flex-wrap gap-2">
          {domains.map(d => (
            <a key={d} href={`#domain-${d}`} className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 border border-black/20 text-black hover:bg-black hover:text-white hover:border-black transition-all">
              {DOMAIN_LABELS[d] ?? d}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex border border-black/10 h-72 animate-pulse">
          <div className="w-1 bg-black/10 flex-shrink-0" />
          <div className="flex-1 p-7 space-y-4">
            <div className="flex justify-between"><div className="h-3 w-12 bg-black/10" /><div className="h-5 w-28 bg-black/10" /></div>
            <div className="h-6 w-3/4 bg-black/10" /><div className="h-4 w-full bg-black/10" /><div className="h-4 w-5/6 bg-black/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProgrammeBrowserPage() {
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [activeTab, setActiveTab]   = useState('ALL');
  const [search, setSearch]         = useState('');

  useEffect(() => {
    coachingApi.programmes.list()
      .then(data => { setProgrammes(data); setLoading(false); })
      .catch(() => { setError('Unable to load programmes. Please try again shortly.'); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let list = programmes;
    if (activeTab !== 'ALL') {
      if (activeTab === 'CORPORATE') list = list.filter(s => DOMAIN_GROUP[s.primaryDomain] === 'CORPORATE');
      else if (activeTab === 'REHABILITATION_RECOVERY') list = list.filter(s => s.deploymentSettings?.split(',').map((v: string) => v.trim()).includes('REHABILITATION'));
      else if (activeTab === 'PREVENTIVE_FORMATION') list = list.filter(s => { const ds = s.deploymentSettings?.split(',').map((v: string) => v.trim()) ?? []; return ds.includes('YOUTH') || ds.includes('COMMUNITY'); });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.worldTitle?.toLowerCase().includes(q) || s.problemHook?.toLowerCase().includes(q) || s.targetAudiences?.toLowerCase().includes(q) || (DOMAIN_LABELS[s.primaryDomain] ?? '').toLowerCase().includes(q));
    }
    return list;
  }, [programmes, activeTab, search]);

  const domainGroups = useMemo(() => {
    if (activeTab !== 'ALL' || search.trim()) return null;
    const groups: Record<string, any[]> = {};
    filtered.forEach(s => { const d = s.primaryDomain ?? 'OTHER'; if (!groups[d]) groups[d] = []; groups[d].push(s); });
    return groups;
  }, [filtered, activeTab, search]);

  const allDomains = useMemo(() => domainGroups ? Object.keys(domainGroups) : [], [domainGroups]);
  const totalCount = programmes.filter(s => s.isActive !== false).length;

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <section className="bg-black text-white px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <Link href="/coaching" className="eyebrow text-white/50 hover:text-white mb-10 inline-block">← Coaching</Link>
          <h1 className="hero-title text-white mb-6">Programme Catalogue</h1>
          <p className="text-white/70 max-w-2xl text-base md:text-lg leading-relaxed mb-10">
            A library of structured development programmes, each one built around a specific
            root condition and a measurable outcome. Browse by area, or search for a challenge.
          </p>
          <div className="max-w-xl relative">
            <input type="text" placeholder="Search by topic or challenge…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-5 py-4 text-sm focus:outline-none focus:border-white/60 transition-colors" />
            {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-sm">✕</button>}
          </div>
        </div>
      </section>

      <div className="bg-black border-t border-white/8 px-6 py-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{ n: totalCount || '132', label: 'Programmes' }, { n: '12', label: 'Areas' }, { n: '3', label: 'Engagement Tiers' }, { n: '6', label: 'Contexts' }].map(({ n, label }) => (
            <div key={label}>
              <p className="font-display text-4xl font-bold text-[#C9A84C]">{n}</p>
              <p className="text-xs font-label uppercase tracking-widest text-white/40 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {!loading && !error && domainGroups && <DomainNavigator domains={allDomains} />}

      <div className="sticky top-16 z-10 bg-white border-b border-black/10 px-6">
        <div className="max-w-6xl mx-auto flex gap-0 overflow-x-auto scrollbar-none">
          {DOMAIN_TABS.map(tab => (
            <button key={tab.code} onClick={() => { setActiveTab(tab.code); setSearch(''); }}
              className={`shrink-0 px-5 py-4 text-xs font-label tracking-widest uppercase border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.code ? 'border-[#C9A84C] text-black font-bold' : 'border-transparent text-black/40 hover:text-black'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {error && (
          <div className="text-center py-16">
            <p className="text-black">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-sm text-[#C9A84C] font-medium hover:underline">Try again</button>
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="section-label mb-4">No Results</p>
            <p className="text-black text-base mb-6">No programmes match your search.</p>
            <button onClick={() => { setSearch(''); setActiveTab('ALL'); }} className="text-sm font-semibold text-[#C9A84C] hover:underline">Clear filters</button>
          </div>
        )}

        {!loading && !error && domainGroups && (
          <div className="space-y-20">
            {Object.entries(domainGroups).map(([domain, items]) => (
              <section key={domain} id={`domain-${domain}`}>
                <div className="border-b-2 border-black pb-4 mb-8 flex items-end justify-between gap-4">
                  <div>
                    <p className="section-label mb-1">Area</p>
                    <h2 className="font-display text-3xl font-semibold text-black">{DOMAIN_LABELS[domain] ?? domain}</h2>
                  </div>
                  <span className="section-label text-black/40 flex-shrink-0 pb-1">{items.length} programme{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {items.map(s => <ProgrammeCard key={s.signalCode} programme={s} />)}
                </div>
              </section>
            ))}
          </div>
        )}

        {!loading && !error && !domainGroups && filtered.length > 0 && (
          <>
            <div className="mb-8 flex items-center gap-4">
              <p className="section-label">{filtered.length} programme{filtered.length !== 1 ? 's' : ''} found</p>
              {search && <button onClick={() => setSearch('')} className="text-xs text-[#C9A84C] hover:underline font-semibold">Clear search</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map(s => <ProgrammeCard key={s.signalCode} programme={s} />)}
            </div>
          </>
        )}

        {!loading && filtered.length > 0 && (
          <div className="mt-24 bg-black text-white px-10 py-16 text-center">
            <p className="section-label mb-5">Needs Assessment</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-5">Not sure which programme fits?</h2>
            <p className="text-white/70 text-sm md:text-base mb-10 max-w-lg mx-auto leading-relaxed">
              Take the 10-minute assessment. I&apos;ll identify the primary gap and recommend the programme best suited to your situation.
            </p>
            <Link href="/coaching/diagnostic" className="btn-gold">Take the Assessment →</Link>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
