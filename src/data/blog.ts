// ToluAgb — Blog data
// v1: static posts defined here. Add a post by appending to this array.
// Body supports simple paragraphs (split on blank lines) — kept plain for v1.
// A future version can swap this for a CMS-backed feed without changing the page.

export interface BlogPost {
  slug:    string;
  title:   string;
  excerpt: string;
  date:    string;   // ISO yyyy-mm-dd
  readMin: number;
  tag?:    string;
  body:    string[];  // array of paragraphs
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug:    'symptoms-vs-roots',
    title:   'You are fixing symptoms, not roots',
    excerpt: 'Most of what we try to change is downstream of something we never look at. Here is how to find the actual root.',
    date:    '2026-05-20',
    readMin: 4,
    tag:     'Formation',
    body: [
      'Most problems people try to fix are symptoms. The missed deadline, the avoidable conflict, the decision reversed for the third time — these are not the problem. They are the visible edge of something underneath.',
      'When we treat the symptom, we get temporary relief and permanent recurrence. The behaviour comes back because the structure that produces it was never touched.',
      'Formation works differently. It asks a harder question first: what is the root condition that keeps producing this? And then it addresses that — patiently, structurally, at depth.',
      'This is slower. It is also the only thing that lasts.',
    ],
  },
  {
    slug:    'the-cost-of-becoming',
    title:   'The cost of becoming',
    excerpt: 'Real change is not free. It asks for something. Here is what it asks, and why it is worth paying.',
    date:    '2026-05-12',
    readMin: 5,
    tag:     'Character',
    body: [
      'There is a kind of change that costs nothing — the change of acquiring information. You read, you learn, you know more than you did. It is useful and it is cheap.',
      'And there is another kind that costs a great deal — the change of becoming a different person. This one asks for honesty you would rather avoid, discipline you would rather defer, and a willingness to be wrong about yourself.',
      'Almost everyone wants the second kind of change. Almost no one wants to pay for it. That gap is where most development efforts quietly die.',
      'The work is worth it. But it helps to know, going in, that it will ask for something real.',
    ],
  },
];
