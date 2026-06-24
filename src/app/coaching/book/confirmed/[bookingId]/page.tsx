'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://purpose-formation-api-production.up.railway.app';

interface Booking {
  id: string; slotDate: string; durationMin: number; status: string;
  orgName: string; contactName: string; contactEmail: string;
  signalCode: string | null; meetingLink: string | null;
}

export default function BookingConfirmedPage() {
  const params = useParams<{ bookingId: string }>();
  const id     = params?.bookingId ?? '';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/world/booking/by-id/${id}`)
      .then(async r => { if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error ?? 'Booking not found'); } return r.json(); })
      .then(setBooking)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <SiteNav />
        <div className="px-8 py-20 max-w-3xl mx-auto space-y-4">
          <div className="h-3 w-24 bg-black/10 animate-pulse" />
          <div className="h-8 w-2/3 bg-black/10 animate-pulse" />
          <div className="h-4 w-full bg-black/10 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <SiteNav />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
          <p className="section-label mb-4">Booking Not Found</p>
          <h1 className="section-title mb-4">{error || 'This booking could not be loaded.'}</h1>
          <Link href="/" className="text-[#C9A84C] text-sm font-semibold hover:underline mt-4">← Return home</Link>
        </div>
      </div>
    );
  }

  const slot    = new Date(booking.slotDate);
  const dateStr = slot.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Lagos' });
  const timeStr = slot.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' });
  const isCancelled = booking.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <section className="bg-black text-white px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="section-label text-white/50 mb-5">{isCancelled ? 'Booking Cancelled' : 'Booking Confirmed'}</p>
          <h1 className="hero-title text-white text-center mb-5">{isCancelled ? 'Cancelled' : "You're booked."}</h1>
          {!isCancelled && (
            <p className="text-white/70 leading-relaxed max-w-xl mx-auto">
              A confirmation email with a calendar invitation has been sent to <strong>{booking.contactEmail}</strong>.
            </p>
          )}
        </div>
      </section>

      <section className="bg-white px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="border-l-4 border-[#C9A84C] pl-6 py-2 mb-10">
            <p className="section-label mb-1">Discovery Call · 30 minutes</p>
            <p className="text-2xl md:text-3xl font-display font-semibold text-black leading-tight">{dateStr}</p>
            <p className="text-xl text-black mt-1 font-semibold">{timeStr} <span className="text-sm font-normal text-black/60">Africa/Lagos</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div><p className="section-label mb-2">Organisation</p><p className="text-sm text-black">{booking.orgName}</p></div>
            <div><p className="section-label mb-2">Contact</p><p className="text-sm text-black">{booking.contactName}</p><p className="text-sm text-black">{booking.contactEmail}</p></div>
          </div>

          {booking.meetingLink && (
            <div className="mb-12 bg-[#FAF6EF] border-l-4 border-[#C9A84C] p-6">
              <p className="section-label mb-2">Video Link</p>
              <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-[#9E7F2E] hover:underline break-all">{booking.meetingLink}</a>
            </div>
          )}

          <div className="border-t border-black/10 pt-10">
            <p className="section-label mb-4">What to Expect</p>
            <p className="text-black/80 leading-relaxed mb-3">
              A focused, 30-minute conversation. We&apos;ll review your assessment findings, confirm the
              recommended programme is the right fit, and align on dates for the full programme.
            </p>
            <p className="text-black/80 leading-relaxed">Please come ready to discuss your context and the people who would participate.</p>
          </div>

          <div className="mt-12 pt-10 border-t border-black/10 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <Link href="/" className="text-sm font-semibold text-black hover:text-[#C9A84C] transition-colors">← Return home</Link>
            <p className="text-xs text-black/50">
              Need to reschedule? Reply to the email or contact <a href="mailto:hello@toluagb.com" className="text-[#9E7F2E] hover:underline">hello@toluagb.com</a>
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
