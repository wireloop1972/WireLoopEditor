import { AgentRole, AgentCapability } from '@/types/swarm';

export interface RuntimeConfig {
  maxConcurrentTasks: number;
  maxRetries: number;
  timeoutMs: number;
  enableCircuitBreaker: boolean;
  circuitBreakerConfig: {
    failureThreshold: number;
    resetTimeoutMs: number;
  };
}

export interface RuntimeOptions {
  enableLogging: boolean;
  enableMetrics: boolean;
  enableTracing: boolean;
  enableDebugMode: boolean;
  enableSwarm: boolean;
  enableMCP: boolean;
}

export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  maxConcurrentTasks: 5,
  maxRetries: 3,
  timeoutMs: 30000,
  enableCircuitBreaker: true,
  circuitBreakerConfig: {
    failureThreshold: 5,
    resetTimeoutMs: 60000,
  },
};

export const DEFAULT_RUNTIME_OPTIONS: RuntimeOptions = {
  enableLogging: true,
  enableMetrics: true,
  enableTracing: false,
  enableDebugMode: false,
  enableSwarm: true,
  enableMCP: true,
};

export const RUNTIME_AGENT_ROLES: AgentRole[] = [
  {
    id: 'orchestrator',
    name: 'Runtime Orchestrator',
    capabilities: [
      AgentCapability.TASK_EXECUTION,
      AgentCapability.COORDINATION,
      AgentCapability.PLANNING
    ],
    specialization: 'runtime orchestration',
    priority: 100,
    metadata: {},
    description: 'Orchestrates task execution and agent coordination',
  },
  {
    id: 'context-manager',
    name: 'Context Manager',
    capabilities: [
      AgentCapability.DATA_PROCESSING,
      AgentCapability.ANALYSIS,
      AgentCapability.OPTIMIZATION
    ],
    specialization: 'context management',
    priority: 90,
    metadata: {},
    description: 'Manages context and state across the runtime',
  },
]; 