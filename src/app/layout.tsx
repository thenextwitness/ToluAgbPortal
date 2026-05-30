import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tolu Agb',
  description: 'Developing people who transform organisations. Coaching, programmes, and resources from Tolu Agb.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
