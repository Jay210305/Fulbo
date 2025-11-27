import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware'; // Importa la interfaz que creaste
import prisma from '../config/prisma';

export class UserController {
  
  // GET /api/users/profile
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      // req.user viene del middleware de autenticación (el token decodificado)
      const userId = req.user.id; 

      const user = await prisma.users.findUnique({
        where: { user_id: userId },
        select: {
          user_id: true,
          email: true,
          first_name: true,
          last_name: true,
          phone_number: true,
          role: true,
          // No devolvemos password_hash por seguridad
        }
      });

      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener perfil' });
    }
  }

  // PUT /api/users/profile
  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, phoneNumber } = req.body;

      const updatedUser = await prisma.users.update({
        where: { user_id: userId },
        data: {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber
        },
        select: {
          user_id: true,
          email: true,
          first_name: true,
          last_name: true,
          phone_number: true
        }
      });

      res.json({ message: 'Perfil actualizado', user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar perfil' });
    }
  }

  // POST /api/users/verify-phone
  static async verifyPhone(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const { phone, code } = req.body;

      // TODO: Integrar con Twilio/AWS SNS en producción
      // Por ahora, aceptamos el código "123456" para pruebas
      if (code !== '123456') { 
         res.status(400).json({ message: 'Código de verificación incorrecto' });
         return;
      }

      // Actualizamos el teléfono del usuario
      await prisma.users.update({
        where: { user_id: userId },
        data: { 
          phone_number: phone
          // Si tuvieras una columna 'phone_verified' en la BD, la pondrías en true aquí
        }
      });

      res.json({ message: 'Teléfono verificado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al verificar teléfono' });
    }
  }

  // POST /api/users/promote-to-manager
  static async promoteToManager(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const { businessName, ruc } = req.body; // Datos extra del registro de dueño

      await prisma.users.update({
        where: { user_id: userId },
        data: { 
          role: 'manager',
          // Aquí podrías guardar businessName y ruc si tuvieras esas columnas,
          // o guardarlos en una tabla separada 'managers'. Por ahora, solo cambiamos el rol.
        }
      });

      res.json({ message: '¡Felicidades! Ahora eres un Manager.' });
    } catch (error) {
      res.status(500).json({ message: 'Error al promover usuario' });
    }
  }
}