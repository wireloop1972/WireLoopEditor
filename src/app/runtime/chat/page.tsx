'use client';

import { useState, useRef, useEffect } from 'react';
import { useSwarm } from '@/hooks/useSwarm';
import { Send, Loader2, Settings, Brain, Activity, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { DEFAULT_RUNTIME_CONFIG, DEFAULT_RUNTIME_OPTIONS, RUNTIME_AGENT_ROLES } from '@/config/runtime';
import { RuntimeConfig, RuntimeOptions } from '@/config/runtime';
import { AgentRole } from '@/types/swarm';

type MessageStatus = 'sending' | 'sent' | 'error';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: MessageStatus;
  agentId?: string;
}

export default function RuntimeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeConfig>(DEFAULT_RUNTIME_CONFIG);
  const [runtimeOptions, setRuntimeOptions] = useState<RuntimeOptions>(DEFAULT_RUNTIME_OPTIONS);
  const [selectedAgentRoles, setSelectedAgentRoles] = useState<Set<string>>(new Set(RUNTIME_AGENT_ROLES.map(role => role.id)));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { agents, createAgent, processTask, deregisterAgent } = useSwarm();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize agents based on selected roles
  useEffect(() => {
    let isInitializing = true;

    const initializeAgents = async () => {
      try {
        // Create a map of existing agents by role ID
        const existingAgentRoles = new Map(
          agents.map(agent => [agent.role.id, agent])
        );

        // Create missing agents
        const createPromises = RUNTIME_AGENT_ROLES
          .filter(role => selectedAgentRoles.has(role.id) && !existingAgentRoles.has(role.id))
          .map(role => createAgent(role));

        if (createPromises.length > 0) {
          await Promise.all(createPromises);
        }

        // Remove deselected agents
        if (!isInitializing) {
          const removePromises = agents
            .filter(agent => !selectedAgentRoles.has(agent.role.id))
            .map(agent => deregisterAgent(agent.id));

          if (removePromises.length > 0) {
            await Promise.all(removePromises);
          }
        }
      } catch (error) {
        console.error('Error managing agents:', error);
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
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Get available agents
      const availableAgents = agents.filter(agent => agent.isAvailable);
      if (availableAgents.length === 0) {
        throw new Error('No available agents');
      }

      // Select the first available agent
      const selectedAgent = availableAgents[0];

      // Process the task with the selected agent
      await processTask({
        id: userMessage.id,
        priority: 1,
        state: { 
          message: input,
          runtimeConfig,
          runtimeOptions,
        },
        history: [{
          agentId: selectedAgent.id,
          action: 'assigned',
          timestamp: Date.now()
        }],
      });

      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: 'Response processed through runtime environment',
        timestamp: Date.now(),
        status: 'sent',
        agentId: selectedAgent.id,
      };

      setMessages(prev => [
        ...prev.map(m => 
          m.id === userMessage.id 
            ? { ...m, status: 'sent' as MessageStatus } 
            : m
        ),
        assistantMessage,
      ]);
    } catch (error) {
      setMessages(prev => 
        prev.map(m => 
          m.id === userMessage.id 
            ? { ...m, status: 'error' as MessageStatus } 
            : m
        )
      );
    } finally {
      setIsProcessing(false);
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
              {agents.map((agent, index) => (
                <div 
                  key={`${agent.id}-${index}`}
                  className="flex items-center text-sm text-orange-200/60"
                >
                  <Brain className="w-4 h-4 mr-2 text-orange-500" />
                  {agent.role.name}
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
        {/* Chat Header */}
        <div className="h-16 border-b border-orange-500/20 flex items-center justify-between px-6 bg-black/40 backdrop-blur-sm">
          <h1 className="text-xl font-semibold text-orange-500">Wire Loop Runtime</h1>
          <div className="flex items-center gap-4">
            <Activity className="w-5 h-5 text-green-500" />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute right-0 top-16 w-96 bg-black/90 border-l border-b border-orange-500/20 p-6 backdrop-blur-sm z-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-orange-500">Runtime Settings</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Runtime Options */}
              <div>
                <h3 className="text-sm font-medium text-orange-200/80 mb-3">Runtime Options</h3>
                <div className="space-y-2">
                  {Object.entries(runtimeOptions).map(([key, value], index) => (
                    <div key={`runtime-option-${key}-${index}`} className="flex items-center justify-between">
                      <label className="text-sm text-orange-200/60">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={e => setRuntimeOptions(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="form-checkbox h-4 w-4 text-orange-500 rounded border-orange-500/20 bg-black/40"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Runtime Config */}
              <div>
                <h3 className="text-sm font-medium text-orange-200/80 mb-3">Runtime Configuration</h3>
                <div className="space-y-2">
                  {Object.entries(runtimeConfig).map(([key, value], index) => (
                    <div key={`runtime-config-${key}-${index}`} className="flex items-center justify-between">
                      <label className="text-sm text-orange-200/60">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={e => setRuntimeConfig(prev => ({
                          ...prev,
                          [key]: parseInt(e.target.value)
                        }))}
                        className="w-24 px-2 py-1 text-sm bg-black/40 border border-orange-500/20 rounded text-orange-200/80"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Roles */}
              <div>
                <h3 className="text-sm font-medium text-orange-200/80 mb-3">Agent Roles</h3>
                <div className="space-y-2">
                  {RUNTIME_AGENT_ROLES.map((role, index) => (
                    <div key={`agent-role-${role.id}-${index}`} className="flex items-center justify-between">
                      <label className="text-sm text-orange-200/60 flex items-center">
                        <Brain className="w-4 h-4 mr-2 text-orange-500" />
                        {role.name}
                      </label>
                      <input
                        type="checkbox"
                        checked={selectedAgentRoles.has(role.id)}
                        onChange={e => {
                          const newRoles = new Set(selectedAgentRoles);
                          if (e.target.checked) {
                            newRoles.add(role.id);
                          } else {
                            newRoles.delete(role.id);
                          }
                          setSelectedAgentRoles(newRoles);
                        }}
                        className="form-checkbox h-4 w-4 text-orange-500 rounded border-orange-500/20 bg-black/40"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={`message-${message.id}-${index}`}
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
                disabled={isProcessing}
              />
              {isProcessing && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-orange-500" />
              )}
            </div>
            <Button 
              type="submit" 
              disabled={!input.trim() || isProcessing}
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