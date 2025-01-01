import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content, Part, Tool as GoogleTool, SchemaType, FunctionCallingMode } from '@google/generative-ai';
import { createActionClient } from '@/lib/supabase/supabase-action-utils';
import { env } from '@/lib/env';

interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: SchemaType;
    properties: Record<string, any>;
    required: string[];
  };
}

type Tool = {
  functionDeclarations: FunctionDeclaration[];
}

interface ArtworkTools {
  tools: Tool[];
  tool_config: {
    functionCallingConfig: {
      mode: FunctionCallingMode;
    };
  };
}

// Function declarations in correct structure
export const artworkTools: ArtworkTools = {
  tools: [
    {
      functionDeclarations: [
        {
          name: "getArtistArtworks",
          description: "Get all artworks for the current artist",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              status: {
                type: SchemaType.STRING,
                description: "Filter by artwork status",
                enum: ["published", "draft", "all"]
              }
            },
            required: []
          }
        },
        {
          name: "getArtworkDetails",
          description: "Get detailed information about a specific artwork",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              artworkId: {
                type: SchemaType.STRING,
                description: "The ID of the artwork to get details for"
              }
            },
            required: ["artworkId"]
          }
        }
      ]
    }
  ],
  tool_config: {
    functionCallingConfig: {
      mode: FunctionCallingMode.AUTO
    }
  }
};

// Function implementations
const functions = {
  getArtistArtworks: async ({ status = "all" }: { status?: "published" | "draft" | "all" }, context?: string) => {
    console.log('getArtistArtworks called:', { status, context });
    const startTime = Date.now();
    
    try {
      const contextData = context ? JSON.parse(context) : {};
      if (!contextData.userId) {
        throw new Error("User ID is required");
      }

      const supabase = await createActionClient();
      let query = supabase
        .from('artworks')
        .select(`
          *,
          profiles (
            name,
            bio,
            avatar_url
          )
        `)
        .eq('artist_id', contextData.userId);
      
      if (status !== "all") {
        query = query.eq('status', status);
      }

      const { data: artworks, error } = await query;
      if (error) throw error;

      const duration = Date.now() - startTime;
      console.log('getArtistArtworks completed:', { 
        duration,
        artworksCount: artworks?.length,
        userId: contextData.userId,
        status
      });

      return { artworks };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('getArtistArtworks failed:', {
        duration,
        error,
        status,
        context
      });
      throw error;
    }
  },

  getArtworkDetails: async ({ artworkId }: { artworkId: string }) => {
    console.log('getArtworkDetails called:', { artworkId });
    const startTime = Date.now();

    try {
      const supabase = await createActionClient();
      const { data: artwork, error } = await supabase
        .from('artworks')
        .select(`
          *,
          profiles (
            name,
            bio,
            avatar_url
          )
        `)
        .eq('id', artworkId)
        .single();
      
      if (error) throw error;

      const duration = Date.now() - startTime;
      console.log('getArtworkDetails completed:', {
        duration,
        artworkId,
        found: !!artwork
      });

      return { artwork };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('getArtworkDetails failed:', {
        duration,
        error,
        artworkId
      });
      throw error;
    }
  }
};

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
  systemInstruction?: string;
  imageUrl?: string;
  imageBase64?: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  chatHistory?: Content[];
  tools?: Tool[];
}

export async function getGeminiResponse(
  prompt: string,
  options: GenerateOptions = {}
) {
  const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);
  
  // Use vision model if image is provided, otherwise use text model
  const model = genAI.getGenerativeModel({ 
    model: options.imageUrl || options.imageBase64 
      ? env.GEMINI_VISION_MODEL
      : env.GEMINI_TEXT_MODEL,
    generationConfig: {
      temperature: options.temperature ?? defaultConfig.temperature,
      topK: options.topK ?? defaultConfig.topK,
      topP: options.topP ?? defaultConfig.topP,
      maxOutputTokens: options.maxOutputTokens ?? defaultConfig.maxOutputTokens,
    },
    safetySettings,
    ...(options.systemInstruction && {
      systemInstruction: options.systemInstruction
    }),
    ...(options.tools && {
      tools: artworkTools.tools,
      toolConfig: {
        functionCallingConfig: artworkTools.tool_config.functionCallingConfig
      }
    })
  });

  // Start chat
  const chat = model.startChat({
    history: options.chatHistory || []
  });

  // Build message content
  let parts: Part[] = [{ text: prompt }];

  // Add image if provided
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

      parts.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      } as Part);
    } catch (error: any) {
      console.error('Error processing image:', error);
      throw new Error(`Failed to process image: ${error?.message || 'Unknown error'}`);
    }
  }

  try {
    // Send message and get response
    console.log('Sending message to Gemini API:', {
      modelType: options.imageUrl || options.imageBase64 ? 'vision' : 'text',
      promptLength: prompt.length,
      hasSystemInstruction: !!options.systemInstruction,
      chatHistoryLength: options.chatHistory?.length || 0,
      temperature: options.temperature ?? defaultConfig.temperature
    });

    const result = await chat.sendMessage(parts);
    let responseText = '';
    
    // Handle function calls if present
    const response = await result.response;
    
    // Log safety ratings
    const safetyRatings = response.promptFeedback?.safetyRatings;
    if (safetyRatings) {
      console.log('Safety Ratings:', safetyRatings.map(rating => ({
        category: rating.category,
        probability: rating.probability,
        blocked: response.promptFeedback?.blockReason?.includes(rating.category)
      })));
    }

    // If response was blocked, throw error with details
    if (response.promptFeedback?.blockReason) {
      const error = new Error('Response blocked by safety settings');
      error.cause = {
        blockReason: response.promptFeedback.blockReason,
        safetyRatings
      };
      throw error;
    }

    const functionCalls = response.functionCalls();
    
    if (functionCalls?.length && options.tools) {
      console.log('Function calls detected:', {
        count: functionCalls.length,
        functions: functionCalls.map(call => ({
          name: call.name,
          args: call.args
        }))
      });
      
      // Process each function call
      for (const call of functionCalls) {
        const functionName = call.name;
        const argsStr = typeof call.args === 'string' 
          ? call.args 
          : JSON.stringify(call.args);
        const functionArgs = JSON.parse(argsStr);
        
        console.log('Processing function call:', {
          function: functionName,
          arguments: functionArgs,
          timestamp: new Date().toISOString()
        });
        
        if (functionName in functions) {
          try {
            // Execute the function with type assertion
            const func = functions[functionName as keyof typeof functions];
            const startTime = performance.now();
            const functionResult = await func(functionArgs, options.context);
            const endTime = performance.now();
            
            console.log('Function execution completed:', {
              function: functionName,
              executionTimeMs: endTime - startTime,
              resultSize: JSON.stringify(functionResult).length,
              success: true,
              timestamp: new Date().toISOString()
            });
            
            // Send the result back to continue the conversation
            console.log('Sending function result to model:', {
              function: functionName,
              timestamp: new Date().toISOString()
            });
            
            const followUpResult = await chat.sendMessage([{
              functionResponse: {
                name: functionName,
                response: functionResult
              }
            }]);
            const followUpResponse = await followUpResult.response;
            responseText = followUpResponse.text();
            
            console.log('Model processed function result:', {
              function: functionName,
              responseLength: responseText.length,
              timestamp: new Date().toISOString()
            });
          } catch (err) {
            const error = err as Error;
            console.error('Function execution failed:', {
              function: functionName,
              error: {
                name: error.name,
                message: error.message,
                stack: error.stack
              },
              arguments: functionArgs,
              timestamp: new Date().toISOString()
            });
            throw new Error(`Failed to execute function ${functionName}: ${error.message}`);
          }
        } else {
          console.warn('Unknown function called:', {
            function: functionName,
            availableFunctions: Object.keys(functions),
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // If no functions were successfully executed, use the original response
      if (!responseText) {
        console.log('No function results processed, using original response');
        responseText = response.text();
      }
    } else {
      responseText = response.text();
    }
    
    console.log('Received response from Gemini API:', {
      responseLength: responseText.length,
      hasBlocked: response.promptFeedback?.blockReason,
      safetyRatings: response.promptFeedback?.safetyRatings
    });

    // Add model response to chat history if provided
    if (options.chatHistory) {
      options.chatHistory.push({
        role: 'model',
        parts: [{ text: responseText }]
      });
    }

    return responseText;
  } catch (error: any) {
    console.error('Error generating content:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      raw: error
    });
    throw new Error(`Failed to generate content: ${error?.message || 'Unknown error'}`);
  }
} 