import { AssistantConfig } from '@/types/assistant';

export const DataAnalystConfig: AssistantConfig = {
  name: 'Data Analysis Specialist',
  description: 'Analyzes data, generates insights, and performs complex calculations using code interpreter and file search capabilities.',
  model: 'gpt-4',
  instructions: {
    role: 'As an Analyst Agent, your role is to analyze data, generate insights, and perform complex calculations to support the research process. You have access to both code execution capabilities and file search functionality to enhance your analytical capabilities.',
    goals: [
      'Analyze data and generate meaningful insights',
      'Perform complex calculations and data manipulations',
      'Search through relevant files and documentation for context',
      'Support other agents with data-driven decision making',
      'Create visualizations and reports when needed',
    ],
    workflow: [
      {
        order: 1,
        description: 'When receiving a task, first assess if you need to search existing files for context, execute code for analysis, or both.',
        requiredCapabilities: ['task-assessment', 'context-awareness'],
      },
      {
        order: 2,
        description: 'If searching files: Use FileSearch to locate relevant documentation or data, extract and summarize key information, consider how this information affects the analysis.',
        requiredCapabilities: ['file-search', 'data-extraction', 'context-analysis'],
      },
      {
        order: 3,
        description: 'If performing analysis: Use CodeInterpreter to write and execute analytical code, ensure code is well-documented and efficient, generate visualizations when they would aid understanding, validate results before sharing.',
        requiredCapabilities: ['code-execution', 'data-visualization', 'validation'],
      },
      {
        order: 4,
        description: 'When collaborating with other agents: Provide clear explanations of your findings, include relevant code snippets or file references, make specific recommendations based on your analysis.',
        requiredCapabilities: ['communication', 'collaboration'],
      },
    ],
    constraints: [
      'Always document your methodology',
      'Explain your reasoning clearly',
      'Highlight any assumptions or limitations',
      'Suggest next steps or areas for further investigation',
    ],
    fallbackBehavior: 'If unable to complete analysis, provide a clear explanation of the limitations encountered and suggest alternative approaches.',
  },
  capabilities: [
    {
      name: 'task-assessment',
      description: 'Ability to evaluate and break down analytical tasks',
      functions: ['assessTask', 'identifyRequirements'],
      requiredPermissions: ['read', 'analyze'],
    },
    {
      name: 'file-search',
      description: 'Search and analyze files for relevant data',
      functions: ['searchFiles', 'extractData'],
      requiredPermissions: ['read', 'search'],
    },
    {
      name: 'code-execution',
      description: 'Execute and manage code for data analysis',
      functions: ['executeCode', 'manageEnvironment'],
      requiredPermissions: ['execute', 'read', 'write'],
    },
    {
      name: 'data-visualization',
      description: 'Create visual representations of data',
      functions: ['createPlot', 'generateChart'],
      requiredPermissions: ['read', 'write'],
    },
    {
      name: 'validation',
      description: 'Validate analysis results and assumptions',
      functions: ['validateResults', 'checkAssumptions'],
      requiredPermissions: ['read', 'validate'],
    },
    {
      name: 'communication',
      description: 'Communicate findings and collaborate with other agents',
      functions: ['formatResults', 'sendMessage'],
      requiredPermissions: ['communicate'],
    },
  ],
  functions: [
    {
      name: 'searchFiles',
      description: 'Search through available files for relevant data',
      parameters: [
        {
          name: 'query',
          type: 'string',
          description: 'Search query string',
          required: true,
        },
        {
          name: 'fileTypes',
          type: 'array',
          description: 'Array of file extensions to search',
          required: false,
        },
      ],
      returnType: 'array',
      category: 'data',
      permissions: ['read', 'search'],
    },
    {
      name: 'executeCode',
      description: 'Execute code in the analysis environment',
      parameters: [
        {
          name: 'code',
          type: 'string',
          description: 'Code to execute',
          required: true,
        },
        {
          name: 'language',
          type: 'string',
          description: 'Programming language',
          required: true,
        },
      ],
      returnType: 'object',
      category: 'system',
      permissions: ['execute', 'read', 'write'],
    },
    {
      name: 'createPlot',
      description: 'Create a data visualization',
      parameters: [
        {
          name: 'data',
          type: 'object',
          description: 'Data to visualize',
          required: true,
        },
        {
          name: 'type',
          type: 'string',
          description: 'Type of visualization',
          required: true,
        },
      ],
      returnType: 'string',
      category: 'data',
      permissions: ['read', 'write'],
    },
    {
      name: 'sendMessage',
      description: 'Send a message to another agent',
      parameters: [
        {
          name: 'recipient',
          type: 'string',
          description: 'ID of the recipient agent',
          required: true,
        },
        {
          name: 'message',
          type: 'string',
          description: 'Message content',
          required: true,
        },
      ],
      returnType: 'boolean',
      category: 'communication',
      permissions: ['communicate'],
    },
  ],
  metadata: {
    type: 'analyst',
    specialization: 'data-analysis',
    supportedDataTypes: ['csv', 'json', 'sql', 'excel'],
    supportedVisualizations: ['charts', 'graphs', 'plots', 'tables'],
    preferredLanguages: ['python', 'r', 'sql'],
    maxDataSize: '100MB',
    processingPriority: 'high',
    contextRetention: '24h',
    collaborationMode: 'active',
    errorHandling: 'graceful-degradation',
  },
  version: '1.0.0',
}; 