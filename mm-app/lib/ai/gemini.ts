import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content, Tool as GoogleTool, SchemaType, Part, FunctionCallingMode } from '@google/generative-ai';
import { AIServiceProvider, Message, Response, AIFunction, ImageData, Analysis, Vector, SearchResult } from '@/lib/ai/providers/base';
import { env } from '@/lib/env';
import { getArtistArtworks, getArtworkDetails } from '@/lib/actions/artwork-actions';
import { findRelevantChatHistory } from './chat-history';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { createClient } from '@/lib/supabase/supabase-server';

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

interface ArtworkTool {
  functionDeclarations: Array<{
    name: string;
    description: string;
    parameters: {
      type: SchemaType;
      properties: Record<string, any>;
      required?: string[];
    };
  }>;
  implementation: Record<string, (args: any, context?: string) => Promise<any>>;
}

interface SearchChatHistoryArgs {
  query: string;
  match_count?: number;
  match_threshold?: number;
}

interface GetArtistArtworksArgs {
  status?: 'published' | 'draft' | 'all';
}

interface GetArtworkDetailsArgs {
  artworkId: string;
}

export const artworkTools = {
  tools: [{
    functionDeclarations: [
      {
        name: "searchChatHistory",
        description: "Search through past conversations using semantic similarity. Only use this for finding previous chat discussions, NOT for getting artworks.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: {
              type: SchemaType.STRING,
              description: "The search query to find relevant past conversations"
            },
            match_count: {
              type: SchemaType.NUMBER,
              description: "Maximum number of conversations to return (default: 3)"
            },
            match_threshold: {
              type: SchemaType.NUMBER,
              description: "Minimum similarity threshold (0-1, default: 0.8)"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "getArtistArtworks",
        description: "Get all artworks created by the current artist. ALWAYS use this function when asked about artworks, portfolio, or artwork collection. This is the primary way to access artwork information.",
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
        description: "Get detailed information about a specific artwork. Use this after getArtistArtworks when you need more details about a particular artwork.",
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
    ],
    implementation: {
      searchChatHistory: async ({ query, match_count = 3, match_threshold = 0.8 }: SearchChatHistoryArgs, context?: string) => {
        console.log('searchChatHistory called:', { query, match_count, match_threshold, context });
        try {
          const contextData = context ? JSON.parse(context) : {};
          const userId = contextData.userId;
          
          if (!userId) {
            throw new Error('User ID not found in context');
          }

          const { similarConversations } = await findRelevantChatHistory(userId, query);
          return similarConversations;
        } catch (error) {
          console.error('searchChatHistory failed:', { error, query, context });
          throw error;
        }
      },
      getArtistArtworks: async ({ status = 'all' }: GetArtistArtworksArgs, context?: string) => {
        console.log('getArtistArtworks called:', { status, context });
        try {
          const { artworks } = await getArtistArtworks({ status }, context);
          return artworks;
        } catch (error) {
          console.error('getArtistArtworks failed:', { error, status, context });
          throw error;
        }
      },
      getArtworkDetails: async ({ artworkId }: GetArtworkDetailsArgs) => {
        console.log('getArtworkDetails called:', { artworkId });
        const startTime = Date.now();
        try {
          const { artwork } = await getArtworkDetails({ artworkId });
          
          const duration = Date.now() - startTime;
          console.log('getArtworkDetails completed:', {
            duration,
            artworkId,
            found: !!artwork
          });

          return { artwork };
        } catch (error) {
          console.error('getArtworkDetails failed:', { error, artworkId });
          throw error;
        }
      }
    }
  }],
  tool_config: {
    functionCallingConfig: {
      mode: FunctionCallingMode.AUTO
    }
  }
} as const;

// When using with Gemini model
const toolsForModel = {
  tools: artworkTools.tools.map(tool => ({
    functionDeclarations: tool.functionDeclarations
  })) as GoogleTool[],
  toolConfig: artworkTools.tool_config
};

// Function implementations
const functions = {
  searchChatHistory: async (
    { query, match_count = 3, match_threshold = 0.8 }: { 
      query: string; 
      match_count?: number; 
      match_threshold?: number 
    }, 
    context?: string
  ): Promise<{ conversations: Array<{
    message: string;
    response: string;
    artwork_id?: string;
    metadata?: Record<string, any>;
    context?: string;
    similarity: number;
  }> }> => {
    console.log('searchChatHistory called:', { query, match_count, match_threshold, context });
    const startTime = Date.now();
    
    try {
      const contextData = context ? JSON.parse(context) : {};
      const userId = contextData.userId;
      
      if (!userId) {
        throw new Error('User ID not found in context');
      }

      const [queryEmbedding] = await generateEmbedding(query, { provider: 'gemini' });

      const supabase = await createClient();
      const { data: conversations } = await supabase.rpc(
        'find_similar_conversations',
        {
          p_user_id: userId,
          p_query: query,
          p_embedding: queryEmbedding,
          p_match_count: match_count,
          p_match_threshold: match_threshold
        }
      );

      const duration = Date.now() - startTime;
      console.log('searchChatHistory completed:', {
        duration,
        conversationsFound: conversations?.length
      });

      return { conversations: conversations || [] };
    } catch (error) {
      console.error('searchChatHistory failed:', error);
      throw error;
    }
  },

  getArtistArtworks: async ({ status = "all" }: { status?: "published" | "draft" | "all" }, context?: string) => {
    console.log('getArtistArtworks called:', { status, context });
    const startTime = Date.now();
    
    try {
      const { artworks } = await getArtistArtworks({ status }, context);
      
      const duration = Date.now() - startTime;
      console.log('getArtistArtworks completed:', { 
        duration,
        artworksCount: artworks?.length,
        status
      });

      return { artworks };
    } catch (error) {
      console.error('getArtistArtworks failed:', { error, status, context });
      throw error;
    }
  },

  getArtworkDetails: async ({ artworkId }: { artworkId: string }) => {
    console.log('getArtworkDetails called:', { artworkId });
    const startTime = Date.now();

    try {
      const { artwork } = await getArtworkDetails({ artworkId });
      
      const duration = Date.now() - startTime;
      console.log('getArtworkDetails completed:', {
        duration,
        artworkId,
        found: !!artwork
      });

      return { artwork };
    } catch (error) {
      console.error('getArtworkDetails failed:', { error, artworkId });
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
  console.log('Starting getGeminiResponse:', {
    promptFirstChars: prompt.slice(0, 100) + '...',
    hasSystemInstruction: !!options.systemInstruction,
    hasContext: !!options.context,
    hasTools: !!options.tools,
    chatHistoryLength: options.chatHistory?.length || 0
  });

  const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);
  
  // Use vision model if image is provided, otherwise use text model
  const modelName = options.imageUrl || options.imageBase64 
    ? env.GEMINI_VISION_MODEL
    : env.GEMINI_TEXT_MODEL;

  console.log('Initializing Gemini model:', {
    model: modelName,
    temperature: options.temperature ?? defaultConfig.temperature,
    maxTokens: options.maxOutputTokens ?? defaultConfig.maxOutputTokens,
    hasTools: !!options.tools
  });

  const model = genAI.getGenerativeModel({ 
    model: modelName,
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
      tools: toolsForModel.tools,
      toolConfig: toolsForModel.toolConfig
    })
  });

  console.log('Tool configuration:', {
    tools: options.tools ? artworkTools.tools.map(t => 
      t.functionDeclarations.map(f => ({
        name: f.name,
        description: f.description.slice(0, 50) + '...',
        requiredParams: f.parameters.required
      }))
    ) : 'No tools configured',
    mode: options.tools ? artworkTools.tool_config.functionCallingConfig.mode : 'None'
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
    console.log('Sending message to model:', {
      modelType: modelName,
      promptLength: prompt.length,
      partsCount: parts.length,
      systemInstruction: options.systemInstruction ? options.systemInstruction.slice(0, 100) + '...' : 'None'
    });

    const result = await chat.sendMessage(parts);
    const response = await result.response;
    let responseText = response.text();
    
    console.log('Raw model response:', {
      hasText: !!responseText,
      textLength: responseText.length,
      candidates: response.candidates?.length,
      parts: response.candidates?.[0]?.content?.parts?.length
    });

    // Handle function calls if present
    const functionCalls = response.functionCalls();
    
    if (functionCalls?.length && options.tools) {
      console.log('Function calls detected:', {
        count: functionCalls.length,
        functions: functionCalls.map(call => ({
          name: call.name,
          args: call.args,
          argsType: typeof call.args
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
          parsedArgs: functionArgs,
          availableFunctions: Object.keys(functions),
          timestamp: new Date().toISOString()
        });
        
        if (functionName in functions) {
          try {
            // Execute the function with type assertion
            const func = functions[functionName as keyof typeof functions];
            const startTime = performance.now();
            const functionResult = await func(functionArgs, options.context);
            const endTime = performance.now();
            
            console.log('Function execution result:', {
              function: functionName,
              executionTimeMs: endTime - startTime,
              resultSize: JSON.stringify(functionResult).length,
              resultPreview: JSON.stringify(functionResult).slice(0, 100) + '...',
              success: true
            });
            
            // Send the result back to continue the conversation
            console.log('Sending function result to model');
            
            const followUpResult = await chat.sendMessage([{
              functionResponse: {
                name: functionName,
                response: functionResult
              }
            }]);
            const followUpResponse = await followUpResult.response;
            responseText = followUpResponse.text();
            
            console.log('Model processed function result:', {
              responseLength: responseText.length,
              responsePreview: responseText.slice(0, 100) + '...'
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