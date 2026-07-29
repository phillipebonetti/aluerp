// Core Errors Module
// ==================
// Tratamento centralizado de erros - Implementar depois

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super('UNAUTHORIZED', message, 401)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Não encontrado') {
    super('NOT_FOUND', message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflito de dados') {
    super('CONFLICT', message, 409)
  }
}

// Implementar: errorHandler(), toJSON(), logging, etc
