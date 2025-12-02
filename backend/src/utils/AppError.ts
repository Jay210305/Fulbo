/**
 * Custom Application Error class for consistent error handling
 * Extends the built-in Error class with additional properties
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, any>
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Distinguishes operational errors from programming errors
    this.details = details;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods for common errors
  static badRequest(message: string, code: string = 'BAD_REQUEST', details?: Record<string, any>) {
    return new AppError(message, 400, code, details);
  }

  static unauthorized(message: string = 'No autorizado', code: string = 'UNAUTHORIZED') {
    return new AppError(message, 401, code);
  }

  static forbidden(message: string = 'Acceso denegado', code: string = 'FORBIDDEN') {
    return new AppError(message, 403, code);
  }

  static notFound(message: string = 'Recurso no encontrado', code: string = 'NOT_FOUND') {
    return new AppError(message, 404, code);
  }

  static conflict(message: string, code: string = 'CONFLICT', details?: Record<string, any>) {
    return new AppError(message, 409, code, details);
  }

  static tooManyRequests(message: string = 'Demasiadas solicitudes, intente más tarde') {
    return new AppError(message, 429, 'TOO_MANY_REQUESTS');
  }

  static internal(message: string = 'Error interno del servidor') {
    return new AppError(message, 500, 'INTERNAL_ERROR');
  }

  static validation(message: string, details?: Record<string, any>) {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  }
}

// Error codes enum for frontend consumption
export const ErrorCodes = {
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  NO_TOKEN: 'NO_TOKEN',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  
  // Booking errors
  BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',
  BOOKING_CONFLICT: 'BOOKING_CONFLICT',
  SLOT_UNAVAILABLE: 'SLOT_UNAVAILABLE',
  SLOT_BLOCKED: 'SLOT_BLOCKED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  
  // Field errors
  FIELD_NOT_FOUND: 'FIELD_NOT_FOUND',
  UNAUTHORIZED_FIELD_ACCESS: 'UNAUTHORIZED_FIELD_ACCESS',
  
  // General errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  BAD_REQUEST: 'BAD_REQUEST',
  FORBIDDEN: 'FORBIDDEN',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
