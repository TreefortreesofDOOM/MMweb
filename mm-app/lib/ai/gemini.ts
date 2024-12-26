import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const defaultConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

interface GenerateOptions {
  context?: string;
  imageUrl?: string;
  imageBase64?: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

export async function getGeminiResponse(
  prompt: string,
  options: GenerateOptions = {}
) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
  
  // Use vision model if image is provided, otherwise use text model
  const model = genAI.getGenerativeModel({ 
    model: options.imageUrl || options.imageBase64 ? 'gemini-1.5-flash' : 'gemini-pro'
  });

  const generationConfig = {
    temperature: options.temperature ?? defaultConfig.temperature,
    topK: options.topK ?? defaultConfig.topK,
    topP: options.topP ?? defaultConfig.topP,
    maxOutputTokens: options.maxOutputTokens ?? defaultConfig.maxOutputTokens,
  };

  const context = options.context ? `${options.context}\n\n` : '';
  const fullPrompt = `${context}${prompt}`;

  let contents;
  if (options.imageUrl || options.imageBase64) {
    try {
      let base64Data: string;
      let mimeType = 'image/jpeg';

      if (options.imageUrl) {
        const response = await fetch(options.imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType?.startsWith('image/')) {
          throw new Error('Invalid image format');
        }
        mimeType = contentType;
        const arrayBuffer = await response.arrayBuffer();
        base64Data = Buffer.from(arrayBuffer).toString('base64');
      } else if (options.imageBase64) {
        const [, data] = options.imageBase64.split(',');
        base64Data = data || options.imageBase64;
      } else {
        throw new Error('No image data available');
      }

      contents = [{
        role: 'user',
        parts: [
          { text: fullPrompt },
          {
            inlineData: {
              mimeType,
              data: base64Data
            }
          }
        ]
      }];
    } catch (error: any) {
      console.error('Error processing image:', error);
      throw new Error(`Failed to process image: ${error?.message || 'Unknown error'}`);
    }
  } else {
    contents = [{ 
      role: 'user', 
      parts: [{ text: fullPrompt }] 
    }];
  }

  try {
    const result = await model.generateContent({
      contents,
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error('Error generating content:', error);
    throw new Error(`Failed to generate content: ${error?.message || 'Unknown error'}`);
  }
} 