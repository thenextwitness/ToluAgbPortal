'use client';
export const runtime = 'edge';

import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { BOOKS } from '@/data/books';

export default function BooksPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <section className="bg-black text-white px-6 md:px-10 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-5">Books</p>
          <h1 className="hero-title text-white max-w-3xl mb-6">Writing on character, leadership, and becoming.</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            Practical, rooted books on the inner work that determines what a person becomes.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 md:px-10 py-20">
        <div className="max-w-5xl mx-auto">
          {BOOKS.length === 0 ? (
            <p className="text-black/60 text-center py-20">Books are on the way. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {BOOKS.map(book => (
                <div key={book.slug} className="flex gap-6 border border-black/10 p-6 hover:border-black/30 transition-colors">
                  {/* Cover */}
                  <div className="w-28 flex-shrink-0">
                    {book.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.cover} alt={book.title} className="w-full aspect-[2/3] object-cover bg-[#F2EAD9]" />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-[#F2EAD9] border border-black/10 flex items-center justify-center">
                        <span className="font-display text-3xl text-[#C9A84C]">{book.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  {/* Detail */}
                  <div className="flex flex-col flex-1 min-w-0">
                    {book.status === 'coming-soon' && (
                      <span className="eyebrow text-[#C9A84C] mb-2">Coming Soon</span>
                    )}
                    <h2 className="font-display text-2xl font-semibold text-black leading-tight">{book.title}</h2>
                    {book.subtitle && <p className="text-sm italic text-black/60 mt-1">{book.subtitle}</p>}
                    <p className="text-sm text-black/70 leading-relaxed mt-4 flex-1">{book.description}</p>
                    {book.links && book.links.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-5">
                        {book.links.map(l => (
                          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-bold tracking-widest uppercase border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors">
                            {l.label}
                          </a>
                        ))}
                      </div>
                    )}
                    {book.status === 'coming-soon' && (
                      <p className="text-xs text-black/40 mt-5">Available {book.year ?? 'soon'}.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
