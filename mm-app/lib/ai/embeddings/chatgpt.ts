import { ChatGPTProvider } from '@/lib/ai/providers/chatgpt';
import { env } from '@/lib/constants/env';

const OPENAI_DIMENSIONS = 1536;
export const EMBEDDINGS_TABLE = 'artwork_embeddings_chatgpt';

export const generateChatGPTEmbedding = async (text: string | string[]): Promise<number[][]> => {
  try {
    const client = new ChatGPTProvider({
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL
    });

    // Handle array of texts
    if (Array.isArray(text)) {
      const embeddings = await Promise.all(
        text.map(async (t) => {
          const result = await client.generateEmbeddings(t);
          return result.values;
        })
      );
      return embeddings;
    }

    // Handle single text
    const result = await client.generateEmbeddings(text);
    return [result.values];
  } catch (error) {
    console.error('Error generating ChatGPT embedding:', error);
    const placeholderEmbedding = new Array(OPENAI_DIMENSIONS).fill(0);
    return Array.isArray(text) ? text.map(() => placeholderEmbedding) : [placeholderEmbedding];
  }
}; 