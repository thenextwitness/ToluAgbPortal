'use client';
export const runtime = 'edge';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const DOMAIN_LABELS: Record<string, string> = {
  LEADERSHIP_INTEGRITY: 'Leadership Integrity', ORGANISATIONAL_CULTURE: 'Culture & Cohesion',
  PRODUCTIVITY_EXECUTION: 'Productivity & Execution', EMOTIONAL_RESILIENCE: 'Emotional Resilience',
  IDENTITY_SELF_CONCEPT: 'Identity & Self-Concept', CHARACTER_INTEGRITY: 'Character & Integrity',
  DECISION_MAKING: 'Decision-Making', STEWARDSHIP_RESOURCES: 'Stewardship & Resources',
  EQUITY_JUSTICE: 'Fairness & Accountability', PURPOSE_DIRECTION: 'Purpose & Direction',
  REHABILITATION_RECOVERY: 'Recovery & Restoration', PREVENTIVE_FORMATION: 'Youth Development',
};

interface Slot { slotDateUtc: string; displayDate: string; displayTime: string; timezone: string; durationMin: number; }
interface BookingContext {
  submission: { id: string; contactName: string | null; contactEmail: string | null; organizationName: string | null };
  programme: { signalCode: string; worldTitle: string; worldSubtitle: string | null; problemHook: string; primaryDomain: string } | null;
  slots: Slot[];
}

export default function BookingPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token  = params?.token ?? '';

  const [ctx, setCtx]           = useState<BookingContext | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [selected, setSelected] = useState<string>('');

  const [contactName, setContactName]   = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [orgName, setOrgName]           = useState('');
  const [notes, setNotes]               = useState('');
  const [submitting, setSubmitting]     = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/world/booking/${token}`)
      .then(async r => { if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? 'Booking link not valid'); } return r.json(); })
      .then((data: BookingContext) => {
        setCtx(data);
        if (data.submission.contactName) setContactName(data.submission.contactName);
        if (data.submission.contactEmail) setContactEmail(data.submission.contactEmail);
        if (data.submission.organizationName) setOrgName(data.submission.organizationName);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [token]);

  const slotsByDate = useMemo(() => {
    if (!ctx) return {};
    const groups: Record<string, Slot[]> = {};
    for (const s of ctx.slots) { if (!groups[s.displayDate]) groups[s.displayDate] = []; groups[s.displayDate].push(s); }
    return groups;
  }, [ctx]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) { setError('Please select a time slot.'); return; }
    if (!contactName || !contactEmail || !orgName) { setError('Name, email, and organisation are required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/world/booking/${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotDateUtc: selected, contactName, contactEmail, contactPhone: contactPhone || undefined, orgName, notes: notes || undefined }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Failed to book');
      router.push(`/coaching/book/confirmed/${body.bookingId}`);
    } catch (e: any) { setError(e.message); setSubmitting(false); }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <SiteNav />
        <div className="bg-black px-8 py-16 md:py-24">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="h-3 w-24 bg-white/10 animate-pulse" />
            <div className="h-10 w-3/4 bg-white/10 animate-pulse" />
            <div className="h-5 w-1/2 bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !ctx) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <SiteNav />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
          <p className="section-label mb-4">Booking Unavailable</p>
          <h1 className="section-title mb-4 max-w-lg">{error}</h1>
          <Link href="/" className="text-[#C9A84C] text-sm font-semibold hover:underline mt-4">← Return home</Link>
        </div>
      </div>
    );
  }

  if (!ctx) return null;

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <section className="bg-black text-white px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <p className="section-label text-white/50 mb-5">Discovery Call · 30 minutes</p>
          <h1 className="hero-title text-white mb-5 leading-[1.05]">Schedule Your<br/>Discovery Call</h1>
          {ctx.programme && (
            <div className="border-l-4 border-[#C9A84C] pl-6 mt-8 max-w-3xl">
              <p className="text-xs font-bold tracking-widest uppercase text-white/50 mb-1">
                {ctx.programme.signalCode} · {DOMAIN_LABELS[ctx.programme.primaryDomain] ?? ctx.programme.primaryDomain}
              </p>
              <p className="text-2xl md:text-3xl font-display font-semibold text-white mb-2 leading-tight">{ctx.programme.worldTitle}</p>
              <p className="text-white/70 leading-relaxed">{ctx.programme.problemHook}</p>
            </div>
          )}
          <p className="text-white/60 leading-relaxed mt-10 max-w-2xl">
            Choose a 30-minute slot to speak with me. We&apos;ll confirm the recommended programme is the
            right fit and agree the dates for the full programme.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 md:px-8 py-16 md:py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">

          <div className="md:col-span-3">
            <p className="section-label mb-4">Choose a Time</p>
            <h2 className="section-title mb-8">Available Slots</h2>
            {ctx.slots.length === 0 ? (
              <div className="bg-[#FAF6EF] border-l-4 border-[#C9A84C] p-6">
                <p className="font-semibold text-black mb-2">No slots are currently available.</p>
                <p className="text-sm text-black/80 leading-relaxed">Please reply to your recommendation email and I&apos;ll offer alternative times directly.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(slotsByDate).map(([date, slots]) => (
                  <div key={date}>
                    <p className="section-label mb-3">{date}</p>
                    <div className="flex flex-wrap gap-2">
                      {slots.map(s => (
                        <button key={s.slotDateUtc} type="button" onClick={() => setSelected(s.slotDateUtc)}
                          className={`px-5 py-3 text-sm font-semibold border transition-all ${selected === s.slotDateUtc ? 'bg-black text-white border-black' : 'bg-white text-black border-black/15 hover:border-black'}`}>
                          {s.displayTime}
                          <span className={`block text-[10px] font-normal mt-0.5 ${selected === s.slotDateUtc ? 'text-white/60' : 'text-black/50'}`}>{s.timezone}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <p className="section-label mb-4">Your Details</p>
            <h2 className="section-title mb-8">Confirm Booking</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">Name *</label>
                <input type="text" required value={contactName} onChange={e => setContactName(e.target.value)} className="w-full border border-black/15 px-4 py-3 text-sm bg-white focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">Email *</label>
                <input type="email" required value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full border border-black/15 px-4 py-3 text-sm bg-white focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">Organisation *</label>
                <input type="text" required value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full border border-black/15 px-4 py-3 text-sm bg-white focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">Phone (optional)</label>
                <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full border border-black/15 px-4 py-3 text-sm bg-white focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any context you'd like to share before the call…" className="w-full border border-black/15 px-4 py-3 text-sm bg-white focus:outline-none focus:border-black resize-y" />
              </div>

              {selected && (
                <div className="border-l-4 border-[#C9A84C] pl-4 py-2 bg-[#FAF6EF]">
                  <p className="text-xs font-bold tracking-widest uppercase text-black mb-1">Selected</p>
                  <p className="text-sm text-black">
                    {ctx.slots.find(s => s.slotDateUtc === selected)?.displayDate}<br/>
                    <strong>{ctx.slots.find(s => s.slotDateUtc === selected)?.displayTime}</strong>{' · '}{ctx.slots.find(s => s.slotDateUtc === selected)?.timezone}
                  </p>
                </div>
              )}

              {error && <p className="text-sm text-[#9E7F2E] font-semibold">{error}</p>}

              <button type="submit" disabled={!selected || submitting}
                className="w-full bg-[#C9A84C] text-black px-6 py-4 text-sm font-bold tracking-widest uppercase hover:bg-[#9E7F2E] transition-colors disabled:opacity-40">
                {submitting ? 'Booking…' : 'Confirm Booking →'}
              </button>
              <p className="text-xs text-black/50 leading-relaxed">You will receive a confirmation email with a calendar invitation immediately after booking.</p>
            </form>
          </div>

        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
