'use client';
export const runtime = 'edge';

import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

const CHANNELS = [
  { label: 'General Enquiries',   value: 'hello@toluagb.com',   href: 'mailto:hello@toluagb.com',   note: 'Coaching, programmes, speaking, and everything else' },
  { label: 'Bookings & Partnerships', value: 'work@toluagb.com', href: 'mailto:work@toluagb.com',  note: 'Organisational engagements and partnership enquiries' },
];

const TOPICS = [
  'Booking a coaching programme for yourself or your team',
  'Bringing a programme into your organisation',
  'Speaking and workshop requests',
  'Questions about the books',
  'Media and interviews',
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <section className="bg-black text-white px-6 md:px-10 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-5">Contact</p>
          <h1 className="hero-title text-white max-w-3xl mb-6">Let&apos;s start a conversation.</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            Whether you&apos;re exploring coaching, bringing a programme into your organisation,
            or just want to reach out — I&apos;d like to hear from you.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 md:px-10 py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* Left — channels + topics */}
          <div>
            <p className="section-label mb-4">How to Reach Me</p>
            <h2 className="section-title mb-8">Direct channels</h2>

            <div className="flex flex-col gap-0.5 mb-12">
              {CHANNELS.map(ch => (
                <a key={ch.label} href={ch.href}
                  className="bg-[#FAF6EF] hover:bg-white border-l-[3px] border-transparent hover:border-[#C9A84C] px-5 py-4 flex items-start gap-4 transition-all">
                  <span className="text-[#C9A84C] text-base flex-shrink-0 mt-0.5">✉</span>
                  <div>
                    <p className="eyebrow text-[#C9A84C] mb-0.5">{ch.label}</p>
                    <p className="text-sm text-black font-medium">{ch.value}</p>
                    <p className="text-xs text-black/50 mt-0.5">{ch.note}</p>
                  </div>
                </a>
              ))}
            </div>

            <p className="section-label mb-3">What You Can Ask About</p>
            <div className="flex flex-col gap-0.5">
              {TOPICS.map(t => (
                <div key={t} className="bg-[#FAF6EF] hover:bg-white border-l-[3px] border-transparent hover:border-[#C9A84C] px-5 py-3 flex items-center gap-3 transition-all">
                  <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full flex-shrink-0" />
                  <span className="text-sm text-black">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div>
            <div className="bg-[#FAF6EF] px-8 md:px-10 py-12 border-t-[3px] border-[#C9A84C]">
              <h3 className="font-display text-2xl font-semibold text-black mb-7">Send a message</h3>
              <form action="mailto:hello@toluagb.com" method="POST" encType="text/plain" className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first-name" className="block eyebrow text-black/60 mb-2">First Name</label>
                    <input id="first-name" name="First Name" type="text" required placeholder="Your first name"
                      className="w-full px-4 py-3 text-sm bg-white border border-black/15 focus:border-[#C9A84C] focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block eyebrow text-black/60 mb-2">Last Name</label>
                    <input id="last-name" name="Last Name" type="text" required placeholder="Your last name"
                      className="w-full px-4 py-3 text-sm bg-white border border-black/15 focus:border-[#C9A84C] focus:outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block eyebrow text-black/60 mb-2">Email Address</label>
                  <input id="email" name="Email" type="email" required placeholder="your@email.com"
                    className="w-full px-4 py-3 text-sm bg-white border border-black/15 focus:border-[#C9A84C] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label htmlFor="subject" className="block eyebrow text-black/60 mb-2">Subject</label>
                  <select id="subject" name="Subject" required defaultValue=""
                    className="w-full px-4 py-3 text-sm bg-white border border-black/15 focus:border-[#C9A84C] focus:outline-none transition-colors">
                    <option value="" disabled>Select a subject</option>
                    <option value="Coaching">Coaching for myself or my team</option>
                    <option value="Organisation">Bringing a programme into my organisation</option>
                    <option value="Speaking">Speaking / workshop request</option>
                    <option value="Books">Questions about the books</option>
                    <option value="Media">Media / interview</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block eyebrow text-black/60 mb-2">Message</label>
                  <textarea id="message" name="Message" required rows={5} placeholder="Tell me what you'd like to discuss…"
                    className="w-full px-4 py-3 text-sm bg-white border border-black/15 focus:border-[#C9A84C] focus:outline-none transition-colors resize-y" />
                </div>
                <button type="submit" className="btn-gold w-full justify-center">Send Message ✉</button>
                <p className="text-xs text-black/50 leading-relaxed">
                  This opens your email client with a pre-filled message. Or email me directly at{' '}
                  <a href="mailto:hello@toluagb.com" className="text-[#9E7F2E] hover:underline">hello@toluagb.com</a>.
                </p>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 bg-black/10 mt-0.5">
              <Link href="/coaching" className="bg-[#FAF6EF] hover:bg-white border-t-[3px] border-transparent hover:border-[#C9A84C] p-6 transition-all block">
                <p className="eyebrow text-[#C9A84C] mb-1">Coaching</p>
                <p className="font-display text-base font-semibold text-black mb-1">Explore Programmes</p>
                <p className="text-xs text-black/60">See how the programmes work.</p>
              </Link>
              <Link href="/coaching/diagnostic" className="bg-[#FAF6EF] hover:bg-white border-t-[3px] border-transparent hover:border-[#C9A84C] p-6 transition-all block">
                <p className="eyebrow text-[#C9A84C] mb-1">Start Here</p>
                <p className="font-display text-base font-semibold text-black mb-1">Needs Assessment</p>
                <p className="text-xs text-black/60">Ten minutes to find the right fit.</p>
              </Link>
            </div>
          </div>

        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
