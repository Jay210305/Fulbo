import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { BookingService } from '../services/booking.service';
import { CreateBookingInput, RescheduleBookingInput } from '../schemas/booking.schema';

export class BookingController {
  static async createBooking(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role || 'player';
      const { 
        fieldId, 
        startTime, 
        endTime, 
        totalPrice, 
        paymentMethod, 
        matchName,
        guestName,
        guestPhone 
      } = req.body as CreateBookingInput;

      const booking = await BookingService.createBooking({
        userId,
        fieldId,
        startTime,
        endTime,
        totalPrice, // Passed but will be ignored - backend calculates
        paymentMethod,
        matchName,
        userRole,
        guestName,
        guestPhone
      });

      res.status(201).json(booking);
    } catch (error: any) {
      if (error.message === 'HORARIO_OCUPADO') {
        res.status(409).json({ message: 'El horario seleccionado ya no está disponible' });
      } else if (error.message === 'HORARIO_BLOQUEADO') {
        res.status(409).json({ message: 'El horario seleccionado está bloqueado' });
      } else if (error.message === 'FIELD_NOT_FOUND') {
        res.status(404).json({ message: 'Cancha no encontrada' });
      } else if (error.message === 'UNAUTHORIZED_FIELD_ACCESS') {
        res.status(403).json({ message: 'No tienes permiso para crear reservas en esta cancha' });
      } else if (error.message === 'PLAYER_ID_REQUIRED') {
        res.status(400).json({ message: 'Se requiere ID de jugador para esta reserva' });
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

  static async getUserBookings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;

      const bookings = await BookingService.getBookingsByUser(userId);

      res.status(200).json(bookings);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener las reservas del usuario' });
    }
  }

  static async getFieldBookings(req: AuthRequest, res: Response) {
    try {
      const { fieldId } = req.params;
      const { from, to } = req.query;

      const fromDate = from ? new Date(from as string) : undefined;
      const toDate = to ? new Date(to as string) : undefined;

      const bookings = await BookingService.getFieldBookings(fieldId, fromDate, toDate);

      res.status(200).json(bookings);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener las reservas de la cancha' });
    }
  }

  static async rescheduleBooking(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const { bookingId } = req.params;
      const { newStartTime, newEndTime } = req.body as RescheduleBookingInput;

      const booking = await BookingService.rescheduleBooking(
        bookingId,
        newStartTime,
        newEndTime,
        userId
      );

      res.status(200).json({
        message: 'Reserva reprogramada exitosamente',
        booking,
      });
    } catch (error: any) {
      if (error.message === 'BOOKING_NOT_FOUND') {
        res.status(404).json({ message: 'Reserva no encontrada' });
      } else if (error.message === 'BOOKING_ALREADY_CANCELLED') {
        res.status(400).json({ message: 'No se puede reprogramar una reserva cancelada' });
      } else if (error.message === 'UNAUTHORIZED') {
        res.status(403).json({ message: 'No tienes permiso para reprogramar esta reserva' });
      } else if (error.message === 'HORARIO_BLOQUEADO') {
        res.status(409).json({ message: 'El horario seleccionado está bloqueado por mantenimiento o evento' });
      } else if (error.message === 'HORARIO_OCUPADO') {
        res.status(409).json({ message: 'El horario seleccionado ya no está disponible' });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error al reprogramar la reserva' });
      }
    }
  }
}