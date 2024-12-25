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
  
  // Use vision model if imageUrl is provided, otherwise use text model
  const model = genAI.getGenerativeModel({ 
    model: options.imageUrl ? 'gemini-pro-vision' : 'gemini-pro'
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
  if (options.imageUrl) {
    // Convert image URL to base64
    const imageResponse = await fetch(options.imageUrl);
    const imageBlob = await imageResponse.blob();
    const imageBase64 = await blobToBase64(imageBlob);

    contents = [{
      role: 'user',
      parts: [
        { text: fullPrompt },
        {
          inlineData: {
            mimeType: imageBlob.type,
            data: imageBase64.split(',')[1]
          }
        }
      ]
    }];
  } else {
    contents = [{ 
      role: 'user', 
      parts: [{ text: fullPrompt }] 
    }];
  }

  const result = await model.generateContent({
    contents,
    generationConfig,
    safetySettings,
  });

  const response = result.response;
  return response.text();
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
} 