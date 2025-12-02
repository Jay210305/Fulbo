import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  generatePasswordResetToken,
  hashPasswordResetToken 
} from '../utils/jwt';
import { EmailService } from './email.service';
import { AppError } from '../utils/AppError';

// Definimos una interfaz para los datos de entrada (lo que viene del controller)
interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  documentType?: string;
  documentNumber?: string;
  city?: string;
  district?: string;
  phoneNumber?: string;
}

// Interface para Social Login (Google/Facebook)
interface SocialLoginDto {
  email: string;
  firstName: string;
  lastName: string;
  provider: 'google' | 'facebook';
  providerId: string;
  photoUrl?: string;
}

// Token response interface
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export class AuthService {
  
  /**
   * Generate both access and refresh tokens
   */
  private static generateTokens(userId: string, email: string, role: string): TokenResponse {
    const accessToken = generateToken(userId, email, role);
    const refreshToken = generateRefreshToken(userId, email, role);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  // --- MÉTODO EXISTENTE: REGISTRO ---
  static async registerUser(data: RegisterUserDto) {
    // 1. Verificar si el email ya existe
    const existingUser = await prisma.users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw AppError.conflict('El email ya está registrado', 'EMAIL_ALREADY_EXISTS');
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // 3. Crear el usuario mapeando camelCase -> snake_case
    const newUser = await prisma.users.create({
      data: {
        email: data.email,
        password_hash: hashedPassword,
        first_name: data.firstName,
        last_name: data.lastName,
        document_type: data.documentType,
        document_number: data.documentNumber,
        city: data.city,
        district: data.district,
        phone_number: data.phoneNumber,
        role: 'player',
        auth_provider: 'email'
      },
    });

    // 4. Generar tokens (ACCESS + REFRESH)
    const tokens = this.generateTokens(newUser.user_id, newUser.email, newUser.role);

    // 5. Retornar usuario y tokens
    const { password_hash, ...userWithoutPassword } = newUser;
    
    return { 
      user: userWithoutPassword, 
      ...tokens // accessToken, refreshToken, expiresIn
    };
  }

  // --- MÉTODO: LOGIN ---
  static async loginUser(email: string, passwordPlain: string) {
    // 1. Buscar usuario por email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw AppError.unauthorized('Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    // 2. Verificar si tiene contraseña (caso Social Login)
    if (!user.password_hash) {
      throw AppError.badRequest('Este usuario se registró con redes sociales, usa ese método.', 'SOCIAL_LOGIN_REQUIRED');
    }

    // 3. Comparar contraseña con el Hash
    const isMatch = await bcrypt.compare(passwordPlain, user.password_hash);

    if (!isMatch) {
      throw AppError.unauthorized('Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    // 4. Generar tokens (ACCESS + REFRESH)
    const tokens = this.generateTokens(user.user_id, user.email, user.role);

    // 5. Retornar usuario (sin pass) y tokens
    const { password_hash, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, ...tokens };
  }

  // --- MÉTODO: SOCIAL LOGIN (Google/Facebook) ---
  static async socialLogin(data: SocialLoginDto) {
    // 1. Buscar si el usuario ya existe por email O por auth_provider_id
    let user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: data.email },
          { 
            auth_provider: data.provider,
            auth_provider_id: data.providerId 
          }
        ]
      }
    });

    if (user) {
      // Usuario existe - verificar si necesita actualizar auth_provider
      if (user.auth_provider === 'email' && !user.auth_provider_id) {
        // Usuario se registró con email, ahora vincula cuenta social
        user = await prisma.users.update({
          where: { user_id: user.user_id },
          data: {
            auth_provider: data.provider,
            auth_provider_id: data.providerId
          }
        });
      }
    } else {
      // Usuario no existe - crear nuevo usuario
      user = await prisma.users.create({
        data: {
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          auth_provider: data.provider,
          auth_provider_id: data.providerId,
          role: 'player',
        }
      });
    }

    // 2. Generar tokens
    const tokens = this.generateTokens(user.user_id, user.email, user.role);

    // 3. Retornar usuario (sin pass) y tokens
    const { password_hash, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, ...tokens };
  }

  // --- MÉTODO: REFRESH TOKEN ---
  static async refreshToken(refreshToken: string) {
    try {
      // 1. Verify the refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // 2. Check if user still exists and is valid
      const user = await prisma.users.findUnique({
        where: { user_id: decoded.id },
      });

      if (!user) {
        throw AppError.unauthorized('Usuario no encontrado', 'USER_NOT_FOUND');
      }

      // 3. Generate new tokens (token rotation for security)
      const tokens = this.generateTokens(user.user_id, user.email, user.role);

      // 4. Return new tokens
      const { password_hash, ...userWithoutPassword } = user;
      
      return { user: userWithoutPassword, ...tokens };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Refresh token expirado, inicie sesión nuevamente', 'REFRESH_TOKEN_EXPIRED');
      }
      throw AppError.unauthorized('Refresh token inválido', 'INVALID_REFRESH_TOKEN');
    }
  }

  // --- MÉTODO: FORGOT PASSWORD ---
  static async forgotPassword(email: string) {
    // 1. Find user by email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    // Always return success even if user doesn't exist (security)
    if (!user) {
      return { message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' };
    }

    // Check if user uses social login
    if (user.auth_provider !== 'email') {
      return { message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' };
    }

    // 2. Generate password reset token
    const { token, hashedToken, expires } = generatePasswordResetToken();

    // 3. Store the hashed token in the database (we need to add fields to schema)
    // For now, we'll use a simple in-memory approach or existing fields
    // TODO: Add password_reset_token and password_reset_expires fields to users table
    
    // 4. Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    
    try {
      await EmailService.sendPasswordResetEmail(user.email, user.first_name, resetUrl);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      // Don't throw - we don't want to reveal if email exists
    }

    return { message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' };
  }

  // --- MÉTODO: RESET PASSWORD ---
  static async resetPassword(token: string, newPassword: string) {
    // Hash the token to compare with stored hash
    const hashedToken = hashPasswordResetToken(token);

    // TODO: Find user by hashed token and check expiry
    // For now, this is a placeholder - needs password_reset fields in DB
    
    // Validate new password
    if (newPassword.length < 8) {
      throw AppError.badRequest('La contraseña debe tener al menos 8 caracteres', 'PASSWORD_TOO_SHORT');
    }

    // This would be the full implementation once DB fields are added:
    // 1. Find user with matching reset token that hasn't expired
    // 2. Hash new password
    // 3. Update user password and clear reset token
    // 4. Return success

    throw AppError.badRequest('Funcionalidad de reset de contraseña requiere migración de base de datos', 'NOT_IMPLEMENTED');
  }

  // --- MÉTODO: CHANGE PASSWORD (authenticated user) ---
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // 1. Find user
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw AppError.notFound('Usuario no encontrado', 'USER_NOT_FOUND');
    }

    if (!user.password_hash) {
      throw AppError.badRequest('No puedes cambiar la contraseña de una cuenta social', 'SOCIAL_ACCOUNT');
    }

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw AppError.unauthorized('Contraseña actual incorrecta', 'INVALID_PASSWORD');
    }

    // 3. Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update password
    await prisma.users.update({
      where: { user_id: userId },
      data: { password_hash: hashedPassword },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }
}