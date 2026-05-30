'use client';
export const runtime = 'edge';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { coachingApi } from '@/lib/api';
import { saveParticipant } from '@/lib/auth';

export default function ParticipantLoginPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !dob || !orgCode.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await coachingApi.participant.login(fullName.trim(), dob, orgCode.trim().toUpperCase());
      saveParticipant({
        id: data.participant.id, fullName: data.participant.fullName,
        cohortId: data.participant.cohortId, currentPhase: data.participant.currentPhase,
        orgCode: data.participant.orgCode ?? orgCode.trim().toUpperCase(), token: data.token,
      });
      router.push('/portal/dashboard');
    } catch {
      setError("We couldn't find your record. Please check your details or contact your facilitator.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <span className="font-display font-semibold text-2xl text-black">Tolu Agb</span>
          </Link>
          <h1 className="section-title mb-2">Join Your Programme</h1>
          <p className="text-black/60 text-sm">Enter the details provided by your facilitator.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-black/10 p-8 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-black mb-1.5">Full Name</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="As registered in your programme"
              className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1.5">Date of Birth</label>
            <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)}
              className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1.5">Org Code</label>
            <input type="text" required value={orgCode} maxLength={6} onChange={(e) => setOrgCode(e.target.value.toUpperCase())} placeholder="e.g. ORG001"
              className="w-full border border-black/15 px-4 py-3 text-sm font-mono uppercase tracking-widest focus:outline-none focus:border-[#C9A84C] transition-colors" />
          </div>

          {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm leading-relaxed">{error}</div>}

          <button type="submit" disabled={loading || !fullName.trim() || !dob || !orgCode.trim()}
            className={`btn-primary w-full justify-center ${loading || !fullName.trim() || !dob || !orgCode.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}>
            {loading ? 'Verifying…' : 'Enter Programme'}
          </button>
        </form>

        <p className="text-center text-sm text-black/60 mt-6">
          Facilitator? <Link href="/facilitator/login" className="text-[#C9A84C] hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
