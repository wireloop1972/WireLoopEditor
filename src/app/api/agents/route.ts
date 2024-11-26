import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { AgentRole } from '@/types/swarm';
import { DEFAULT_AGENT_ROLES } from '@/config/swarm';

// Helper function to check if an assistant is a swarm agent
function isSwarmAgent(assistant: any): boolean {
  return assistant.metadata && 
         assistant.metadata.specialization && 
         assistant.metadata.capabilities && 
         assistant.metadata.priority;
}

// Helper function to convert OpenAI assistant to agent state
function assistantToAgentState(assistant: any, role: AgentRole) {
  return {
    id: assistant.id,
    role,
    isAvailable: true,
    currentLoad: 0,
    relationships: {},
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = body as AgentRole;
    
    // Check if an agent with this role already exists
    const existingAssistants = await openai.beta.assistants.list({ limit: 100 });
    const existingAgent = existingAssistants.data.find(
      assistant => isSwarmAgent(assistant) && assistant.name === role.name
    );

    if (existingAgent) {
      return NextResponse.json(assistantToAgentState(existingAgent, role));
    }

    // Create new agent if it doesn't exist
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

    return NextResponse.json(assistantToAgentState(assistant, role));
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create agent' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get existing assistants
    const existingAssistants = await openai.beta.assistants.list({ limit: 100 });
    const existingAgents = new Map(
      existingAssistants.data
        .filter(isSwarmAgent)
        .map(assistant => [assistant.name, assistant])
    );

    // Initialize agents, reusing existing ones or creating new ones as needed
    const agents = await Promise.all(
      DEFAULT_AGENT_ROLES.map(async (role) => {
        const existingAssistant = existingAgents.get(role.name);
        
        if (existingAssistant) {
          return assistantToAgentState(existingAssistant, role);
        }

        // Create new agent if it doesn't exist
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

        return assistantToAgentState(assistant, role);
      })
    );

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error initializing agents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initialize agents' },
      { status: 500 }
    );
  }
} 