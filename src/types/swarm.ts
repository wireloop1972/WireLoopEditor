export interface AgentRole {
  id: string;
  name: string;
  capabilities: string[];
  specialization: string;
  priority: number;
}

export interface AgentState {
  id: string;
  role: AgentRole;
  isAvailable: boolean;
  currentLoad: number;
  relationships: Map<string, number>; // agent ID to relationship strength
}

export interface TaskContext {
  id: string;
  priority: number;
  state: Record<string, unknown>;
  history: Array<{
    agentId: string;
    action: string;
    timestamp: number;
  }>;
}

export interface HandoffRequest {
  taskId: string;
  fromAgentId: string;
  toAgentId: string;
  context: TaskContext;
  timestamp: number;
}

export type CircuitBreakerStatus = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
} 