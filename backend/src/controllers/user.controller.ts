import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';

export class UserController {
  
  // GET /api/users/profile
  static async getProfile(req: AuthRequest, res: Response) {
    try {
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
      const { firstName, lastName } = req.body;

      const updatedUser = await prisma.users.update({
        where: { user_id: userId },
        data: {
          first_name: firstName,
          last_name: lastName,
          // El teléfono se actualiza por verifyPhone
        },
        select: {
          user_id: true,
          email: true,
          first_name: true,
          last_name: true,
          phone_number: true,
          role: true
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

      // Simulación de validación de código (en producción usar Twilio/SNS)
      if (code !== '123456') { 
         res.status(400).json({ message: 'Código de verificación incorrecto' });
         return;
      }

      await prisma.users.update({
        where: { user_id: userId },
        data: { phone_number: phone }
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
      
      // Aquí podrías recibir datos del negocio (RUC, Dirección) y guardarlos
      // Por ahora, solo actualizamos el rol
      const updatedUser = await prisma.users.update({
        where: { user_id: userId },
        data: { role: 'manager' },
        select: { role: true }
      });

      res.json({ 
        message: 'Usuario promovido a Manager exitosamente', 
        role: updatedUser.role 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al promover usuario' });
    }
  }
}