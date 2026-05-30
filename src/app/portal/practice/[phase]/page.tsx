'use client';
export const runtime = 'edge';

import { useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { coachingApi } from '@/lib/api';
import { getParticipant } from '@/lib/auth';

const PRACTICE_DESCRIPTIONS: Record<number, string> = {
  1: 'Apply the foundation teaching from this session. Choose one area where you will act differently in the next 48 hours.',
  2: 'Take the formation content you received and put it into practice. Describe a specific action you will take before the next session.',
  3: 'Following your reflection and commitment, take deliberate action. Record what you did and what changed.',
  4: 'As you complete this program, act on the commission you received. What step are you taking today?',
};

export default function PracticePage({
  params,
}: {
  params: Promise<{ phase: string }>;
}) {
  const { phase } = use(params);
  const phaseNumber = parseInt(phase, 10);
  const participant = getParticipant();

  const [action, setAction] = useState('');
  const [outcome, setOutcome] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = action.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!participant || !canSubmit) return;

    setSubmitting(true);
    setError('');

    try {
      const response = action.trim() + (outcome.trim() ? `\n\nOutcome: ${outcome.trim()}` : '');
      await coachingApi.participant.submitPractice(participant.id, phaseNumber, response, participant.token);
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to log practice. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="px-6 py-16 max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="card w-full">
          <div className="w-12 h-12 bg-[#C9A84C] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-xl font-bold">✓</span>
          </div>
          <p className="section-label mb-3">Practice Logged</p>
          <h2 className="page-title mb-4">Well done.</h2>
          <p className="text-black leading-relaxed mb-6">
            Your practice has been recorded. See you at the next session.
          </p>
          <Link href="/portal/dashboard" className="btn-primary inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-2xl mx-auto">
      <Link
        href="/portal/dashboard"
        className="text-[#C9A84C] text-sm hover:underline mb-6 inline-block"
      >
        ← Dashboard
      </Link>

      <p className="section-label mb-2">Phase {phaseNumber} Practice</p>
      <h1 className="page-title mb-2">Practice Assignment</h1>
      <p className="text-black text-sm mb-8 leading-relaxed">
        {PRACTICE_DESCRIPTIONS[phaseNumber] ?? 'Apply what you received in this session. Record your action and the result.'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Action */}
        <div className="card">
          <label className="block text-black font-semibold mb-1 leading-relaxed" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem' }}>
            What did you do?
          </label>
          <p className="text-black text-xs mb-3">Describe specifically — what action did you take?</p>
          <textarea
            required
            rows={5}
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Describe your practice action in concrete terms..."
            className="w-full border border-black/15 rounded-lg px-4 py-3 text-sm text-black focus:outline-none focus:border-[#C9A84C] resize-none transition-colors leading-relaxed"
          />
        </div>

        {/* Outcome */}
        <div className="card">
          <label className="block text-black font-semibold mb-1 leading-relaxed" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem' }}>
            What was the result?
          </label>
          <p className="text-black text-xs mb-3">Optional — what did you observe? What changed?</p>
          <textarea
            rows={4}
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="What happened as a result of your action?"
            className="w-full border border-black/15 rounded-lg px-4 py-3 text-sm text-black focus:outline-none focus:border-[#C9A84C] resize-none transition-colors leading-relaxed"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className={`btn-primary ${!canSubmit || submitting ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          {submitting ? 'Logging...' : 'Log Practice'}
        </button>
      </form>
    </div>
  );
}
