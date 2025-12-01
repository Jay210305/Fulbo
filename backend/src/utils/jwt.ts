import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';

// Token payload interface
export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  type?: 'access' | 'refresh';
}

// Verify result interface
export interface VerifyResult extends TokenPayload {
  iat: number;
  exp: number;
}

/**
 * Generate an access token (short-lived)
 */
export const generateToken = (userId: string, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }

  const signInOptions: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any, // Short-lived for security
  };

  return jwt.sign(
    { id: userId, email, role, type: 'access' }, 
    secret, 
    signInOptions
  );
};

/**
 * Generate a refresh token (long-lived)
 */
export const generateRefreshToken = (userId: string, email: string, role: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET no está definido en las variables de entorno');
  }

  const signInOptions: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any, // Longer-lived
  };

  return jwt.sign(
    { id: userId, email, role, type: 'refresh' }, 
    secret, 
    signInOptions
  );
};

/**
 * Verify an access token
 */
export const verifyToken = (token: string): VerifyResult => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }

  return jwt.verify(token, secret) as VerifyResult;
};

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token: string): VerifyResult => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET no está definido en las variables de entorno');
  }

  const decoded = jwt.verify(token, secret) as VerifyResult;
  
  // Ensure it's a refresh token
  if (decoded.type !== 'refresh') {
    throw new Error('Token inválido: no es un refresh token');
  }

  return decoded;
};

/**
 * Generate a password reset token (random, not JWT)
 */
export const generatePasswordResetToken = (): { token: string; hashedToken: string; expires: Date } => {
  // Generate a random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Hash it for storage (we store the hash, not the actual token)
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  // Expires in 1 hour
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  return { token, hashedToken, expires };
};

/**
 * Hash a password reset token for comparison
 */
export const hashPasswordResetToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};