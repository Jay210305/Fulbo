import { Request, Response } from 'express';
import Message from '../models/Message';

export class ChatController {
  static async getHistory(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      
      // Obtener mensajes de la sala, ordenados por fecha
      const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error obteniendo historial' });
    }
  }
}