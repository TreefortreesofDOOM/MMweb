export interface BaseErrorLog {
  code: string;
  message: string;
  timestamp: string;
  context: string;
  userId?: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export type ErrorLog = BaseErrorLog; 