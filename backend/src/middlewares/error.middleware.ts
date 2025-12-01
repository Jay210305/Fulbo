import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Interface for standardized error response
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: Record<string, any>;
    stack?: string;
  };
}

/**
 * Handle Zod validation errors
 */
const handleZodError = (err: ZodError): AppError => {
  const errors = err.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
  
  return AppError.validation('Error de validación', { errors });
};

/**
 * Handle Prisma errors
 */
const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (err.meta?.target as string[])?.join(', ') || 'campo';
      return AppError.conflict(`El ${field} ya existe`, 'DUPLICATE_ENTRY');
    
    case 'P2025':
      // Record not found
      return AppError.notFound('Registro no encontrado');
    
    case 'P2003':
      // Foreign key constraint failed
      return AppError.badRequest('Referencia inválida a otro registro');
    
    case 'P2014':
      // Required relation violation
      return AppError.badRequest('La operación viola una relación requerida');
    
    default:
      logger.error(`Prisma error: ${err.code}`, { meta: err.meta });
      return AppError.internal('Error de base de datos');
  }
};

/**
 * Handle JWT errors
 */
const handleJWTError = (): AppError => {
  return AppError.unauthorized('Token inválido', 'TOKEN_INVALID');
};

const handleJWTExpiredError = (): AppError => {
  return AppError.unauthorized('Token expirado, inicie sesión nuevamente', 'TOKEN_EXPIRED');
};

/**
 * Send error response in development
 */
const sendErrorDev = (err: AppError, res: Response): void => {
  const response: ErrorResponse = {
    success: false,
    error: {
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
      stack: err.stack,
    },
  };

  res.status(err.statusCode).json(response);
};

/**
 * Send error response in production
 */
const sendErrorProd = (err: AppError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
        details: err.details,
      },
    };

    res.status(err.statusCode).json(response);
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);

    res.status(500).json({
      success: false,
      error: {
        message: 'Algo salió mal',
        code: 'INTERNAL_ERROR',
        statusCode: 500,
      },
    });
  }
};

/**
 * Global error handling middleware
 * Must be the last middleware registered
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error: AppError;

  // Log the error
  logger.error(`${err.message}`, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });

  // Convert known error types to AppError
  if (err instanceof AppError) {
    error = err;
  } else if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  } else {
    // Unknown error
    error = new AppError(
      err.message || 'Error interno del servidor',
      500,
      'INTERNAL_ERROR'
    );
    error.stack = err.stack;
  }

  // Send response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Handle 404 Not Found for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = AppError.notFound(`Ruta no encontrada: ${req.originalUrl}`);
  next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * This eliminates the need for try-catch in every controller
 */
export const asyncHandler = <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
