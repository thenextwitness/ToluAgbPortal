'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { coachingApi } from '@/lib/api';
import { getParticipant } from '@/lib/auth';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';

// livekit-client uses Node.js APIs (crypto, ws) incompatible with the edge runtime.
// Dynamic import with ssr:false ensures it only runs in the browser.
const LiveSession = dynamic(() => import('@/components/LiveSession'), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-[#C9A84C] bg-[#FAF6EF] p-8 text-center">
      <div className="animate-pulse text-[#C9A84C] text-2xl mb-3">◎</div>
      <p className="text-black font-semibold">Loading session room…</p>
    </div>
  ),
});

type Session = {
  id: string;
  phase: number;
  scheduledAt: string;
  isComplete: boolean;
  phaseName?: string;
  phaseDescription?: string;
};

type LiveKitCredentials = {
  token: string;
  roomName: string;
  livekitUrl: string;
};

export default function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // LiveKit credentials for the live state
  const [lkCredentials, setLkCredentials] = useState<LiveKitCredentials | null>(null);
  const [lkLoading, setLkLoading] = useState(false);
  const [lkError, setLkError] = useState('');

  const participant = getParticipant();

  // Load session metadata
  useEffect(() => {
    async function load() {
      try {
        const data = await coachingApi.participant.getSession(sessionId);
        setSession(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load session.'
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  // Fetch LiveKit token once we know the session is live
  useEffect(() => {
    if (!session || !participant) return;

    const scheduledTime = new Date(session.scheduledAt);
    const isLive = !session.isComplete && scheduledTime <= new Date();
    if (!isLive) return;

    setLkLoading(true);
    coachingApi.participant
      .getLiveKitToken(participant.id, sessionId, participant.token)
      .then((creds) => {
        setLkCredentials(creds);
      })
      .catch((err: unknown) => {
        setLkError(
          err instanceof Error ? err.message : 'Could not obtain session token.'
        );
      })
      .finally(() => {
        setLkLoading(false);
      });
  }, [session, sessionId, participant?.id]);

  // ── Loading / error guards ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="px-6 py-16 flex items-center justify-center">
        <div className="text-black text-sm">Loading session...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="px-6 py-16 max-w-2xl mx-auto">
        <div className="card border-red-200 bg-red-50 text-red-700">
          <p className="font-medium mb-1">Could not load session</p>
          <p className="text-sm">{error || 'Session not found.'}</p>
        </div>
        <Link
          href="/portal/dashboard"
          className="mt-4 inline-block text-[#C9A84C] text-sm hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const scheduledTime = new Date(session.scheduledAt);
  const now = new Date();
  const isUpcoming = scheduledTime > now && !session.isComplete;
  const isLive = !session.isComplete && scheduledTime <= now;
  const isComplete = session.isComplete;

  // ── Upcoming state ──────────────────────────────────────────────────────────

  if (isUpcoming) {
    return (
      <div className="px-6 py-16 max-w-2xl mx-auto">
        <Link
          href="/portal/dashboard"
          className="text-[#C9A84C] text-sm hover:underline mb-8 inline-block"
        >
          ← Dashboard
        </Link>
        <div className="card text-center">
          <div className="text-4xl mb-4">🗓️</div>
          <p className="section-label mb-2">Phase {session.phase} Session</p>
          <h2 className="page-title mb-4">{session.phaseName ?? 'Upcoming Session'}</h2>
          <p className="text-black leading-relaxed">
            Your session is scheduled for{' '}
            <span className="font-semibold text-black">
              {format(scheduledTime, "EEEE, MMMM d 'at' h:mm a")}
            </span>
            .
          </p>
          <p className="text-black text-sm mt-3">
            Join when your facilitator opens the session.
          </p>
        </div>
      </div>
    );
  }

  // ── Complete state ──────────────────────────────────────────────────────────

  if (isComplete) {
    return (
      <div className="px-6 py-16 max-w-2xl mx-auto">
        <Link
          href="/portal/dashboard"
          className="text-[#C9A84C] text-sm hover:underline mb-8 inline-block"
        >
          ← Dashboard
        </Link>
        <div className="card text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="page-title mb-4">Session Complete</h2>
          <p className="text-black mb-6 leading-relaxed">
            Phase {session.phase} session is complete. Submit your reflection to
            move forward.
          </p>
          <Link
            href={`/portal/reflection/${session.phase}`}
            className="btn-primary inline-block"
          >
            Submit Reflection →
          </Link>
        </div>
      </div>
    );
  }

  // ── Live state ──────────────────────────────────────────────────────────────

  if (!isLive) return null;

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <Link
        href="/portal/dashboard"
        className="text-[#C9A84C] text-sm hover:underline mb-6 inline-block"
      >
        ← Dashboard
      </Link>

      {/* Session header */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
            LIVE
          </span>
          <span className="text-xs text-black">Phase {session.phase}</span>
        </div>
        <h2 className="text-xl font-bold text-black mb-1">
          {session.phaseName ?? `Phase ${session.phase} Session`}
        </h2>
        {session.phaseDescription && (
          <p className="text-black text-sm leading-relaxed">
            {session.phaseDescription}
          </p>
        )}
      </div>

      {/* LiveKit video room */}
      <div className="mb-6">
        {lkLoading && (
          <div className="rounded-xl border border-[#C9A84C] bg-[#FAF6EF] p-8 text-center">
            <div className="animate-pulse text-[#C9A84C] text-2xl mb-3">◎</div>
            <p className="text-black font-semibold">Joining session…</p>
          </div>
        )}

        {!lkLoading && lkError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600 font-medium">Could not join session</p>
            <p className="text-red-400 text-sm mt-1">{lkError}</p>
          </div>
        )}

        {!lkLoading && !lkError && lkCredentials && (
          <LiveSession
            token={lkCredentials.token}
            serverUrl={lkCredentials.livekitUrl}
            roomName={lkCredentials.roomName}
            participantName={participant?.fullName ?? 'Participant'}
          />
        )}
      </div>

      {/* Post-session reflection note */}
      <div className="rounded-xl border border-black/10 bg-[#FAF6EF] px-5 py-4 text-sm text-black">
        <span className="font-medium text-black">Submit Reflection</span>
        {' — '}available after your facilitator closes the session.{' '}
        <Link
          href={`/portal/reflection/${session.phase}`}
          className="text-[#C9A84C] hover:underline"
        >
          Go to reflection →
        </Link>
      </div>
    </div>
  );
}
