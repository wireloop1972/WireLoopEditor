import OpenAI from 'openai';
import type { 
  AssistantCreateParams,
  Assistant as OpenAIAssistant,
  AssistantUpdateParams,
} from 'openai/resources/beta/assistants';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  type: 'retrieval' | 'file_search';  // Support both types
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
 