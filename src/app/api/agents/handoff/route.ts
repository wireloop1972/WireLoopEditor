import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { TaskContext } from '@/types/swarm';

interface HandoffRequest {
  fromAgentId: string;
  toAgentId: string;
  taskId: string;
  context: TaskContext;
}

export async function POST(request: Request) {
  try {
    const { fromAgentId, toAgentId, taskId, context } = await request.json() as HandoffRequest;

    // Create a new thread for the handoff
    const thread = await openai.beta.threads.create();

    // Add context to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: JSON.stringify({
        ...context.state,
        handoff: {
          from: fromAgentId,
          to: toAgentId,
          taskId,
        },
      }),
    });

    // Run with the new agent
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: toAgentId,
    });

    // Wait for completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status === 'failed') {
      throw new Error('Handoff failed');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling handoff:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to handle handoff' },
      { status: 500 }
    );
  }
} 