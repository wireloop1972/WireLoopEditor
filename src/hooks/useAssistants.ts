import { useState, useCallback } from 'react';
import type { CreateAssistantParams, Assistant } from '@/lib/openai';

interface UseAssistantsReturn {
  assistants: Assistant[];
  isLoading: boolean;
  error: string | null;
  createAssistant: (params: CreateAssistantParams) => Promise<Assistant>;
  listAssistants: () => Promise<void>;
  getAssistant: (id: string) => Promise<Assistant>;
  deleteAssistant: (id: string) => Promise<void>;
  updateAssistant: (id: string, params: Partial<CreateAssistantParams>) => Promise<Assistant>;
}

export function useAssistants(): UseAssistantsReturn {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: unknown) => {
    console.error('Assistant operation failed:', error);
    setError(error instanceof Error ? error.message : 'Operation failed');
    throw error;
  };

  const createAssistant = useCallback(async (params: CreateAssistantParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assistant');
      }

      const assistant = await response.json();
      setAssistants(prev => [assistant, ...prev]);
      return assistant;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listAssistants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/assistants');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to list assistants');
      }

      const data = await response.json();
      setAssistants(data.data || []);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAssistant = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/assistants/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get assistant');
      }

      const assistant = await response.json();
      return assistant;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAssistant = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/assistants/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete assistant');
      }

      setAssistants(prev => prev.filter(assistant => assistant.id !== id));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAssistant = useCallback(async (id: string, params: Partial<CreateAssistantParams>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/assistants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update assistant');
      }

      const updated = await response.json();
      setAssistants(prev => 
        prev.map(assistant => 
          assistant.id === id ? updated : assistant
        )
      );
      return updated;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    assistants,
    isLoading,
    error,
    createAssistant,
    listAssistants,
    getAssistant,
    deleteAssistant,
    updateAssistant,
  };
} 