import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  
  // --- MÉTODO DE REGISTRO (Ya lo tenías) ---
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
      } = req.body;

      // Validaciones básicas
      if (!email || !password || !firstName || !lastName) {
         res.status(400).json({ 
           error: 'Faltan campos obligatorios. Se requiere: email, password, firstName, lastName' 
         });
         return;
      }

      // Llamamos al servicio
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

  // --- NUEVO MÉTODO: LOGIN (FUSIONADO) ---
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // 1. Validaciones básicas de entrada
      if (!email || !password) {
        res.status(400).json({ message: 'Email y contraseña son obligatorios' });
        return;
      }

      // 2. Llamada a la Capa de Servicio (Usando el método estático)
      const data = await AuthService.loginUser(email, password);

      // 3. Respuesta estandarizada
      res.status(200).json({
        status: 'success',
        message: 'Login exitoso',
        token: data.token,
        user: data.user,
      });

    } catch (error: any) {
      // Manejo de errores (Credenciales inválidas, usuario no existe, etc.)
      // Usamos 401 Unauthorized para fallos de login
      res.status(401).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }
}