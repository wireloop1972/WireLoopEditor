import { AgentService } from './AgentService';
import { MCPServer } from '@/lib/mcp/server';
import { RuntimeConfig, RuntimeOptions, DEFAULT_RUNTIME_CONFIG, DEFAULT_RUNTIME_OPTIONS } from '@/config/runtime';
import { TaskContext } from '@/types/swarm';
import { EventEmitter } from 'events';

export class RuntimeService extends EventEmitter {
  private config: RuntimeConfig;
  private options: RuntimeOptions;
  private agentService: AgentService;
  private mcpServer: MCPServer | null;
  private activeTasks: Map<string, TaskContext>;

  constructor(
    config: Partial<RuntimeConfig> = {},
    options: Partial<RuntimeOptions> = {}
  ) {
    super();
    this.config = { ...DEFAULT_RUNTIME_CONFIG, ...config };
    this.options = { ...DEFAULT_RUNTIME_OPTIONS, ...options };
    this.agentService = new AgentService();
    this.mcpServer = null;
    this.activeTasks = new Map();
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize agent swarm if enabled
      if (this.options.enableSwarm) {
        await this.initializeSwarm();
      }

      // Initialize MCP server if enabled
      if (this.options.enableMCP) {
        await this.initializeMCP();
      }

      this.emit('initialized');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  private async initializeSwarm(): Promise<void> {
    try {
      // Initialize swarm-specific components
      this.emit('swarmInitialized');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  private async initializeMCP(): Promise<void> {
    try {
      // Initialize MCP-specific components
      this.emit('mcpInitialized');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  public async processTask(task: TaskContext): Promise<void> {
    if (this.activeTasks.size >= this.config.maxConcurrentTasks) {
      throw new Error('Maximum concurrent tasks reached');
    }

    try {
      this.activeTasks.set(task.id, task);
      this.emit('taskStarted', task.id);

      // Process task through agent swarm
      if (this.options.enableSwarm) {
        await this.agentService.processTask(task);
      }

      // Update task context through MCP
      if (this.options.enableMCP && this.mcpServer) {
        // Handle MCP context updates
      }

      this.activeTasks.delete(task.id);
      this.emit('taskCompleted', task.id);
    } catch (error) {
      this.activeTasks.delete(task.id);
      this.emit('taskFailed', { taskId: task.id, error });
      throw error;
    }
  }

  public getActiveTaskCount(): number {
    return this.activeTasks.size;
  }

  public getStatus(): {
    swarmActive: boolean;
    mcpActive: boolean;
    activeTasks: number;
    config: RuntimeConfig;
    options: RuntimeOptions;
  } {
    return {
      swarmActive: this.options.enableSwarm,
      mcpActive: Boolean(this.mcpServer),
      activeTasks: this.activeTasks.size,
      config: this.config,
      options: this.options,
    };
  }

  public async shutdown(): Promise<void> {
    try {
      // Wait for active tasks to complete
      if (this.activeTasks.size > 0) {
        this.emit('shuttingDown');
        // Implement graceful shutdown logic
      }

      // Cleanup resources
      if (this.mcpServer) {
        await this.mcpServer.stop();
      }

      this.emit('shutdown');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
} 