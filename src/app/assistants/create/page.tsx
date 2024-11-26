'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import type { SimpleTool, AssistantTool, AssistantToolType } from '@/lib/openai';

const models = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'High-intelligence flagship model for complex, multi-step tasks',
    recommended: true
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Affordable and intelligent small model for fast, lightweight tasks'
  },
  {
    id: 'gpt-4-1106-preview',
    name: 'GPT-4 Turbo',
    description: 'Latest GPT-4 model with improved capabilities'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Standard GPT-4 model'
  },
  {
    id: 'gpt-3.5-turbo-1106',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for simpler tasks'
  },
];

const tools: Array<{ type: AssistantToolType; name: string; description: string }> = [
  {
    type: 'code_interpreter',
    name: 'Code Interpreter',
    description: 'Execute code and perform numerical computations',
  },
  {
    type: 'retrieval',
    name: 'Retrieval',
    description: 'Search and analyze files and documents',
  },
];

export default function CreateAssistant() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(models[0].id);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const selectedTools: SimpleTool[] = tools
      .filter(tool => formData.get(tool.type) === 'on')
      .map(({ type }) => ({ type }));

    const data = {
      name: formData.get('name') as string,
      instructions: formData.get('instructions') as string,
      model: selectedModel,
      tools: selectedTools,
      description: formData.get('description') as string,
    };

    try {
      const response = await fetch('/api/assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assistant');
      }

      router.push('/assistants');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-orange-500">Create Assistant</h1>
        <p className="mt-2 text-orange-200/60">Configure your new AI assistant</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-orange-200/80 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 bg-black/40 border border-orange-500/20 rounded-md text-orange-200 placeholder-orange-200/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              placeholder="e.g., Code Review Assistant"
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
              className="w-full px-4 py-2 bg-black/40 border border-orange-500/20 rounded-md text-orange-200 placeholder-orange-200/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              placeholder="e.g., An assistant that helps with code review and suggestions"
            />
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-orange-200/80 mb-1">
              Instructions
            </label>
            <textarea
              id="instructions"
              name="instructions"
              required
              rows={4}
              className="w-full px-4 py-2 bg-black/40 border border-orange-500/20 rounded-md text-orange-200 placeholder-orange-200/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              placeholder="Detailed instructions for how the assistant should behave and handle tasks"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-orange-200/80 mb-3">
              Model
            </label>
            <div className="space-y-2">
              {models.map(model => (
                <label
                  key={model.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedModel === model.id
                      ? 'bg-orange-500/10 border-orange-500'
                      : 'bg-black/40 border-orange-500/20 hover:border-orange-500/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModel === model.id}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="mt-1 bg-black/40 border-orange-500/20 text-orange-500 focus:ring-orange-500/40"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-orange-200">{model.name}</span>
                      {model.recommended && (
                        <span className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-500 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-orange-200/60">{model.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-orange-200/80 mb-2">
              Tools
            </label>
            <div className="space-y-3">
              {tools.map(tool => (
                <label key={tool.type} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name={tool.type}
                    className="mt-1 bg-black/40 border-orange-500/20 rounded text-orange-500 focus:ring-orange-500/40"
                  />
                  <div>
                    <div className="font-medium text-orange-200">{tool.name}</div>
                    <div className="text-sm text-orange-200/60">{tool.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Assistant'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
} 