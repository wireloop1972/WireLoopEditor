import { z } from 'zod';

// Function parameter validation schema
type FunctionParameterValidationSchemaType = z.ZodObject<{
  type: z.ZodEnum<['string', 'number', 'boolean', 'array', 'object']>;
  required: z.ZodDefault<z.ZodBoolean>;
  minLength: z.ZodOptional<z.ZodNumber>;
  maxLength: z.ZodOptional<z.ZodNumber>;
  minimum: z.ZodOptional<z.ZodNumber>;
  maximum: z.ZodOptional<z.ZodNumber>;
  pattern: z.ZodOptional<z.ZodString>;
  enum: z.ZodOptional<z.ZodArray<z.ZodAny>>;
  items: z.ZodOptional<z.ZodLazy<z.ZodTypeAny>>;
  properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodLazy<z.ZodTypeAny>>>;
}>;

export const FunctionParameterValidationSchema: FunctionParameterValidationSchemaType = z.object({
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  required: z.boolean().default(false),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  pattern: z.string().optional(),
  enum: z.array(z.any()).optional(),
  items: z.lazy(() => FunctionParameterValidationSchema).optional(),
  properties: z.record(z.lazy(() => FunctionParameterValidationSchema)).optional(),
});

// Function execution context
export const ExecutionContextSchema = z.object({
  agentId: z.string(),
  taskId: z.string(),
  timestamp: z.date(),
  timeout: z.number().default(30000),
  maxRetries: z.number().default(3),
  environment: z.record(z.string()).default({}),
});

// Function execution result
export const ExecutionResultSchema = z.object({
  success: z.boolean(),
  result: z.any(),
  error: z.string().optional(),
  duration: z.number(),
  retries: z.number().default(0),
  logs: z.array(z.string()).default([]),
});

// Function rate limit
export const RateLimitSchema = z.object({
  windowMs: z.number(),
  maxRequests: z.number(),
  perAgent: z.boolean().default(true),
});

// Function quota
export const QuotaSchema = z.object({
  daily: z.number().optional(),
  monthly: z.number().optional(),
  perAgent: z.boolean().default(true),
});

// Function registration
export const FunctionRegistrationSchema = z.object({
  name: z.string(),
  description: z.string(),
  version: z.string(),
  category: z.enum(['system', 'data', 'communication', 'external']),
  parameters: z.record(FunctionParameterValidationSchema),
  returnSchema: FunctionParameterValidationSchema,
  implementation: z.function(
    z.tuple([z.record(z.any()), z.any()]),
    z.promise(z.any())
  ),
  rateLimit: RateLimitSchema.optional(),
  quota: QuotaSchema.optional(),
  requiredPermissions: z.array(z.string()).default([]),
  isAsync: z.boolean().default(false),
  timeout: z.number().default(30000),
  enabled: z.boolean().default(true),
});

// Function execution metrics
export const FunctionMetricsSchema = z.object({
  totalCalls: z.number().default(0),
  successfulCalls: z.number().default(0),
  failedCalls: z.number().default(0),
  averageDuration: z.number().default(0),
  lastExecuted: z.date().optional(),
  errorRate: z.number().default(0),
  quotaUsage: z.record(z.number()).default({}),
});

// Export types
export type FunctionParameterValidation = z.infer<typeof FunctionParameterValidationSchema>;
export type ExecutionContext = z.infer<typeof ExecutionContextSchema>;
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;
export type RateLimit = z.infer<typeof RateLimitSchema>;
export type Quota = z.infer<typeof QuotaSchema>;
export type FunctionRegistration = z.infer<typeof FunctionRegistrationSchema>;
export type FunctionMetrics = z.infer<typeof FunctionMetricsSchema>;

// Function execution error types
export enum FunctionErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  EXECUTION_ERROR = 'EXECUTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  QUOTA_ERROR = 'QUOTA_ERROR',
  DISABLED_ERROR = 'DISABLED_ERROR',
}

export class FunctionError extends Error {
  constructor(
    public type: FunctionErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'FunctionError';
  }
}

// Function registry events
export enum FunctionRegistryEvent {
  FUNCTION_REGISTERED = 'function_registered',
  FUNCTION_UPDATED = 'function_updated',
  FUNCTION_REMOVED = 'function_removed',
  EXECUTION_STARTED = 'execution_started',
  EXECUTION_COMPLETED = 'execution_completed',
  EXECUTION_FAILED = 'execution_failed',
  QUOTA_EXCEEDED = 'quota_exceeded',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
} 