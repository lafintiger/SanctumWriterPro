import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SanctumWriter Pro',
  description: 'AI writing companion powered by frontier models - GPT-4, Claude, Gemini, Grok & more',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

