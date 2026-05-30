'use client';
export const runtime = 'edge';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { BLOG_POSTS } from '@/data/blog';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug   = params?.slug ?? '';
  const post   = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <SiteNav />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
          <p className="section-label mb-4">Not Found</p>
          <h1 className="section-title mb-4">This essay could not be found.</h1>
          <Link href="/blog" className="text-[#C9A84C] text-sm font-semibold hover:underline mt-4">← Back to the blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <article className="px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <Link href="/blog" className="eyebrow text-black/50 hover:text-black mb-10 inline-block">← All essays</Link>

          <div className="flex items-center gap-3 mb-5">
            {post.tag && <span className="eyebrow text-[#C9A84C]">{post.tag}</span>}
            <span className="text-xs text-black/40">{fmtDate(post.date)} · {post.readMin} min read</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-semibold text-black leading-tight mb-8">{post.title}</h1>

          <div className="prose-tolu space-y-6">
            {post.body.map((para, i) => (
              <p key={i} className="text-lg text-black/80 leading-relaxed">{para}</p>
            ))}
          </div>

          <div className="mt-16 pt-10 border-t border-black/10">
            <p className="section-label mb-3">Work With Me</p>
            <p className="text-black/70 leading-relaxed mb-6">
              If this resonates, the next step is the needs assessment. Ten minutes to identify the root gap and the right programme.
            </p>
            <Link href="/coaching/diagnostic" className="btn-gold">Take the Needs Assessment →</Link>
          </div>
        </div>
      </article>

      <SiteFooter />
    </div>
  );
}
