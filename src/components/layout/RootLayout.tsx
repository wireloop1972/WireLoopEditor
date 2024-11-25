import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => (
  <div className="min-h-screen bg-black relative">
    <div className="fixed inset-0 z-0">
      <Image
        src="/images/wireloop-wide.png"
        alt="Wire Loop Background"
        fill
        className="object-cover opacity-40"
        priority
      />
    </div>
    <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-orange-500/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-4">
              <Image
                src="/images/wireloop_blended_final.jpeg"
                alt="Wire Loop Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <h1 className="text-xl font-bold text-orange-500">Wire Loop</h1>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/assistants" 
              className="text-orange-200/80 hover:text-orange-500 transition-colors"
            >
              Assistants
            </Link>
            <Link 
              href="/agents" 
              className="text-orange-200/80 hover:text-orange-500 transition-colors"
            >
              Agents
            </Link>
            <Link 
              href="/runtime" 
              className="text-orange-200/80 hover:text-orange-500 transition-colors"
            >
              Runtime
            </Link>
          </div>
        </div>
      </nav>
    </header>
    <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  </div>
);

export default RootLayout; 