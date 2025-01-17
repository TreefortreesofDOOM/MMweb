import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/lib/constants/env';

const GEMINI_DIMENSIONS = 768;
export const EMBEDDINGS_TABLE = 'artwork_embeddings_gemini';

// Initialize client lazily
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient() {
  if (!genAI) {
    const apiKey = env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Gemini API key in environment variables (GOOGLE_AI_API_KEY)');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export const generateGeminiEmbedding = async (text: string | string[]): Promise<number[][]> => {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });

    // Handle array of texts
    if (Array.isArray(text)) {
      const embeddings = await Promise.all(
        text.map(async (t) => {
          const result = await model.embedContent(t);
          return result.embedding.values;
        })
      );
      return embeddings;
    }

    // Handle single text
    const result = await model.embedContent(text);
    return [result.embedding.values];
  } catch (error) {
    console.error('Error generating Gemini embedding:', error);
    const placeholderEmbedding = new Array(GEMINI_DIMENSIONS).fill(0);
    return Array.isArray(text) ? text.map(() => placeholderEmbedding) : [placeholderEmbedding];
  }
}; 