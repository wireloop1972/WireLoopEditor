import { NextResponse } from 'next/server';
import { OpenAIService } from '@/services/openai';
import type { CreateAssistantParams } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const params = body as CreateAssistantParams;
    const assistant = await OpenAIService.createAssistant(params);
    return NextResponse.json(assistant);
  } catch (error) {
    console.error('Error creating assistant:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create assistant'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const assistants = await OpenAIService.listAssistants();
    return NextResponse.json(assistants);
  } catch (error) {
    console.error('Error listing assistants:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to list assistants'
      },
      { status: 500 }
    );
  }
} 