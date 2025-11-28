import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { BookingService } from '../services/booking.service';

export class BookingController {
  static async createBooking(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id; // Viene del JWT
      const { fieldId, startTime, endTime, totalPrice, paymentMethod, matchName } = req.body;

      if (!fieldId || !startTime || !endTime || !totalPrice) {
         res.status(400).json({ message: 'Faltan datos de la reserva' });
         return;
      }

      const booking = await BookingService.createBooking({
        userId,
        fieldId,
        startTime,
        endTime,
        totalPrice,
        paymentMethod,
        matchName
      });

      res.status(201).json(booking);
    } catch (error: any) {
      // Si es error de solapamiento
      if (error.message === 'HORARIO_OCUPADO') {
        res.status(409).json({ message: 'El horario seleccionado ya no está disponible' });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error al procesar la reserva' });
      }
    }
  }
}