import OpenAI from 'openai'
import type { AssistantCreateParams, AssistantTool } from 'openai/resources/beta/assistants'
import type { MessageContent } from 'openai/resources/beta/threads/messages'
import type { ChatCompletionMessageParam, ChatCompletionContentPart } from 'openai/resources/chat/completions'
import { AIServiceProvider, Message, Response, AIFunction, ImageData, Analysis, Vector, SearchResult } from './base'
import { env } from '@/lib/env'
import { createReadStream, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { writeFile } from 'fs/promises'
import ms from 'ms'

// Type guard for text content
function isTextContent(content: MessageContent): content is Extract<MessageContent, { type: 'text' }> {
  return content.type === 'text'
}

interface ThreadInfo {
  id: string
  createdAt: Date
  lastUsed: Date
  tempFiles: string[]
}

export interface ChatGPTConfig {
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
  assistantId?: string
  threadExpiry?: string
}

export class ChatGPTProvider implements AIServiceProvider {
  private client: OpenAI
  private model: string
  private functions: AIFunction[] = []
  private temperature: number = 0.7
  private maxTokens: number = 2048
  private assistantId?: string
  private threadMap: Map<string, ThreadInfo> = new Map() // Map context to thread info
  private threadExpiry: number // in milliseconds

  constructor(config: ChatGPTConfig) {
    console.log('Initializing ChatGPTProvider with config:', {
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      hasApiKey: !!config.apiKey,
      hasAssistantId: !!config.assistantId,
      threadExpiry: config.threadExpiry
    });

    this.client = new OpenAI({
      apiKey: config.apiKey
    })
    this.model = config.model || env.OPENAI_MODEL
    this.temperature = config.temperature || 0.7
    this.maxTokens = config.maxTokens || 2048
    this.assistantId = config.assistantId || env.OPENAI_ASSISTANT_ID
    this.threadExpiry = ms(config.threadExpiry || env.OPENAI_THREAD_EXPIRY)

    // Start thread cleanup interval
    setInterval(() => this.cleanupExpiredThreads(), 60000) // Check every minute
  }

  private async getOrCreateAssistant() {
    console.log('Getting or creating assistant', {
      hasAssistantId: !!this.assistantId,
      model: this.model,
      functionCount: this.functions.length
    });

    if (this.assistantId) {
      try {
        return await this.client.beta.assistants.retrieve(this.assistantId)
      } catch (error) {
        console.error('Error retrieving assistant:', error);
        throw error;
      }
    }

    // Create a new assistant
    try {
      const assistant = await this.client.beta.assistants.create({
        name: 'MM Web Assistant',
        description: 'A versatile assistant for MM Web platform',
        model: this.model,
        tools: [
          { type: 'code_interpreter' },
          { type: 'file_search' },
          ...this.functions.map(fn => ({
            type: 'function',
            function: {
              name: fn.name,
              description: fn.description,
              parameters: fn.parameters
            }
          } as AssistantTool))
        ]
      })

      this.assistantId = assistant.id
      return assistant
    } catch (error) {
      console.error('Error creating assistant:', error);
      throw error;
    }
  }

  private async cleanupExpiredThreads() {
    const now = new Date()
    // Convert Map entries to array before iterating
    Array.from(this.threadMap.entries()).forEach(async ([context, info]) => {
      if (now.getTime() - info.lastUsed.getTime() > this.threadExpiry) {
        try {
          // Delete thread
          await this.client.beta.threads.del(info.id)
          
          // Clean up temp files
          for (const filePath of info.tempFiles) {
            try {
              unlinkSync(filePath)
            } catch (error) {
              console.error('Error cleaning up temp file:', error)
            }
          }

          // Remove from map
          this.threadMap.delete(context)
        } catch (error) {
          console.error('Error cleaning up thread:', error)
        }
      }
    })
  }

  private async getOrCreateThread(context?: string): Promise<{ id: string; isNew: boolean }> {
    const now = new Date()
    
    if (context && this.threadMap.has(context)) {
      const info = this.threadMap.get(context)!
      info.lastUsed = now
      return { id: info.id, isNew: false }
    }

    const thread = await this.client.beta.threads.create()
    
    if (context) {
      this.threadMap.set(context, {
        id: thread.id,
        createdAt: now,
        lastUsed: now,
        tempFiles: []
      })
    }

    return { id: thread.id, isNew: true }
  }

  private async uploadFile(url: string, context?: string): Promise<{ fileId: string; tempPath: string }> {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const filename = url.split('/').pop() || 'image.jpg'
    
    // Write buffer to temp file
    const tempPath = join(tmpdir(), `${Date.now()}-${filename}`)
    await writeFile(tempPath, buffer)

    // Create a readable stream from the temp file
    const stream = createReadStream(tempPath)

    const uploadedFile = await this.client.files.create({
      file: stream,
      purpose: 'assistants'
    })

    // Add temp file to thread info for cleanup
    if (context && this.threadMap.has(context)) {
      this.threadMap.get(context)!.tempFiles.push(tempPath)
    }

    return { fileId: uploadedFile.id, tempPath }
  }

  async sendMessage(message: Message): Promise<Response> {
    console.log('ChatGPTProvider sendMessage called with:', {
      messageLength: message.content.length,
      hasSystemInstruction: !!message.systemInstruction,
      chatHistoryLength: message.chatHistory?.length || 0,
      registeredFunctions: this.functions.length,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      hasAssistantId: !!this.assistantId
    });

    try {
      const assistant = await this.getOrCreateAssistant()
      const { id: threadId, isNew } = await this.getOrCreateThread(message.context?.toString())

      // Add system instruction if present and thread is new
      if (isNew && message.systemInstruction) {
        await this.client.beta.threads.messages.create(threadId, {
          role: 'user',
          content: message.systemInstruction
        })
      }

      // Add message content
      const messageContent = message.metadata?.imageUrl
        ? [
            { type: 'text' as const, text: message.content },
            { 
              type: 'image_file' as const, 
              image_file: { 
                file_id: (await this.uploadFile(message.metadata.imageUrl, message.context?.toString())).fileId 
              } 
            }
          ]
        : message.content

      await this.client.beta.threads.messages.create(threadId, {
        role: 'user',
        content: messageContent
      })

      // Run the assistant
      const run = await this.client.beta.threads.runs.create(threadId, {
        assistant_id: assistant.id,
        instructions: message.systemInstruction
      })

      // Wait for completion
      let completedRun = await this.waitForRun(threadId, run.id)

      // Handle function calls
      if (completedRun.required_action?.type === 'submit_tool_outputs') {
        const toolCall = completedRun.required_action.submit_tool_outputs.tool_calls[0]
        if (toolCall.type === 'function') {
          const functionCall = {
            name: toolCall.function.name,
            arguments: JSON.parse(toolCall.function.arguments)
          }

          // Execute the function
          const fn = this.functions.find(f => f.name === functionCall.name)
          if (fn?.execute) {
            const result = await fn.execute(functionCall.arguments)

            // Submit the result
            completedRun = await this.client.beta.threads.runs.submitToolOutputs(
              threadId,
              run.id,
              {
                tool_outputs: [{
                  tool_call_id: toolCall.id,
                  output: JSON.stringify(result)
                }]
              }
            )

            // Wait for final completion
            completedRun = await this.waitForRun(threadId, completedRun.id)
          }
        }
      }

      // Get the latest message
      const messages = await this.client.beta.threads.messages.list(threadId)
      const lastMessage = messages.data[0]
      const textContent = lastMessage.content.find(isTextContent)

      if (!textContent) {
        throw new Error('No text content found in response')
      }

      return {
        content: textContent.text.value,
        metadata: {
          provider: 'chatgpt',
          model: this.model,
          threadId,
          runId: completedRun.id
        }
      }
    } catch (error) {
      console.error('ChatGPT sendMessage error:', error)
      throw error
    }
  }

  private async waitForRun(threadId: string, runId: string) {
    let run = await this.client.beta.threads.runs.retrieve(threadId, runId)
    
    while (run.status === 'queued' || run.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000))
      run = await this.client.beta.threads.runs.retrieve(threadId, runId)
    }

    if (run.status === 'failed') {
      throw new Error(`Assistant run failed: ${run.last_error?.message}`)
    }

    return run
  }

  async *streamMessage(message: Message): AsyncIterator<Response> {
    try {
      // For streaming, we'll use the chat completions API instead of assistants
      const messages: ChatCompletionMessageParam[] = []

      // Add system instruction if present
      if (message.systemInstruction) {
        messages.push({
          role: 'system',
          content: message.systemInstruction
        })
      }

      // Add chat history if present
      if (message.chatHistory?.length) {
        messages.push(...message.chatHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })))
      }

      // Add current message
      if (message.metadata?.imageUrl) {
        // For image messages, we need to use base64
        const response = await fetch(message.metadata.imageUrl)
        const arrayBuffer = await response.arrayBuffer()
        const base64Data = Buffer.from(arrayBuffer).toString('base64')
        const mimeType = response.headers.get('content-type') || 'image/jpeg'

        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: message.content } as ChatCompletionContentPart,
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`
              }
            } as ChatCompletionContentPart
          ]
        })
      } else {
        messages.push({
          role: 'user',
          content: message.content
        })
      }

      // Create streaming completion
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        stream: true,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        ...(this.functions.length > 0 && {
          functions: this.functions.map(fn => ({
            name: fn.name,
            description: fn.description,
            parameters: fn.parameters
          }))
        })
      })

      let accumulatedContent = ''
      let functionCall: { name: string; arguments: string } | undefined

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        const functionCallDelta = chunk.choices[0]?.delta?.function_call

        if (functionCallDelta) {
          // Handle function call streaming
          if (!functionCall) {
            functionCall = {
              name: functionCallDelta.name || '',
              arguments: ''
            }
          }
          if (functionCallDelta.arguments) {
            functionCall.arguments += functionCallDelta.arguments
          }
        } else if (content) {
          // Handle regular content streaming
          accumulatedContent += content
          yield {
            content: content,
            metadata: {
              provider: 'chatgpt',
              model: this.model,
              isPartial: true
            }
          }
        }
      }

      // If there was a function call, execute it and stream the result
      if (functionCall && functionCall.name) {
        try {
          const args = JSON.parse(functionCall.arguments)
          const result = await this.executeFunctionCall(functionCall.name, args)
          
          // Create a new completion with the function result
          const functionResponse = await this.client.chat.completions.create({
            model: this.model,
            messages: [
              ...messages,
              {
                role: 'assistant',
                content: null,
                function_call: {
                  name: functionCall.name,
                  arguments: functionCall.arguments
                }
              },
              {
                role: 'function',
                name: functionCall.name,
                content: JSON.stringify(result)
              }
            ],
            stream: true,
            temperature: this.temperature,
            max_tokens: this.maxTokens
          })

          for await (const chunk of functionResponse) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              accumulatedContent += content
              yield {
                content: content,
                metadata: {
                  provider: 'chatgpt',
                  model: this.model,
                  isPartial: true,
                  functionCall: {
                    name: functionCall.name,
                    result
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error executing function in stream:', error instanceof Error ? error : new Error('Unknown error'))
          yield {
            content: `Error executing function ${functionCall.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            metadata: {
              provider: 'chatgpt',
              model: this.model,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        }
      }

      // Yield the final complete message
      yield {
        content: accumulatedContent,
        metadata: {
          provider: 'chatgpt',
          model: this.model,
          isPartial: false
        }
      }
    } catch (error) {
      console.error('ChatGPT streamMessage error:', error instanceof Error ? error : new Error('Unknown error'))
      throw error instanceof Error ? error : new Error('Unknown error')
    }
  }

  async analyzeImage(image: ImageData): Promise<Analysis> {
    try {
      const assistant = await this.getOrCreateAssistant()
      const thread = await this.getOrCreateThread()

      // Upload the image
      const { fileId } = await this.uploadFile(
        image.url || `data:${image.mimeType};base64,${image.base64}`
      )

      // Create message with the image
      await this.client.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: [
          { 
            type: 'text' as const, 
            text: `Analyze this image and provide a detailed description, tags, and detected objects in the following JSON format:
{
  "description": "A detailed description of the image",
  "tags": ["tag1", "tag2", ...],
  "objects": [
    {
      "label": "object name",
      "confidence": 0.95,
      "boundingBox": {
        "x": 0.1,
        "y": 0.2,
        "width": 0.3,
        "height": 0.4
      }
    },
    ...
  ]
}` 
          },
          { type: 'image_file' as const, image_file: { file_id: fileId } }
        ]
      })

      // Run the assistant
      const run = await this.client.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id
      })

      // Wait for completion
      await this.waitForRun(thread.id, run.id)

      // Get the response
      const messages = await this.client.beta.threads.messages.list(thread.id)
      const lastMessage = messages.data[0]
      const textContent = lastMessage.content.find(isTextContent)

      if (!textContent) {
        throw new Error('No text content found in response')
      }

      try {
        // Try to parse the response as JSON
        const analysisResult = JSON.parse(textContent.text.value)
        return {
          description: analysisResult.description || textContent.text.value,
          tags: Array.isArray(analysisResult.tags) ? analysisResult.tags : [],
          objects: Array.isArray(analysisResult.objects) ? analysisResult.objects.map((obj: {
            label: string;
            confidence: number;
            boundingBox?: {
              x: number;
              y: number;
              width: number;
              height: number;
            };
          }) => ({
            label: obj.label,
            confidence: obj.confidence,
            boundingBox: obj.boundingBox ? {
              x: obj.boundingBox.x,
              y: obj.boundingBox.y,
              width: obj.boundingBox.width,
              height: obj.boundingBox.height
            } : undefined
          })) : []
        }
      } catch (parseError) {
        // If parsing fails, return the raw text as description
        console.warn('Failed to parse analysis result as JSON:', parseError)
        return {
          description: textContent.text.value,
          tags: [],
          objects: []
        }
      }
    } catch (error) {
      console.error('ChatGPT analyzeImage error:', error)
      throw error
    }
  }

  async generateImageDescription(image: ImageData): Promise<string> {
    const analysis = await this.analyzeImage(image)
    return analysis.description
  }

  async generateEmbeddings(text: string): Promise<Vector> {
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text
      })

      return {
        values: response.data[0].embedding,
        dimensions: response.data[0].embedding.length
      }
    } catch (error) {
      console.error('ChatGPT generateEmbeddings error:', error)
      throw error
    }
  }

  async similaritySearch(query: string): Promise<SearchResult[]> {
    throw new Error('Similarity search is handled by Supabase')
  }

  async executeFunctionCall(name: string, args: any): Promise<any> {
    const fn = this.functions.find(f => f.name === name)
    if (!fn?.execute) {
      throw new Error(`Function ${name} not found or not executable`)
    }
    return fn.execute(args)
  }

  registerFunctions(functions: AIFunction[]): void {
    this.functions = functions
    console.log('Registered functions with ChatGPT provider:', {
      functionCount: functions.length,
      functions: functions.map(fn => fn.name)
    })
  }

  setSafetySettings(settings: Record<string, any>): void {
    // OpenAI handles safety internally
    console.log('Safety settings are handled internally by OpenAI')
  }

  setTemperature(temperature: number): void {
    this.temperature = temperature
  }

  setMaxTokens(maxTokens: number): void {
    this.maxTokens = maxTokens
  }
} 