'use client';

import { useEffect } from 'react';
import { useSwarm } from '@/hooks/useSwarm';
import Button from '@/components/ui/Button';
import SwarmConfig from '@/components/config/SwarmConfig';
import AgentConfig from '@/components/config/AgentConfig';

export default function AgentsPage() {
  const { agents, isInitializing, error, getAvailableAgents } = useSwarm();

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
          {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-orange-500 mb-4">AI Agent Swarm</h1>
            <p className="text-orange-200/80">
              Manage and monitor your AI agent swarm. View agent status, workload, and relationships.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <SwarmConfig 
              onConfigUpdate={(config) => {
                console.log('Swarm config updated:', config);
                // TODO: Implement swarm configuration update
              }}
            />
            <AgentConfig 
              onConfigUpdate={(config) => {
                console.log('Agent config updated:', config);
                // TODO: Implement agent configuration update
              }}
            />
          </div>
        </div>
      </header>

      <div className="space-y-8">
        {isInitializing ? (
          <div className="animate-pulse text-orange-200/60">
            Initializing agent swarm...
          </div>
        ) : (
          <>
            <section>
              <h2 className="text-2xl font-semibold text-orange-500 mb-4">Active Agents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20
                             hover:border-orange-500/40 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-medium text-orange-500">
                        {agent.role.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          agent.isAvailable
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-orange-500/20 text-orange-500'
                        }`}
                      >
                        {agent.isAvailable ? 'Available' : 'Busy'}
                      </span>
                    </div>
                    <div className="space-y-2 text-orange-200/60">
                      <p>Specialization: {agent.role.specialization}</p>
                      <p>Current Load: {agent.currentLoad}</p>
                      <p>Priority Level: {agent.role.priority}</p>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-orange-500 mb-2">Capabilities</h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.role.capabilities.map((capability) => (
                          <span
                            key={capability}
                            className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-200/80 text-xs"
                          >
                            {capability}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-orange-500 mb-4">Swarm Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
                  <h3 className="text-lg font-medium text-orange-500 mb-2">Total Agents</h3>
                  <p className="text-3xl text-orange-200/80">{agents.length}</p>
                </div>
                <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
                  <h3 className="text-lg font-medium text-orange-500 mb-2">Available Agents</h3>
                  <p className="text-3xl text-orange-200/80">{getAvailableAgents().length}</p>
                </div>
                <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
                  <h3 className="text-lg font-medium text-orange-500 mb-2">Average Load</h3>
                  <p className="text-3xl text-orange-200/80">
                    {(agents.reduce((acc, agent) => acc + agent.currentLoad, 0) / agents.length || 0).toFixed(1)}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
} 