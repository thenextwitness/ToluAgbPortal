'use client';
export const runtime = 'edge';

import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { BLOG_POSTS } from '@/data/blog';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <section className="bg-black text-white px-6 md:px-10 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-5">Writing</p>
          <h1 className="hero-title text-white max-w-3xl mb-6">Essays on formation, purpose, and becoming.</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            New thinking on the inner work that shapes a life — published regularly.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 md:px-10 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          {posts.length === 0 ? (
            <p className="text-black/60 text-center py-20">No posts yet. Check back soon.</p>
          ) : (
            <div className="divide-y divide-black/10">
              {posts.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group block py-10 first:pt-0">
                  <div className="flex items-center gap-3 mb-3">
                    {post.tag && <span className="eyebrow text-[#C9A84C]">{post.tag}</span>}
                    <span className="text-xs text-black/40">{fmtDate(post.date)} · {post.readMin} min read</span>
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-black leading-tight group-hover:text-[#9E7F2E] transition-colors">{post.title}</h2>
                  <p className="text-black/70 leading-relaxed mt-3">{post.excerpt}</p>
                  <span className="inline-block mt-4 text-sm font-semibold text-black group-hover:text-[#C9A84C] transition-colors">Read essay →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
