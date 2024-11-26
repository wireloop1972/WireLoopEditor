'use client';

import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-orange-500 sm:text-7xl">
          Welcome to Wire Loop
        </h1>
        <p className="mt-6 text-lg leading-8 text-orange-200/80">
          Empowering the future with intelligent AI assistants and seamless automation
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/agents">
            <Button size="lg">Get Started with Agents</Button>
          </Link>
          <Link href="/assistants">
            <Button variant="outline" size="lg">Explore Assistants</Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-orange-200/60">
        <Link 
          href="/assistants"
          className="group p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20 hover:bg-black/60 hover:border-orange-500/40 transition-all duration-300"
        >
          <h3 className="text-xl font-semibold text-orange-500 mb-3 group-hover:text-orange-400">Assistants</h3>
          <p>Create, train, and deploy custom AI assistants tailored to your needs. Our platform enables seamless integration of natural language processing and machine learning capabilities for intelligent interactions.</p>
        </Link>
        <Link 
          href="/agents"
          className="group p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20 hover:bg-black/60 hover:border-orange-500/40 transition-all duration-300"
        >
          <h3 className="text-xl font-semibold text-orange-500 mb-3 group-hover:text-orange-400">Agent Swarm</h3>
          <p>Experience the power of collaborative AI with our agent swarm technology. Multiple specialized agents work together seamlessly to solve complex tasks, adapting and learning from each interaction.</p>
        </Link>
        <Link 
          href="/runtime"
          className="group p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20 hover:bg-black/60 hover:border-orange-500/40 transition-all duration-300"
        >
          <h3 className="text-xl font-semibold text-orange-500 mb-3 group-hover:text-orange-400">Runtime</h3>
          <p>A powerful execution environment that connects assistants, agents, and your systems seamlessly. Built for reliability, speed, and scalability across diverse computing environments.</p>
        </Link>
      </section>
    </div>
  );
}
