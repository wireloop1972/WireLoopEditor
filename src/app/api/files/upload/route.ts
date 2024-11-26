import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import type { FilePurpose } from 'openai/resources/files';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const purpose = formData.get('purpose') as FilePurpose;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for OpenAI API
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new Blob([buffer]).stream();
    const chunks = [];
    const reader = stream.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const response = await openai.files.create({
      file: new Blob(chunks, { type: file.type }) as unknown as File,
      purpose: purpose || 'assistants',
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
} 