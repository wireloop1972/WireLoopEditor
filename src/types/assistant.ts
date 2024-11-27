import { z } from 'zod';

// Function parameter schema
export const FunctionParameterSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  description: z.string(),
  required: z.boolean().default(false),
  schema: z.any().optional(), // JSON Schema for complex types
});

// Function definition schema
export const FunctionDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.array(FunctionParameterSchema),
  returnType: z.string(),
  category: z.enum(['data', 'communication', 'system', 'external']),
  permissions: z.array(z.string()).default([]),
});

// Capability schema
export const CapabilitySchema = z.object({
  name: z.string(),
  description: z.string(),
  functions: z.array(z.string()), // References to function names
  requiredPermissions: z.array(z.string()).default([]),
});

// Instruction step schema
export const InstructionStepSchema = z.object({
  order: z.number(),
  description: z.string(),
  expectedOutcome: z.string().optional(),
  requiredCapabilities: z.array(z.string()),
});

// Assistant instruction schema
export const AssistantInstructionsSchema = z.object({
  role: z.string(),
  goals: z.array(z.string()),
  workflow: z.array(InstructionStepSchema),
  constraints: z.array(z.string()).default([]),
  fallbackBehavior: z.string().optional(),
});

// Assistant configuration schema
export const AssistantConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  model: z.string().default('gpt-4'),
  instructions: AssistantInstructionsSchema,
  capabilities: z.array(CapabilitySchema),
  functions: z.array(FunctionDefinitionSchema),
  metadata: z.record(z.any()).default({}),
  version: z.string().default('1.0.0'),
});

// Runtime configuration
export const RuntimeConfigSchema = z.object({
  maxTokens: z.number().default(4096),
  temperature: z.number().min(0).max(2).default(0.7),
  topP: z.number().min(0).max(1).default(1),
  presencePenalty: z.number().min(-2).max(2).default(0),
  frequencyPenalty: z.number().min(-2).max(2).default(0),
});

// Export types
export type FunctionParameter = z.infer<typeof FunctionParameterSchema>;
export type FunctionDefinition = z.infer<typeof FunctionDefinitionSchema>;
export type Capability = z.infer<typeof CapabilitySchema>;
export type InstructionStep = z.infer<typeof InstructionStepSchema>;
export type AssistantInstructions = z.infer<typeof AssistantInstructionsSchema>;
export type AssistantConfig = z.infer<typeof AssistantConfigSchema>;
export type RuntimeConfig = z.infer<typeof RuntimeConfigSchema>;

// Helper function to validate assistant configuration
export function validateAssistantConfig(config: unknown): AssistantConfig {
  return AssistantConfigSchema.parse(config);
}

// Helper function to validate runtime configuration
export function validateRuntimeConfig(config: unknown): RuntimeConfig {
  return RuntimeConfigSchema.parse(config);
} 