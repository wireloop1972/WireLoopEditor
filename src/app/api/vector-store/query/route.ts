import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const { query, fileIds } = await request.json();

    if (!query || !fileIds?.length) {
      return NextResponse.json(
        { error: 'Query and file IDs are required' },
        { status: 400 }
      );
    }

    // Create an embedding for the query
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });

    // Get content from all specified files
    const fileContents = await Promise.all(
      fileIds.map(async (fileId: string) => {
        const content = await openai.files.retrieveContent(fileId);
        return { fileId, content };
      })
    );

    // Create embeddings for all file contents
    const fileEmbeddings = await Promise.all(
      fileContents.map(async ({ fileId, content }) => {
        const embedding = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: content,
        });
        return { fileId, embedding: embedding.data[0] };
      })
    );

    // In a production environment, you would:
    // 1. Store these embeddings in a vector database
    // 2. Use the database's similarity search
    // 3. Return the most relevant results
    
    return NextResponse.json({
      query_embedding: queryEmbedding.data[0],
      file_embeddings: fileEmbeddings,
      // This is where you'd return actual similarity search results
      results: fileContents.map(({ fileId, content }) => ({
        fileId,
        preview: content.substring(0, 200) + '...',
      })),
    });
  } catch (error) {
    console.error('Error querying vector store:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to query vector store' },
      { status: 500 }
    );
  }
} 