// ToluAgb — Bookstore data
// v1: static listing. Add a book by appending to this array and redeploying.
// Cover images go in /public/assets/books/<slug>.jpg

export interface Book {
  slug:        string;
  title:       string;
  subtitle?:   string;
  year?:       string;
  cover?:      string;        // path under /public, e.g. '/assets/books/title.jpg'
  description: string;
  status:      'available' | 'coming-soon';
  links?: {
    label: string;
    href:  string;
  }[];
}

export const BOOKS: Book[] = [
  {
    slug:        'placeholder-one',
    title:       'The Inner Architecture',
    subtitle:    'Why character determines what a person becomes',
    year:        '2026',
    description: 'A practical examination of the interior structure that shapes every decision, relationship, and outcome — and how to rebuild it deliberately. (Placeholder — replace with real book data.)',
    status:      'coming-soon',
  },
  {
    slug:        'placeholder-two',
    title:       'Formed, Not Informed',
    subtitle:    'The difference between learning and becoming',
    year:        '2026',
    description: 'Information transfer changes what you know. Formation changes who you are. This book is about the second kind of change — and why most development efforts never reach it. (Placeholder — replace with real book data.)',
    status:      'coming-soon',
  },
];
