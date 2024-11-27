import { 
  AgentState, 
  TaskContext, 
  HandoffRequest, 
  Agent,
  AgentCapability
} from '@/types/swarm';
import { CircuitBreaker, CircuitBreakerConfig } from '@/utils/CircuitBreaker';

class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  get length(): number {
    return this.items.length;
  }
}

export class SwarmManager {
  private agents: Map<string, Agent> = new Map();
  private activeThreads: Map<string, TaskContext> = new Map();
  private handoffQueue: Queue<HandoffRequest> = new Queue();
  private circuitBreaker: CircuitBreaker;

  constructor(config: CircuitBreakerConfig) {
    this.circuitBreaker = new CircuitBreaker(config);
  }

  public registerAgent(agent: AgentState): void {
    this.agents.set(agent.id, agent);
  }

  public deregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
  }

  public async assignTask(taskContext: TaskContext): Promise<string> {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.isAvailable)
      .sort((a, b) => {
        // Sort by load and priority
        if (a.currentLoad !== b.currentLoad) {
          return a.currentLoad - b.currentLoad;
        }
        return b.role.priority - a.role.priority;
      });

    if (availableAgents.length === 0) {
      throw new Error('No available agents');
    }

    const selectedAgent = availableAgents[0];
    selectedAgent.currentLoad++;
    this.activeThreads.set(taskContext.id, taskContext);
    
    return selectedAgent.id;
  }

  public async requestHandoff(request: HandoffRequest): Promise<boolean> {
    if (!this.circuitBreaker.canExecute()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const targetAgent = this.agents.get(request.toAgentId);
      if (!targetAgent || !targetAgent.isAvailable) {
        throw new Error('Target agent unavailable');
      }

      this.handoffQueue.enqueue(request);
      const success = await this.processHandoff(request);
      
      if (success) {
        this.circuitBreaker.recordSuccess();
        return true;
      } else {
        throw new Error('Handoff failed');
      }
    } catch (error) {
      this.circuitBreaker.recordFailure();
      throw error;
    }
  }

  private async processHandoff(request: HandoffRequest): Promise<boolean> {
    const sourceAgent = this.agents.get(request.fromAgentId);
    const targetAgent = this.agents.get(request.toAgentId);

    if (!sourceAgent || !targetAgent) {
      return false;
    }

    // Update task context
    const taskContext = this.activeThreads.get(request.taskId);
    if (!taskContext) return false;

    taskContext.history.push({
      agentId: request.fromAgentId,
      action: 'handoff',
      timestamp: Date.now()
    });

    // Update agent loads
    sourceAgent.currentLoad--;
    targetAgent.currentLoad++;

    // Update relationship strength
    const currentStrength = sourceAgent.relationships.get(request.toAgentId) || 0;
    sourceAgent.relationships.set(request.toAgentId, currentStrength + 1);

    return true;
  }

  public getAgentLoad(agentId: string): number {
    return this.agents.get(agentId)?.currentLoad || 0;
  }

  public getActiveThreads(): Map<string, TaskContext> {
    return new Map(this.activeThreads);
  }

  public getHandoffQueueLength(): number {
    return this.handoffQueue.length;
  }

  public async findAvailableAgent(requiredCapabilities: string[]): Promise<Agent | null> {
    const agents = Array.from(this.agents.values());
    return agents.find(agent => 
      agent.isAvailable && 
      requiredCapabilities.every(cap => agent.capabilities.includes(cap as AgentCapability))
    ) || null;
  }

  public async findAvailableAgents(requiredCapabilities: string[], count: number): Promise<Agent[]> {
    const agents = Array.from(this.agents.values())
      .filter(agent => 
        agent.isAvailable && 
        requiredCapabilities.every(cap => agent.capabilities.includes(cap as AgentCapability))
      );
    return agents.slice(0, count);
  }

  public async getAgent(agentId: string): Promise<Agent> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    return agent;
  }

  public async handleAgentHandoff(
    sourceAgent: Agent,
    targetAgent: Agent,
    context: Record<string, any>
  ): Promise<void> {
    // Implement handoff logic
    sourceAgent.isAvailable = true;
    targetAgent.isAvailable = false;
    targetAgent.context = { ...targetAgent.context, ...context };
  }
} 