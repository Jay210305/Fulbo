import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

/**
 * General API rate limiter
 * Limits requests to 100 per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Demasiadas solicitudes, intente nuevamente en 15 minutos',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiadas solicitudes, intente nuevamente en 15 minutos',
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429,
      },
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits to 5 attempts per 15 minutes to prevent brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login/register attempts per windowMs
  message: {
    success: false,
    error: {
      message: 'Demasiados intentos de autenticación, intente en 15 minutos',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`, {
      email: req.body?.email,
      path: req.path,
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiados intentos de autenticación, intente en 15 minutos',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        statusCode: 429,
      },
    });
  },
});

/**
 * Password reset rate limiter
 * Very strict to prevent email spam/enumeration attacks
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 password reset requests per hour
  message: {
    success: false,
    error: {
      message: 'Demasiadas solicitudes de recuperación, intente en 1 hora',
      code: 'PASSWORD_RESET_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiadas solicitudes de recuperación, intente en 1 hora',
        code: 'PASSWORD_RESET_LIMIT_EXCEEDED',
        statusCode: 429,
      },
    });
  },
});

/**
 * Upload rate limiter
 * Limits file uploads to prevent abuse
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    success: false,
    error: {
      message: 'Límite de subidas alcanzado, intente en 1 hora',
      code: 'UPLOAD_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Booking creation limiter
 * Prevents booking spam
 */
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 bookings per hour per user
  message: {
    success: false,
    error: {
      message: 'Límite de reservas alcanzado, intente más tarde',
      code: 'BOOKING_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
