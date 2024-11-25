import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import RootLayout from '@/components/layout/RootLayout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Wire Loop - AI Assistants & Automation',
  description: 'Create, deploy, and manage intelligent AI assistants and automation agents with Wire Loop\'s powerful runtime environment.',
  icons: {
    icon: '/images/wirefav.ico',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black`}>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
