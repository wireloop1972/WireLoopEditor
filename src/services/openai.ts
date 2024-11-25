import { openai } from '@/lib/openai';
import type { CreateAssistantParams } from '@/lib/openai';

export class OpenAIService {
  static async createAssistant(params: CreateAssistantParams) {
    const assistant = await openai.beta.assistants.create({
      name: params.name,
      instructions: params.instructions,
      model: params.model,
      tools: params.tools,
      description: params.description,
    });
    return assistant;
  }

  static async listAssistants(limit = 20) {
    const assistants = await openai.beta.assistants.list({
      limit,
      order: 'desc',
    });
    return assistants;
  }

  static async getAssistant(assistantId: string) {
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    return assistant;
  }

  static async deleteAssistant(assistantId: string) {
    const response = await openai.beta.assistants.del(assistantId);
    return response;
  }

  static async updateAssistant(
    assistantId: string,
    params: Partial<CreateAssistantParams>
  ) {
    const assistant = await openai.beta.assistants.update(
      assistantId,
      {
        ...params,
        tools: params.tools ? params.tools : undefined,
      }
    );
    return assistant;
  }
} 