import Groq from 'groq-sdk';

// Create groq client lazily to avoid build errors if env var is missing
let groqInstance: Groq | null = null;
function getGroq() {
  if (!groqInstance) {
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY || 'placeholder_key',
    });
  }
  return groqInstance;
}
const SYSTEM_PROMPT = `You are NCCT AI Assistant — an expert on cooperative sector capacity building, Indian cooperative laws, accounting practices, management principles, and cooperative employment. You are part of the NCCT Digital Platform, built for the Ministry of Cooperation under Smart India Hackathon 2026.

Your responsibilities:
1. Answer questions about cooperative societies, their formation, management, and governance
2. Help learners understand course material related to cooperatives
3. Provide guidance on cooperative laws (Multi-State Cooperative Societies Act, State Cooperative Acts)
4. Assist with accounting and financial management for cooperatives
5. Guide on employment opportunities in the cooperative sector

Guidelines:
- Be concise but thorough
- Use bullet points and structured formatting when helpful
- Always cite the context/source material when available
- If unsure, say so rather than making up information
- Speak in a professional, educational tone
- Support both English and Hindi queries`;

export interface RAGContext {
  content: string;
  source: string | null;
  similarity: number;
}

/**
 * Generate a response from Groq LLM with RAG context.
 */
export async function generateRAGResponse(
  userQuery: string,
  contexts: RAGContext[],
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  const contextBlock = contexts.length > 0
    ? `\n\nRelevant Context from Knowledge Base:\n${contexts
        .map((c, i) => `[Source ${i + 1}${c.source ? `: ${c.source}` : ''}]\n${c.content}`)
        .join('\n\n')}`
    : '';

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT + contextBlock },
    ...chatHistory.slice(-6).map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: userQuery },
  ];

  const completion = await getGroq().chat.completions.create({
    model: 'openai/gpt-oss-20b',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.9,
  });

  return completion.choices[0]?.message?.content || 'I apologize, I could not generate a response. Please try again.';
}

/**
 * Generate embeddings using Groq or a fallback.
 * For MVP, we use a simple text-based similarity approach
 * since Groq doesn't provide embedding endpoints.
 * In production, use a dedicated embedding model.
 */
export function computeSimpleEmbedding(text: string): number[] {
  // Simple bag-of-words style embedding for MVP
  // In production, replace with sentence-transformers or OpenAI embeddings
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const vocab = new Map<string, number>();
  const embedding = new Array(384).fill(0);

  words.forEach((word, i) => {
    if (!vocab.has(word)) {
      vocab.set(word, vocab.size);
    }
    const idx = vocab.get(word)! % 384;
    embedding[idx] += 1 / (1 + i * 0.01); // position-weighted
  });

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
}
