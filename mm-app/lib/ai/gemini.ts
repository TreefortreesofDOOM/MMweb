import { 
  GoogleGenerativeAI, 
  HarmCategory, 
  HarmBlockThreshold,
  GenerateContentResult,
  GenerationConfig,
  Part
} from "@google/generative-ai";

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

// Default generation config
const defaultConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

// Art expert context
const artExpertContext = `You are an expert AI art consultant with deep knowledge in:
- Art history and movements
- Contemporary art trends
- Art valuation and market analysis
- Art techniques and mediums
- Art curation and exhibition design
- Art conservation and preservation
- Digital art and NFTs

Your role is to:
- Provide detailed, informed analysis of artworks
- Offer constructive feedback to artists
- Share market insights and pricing strategies
- Suggest improvements and techniques
- Help with portfolio curation
- Guide artists in their professional development

Please maintain a professional, supportive tone while being specific and practical in your advice.
Always consider the current art market context and contemporary trends in your responses.`;

if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error('GOOGLE_AI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

interface GenerateOptions {
  context?: string;
  config?: Partial<GenerationConfig>;
}

export async function getGeminiResponse(
  prompt: string, 
  options: GenerateOptions = {}
) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      safetySettings,
    });

    // Combine context and prompt if context is provided
    const fullPrompt = options.context 
      ? `${options.context}\n\nUser: ${prompt}`
      : prompt;

    const generationConfig = {
      ...defaultConfig,
      ...options.config,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }]}],
      generationConfig,
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

export async function getArtExpertResponse(prompt: string, config?: Partial<GenerationConfig>) {
  return getGeminiResponse(prompt, {
    context: artExpertContext,
    config,
  });
}

interface ImageAnalysisOptions {
  context?: string;
  config?: Partial<GenerationConfig>;
}

export async function getGeminiImageResponse(
  prompt: string, 
  imageUrl: string,
  options: ImageAnalysisOptions = {}
) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro-vision",
      safetySettings,
    });

    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    
    const imagePart: Part = {
      inlineData: {
        data: await blobToBase64(imageBlob),
        mimeType: imageBlob.type
      }
    };

    const fullPrompt = options.context 
      ? `${options.context}\n\nUser: ${prompt}`
      : prompt;

    const generationConfig = {
      ...defaultConfig,
      ...options.config,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }, imagePart]}],
      generationConfig,
    });

    return result.response.text();
  } catch (error) {
    console.error('Error generating AI image response:', error);
    throw error;
  }
}

export async function startGeminiChat(
  context?: string,
  config?: Partial<GenerationConfig>
) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      safetySettings,
    });

    const generationConfig = {
      ...defaultConfig,
      ...config,
    };

    const chat = model.startChat({
      history: context ? [
        {
          role: "user",
          parts: [{ text: context }],
        },
        {
          role: "model",
          parts: [{ text: "I understand and will proceed with the given context." }],
        }
      ] : [],
      generationConfig,
    });

    return chat;
  } catch (error) {
    console.error('Error starting chat:', error);
    throw error;
  }
}

// Helper function to convert Blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
} 