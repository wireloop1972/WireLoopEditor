import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { TaskContext } from '@/types/swarm';

export async function POST(request: Request) {
  try {
    const task = await request.json() as TaskContext;
    
    // Get the assigned agent ID from the task history
    const assignedAgentId = task.history[0]?.agentId;
    if (!assignedAgentId) {
      throw new Error('No agent assigned to this task');
    }

    // Create a new thread
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

    // Wait for completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status === 'failed') {
      throw new Error('Run failed');
    }

    // Get the response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data[0];

    if (lastMessage.role === 'assistant' && lastMessage.content.length > 0) {
      const textContent = lastMessage.content.find(
        content => content.type === 'text'
      );

      if (textContent?.type === 'text') {
        return NextResponse.json({
          response: textContent.text.value,
        });
      }
    }

    throw new Error('No response from assistant');
  } catch (error) {
    console.error('Error processing task:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process task' },
      { status: 500 }
    );
  }
} 