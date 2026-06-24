// ToluAgb Portal — API client
// All endpoints point to the shared Railway backend.
// Route paths are identical to PurposeWorldPortal (/api/world/*).

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  return json as T;
}

export const coachingApi = {
  participant: {
    login: (fullName: string, dob: string, orgCode: string) =>
      request<{
        token: string;
        participant: {
          id: string; fullName: string; cohortId: string;
          currentPhase: number; isComplete: boolean; orgCode?: string;
          cohort: { programName: string; signalCode: string; signalCluster: string; startDate: string };
        };
      }>('/api/world/participant/login', { method: 'POST', body: JSON.stringify({ fullName, dob, orgCode }) }),

    getProfile: (participantId: string, token: string) =>
      request<{
        id: string; fullName: string; cohortId: string; currentPhase: number;
        orgCode: string; orgName?: string; facilitatorName?: string;
        signalCode?: string; programName?: string;
      }>(`/api/world/participant/${participantId}`, {}, token),

    getCohort: (cohortId: string) =>
      request<{
        id: string; programName: string; signalCode: string; orgName: string;
        facilitatorName: string; participantCount: number; currentPhase: number;
        participants: Array<{ id: string; fullName: string; currentPhase: number; isComplete: boolean; orgCode: string }>;
        sessions: Array<{ id: string; phase: number; scheduledAt: string; sessionMode?: string; isComplete: boolean; attendanceCount: number; liveKitRoomName?: string }>;
      }>(`/api/world/cohort/${cohortId}`),

    listSessions: (cohortId: string) =>
      request<Array<{ id: string; phase: number; scheduledAt: string; isComplete: boolean }>>(
        `/api/world/cohort/${cohortId}/sessions`
      ),

    getSession: (sessionId: string) =>
      request<{ id: string; phase: number; scheduledAt: string; isComplete: boolean; phaseName?: string; phaseDescription?: string }>(
        `/api/world/session/${sessionId}`
      ),

    submitReflection: (participantId: string, phase: number, responses: Record<string, string>, token: string) =>
      request<{ success: boolean }>(
        `/api/world/participant/${participantId}/reflection`,
        { method: 'POST', body: JSON.stringify({ phase, responses }) },
        token
      ),

    submitPractice: (participantId: string, phase: number, response: string, token: string) =>
      request<{ success: boolean }>(
        `/api/world/participant/${participantId}/practice`,
        { method: 'POST', body: JSON.stringify({ phase, response }) },
        token
      ),

    getLiveKitToken: (participantId: string, sessionId: string, token: string) =>
      request<{ token: string; roomName: string; livekitUrl: string }>(
        `/api/world/participant/${participantId}/livekit-token`,
        { method: 'POST', body: JSON.stringify({ sessionId }) },
        token
      ),

    submitTestimony: (participantId: string, cohortId: string, content: string, token: string) =>
      request<{ success: boolean }>(
        '/api/world/testimony',
        { method: 'POST', body: JSON.stringify({ participantId, cohortId, content }) },
        token
      ),
  },

  facilitator: {
    login: (email: string, password: string) =>
      request<{ id: string; name: string; email: string; certificationLevel: number; token: string }>(
        '/api/world/facilitator/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      ),

    dashboard: (token: string) =>
      request<{
        cohorts: Array<{
          id: string; programName: string; orgName: string; participantCount: number;
          signalCode: string; currentPhase: number; nextSessionDate?: string; nextSessionId?: string;
          participants?: Array<{ id: string; fullName: string }>;
        }>;
        upcomingSession?: { id: string; cohortName: string; scheduledAt: string; participants: Array<{ id: string; fullName: string }> };
      }>('/api/world/facilitator/dashboard', {}, token),

    startSession: (token: string, sessionId: string) =>
      request<{ success: boolean }>(`/api/world/session/${sessionId}/start`, { method: 'POST' }, token),

    completeSession: (token: string, sessionId: string) =>
      request<{ success: boolean }>(`/api/world/session/${sessionId}/complete`, { method: 'POST' }, token),

    recordAttendance: (token: string, sessionId: string, data: unknown) =>
      request<{ success: boolean }>(`/api/world/session/${sessionId}/attendance`, { method: 'POST', body: JSON.stringify(data) }, token),
  },

  programmes: {
    list: () =>
      request<any>('/api/world/signals').then((d: any) => Array.isArray(d) ? d : (d.signals ?? [])),

    getByCode: (code: string) =>
      request<{
        signalCode: string; worldTitle: string; worldSubtitle: string | null;
        problemHook: string; primaryDomain: string; secondaryDomains: string | null;
        fruitOutcomes: string; deploymentSettings: string; targetAudiences: string;
        tier1Description: string | null; tier2Description: string | null; tier3Description: string | null;
        rehabilitationContexts: string | null; preventiveContexts: string | null; isActive: boolean;
      }>(`/api/world/signals/${code}`),
  },

  diagnostic: {
    fetchQuestions: (institutionType: string) =>
      request<{
        institutionType: string;
        questions: Array<{ questionKey: string; institutionType: string; category: string; questionText: string; orderIndex: number; scaleType: string }>;
      }>(`/api/world/diagnostic-questions?institutionType=${encodeURIComponent(institutionType)}`),

    submit: (data: { institutionType: string; responses: Record<string, number>; contactName?: string; contactEmail?: string; organizationName?: string; cfTurnstileToken?: string }) =>
      request<{ submissionId: string; bookingToken?: string; bookingUrl?: string; discoveryDurationMin?: number; status?: string }>(
        '/api/world/diagnostic/submit',
        { method: 'POST', body: JSON.stringify(data) }
      ),
  },

  booking: {
    getContext: (token: string) =>
      fetch(`${API_BASE}/api/world/booking/${token}`)
        .then(async r => {
          if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error((b as any).error ?? 'Booking link not valid'); }
          return r.json();
        }),

    create: (token: string, data: { slotDateUtc: string; contactName: string; contactEmail: string; contactPhone?: string; orgName: string; notes?: string }) =>
      request<{ bookingId: string; status: string }>(`/api/world/booking/${token}`, { method: 'POST', body: JSON.stringify(data) }),

    getById: (bookingId: string) =>
      request<{ id: string; slotDate: string; durationMin: number; status: string; orgName: string; contactName: string; contactEmail: string; signalCode: string | null; meetingLink: string | null }>(
        `/api/world/booking/by-id/${bookingId}`
      ),
  },

  plan: {
    get: (token: string) =>
      request<{
        plan: {
          id: string; signalCode: string; audienceType: string; contactName: string;
          isPaid: boolean; sessionCount: number; sessionDurationMin: number;
          ratePerSessionMinor: number; currency: string; totalMinor: number;
          status: string; recommendationNote: string | null;
        };
        programme: { signalCode: string; worldTitle: string; worldSubtitle: string | null; problemHook: string; primaryDomain: string; fruitOutcomes: string } | null;
      }>(`/api/world/plan/${token}`),

    accept: (token: string, sessionCount?: number) =>
      request<{ plan: any; nextStatus: string }>(
        `/api/world/plan/${token}/accept`,
        { method: 'POST', body: JSON.stringify(sessionCount != null ? { sessionCount } : {}) }
      ),
  },
};

export { API_BASE };
