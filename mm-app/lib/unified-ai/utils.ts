import type { Message, AnalysisResult } from './types'

export function createMessage(content: string, role: Message['role'] = 'user'): Message {
  return {
    role,
    content
  }
}

export function createAnalysisResult(
  type: string,
  content: string,
  status: AnalysisResult['status'] = 'success'
): AnalysisResult {
  return {
    type,
    content,
    timestamp: Date.now(),
    status,
    error: status === 'error' ? content : undefined
  }
}

export function formatAnalysisType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function getLastMessage(messages: Message[]): Message | undefined {
  return messages[messages.length - 1]
}

export function getLastAnalysis(analyses: AnalysisResult[]): AnalysisResult | undefined {
  return analyses[analyses.length - 1]
}

export function isAnalysisInProgress(analyses: AnalysisResult[]): boolean {
  const lastAnalysis = getLastAnalysis(analyses)
  return lastAnalysis?.status === 'pending'
}

export function hasError(analyses: AnalysisResult[]): boolean {
  const lastAnalysis = getLastAnalysis(analyses)
  return lastAnalysis?.status === 'error'
}

export function getErrorMessage(analyses: AnalysisResult[]): string | undefined {
  const lastAnalysis = getLastAnalysis(analyses)
  return lastAnalysis?.status === 'error' ? lastAnalysis.error : undefined
} 