import { openai } from '@/lib/openai';
import type { CreateAssistantParams, UpdateAssistantParams } from '@/lib/openai';

export class OpenAIService {
  static async createAssistant(params: CreateAssistantParams) {
    const { fileIds, ...rest } = params;
    const assistant = await openai.beta.assistants.create({
      ...rest,
      file_ids: fileIds || [],
    } as any);
    return assistant;
  }

  static async listAssistants(limit = 20) {
    const assistants = await openai.beta.assistants.list({
      limit,
      order: 'desc',
    });
    return assistants.data;
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
    params: Partial<UpdateAssistantParams>
  ) {
    const { fileIds, ...rest } = params;
    const assistant = await openai.beta.assistants.update(
      assistantId,
      {
        ...rest,
        file_ids: fileIds || [],
      } as any
    );
    return assistant;
  }

  static async listFiles() {
    const files = await openai.files.list();
    return files;
  }

  static async getFile(fileId: string) {
    const file = await openai.files.retrieve(fileId);
    return file;
  }

  static async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'assistants');

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload file');
    }

    return response.json();
  }

  static async deleteFile(fileId: string) {
    const response = await openai.files.del(fileId);
    return response;
  }

  static async createVectorStore(fileId: string, model: string = 'text-embedding-ada-002') {
    const response = await fetch('/api/vector-store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId, model }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create vector store');
    }

    return response.json();
  }

  static async queryVectorStore(query: string, fileIds: string[]) {
    const response = await fetch('/api/vector-store/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, fileIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to query vector store');
    }

    return response.json();
  }
} 