'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Plus, Trash2, Edit2, Code, Search, Wrench } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAssistants } from '@/hooks/useAssistants';
import type { Assistant, AssistantTool, AssistantToolType } from '@/lib/openai';

export default function AssistantsPage() {
  const { assistants, deleteAssistant, isLoading, error } = useAssistants();
  const [expandedAssistant, setExpandedAssistant] = useState<string | null>(null);
  const [expandedInstructions, setExpandedInstructions] = useState<string | null>(null);

  const getToolIcon = (type: AssistantToolType) => {
    switch (type) {
      case 'code_interpreter':
        return <Code className="w-4 h-4 mr-2" />;
      case 'retrieval':
      case 'file_search':
        return <Search className="w-4 h-4 mr-2" />;
      case 'function':
        return <Wrench className="w-4 h-4 mr-2" />;
    }
  };

  const getToolLabel = (tool: AssistantTool): string => {
    switch (tool.type) {
      case 'code_interpreter':
        return 'Code Interpreter';
      case 'retrieval':
      case 'file_search':
        return 'Retrieval';
      case 'function':
        return `Function: ${tool.function.name}`;
      default: {
        const unknownTool = tool as { type: string };
        return unknownTool.type;
      }
    }
  };

  const toggleAssistant = (id: string) => {
    setExpandedAssistant(expandedAssistant === id ? null : id);
  };

  const toggleInstructions = (id: string) => {
    setExpandedInstructions(expandedInstructions === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-orange-500">Assistants</h1>
            <Link href="/assistants/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Assistant
              </Button>
            </Link>
          </div>

          <div className="grid gap-6">
            {assistants?.map((assistant) => (
              <div
                key={assistant.id}
                className="bg-black/40 backdrop-blur-sm border border-orange-500/20 rounded-lg overflow-hidden"
              >
                <div 
                  className="p-4 cursor-pointer flex items-center justify-between hover:bg-black/60"
                  onClick={() => toggleAssistant(assistant.id)}
                >
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-orange-500">{assistant.name}</h2>
                    <span className="px-2 py-1 text-xs rounded-full bg-orange-500/10 text-orange-200/60">
                      {assistant.model}
                    </span>
                  </div>
                  {expandedAssistant === assistant.id ? (
                    <ChevronUp className="w-5 h-5 text-orange-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-orange-500" />
                  )}
                </div>

                {expandedAssistant === assistant.id && (
                  <div className="p-4 border-t border-orange-500/20 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleInstructions(assistant.id)}
                      >
                        {expandedInstructions === assistant.id ? (
                          <ChevronUp className="w-4 h-4 mr-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 mr-2" />
                        )}
                        Instructions
                      </Button>
                      
                      <div className="flex-1" />
                      
                      <Link href={`/assistants/${assistant.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteAssistant(assistant.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>

                    {expandedInstructions === assistant.id && (
                      <div className="mt-4 p-4 bg-black/20 rounded-lg">
                        <p className="text-orange-200/80 whitespace-pre-wrap">{assistant.instructions}</p>
                      </div>
                    )}

                    {assistant.description && (
                      <p className="text-orange-200/60">{assistant.description}</p>
                    )}

                    {assistant.tools && assistant.tools.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-orange-200/80">Tools</h4>
                        <div className="flex flex-wrap gap-2">
                          {assistant.tools.map((tool, index) => (
                            <div
                              key={`${assistant.id}-tool-${index}`}
                              className="flex items-center px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-200/60 border border-orange-500/20"
                            >
                              {getToolIcon(tool.type)}
                              {getToolLabel(tool)}
                              {tool.type === 'function' && (
                                <details className="ml-2">
                                  <summary className="cursor-pointer hover:text-orange-200/80">Details</summary>
                                  <div className="mt-2 p-2 bg-black/40 rounded-md">
                                    <p className="text-sm">{tool.function.description}</p>
                                    <pre className="mt-2 text-xs overflow-x-auto">
                                      {JSON.stringify(tool.function.parameters, null, 2)}
                                    </pre>
                                  </div>
                                </details>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {assistant.file_ids && assistant.file_ids.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-orange-200/80">Files</h4>
                        <div className="flex flex-wrap gap-2">
                          {assistant.file_ids.map((fileId) => (
                            <span
                              key={fileId}
                              className="px-3 py-1.5 text-sm rounded-full bg-orange-500/10 text-orange-200/60 border border-orange-500/20"
                            >
                              {fileId}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-orange-200/60 hover:text-orange-200/80">
                        Show technical details
                      </summary>
                      <div className="mt-2 p-4 bg-black/20 rounded-lg space-y-2 text-sm text-orange-200/60">
                        <p>ID: {assistant.id}</p>
                        <p>Created: {new Date(assistant.created_at * 1000).toLocaleString()}</p>
                        {assistant.metadata && (
                          <div>
                            <p className="mb-1">Metadata:</p>
                            <pre className="p-2 bg-black/40 rounded-md overflow-x-auto">
                              {JSON.stringify(assistant.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 