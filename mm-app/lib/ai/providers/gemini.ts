import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content, Tool as GoogleTool, SchemaType, Part, FunctionCallingMode } from '@google/generative-ai'
import { AIServiceProvider, Message, Response, AIFunction, ImageData, Analysis, Vector, SearchResult } from './base'
import { env } from '@/lib/env'

interface GeminiFunctionCall {
  name: string;
  args: Record<string, any>;
}

export interface GeminiConfig {
  apiKey: string
  safetySettings?: Array<{
    category: HarmCategory
    threshold: HarmBlockThreshold
  }>
  temperature?: number
  maxOutputTokens?: number
  topK?: number
  topP?: number
  model?: 'gemini-1.5-flash-latest' | 'gemini-1.5-pro-latest' | 'gemini-1.0-pro' | 'gemini-1.0-pro-001'
}

const defaultConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

// Convert our AIFunction to Gemini's FunctionDeclaration format
function convertToGeminiFunctions(functions: AIFunction[]): {
  tools: GoogleTool[];
  toolConfig: {
    functionCallingConfig: {
      mode: FunctionCallingMode;
    };
  };
} {
  console.log('Converting functions to Gemini format:', {
    functionCount: functions.length,
    functions: functions.map(fn => ({
      name: fn.name,
      parameterCount: Object.keys(fn.parameters.properties).length
    }))
  });

  const tools = [{
    functionDeclarations: functions.map(fn => ({
      name: fn.name,
      description: fn.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: fn.parameters.properties,
        required: fn.parameters.required || []
      }
    }))
  }];

  const config = {
    tools,
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingMode.AUTO
      }
    }
  };

  console.log('Converted functions:', {
    toolCount: tools.length,
    tools: tools[0].functionDeclarations.map(fn => ({
      name: fn.name,
      parameters: fn.parameters
    })),
    mode: FunctionCallingMode.AUTO
  });

  return config;
}

export class GeminiProvider implements AIServiceProvider {
  private model: string;
  private genAI: GoogleGenerativeAI;
  private functions: AIFunction[] = [];
  private temperature?: number;
  private maxTokens?: number;
  private apiKey: string;

  constructor(config: GeminiConfig) {
    console.log('Initializing GeminiProvider with config:', {
      model: config.model || 'gemini-1.5-flash-latest',
      temperature: config.temperature,
      maxTokens: config.maxOutputTokens,
      hasApiKey: !!config.apiKey
    });

    this.model = config.model || 'gemini-1.5-flash-latest';
    this.apiKey = config.apiKey;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.temperature = config.temperature;
    this.maxTokens = config.maxOutputTokens;
  }

  async sendMessage(message: Message): Promise<Response> {
    console.log('GeminiProvider sendMessage called with:', {
      messageLength: message.content.length,
      hasSystemInstruction: !!message.systemInstruction,
      chatHistoryLength: message.chatHistory?.length || 0,
      registeredFunctions: this.functions.length,
      temperature: this.temperature,
      maxTokens: this.maxTokens
    });

    const toolConfig = this.functions.length > 0 ? convertToGeminiFunctions(this.functions) : undefined;
    console.log('Generated tools configuration:', {
      hasFunctions: !!toolConfig,
      toolCount: toolConfig?.tools.length || 0,
      mode: toolConfig?.toolConfig.functionCallingConfig.mode
    });

    const model = this.genAI.getGenerativeModel({
      model: this.model,
      generationConfig: {
        temperature: this.temperature,
        topK: undefined,
        topP: undefined,
        maxOutputTokens: this.maxTokens,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      ...(toolConfig && {
        tools: toolConfig.tools,
        toolConfig: toolConfig.toolConfig
      })
    });

    console.log('Starting chat with history:', {
      historyLength: message.chatHistory?.length || 0,
      history: message.chatHistory?.map(msg => ({
        role: msg.role,
        contentLength: msg.content.length
      }))
    });

    const chat = model.startChat({
      history: message.chatHistory?.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })) || [],
    });

    // Combine system instruction with message content if present
    const messageContent = message.systemInstruction 
      ? `${message.systemInstruction}\n\n${message.content}`
      : message.content;

    console.log('Sending message to model:', {
      contentLength: messageContent.length,
      hasSystemInstruction: !!message.systemInstruction
    });

    try {
      const result = await chat.sendMessage(messageContent);
      const response = await result.response;
      const text = response.text();

      console.log('Received response from model:', {
        responseLength: text.length,
        hasBlocked: !!response.promptFeedback?.blockReason,
        safetyRatings: response.promptFeedback?.safetyRatings,
        candidates: response.candidates?.length || 0
      });

      // Handle function calls if present
      const functionCalls = response.functionCalls();
      if (functionCalls?.length) {
        const functionCall = functionCalls[0];
        
        console.log('Function call detected in response:', {
          functionName: functionCall.name,
          hasArgs: !!functionCall.args,
          argsType: typeof functionCall.args,
          args: functionCall.args,
          responseText: text
        });

        // Find the registered function
        const registeredFunction = this.functions.find(f => f.name === functionCall.name);
        if (!registeredFunction?.execute) {
          console.error('Function not found or not executable:', functionCall.name);
          return {
            content: text || `Error: Function ${functionCall.name} not found`,
            metadata: {
              provider: 'gemini',
              model: this.model,
              error: 'Function not found'
            }
          };
        }

        try {
          // Execute the function
          const functionResult = await registeredFunction.execute(
            typeof functionCall.args === 'string' ? JSON.parse(functionCall.args) : functionCall.args,
            typeof message.context === 'string' ? message.context : JSON.stringify(message.context)
          );

          console.log('Function execution result:', {
            functionName: functionCall.name,
            hasResult: !!functionResult,
            resultType: typeof functionResult
          });

          // Send the result back to the model
          const followUpResult = await chat.sendMessage(
            JSON.stringify({
              function_response: {
                name: functionCall.name,
                content: functionResult
              }
            })
          );
          const followUpResponse = await followUpResult.response;
          const followUpText = followUpResponse.text();

          return {
            content: followUpText,
            metadata: {
              provider: 'gemini',
              model: this.model,
              functionCall: {
                name: functionCall.name,
                result: functionResult
              },
              safetyRatings: followUpResponse.promptFeedback?.safetyRatings,
              blockReason: followUpResponse.promptFeedback?.blockReason
            }
          };
        } catch (error) {
          console.error('Error executing function:', {
            functionName: functionCall.name,
            error
          });
          return {
            content: text || `Error executing function ${functionCall.name}`,
            metadata: {
              provider: 'gemini',
              model: this.model,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          };
        }
      }

      return {
        content: text,
        metadata: {
          provider: 'gemini',
          model: this.model,
          safetyRatings: response.promptFeedback?.safetyRatings,
          blockReason: response.promptFeedback?.blockReason
        }
      };
    } catch (error) {
      console.error('Error in GeminiProvider sendMessage:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async *streamMessage(message: Message): AsyncIterator<Response> {
    // For now, we'll implement this as a single response
    const response = await this.sendMessage(message)
    yield response
  }

  registerFunctions(functions: AIFunction[]): void {
    console.log('Registering functions with GeminiProvider:', {
      functionCount: functions.length,
      functions: functions.map(fn => ({
        name: fn.name,
        parameterCount: Object.keys(fn.parameters.properties).length
      }))
    });
    this.functions = functions;
  }

  async executeFunctionCall(name: string, args: any): Promise<any> {
    throw new Error('Function execution is handled internally by Gemini implementation')
  }

  async analyzeImage(image: ImageData): Promise<Analysis> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: env.GEMINI_VISION_MODEL,
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      })

      const prompt = 'Analyze this image and provide a detailed description, tags, and detected objects.'
      let parts: Part[] = [{ text: prompt }]

      // Add image part
      if (image.url) {
        const response = await fetch(image.url)
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`)
        }
        const contentType = response.headers.get('content-type')
        if (!contentType?.startsWith('image/')) {
          throw new Error('Invalid image format')
        }
        const arrayBuffer = await response.arrayBuffer()
        const base64Data = Buffer.from(arrayBuffer).toString('base64')
        parts.push({
          inlineData: {
            mimeType: contentType,
            data: base64Data
          }
        } as Part)
      } else if (image.base64) {
        const [, data] = image.base64.split(',')
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: data || image.base64
          }
        } as Part)
      }

      const result = await model.generateContent(parts)
      const response = await result.response
      const text = response.text()

      // Parse the response into our standard Analysis format
      return {
        description: text,
        tags: [],
        objects: []
      }
    } catch (error) {
      console.error('Gemini analyzeImage error:', error)
      throw error
    }
  }

  async generateImageDescription(image: ImageData): Promise<string> {
    const analysis = await this.analyzeImage(image)
    return analysis.description
  }

  async generateEmbeddings(text: string): Promise<Vector> {
    // Temporarily return placeholder embeddings
    return {
      values: new Array(768).fill(0),  // Standard embedding size
      dimensions: 768
    }
  }

  async similaritySearch(query: string): Promise<SearchResult[]> {
    throw new Error('Similarity search is handled by Supabase')
  }

  setSafetySettings(settings: Array<{
    category: HarmCategory
    threshold: HarmBlockThreshold
  }>): void {
    // Safety settings are not supported in this implementation
  }

  setTemperature(temperature: number): void {
    this.temperature = temperature
  }

  setMaxTokens(maxTokens: number): void {
    this.maxTokens = maxTokens
  }

  private async storeMessageForEmbeddings(message: {
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: string
    metadata?: Record<string, any>
    context?: Record<string, any>
  }): Promise<void> {
    // Temporarily disabled
    return
  }
} 