import OpenAI from 'openai';
import type { 
  AssistantCreateParams,
  Assistant as OpenAIAssistant,
  AssistantUpdateParams,
} from 'openai/resources/beta/assistants';

// Initialize OpenAI client with error handling
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'OpenAI API key not found. Please set OPENAI_API_KEY in your environment variables.'
    );
  }

  return new OpenAI({
    apiKey,
    maxRetries: 3,
    timeout: 30000,
  });
};

export const openai = getOpenAIClient();

// Define the exact tool types from OpenAI's API
export type AssistantToolType = 'code_interpreter' | 'retrieval' | 'function' | 'file_search';

// Define the function tool type
export interface FunctionTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

// Define other tool types
export interface CodeInterpreterTool {
  type: 'code_interpreter';
}

export interface RetrievalTool {
  type: 'retrieval' | 'file_search';
}

// Combine all tool types
export type AssistantTool = FunctionTool | CodeInterpreterTool | RetrievalTool;

// Simplified tool type for creation
export type SimpleTool = {
  type: AssistantToolType;
  function?: FunctionTool['function'];
};

// Re-export OpenAI's types with our additions
export type { AssistantCreateParams, AssistantUpdateParams };

// Extend OpenAI's Assistant type with our additions
export interface Assistant extends Omit<OpenAIAssistant, 'tools'> {
  tools: AssistantTool[];
  file_ids: string[];
  metadata: Record<string, unknown> | null;
  created_at: number;
}

// Helper type for params
export interface CreateAssistantParams extends Omit<AssistantCreateParams, 'file_ids'> {
  fileIds?: string[];
}

export interface UpdateAssistantParams extends Omit<AssistantUpdateParams, 'file_ids'> {
  fileIds?: string[];
}

// Error handling helper
export class OpenAIError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'OpenAIError';
  }
}

// Helper function to handle OpenAI API errors
export function handleOpenAIError(error: unknown): never {
  if (error instanceof Error) {
    throw new OpenAIError(error.message, error);
  }
  throw new OpenAIError('An unknown error occurred while communicating with OpenAI');
}
 