import { z } from 'zod';
import { TaskContextSchema, TaskStatusEnum } from './task';
import { AssistantConfig } from './assistant';

// Workflow state transitions
export const WorkflowStateSchema = z.enum([
  'created',
  'planning',
  'executing',
  'waiting',
  'completed',
  'failed',
  'cancelled',
]);

// Workflow step types
export const WorkflowStepTypeSchema = z.enum([
  'task',           // Single task execution
  'parallel',       // Parallel execution of multiple tasks
  'sequence',       // Sequential execution of tasks
  'condition',      // Conditional branching
  'loop',           // Repeat until condition
  'handoff',        // Agent handoff
  'aggregation',    // Combine results
  'notification',   // Send notifications
]);

// Workflow step condition
export const WorkflowConditionSchema = z.object({
  type: z.enum(['equals', 'contains', 'greater', 'less', 'exists', 'custom']),
  field: z.string(),
  value: z.any(),
  customEval: z.function().optional(),
});

// Workflow step definition
export const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: WorkflowStepTypeSchema,
  description: z.string(),
  tasks: z.array(TaskContextSchema).optional(),
  condition: WorkflowConditionSchema.optional(),
  maxRetries: z.number().default(3),
  timeout: z.number().default(30000),
  requiredCapabilities: z.array(z.string()),
  onSuccess: z.array(z.string()).optional(),
  onFailure: z.array(z.string()).optional(),
  onTimeout: z.array(z.string()).optional(),
  metadata: z.record(z.any()).default({}),
});

// Workflow definition
export const WorkflowDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  steps: z.array(WorkflowStepSchema),
  initialSteps: z.array(z.string()), // Starting step IDs
  globalTimeout: z.number().default(300000),
  requiredAgents: z.array(z.string()),
  metadata: z.record(z.any()).default({}),
});

// Workflow step execution state
export const WorkflowStepStateSchema = z.object({
  stepId: z.string(),
  status: WorkflowStateSchema,
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  error: z.string().optional(),
  result: z.any(),
  retryCount: z.number().default(0),
  assignedAgentId: z.string().optional(),
});

// Workflow execution state
export const WorkflowExecutionStateSchema = z.object({
  workflowId: z.string(),
  status: WorkflowStateSchema,
  currentSteps: z.array(z.string()),
  completedSteps: z.array(z.string()),
  failedSteps: z.array(z.string()),
  stepStates: z.record(WorkflowStepStateSchema),
  startTime: z.date(),
  endTime: z.date().optional(),
  error: z.string().optional(),
  result: z.record(z.any()).default({}),
});

// Workflow execution metrics
export const WorkflowMetricsSchema = z.object({
  totalExecutions: z.number().default(0),
  successfulExecutions: z.number().default(0),
  failedExecutions: z.number().default(0),
  averageDuration: z.number().default(0),
  stepMetrics: z.record(z.object({
    averageDuration: z.number().default(0),
    failureRate: z.number().default(0),
    totalExecutions: z.number().default(0),
  })),
});

// Export types
export type WorkflowState = z.infer<typeof WorkflowStateSchema>;
export type WorkflowStepType = z.infer<typeof WorkflowStepTypeSchema>;
export type WorkflowCondition = z.infer<typeof WorkflowConditionSchema>;
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;
export type WorkflowStepState = z.infer<typeof WorkflowStepStateSchema>;
export type WorkflowExecutionState = z.infer<typeof WorkflowExecutionStateSchema>;
export type WorkflowMetrics = z.infer<typeof WorkflowMetricsSchema>;

// Workflow events
export enum WorkflowEvent {
  WORKFLOW_STARTED = 'workflow_started',
  WORKFLOW_COMPLETED = 'workflow_completed',
  WORKFLOW_FAILED = 'workflow_failed',
  STEP_STARTED = 'step_started',
  STEP_COMPLETED = 'step_completed',
  STEP_FAILED = 'step_failed',
  CONDITION_EVALUATED = 'condition_evaluated',
  HANDOFF_INITIATED = 'handoff_initiated',
  HANDOFF_COMPLETED = 'handoff_completed',
  TIMEOUT_OCCURRED = 'timeout_occurred',
}

// Workflow error types
export enum WorkflowErrorType {
  VALIDATION_ERROR = 'validation_error',
  EXECUTION_ERROR = 'execution_error',
  TIMEOUT_ERROR = 'timeout_error',
  CONDITION_ERROR = 'condition_error',
  HANDOFF_ERROR = 'handoff_error',
  AGENT_ERROR = 'agent_error',
}

export class WorkflowError extends Error {
  constructor(
    public type: WorkflowErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'WorkflowError';
  }
} 