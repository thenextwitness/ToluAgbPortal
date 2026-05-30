import Link from 'next/link';

const LINKS = [
  {
    heading: 'Coaching',
    items: [
      { label: 'How It Works',       href: '/coaching' },
      { label: 'Needs Assessment',   href: '/coaching/diagnostic' },
      { label: 'Programme Catalogue', href: '/coaching/programmes' },
      { label: 'Book a Session',     href: '/coaching/diagnostic' },
    ],
  },
  {
    heading: 'More',
    items: [
      { label: 'Blog',     href: '/blog'    },
      { label: 'Books',    href: '/books'   },
      { label: 'Contact',  href: '/contact' },
    ],
  },
  {
    heading: 'Portals',
    items: [
      { label: 'Participant Login',  href: '/portal/login'      },
      { label: 'Facilitator Login',  href: '/facilitator/login' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="md:col-span-1">
            <p className="font-display text-2xl font-semibold text-white mb-3">Tolu Agb</p>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Developing people who transform organisations. Coaching, books, and resources.
            </p>
          </div>

          {/* Link columns */}
          {LINKS.map(col => (
            <div key={col.heading}>
              <h4 className="eyebrow text-white/40 mb-4">{col.heading}</h4>
              <ul className="flex flex-col gap-3">
                {col.items.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-white/60 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-5 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Tolu Agb. All rights reserved.</span>
          <a href="https://toluagb.com" className="hover:text-white transition-colors">toluagb.com</a>
        </div>
      </div>
    </footer>
  );
}
