'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getParticipant } from '@/lib/auth';
import { coachingApi } from '@/lib/api';
import PhaseCard from '@/components/PhaseCard';
import ProgressBar from '@/components/ProgressBar';
import { format } from 'date-fns';

const PHASE_NAMES = ['Foundation', 'Formation', 'Consecration', 'Expression'];

type Profile = {
  id: string;
  fullName: string;
  cohortId: string;
  currentPhase: number;
  orgCode: string;
  orgName?: string;
  facilitatorName?: string;
  signalCode?: string;
  programName?: string;
};

type Session = {
  id: string;
  phase: number;
  scheduledAt: string;
  isComplete: boolean;
};

export default function ParticipantDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = getParticipant();
    if (!stored) return;

    async function load() {
      if (!stored) return;
      try {
        const [profileData, sessionsData] = await Promise.all([
          coachingApi.participant.getProfile(stored.id, stored.token),
          coachingApi.participant.listSessions(stored.cohortId),
        ]);
        setProfile(profileData);

        // Find the session for current phase
        const currentPhase = profileData.currentPhase ?? stored.currentPhase;
        const session = sessionsData.find((s: Session) => s.phase === currentPhase);
        if (session) setCurrentSession(session);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load your dashboard.'
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="px-6 py-16 flex items-center justify-center">
        <div className="text-black text-sm">Loading your program...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-16 max-w-2xl mx-auto">
        <div className="card border-red-200 bg-red-50 text-red-700">
          <p className="font-medium mb-1">Could not load dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const stored = getParticipant();
  const currentPhase = profile?.currentPhase ?? stored?.currentPhase ?? 1;
  const completedPhases = currentPhase - 1;

  function getPhaseStatus(phase: number): 'complete' | 'current' | 'locked' {
    if (phase < currentPhase) return 'complete';
    if (phase === currentPhase) return 'current';
    return 'locked';
  }

  function renderSessionCard() {
    if (!currentSession) {
      return (
        <div className="text-black text-sm">
          No session scheduled yet. Contact your facilitator.
        </div>
      );
    }

    const scheduledTime = new Date(currentSession.scheduledAt);
    const now = new Date();
    const isPast = scheduledTime <= now;
    const formattedDate = format(scheduledTime, "EEEE, MMMM d 'at' h:mm a");

    if (currentSession.isComplete) {
      return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-black">Phase {currentPhase} session complete.</p>
            <p className="text-sm text-black mt-1">
              Submit your reflection to unlock the next phase.
            </p>
          </div>
          <Link
            href={`/portal/reflection/${currentPhase}`}
            className="btn-primary whitespace-nowrap"
          >
            Submit Reflection
          </Link>
        </div>
      );
    }

    if (isPast) {
      return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-black">Your session is in progress.</p>
            <p className="text-sm text-black mt-1">
              Started {formattedDate}
            </p>
          </div>
          <Link
            href={`/portal/session/${currentSession.id}`}
            className="btn-primary whitespace-nowrap"
          >
            Enter Session →
          </Link>
        </div>
      );
    }

    return (
      <div>
        <p className="font-medium text-black">Next session:</p>
        <p className="text-black mt-1">{formattedDate}</p>
        <p className="text-xs text-black mt-2">
          You will be able to join once your facilitator opens the session.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <ProgressBar
          current={completedPhases}
          total={4}
          label="Program Progress"
        />
      </div>

      {/* Program header card */}
      <div className="card mb-8">
        <p className="section-label mb-2">
          {profile?.signalCode ?? stored?.orgCode ?? ''}
        </p>
        <h1 className="text-2xl font-bold text-black mb-1">
          {profile?.programName ?? 'Your Formation Program'}
        </h1>
        {profile?.orgName && (
          <p className="text-black text-sm mb-0.5">{profile.orgName}</p>
        )}
        {profile?.facilitatorName && (
          <p className="text-black text-sm">
            Facilitator: <span className="text-black font-medium">{profile.facilitatorName}</span>
          </p>
        )}
      </div>

      {/* Phase strip */}
      <div className="mb-8">
        <p className="section-label mb-4">Formation Phases</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PHASE_NAMES.map((name, idx) => (
            <PhaseCard
              key={idx + 1}
              phase={idx + 1}
              name={name}
              status={getPhaseStatus(idx + 1)}
            />
          ))}
        </div>
      </div>

      {/* Current session card */}
      <div className="card">
        <p className="section-label mb-4">Current Session — Phase {currentPhase}</p>
        {renderSessionCard()}
      </div>
    </div>
  );
}
