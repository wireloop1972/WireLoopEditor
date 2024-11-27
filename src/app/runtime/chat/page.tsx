'use client';

import { useState, useRef, useEffect } from 'react';
import { useSwarm } from '@/hooks/useSwarm';
import { Send, Loader2, Settings, Brain, Activity } from 'lucide-react';
import Button from '@/components/ui/Button';
import { DEFAULT_RUNTIME_CONFIG, DEFAULT_RUNTIME_OPTIONS } from '@/config/runtime';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { agents, processTask } = useSwarm();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      await processTask({
        id: userMessage.id,
        priority: 1,
        state: { message: input },
        history: [],
      });

      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: 'Response processed through runtime environment',
        timestamp: Date.now(),
        status: 'sent',
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
              {agents.map(agent => (
                <div 
                  key={agent.id}
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
                <span className="text-orange-200/80">{DEFAULT_RUNTIME_CONFIG.maxConcurrentTasks}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-200/60">Swarm</span>
                <span className="text-green-500">Active</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-200/60">MCP</span>
                <span className="text-green-500">Connected</span>
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
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

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