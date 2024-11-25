import OpenAI from 'openai';
import type { 
  AssistantCreateParams,
  Assistant as OpenAIAssistant,
  AssistantTool as OpenAIAssistantTool
} from 'openai/resources/beta/assistants';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Re-export OpenAI types
export type Assistant = OpenAIAssistant;
export type AssistantTool = OpenAIAssistantTool;

// Our simplified tool types for creation
export type CodeInterpreterTool = { type: 'code_interpreter' };
export type FileSearchTool = { type: 'file_search' };
export type SimpleTool = CodeInterpreterTool | FileSearchTool;

export interface CreateAssistantParams {
  name: string;
  instructions: string;
  model: string;
  tools: SimpleTool[];
  description?: string;
  fileIds?: string[];
}
 