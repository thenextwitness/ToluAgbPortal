'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { coachingApi } from '@/lib/api';

function money(minor: number, currency: string) {
  return `${currency} ${(minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export default function PlanReviewPage() {
  const params = useParams<{ token: string }>();
  const token  = params?.token ?? '';

  const [data, setData]       = useState<Awaited<ReturnType<typeof coachingApi.plan.get>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [sessionCount, setSessionCount] = useState(1);
  const [accepting, setAccepting]       = useState(false);
  const [accepted, setAccepted]         = useState<string | null>(null); // nextStatus

  useEffect(() => {
    if (!token) return;
    coachingApi.plan.get(token)
      .then(d => { setData(d); setSessionCount(d.plan.sessionCount); setLoading(false); })
      .catch(e => { setError(e.message ?? 'Could not load this plan'); setLoading(false); });
  }, [token]);

  const plan = data?.plan;
  const total = plan ? (plan.isPaid ? plan.ratePerSessionMinor * sessionCount : 0) : 0;

  async function handleAccept() {
    if (!plan) return;
    setAccepting(true);
    setError('');
    try {
      const res = await coachingApi.plan.accept(token, sessionCount);
      setAccepted(res.nextStatus);
    } catch (e: any) {
      setError(e.message ?? 'Could not accept the plan');
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <SiteNav />
        <div className="px-8 py-20 max-w-3xl mx-auto space-y-4">
          <div className="h-3 w-24 bg-black/10 animate-pulse" />
          <div className="h-8 w-2/3 bg-black/10 animate-pulse" />
          <div className="h-4 w-full bg-black/10 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <SiteNav />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
          <p className="section-label mb-4">Plan Unavailable</p>
          <h1 className="section-title mb-4 max-w-lg">{error}</h1>
          <Link href="/" className="text-[#C9A84C] text-sm font-semibold hover:underline mt-4">← Return home</Link>
        </div>
      </div>
    );
  }

  if (!plan || !data) return null;

  // ── Accepted confirmation ──
  if (accepted) {
    const isPaid = accepted === 'AWAITING_PAYMENT';
    return (
      <div className="min-h-screen bg-white">
        <SiteNav />
        <section className="bg-black text-white px-8 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <p className="section-label text-white/50 mb-5">{isPaid ? 'Almost There' : 'You\'re In'}</p>
            <h1 className="hero-title text-white mb-5">{isPaid ? 'Plan accepted' : 'Programme confirmed'}</h1>
            <p className="text-white/70 leading-relaxed max-w-xl mx-auto">
              {isPaid
                ? `Thank you. I'll be in touch with payment details for your ${sessionCount}-session programme. Once payment is confirmed, we'll schedule your sessions.`
                : `Your ${sessionCount}-session programme is confirmed. I'll be in touch to schedule your sessions and get you set up on the app.`}
            </p>
          </div>
        </section>
        <section className="bg-white px-8 py-16 text-center">
          <Link href="/" className="btn-outline">Return home</Link>
        </section>
        <SiteFooter />
      </div>
    );
  }

  const locked = !['RECOMMENDED', 'AWAITING_PAYMENT'].includes(plan.status);

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <section className="bg-black text-white px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <p className="section-label text-white/50 mb-5">Your Recommendation</p>
          <h1 className="hero-title text-white mb-5 leading-[1.05]">
            {data.programme?.worldTitle ?? 'Your Programme'}
          </h1>
          {data.programme?.problemHook && (
            <div className="border-l-4 border-[#C9A84C] pl-6 mt-6 max-w-2xl">
              <p className="text-white/80 leading-relaxed">{data.programme.problemHook}</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white px-6 md:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <p className="section-label mb-4">{plan.isPaid ? 'Programme & Pricing' : 'Your Programme'}</p>
          <h2 className="section-title mb-8">{plan.isPaid ? 'Review and accept' : 'Confirm your programme'}</h2>

          {plan.recommendationNote && (
            <div className="bg-[#FAF6EF] border-l-4 border-[#C9A84C] p-5 mb-8">
              <p className="text-sm text-black/80 leading-relaxed italic">{plan.recommendationNote}</p>
            </div>
          )}

          {/* Session count control */}
          <div className="border border-black/10 p-6 mb-6">
            <p className="text-xs font-bold tracking-widest uppercase text-black mb-3">Sessions</p>
            <p className="text-sm text-black/60 mb-4">
              Each session is {plan.sessionDurationMin} minutes. I recommended {plan.sessionCount} —
              you can reduce this if you&apos;d like to start smaller.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSessionCount(c => Math.max(1, c - 1))}
                disabled={locked || sessionCount <= 1}
                className="w-10 h-10 border-2 border-black text-black font-bold text-lg hover:bg-black hover:text-white transition-colors disabled:opacity-30"
              >−</button>
              <span className="font-display text-3xl font-semibold text-black w-12 text-center">{sessionCount}</span>
              <button
                onClick={() => setSessionCount(c => Math.min(plan.sessionCount, c + 1))}
                disabled={locked || sessionCount >= plan.sessionCount}
                className="w-10 h-10 border-2 border-black text-black font-bold text-lg hover:bg-black hover:text-white transition-colors disabled:opacity-30"
              >+</button>
              <span className="text-sm text-black/50 ml-2">of {plan.sessionCount} recommended</span>
            </div>
          </div>

          {/* Pricing */}
          {plan.isPaid ? (
            <div className="bg-black text-white p-6 mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-white/70">Per session ({plan.sessionDurationMin} min)</span>
                <span className="text-sm">{money(plan.ratePerSessionMinor, plan.currency)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-white/70">{sessionCount} session{sessionCount !== 1 ? 's' : ''}</span>
                <span className="text-sm">×{sessionCount}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/15 pt-4">
                <span className="font-semibold">Total</span>
                <span className="font-display text-2xl font-bold text-[#C9A84C]">{money(total, plan.currency)}</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF6EF] border-l-4 border-[#C9A84C] p-6 mb-8">
              <p className="font-display text-xl font-semibold text-black">This programme is free.</p>
              <p className="text-sm text-black/70 mt-1">{sessionCount} session{sessionCount !== 1 ? 's' : ''} of {plan.sessionDurationMin} minutes each.</p>
            </div>
          )}

          {error && <p className="text-sm text-[#9E7F2E] font-semibold mb-4">{error}</p>}

          {locked ? (
            <div className="bg-[#FAF6EF] border border-black/10 p-5 text-sm text-black/70">
              This plan has already been {plan.status.toLowerCase()}. Contact me if you need to make a change.
            </div>
          ) : (
            <>
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="btn-gold w-full justify-center text-base py-4 disabled:opacity-40"
              >
                {accepting ? 'Confirming…' : plan.isPaid ? `Accept — ${money(total, plan.currency)}` : 'Accept Programme'}
              </button>
              <p className="text-xs text-black/50 mt-3 leading-relaxed">
                {plan.isPaid
                  ? 'After you accept, I\'ll send payment details. Sessions are scheduled once payment is confirmed.'
                  : 'After you accept, I\'ll be in touch to schedule your sessions.'}
              </p>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
