// Participant session
export interface ParticipantSession {
  id: string;
  fullName: string;
  cohortId: string;
  currentPhase: number;
  orgCode: string;
  /** JWT bound to participant.id + cohort.id. Sent as Bearer on protected calls. */
  token: string;
}

export function saveParticipant(data: ParticipantSession) {
  localStorage.setItem('ta_participant', JSON.stringify(data));
}

export function getParticipant(): ParticipantSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('ta_participant');
  return raw ? JSON.parse(raw) : null;
}

export function getParticipantToken(): string | undefined {
  return getParticipant()?.token;
}

export function clearParticipant() {
  localStorage.removeItem('ta_participant');
}

export function isParticipantAuthenticated() {
  return !!getParticipantToken();
}

// Facilitator session
export interface FacilitatorSession {
  id: string;
  name: string;
  email: string;
  certificationLevel: number;
  token: string;
}

export function saveFacilitator(data: FacilitatorSession) {
  localStorage.setItem('ta_facilitator', JSON.stringify(data));
}

export function getFacilitator(): FacilitatorSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('ta_facilitator');
  return raw ? JSON.parse(raw) : null;
}

export function clearFacilitator() {
  localStorage.removeItem('ta_facilitator');
}

export function isFacilitatorAuthenticated() {
  return !!getFacilitator();
}
