'use client';
export const runtime = 'edge';

import { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { coachingApi } from '@/lib/api';
import { getParticipant } from '@/lib/auth';

const REFLECTION_QUESTIONS = [
  {
    key: 'q1',
    label: 'What from today\'s session struck you most, and why?',
  },
  {
    key: 'q2',
    label: 'Where in your life or work does this show up most clearly?',
  },
  {
    key: 'q3',
    label: 'One thing I am choosing to do differently:',
  },
  {
    key: 'q4',
    label: 'My commitment before the next session:',
  },
];

export default function ReflectionPage({
  params,
}: {
  params: Promise<{ phase: string }>;
}) {
  const { phase } = use(params);
  const phaseNumber = parseInt(phase, 10);

  const [responses, setResponses] = useState<Record<string, string>>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const participant = getParticipant();

  function handleChange(key: string, value: string) {
    setResponses((prev) => ({ ...prev, [key]: value }));
  }

  const allAnswered = Object.values(responses).every((v) => v.trim().length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!participant || !allAnswered) return;

    setSubmitting(true);
    setError('');

    try {
      await coachingApi.participant.submitReflection(
        participant.id,
        phaseNumber,
        responses,
        participant.token
      );
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit reflection. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="px-6 py-16 max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="card w-full">
          <div className="text-5xl mb-6">✅</div>
          <h2 className="page-title mb-4">Reflection Submitted</h2>
          <p className="text-black leading-relaxed mb-6">
            Your reflection has been received and will be reviewed by your
            facilitator. Your progression to the next phase will be confirmed
            by them before your next session.
          </p>
          <Link href="/portal/dashboard" className="btn-primary inline-block">
            Return to Dashboard
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

      <p className="section-label mb-2">Phase {phaseNumber} Reflection</p>
      <h1 className="page-title mb-2">Session Reflection</h1>
      <p className="text-black text-sm mb-8 leading-relaxed">
        Take a moment to reflect honestly. Your responses are for your own
        formation and are reviewed by your facilitator.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {REFLECTION_QUESTIONS.map((q) => (
          <div key={q.key} className="card">
            <label className="block text-[#1a1a2e] font-medium mb-3 leading-relaxed">
              {q.label}
            </label>
            <textarea
              required
              rows={4}
              value={responses[q.key]}
              onChange={(e) => handleChange(q.key, e.target.value)}
              placeholder="Write your reflection here..."
              className="w-full border border-black/15 rounded-lg px-4 py-3 text-sm text-black focus:outline-none focus:border-[#C9A84C] resize-none transition-colors leading-relaxed"
            />
          </div>
        ))}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!allAnswered || submitting}
          className={`btn-primary ${
            !allAnswered || submitting ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Reflection'}
        </button>
      </form>
    </div>
  );
}
