import { NextRequest, NextResponse } from 'next/server';
import { generateRAGResponse, computeSimpleEmbedding } from '@/lib/rag/groqClient';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { query, history = [] } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Step 1: Search for relevant documents using text similarity
    // For MVP, we use text-based search since pgvector requires proper embeddings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: documents }: { data: any } = await supabase
      .from('documents')
      .select('content, source')
      .textSearch('content', query.split(' ').join(' & '), { type: 'plain' })
      .limit(5);

    // Fallback: simple ILIKE search if full-text search returns nothing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let contexts = (documents || []).map((doc: any) => ({
      content: doc.content,
      source: doc.source,
      similarity: 0.8,
    }));

    if (contexts.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: fallbackDocs }: { data: any } = await supabase
        .from('documents')
        .select('content, source')
        .ilike('content', `%${query.split(' ').slice(0, 3).join('%')}%`)
        .limit(3);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contexts = (fallbackDocs || []).map((doc: any) => ({
        content: doc.content,
        source: doc.source,
        similarity: 0.5,
      }));
    }

    // Step 2: Generate response using Groq
    const response = await generateRAGResponse(query, contexts, history);

    return NextResponse.json({
      response,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sources: contexts.map((c: any) => ({ content: c.content.slice(0, 200), source: c.source })),
    });
  } catch (error) {
    console.error('RAG chat error:', error);
    return NextResponse.json(
      {
        response:
          "I apologize, but I'm having trouble processing your request right now. This could be due to API limits or connectivity issues. Please try again in a moment.",
        sources: [],
      },
      { status: 200 } // Return 200 so the UI handles it gracefully
    );
  }
}
