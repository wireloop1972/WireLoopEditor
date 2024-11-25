import { NextResponse } from 'next/server';
import { OpenAIService } from '@/services/openai';
import type { CreateAssistantParams } from '@/lib/openai';

interface RouteParams {
  params: {
    assistantId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const assistant = await OpenAIService.getAssistant(params.assistantId);
    return NextResponse.json(assistant);
  } catch (error) {
    console.error('Error getting assistant:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get assistant'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const response = await OpenAIService.deleteAssistant(params.assistantId);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting assistant:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to delete assistant'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const updateParams = body as Partial<CreateAssistantParams>;
    const assistant = await OpenAIService.updateAssistant(params.assistantId, updateParams);
    return NextResponse.json(assistant);
  } catch (error) {
    console.error('Error updating assistant:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update assistant'
      },
      { status: 500 }
    );
  }
} 