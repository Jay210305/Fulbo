import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterInput, LoginInput, SocialLoginInput } from '../schemas/auth.schema';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';

export class AuthController {
  
  // --- MÉTODO DE REGISTRO ---
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        phoneNumber,
        documentType, 
        documentNumber,
        city, 
        district 
      } = req.body as RegisterInput;

      const result = await AuthService.registerUser({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        documentType,
        documentNumber,
        city,
        district
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        // Include both 'token' (legacy) and 'accessToken' (new) for backward compatibility
        token: result.accessToken,
        user: result.user,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
      });

    } catch (error) {
      next(error);
    }
  }

  // --- MÉTODO: LOGIN ---
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as LoginInput;

      const result = await AuthService.loginUser(email, password);

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        // Include both 'token' (legacy) and 'accessToken' (new) for backward compatibility
        token: result.accessToken,
        user: result.user,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
      });

    } catch (error) {
      next(error);
    }
  }

  // --- MÉTODO: SOCIAL LOGIN (Google/Facebook) ---
  static async socialLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, firstName, lastName, provider, providerId, photoUrl } = req.body as SocialLoginInput;

      const result = await AuthService.socialLogin({
        email,
        firstName,
        lastName,
        provider,
        providerId,
        photoUrl
      });

      res.status(200).json({
        success: true,
        message: 'Social login exitoso',
        // Include both 'token' (legacy) and 'accessToken' (new) for backward compatibility
        token: result.accessToken,
        user: result.user,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
      });

    } catch (error) {
      next(error);
    }
  }

  // --- MÉTODO: REFRESH TOKEN ---
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw AppError.badRequest('Refresh token es requerido', 'MISSING_REFRESH_TOKEN');
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
      });

    } catch (error) {
      next(error);
    }
  }

  // --- MÉTODO: FORGOT PASSWORD ---
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        throw AppError.badRequest('Email es requerido', 'MISSING_EMAIL');
      }

      const result = await AuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message,
      });

    } catch (error) {
      next(error);
    }
  }

  // --- MÉTODO: RESET PASSWORD ---
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        throw AppError.badRequest('Token y contraseña son requeridos', 'MISSING_FIELDS');
      }

      const result = await AuthService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        message: 'Contraseña restablecida exitosamente',
      });

    } catch (error) {
      next(error);
    }
  }

  // --- MÉTODO: CHANGE PASSWORD (authenticated) ---
  static async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        throw AppError.unauthorized('No autenticado', 'NOT_AUTHENTICATED');
      }

      if (!currentPassword || !newPassword) {
        throw AppError.badRequest('Contraseña actual y nueva son requeridas', 'MISSING_FIELDS');
      }

      const result = await AuthService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: result.message,
      });

    } catch (error) {
      next(error);
    }
  }
}