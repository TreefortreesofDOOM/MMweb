export const PORTFOLIO_ANALYSIS_TYPES = [
  'portfolio_composition',
  'portfolio_presentation',
  'portfolio_pricing',
  'portfolio_market'
] as const

export type PortfolioAnalysisType = typeof PORTFOLIO_ANALYSIS_TYPES[number]

export interface PortfolioAnalysisResult {
  type: PortfolioAnalysisType
  summary: string
  recommendations: string[]
  status: 'success' | 'error'
  error?: string
}

export interface PortfolioAnalysisResponse {
  type: PortfolioAnalysisType
  result: PortfolioAnalysisResult
  status: 'success' | 'error'
  error?: string
} 