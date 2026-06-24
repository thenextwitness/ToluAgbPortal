'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coachingApi } from '@/lib/api';
import { getParticipant } from '@/lib/auth';

export default function ProgramCompletePage() {
  const participant = getParticipant();

  const [programName, setProgramName] = useState('');
  const [signalCode, setSignalCode] = useState('');
  const [testimony, setTestimony] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!participant) return;

    coachingApi.participant.getProfile(participant.id, participant.token)
      .then((profile) => {
        setProgramName(profile.programName ?? '');
        setSignalCode(profile.signalCode ?? '');
      })
      .catch(() => {
        // Non-critical — page still functions without profile data
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!participant || !testimony.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      // POST testimony to backend
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://purpose-formation-api-production.up.railway.app';
      const res = await fetch(`${API_BASE}/api/world/testimony`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: participant.id,
          cohortId:      participant.cohortId,
          content:       testimony.trim(),
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit testimony. Please try again or email it to hello@toluagb.com.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex flex-col items-center justify-center px-6 py-20">
        <div className="card max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-[#C9A84C] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-black text-2xl font-bold">✓</span>
          </div>
          <p className="section-label mb-3">Testimony Received</p>
          <h2 className="page-title mb-4">Thank You.</h2>
          <p className="text-black/70 leading-relaxed mb-8">
            Your testimony has been received. What you&apos;ve built in yourself does not end here — carry it forward.
          </p>
          <Link href="/" className="btn-primary inline-block">
            Return home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex flex-col">
      {/* Completion header */}
      <div className="bg-black text-white px-6 py-16 text-center">
        <p className="eyebrow text-[#C9A84C] mb-4 tracking-[0.2em]">Program Complete</p>
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          You made it through.
        </h1>
        {programName && (
          <p className="text-white/70 text-lg">{programName}</p>
        )}
        {signalCode && (
          <span className="inline-block mt-3 bg-[#C9A84C] text-black text-xs font-bold px-3 py-1 rounded-full" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
            {signalCode}
          </span>
        )}
      </div>

      {/* Summary + testimony form */}
      <div className="px-6 py-12 max-w-2xl mx-auto w-full flex-1">
        {/* Program summary */}
        <div className="card mb-8">
          <p className="section-label mb-3">What You Completed</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {['Foundation', 'Formation', 'Consecration', 'Expression'].map((phase) => (
              <div key={phase} className="bg-black rounded-lg px-3 py-4">
                <div className="w-6 h-6 bg-[#C9A84C] rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <p className="text-white text-xs font-semibold" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>{phase}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimony form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <p className="section-label mb-2">Your Testimony</p>
            <h2 className="page-title mb-2">What changed?</h2>
            <p className="text-black/70 text-sm leading-relaxed mb-6">
              What are you carrying forward from this programme? What is different in how you see yourself, how you work, or how you lead?
            </p>
          </div>

          <div className="card">
            <label className="block text-black font-semibold mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem' }}>
              Your testimony
            </label>
            <p className="text-black/60 text-xs mb-3">
              Write honestly. It will be kept confidentially and may be shared with your facilitator.
            </p>
            <textarea
              required
              rows={8}
              value={testimony}
              onChange={(e) => setTestimony(e.target.value)}
              placeholder="Write what changed for you through this programme..."
              className="w-full border border-black/15 px-4 py-3 text-sm text-black focus:outline-none focus:border-[#C9A84C] resize-none transition-colors leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm leading-relaxed">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!testimony.trim() || submitting}
            className={`btn-primary ${!testimony.trim() || submitting ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Submitting...' : 'Submit Testimony'}
          </button>

          <p className="text-xs text-black/60 text-center">
            Having difficulty?{' '}
            <a href="mailto:hello@toluagb.com" className="text-[#C9A84C] hover:underline">
              Email us directly
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
