import { z } from 'zod';
import { TaskContext } from './task';
import { CircuitState } from '@/utils/CircuitBreaker';

// Agent capabilities
export enum AgentCapability {
  TASK_EXECUTION = 'task_execution',
  PLANNING = 'planning',
  ANALYSIS = 'analysis',
  COORDINATION = 'coordination',
  DATA_PROCESSING = 'data_processing',
  CODE_GENERATION = 'code_generation',
  REVIEW = 'review',
  OPTIMIZATION = 'optimization',
}

// Agent role schema
export const AgentRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  capabilities: z.array(z.nativeEnum(AgentCapability)),
  specialization: z.string(),
  priority: z.number().default(1),
  description: z.string().optional(),
  metadata: z.record(z.any()).default({}),
});

export type AgentRole = z.infer<typeof AgentRoleSchema>;

// Agent state schema
export const AgentStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: AgentRoleSchema,
  capabilities: z.array(z.nativeEnum(AgentCapability)),
  isAvailable: z.boolean().default(true),
  currentLoad: z.number().default(0),
  maxLoad: z.number().default(5),
  relationships: z.map(z.string(), z.number()).default(new Map()),
  context: z.record(z.any()).default({}),
  lastActive: z.date().optional(),
  status: z.enum(['idle', 'busy', 'error']).default('idle'),
  error: z.string().optional(),
});

// Export types
export type Agent = z.infer<typeof AgentStateSchema>;
export type AgentState = z.infer<typeof AgentStateSchema>;

// Re-export TaskContext from task.ts
export type { TaskContext } from './task';

// Handoff request schema
export const HandoffRequestSchema = z.object({
  taskId: z.string(),
  fromAgentId: z.string(),
  toAgentId: z.string(),
  context: z.record(z.any()).optional(),
  priority: z.number().default(1),
  timestamp: z.date().default(() => new Date()),
});

export type HandoffRequest = z.infer<typeof HandoffRequestSchema>;

// Task history entry schema
export const TaskHistoryEntrySchema = z.object({
  agentId: z.string(),
  action: z.enum(['start', 'complete', 'fail', 'handoff']),
  timestamp: z.number(),
  metadata: z.record(z.any()).optional(),
});

export type TaskHistoryEntry = z.infer<typeof TaskHistoryEntrySchema>; 