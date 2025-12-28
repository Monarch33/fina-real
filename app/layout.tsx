import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FINA - AI Finance Interview Coach',
  description: 'Master finance interviews with AI-powered preparation for Goldman Sachs, Morgan Stanley, JP Morgan, and top hedge funds.',
  keywords: 'finance interview, investment banking, trading, Goldman Sachs, Morgan Stanley, interview prep',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
