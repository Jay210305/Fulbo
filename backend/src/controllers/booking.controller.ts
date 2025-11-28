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

  static async cancelBooking(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const { bookingId } = req.params;

      if (!bookingId) {
        res.status(400).json({ message: 'ID de reserva requerido' });
        return;
      }

      const booking = await BookingService.cancelBooking(bookingId, userId);

      res.status(200).json({ 
        message: 'Reserva cancelada exitosamente',
        booking 
      });
    } catch (error: any) {
      if (error.message === 'BOOKING_NOT_FOUND') {
        res.status(404).json({ message: 'Reserva no encontrada' });
      } else if (error.message === 'BOOKING_ALREADY_CANCELLED') {
        res.status(400).json({ message: 'La reserva ya fue cancelada' });
      } else if (error.message === 'UNAUTHORIZED_CANCELLATION') {
        res.status(403).json({ message: 'No tienes permiso para cancelar esta reserva' });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error al cancelar la reserva' });
      }
    }
  }

  static async getBooking(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.params;

      if (!bookingId) {
        res.status(400).json({ message: 'ID de reserva requerido' });
        return;
      }

      const booking = await BookingService.getBookingById(bookingId);

      if (!booking) {
        res.status(404).json({ message: 'Reserva no encontrada' });
        return;
      }

      res.status(200).json(booking);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener la reserva' });
    }
  }
}