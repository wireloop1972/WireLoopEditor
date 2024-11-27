import { useState, useEffect, useCallback } from 'react';
import { TaskContext, AgentState, AgentRole } from '@/types/swarm';
import { SWARM_CONFIG } from '@/config/swarm';

export const useSwarm = () => {
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize the swarm
  useEffect(() => {
    const initializeSwarm = async () => {
      try {
        const response = await fetch('/api/agents');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to initialize agents');
        }
        const initializedAgents = await response.json();
        setAgents(initializedAgents);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize swarm'));
      } finally {
        setIsInitializing(false);
      }
    };

    setIsInitializing(true);
    setError(null);
    initializeSwarm();
  }, []);

  // Create a new agent
  const createAgent = useCallback(async (role: AgentRole) => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(role),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create agent');
      }

      const newAgent = await response.json();
      setAgents(prev => [...prev, newAgent]);
      return newAgent;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create agent');
    }
  }, []);

  // Process a task using the swarm
  const processTask = useCallback(async (task: TaskContext) => {
    try {
      const response = await fetch('/api/agents/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process task');
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to process task');
    }
  }, []);

  // Handle agent handoff
  const handleHandoff = useCallback(async (
    fromAgentId: string,
    toAgentId: string,
    taskId: string,
    context: TaskContext
  ) => {
    try {
      const response = await fetch('/api/agents/handoff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromAgentId,
          toAgentId,
          taskId,
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to handle handoff');
      }

      return await response.json();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to handle handoff');
    }
  }, []);

  // Get agent by ID
  const getAgent = useCallback((agentId: string) => {
    return agents.find(agent => agent.id === agentId);
  }, [agents]);

  // Get available agents
  const getAvailableAgents = useCallback(() => {
    return agents.filter(agent => 
      agent.isAvailable && agent.currentLoad < SWARM_CONFIG.loadBalancing.maxLoad
    );
  }, [agents]);

  // Deregister an agent
  const deregisterAgent = useCallback(async (agentId: string) => {
    try {
      await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
      });
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to deregister agent');
    }
  }, []);

  return {
    agents,
    isInitializing,
    error,
    createAgent,
    processTask,
    handleHandoff,
    getAgent,
    getAvailableAgents,
    deregisterAgent,
  };
}; 