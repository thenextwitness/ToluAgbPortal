'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { coachingApi } from '@/lib/api';
import { getFacilitator } from '@/lib/auth';
import { format } from 'date-fns';

const PHASE_NAMES = ['Foundation', 'Formation', 'Consecration', 'Expression'];
const PHASE_LABELS = ['OPEN', 'TEACH', 'REFLECT', 'SEND'];

type CohortDetail = Awaited<ReturnType<typeof coachingApi.participant.getCohort>>;

export default function FacilitatorCohortPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = use(params);
  const facilitator = getFacilitator();

  const [cohort, setCohort] = useState<CohortDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedReflection, setExpandedReflection] = useState<string | null>(null);
  const [completingSession, setCompletingSession] = useState('');

  useEffect(() => {
    if (!facilitator) return;

    async function load() {
      try {
        const data = await coachingApi.participant.getCohort(cohortId);
        setCohort(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cohort.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [cohortId]);

  async function handleCompleteSession(sessionId: string) {
    if (!facilitator) return;
    setCompletingSession(sessionId);
    try {
      await coachingApi.facilitator.completeSession(facilitator.token, sessionId);
      // Refresh cohort to get updated session state
      const updated = await coachingApi.participant.getCohort(cohortId);
      setCohort(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to complete session.');
    } finally {
      setCompletingSession('');
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-16 flex items-center justify-center">
        <div className="text-black text-sm">Loading cohort...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-16 max-w-3xl mx-auto">
        <div className="card border-red-200 bg-red-50 text-red-700">
          <p className="font-medium mb-1">Could not load cohort</p>
          <p className="text-sm">{error}</p>
        </div>
        <Link href="/facilitator/dashboard" className="mt-4 inline-block text-[#C9A84C] text-sm hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!cohort) {
    return (
      <div className="px-6 py-16 max-w-3xl mx-auto">
        <div className="card text-center py-12">
          <p className="text-black">Cohort not found.</p>
        </div>
        <Link href="/facilitator/dashboard" className="mt-4 inline-block text-[#C9A84C] text-sm hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const participants = cohort.participants ?? [];
  const sessions = cohort.sessions ?? [];

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      {/* Back link */}
      <Link href="/facilitator/dashboard" className="text-[#C9A84C] text-sm hover:underline mb-8 inline-block">
        ← Dashboard
      </Link>

      {/* Page header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span
            className="bg-[#C9A84C] text-white text-xs font-bold px-2 py-1 rounded-full"
            style={{ fontFamily: 'Cinzel, Georgia, serif' }}
          >
            {cohort.signalCode}
          </span>
          <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
            Phase {cohort.currentPhase} — {PHASE_NAMES[(cohort.currentPhase ?? 1) - 1] ?? ''}
          </span>
        </div>
        <h1 className="page-title mb-1">{cohort.programName}</h1>
        <p className="text-black">{cohort.orgName}</p>
      </div>

      {/* Participant Roster */}
      <section className="mb-10">
        <p className="section-label mb-4">Participant Roster</p>
        {participants.length === 0 ? (
          <div className="card py-8 text-center">
            <p className="text-black text-sm">No participants enrolled yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {participants.map((p, idx) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-black/10 px-4 py-3 flex items-center gap-3 hover:border-black/25 transition-colors"
              >
                <div className="w-8 h-8 bg-[#FAF6EF] rounded-full flex items-center justify-center text-xs font-bold text-black border border-black/15">
                  {idx + 1}
                </div>
                <div>
                  <span className="text-sm font-medium text-black">{p.fullName}</span>
                  <p className="text-xs text-black">Phase {p.currentPhase}{p.isComplete ? ' · Complete' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Session List */}
      <section className="mb-10">
        <p className="section-label mb-4">Sessions</p>
        <div className="flex flex-col gap-4">
          {sessions.length === 0 ? (
            <div className="card py-8 text-center">
              <p className="text-black text-sm">No sessions scheduled yet.</p>
            </div>
          ) : (
            [...sessions]
              .sort((a, b) => a.phase - b.phase)
              .map((session) => {
                const scheduledTime = new Date(session.scheduledAt);
                const now = new Date();
                const isLive = !session.isComplete && scheduledTime <= now;
                const isUpcoming = scheduledTime > now && !session.isComplete;
                const statusLabel = session.isComplete
                  ? 'Complete'
                  : isLive
                  ? 'Live'
                  : 'Upcoming';
                const statusColor = session.isComplete
                  ? 'bg-black text-white'
                  : isLive
                  ? 'bg-[#C9A84C] text-white'
                  : 'bg-[#F2EAD9] text-black';

                return (
                  <div key={session.id} className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full bg-[#FAF6EF] border border-black/15 flex items-center justify-center font-bold text-black text-sm"
                        style={{ fontFamily: 'Cinzel, Georgia, serif' }}
                      >
                        {session.phase}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-black text-sm">
                            Phase {session.phase} — {PHASE_NAMES[session.phase - 1] ?? ''}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                            {isLive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1" />}
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-xs text-black">
                          {PHASE_LABELS[session.phase - 1]} ·{' '}
                          {format(scheduledTime, "EEE, MMM d 'at' h:mm a")}
                          {session.attendanceCount > 0 && ` · ${session.attendanceCount} attended`}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-14 sm:ml-0">
                      {isLive && (
                        <button
                          onClick={() => handleCompleteSession(session.id)}
                          disabled={completingSession === session.id}
                          className={`bg-black text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-black transition-colors ${
                            completingSession === session.id ? 'opacity-40 cursor-not-allowed' : ''
                          }`}
                        >
                          {completingSession === session.id ? 'Completing...' : 'Complete Session'}
                        </button>
                      )}
                      {(isLive || isUpcoming || session.isComplete) && (
                        <button
                          onClick={() => setExpandedReflection(
                            expandedReflection === session.id ? null : session.id
                          )}
                          className="text-sm text-black hover:text-black border border-black/15 px-3 py-2 rounded-lg transition-colors"
                        >
                          Reflections {expandedReflection === session.id ? '↑' : '↓'}
                        </button>
                      )}
                    </div>

                    {/* Reflection accordion */}
                    {expandedReflection === session.id && (
                      <div className="w-full border-t border-black/10 pt-4 mt-2">
                        {participants.length === 0 ? (
                          <p className="text-black text-sm">No participants in this cohort.</p>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {participants.map((p) => (
                              <div key={p.id} className="bg-[#FAF6EF] rounded-lg px-4 py-3">
                                <p className="text-xs font-semibold text-black mb-1" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
                                  {p.fullName}
                                </p>
                                <p className="text-xs text-black italic">
                                  Reflection content is available in the Admin Portal. Use it to review and respond to individual reflections.
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </section>
    </div>
  );
}
