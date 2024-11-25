'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useAssistants } from '@/hooks/useAssistants';
import type { Assistant, AssistantTool } from '@/lib/openai';

export default function AssistantsPage() {
  const { assistants, isLoading, error, listAssistants, deleteAssistant } = useAssistants();

  useEffect(() => {
    listAssistants();
  }, [listAssistants]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assistant?')) {
      await deleteAssistant(id);
    }
  };

  const getToolDisplayName = (tool: AssistantTool): string => {
    switch (tool.type) {
      case 'code_interpreter':
        return 'Code Interpreter';
      case 'file_search':
        return 'File Search';
      case 'function':
        return `Function: ${tool.function.name}`;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-orange-500">AI Assistants</h1>
          <p className="mt-2 text-orange-200/60">Create and manage your custom AI assistants</p>
        </div>
        <Link href="/assistants/create">
          <Button size="lg" className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Assistant
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && !assistants.length ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 rounded-lg border border-orange-500/20 bg-black/40 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-orange-200/60">Loading assistants...</p>
          </div>
        ) : assistants.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 rounded-lg border border-orange-500/20 bg-black/40 backdrop-blur-sm">
            <div className="rounded-full bg-orange-500/10 p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-orange-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-orange-500 mb-2">No assistants yet</h3>
            <p className="text-orange-200/60 text-center mb-6">Create your first AI assistant to get started</p>
            <Link href="/assistants/create">
              <Button variant="outline" size="lg">Create Assistant</Button>
            </Link>
          </div>
        ) : (
          assistants.map(assistant => (
            <div
              key={assistant.id}
              className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-orange-500">{assistant.name}</h3>
                  {assistant.description && (
                    <p className="text-orange-200/60 mt-1">{assistant.description}</p>
                  )}
                  <p className="text-orange-200/40 text-sm mt-1">Model: {assistant.model}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/assistants/${assistant.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(assistant.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {assistant.tools.map((tool: AssistantTool, index: number) => (
                  <span
                    key={`${assistant.id}-tool-${index}`}
                    className="px-2 py-1 text-xs rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20"
                  >
                    {getToolDisplayName(tool)}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 