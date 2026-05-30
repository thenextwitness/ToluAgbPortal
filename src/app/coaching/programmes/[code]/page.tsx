'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { coachingApi } from '@/lib/api';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

const DOMAIN_LABELS: Record<string, string> = {
  LEADERSHIP_INTEGRITY: 'Leadership Integrity', ORGANISATIONAL_CULTURE: 'Culture & Cohesion',
  PRODUCTIVITY_EXECUTION: 'Productivity & Execution', EMOTIONAL_RESILIENCE: 'Emotional Resilience',
  IDENTITY_SELF_CONCEPT: 'Identity & Self-Concept', CHARACTER_INTEGRITY: 'Character & Integrity',
  DECISION_MAKING: 'Decision-Making', STEWARDSHIP_RESOURCES: 'Stewardship & Resources',
  EQUITY_JUSTICE: 'Fairness & Accountability', PURPOSE_DIRECTION: 'Purpose & Direction',
  REHABILITATION_RECOVERY: 'Recovery & Restoration', PREVENTIVE_FORMATION: 'Youth Development',
};

const FRUIT_LABEL: Record<string, string> = {
  LOVE: 'Relational integrity and team cohesion', JOY: 'Purposeful engagement and intrinsic motivation',
  PEACE: 'Emotional stability and capacity under pressure', PATIENCE: 'Sustained commitment and long-term thinking',
  KINDNESS: 'Service orientation and empathy in practice', GOODNESS: 'Moral consistency and ethical conduct',
  FAITHFULNESS: 'Reliability and consistent follow-through', GENTLENESS: 'Measured authority and composed leadership',
  SELF_CONTROL: 'Disciplined execution and impulse governance',
};

const FRUIT_DESCRIPTION: Record<string, string> = {
  LOVE: 'A genuine, non-transactional orientation toward others. Relational trust increases, conflict decreases, and collaboration becomes sustainable rather than performative.',
  JOY: 'The internal motivation that external incentives cannot produce. Work becomes purposeful and contribution becomes intrinsic.',
  PEACE: 'The interior structure that holds under sustained pressure without collapse. Anxiety, reactivity, and burnout are replaced by composed capacity.',
  PATIENCE: 'The long-view posture that resists short-termism, impulsive decisions, and abandonment under difficulty. Commitment becomes a character trait.',
  KINDNESS: 'A move from transactional service to genuine investment in people — the deliberate, costly practice of developing others without agenda.',
  GOODNESS: 'Moral consistency — doing right when no one is watching, refusing compromise under pressure, building a reputation that matches the interior.',
  FAITHFULNESS: 'Following through — not because accountability forces it, but because your word has become your identity. Reliability becomes measurable.',
  GENTLENESS: 'Composed, non-coercive authority. Influence without force. Leadership that does not need volume or aggression to be felt.',
  SELF_CONTROL: 'The disciplined execution that closes the gap between intention and action. Impulse governance and consistent behaviour become observable.',
};

const DEPLOYMENT_LABELS: Record<string, string> = {
  CORPORATE: 'Organisations & Teams', REHABILITATION: 'Recovery & Restoration',
  YOUTH: 'Youth & Schools', COMMUNITY: 'Community Groups',
};

function titleCase(s: string) { return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }

type Programme = Awaited<ReturnType<typeof coachingApi.programmes.getByCode>>;

const SESSIONS = [
  { n: '01', name: 'OPEN', subtitle: 'The Problem Named', week: 'Week 1 · Session 1',
    body: 'I open the space, name the challenge, and anchor the assessment finding. You are not given answers — you are brought into honest contact with the gap. The framework is introduced as precision developmental material with documented grounding.' },
  { n: '02', name: 'TEACH', subtitle: 'The Framework Delivered', week: 'Week 1 · Session 2',
    body: 'Full instruction. The root condition is examined at depth — its psychological, historical, and practical dimensions. You engage not only as a participant but as an analyst of your own experience within the framework.' },
  { n: '03', name: 'REFLECT', subtitle: 'The Commitment Moment', week: 'Week 2 · Session 3',
    body: 'Guided reflection and inner work. This is where the programme moves from intellectual encounter to real commitment — not through emotion, but through honest self-assessment and clarity about what is being asked and offered.' },
  { n: '04', name: 'SEND', subtitle: 'The Deployment', week: 'Week 2 · Session 4',
    body: 'You are sent — with a specific practice, a community of accountability, and evidence of what has already begun to shift. The cohort closes with a measured assessment of observable change and a transformation report.' },
];

export default function ProgrammeDetailPage() {
  const params = useParams<{ code: string }>();
  const code   = params?.code ?? '';

  const [programme, setProgramme] = useState<Programme | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (!code) return;
    coachingApi.programmes.getByCode(code)
      .then(data => { setProgramme(data); setLoading(false); })
      .catch(err => {
        if (err.message?.includes('404') || err.message?.includes('not found')) setNotFound(true);
        else setError(err.message ?? 'Failed to load programme.');
        setLoading(false);
      });
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="bg-black px-8 py-16 md:py-24">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="h-3 w-24 bg-white/10 animate-pulse" />
            <div className="h-12 w-3/4 bg-white/10 animate-pulse" />
            <div className="h-5 w-1/2 bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <SiteNav />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
          <p className="section-label mb-4">Programme Not Found</p>
          <h1 className="section-title mb-4">{notFound ? `"${code}" is not an active programme.` : error}</h1>
          <Link href="/coaching/programmes" className="text-[#C9A84C] text-sm font-semibold hover:underline mt-4">← Return to the Catalogue</Link>
        </div>
      </div>
    );
  }

  if (!programme) return null;

  const fruits = programme.fruitOutcomes?.split(',').map(f => f.trim()).filter(Boolean) ?? [];
  const secondaryDomains = programme.secondaryDomains?.split(',').map(d => d.trim()).filter(Boolean) ?? [];
  const deploymentContexts = programme.deploymentSettings?.split(',').map(d => d.trim()).filter(Boolean) ?? [];
  const audiences = programme.targetAudiences?.split(',').map((a: string) => a.trim()).filter(Boolean) ?? [];

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Header */}
      <section className="bg-black text-white px-8 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <Link href="/coaching/programmes" className="eyebrow text-white/50 hover:text-white mb-12 inline-block">← Catalogue</Link>
          <div className="flex flex-wrap gap-4 items-center mb-8">
            <span className="section-label text-white/50">{programme.signalCode}</span>
            <span className="eyebrow text-white border border-white/30 px-3 py-1">{DOMAIN_LABELS[programme.primaryDomain] ?? programme.primaryDomain}</span>
          </div>
          <h1 className="hero-title text-white text-left mb-5">{programme.worldTitle}</h1>
          {programme.worldSubtitle && <p className="text-xl text-white/70 font-display italic mb-8">{programme.worldSubtitle}</p>}
          <div className="border-l-4 border-[#C9A84C] pl-6 mt-8 max-w-3xl">
            <p className="text-white/90 text-lg leading-relaxed">{programme.problemHook}</p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="bg-white px-8 py-16 md:py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-2">
            <p className="section-label mb-4">Overview</p>
            <h2 className="section-title mb-6">The Problem This Programme Addresses</h2>
            <p className="text-black/80 leading-relaxed text-lg mb-6">{programme.problemHook}</p>
            <p className="text-black/80 leading-relaxed">
              Most problems people try to fix are symptoms. This programme does not offer
              strategies or techniques — it addresses the root condition that produces the
              presenting problem, and in doing so produces change that lasts beyond the programme itself.
            </p>
          </div>
          <div className="bg-[#FAF6EF] p-6 border-l-4 border-[#C9A84C]">
            <dl className="space-y-5">
              <div><dt className="section-label">Programme Code</dt><dd className="text-sm text-black mt-1 font-semibold">{programme.signalCode}</dd></div>
              <div><dt className="section-label">Primary Area</dt><dd className="text-sm text-black mt-1">{DOMAIN_LABELS[programme.primaryDomain] ?? programme.primaryDomain}</dd></div>
              {secondaryDomains.length > 0 && <div><dt className="section-label">Also Touches</dt><dd className="text-sm text-black mt-1">{secondaryDomains.map(d => DOMAIN_LABELS[d] ?? d).join(' · ')}</dd></div>}
              <div><dt className="section-label">Contexts</dt><dd className="text-sm text-black mt-1">{deploymentContexts.map(d => DEPLOYMENT_LABELS[d] ?? d).join(' · ')}</dd></div>
              <div><dt className="section-label">Standard Format</dt><dd className="text-sm text-black mt-1">4 sessions · 2 weeks · Live</dd></div>
              <div><dt className="section-label">Prerequisites</dt><dd className="text-sm text-black mt-1">Needs assessment completed · Programme confirmed</dd></div>
            </dl>
          </div>
        </div>
      </section>

      {/* Fit */}
      <section className="bg-[#FAF6EF] px-8 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-4">Who It's For</p>
          <h2 className="section-title mb-10">Who This Programme Serves</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="section-label mb-4">Best Suited To</p>
              {audiences.length > 0 ? (
                <ul className="space-y-2">
                  {audiences.map((a: string) => (
                    <li key={a} className="flex items-start gap-3 text-sm text-black/80"><span className="w-1 h-1 bg-[#C9A84C] rounded-full mt-2 flex-shrink-0" />{a}</li>
                  ))}
                </ul>
              ) : <p className="text-sm text-black/80 leading-relaxed">{programme.targetAudiences}</p>}
            </div>
            <div>
              <p className="section-label mb-4">Delivery Contexts</p>
              <ul className="space-y-2">
                {deploymentContexts.map(d => (
                  <li key={d} className="flex items-start gap-3 text-sm text-black/80"><span className="w-1 h-1 bg-[#C9A84C] rounded-full mt-2 flex-shrink-0" />{DEPLOYMENT_LABELS[d] ?? d}</li>
                ))}
              </ul>
            </div>
          </div>
          {(programme.rehabilitationContexts || programme.preventiveContexts) && (
            <div className="mt-10 pt-8 border-t border-black/10 grid grid-cols-1 md:grid-cols-2 gap-10">
              {programme.rehabilitationContexts && <div><p className="section-label mb-3">Recovery Contexts</p><p className="text-sm text-black/80 leading-relaxed">{programme.rehabilitationContexts}</p></div>}
              {programme.preventiveContexts && <div><p className="section-label mb-3">Preventive Contexts</p><p className="text-sm text-black/80 leading-relaxed">{programme.preventiveContexts}</p></div>}
            </div>
          )}
        </div>
      </section>

      {/* Outcomes */}
      <section className="bg-white px-8 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-4">Outcomes</p>
          <h2 className="section-title mb-4">What Changes</h2>
          <p className="text-black/80 leading-relaxed max-w-2xl mb-12">
            These are the observable, measurable changes you can expect when you engage
            with the full programme. Outcomes are assessed before, during, and after.
          </p>
          {fruits.length === 0 ? (
            <p className="text-black/70 text-sm">Outcome data will be available shortly.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fruits.map(f => (
                <div key={f} className="flex items-stretch border border-black/10 overflow-hidden">
                  <div className="w-1.5 bg-[#C9A84C] flex-shrink-0" />
                  <div className="p-6">
                    <p className="section-label mb-2">{titleCase(f)}</p>
                    <p className="text-black font-semibold text-base mb-2 font-display">{FRUIT_LABEL[f] ?? f}</p>
                    <p className="text-sm text-black/70 leading-relaxed">{FRUIT_DESCRIPTION[f] ?? 'Detailed outcome documentation available on request.'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Methodology */}
      <section className="bg-black text-white px-8 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-4">Methodology</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-5">How This Programme Works</h2>
          <p className="text-white/70 max-w-3xl leading-relaxed mb-14">
            Every programme follows the same four-session arc, adapted to the specific challenge.
            Sessions are live and experienced together — no recordings, no self-paced modules.
          </p>
          <div className="space-y-0">
            {SESSIONS.map((s, i) => (
              <div key={s.n} className={`grid grid-cols-1 md:grid-cols-4 gap-0 border-t border-white/10 ${i === SESSIONS.length - 1 ? 'border-b' : ''}`}>
                <div className="md:col-span-1 px-0 py-8 md:pr-8 border-b md:border-b-0 md:border-r border-white/10">
                  <p className="section-label text-[#C9A84C] mb-2">Session {s.n}</p>
                  <p className="font-display text-2xl font-bold text-white">{s.name}</p>
                  <p className="text-white/50 text-xs mt-1">{s.subtitle}</p>
                  <p className="text-white/30 text-xs mt-3 font-label tracking-widest uppercase">{s.week}</p>
                </div>
                <div className="md:col-span-3 py-8 md:pl-10"><p className="text-white/80 leading-relaxed">{s.body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-[#FAF6EF] px-8 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-4">Structure</p>
          <h2 className="section-title mb-4">Engagement Tiers</h2>
          <p className="text-black/80 leading-relaxed max-w-2xl mb-12">Three tiers accommodate different constraints and levels of commitment. All are delivered live.</p>
          <div className="space-y-4">
            {[
              { tier: '01', name: 'Introductory Session', duration: '90 minutes', badge: 'Taster',
                desc: programme.tier1Description ?? 'A 90-minute live session introducing the area, naming the challenge, and demonstrating the framework. Ideal for evaluating fit before committing to a full programme. Includes a debrief and recommendation on next steps.' },
              { tier: '02', name: 'Core Programme', duration: '4 sessions · 2 weeks', badge: 'Standard',
                desc: programme.tier2Description ?? 'The standard engagement: four live sessions over two weeks following the OPEN–TEACH–REFLECT–SEND arc. Each session is 90–120 minutes, with pre and post assessment, materials, practice assignments, and a transformation report at close.' },
              { tier: '03', name: 'Extended Integration', duration: '8–12 weeks', badge: 'Deep Track',
                desc: programme.tier3Description ?? 'For sustained change. The core programme followed by 6–8 weekly integration sessions covering application, accountability, and behavioural consolidation. Includes additional assessment cycles and a longitudinal report.' },
            ].map(({ tier, name, duration, badge, desc }) => (
              <div key={tier} className="bg-white border border-black/10 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4">
                  <div className="bg-black text-white p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <p className="section-label text-[#C9A84C] mb-2">Tier {tier}</p>
                      <p className="font-display text-xl font-semibold text-white leading-tight">{name}</p>
                      <p className="text-white/50 text-xs mt-2 font-label tracking-widest uppercase">{duration}</p>
                    </div>
                    <span className="mt-6 inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 border border-white/30 text-white/70 self-start">{badge}</span>
                  </div>
                  <div className="md:col-span-3 p-6 md:p-8">
                    <p className="text-black/80 leading-relaxed">{desc}</p>
                    <Link href={`/coaching/diagnostic?programme=${programme.signalCode}&tier=${tier}`} className="inline-block mt-6 text-xs font-bold tracking-widest uppercase text-[#C9A84C] hover:underline">Request this tier →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white px-8 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="section-label mb-5">Next Step</p>
          <h2 className="font-display text-4xl font-semibold text-white mb-6">Ready to begin?</h2>
          <p className="text-white/70 mb-10 leading-relaxed">
            Take the needs assessment and I&apos;ll confirm fit, arrange a discovery call, and set the schedule with you.
          </p>
          <Link href={`/coaching/diagnostic?programme=${programme.signalCode}`} className="btn-gold">Take the Needs Assessment →</Link>
          <p className="text-white/40 text-sm mt-8">
            Or <Link href="/coaching/programmes" className="text-white/70 hover:text-white underline transition-colors">browse the full catalogue</Link> to explore other programmes.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
