import { openai } from '@/lib/openai';
import type { AssistantCreateParams, AssistantUpdateParams } from 'openai/resources/beta/assistants';
import {
  AssistantConfig,
  FunctionDefinition,
  validateAssistantConfig,
  RuntimeConfig,
  Capability,
  FunctionParameter,
} from '@/types/assistant';

export class AssistantService {
  private static instance: AssistantService;
  private assistantConfigs: Map<string, AssistantConfig>;

  private constructor() {
    this.assistantConfigs = new Map();
  }

  public static getInstance(): AssistantService {
    if (!AssistantService.instance) {
      AssistantService.instance = new AssistantService();
    }
    return AssistantService.instance;
  }

  /**
   * Create a new assistant with OpenAI and store its configuration
   */
  public async createAssistant(config: AssistantConfig): Promise<string> {
    try {
      // Validate the configuration
      const validConfig = validateAssistantConfig(config);

      // Convert functions to OpenAI format
      const tools = this.convertFunctionsToTools(validConfig.functions);

      // Create the assistant with OpenAI
      const assistant = await openai.beta.assistants.create({
        name: validConfig.name,
        description: validConfig.description,
        model: validConfig.model,
        instructions: this.formatInstructions(validConfig.instructions),
        tools,
        metadata: {
          ...validConfig.metadata,
          version: validConfig.version,
          capabilities: validConfig.capabilities.map((c: Capability) => c.name),
        },
      } satisfies AssistantCreateParams);

      // Store the configuration with the assistant ID
      const configWithId = { ...validConfig, id: assistant.id };
      this.assistantConfigs.set(assistant.id, configWithId);

      return assistant.id;
    } catch (error) {
      console.error('Error creating assistant:', error);
      throw error;
    }
  }

  /**
   * Update an existing assistant's configuration
   */
  public async updateAssistant(
    assistantId: string,
    config: Partial<AssistantConfig>
  ): Promise<void> {
    try {
      const existingConfig = this.assistantConfigs.get(assistantId);
      if (!existingConfig) {
        throw new Error('Assistant configuration not found');
      }

      // Merge and validate the new configuration
      const updatedConfig = validateAssistantConfig({
        ...existingConfig,
        ...config,
      });

      // Convert functions to OpenAI format
      const tools = this.convertFunctionsToTools(updatedConfig.functions);

      // Update the assistant with OpenAI
      await openai.beta.assistants.update(assistantId, {
        name: updatedConfig.name,
        description: updatedConfig.description,
        model: updatedConfig.model,
        instructions: this.formatInstructions(updatedConfig.instructions),
        tools,
        metadata: {
          ...updatedConfig.metadata,
          version: updatedConfig.version,
          capabilities: updatedConfig.capabilities.map((c: Capability) => c.name),
        },
      } satisfies AssistantUpdateParams);

      // Update stored configuration
      this.assistantConfigs.set(assistantId, updatedConfig);
    } catch (error) {
      console.error('Error updating assistant:', error);
      throw error;
    }
  }

  /**
   * Get an assistant's configuration
   */
  public getAssistantConfig(assistantId: string): AssistantConfig | undefined {
    return this.assistantConfigs.get(assistantId);
  }

  /**
   * Delete an assistant and its configuration
   */
  public async deleteAssistant(assistantId: string): Promise<void> {
    try {
      await openai.beta.assistants.del(assistantId);
      this.assistantConfigs.delete(assistantId);
    } catch (error) {
      console.error('Error deleting assistant:', error);
      throw error;
    }
  }

  /**
   * Convert function definitions to OpenAI tool format
   */
  private convertFunctionsToTools(functions: FunctionDefinition[]): AssistantCreateParams['tools'] {
    return functions.map(func => ({
      type: 'function',
      function: {
        name: func.name,
        description: func.description,
        parameters: {
          type: 'object',
          properties: func.parameters.reduce(
            (acc: Record<string, unknown>, param: FunctionParameter) => ({
              ...acc,
              [param.name]: {
                type: param.type,
                description: param.description,
                ...(param.schema || {}),
              },
            }),
            {}
          ),
          required: func.parameters
            .filter((param: FunctionParameter) => param.required)
            .map((param: FunctionParameter) => param.name),
        },
      },
    }));
  }

  /**
   * Format instructions into a single string for OpenAI
   */
  private formatInstructions(instructions: AssistantConfig['instructions']): string {
    return `
# Agent Role
${instructions.role}

# Goals
${instructions.goals.map((goal: string, index: number) => `${index + 1}. ${goal}`).join('\n')}

# Process Workflow
${instructions.workflow
  .sort((a, b) => a.order - b.order)
  .map(
    (step) => `${step.order}. ${step.description}
   Required Capabilities: ${step.requiredCapabilities.join(', ')}
   ${step.expectedOutcome ? `Expected Outcome: ${step.expectedOutcome}` : ''}`
  )
  .join('\n\n')}

${
  instructions.constraints.length > 0
    ? `# Constraints\n${instructions.constraints
        .map((constraint: string, index: number) => `${index + 1}. ${constraint}`)
        .join('\n')}`
    : ''
}

${
  instructions.fallbackBehavior
    ? `# Fallback Behavior\n${instructions.fallbackBehavior}`
    : ''
}`.trim();
  }
} 