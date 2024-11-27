import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

interface OpenAIError extends Error {
  status?: number;
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    try {
      // Try to delete the assistant from OpenAI
      await openai.beta.assistants.del(id);
    } catch (error: any) {
      // If the assistant doesn't exist, we still want to remove it from our local state
      if (error?.status === 404) {
        return NextResponse.json({ success: true });
      }
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent:', error);
    const apiError = error as OpenAIError;
    return NextResponse.json(
      { error: apiError.message || 'Failed to delete agent' },
      { status: apiError.status || 500 }
    );
  }
} 