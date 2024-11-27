'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Code, Server, Network, Zap } from 'lucide-react';

type ServerStatus = 'stopped' | 'starting' | 'running';

export default function MCPPage() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>('stopped');

  const handleStartServer = async () => {
    setServerStatus('starting');
    try {
      const response = await fetch('/api/mcp/server', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to start MCP server');
      setServerStatus('running');
    } catch (error) {
      console.error('Error starting MCP server:', error);
      setServerStatus('stopped');
    }
  };

  const handleStopServer = async () => {
    try {
      await fetch('/api/mcp/server', { method: 'DELETE' });
      setServerStatus('stopped');
    } catch (error) {
      console.error('Error stopping MCP server:', error);
    }
  };

  const isStarting = serverStatus === 'starting';

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-orange-500">Model Context Protocol (MCP)</h1>
        <p className="text-orange-200/80 max-w-2xl mx-auto">
          Enhance your AI interactions with Anthropic's Model Context Protocol. 
          Enable structured communication, efficient context sharing, and advanced protocol handling.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-orange-500">TypeScript SDK</h3>
          </div>
          <p className="text-orange-200/60">
            Built-in TypeScript support with type definitions for protocol messages and handlers.
          </p>
        </div>
        <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-orange-500">MCP Server</h3>
          </div>
          <p className="text-orange-200/60">
            Dedicated server for handling MCP connections and message routing.
          </p>
        </div>
        <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Network className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-orange-500">Agent Integration</h3>
          </div>
          <p className="text-orange-200/60">
            Seamless integration with Wire Loop's agent swarm for enhanced collaboration.
          </p>
        </div>
        <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-orange-500">Real-time Protocol</h3>
          </div>
          <p className="text-orange-200/60">
            Real-time message handling and context synchronization between models.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto">
        <div className="p-8 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
          <h2 className="text-2xl font-semibold text-orange-500 mb-6">MCP Server Control</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-orange-200/80">Server Status</h3>
                <p className="text-orange-200/60">
                  {serverStatus === 'stopped' && 'Server is currently stopped'}
                  {serverStatus === 'starting' && 'Server is starting...'}
                  {serverStatus === 'running' && 'Server is running'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {serverStatus === 'stopped' ? (
                  <Button onClick={handleStartServer} disabled={isStarting}>
                    Start Server
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStopServer} 
                    variant="secondary"
                    disabled={isStarting}
                  >
                    Stop Server
                  </Button>
                )}
                <div 
                  className={`w-3 h-3 rounded-full ${
                    serverStatus === 'running' 
                      ? 'bg-green-500' 
                      : isStarting
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-orange-200/80">Connection Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded bg-black/60 border border-orange-500/10">
                  <span className="text-orange-200/60">WebSocket URL:</span>
                  <code className="ml-2 text-orange-200">ws://localhost:3001/mcp</code>
                </div>
                <div className="p-3 rounded bg-black/60 border border-orange-500/10">
                  <span className="text-orange-200/60">HTTP Endpoint:</span>
                  <code className="ml-2 text-orange-200">http://localhost:3001/mcp</code>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-orange-200/80">Active Connections</h3>
              <div className="p-4 rounded bg-black/60 border border-orange-500/10">
                <p className="text-orange-200/60">
                  {serverStatus === 'running' 
                    ? 'No active connections' 
                    : 'Server not running'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto">
        <div className="p-8 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
          <h2 className="text-2xl font-semibold text-orange-500 mb-6">Documentation</h2>
          <div className="prose prose-invert prose-orange max-w-none">
            <h3>Quick Start</h3>
            <p>
              To use the MCP server in your application, first start the server and then
              connect using the WebSocket or HTTP endpoints. Here's a basic example:
            </p>
            <pre className="bg-black/60 p-4 rounded-lg overflow-x-auto">
              <code className="text-orange-200/80">{`
import { MCPClient } from '@wireloop/mcp';

const client = new MCPClient({
  url: 'ws://localhost:3001/mcp'
});

await client.connect();

// Send a message
await client.send({
  type: 'context.update',
  payload: {
    key: 'user.preference',
    value: { theme: 'dark' }
  }
});
              `.trim()}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
} 