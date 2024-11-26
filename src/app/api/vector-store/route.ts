import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const { fileId, model } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get the file content
    const file = await openai.files.retrieve(fileId);
    const fileContent = await openai.files.retrieveContent(fileId);

    // Create embeddings for the file content
    const embedding = await openai.embeddings.create({
      model: model || 'text-embedding-ada-002',
      input: fileContent,
    });

    // In a production environment, you would store these embeddings
    // in a vector database like Pinecone, Weaviate, or similar
    return NextResponse.json({
      success: true,
      fileId,
      fileName: file.filename,
      embedding_model: model,
      embedding_count: embedding.data.length,
    });
  } catch (error) {
    console.error('Error creating vector store:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create vector store' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const files = await openai.files.list();
    return NextResponse.json({
      vector_stores: files.data
        .filter(file => file.purpose === 'assistants')
        .map(file => ({
          id: file.id,
          filename: file.filename,
          created_at: file.created_at,
        })),
    });
  } catch (error) {
    console.error('Error listing vector stores:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list vector stores' },
      { status: 500 }
    );
  }
} 