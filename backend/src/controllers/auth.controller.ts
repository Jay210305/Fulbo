import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterInput, LoginInput, SocialLoginInput } from '../schemas/auth.schema';

export class AuthController {
  
  // --- MÉTODO DE REGISTRO ---
  static async register(req: Request, res: Response) {
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

      // Llamamos al servicio (validación ya fue hecha por Zod middleware)
      const user = await AuthService.registerUser({
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
        message: 'Usuario registrado exitosamente',
        user,
      });

    } catch (error: any) {
      console.error("Error en registro:", error);
      const status = error.message === 'El email ya está registrado' ? 409 : 500;
      res.status(status).json({ error: error.message });
    }
  }

  // --- MÉTODO: LOGIN ---
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as LoginInput;

      // Llamada a la Capa de Servicio (validación ya fue hecha por Zod middleware)
      const data = await AuthService.loginUser(email, password);

      res.status(200).json({
        status: 'success',
        message: 'Login exitoso',
        token: data.token,
        user: data.user,
      });

    } catch (error: any) {
      res.status(401).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }

  // --- MÉTODO: SOCIAL LOGIN (Google/Facebook) ---
  static async socialLogin(req: Request, res: Response) {
    try {
      const { email, firstName, lastName, provider, providerId, photoUrl } = req.body as SocialLoginInput;

      // Llamada a la Capa de Servicio (validación ya fue hecha por Zod middleware)
      const data = await AuthService.socialLogin({
        email,
        firstName,
        lastName,
        provider,
        providerId,
        photoUrl
      });

      res.status(200).json({
        status: 'success',
        message: 'Social login exitoso',
        token: data.token,
        user: data.user,
      });

    } catch (error: any) {
      console.error('Error en social login:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error.message || 'Error en autenticación social'
      });
    }
  }
}