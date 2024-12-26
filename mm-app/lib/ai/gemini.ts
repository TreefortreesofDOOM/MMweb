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
      let imageData: string;
      if (options.imageUrl) {
        // Ensure URL is properly resolved and wait for the fetch
        const imageResponse = await fetch(options.imageUrl, {
          cache: 'no-store' // Disable caching to ensure fresh content
        });
        
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }
        
        const imageBlob = await imageResponse.blob();
        if (!imageBlob.type.startsWith('image/')) {
          throw new Error('Invalid image format');
        }
        
        imageData = await blobToBase64(imageBlob);
      } else if (options.imageBase64) {
        imageData = options.imageBase64;
      } else {
        throw new Error('Either imageUrl or imageBase64 must be provided');
      }

      // Extract base64 data (remove data:image/xyz;base64, prefix if present)
      const base64Data = imageData.split(',')[1] || imageData;
      const mimeType = imageData.match(/^data:([^;]+);base64,/)?.[1] || 'image/jpeg';

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

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
} 