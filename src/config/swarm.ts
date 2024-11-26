import { AgentRole } from '@/types/swarm';

export const DEFAULT_AGENT_ROLES: AgentRole[] = [
  {
    id: 'task-planner',
    name: 'Task Planning Specialist',
    capabilities: ['task-decomposition', 'priority-assessment', 'workflow-optimization'],
    specialization: 'task planning and coordination',
    priority: 100,
  },
  {
    id: 'code-expert',
    name: 'Code Implementation Expert',
    capabilities: ['code-generation', 'code-review', 'debugging'],
    specialization: 'software development',
    priority: 90,
  },
  {
    id: 'data-analyst',
    name: 'Data Analysis Specialist',
    capabilities: ['data-processing', 'statistical-analysis', 'visualization'],
    specialization: 'data analysis',
    priority: 80,
  },
];

export const SWARM_CONFIG = {
  maxAgentsPerTask: 3,
  defaultTimeout: 30000, // 30 seconds
  maxRetries: 3,
  circuitBreaker: {
    failureThreshold: 3,
    resetTimeout: 30000, // 30 seconds
  },
  loadBalancing: {
    maxLoad: 5,
    balancingInterval: 5000, // 5 seconds
  },
} as const; 