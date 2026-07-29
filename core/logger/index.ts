// Core Logger Module
// ==================
// Logging estruturado - Implementar depois

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  userId?: string
  companyId?: string
  module?: string
  action?: string
  [key: string]: any
}

export class Logger {
  constructor(private context: LogContext = {}) {}

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error | any) {
    this.log('error', message, error)
  }

  private log(level: LogLevel, message: string, data?: any) {
    // Implementar: console, arquivo, serviço remoto, etc
    console.log(`[${level.toUpperCase()}]`, message, data)
  }
}

export function createLogger(context: LogContext): Logger {
  return new Logger(context)
}
