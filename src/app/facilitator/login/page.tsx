'use client';
export const runtime = 'edge';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { coachingApi } from '@/lib/api';
import { saveFacilitator } from '@/lib/auth';

export default function FacilitatorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError('');

    try {
      const data = await coachingApi.facilitator.login(email.trim(), password);
      saveFacilitator({
        id: data.id,
        name: data.name,
        email: data.email,
        certificationLevel: data.certificationLevel,
        token: data.token,
      });
      router.push('/facilitator/dashboard');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <span className="font-display font-semibold text-2xl text-white">
              Tolu Agb <span className="text-[#C9A84C] text-xs uppercase tracking-widest font-label ml-1">Facilitator</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2 font-display">Facilitator Sign In</h1>
          <p className="text-white/60 text-sm">
            Access your cohort management portal.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-8 flex flex-col gap-5"
        >
          <div>
            <label className="block text-sm font-medium text-black mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-black/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-black/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm leading-relaxed">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className={`btn-primary w-full text-center ${
              loading || !email.trim() || !password
                ? 'opacity-40 cursor-not-allowed'
                : ''
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-black mt-6">
          Participant?{' '}
          <Link href="/portal/login" className="text-[#C9A84C] hover:underline">
            Join your program here
          </Link>
        </p>
      </div>
    </div>
  );
}
