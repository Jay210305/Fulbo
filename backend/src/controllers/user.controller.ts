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
}