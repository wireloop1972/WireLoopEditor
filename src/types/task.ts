import { z } from 'zod';
import { AssistantConfig } from './assistant';

// Task priority levels
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

// Task status
export const TaskStatusEnum = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  BLOCKED: 'blocked',
  WAITING: 'waiting',
} as const;

export const TaskStatusSchema = z.enum([
  TaskStatusEnum.PENDING,
  TaskStatusEnum.IN_PROGRESS,
  TaskStatusEnum.COMPLETED,
  TaskStatusEnum.FAILED,
  TaskStatusEnum.CANCELLED,
  TaskStatusEnum.BLOCKED,
  TaskStatusEnum.WAITING,
]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// Task dependency types
export const DependencyTypeSchema = z.enum([
  'sequential',   // Must complete before next task
  'parallel',     // Can run alongside other tasks
  'conditional',  // Depends on condition from another task
  'optional',     // Nice to have but not required
]);

// Task dependency
export const TaskDependencySchema = z.object({
  taskId: z.string(),
  type: DependencyTypeSchema,
  condition: z.string().optional(), // For conditional dependencies
});

// Subtask schema
export const SubtaskSchema = z.object({
  id: z.string(),
  parentId: z.string(),
  description: z.string(),
  requiredCapabilities: z.array(z.string()),
  estimatedComplexity: z.number().min(1).max(10),
  dependencies: z.array(TaskDependencySchema).default([]),
  assignedAgentId: z.string().optional(),
  status: TaskStatusSchema.default('pending'),
  result: z.any().optional(),
  metadata: z.record(z.any()).default({}),
});

// Task history entry
export const TaskHistoryEntrySchema = z.object({
  agentId: z.string(),
  action: z.enum(['start', 'complete', 'fail', 'handoff']),
  timestamp: z.number(),
  metadata: z.record(z.any()).optional(),
});

// Task context schema
export const TaskContextSchema = z.object({
  id: z.string(),
  priority: TaskPrioritySchema,
  description: z.string(),
  requirements: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  deadline: z.date().optional(),
  maxRetries: z.number().default(3),
  subtasks: z.array(SubtaskSchema).default([]),
  metadata: z.record(z.any()).default({}),
  status: TaskStatusSchema.default(TaskStatusEnum.PENDING),
  progress: z.number().min(0).max(100).default(0),
  error: z.string().optional(),
  history: z.array(TaskHistoryEntrySchema).default([]),
  state: z.record(z.any()).default({}),
});

// Task execution result
export const TaskResultSchema = z.object({
  success: z.boolean(),
  output: z.any(),
  error: z.string().optional(),
  metrics: z.object({
    startTime: z.date(),
    endTime: z.date(),
    duration: z.number(),
    retryCount: z.number(),
    agentsInvolved: z.array(z.string()),
  }),
});

// Export types
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type DependencyType = z.infer<typeof DependencyTypeSchema>;
export type TaskDependency = z.infer<typeof TaskDependencySchema>;
export type Subtask = z.infer<typeof SubtaskSchema>;
export type TaskContext = z.infer<typeof TaskContextSchema>;
export type TaskResult = z.infer<typeof TaskResultSchema>;

// Task planning strategies
export interface TaskPlanningStrategy {
  name: string;
  description: string;
  isApplicable: (task: TaskContext) => boolean;
  decompose: (task: TaskContext, availableAgents: AssistantConfig[]) => Promise<Subtask[]>;
}

// Task optimization rules
export interface OptimizationRule {
  name: string;
  description: string;
  condition: (task: TaskContext) => boolean;
  optimize: (task: TaskContext) => Promise<TaskContext>;
  priority: number;
} 