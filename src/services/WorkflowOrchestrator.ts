import { EventEmitter } from 'events';
import {
  WorkflowDefinition,
  WorkflowExecutionState,
  WorkflowState,
  WorkflowStep,
  WorkflowStepState,
  WorkflowEvent,
  WorkflowError,
  WorkflowErrorType,
  WorkflowMetrics,
} from '../types/workflow';
import { SwarmManager } from '../lib/swarm/SwarmManager';
import { TaskPlanner } from '../lib/swarm/TaskPlanner';
import { CircuitBreaker, CircuitBreakerConfig } from '@/utils/CircuitBreaker';

export class WorkflowOrchestrator extends EventEmitter {
  private activeWorkflows: Map<string, WorkflowExecutionState>;
  private workflowDefinitions: Map<string, WorkflowDefinition>;
  private metrics: Map<string, WorkflowMetrics>;
  private circuitBreaker: CircuitBreaker;

  constructor(
    private swarmManager: SwarmManager,
    private taskPlanner: TaskPlanner,
  ) {
    super();
    this.activeWorkflows = new Map();
    this.workflowDefinitions = new Map();
    this.metrics = new Map();
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000,
    });
  }

  public registerWorkflow(workflow: WorkflowDefinition): void {
    // Validate workflow definition
    this.validateWorkflow(workflow);
    this.workflowDefinitions.set(workflow.id, workflow);
    this.metrics.set(workflow.id, {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageDuration: 0,
      stepMetrics: {},
    });
  }

  public async startWorkflow(workflowId: string, input: Record<string, any> = {}): Promise<string> {
    const workflow = this.workflowDefinitions.get(workflowId);
    if (!workflow) {
      throw new WorkflowError(
        WorkflowErrorType.VALIDATION_ERROR,
        `Workflow ${workflowId} not found`
      );
    }

    // Create execution state
    const executionId = `${workflowId}-${Date.now()}`;
    const executionState: WorkflowExecutionState = {
      workflowId,
      status: 'created',
      currentSteps: [...workflow.initialSteps],
      completedSteps: [],
      failedSteps: [],
      stepStates: {},
      startTime: new Date(),
      result: { input },
    };

    this.activeWorkflows.set(executionId, executionState);
    this.emit(WorkflowEvent.WORKFLOW_STARTED, { executionId, workflowId });

    // Start execution
    try {
      await this.executeWorkflow(executionId);
      return executionId;
    } catch (error) {
      if (error instanceof Error) {
        this.handleWorkflowError(executionId, error);
      } else {
        this.handleWorkflowError(
          executionId,
          new Error('Unknown error occurred during workflow execution')
        );
      }
      throw error;
    }
  }

  private async executeWorkflow(executionId: string): Promise<void> {
    const state = this.activeWorkflows.get(executionId)!;
    const workflow = this.workflowDefinitions.get(state.workflowId)!;

    state.status = 'executing';

    while (state.currentSteps.length > 0) {
      const stepPromises = state.currentSteps.map(stepId => 
        this.executeStep(executionId, workflow.steps.find(s => s.id === stepId)!)
      );

      try {
        await Promise.all(stepPromises);
        
        // Update current steps based on completion and workflow definition
        state.currentSteps = this.determineNextSteps(executionId);
        
        if (state.currentSteps.length === 0) {
          state.status = 'completed';
          state.endTime = new Date();
          this.emit(WorkflowEvent.WORKFLOW_COMPLETED, { executionId, result: state.result });
          this.updateMetrics(state.workflowId, true, state.startTime);
        }
      } catch (error) {
        throw new WorkflowError(
          WorkflowErrorType.EXECUTION_ERROR,
          'Workflow execution failed',
          error
        );
      }
    }
  }

  private async executeStep(executionId: string, step: WorkflowStep): Promise<void> {
    const state = this.activeWorkflows.get(executionId)!;
    
    // Initialize step state
    const stepState: WorkflowStepState = {
      stepId: step.id,
      status: 'created',
      startTime: new Date(),
      retryCount: 0,
      result: null,
    };
    state.stepStates[step.id] = stepState;

    try {
      // Check circuit breaker
      await this.circuitBreaker.execute(async () => {
        stepState.status = 'executing';
        this.emit(WorkflowEvent.STEP_STARTED, { executionId, stepId: step.id });

        switch (step.type) {
          case 'task':
            await this.executeTaskStep(executionId, step);
            break;
          case 'parallel':
            await this.executeParallelStep(executionId, step);
            break;
          case 'condition':
            await this.executeConditionStep(executionId, step);
            break;
          case 'handoff':
            await this.executeHandoffStep(executionId, step);
            break;
          // Implement other step types...
        }

        stepState.status = 'completed';
        stepState.endTime = new Date();
        this.emit(WorkflowEvent.STEP_COMPLETED, { 
          executionId, 
          stepId: step.id,
          result: stepState.result 
        });
      });
    } catch (error) {
      stepState.status = 'failed';
      if (error instanceof Error) {
        stepState.error = error.message;
      } else {
        stepState.error = 'Unknown error occurred during step execution';
      }
      this.emit(WorkflowEvent.STEP_FAILED, { 
        executionId, 
        stepId: step.id,
        error 
      });

      if (stepState.retryCount < step.maxRetries) {
        stepState.retryCount++;
        return this.executeStep(executionId, step);
      }

      throw error;
    }
  }

  private async executeTaskStep(executionId: string, step: WorkflowStep): Promise<void> {
    const state = this.activeWorkflows.get(executionId)!;
    const stepState = state.stepStates[step.id];

    if (!step.tasks?.length) {
      throw new WorkflowError(
        WorkflowErrorType.VALIDATION_ERROR,
        'Task step must have at least one task'
      );
    }

    // Get available agent with required capabilities
    const agent = await this.swarmManager.findAvailableAgent(step.requiredCapabilities);
    if (!agent) {
      throw new WorkflowError(
        WorkflowErrorType.AGENT_ERROR,
        'No available agent with required capabilities'
      );
    }

    stepState.assignedAgentId = agent.id;
    
    // Execute tasks using task planner
    const result = await this.taskPlanner.executeTasks(agent, step.tasks);
    stepState.result = result;
  }

  private async executeParallelStep(executionId: string, step: WorkflowStep): Promise<void> {
    if (!step.tasks?.length) {
      throw new WorkflowError(
        WorkflowErrorType.VALIDATION_ERROR,
        'Parallel step must have tasks defined'
      );
    }

    const agents = await this.swarmManager.findAvailableAgents(
      step.requiredCapabilities,
      step.tasks.length
    );

    if (agents.length < step.tasks.length) {
      throw new WorkflowError(
        WorkflowErrorType.AGENT_ERROR,
        'Insufficient agents for parallel execution'
      );
    }

    const taskPromises = step.tasks.map((task, index) =>
      this.taskPlanner.executeTasks(agents[index], [task])
    );

    const results = await Promise.all(taskPromises);
    this.activeWorkflows.get(executionId)!.stepStates[step.id].result = results;
  }

  private async executeConditionStep(executionId: string, step: WorkflowStep): Promise<void> {
    const state = this.activeWorkflows.get(executionId)!;
    const stepState = state.stepStates[step.id];

    if (!step.condition) {
      throw new WorkflowError(
        WorkflowErrorType.VALIDATION_ERROR,
        'Condition step must have a condition defined'
      );
    }

    try {
      let result = false;
      if (step.condition.type === 'custom' && step.condition.customEval) {
        const evalResult = await step.condition.customEval(state.result);
        result = Boolean(evalResult);
      } else {
        result = this.evaluateCondition(step.condition, state.result);
      }

      stepState.result = result;
      this.emit(WorkflowEvent.CONDITION_EVALUATED, {
        executionId,
        stepId: step.id,
        result
      });
    } catch (error) {
      throw new WorkflowError(
        WorkflowErrorType.CONDITION_ERROR,
        'Condition evaluation failed',
        error
      );
    }
  }

  private async executeHandoffStep(executionId: string, step: WorkflowStep): Promise<void> {
    const state = this.activeWorkflows.get(executionId)!;
    const stepState = state.stepStates[step.id];

    this.emit(WorkflowEvent.HANDOFF_INITIATED, {
      executionId,
      stepId: step.id
    });

    try {
      const sourceAgent = await this.swarmManager.getAgent(stepState.assignedAgentId!);
      const targetAgent = await this.swarmManager.findAvailableAgent(step.requiredCapabilities);

      if (!targetAgent) {
        throw new WorkflowError(
          WorkflowErrorType.AGENT_ERROR,
          'No available agent for handoff'
        );
      }

      await this.swarmManager.handleAgentHandoff(sourceAgent, targetAgent, state.result);
      stepState.assignedAgentId = targetAgent.id;

      this.emit(WorkflowEvent.HANDOFF_COMPLETED, {
        executionId,
        stepId: step.id,
        sourceAgentId: sourceAgent.id,
        targetAgentId: targetAgent.id
      });
    } catch (error) {
      throw new WorkflowError(
        WorkflowErrorType.HANDOFF_ERROR,
        'Agent handoff failed',
        error
      );
    }
  }

  private determineNextSteps(executionId: string): string[] {
    const state = this.activeWorkflows.get(executionId)!;
    const workflow = this.workflowDefinitions.get(state.workflowId)!;
    const nextSteps = new Set<string>();

    // Process completed steps
    for (const stepId of state.currentSteps) {
      const stepState = state.stepStates[stepId];
      const step = workflow.steps.find(s => s.id === stepId)!;

      if (stepState.status === 'completed') {
        state.completedSteps.push(stepId);
        if (step.onSuccess) {
          step.onSuccess.forEach(id => nextSteps.add(id));
        }
      } else if (stepState.status === 'failed') {
        state.failedSteps.push(stepId);
        if (step.onFailure) {
          step.onFailure.forEach(id => nextSteps.add(id));
        }
      }
    }

    return Array.from(nextSteps);
  }

  private validateWorkflow(workflow: WorkflowDefinition): void {
    // Validate step references
    const stepIds = new Set(workflow.steps.map(s => s.id));
    
    // Check initial steps exist
    if (!workflow.initialSteps.every(id => stepIds.has(id))) {
      throw new WorkflowError(
        WorkflowErrorType.VALIDATION_ERROR,
        'Invalid initial step reference'
      );
    }

    // Check step references in onSuccess/onFailure
    workflow.steps.forEach(step => {
      if (step.onSuccess?.some(id => !stepIds.has(id))) {
        throw new WorkflowError(
          WorkflowErrorType.VALIDATION_ERROR,
          `Invalid onSuccess reference in step ${step.id}`
        );
      }
      if (step.onFailure?.some(id => !stepIds.has(id))) {
        throw new WorkflowError(
          WorkflowErrorType.VALIDATION_ERROR,
          `Invalid onFailure reference in step ${step.id}`
        );
      }
    });
  }

  private evaluateCondition(
    condition: NonNullable<WorkflowStep['condition']>,
    context: Record<string, any>
  ): boolean {
    const value = context[condition.field];
    
    switch (condition.type) {
      case 'equals':
        return value === condition.value;
      case 'contains':
        return value?.includes?.(condition.value);
      case 'greater':
        return value > condition.value;
      case 'less':
        return value < condition.value;
      case 'exists':
        return value !== undefined && value !== null;
      default:
        throw new WorkflowError(
          WorkflowErrorType.CONDITION_ERROR,
          `Unsupported condition type: ${condition.type}`
        );
    }
  }

  private updateMetrics(workflowId: string, success: boolean, startTime: Date): void {
    const metrics = this.metrics.get(workflowId)!;
    const duration = Date.now() - startTime.getTime();

    metrics.totalExecutions++;
    if (success) {
      metrics.successfulExecutions++;
    } else {
      metrics.failedExecutions++;
    }

    metrics.averageDuration = (
      (metrics.averageDuration * (metrics.totalExecutions - 1) + duration) /
      metrics.totalExecutions
    );
  }

  public getWorkflowState(executionId: string): WorkflowExecutionState {
    const state = this.activeWorkflows.get(executionId);
    if (!state) {
      throw new WorkflowError(
        WorkflowErrorType.VALIDATION_ERROR,
        `Workflow execution ${executionId} not found`
      );
    }
    return state;
  }

  public getWorkflowMetrics(workflowId: string): WorkflowMetrics {
    const metrics = this.metrics.get(workflowId);
    if (!metrics) {
      throw new WorkflowError(
        WorkflowErrorType.VALIDATION_ERROR,
        `Workflow ${workflowId} not found`
      );
    }
    return metrics;
  }

  private handleWorkflowError(executionId: string, error: Error): void {
    const state = this.activeWorkflows.get(executionId)!;
    state.status = 'failed';
    state.error = error.message;
    state.endTime = new Date();
    
    this.emit(WorkflowEvent.WORKFLOW_FAILED, {
      executionId,
      error
    });

    this.updateMetrics(state.workflowId, false, state.startTime);
  }
} 