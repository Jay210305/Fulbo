import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  
  static async register(req: Request, res: Response) {
    try {
      // 1. DEBUG: Ver qué está llegando realmente (útil si falla)
      // console.log("Body recibido:", req.body);

      // 2. Extraemos TODOS los datos que vienen del frontend
      // Nota: Usamos camelCase aquí porque es el estándar en JSON/JS
      const { 
        email, 
        password, 
        firstName,    // Reemplaza a fullName
        lastName,     // Nuevo campo
        phoneNumber,
        documentType,   // Nuevo
        documentNumber, // Nuevo
        city,           // Nuevo
        district        // Nuevo
      } = req.body;

      // 3. Validaciones básicas
      // Aseguramos que vengan los campos OBLIGATORIOS en la DB (NOT NULL)
      if (!email || !password || !firstName || !lastName) {
         res.status(400).json({ 
           error: 'Faltan campos obligatorios. Se requiere: email, password, firstName, lastName' 
         });
         return;
      }

      // 4. Llamamos al servicio
      // Aquí convertimos de camelCase (variables del front) a la estructura que espera el servicio
      const user = await AuthService.registerUser({
        email,
        password,        // Pasamos la contraseña plana, el servicio la hasheará
        firstName,       // Mapeo: firstName -> first_name
        lastName,        // Mapeo: lastName -> last_name
        phoneNumber,
        
        // Campos opcionales (pueden ser undefined si el front no los manda aun)
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
      console.error("Error en registro:", error); // Logueamos el error en el servidor para debug
      
      // Manejo de errores simple
      const status = error.message === 'El email ya está registrado' ? 409 : 500;
      res.status(status).json({ error: error.message });
    }
  }
}