import { AgentRole } from '@/types/swarm';

export interface RuntimeConfig {
  maxConcurrentTasks: number;
  taskTimeout: number;
  retryAttempts: number;
  contextTTL: number;
}

export interface RuntimeOptions {
  enableSwarm: boolean;
  enableMCP: boolean;
  enableLogging: boolean;
  enableMetrics: boolean;
}

export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  maxConcurrentTasks: 5,
  taskTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  contextTTL: 3600000, // 1 hour
};

export const DEFAULT_RUNTIME_OPTIONS: RuntimeOptions = {
  enableSwarm: true,
  enableMCP: true,
  enableLogging: true,
  enableMetrics: true,
};

export const RUNTIME_AGENT_ROLES: AgentRole[] = [
  {
    id: 'orchestrator',
    name: 'Runtime Orchestrator',
    capabilities: ['task-orchestration', 'resource-management', 'error-handling'],
    specialization: 'runtime orchestration',
    priority: 100,
  },
  {
    id: 'context-manager',
    name: 'Context Manager',
    capabilities: ['context-tracking', 'state-management', 'memory-optimization'],
    specialization: 'context management',
    priority: 90,
  },
  {
    id: 'performance-monitor',
    name: 'Performance Monitor',
    capabilities: ['metrics-collection', 'performance-analysis', 'optimization'],
    specialization: 'performance monitoring',
    priority: 80,
  },
]; 