'use client';

import { useState, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import { DEFAULT_RUNTIME_CONFIG, DEFAULT_RUNTIME_OPTIONS, RUNTIME_AGENT_ROLES } from '@/config/runtime';
import { RuntimeConfig, RuntimeOptions } from '@/config/runtime';
import { AgentRole } from '@/types/swarm';
import { TaskContext, TaskStatusEnum } from '@/types/task';
import { useSwarm } from '@/hooks/useSwarm';
import { Send, Loader2, Settings, Brain, Activity, X } from 'lucide-react';
import Button from '@/components/ui/Button';

type MessageStatus = 'sending' | 'sent' | 'error';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: MessageStatus;
  timestamp?: number;
  agentId?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeConfig>(DEFAULT_RUNTIME_CONFIG);
  const [runtimeOptions, setRuntimeOptions] = useState<RuntimeOptions>(DEFAULT_RUNTIME_OPTIONS);
  const [selectedAgentRoles, setSelectedAgentRoles] = useState<Set<string>>(new Set(RUNTIME_AGENT_ROLES.map(role => role.id)));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { agents, createAgent, deregisterAgent } = useSwarm();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isInitializing = true;

    const initializeAgents = async () => {
      // Deregister existing agents
      for (const agent of agents) {
        await deregisterAgent(agent.id);
      }

      // Create new agents based on selected roles
      for (const roleId of selectedAgentRoles) {
        const role = RUNTIME_AGENT_ROLES.find(r => r.id === roleId);
        if (role) {
          await createAgent(role);
        }
      }
    };

    if (runtimeOptions.enableSwarm) {
      initializeAgents();
    }

    return () => {
      isInitializing = false;
    };
  }, [runtimeOptions.enableSwarm, selectedAgentRoles, agents, createAgent, deregisterAgent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: input,
      status: 'sending',
    };

    try {
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      const task: TaskContext = {
        id: userMessage.id,
        priority: 'medium',
        description: input,
        requirements: [],
        constraints: [],
        status: TaskStatusEnum.PENDING,
        maxRetries: runtimeConfig.maxRetries,
        subtasks: [],
        progress: 0,
        history: [],
        state: { 
          message: input,
          runtimeConfig,
          runtimeOptions,
        },
        metadata: {},
      };

      const response = await fetch('/api/agents/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error('Failed to process task');
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-black/40 backdrop-blur-sm border-r border-orange-500/20 p-4 hidden md:flex flex-col">
        <h2 className="text-xl font-semibold text-orange-500 mb-4">Runtime Info</h2>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-black/40 border border-orange-500/20">
            <h3 className="text-sm font-medium text-orange-200/80 mb-2">Active Agents</h3>
            <div className="space-y-2">
              {agents.map((agent) => (
                <div 
                  key={agent.id}
                  className="flex items-center text-sm text-orange-200/60"
                >
                  <Brain className="w-4 h-4 mr-2 text-orange-500" />
                  {agent.name}
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-orange-500/20">
            <h3 className="text-sm font-medium text-orange-200/80 mb-2">System Status</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-200/60">Tasks</span>
                <span className="text-orange-200/80">{runtimeConfig.maxConcurrentTasks}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-200/60">Swarm</span>
                <span className={runtimeOptions.enableSwarm ? "text-green-500" : "text-red-500"}>
                  {runtimeOptions.enableSwarm ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-200/60">MCP</span>
                <span className={runtimeOptions.enableMCP ? "text-green-500" : "text-red-500"}>
                  {runtimeOptions.enableMCP ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-orange-500/10 border border-orange-500/20'
                    : 'bg-black/40 border border-orange-500/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-orange-500">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                  {message.status === 'sending' && (
                    <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                  )}
                  {message.status === 'error' && (
                    <span className="text-xs text-red-500">Error</span>
                  )}
                </div>
                <p className="text-orange-200/80">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="border-t border-orange-500/20 p-4 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-4 py-2 bg-black/40 border border-orange-500/20 rounded-lg text-orange-200/80 placeholder-orange-200/40 focus:outline-none focus:border-orange-500/40"
              />
            </div>
            <Button 
              type="submit" 
              disabled={!input.trim()}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 