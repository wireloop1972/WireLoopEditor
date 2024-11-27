'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent, AgentRole } from '@/types/swarm';
import { SWARM_CONFIG } from '@/config/swarm';

export const useSwarm = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getAvailableAgents = useCallback(() => {
    return agents.filter(agent => agent.isAvailable);
  }, [agents]);

  const createAgent = useCallback(async (role: AgentRole) => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create agent');
      }

      const agent = await response.json();
      setAgents(prev => [...prev, agent]);
      return agent;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to create agent'));
      throw error;
    }
  }, []);

  const deregisterAgent = useCallback(async (agentId: string) => {
    try {
      // Optimistically remove the agent from local state
      setAgents(prev => prev.filter(agent => agent.id !== agentId));

      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // If the deletion fails, we need to fetch the current state
        await fetchAgents();
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deregister agent');
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to deregister agent'));
      throw error;
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    try {
      setIsInitializing(true);
      const response = await fetch('/api/agents');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch agents');
      }

      const agents = await response.json();
      setAgents(agents);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to fetch agents'));
      setAgents([]); // Reset agents on error
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    isInitializing,
    error,
    getAvailableAgents,
    createAgent,
    deregisterAgent,
    refreshAgents: fetchAgents,
  };
}; 