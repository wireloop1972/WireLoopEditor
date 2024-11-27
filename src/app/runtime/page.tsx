'use client';

import Link from 'next/link';
import { Terminal, MessageSquare, Activity, Settings } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function RuntimePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-orange-500">Wire Loop Runtime</h1>
        <p className="text-orange-200/80 max-w-2xl mx-auto">
          A powerful execution environment that orchestrates AI agents, manages context, and handles complex interactions.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-orange-500">Console</h3>
          </div>
          <p className="text-orange-200/60 mb-4">
            Monitor and control runtime operations through an interactive console.
          </p>
          <Link href="/runtime/console">
            <Button variant="outline" size="sm" className="w-full">
              Open Console
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-orange-500">Chat</h3>
          </div>
          <p className="text-orange-200/60 mb-4">
            Interact with the runtime environment through a natural chat interface.
          </p>
          <Link href="/runtime/chat">
            <Button variant="outline" size="sm" className="w-full">
              Open Chat
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-orange-500">Metrics</h3>
          </div>
          <p className="text-orange-200/60 mb-4">
            View performance metrics and system health information.
          </p>
          <Link href="/runtime/metrics">
            <Button variant="outline" size="sm" className="w-full">
              View Metrics
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-orange-500">Settings</h3>
          </div>
          <p className="text-orange-200/60 mb-4">
            Configure runtime behavior and system preferences.
          </p>
          <Link href="/runtime/settings">
            <Button variant="outline" size="sm" className="w-full">
              Configure
            </Button>
          </Link>
        </div>
      </div>

      <section className="max-w-4xl mx-auto">
        <div className="p-8 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
          <h2 className="text-2xl font-semibold text-orange-500 mb-6">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-black/60 border border-orange-500/10">
              <h3 className="text-sm font-medium text-orange-200/80 mb-2">Agent Swarm</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-orange-200/60">Active</span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-black/60 border border-orange-500/10">
              <h3 className="text-sm font-medium text-orange-200/80 mb-2">MCP Server</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-orange-200/60">Connected</span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-black/60 border border-orange-500/10">
              <h3 className="text-sm font-medium text-orange-200/80 mb-2">Resources</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-orange-200/60">Optimal</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 