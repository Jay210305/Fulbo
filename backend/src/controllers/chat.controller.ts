import { Request, Response } from 'express';
import Message from '../models/Message';
import ChatRoom from '../models/ChatRoom';

export class ChatController {
  
  // Obtener historial (Ya lo tenías, lo mantenemos igual)
  static async getHistory(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error obteniendo historial' });
    }
  }

  // --- NUEVO: Agregar usuario a la sala ---
  static async addUserToRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const { email } = req.body; // El email del usuario a agregar

      if (!email) {
        return res.status(400).json({ message: 'Se requiere el email' });
      }

      // Buscar la sala o crearla si no existe (Upsert)
      let room = await ChatRoom.findOne({ roomId });
      
      if (!room) {
        room = new ChatRoom({
          roomId,
          name: `Chat ${roomId}`,
          members: [email] // Iniciar con este miembro
        });
      } else {
        // Si ya existe, agregamos el email si no está
        if (!room.members.includes(email)) {
          room.members.push(email);
        }
      }

      await room.save();
      res.json({ message: `Usuario ${email} agregado al chat`, room });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al agregar usuario' });
    }
  }

  // --- NUEVO: Ver mis chats ---
  static async getMyChats(req: Request, res: Response) {
    try {
      // Asumimos que el middleware de auth inyectó el usuario en req.user
      // NOTA: Asegúrate de que req.user tenga el email.
      const userEmail = (req as any).user.email; 

      const rooms = await ChatRoom.find({ members: userEmail });
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: 'Error obteniendo mis chats' });
    }
  }
}