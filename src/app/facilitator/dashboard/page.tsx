'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { coachingApi } from '@/lib/api';
import { getFacilitator } from '@/lib/auth';
import { format } from 'date-fns';
import Link from 'next/link';

type Cohort = {
  id: string;
  programName: string;
  orgName: string;
  participantCount: number;
  signalCode: string;
  currentPhase: number;
  nextSessionDate?: string;
  nextSessionId?: string;
  participants?: Array<{ id: string; fullName: string }>;
};

type UpcomingSession = {
  id: string;
  cohortName: string;
  scheduledAt: string;
  participants: Array<{ id: string; fullName: string }>;
};

type AttendanceRecord = Record<string, 'Present' | 'Late' | 'Absent'>;

export default function FacilitatorDashboardPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [upcomingSession, setUpcomingSession] = useState<UpcomingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Session actions
  const [startingSession, setStartingSession] = useState('');
  const [completingSession, setCompletingSession] = useState('');

  // Attendance state
  const [attendanceSessionId, setAttendanceSessionId] = useState('');
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [submittingAttendance, setSubmittingAttendance] = useState(false);
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);

  const facilitator = getFacilitator();

  useEffect(() => {
    if (!facilitator) return;

    async function load() {
      if (!facilitator) return;
      try {
        const data = await coachingApi.facilitator.dashboard(facilitator.token);
        setCohorts(data.cohorts ?? []);
        setUpcomingSession(data.upcomingSession ?? null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load dashboard.'
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleStartSession(sessionId: string) {
    if (!facilitator) return;
    setStartingSession(sessionId);
    try {
      await coachingApi.facilitator.startSession(facilitator.token, sessionId);
      const data = await coachingApi.facilitator.dashboard(facilitator.token);
      setCohorts(data.cohorts ?? []);
      setUpcomingSession(data.upcomingSession ?? null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start session.');
    } finally {
      setStartingSession('');
    }
  }

  async function handleCompleteSession(sessionId: string) {
    if (!facilitator) return;
    setCompletingSession(sessionId);
    try {
      await coachingApi.facilitator.completeSession(facilitator.token, sessionId);
      const data = await coachingApi.facilitator.dashboard(facilitator.token);
      setCohorts(data.cohorts ?? []);
      setUpcomingSession(data.upcomingSession ?? null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to complete session.');
    } finally {
      setCompletingSession('');
    }
  }

  function openAttendance(sessionId: string, participants: Array<{ id: string; fullName: string }>) {
    const initial: AttendanceRecord = {};
    participants.forEach((p) => {
      initial[p.id] = 'Present';
    });
    setAttendance(initial);
    setAttendanceSessionId(sessionId);
    setAttendanceSuccess(false);
  }

  async function submitAttendance() {
    if (!facilitator || !attendanceSessionId) return;
    setSubmittingAttendance(true);
    try {
      await coachingApi.facilitator.recordAttendance(
        facilitator.token,
        attendanceSessionId,
        { attendance }
      );
      setAttendanceSuccess(true);
      setAttendanceSessionId('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to record attendance.');
    } finally {
      setSubmittingAttendance(false);
    }
  }

  const PHASE_NAMES = ['Foundation', 'Formation', 'Consecration', 'Expression'];

  if (loading) {
    return (
      <div className="px-6 py-16 flex items-center justify-center">
        <div className="text-black text-sm">Loading your dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-16 max-w-3xl mx-auto">
        <div className="card border-red-200 bg-red-50 text-red-700">
          <p className="font-medium mb-1">Could not load dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="section-label mb-1">Facilitator Portal</p>
        <h1 className="page-title">Your Dashboard</h1>
      </div>

      {/* Upcoming session highlight */}
      {upcomingSession && (
        <div className="bg-black text-white rounded-xl p-6 mb-8">
          <p className="eyebrow text-[#C9A84C] mb-3">Upcoming Session</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-lg">{upcomingSession.cohortName}</h3>
              <p className="text-white/70 text-sm mt-1">
                Scheduled:{' '}
                <span className="font-medium text-white">
                  {format(new Date(upcomingSession.scheduledAt), "EEEE, MMMM d 'at' h:mm a")}
                </span>
              </p>
              <p className="text-white/50 text-xs mt-1">
                {upcomingSession.participants.length} participant
                {upcomingSession.participants.length !== 1 ? 's' : ''} registered
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleStartSession(upcomingSession.id)}
                disabled={startingSession === upcomingSession.id}
                className={`bg-[#C9A84C] text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#9E7F2E] transition-colors ${
                  startingSession === upcomingSession.id ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                {startingSession === upcomingSession.id ? 'Starting...' : 'Start Session'}
              </button>
              <button
                onClick={() => handleCompleteSession(upcomingSession.id)}
                disabled={completingSession === upcomingSession.id}
                className={`bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#F2EAD9] transition-colors ${
                  completingSession === upcomingSession.id ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                {completingSession === upcomingSession.id ? 'Completing...' : 'Complete Session'}
              </button>
              <button
                onClick={() => openAttendance(upcomingSession.id, upcomingSession.participants)}
                className="border border-white/30 text-white/80 hover:text-white hover:border-white/50 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Attendance
              </button>
            </div>
          </div>

          {/* Inline attendance form */}
          {attendanceSessionId === upcomingSession.id && (
            <div className="mt-6 border-t border-white/15 pt-6">
              <h4 className="font-semibold text-white mb-4">Record Attendance</h4>
              {attendanceSuccess && (
                <div className="p-3 bg-green-900 border border-green-700 rounded-lg text-green-300 text-sm mb-4">
                  Attendance recorded successfully.
                </div>
              )}
              <div className="flex flex-col gap-3">
                {upcomingSession.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-4 bg-black rounded-lg px-4 py-3"
                  >
                    <span className="text-sm font-medium text-white">{p.fullName}</span>
                    <div className="flex gap-3">
                      {(['Present', 'Late', 'Absent'] as const).map((status) => (
                        <label key={status} className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`att-${p.id}`}
                            value={status}
                            checked={attendance[p.id] === status}
                            onChange={() =>
                              setAttendance((prev) => ({ ...prev, [p.id]: status }))
                            }
                            className="accent-[#C9A84C]"
                          />
                          <span className="text-xs text-white/80">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={submitAttendance}
                  disabled={submittingAttendance}
                  className={`bg-[#C9A84C] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#9E7F2E] transition-colors ${
                    submittingAttendance ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  {submittingAttendance ? 'Saving...' : 'Save Attendance'}
                </button>
                <button
                  onClick={() => setAttendanceSessionId('')}
                  className="border border-white/30 text-white/80 hover:text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active cohorts */}
      <div>
        <p className="section-label mb-4">Active Cohorts</p>

        {cohorts.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="font-semibold text-black mb-2">No active cohorts</h3>
            <p className="text-black text-sm leading-relaxed max-w-sm mx-auto">
              Contact your administrator to be assigned to a program.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cohorts.map((cohort) => (
              <div
                key={cohort.id}
                className="card hover:border-[#C9A84C] hover:shadow-md transition-all border-2 border-transparent"
              >
                {/* Cohort header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="section-label text-xs mb-1">{cohort.signalCode}</p>
                    <h3 className="font-bold text-black text-lg leading-tight">
                      {cohort.programName}
                    </h3>
                    <p className="text-black text-sm">{cohort.orgName}</p>
                  </div>
                  <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-3" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
                    Phase {cohort.currentPhase}
                  </span>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-black mb-4">
                  <span>
                    👥 {cohort.participantCount} participant
                    {cohort.participantCount !== 1 ? 's' : ''}
                  </span>
                  <span>
                    📍{' '}
                    {PHASE_NAMES[cohort.currentPhase - 1] ?? `Phase ${cohort.currentPhase}`}
                  </span>
                </div>

                {/* Next session */}
                {cohort.nextSessionDate && (
                  <p className="text-xs text-black mb-4">
                    Next session:{' '}
                    <span className="font-medium text-black">
                      {format(new Date(cohort.nextSessionDate), "MMM d 'at' h:mm a")}
                    </span>
                  </p>
                )}

                {/* Manage link */}
                <Link
                  href={`/facilitator/cohort/${cohort.id}`}
                  className="text-[#C9A84C] text-sm font-medium hover:underline"
                >
                  Manage cohort →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
