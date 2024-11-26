'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useAssistants } from '@/hooks/useAssistants';
import type { Assistant, AssistantTool, AssistantToolType } from '@/lib/openai';

interface EditAssistantPageProps {
  params: Promise<{
    assistantId: string;
  }>;
}

export default function EditAssistantPage({ params }: EditAssistantPageProps) {
  const router = useRouter();
  const { getAssistant, updateAssistant } = useAssistants();
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { assistantId } = use(params);

  useEffect(() => {
    const loadAssistant = async () => {
      try {
        const data = await getAssistant(assistantId);
        setAssistant(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assistant');
      } finally {
        setIsLoading(false);
      }
    };

    loadAssistant();
  }, [assistantId, getAssistant]);

  const getToolDisplayName = (tool: AssistantTool): string => {
    switch (tool.type) {
      case 'code_interpreter':
        return 'Code Interpreter';
      case 'retrieval':
        return 'Retrieval';
      case 'function':
        return `Function: ${tool.function.name}`;
      default: {
        // Assert that we might have an unknown tool type
        const type = tool.type as string;
        return type;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!assistant) return;

    setIsSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const instructions = formData.get('instructions') as string;
    const description = formData.get('description') as string;

    if (!name || !instructions) {
      setError('Name and instructions are required');
      setIsSaving(false);
      return;
    }

    const data = {
      name,
      instructions,
      description: description || undefined,
    };

    try {
      await updateAssistant(assistant.id, data);
      router.push('/assistants');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assistant');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
        {error}
      </div>
    );
  }

  if (!assistant) {
    return (
      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-500">
        Assistant not found
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-orange-500">Edit Assistant</h1>
        <p className="mt-2 text-orange-200/60">Update your AI assistant&apos;s configuration</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-orange-200/80 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={assistant?.name || ''}
              required
              className="w-full px-4 py-2 bg-black/40 border border-orange-500/20 rounded-md text-orange-200 placeholder-orange-200/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-orange-200/80 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              id="description"
              name="description"
              defaultValue={assistant?.description || ''}
              className="w-full px-4 py-2 bg-black/40 border border-orange-500/20 rounded-md text-orange-200 placeholder-orange-200/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            />
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-orange-200/80 mb-1">
              Instructions
            </label>
            <textarea
              id="instructions"
              name="instructions"
              defaultValue={assistant?.instructions || ''}
              required
              rows={4}
              className="w-full px-4 py-2 bg-black/40 border border-orange-500/20 rounded-md text-orange-200 placeholder-orange-200/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-orange-200/80 mb-2">
              Current Tools
            </label>
            <div className="flex flex-wrap gap-2">
              {assistant?.tools.map((tool, index) => (
                <span
                  key={`${assistant.id}-tool-${index}`}
                  className="px-2 py-1 text-xs rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20"
                >
                  {getToolDisplayName(tool)}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-orange-200/60">
              Tools cannot be modified after creation
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
} 