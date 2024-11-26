import { openai } from '@/lib/openai';
import { AgentRole, AgentState, TaskContext } from '@/types/swarm';
import { SwarmManager } from '@/lib/swarm/SwarmManager';

export class AgentService {
  private swarmManager: SwarmManager;

  constructor() {
    this.swarmManager = new SwarmManager({
      failureThreshold: 3,
      resetTimeout: 30000, // 30 seconds
    });
  }

  public async createAgent(role: AgentRole): Promise<AgentState> {
    try {
      // Create OpenAI assistant with specified role
      const assistant = await openai.beta.assistants.create({
        name: role.name,
        description: `AI Assistant specialized in ${role.specialization}`,
        model: 'gpt-4-1106-preview',
        tools: [{ type: 'code_interpreter' }],
        metadata: {
          capabilities: role.capabilities.join(','),
          specialization: role.specialization,
          priority: role.priority.toString(),
        },
      });

      // Create agent state
      const agentState: AgentState = {
        id: assistant.id,
        role,
        isAvailable: true,
        currentLoad: 0,
        relationships: new Map(),
      };

      // Register agent with swarm manager
      this.swarmManager.registerAgent(agentState);

      return agentState;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw new Error('Failed to create agent');
    }
  }

  public async processTask(task: TaskContext): Promise<void> {
    try {
      const assignedAgentId = await this.swarmManager.assignTask(task);
      const thread = await openai.beta.threads.create();

      // Add initial message to thread
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: JSON.stringify(task.state),
      });

      // Run the assistant
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assignedAgentId,
      });

      // Monitor the run
      await this.monitorRun(thread.id, run.id, task);
    } catch (error) {
      console.error('Error processing task:', error);
      throw new Error('Failed to process task');
    }
  }

  private async monitorRun(
    threadId: string,
    runId: string,
    task: TaskContext,
    retries = 0
  ): Promise<void> {
    const maxRetries = 3;
    const pollingInterval = 1000; // 1 second

    try {
      const run = await openai.beta.threads.runs.retrieve(threadId, runId);

      switch (run.status) {
        case 'completed':
          // Process completion
          const messages = await openai.beta.threads.messages.list(threadId);
          const lastMessage = messages.data[0];
          
          if (lastMessage.role === 'assistant' && lastMessage.content.length > 0) {
            const textContent = lastMessage.content.find(
              content => content.type === 'text'
            );
            
            if (textContent?.type === 'text') {
              task.state = {
                ...task.state,
                lastResponse: textContent.text.value,
              };
            }
          }
          break;

        case 'failed':
          if (retries < maxRetries) {
            // Retry with exponential backoff
            await new Promise(resolve => 
              setTimeout(resolve, pollingInterval * Math.pow(2, retries))
            );
            await this.monitorRun(threadId, runId, task, retries + 1);
          } else {
            throw new Error('Run failed after maximum retries');
          }
          break;

        case 'requires_action':
          // Handle required actions (function calls, etc.)
          // Implementation depends on specific requirements
          break;

        default:
          // Continue polling for non-terminal states
          await new Promise(resolve => setTimeout(resolve, pollingInterval));
          await this.monitorRun(threadId, runId, task, retries);
      }
    } catch (error) {
      console.error('Error monitoring run:', error);
      throw new Error('Failed to monitor run');
    }
  }

  public async handleHandoff(
    fromAgentId: string,
    toAgentId: string,
    taskId: string,
    context: TaskContext
  ): Promise<boolean> {
    return await this.swarmManager.requestHandoff({
      taskId,
      fromAgentId,
      toAgentId,
      context,
      timestamp: Date.now(),
    });
  }
} 